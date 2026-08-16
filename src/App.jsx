import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppointmentLayout from './layouts/AppointmentLayout/AppointmentLayout.jsx'
import CreationFlowLayout from './layouts/CreationFlowLayout/CreationFlowLayout.jsx'
import AppointmentConfirmationPage from './pages/AppointmentConfirmation/AppointmentConfirmationPage.jsx'
import CategoryPage from './pages/Category/CategoryPage.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import LockPage from './pages/Lock/LockPage.jsx'
import ReservationPage from './pages/Reservation/ReservationPage.jsx'
import ShapePage from './pages/Shape/ShapePage.jsx'
import UnseenResultPage from './pages/UnseenResult/UnseenResultPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/create/:sessionId" element={<CreationFlowLayout />}>
        <Route index element={<Navigate to="category" replace />} />
        <Route path="category" element={<CategoryPage />} />
        <Route path="shape" element={<ShapePage />} />
        <Route path="lock" element={<LockPage />} />
      </Route>

      <Route path="/unseen/:unseenId">
        <Route index element={<UnseenResultPage />} />
        <Route element={<AppointmentLayout />}>
          <Route path="reserve" element={<ReservationPage />} />
        </Route>
      </Route>

      <Route
        path="/appointments/:reservationId"
        element={<AppointmentLayout />}
      >
        <Route index element={<Navigate to="confirmation" replace />} />
        <Route
          path="confirmation"
          element={<AppointmentConfirmationPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
