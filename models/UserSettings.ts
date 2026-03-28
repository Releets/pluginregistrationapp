export type AudioMode = 'tobias' | 'normal'

/** Supported UI locales (English is the source language for copy). */
export type AppLocale = 'en' | 'no' | 'nl'

export type UserSettings = {
  hideLog: boolean
  audioMode: AudioMode
  godmodePassword: string
  language: AppLocale
}

export const defaultSettings: UserSettings = {
  hideLog: false,
  audioMode: 'tobias',
  godmodePassword: '',
  language: 'en',
}
