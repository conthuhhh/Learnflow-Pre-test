import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, Clock, Users, Play, CheckCircle,
  Lock, ArrowLeft, BarChart2
} from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import { getLevelLabel, getLevelColor } from '@/lib/utils';
import type { Course, Lesson } from '@/types';

const COURSE_THUMBNAILS: Record<string, string> = {
  'Lập trình': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=400&fit=crop',
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    fetchCourseById, fetchLessons, enrollCourse, unenrollCourse,
    isEnrolled, fetchEnrollments, fetchLessonProgress,
    lessonProgress, getCourseProgress
  } = useCourseStore();
  const { toast } = useUIStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const enrolled = id ? isEnrolled(id) : false;
  const progress = id ? getCourseProgress(id, lessons.length) : 0;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsPageLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        fetchCourseById(id),
        fetchLessons(id),
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      setIsPageLoading(false);

      if (user) {
        await fetchEnrollments(user.id);
        await fetchLessonProgress(user.id, id);
      }
    })();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!id) return;

    setEnrolling(true);
    try {
      if (enrolled) {
        await unenrollCourse(user.id, id);
        toast.info('Đã hủy đăng ký khóa học');
      } else {
        await enrollCourse(user.id, id);
        toast.success('Đăng ký khóa học thành công!');
      }
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setEnrolling(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Không tìm thấy khóa học</h2>
        <Link to="/courses" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  const thumbnail = course.thumbnail_url ||
    COURSE_THUMBNAILS[course.category] ||
    COURSE_THUMBNAILS.default;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
        <ArrowLeft className="h-4 w-4" /> Tất cả khóa học
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Thumbnail */}
          <div className="rounded-2xl overflow-hidden mb-6">
            <img src={thumbnail} alt={course.title} className="w-full object-cover max-h-64" />
          </div>

          {/* Title & Info */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm text-blue-600 font-medium">{course.category}</span>
              <Badge className={getLevelColor(course.level)}>
                {getLevelLabel(course.level)}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">{course.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {lessons.length} bài học
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {lessons.reduce((sum, l) => sum + l.duration_minutes, 0)} phút
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {Math.floor(Math.random() * 100 + 30)} học viên
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mô tả khóa học</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>

          {/* Lessons */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nội dung khóa học ({lessons.length} bài)
            </h2>
            <div className="space-y-2">
              {lessons.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4">Chưa có bài học nào</p>
              ) : (
                lessons.map((lesson, index) => {
                  const completed = lessonProgress.some(
                    (p) => p.lesson_id === lesson.id && p.completed
                  );
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : enrolled ? (
                          <Play className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration_minutes} phút</p>
                      </div>
                      {enrolled && (
                        <Link to={`/courses/${course.id}/learn?lesson=${lesson.id}`}>
                          <Button size="sm" variant="ghost">
                            <Play className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              {enrolled && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tiến độ</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                  <Progress value={progress} color="blue" />
                </div>
              )}

              {enrolled ? (
                <Link to={`/courses/${course.id}/learn`}>
                  <Button className="w-full mb-3" size="lg">
                    <Play className="h-4 w-4" />
                    {progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={handleEnroll}
                  isLoading={enrolling}
                >
                  Đăng ký miễn phí
                </Button>
              )}

              {enrolled && (
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleEnroll}
                  isLoading={enrolling}
                >
                  Hủy đăng ký
                </Button>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Khóa học bao gồm:</h3>
                {[
                  { icon: BookOpen, text: `${lessons.length} bài học` },
                  { icon: Clock, text: `${lessons.reduce((s, l) => s + l.duration_minutes, 0)} phút học` },
                  { icon: BarChart2, text: getLevelLabel(course.level) },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {text}
                  </div>
                ))}
              </div>

              {course.instructor && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Giảng viên</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {(course.instructor as { full_name?: string }).full_name?.[0] || 'G'}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {(course.instructor as { full_name?: string }).full_name || 'Giảng viên'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
