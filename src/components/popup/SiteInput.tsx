import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { addSite } from '@/lib/storage'
import { normalizeDomain, validateDomain } from '@/lib/url-utils'

interface SiteInputProps {
  existingDomains: string[]
  onSiteAdded: () => void
}

export function SiteInput({ existingDomains, onSiteAdded }: SiteInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const domain = normalizeDomain(value)
    const validationError = validateDomain(domain)
    if (validationError) {
      setError(validationError)
      return
    }
    if (existingDomains.includes(domain)) {
      setError('Already blocked bestie')
      return
    }

    try {
      await addSite(domain)
      setValue('')
      onSiteAdded()
      toast.success(`${domain} blocked`)
    } catch {
      toast.error('Failed to block site. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 px-4 py-3">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="instagram.com..."
          aria-label="Domain to block"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 rounded-xl border-border/60 bg-secondary/80 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:ring-primary/20"
        />
        <Button
          type="submit"
          className="rounded-xl bg-primary font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:brightness-110 hover:shadow-md hover:shadow-primary/25"
        >
          Block
        </Button>
      </div>
      {error && (
        <p className="animate-shake text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
