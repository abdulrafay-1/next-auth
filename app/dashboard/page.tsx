'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { fetchWithAuth } from '@/utils/auth'

const Dashboard = () => {
    const { logout, user } = useAuth()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const data = await fetchWithAuth('/api/users')
                setUserData(data)
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {userData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">User Data</h2>
                        <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
                            {JSON.stringify(userData)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
