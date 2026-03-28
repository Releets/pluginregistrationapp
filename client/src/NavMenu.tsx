import { useEffect, useRef, useState } from 'react'
import './styles/NavMenu.css'
import type { AppLocale } from '../../models/UserSettings'
import { useAppSettings } from './context/useAppSettings'
import { localeMetadataByLocale } from './locales'
import { useLanguage } from './context/useLanguage'
import type { StoredIdentity } from './utils/identity'
import { setStoredIdentity } from './utils/identity'

const APP_LOCALES: AppLocale[] = ['en', 'no', 'nl']

export type NavMenuProps = {
  isReversed: boolean
  animationKeyCounter: number
  handleClick: () => void
  identity: StoredIdentity | null
  onIdentityChange: (next: StoredIdentity) => void
}

export default function NavMenu({
  isReversed,
  animationKeyCounter,
  handleClick,
  identity,
  onIdentityChange,
}: Readonly<NavMenuProps>) {
  const { t } = useLanguage()
  const { appSettings, setLanguage, setHideLog, setAudioMode, setGodmodePassword } = useAppSettings()
  const godmodePasswordRef = useRef<HTMLInputElement>(null)
  const [nameDraft, setNameDraft] = useState<string>(identity?.name ?? '')

  useEffect(() => {
    setNameDraft(identity?.name ?? '')
  }, [identity?.name])

  useEffect(() => {
    if (appSettings.godmodePassword != null && godmodePasswordRef.current) {
      godmodePasswordRef.current.value = appSettings.godmodePassword
    }
  }, [appSettings.godmodePassword])

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
                <label>{t.nav.yourName}</label>
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
                    e.currentTarget.blur()
                  }}
                />
              </div>
            </li>
          )}
          <li>
            <div className='nameContainer'>
              <label htmlFor='app-language-select'>{t.nav.language}</label>
              <select
                id='app-language-select'
                className='nameField'
                value={appSettings.language}
                onChange={e => setLanguage(e.target.value as AppLocale)}
              >
                {APP_LOCALES.map(code => {
                  const meta = localeMetadataByLocale[code]
                  return (
                    <option key={code} value={code}>
                      {meta.emoji} {meta.name}
                    </option>
                  )
                })}
              </select>
            </div>
          </li>
          <li>
            <div className='checkbox-wrapper'>
              <input
                type='checkbox'
                className='check'
                checked={appSettings.hideLog}
                onChange={e => setHideLog(e.target.checked)}
              />
              <label>{t.nav.hideLog}</label>
            </div>
          </li>
          <li>
            <div className='checkbox-wrapper'>
              <input
                type='checkbox'
                className='check'
                checked={appSettings.audioMode === 'tobias'}
                onChange={e => setAudioMode(e.target.checked ? 'tobias' : 'normal')}
              />
              <label>{t.nav.tobiasMode}</label>
            </div>
          </li>
          <li>
            <div className='passwordContainer'>
              <input
                className='passwordField'
                ref={godmodePasswordRef}
                type='password'
                placeholder={t.nav.godmode}
                onChange={e => setGodmodePassword(e.target.value)}
              />
            </div>
          </li>
        </ul>
        <div className='menuFooter'>
          <p>{t.nav.reportPrompt}</p>
          <a
            className='githubIssueButton'
            href='https://github.com/Releets/pluginregistrationapp/issues'
            target='_blank'
            rel='noreferrer'
          >
            {t.nav.createIssue}
          </a>
        </div>
      </div>
    </div>
  )
}
