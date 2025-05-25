'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    isAuthenticated: boolean
    user: any | null
    login: (tokens: { accessToken: string; refreshToken: string; user: any }) => void
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Check authentication status when component mounts
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken')
            const cachedUser = localStorage.getItem('user')

            if (!accessToken) {
                setIsAuthenticated(false)
                setUser(null)
                return
            }

            if (cachedUser) {
                setUser(JSON.parse(cachedUser))
                setIsAuthenticated(true)
            } else {
                // Optional: validate token with API if no cached user
                const response = await fetch('/api/users', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                    localStorage.setItem('user', JSON.stringify(userData))
                    setIsAuthenticated(true)
                } else {
                    logout()
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }


    const login = ({ accessToken, refreshToken, user }: {
        accessToken: string
        refreshToken: string
        user: any
    }) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        setIsAuthenticated(true)
        router.push('/')
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setIsAuthenticated(false)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
