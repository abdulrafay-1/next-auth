// Utility function to refresh the access token
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);

        return data.accessToken;
    } catch (error) {
        // If refresh fails, clear all tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw error;
    }
}

// Wrapper for authenticated API calls
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        throw new Error('No access token available');
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // If unauthorized, try to refresh token
        if (response.status === 401) {
            accessToken = await refreshAccessToken();

            // Retry the original request with new token
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data after token refresh');
                return;
            }
            const data = await response.json();
            return data
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Check if user is authenticated
export function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}

// Logout utility
export function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
}
