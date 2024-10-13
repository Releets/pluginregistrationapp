import { UserSettings } from '../../models/UserSettings'
import './NavMenu.css'

export type NavMenuProps = {
  isReversed : boolean,
  handleClick : Function,
  handleOptionToggle : Function,
  userAppSettings : UserSettings
}

export default function NavMenu(props : Readonly<NavMenuProps>) {
  return (
    <div className='navmenuwrapper'>
      <div className={`burger ${props.isReversed ? 'reverse' : 'animate'}`} onClick={props.handleClick()}>
        <div key={Math.random()}className='line line1'></div>
        <div key={Math.random()} className='line line2'></div>
        <div key={Math.random()} className='line line3'></div>
      </div>
      <div className={`menu ${props.isReversed ? 'invisible' : 'visible'}`}>
        <ul className='options'>
          <li>
          <div className="checkbox-wrapper">
            <input type="checkbox" className="check" checked={props.userAppSettings.hideLog} onChange={e => props.handleOptionToggle('hideLog', e.target.checked)}/>
            <label>Hide Log</label>
          </div>
          </li>
          <li>
          <div className="checkbox-wrapper">
            <input type="checkbox" className="check" checked={props.userAppSettings.audioMode === 'tobias'} onChange={e => props.handleOptionToggle('audioMode', e.target.checked ? "tobias" : "normal")}/>
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
