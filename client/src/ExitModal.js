import './styles/ExitModal.css'

function ExitModal(props) {
  return (
    <div className='screenBlur'>
      <div className='modalContainer'>
        <button className='closeButton' onClick={() => props.closeModalFunction(false)}>
          X
        </button>
        <p className='modalContent'>
          Er du sikker på at du vil trekke <br></br>
          <h2 className='focusText'>{props.displayItem}</h2>
          fra køen?
        </p>
        <button className='confirmButton' onClick={() => props.closeModalFunction(true)}>
          Bekreft
        </button>
      </div>
    </div>
  )
}

export default ExitModal
