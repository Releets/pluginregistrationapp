import { useEffect, useRef } from 'react'
import './NavMenu.css'
import PropTypes from 'prop-types'
import { setStoredIdentity } from './utils/identity'

NavMenu.propTypes = {
  isReversed: PropTypes.bool.isRequired,
  animationKeyCounter: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  handleOption: PropTypes.func.isRequired,
  userAppSettings: PropTypes.object.isRequired,
  identity: PropTypes.shape({
    name: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired,
  }).isRequired,
  onIdentityChange: PropTypes.func.isRequired,
}

export default function NavMenu({
  isReversed,
  animationKeyCounter,
  handleClick,
  handleOption,
  userAppSettings,
  identity,
  onIdentityChange,
}) {
  const godmodePasswordRef = useRef(null)
  const nameInputRef = useRef(null)

  useEffect(() => {
    const storedSettings = localStorage.getItem('userSettings')
    if (storedSettings) {
      godmodePasswordRef.current.value = JSON.parse(storedSettings).godmodePassword ?? ''
    }
  }, [])

  useEffect(() => {
    if (nameInputRef.current && identity.name !== nameInputRef.current.value) {
      nameInputRef.current.value = identity.name
    }
  }, [identity.name])

  const handleNameChange = () => {
    const newName = nameInputRef.current?.value?.trim()
    if (newName && newName !== identity.name) {
      const next = { ...identity, name: newName }
      setStoredIdentity(next)
      onIdentityChange(next)
    }
  }

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
            <div className='nameContainer'>
              <label>Ditt navn</label>
              <input
                ref={nameInputRef}
                type='text'
                className='nameField'
                defaultValue={identity.name}
                onBlur={handleNameChange}
                onKeyDown={e => e.key === 'Enter' && handleNameChange()}
                maxLength={50}
              />
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
            <input className='passwordField'
              ref={godmodePasswordRef}
              type='password'
              placeholder='Godmode password'
              onChange={e => handleOption('godmodePassword', e.target.value)}
            />
            </div>
          </li>
        </ul>
        <p>Want to report a bug or suggest a feature?</p>
        <a href='https://github.com/Releets/pluginregistrationapp/issues/new' target='_blank'>
          Create an issue here
        </a>
      </div>
    </div>
  )
}
