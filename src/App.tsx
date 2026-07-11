import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { AuthProvider, useAuth } from './store/AuthContext'
import { FamilyProvider, useFamily } from './store/FamilyContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import JourneyMap from './pages/JourneyMap'
import LookAhead from './pages/LookAhead'
import Timeline from './pages/Timeline'
import TransitionNavigator from './pages/TransitionNavigator'
import Companion from './pages/Companion'
import DocumentVault from './pages/DocumentVault'
import ResourceNavigator from './pages/ResourceNavigator'
import FamilyCircle from './pages/FamilyCircle'

function FullLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3 text-ink-faint">
        <div className="flex h-11 w-11 animate-pulse-soft items-center justify-center rounded-xl bg-teal-500 text-white">
          <Compass className="h-5 w-5" />
        </div>
        <p className="text-sm">Loading your record…</p>
      </div>
    </div>
  )
}

// Signed out → the front door. Signed in → the app.
function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <FullLoader />
  if (!user) return <Navigate to="/auth" replace />
  return <Outlet />
}

// The /auth route bounces already-signed-in families back into the app.
function AuthRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullLoader />
  if (user) return <Navigate to="/" replace />
  return <Auth />
}

// Wait for the record to load, then route the un-onboarded to the welcome flow.
function RequireOnboarded() {
  const { state, loading } = useFamily()
  if (loading) return <FullLoader />
  if (!state.onboarded) return <Navigate to="/welcome" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route element={<RequireAuth />}>
            <Route path="/welcome" element={<Onboarding />} />
            <Route element={<RequireOnboarded />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/journey" element={<JourneyMap />} />
                <Route path="/look-ahead" element={<LookAhead />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/transition" element={<TransitionNavigator />} />
                <Route path="/companion" element={<Companion />} />
                <Route path="/documents" element={<DocumentVault />} />
                <Route path="/resources" element={<ResourceNavigator />} />
                <Route path="/family" element={<FamilyCircle />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </FamilyProvider>
    </AuthProvider>
  )
}
