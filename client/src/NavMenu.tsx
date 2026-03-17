import { useEffect, useRef } from 'react'
import './styles/NavMenu.css'
import type { UserSettings } from '../../models/UserSettings'
import { loadUserSettingsFromStorage } from './utils/settings'

export type NavMenuProps = {
  isReversed: boolean
  animationKeyCounter: number
  handleClick: () => void
  handleOption: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  userAppSettings: UserSettings
}

export default function NavMenu({
  isReversed,
  animationKeyCounter,
  handleClick,
  handleOption,
  userAppSettings,
}: NavMenuProps) {
  const godmodePasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = loadUserSettingsFromStorage()
    if (stored?.godmodePassword != null && godmodePasswordRef.current) {
      godmodePasswordRef.current.value = stored.godmodePassword
    }
  }, [])

  return (
    <div className='navmenuwrapper'>
      <div className={`burger ${isReversed ? 'reverse' : 'animate'}`} onClick={handleClick}>
        <div key={animationKeyCounter + 1} className='line line1'></div>
        <div key={animationKeyCounter + 2} className='line line2'></div>
        <div key={animationKeyCounter + 3} className='line line3'></div>
      </div>
      <div className={`menu ${isReversed ? 'invisible' : 'visible'}`}>
        <ul className='options'>
          <li>
            <div className='checkbox-wrapper'>
              <input
                type='checkbox'
                className='check'
                checked={userAppSettings.hideLog}
                onChange={e => handleOption('hideLog', e.target.checked)}
              />
              <label>Hide Log</label>
            </div>
          </li>
          <li>
            <div className='checkbox-wrapper'>
              <input
                type='checkbox'
                className='check'
                checked={userAppSettings.audioMode === 'tobias'}
                onChange={e => handleOption('audioMode', e.target.checked ? 'tobias' : 'normal')}
              />
              <label>Tobias Mode</label>
            </div>
          </li>
          <li>
            <div className='passwordContainer'>
              <input
                className='passwordField'
                ref={godmodePasswordRef}
                type='password'
                placeholder='Godmode password'
                onChange={e => handleOption('godmodePassword', e.target.value)}
              />
            </div>
          </li>
        </ul>
        <p>Want to report a bug or suggest a feature?</p>
        <a href='https://github.com/Releets/pluginregistrationapp/issues/new' target='_blank' rel='noreferrer'>
          Create an issue here
        </a>
      </div>
    </div>
  )
}
