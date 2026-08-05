import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const API_ROOT = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : `http://${defaultHost}:5000`)

const CANDIDATE_SESSION_KEY = 'candidate_portal_user'

const readCandidateUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CANDIDATE_SESSION_KEY))
  } catch {
    return null
  }
}

export const loginCandidatePortal = createAsyncThunk(
  'candidateAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_ROOT}/api/public/candidate/login`,
        credentials,
        { withCredentials: true }
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed. Please check your Candidate ID and password.')
    }
  }
)

export const fetchCandidateSession = createAsyncThunk(
  'candidateAuth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const session = readCandidateUser()
      const headers = {}
      if (session?.candidateToken) {
        headers.Authorization = `Bearer ${session.candidateToken}`
      }

      const { data } = await axios.get(
        `${API_ROOT}/api/public/candidate/me`,
        { headers, withCredentials: true }
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Session expired')
    }
  }
)

const savedCandidate = readCandidateUser()

const initialState = {
  candidate: savedCandidate,
  authenticated: Boolean(savedCandidate),
  checking: Boolean(savedCandidate),
  loading: false,
  error: null
}

const candidateAuthSlice = createSlice({
  name: 'candidateAuth',
  initialState,
  reducers: {
    logoutCandidate(state) {
      state.candidate = null
      state.authenticated = false
      state.checking = false
      state.error = null
      localStorage.removeItem(CANDIDATE_SESSION_KEY)
      localStorage.removeItem('success-public-apply:candidate-session')
    },
    // Called after successful sign-up to immediately mark session as authenticated
    setFromSignup(state, action) {
      state.authenticated = true
      state.checking = false
      state.candidate = action.payload.candidate || action.payload
      localStorage.setItem(CANDIDATE_SESSION_KEY, JSON.stringify(action.payload))
      localStorage.setItem('success-public-apply:candidate-session', JSON.stringify({
        candidateToken: action.payload.candidateToken,
        candidate: state.candidate
      }))
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginCandidatePortal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginCandidatePortal.fulfilled, (state, action) => {
        state.loading = false
        state.authenticated = true
        state.checking = false
        state.candidate = action.payload.candidate || action.payload
        
        // Ensure token is saved along with candidate info if present
        const payloadToSave = { ...state.candidate }
        if (action.payload.candidateToken) {
          payloadToSave.candidateToken = action.payload.candidateToken
        }
        localStorage.setItem(CANDIDATE_SESSION_KEY, JSON.stringify(payloadToSave))
        localStorage.setItem('success-public-apply:candidate-session', JSON.stringify({
          candidateToken: action.payload.candidateToken,
          candidate: state.candidate
        }))
      })
      .addCase(loginCandidatePortal.rejected, (state, action) => {
        state.loading = false
        state.authenticated = false
        state.error = action.payload
      })
      .addCase(fetchCandidateSession.pending, (state) => {
        state.checking = true
      })
      .addCase(fetchCandidateSession.fulfilled, (state, action) => {
        state.checking = false
        state.authenticated = true
        state.candidate = action.payload.candidate || action.payload
        
        const existingSession = readCandidateUser() || {}
        const payloadToSave = { ...state.candidate }
        if (existingSession.candidateToken) {
          payloadToSave.candidateToken = existingSession.candidateToken
        }
        localStorage.setItem(CANDIDATE_SESSION_KEY, JSON.stringify(payloadToSave))
        localStorage.setItem('success-public-apply:candidate-session', JSON.stringify({
          candidateToken: payloadToSave.candidateToken,
          candidate: state.candidate
        }))
      })
      .addCase(fetchCandidateSession.rejected, (state) => {
        state.checking = false
        state.authenticated = false
        state.candidate = null
        localStorage.removeItem(CANDIDATE_SESSION_KEY)
      })
  }
})

export const { logoutCandidate, setFromSignup } = candidateAuthSlice.actions
export default candidateAuthSlice.reducer
