import { useContext } from 'react'
import { IdentityContext, type IdentityContextValue } from './IdentityContext'

export default function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) {
    throw new Error('useIdentity must be used within IdentityProvider')
  }
  return ctx
}
