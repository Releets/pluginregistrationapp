import useLanguage from './context/useLanguage'
import './styles/ExitModal.css'

export type ExitModalProps = {
  displayItem: string
  closeModalFunction: (confirmed: boolean) => void
}

export default function ExitModal({ displayItem, closeModalFunction }: Readonly<ExitModalProps>) {
  const t = useLanguage()
  return (
    <div className='screenBlur'>
      <div className='modalContainer'>
        <button className='closeButton' onClick={() => closeModalFunction(false)}>
          X
        </button>
        <div className='modalContent'>
          {t.exitModal.line1} <br></br>
          <h2 className='focusText'>{displayItem}</h2>
          {t.exitModal.line2}
        </div>
        <button className='confirmButton' onClick={() => closeModalFunction(true)}>
          {t.exitModal.confirm}
        </button>
      </div>
    </div>
  )
}
