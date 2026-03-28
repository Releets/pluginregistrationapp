import { LanguageCode, languages } from '../client/src/locales'

export type AudioMode = 'tobias' | 'normal'

export const defaultSettings = {
  username: undefined as string | undefined,
  audioMode: 'tobias' as AudioMode,
  godmodePw: '',
  hideLog: false as boolean,
  language: languages.en.metadata.code as LanguageCode,
}

export type UserSettings = typeof defaultSettings
