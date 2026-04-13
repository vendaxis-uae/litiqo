'use client'
import { createContext, useContext } from 'react'

// Shared context so all app components can access the current user
// Think of it as the car's "who's driving?" dashboard indicator
export const UserContext = createContext<{ user: any; demoMode: boolean }>({ user: null, demoMode: false })
export const useUser = () => useContext(UserContext)
