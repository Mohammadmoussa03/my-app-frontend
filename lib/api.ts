const API_URL = 'http://localhost:8000'

interface TokenResponse {
  access: string
  refresh: string
}

interface RefreshResponse {
  access: string
}

// Map of backend error messages to user-friendly messages
const errorMessageMap: Record<string, string> = {
  // Authentication errors
  'No active account found with the given credentials': 'Invalid email or password. Please try again.',
  'Authentication credentials were not provided': 'Please log in to continue.',
  'Token is invalid or expired': 'Your session has expired. Please log in again.',
  'Unable to log in with provided credentials': 'Invalid email or password. Please check your credentials.',
  'User account is disabled': 'Your account has been disabled. Please contact support.',
  'This field may not be blank': 'Please fill in all required fields.',
  'This field is required': 'Please fill in all required fields.',
  
  // User/Account errors
  'A user with that email already exists': 'An account with this email already exists. Try logging in instead.',
  'user with this email already exists': 'An account with this email already exists. Try logging in instead.',
  "Password fields didn't match": 'The passwords you entered do not match.',
  'Password must be at least 8 characters': 'Password must be at least 8 characters long.',
  'This password is too common': 'Please choose a stronger password.',
  'This password is entirely numeric': 'Password cannot be entirely numbers.',
  
  // Profile errors
  'Profile not found': "We couldn't find your profile. Please try again.",
  
  // Job errors
  'Job not found': 'This job posting is no longer available.',
  'Only Clients can create jobs': 'Only clients can post jobs.',
  'Only Clients can create Categories': 'Only clients can create categories.',
  
  // Proposal errors
  'You have already submitted a proposal for this job': "You've already applied to this job.",
  'Proposal not found': 'This proposal is no longer available.',
  'Only freelancers can submit proposals': 'Only freelancers can apply for jobs.',
  'Cannot submit proposal for your own job': 'You cannot apply to your own job posting.',
  
  // Contract errors
  'Contract not found': 'This contract could not be found.',
  'Contract is not active': 'This contract is no longer active.',
  'Only the client can fund this contract': 'Only the client can add funds to this contract.',
  'Only the client can approve deliverables': 'Only the client can approve work submissions.',
  'Insufficient balance': 'Your wallet balance is too low. Please add funds.',
  'Insufficient funds': 'Your wallet balance is too low. Please add funds.',
  
  // Wallet errors
  'Wallet not found': "We couldn't find your wallet. Please contact support.",
  'Invalid amount': 'Please enter a valid amount.',
  'Amount must be greater than 0': 'Please enter an amount greater than $0.',
  'Withdrawal amount exceeds available balance': "You don't have enough funds to withdraw this amount.",
  
  // Deliverable errors
  'Deliverable not found': 'This deliverable could not be found.',
  'File is required': 'Please attach a file to your submission.',
  
  // Generic errors
  'Not found': 'The requested item could not be found.',
  'Permission denied': "You don't have permission to perform this action.",
  'Method not allowed': 'This action is not allowed.',
  'Bad request': 'Something went wrong. Please check your input and try again.',
  'Internal server error': 'Something went wrong on our end. Please try again later.',
  'Request failed': 'Something went wrong. Please try again.',
  'Network error': 'Unable to connect. Please check your internet connection.',
}

