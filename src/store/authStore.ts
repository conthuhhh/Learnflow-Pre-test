import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isInstructor: () => boolean;
  isStudent: () => boolean;
}

function buildUser(authUser: { id: string; email?: string; created_at: string }, profile: { full_name?: string | null; avatar_url?: string | null; role?: string } | null, fallbackRole: UserRole = 'student'): User {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    role: (profile?.role as UserRole) ?? fallbackRole,
    created_at: authUser.created_at,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Nếu profile không có role (user cũ), tự cập nhật về student
            if (profile && !profile.role) {
              await supabase
                .from('profiles')
                .update({ role: 'student' })
                .eq('id', session.user.id);
              profile.role = 'student';
            }

            set({
              user: buildUser(session.user, profile),
              isInitialized: true,
            });
          } else {
            set({ isInitialized: true });
          }
        } catch {
          set({ isInitialized: true });
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({ user: buildUser(session.user, profile) });
          } else if (event === 'SIGNED_OUT') {
            set({ user: null });
          }
        });
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, fullName, role) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, role },
            },
          });
          if (error) throw error;

          if (data.user) {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName,
              avatar_url: null,
              role,
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, isLoading: false });
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
        if (!error) set({ user: { ...user, ...data } });
      },

      clearError: () => set({ error: null }),

      isInstructor: () => get().user?.role === 'instructor',
      isStudent: () => get().user?.role === 'student',
    }),
    {
      name: 'learnflow-auth',
      partialize: (state) => ({ user: state.user }),
      // Khi load từ localStorage, đảm bảo role luôn có giá trị
      merge: (persisted, current) => {
        const p = persisted as Partial<typeof current>;
        if (p.user && !p.user.role) {
          p.user.role = 'student';
        }
        return { ...current, ...p };
      },
    }
  )
);
