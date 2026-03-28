import { LanguageCode, languages } from '../client/src/locales'

export type AudioMode = 'tobias' | 'normal'

export const defaultSettings = {
  hideLog: false as boolean,
  audioMode: 'tobias' as AudioMode,
  godmodePassword: '',
  language: languages.en.metadata.code as LanguageCode,
}

export type UserSettings = typeof defaultSettings
