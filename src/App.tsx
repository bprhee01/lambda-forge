import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { QuestPage } from './pages/QuestPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/world/:worldId/quest/:questId" element={<QuestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
