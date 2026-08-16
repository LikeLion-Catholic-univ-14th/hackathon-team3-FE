import { useNavigate } from 'react-router-dom'
import AppointmentHeader from '../../components/AppointmentHeader/AppointmentHeader.jsx'

function AppointmentConfirmationPage() {
  const navigate = useNavigate()

  const handleClose = () => navigate(-1)

  return (
    <>
      <AppointmentHeader onClose={handleClose} />
      <section aria-labelledby="appointment-confirmation-page-title">
        <h1 id="appointment-confirmation-page-title">Appointment Confirmed</h1>
      </section>
    </>
  )
}

export default AppointmentConfirmationPage
