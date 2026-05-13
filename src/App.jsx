import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ApplyPage from './pages/ApplyPage'
import CandidatesList from './pages/admin/Candidates/CandidatesList'
import CandidateForm from './pages/admin/Candidates/CandidateForm'
import CandidateDetails from './pages/admin/Candidates/CandidateDetails'
import CompaniesList from './pages/admin/Candidates/CompaniesList'
import CompanyForm from './pages/admin/Candidates/CompanyForm'
import InterviewList from './pages/admin/Interviews/InterviewList'

const cmsRoles = ['superAdmin', 'candidateAdmin', 'cmsAdmin']

function AppShell({ children }) {
  return <Sidebar role="superAdmin">{children}</Sidebar>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ApplyPage />} />
      <Route path="/:code" element={<ApplyPage />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/apply/:code" element={<ApplyPage />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/cms/candidates"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CandidatesList />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/candidates/new"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CandidateForm />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/candidates/:id"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CandidateDetails />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/candidates/:id/edit"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CandidateForm />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/companies"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CompaniesList />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/companies/new"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CompanyForm />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cms/companies/:id/edit"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <CompanyForm />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interviews"
        element={
          <ProtectedRoute roles={cmsRoles}>
            <AppShell>
              <InterviewList />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/cms/candidates" replace />} />
      <Route path="/admin/candidates" element={<Navigate to="/admin/cms/candidates" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
