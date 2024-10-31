import { useEffect, useRef } from 'react'
import './NavMenu.css'
import PropTypes from 'prop-types'

NavMenu.propTypes = {
  isReversed: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  handleOption: PropTypes.func.isRequired,
  userAppSettings: PropTypes.object.isRequired,
}

export default function NavMenu({ isReversed, handleClick, handleOption, userAppSettings }) {
  const godmodePasswordRef = useRef(null)

  useEffect(() => {
    const storedSettings = localStorage.getItem('userSettings')
    if (storedSettings) {
      godmodePasswordRef.current.value = JSON.parse(storedSettings).godmodePassword
    }
  }, [])

  return (
    <div className='navmenuwrapper'>
      <div className={`burger ${isReversed ? 'reverse' : 'animate'}`} onClick={handleClick}>
        <div key={Math.random()} className='line line1'></div>
        <div key={Math.random()} className='line line2'></div>
        <div key={Math.random()} className='line line3'></div>
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
            <input
              ref={godmodePasswordRef}
              type='password'
              placeholder='Godmode password'
              onChange={e => handleOption('godmodePassword', e.target.value)}
            />
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
