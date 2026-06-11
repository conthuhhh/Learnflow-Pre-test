import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, BookOpen, ClipboardList } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { getLevelLabel, getLevelColor } from '@/lib/utils';
import type { Course } from '@/types';

const CATEGORIES = [
  'Lập trình', 'Tiếng Anh', 'Toán học', 'Khoa học', 'Thiết kế', 'Kinh doanh', 'Chung'
].map((c) => ({ value: c, label: c }));

const LEVELS = [
  { value: 'beginner', label: 'Cơ bản' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
];

const STATUSES = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Xuất bản' },
];

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  thumbnail_url: string;
}

const defaultForm: CourseFormData = {
  title: '',
  description: '',
  category: 'Chung',
  level: 'beginner',
  status: 'draft',
  thumbnail_url: '',
};

export function CourseManagePage() {
  const { user } = useAuthStore();
  const { myCourses, fetchMyCourses, createCourse, updateCourse, deleteCourse, isLoading } = useCourseStore();
  const { toast } = useUIStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchMyCourses(user.id);
  }, [user]);

  const openCreate = () => {
    setEditingCourse(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      status: course.status,
      thumbnail_url: course.thumbnail_url || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khóa học');
      return;
    }
    setSaving(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          ...form,
          thumbnail_url: form.thumbnail_url || null,
        } as Partial<Course>);
        toast.success('Cập nhật khóa học thành công!');
      } else {
        await createCourse({
          ...form,
          thumbnail_url: form.thumbnail_url || null,
          instructor_id: user.id,
          level: form.level as Course['level'],
          status: form.status as Course['status'],
        });
        toast.success('Tạo khóa học thành công!');
      }
      setShowModal(false);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này? Hành động này không thể hoàn tác.')) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      toast.success('Đã xóa khóa học');
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý khóa học</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{myCourses.length} khóa học của bạn</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tạo khóa học mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : myCourses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa có khóa học nào</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">Bắt đầu tạo khóa học đầu tiên của bạn</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4" /> Tạo ngay</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                      <Badge variant={course.status === 'published' ? 'success' : 'default'}>
                        {course.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span>{course.category}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getLevelColor(course.level)}`}>
                        {getLevelLabel(course.level)}
                      </span>
                      <span>{course.lessons_count || 0} bài học</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/courses/${course.id}`}>
                      <Button variant="ghost" size="sm" aria-label="Xem">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/courses/${course.id}/lessons`}>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Bài học</span>
                      </Button>
                    </Link>
                    <Link to={`/courses/${course.id}/quizzes`}>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="h-4 w-4" />
                        <span className="hidden sm:inline">Quiz</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(course.id)}
                      isLoading={deletingId === course.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Sửa khóa học' : 'Tạo khóa học mới'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nhập tiêu đề khóa học"
            required
          />
          <Textarea
            label="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả nội dung khóa học..."
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Danh mục"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={CATEGORIES}
            />
            <Select
              label="Cấp độ"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              options={LEVELS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={STATUSES}
            />
            <Input
              label="URL Thumbnail (tùy chọn)"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
