import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import useScrollToTop from './hooks/useScrollToTop.js'
import BrandLayout from './layouts/BrandLayout/BrandLayout.jsx'
import AppointmentConfirmationPage from './pages/AppointmentConfirmation/AppointmentConfirmationPage.jsx'
import AppointmentSchedulePage from './pages/AppointmentSchedule/AppointmentSchedulePage.jsx'
import CategoryPage from './pages/Category/CategoryPage.jsx'
import CreationMethodPage from './pages/CreationMethod/CreationMethodPage.jsx'
import FreeformBriefPage from './pages/FreeformBrief/FreeformBriefPage.jsx'
import GenerationPage from './pages/Generation/GenerationPage.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import LockPage from './pages/Lock/LockPage.jsx'
import RegistrationPage from './pages/Registration/RegistrationPage.jsx'
import ShapePage from './pages/Shape/ShapePage.jsx'
import StoreSelectionPage from './pages/StoreSelection/StoreSelectionPage.jsx'
import UnseenResultPage from './pages/UnseenResult/UnseenResultPage.jsx'

function App() {
  useScrollToTop()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/create">
        <Route element={<BrandLayout />}>
          <Route index element={<Navigate to="registration" replace />} />
          <Route path="registration" element={<RegistrationPage />} />
          <Route path=":sessionId">
            <Route index element={<Navigate to="choose" replace />} />
            <Route path="choose" element={<CreationMethodPage />} />
            <Route path="brief" element={<FreeformBriefPage />} />
            <Route path="category" element={<CategoryPage />} />
            <Route path="shape" element={<ShapePage />} />
            <Route path="importance" element={<LockPage />} />
          </Route>
        </Route>

        <Route path=":sessionId/generating" element={<GenerationPage />} />
      </Route>

      <Route path="/unseen/:unseenId" element={<BrandLayout />}>
        <Route index element={<UnseenResultPage />} />
        <Route path="appointment">
          <Route index element={<Navigate to="store" replace />} />
          <Route path="store" element={<StoreSelectionPage />} />
          <Route path="schedule" element={<AppointmentSchedulePage />} />
        </Route>
      </Route>

      <Route path="/appointments/:appointmentId">
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
