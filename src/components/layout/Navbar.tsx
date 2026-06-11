import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Brain, LayoutDashboard, LogOut, User,
  Menu, X, ChevronDown, Bell, PlusCircle, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, signOut, isInstructor } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const instructor = isInstructor();
  const isDark = theme === 'dark';

  // Nav links differ by role
  const navLinks = [
    { href: '/courses', label: 'Khóa học', icon: BookOpen, show: true },
    { href: '/flashcards', label: 'Flashcard', icon: Brain, show: true },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: !!user },
    // Instructor-only shortcut
    { href: '/courses/manage', label: 'Quản lý', icon: PlusCircle, show: instructor },
  ].filter((l) => l.show);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setProfileOpen(false);
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  const roleLabel = user?.role === 'instructor' ? 'Giảng viên' : 'Học viên';
  const roleColor = user?.role === 'instructor'
    ? 'bg-purple-100 text-purple-700'
    : 'bg-blue-100 text-blue-700';
  const avatarGradient = user?.role === 'instructor'
    ? 'from-purple-500 to-indigo-500'
    : 'from-blue-500 to-indigo-500';

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">LF</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">LearnFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith(href)
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                <button className="hidden sm:flex p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                      {initials}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">
                        {user.full_name?.split(' ').pop() || 'Tôi'}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 text-gray-400 hidden sm:block transition-transform', profileOpen && 'rotate-180')} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-12 w-60 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.full_name || 'Người dùng'}
                            </p>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${roleColor}`}>
                              {roleLabel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>

                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <User className="h-4 w-4" /> Hồ sơ cá nhân
                        </Link>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>

                        {instructor && (
                          <>
                            <hr className="my-1 border-gray-100 dark:border-gray-800" />
                            <div className="px-4 py-1">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Giảng viên</p>
                            </div>
                            <Link to="/courses/manage" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <BookOpen className="h-4 w-4 text-purple-500" /> Quản lý khóa học
                            </Link>
                          </>
                        )}

                        <hr className="my-1 border-gray-100 dark:border-gray-800" />
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">Đăng nhập</Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname.startsWith(href)
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            {user && (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 px-3 flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColor}`}>
                  {roleLabel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
