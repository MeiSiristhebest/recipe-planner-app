import { API_URL } from "../constants/config"

interface LoginResponse {
  token?: string
  user?: {
    id: string
    name: string
    email: string
    image?: string
  }
  error?: string
}

interface RegisterParams {
  name: string
  email: string
  password: string
}

interface RegisterResponse {
  success?: boolean
  userId?: string
  error?: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "登录失败" }
    }

    return {
      token: data.token,
      user: data.user,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "网络错误，请稍后再试" }
  }
}

export async function register(params: RegisterParams): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "注册失败" }
    }

    return {
      success: true,
      userId: data.userId,
    }
  } catch (error) {
    console.error("Register error:", error)
    return { error: "网络错误，请稍后再试" }
  }
}

export async function logout(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.error || "登出失败" }
    }

    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "网络错误，请稍后再试" }
  }
}
