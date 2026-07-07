import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { FamilyProvider, useFamily } from './store/FamilyContext'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import JourneyMap from './pages/JourneyMap'
import TransitionNavigator from './pages/TransitionNavigator'
import Companion from './pages/Companion'
import DocumentVault from './pages/DocumentVault'
import ResourceNavigator from './pages/ResourceNavigator'
import FamilyCircle from './pages/FamilyCircle'

// Families who haven't been welcomed yet always land on the welcome journey.
function RequireOnboarded() {
  const { state } = useFamily()
  if (!state.onboarded) return <Navigate to="/welcome" replace />
  return <Outlet />
}

export default function App() {
  return (
    <FamilyProvider>
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route element={<RequireOnboarded />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journey" element={<JourneyMap />} />
            <Route path="/transition" element={<TransitionNavigator />} />
            <Route path="/companion" element={<Companion />} />
            <Route path="/documents" element={<DocumentVault />} />
            <Route path="/resources" element={<ResourceNavigator />} />
            <Route path="/family" element={<FamilyCircle />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </FamilyProvider>
  )
}
