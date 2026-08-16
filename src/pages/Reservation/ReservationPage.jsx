import { useNavigate } from 'react-router-dom'
import AppointmentHeader from '../../components/AppointmentHeader/AppointmentHeader.jsx'

function ReservationPage() {
  const navigate = useNavigate()

  const handleBack = () => navigate(-1)

  return (
    <>
      <AppointmentHeader
        title="PRIVATE APPOINTMENT"
        onBack={handleBack}
        onClose={handleBack}
      />
      <section aria-labelledby="reservation-page-title">
        <h1 id="reservation-page-title">Private Appointment</h1>
      </section>
    </>
  )
}

export default ReservationPage
