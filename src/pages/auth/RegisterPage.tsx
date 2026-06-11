import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/types';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate single field on blur
  const validateField = (name: string, value: string) => {
    const e: Record<string, string> = { ...errors };

    switch (name) {
      case 'fullName':
        if (!value.trim()) e.fullName = 'Vui lòng nhập họ và tên';
        else if (/\d/.test(value)) e.fullName = 'Họ tên không được chứa số';
        else if (value.trim().length < 2) e.fullName = 'Họ tên ít nhất 2 ký tự';
        else if (/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/.test(value)) e.fullName = 'Họ tên không được chứa ký tự đặc biệt';
        else delete e.fullName;
        break;
      case 'email':
        if (!value.trim()) e.email = 'Vui lòng nhập email';
        else if (!value.includes('@')) e.email = 'Email phải chứa ký tự @';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) e.email = 'Email không hợp lệ (vd: ten@gmail.com)';
        else delete e.email;
        break;
      case 'password':
        if (!value) e.password = 'Vui lòng nhập mật khẩu';
        else if (value.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
        else if (!/[a-zA-Z]/.test(value)) e.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái';
        else if (!/[0-9]/.test(value)) e.password = 'Mật khẩu phải chứa ít nhất 1 chữ số';
        else delete e.password;
        break;
      case 'confirmPassword':
        if (!value) e.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (password !== value) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
        else delete e.confirmPassword;
        break;
    }
    setErrors(e);
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Password strength
  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Rất yếu', color: 'bg-red-500', width: '20%' };
    if (score === 2) return { label: 'Yếu', color: 'bg-orange-500', width: '40%' };
    if (score === 3) return { label: 'Trung bình', color: 'bg-yellow-500', width: '60%' };
    if (score === 4) return { label: 'Mạnh', color: 'bg-blue-500', width: '80%' };
    return { label: 'Rất mạnh', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const { signUp, isLoading, error, clearError } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};

    // Họ và tên: không để trống, không chứa số, tối thiểu 2 ký tự
    if (!fullName.trim()) {
      e.fullName = 'Vui lòng nhập họ và tên';
    } else if (/\d/.test(fullName)) {
      e.fullName = 'Họ tên không được chứa số';
    } else if (fullName.trim().length < 2) {
      e.fullName = 'Họ tên ít nhất 2 ký tự';
    } else if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(fullName)) {
      e.fullName = 'Họ tên không được chứa ký tự đặc biệt';
    }

    // Email: không để trống, phải có @, phải có đuôi hợp lệ
    if (!email.trim()) {
      e.email = 'Vui lòng nhập email';
    } else if (!email.includes('@')) {
      e.email = 'Email phải chứa ký tự @';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Email không hợp lệ (vd: ten@gmail.com)';
    }

    // Mật khẩu: tối thiểu 6 ký tự, phải có chữ và số
    if (!password) {
      e.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      e.password = 'Mật khẩu ít nhất 6 ký tự';
    } else if (!/[a-zA-Z]/.test(password)) {
      e.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái';
    } else if (!/[0-9]/.test(password)) {
      e.password = 'Mật khẩu phải chứa ít nhất 1 chữ số';
    }

    // Xác nhận mật khẩu
    if (!confirmPassword) {
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await signUp(email, password, fullName, role);
      toast.success('Đăng ký thành công! Chào mừng đến với LearnFlow!');
      navigate('/dashboard');
    } catch {
      // error shown via store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">LearnFlow</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Tạo tài khoản</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Bắt đầu hành trình học tập của bạn</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error === 'User already registered' ? 'Email này đã được đăng ký' : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bạn muốn tham gia với tư cách? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === 'student'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <GraduationCap className="h-7 w-7" />
                  <div>
                    <p className="font-semibold text-sm">Học viên</p>
                    <p className="text-xs text-current opacity-70">Học khóa học, ôn flashcard</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === 'instructor'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <BookOpen className="h-7 w-7" />
                  <div>
                    <p className="font-semibold text-sm">Giảng viên</p>
                    <p className="text-xs text-current opacity-70">Tạo & quản lý khóa học</p>
                  </div>
                </button>
              </div>
            </div>

            <Input
              label="Họ và tên"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={(e) => handleBlur('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
              leftIcon={<User className="h-4 w-4" />}
              error={touched.fullName ? errors.fullName : undefined}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="ten@gmail.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={touched.email ? errors.email : undefined}
              helperText={!touched.email ? 'Nhập đúng định dạng: ten@gmail.com' : undefined}
              required
              autoComplete="email"
            />
            <div>
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                placeholder="Tối thiểu 6 ký tự, có chữ và số"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={touched.password ? errors.password : undefined}
                required
                autoComplete="new-password"
              />
              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    strength.label === 'Rất mạnh' || strength.label === 'Mạnh'
                      ? 'text-green-600'
                      : strength.label === 'Trung bình'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    Độ mạnh: {strength.label}
                  </p>
                </div>
              )}
            </div>
            <Input
              label="Xác nhận mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
              placeholder="Nhập lại mật khẩu"
              leftIcon={<Lock className="h-4 w-4" />}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              required
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Tạo tài khoản {role === 'student' ? 'Học viên' : 'Giảng viên'}
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <span className="text-blue-600">Điều khoản dịch vụ</span> của chúng tôi
          </p>
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
