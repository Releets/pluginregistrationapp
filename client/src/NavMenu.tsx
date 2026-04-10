import { useEffect, useRef, useState } from 'react'
import './styles/NavMenu.css'
import type { UserSettings } from '../../models/UserSettings'
import { loadUserSettingsFromStorage } from './utils/settings'
import type { StoredIdentity } from './utils/identity'
import { setStoredIdentity } from './utils/identity'

export type NavMenuProps = {
  isReversed: boolean
  animationKeyCounter: number
  handleClick: () => void
  handleOption: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  userAppSettings: UserSettings
  identity: StoredIdentity | null
  onIdentityChange: (next: StoredIdentity) => void
}

export default function NavMenu({
  isReversed,
  animationKeyCounter,
  handleClick,
  handleOption,
  userAppSettings,
  identity,
  onIdentityChange,
}: NavMenuProps) {
  const godmodePasswordRef = useRef<HTMLInputElement>(null)
  const [nameDraft, setNameDraft] = useState<string>(identity?.name ?? '')

  useEffect(() => {
    setNameDraft(identity?.name ?? '')
  }, [identity?.name])

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
          {identity && (
            <li>
              <div className='nameContainer'>
                <label>Ditt navn</label>
                <input
                  className='nameField'
                  type='text'
                  value={nameDraft}
                  maxLength={50}
                  onChange={e => setNameDraft(e.target.value)}
                  onBlur={() => {
                    const newName = nameDraft.trim()
                    if (!newName || newName === identity.name) return
                    const next = { ...identity, name: newName }
                    setStoredIdentity(next)
                    onIdentityChange(next)
                  }}
                  onKeyDown={e => {
                    if (e.key !== 'Enter') return
                    ;(e.currentTarget as HTMLInputElement).blur()
                  }}
                />
              </div>
            </li>
          )}
          <li>
            <div className='checkbox-wrapper'>
              <input
                type='checkbox'
                className='check'
                checked={userAppSettings.hideUptime}
                onChange={e => handleOption('hideUptime', e.target.checked)}
              />
              <label>Hide Uptime</label>
            </div>
          </li>
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
        <div className='menuFooter'>
          <p>Want to report a bug or suggest a feature?</p>
          <a
            className='githubIssueButton'
            href='https://github.com/Releets/pluginregistrationapp/issues/new'
            target='_blank'
            rel='noreferrer'
          >
            Create an issue here
          </a>
        </div>
      </div>
    </div>
  )
}
