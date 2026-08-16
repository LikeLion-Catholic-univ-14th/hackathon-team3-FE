import closeIcon from '../../assets/icons/close.png'
import './AppointmentHeader.css'

function AppointmentHeader({ title, onBack, onClose }) {
  return (
    <header className="c-appointment-header">
      {onBack && (
        <button
          className="c-appointment-header__back"
          type="button"
          onClick={onBack}
        >
          &lt; BACK
        </button>
      )}

      {title && <p className="c-appointment-header__title">{title}</p>}

      {onClose && (
        <button
          className="c-appointment-header__close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <img src={closeIcon} alt="" width="20" height="20" />
        </button>
      )}
    </header>
  )
}

export default AppointmentHeader
