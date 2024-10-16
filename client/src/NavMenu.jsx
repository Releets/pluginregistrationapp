import './NavMenu.css'
import PropTypes from 'prop-types'

NavMenu.propTypes = {
  isReversed : PropTypes.bool.isRequired,
  handleClick : PropTypes.func.isRequired,
  handleOptionToggle : PropTypes.func.isRequired,
  userAppSettings : PropTypes.object.isRequired
}

export default function NavMenu({isReversed, handleClick, handleOptionToggle, userAppSettings}) {
  return (
    <div className='navmenuwrapper'>
      <div className={`burger ${isReversed ? 'reverse' : 'animate'}`} onClick={handleClick}>
        <div key={Math.random()}className='line line1'></div>
        <div key={Math.random()} className='line line2'></div>
        <div key={Math.random()} className='line line3'></div>
      </div>
      <div className={`menu ${isReversed ? 'invisible' : 'visible'}`}>
        <ul className='options'>
          <li>
          <div className="checkbox-wrapper">
            <input type="checkbox" className="check" checked={userAppSettings.hideLog} onChange={e => handleOptionToggle('hideLog', e.target.checked)}/>
            <label>Hide Log</label>
          </div>
          </li>
          <li>
          <div className="checkbox-wrapper">
            <input type="checkbox" className="check" checked={userAppSettings.audioMode === 'tobias'} onChange={e => handleOptionToggle('audioMode', e.target.checked ? "tobias" : "normal")}/>
            <label>Tobias Mode</label>
          </div>
          </li>
        </ul>
        <p>Want to report a bug or suggest a feature?</p>
          <a href='https://github.com/Releets/pluginregistrationapp/issues/new' target='_blank'>Create an issue here</a>
      </div>
    </div>
  )
}
