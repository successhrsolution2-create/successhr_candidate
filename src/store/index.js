import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import candidateAuthReducer from './candidateAuthSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidateAuth: candidateAuthReducer
  }
})
