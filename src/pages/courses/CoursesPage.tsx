import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Users, Plus } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getLevelLabel, getLevelColor, truncate } from '@/lib/utils';

const CATEGORIES = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'Lập trình', label: 'Lập trình' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Toán học', label: 'Toán học' },
  { value: 'Khoa học', label: 'Khoa học' },
  { value: 'Thiết kế', label: 'Thiết kế' },
  { value: 'Kinh doanh', label: 'Kinh doanh' },
  { value: 'Chung', label: 'Chung' },
];

const LEVELS = [
  { value: '', label: 'Tất cả cấp độ' },
  { value: 'beginner', label: 'Cơ bản' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
];

const COURSE_THUMBNAILS: Record<string, string> = {
  'Lập trình': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
  'Tiếng Anh': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=200&fit=crop',
  'Toán học': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=200&fit=crop',
  'Khoa học': 'https://images.unsplash.com/photo-1532094349884-543559c79c7b?w=400&h=200&fit=crop',
  'Thiết kế': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop',
  'Kinh doanh': 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=400&h=200&fit=crop',
  default: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=200&fit=crop',
};

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const { courses, fetchCourses, isLoading } = useCourseStore();
  const { user, isInstructor } = useAuthStore();

  const loadCourses = useCallback(() => {
    fetchCourses({
      search: search || undefined,
      category: category || undefined,
      level: level || undefined,
    });
  }, [search, category, level, fetchCourses]);

  useEffect(() => {
    const timer = setTimeout(loadCourses, 300);
    return () => clearTimeout(timer);
  }, [loadCourses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Khóa học</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{courses.length} khóa học có sẵn</p>
        </div>
        {user && isInstructor() && (
          <Link to="/courses/manage">
            <Button>
              <Plus className="h-4 w-4" /> Tạo khóa học
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
            className="min-w-[160px]"
          />
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={LEVELS}
            className="min-w-[150px]"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Không tìm thấy khóa học</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: import('@/types').Course }) {
  const thumbnail = course.thumbnail_url ||
    COURSE_THUMBNAILS[course.category] ||
    COURSE_THUMBNAILS.default;

  return (
    <Link to={`/courses/${course.id}`}>
      <Card hover className="overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = COURSE_THUMBNAILS.default;
            }}
          />
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{course.category}</span>
            <Badge className={getLevelColor(course.level)}>
              {getLevelLabel(course.level)}
            </Badge>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 leading-snug flex-1">
            {truncate(course.title, 60)}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {truncate(course.description, 80)}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessons_count || 0} bài
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {(course.enrolled_count || 0) + Math.floor(Math.random() * 50 + 10)} học viên
            </span>
          </div>

          {course.instructor && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {(course.instructor as { full_name?: string }).full_name?.[0] || 'G'}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {(course.instructor as { full_name?: string }).full_name || 'Giảng viên'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
