export type AudioMode = 'tobias' | 'normal'

export type UserSettings = {
  hideLog: boolean
  hideUptime: boolean
  audioMode: AudioMode
  godmodePassword: string
}

export const defaultSettings: UserSettings = {
  hideLog: false,
  hideUptime: true,
  audioMode: 'tobias',
  godmodePassword: '',
}
