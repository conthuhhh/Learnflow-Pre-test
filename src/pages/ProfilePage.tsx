import { useState } from 'react';
import { User, Mail, Save, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useUIStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName });
      toast.success('Cập nhật hồ sơ thành công!');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hồ sơ cá nhân</h1>

      <Card>
        <CardHeader>
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {initials}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Thay đổi ảnh đại diện"
              >
                <Camera className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user.full_name || 'Người dùng'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Tham gia từ {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            placeholder="Nhập họ và tên"
          />
          <Input
            label="Email"
            value={user.email}
            leftIcon={<Mail className="h-4 w-4" />}
            disabled
            helperText="Email không thể thay đổi"
          />
          <div className="pt-2">
            <Button onClick={handleSave} isLoading={saving}>
              <Save className="h-4 w-4" /> Lưu thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Thông tin tài khoản</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">ID tài khoản</span>
              <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">{user.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Ngày tạo</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(user.created_at)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 dark:text-gray-400">Trạng thái</span>
              <span className="text-green-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Đang hoạt động
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
