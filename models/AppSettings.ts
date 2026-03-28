import { LanguageCode, languages } from '../client/src/locales'

export type StoredIdentity = {
  name: string
  userId: string
  privateKey: string
}

export type AudioMode = 'tobias' | 'normal'

export const defaultSettings = {
  audioMode: 'tobias' as AudioMode,
  godmodePw: '',
  hideLog: false as boolean,
  hideUptime: true as boolean,
  language: languages.en.metadata.code as LanguageCode,
}

export type AppSettings = typeof defaultSettings
