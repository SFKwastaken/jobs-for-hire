import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Auth from './pages/Auth.tsx'
import Profile from './pages/Profile.tsx'
import Resume from './pages/Resume.tsx'
import ResumeViewer from './pages/ResumeViewer.tsx'
import JobSearch from './pages/JobSearch.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/resume/:id/preview" element={<ResumeViewer />} />
          <Route path="/jobs" element={<JobSearch />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
