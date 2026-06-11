import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, GripVertical, ArrowLeft, Save } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Course, Lesson } from '@/types';

interface LessonForm {
  title: string;
  content: string;
  video_url: string;
  duration_minutes: number;
}

const defaultForm: LessonForm = {
  title: '',
  content: '',
  video_url: '',
  duration_minutes: 15,
};

export function LessonManagePage() {
  const { id } = useParams<{ id: string }>();
  const { fetchCourseById, fetchLessons, createLesson, updateLesson, deleteLesson } = useCourseStore();
  const { toast } = useUIStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState<LessonForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadLessons = async () => {
    if (!id) return;
    const data = await fetchLessons(id);
    setLessons(data);
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      const [courseData] = await Promise.all([fetchCourseById(id), loadLessons()]);
      setCourse(courseData);
      setIsLoading(false);
    })();
  }, [id]);

  const openCreate = () => {
    setEditingLesson(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      content: lesson.content,
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!id || !form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }
    setSaving(true);
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, {
          ...form,
          video_url: form.video_url || null,
        });
        toast.success('Cập nhật bài học thành công!');
      } else {
        await createLesson({
          course_id: id,
          title: form.title,
          content: form.content,
          video_url: form.video_url || null,
          duration_minutes: form.duration_minutes,
          order_index: lessons.length,
        });
        toast.success('Thêm bài học thành công!');
      }
      await loadLessons();
      setShowModal(false);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
      await deleteLesson(lessonId);
      await loadLessons();
      toast.success('Đã xóa bài học');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/courses/manage"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Quản lý khóa học
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course?.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{lessons.length} bài học</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm bài học
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có bài học nào trong khóa học này</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4" /> Thêm bài học đầu tiên</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-gray-300 dark:text-gray-600 shrink-0" />
                  <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {lesson.duration_minutes} phút
                      {lesson.video_url && ' • Có video'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(lesson)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(lesson.id)}
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Tiêu đề bài học"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nhập tiêu đề"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Thời lượng (phút)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 10 })}
              min={1}
            />
            <Input
              label="URL Video (tùy chọn)"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              helperText="Hỗ trợ: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..."
            />
          </div>
          <Textarea
            label="Nội dung bài học"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Nhập nội dung bài học (hỗ trợ văn bản)..."
            rows={8}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} isLoading={saving}>
              <Save className="h-4 w-4" />
              {editingLesson ? 'Cập nhật' : 'Thêm bài học'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
