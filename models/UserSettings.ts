export type AudioMode = 'tobias' | 'normal'

export type UserSettings = {
  hideLog: boolean
  showUptime: boolean
  audioMode: AudioMode
  godmodePassword: string
}

export const defaultSettings: UserSettings = {
  hideLog: false,
  showUptime: false,
  audioMode: 'tobias',
  godmodePassword: '',
}
