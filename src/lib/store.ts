import { create } from 'zustand'

export type NavPage = 
  | 'login'
  | 'dashboard' 
  | 'customers' 
  | 'owners' 
  | 'properties' 
  | 'deals' 
  | 'calendar' 
  | 'marketing' 
  | 'reports' 
  | 'documents' 
  | 'settings' 
  | 'customer-detail' 
  | 'property-detail' 
  | 'owner-detail' 
  | 'deal-detail'

interface AppState {
  currentPage: NavPage
  isLoggedIn: boolean
  selectedCustomerId: string | null
  selectedPropertyId: string | null
  selectedOwnerId: string | null
  selectedDealId: string | null
  sidebarOpen: boolean
  quickAddOpen: boolean
  navigate: (page: NavPage, id?: string) => void
  setLoggedIn: (logged: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setQuickAddOpen: (open: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'login',
  isLoggedIn: false,
  selectedCustomerId: null,
  selectedPropertyId: null,
  selectedOwnerId: null,
  selectedDealId: null,
  sidebarOpen: false,
  quickAddOpen: false,
  navigate: (page, id) =>
    set((state) => {
      const updates: Partial<AppState> = { currentPage: page, sidebarOpen: false }
      if (page === 'customer-detail') updates.selectedCustomerId = id ?? null
      if (page === 'property-detail') updates.selectedPropertyId = id ?? null
      if (page === 'owner-detail') updates.selectedOwnerId = id ?? null
      if (page === 'deal-detail') updates.selectedDealId = id ?? null
      return updates
    }),
  setLoggedIn: (logged) => set({ isLoggedIn: logged, currentPage: logged ? 'dashboard' : 'login' }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  logout: () => set({ isLoggedIn: false, currentPage: 'login' }),
}))
