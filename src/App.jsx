import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppointmentLayout from './layouts/AppointmentLayout/AppointmentLayout.jsx'
import CreationFlowLayout from './layouts/CreationFlowLayout/CreationFlowLayout.jsx'
import UnseenSessionLayout from './layouts/UnseenSessionLayout/UnseenSessionLayout.jsx'
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
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/create/:sessionId/generating"
        element={<GenerationPage />}
      />

      <Route path="/create" element={<CreationFlowLayout />}>
        <Route index element={<Navigate to="registration" replace />} />
        <Route path="registration" element={<RegistrationPage />} />
        <Route path=":sessionId">
          <Route index element={<Navigate to="choose" replace />} />
          <Route path="choose" element={<CreationMethodPage />} />
          <Route path="brief" element={<FreeformBriefPage />} />
          <Route path="category" element={<CategoryPage />} />
          <Route path="shape" element={<ShapePage />} />
          <Route path="importance" element={<LockPage />} />
          <Route
            path="lock"
            element={<Navigate to="../importance" replace />}
          />
        </Route>
      </Route>

      <Route path="/unseen/:unseenId" element={<UnseenSessionLayout />}>
        <Route index element={<UnseenResultPage />} />
        <Route
          path="appointment"
          element={<Navigate to="store" replace />}
        />
        <Route path="appointment/store" element={<StoreSelectionPage />} />
        <Route
          path="appointment/schedule"
          element={<AppointmentSchedulePage />}
        />
        <Route
          path="reserve"
          element={<Navigate to="../appointment/store" replace />}
        />
      </Route>

      <Route
        path="/appointments/:appointmentId"
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
