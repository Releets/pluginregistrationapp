import './styles/NavMenu.css'
import useAppSettings from './context/useAppSettings'
import useIdentity from './context/useIdentity'
import { languages, type LanguageCode } from './locales'
import useLanguage from './context/useLanguage'

export type NavMenuProps = {
  isReversed: boolean
  animationKeyCounter: number
  handleClick: () => void
}

export default function NavMenu({ isReversed, animationKeyCounter, handleClick }: Readonly<NavMenuProps>) {
  const t = useLanguage()
  const { identity, setName } = useIdentity()
  const { language, audioMode, hideLog, hideUptime, godmodePw } = useAppSettings()

  return (
    <div className='navmenuwrapper'>
      <div className={`burger ${isReversed ? 'reverse' : 'animate'}`} onClick={handleClick}>
        <div key={animationKeyCounter + 1} className='line line1'></div>
        <div key={animationKeyCounter + 2} className='line line2'></div>
        <div key={animationKeyCounter + 3} className='line line3'></div>
      </div>

      <div className={`menu ${isReversed ? 'invisible' : 'visible'}`}>
        <ul className='options'>
          <li className='columnInput'>
            <label>{t.nav.username}</label>
            <input
              id='username'
              type='text'
              className='text'
              value={identity.name}
              onChange={e => setName(e.target.value)}
            />
          </li>

          <li className='columnInput'>
            <label>{t.nav.language}</label>
            <select id='language' value={language.value} onChange={e => language.set(e.target.value as LanguageCode)}>
              {Object.values(languages).map(lang => (
                <option key={lang.metadata.code} value={lang.metadata.code}>
                  {lang.metadata.emoji} {lang.metadata.name}
                </option>
              ))}
            </select>
          </li>

          <li className='rowInput'>
            <label>{t.nav.audioMode}</label>
            <input
              id='audioMode'
              type='checkbox'
              className='check'
              checked={audioMode.value === 'tobias'}
              onChange={e => audioMode.set(e.target.checked ? 'tobias' : 'normal')}
            />
          </li>

          <li className='rowInput'>
            <label>{t.nav.hideLog}</label>
            <input
              id='hideLog'
              type='checkbox'
              className='check'
              checked={hideLog.value}
              onChange={e => hideLog.set(e.target.checked)}
            />
          </li>

          <li className='rowInput'>
            <label>{t.nav.hideUptime}</label>
            <input
              id='hideUptime'
              type='checkbox'
              className='check'
              checked={hideUptime.value}
              onChange={e => hideUptime.set(e.target.checked)}
            />
          </li>

          <li className='columnInput'>
            <label>{t.nav.godmodePw}</label>
            <input
              id='godmodePw'
              type='password'
              placeholder={t.nav.godmodePw}
              value={godmodePw.value}
              onChange={e => godmodePw.set(e.target.value)}
            />
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
