import './styles/ExitModal.css'

export type ExitModalProps = {
  displayItem: string
  closeModalFunction: (confirmed: boolean) => void
}

export default function ExitModal({ displayItem, closeModalFunction }: ExitModalProps) {
  return (
    <div className='screenBlur'>
      <div className='modalContainer'>
        <button className='closeButton' onClick={() => closeModalFunction(false)}>
          X
        </button>
        <div className='modalContent'>
          Er du sikker på at du vil trekke <br></br>
          <h2 className='focusText'>{displayItem}</h2>
          fra køen?
        </div>
        <button className='confirmButton' onClick={() => closeModalFunction(true)}>
          Bekreft
        </button>
      </div>
    </div>
  )
}
