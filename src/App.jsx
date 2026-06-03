import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Skeleton from './components/Skeleton'
import { fetchMe } from './store/authSlice'

const Login = lazy(() => import('./pages/Login'))
const ApplyPage = lazy(() => import('./pages/ApplyPage'))
const CandidatesList = lazy(() => import('./pages/admin/Candidates/CandidatesList'))
const CandidateForm = lazy(() => import('./pages/admin/Candidates/CandidateForm'))
const CandidateDetails = lazy(() => import('./pages/admin/Candidates/CandidateDetails'))
const CompaniesList = lazy(() => import('./pages/admin/Candidates/CompaniesList'))
const CompanyForm = lazy(() => import('./pages/admin/Candidates/CompanyForm'))
const InterviewList = lazy(() => import('./pages/admin/Interviews/InterviewList'))

const cmsRoles = ['superAdmin', 'candidateAdmin']
const routeFallback = (
  <div className="min-h-screen bg-slate-100 p-6">
    <Skeleton rows={0} />
  </div>
)

function AppShell({ children }) {
  return <Sidebar role="superAdmin">{children}</Sidebar>
}

export default function App() {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    if (token) {
      dispatch(fetchMe())
    }
  }, [dispatch, token])

  return (
    <Suspense fallback={routeFallback}>
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
    </Suspense>
  )
}
