import { timestamp } from './logger'

export async function playAudio(sound: HTMLAudioElement): Promise<void> {
  try {
    await sound.play()
  } catch (err) {
    if (err instanceof Error) {
      console.warn(timestamp(), err)
    }
    console.log(timestamp(), 'Cancelled initial audio')
  }
}
