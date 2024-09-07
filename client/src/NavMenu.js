import './styles/NavMenu.css'
import PropTypes from 'prop-types'

NavMenu.propTypes = {
  isReversed : PropTypes.bool.isRequired,
  handleClick : PropTypes.func.isRequired
}

export default function NavMenu({isReversed, handleClick}) {
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
          <div class="checkbox-wrapper">
            <input type="checkbox" className="outer"/>
            Hide queue
          </div>
          </li>
          <li>
          <div class="checkbox-wrapper">
            <input type="checkbox" className="outer"/>
            Tobias Mode
          </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
