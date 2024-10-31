export type AudioMode = 'tobias' | 'normal'

export type UserSettings = {
  hideLog: boolean
  audioMode: AudioMode
  godmodePassword: string
}

export const defaultSettings: UserSettings = {
  hideLog: false,
  audioMode: 'tobias',
  godmodePassword: '',
}