function formatUserFriendlyError(error: string): string {
  // Check for exact match first
  if (errorMessageMap[error]) {
    return errorMessageMap[error]
  }
  
  // Check for partial matches (case-insensitive)
  const lowerError = error.toLowerCase()
  for (const [key, value] of Object.entries(errorMessageMap)) {
    if (lowerError.includes(key.toLowerCase())) {
      return value
    }
  }
  
  // Handle JSON field errors like {"email": ["This field is required."]}
  try {
    const parsed = JSON.parse(error)
    if (typeof parsed === 'object' && parsed !== null) {
      const fieldErrors = Object.entries(parsed)
        .map(([field, messages]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
          const message = Array.isArray(messages) ? messages[0] : messages
          return `${fieldName}: ${message}`
        })
        .join(' ')
      if (fieldErrors) return fieldErrors
    }
  } catch {
    // Not JSON, continue
  }
  
  // Handle "field: error" format
  if (error.includes(':')) {
    const parts = error.split(':')
    if (parts.length === 2) {
      const field = parts[0].trim().charAt(0).toUpperCase() + parts[0].trim().slice(1).replace(/_/g, ' ')
      const message = parts[1].trim()
      return `${field}: ${message}`
    }
  }
  
  // Return original error if no mapping found, but clean it up
  return error.charAt(0).toUpperCase() + error.slice(1)
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private async getRefreshToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await fetch(`${this.baseURL}/account/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        this.clearTokens()
        return null
      }

      const data: RefreshResponse = await response.json()
      localStorage.setItem('access_token', data.access)
      return data.access
    } catch {
      this.clearTokens()
      return null
    }
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    let accessToken = await this.getAccessToken()

    const makeRequest = async (token: string | null): Promise<Response> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body,
      })

      return response
    }

    let response = await makeRequest(accessToken)

    // If unauthorized, try to refresh token
    if (response.status === 401 && accessToken) {
      accessToken = await this.refreshAccessToken()
      if (accessToken) {
        response = await makeRequest(accessToken)
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage: string
      try {
        const errorJson = JSON.parse(errorText)
        // Handle various error formats from DRF
        if (errorJson.detail) {
          errorMessage = errorJson.detail
        } else if (errorJson.message) {
          errorMessage = errorJson.message
        } else if (errorJson.non_field_errors) {
          errorMessage = Array.isArray(errorJson.non_field_errors) 
            ? errorJson.non_field_errors.join(' ') 
            : errorJson.non_field_errors
        } else if (typeof errorJson === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorJson)
            .map(([field, messages]) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
              const message = Array.isArray(messages) ? messages[0] : messages
              return `${fieldName}: ${message}`
            })
            .join(' ')
          errorMessage = fieldErrors || 'Request failed'
        } else {
          errorMessage = 'Request failed'
        }
      } catch {
        errorMessage = errorText || `Error: ${response.status}`
      }
      return { error: formatUserFriendlyError(errorMessage) }
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: undefined as T }
    }

    try {
      const data = await response.json()
      return { data }
    } catch {
      return { data: undefined as T }
    }
  }

  async get<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    body?: unknown
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(
    endpoint: string,
    body?: unknown
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    body?: unknown
  ): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PATCH' | 'PUT' = 'PATCH'
  ): Promise<{ data?: T; error?: string }> {
    let accessToken = await this.getAccessToken()

    const makeRequest = async (token: string | null): Promise<Response> => {
      const headers: Record<string, string> = {}

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: formData,
      })

      return response
    }

    let response = await makeRequest(accessToken)

    if (response.status === 401 && accessToken) {
      accessToken = await this.refreshAccessToken()
      if (accessToken) {
        response = await makeRequest(accessToken)
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage: string
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.detail) {
          errorMessage = errorJson.detail
        } else if (errorJson.message) {
          errorMessage = errorJson.message
        } else if (errorJson.non_field_errors) {
          errorMessage = Array.isArray(errorJson.non_field_errors) 
            ? errorJson.non_field_errors.join(' ') 
            : errorJson.non_field_errors
        } else if (typeof errorJson === 'object') {
          const fieldErrors = Object.entries(errorJson)
            .map(([field, messages]) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
              const message = Array.isArray(messages) ? messages[0] : messages
              return `${fieldName}: ${message}`
            })
            .join(' ')
          errorMessage = fieldErrors || 'Upload failed'
        } else {
          errorMessage = 'Upload failed'
        }
      } catch {
        errorMessage = errorText || `Error: ${response.status}`
      }
      return { error: formatUserFriendlyError(errorMessage) }
    }

    const data = await response.json()
    return { data }
  }
}

export const api = new ApiClient(API_URL)
