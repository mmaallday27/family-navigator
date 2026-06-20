import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import JourneyMap from './pages/JourneyMap'
import TransitionNavigator from './pages/TransitionNavigator'
import Companion from './pages/Companion'
import DocumentVault from './pages/DocumentVault'
import ResourceNavigator from './pages/ResourceNavigator'
import FamilyCircle from './pages/FamilyCircle'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/journey" element={<JourneyMap />} />
        <Route path="/transition" element={<TransitionNavigator />} />
        <Route path="/companion" element={<Companion />} />
        <Route path="/documents" element={<DocumentVault />} />
        <Route path="/resources" element={<ResourceNavigator />} />
        <Route path="/family" element={<FamilyCircle />} />
      </Routes>
    </Layout>
  )
}
