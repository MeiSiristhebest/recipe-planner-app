import { create } from "zustand"
import { persist } from "zustand/middleware"

type AuthState = {
  isAuthenticated: boolean
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  setUser: (user: AuthState["user"]) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
