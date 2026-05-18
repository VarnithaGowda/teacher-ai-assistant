/**
 * App.jsx - Root component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LessonPlan from './pages/LessonPlan'
import Rubric from './pages/Rubric'
import Evaluation from './pages/Evaluation'
import Chatbot from './pages/Chatbot'
import Documents from './pages/Documents'
import Workflow from './pages/Workflow'
import Analytics from './pages/Analytics'

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes - wrapped in Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Navigate to="/dashboard" replace />
          </Layout>
        </ProtectedRoute>
      } />

      {[
        { path: '/dashboard',   element: <Dashboard /> },
        { path: '/lesson-plan', element: <LessonPlan /> },
        { path: '/rubric',      element: <Rubric /> },
        { path: '/evaluation',  element: <Evaluation /> },
        { path: '/chatbot',     element: <Chatbot /> },
        { path: '/documents',   element: <Documents /> },
        { path: '/workflow',    element: <Workflow /> },
        { path: '/analytics',   element: <Analytics /> },
      ].map(({ path, element }) => (
        <Route key={path} path={path} element={
          <ProtectedRoute>
            <Layout>{element}</Layout>
          </ProtectedRoute>
        } />
      ))}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px', borderRadius: '10px' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
