'use client'

import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/components/AuthProvider"
import Navbar from "@/components/Navbar"

export default function StripeLayout({
    children
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated } = useAuth()

    // Add a console log to debug
    console.log('Dashboard Layout - Auth Status:', { isAuthenticated })

    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    )
}
