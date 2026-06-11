import { Link } from 'react-router-dom';
import {
  BookOpen, Brain, BarChart2, Users, ArrowRight,
  CheckCircle, Zap, Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const features = [
  {
    icon: BookOpen,
    title: 'Khóa học đa dạng',
    description: 'Truy cập hàng trăm khóa học từ các lĩnh vực khác nhau, từ lập trình đến ngoại ngữ.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Brain,
    title: 'Flashcard thông minh',
    description: 'Học với thuật toán spaced repetition SM-2, tối ưu thời gian ghi nhớ của bạn.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: BarChart2,
    title: 'Theo dõi tiến độ',
    description: 'Dashboard trực quan giúp bạn thấy rõ tiến trình học tập từng ngày.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Users,
    title: 'Cộng đồng học tập',
    description: 'Chia sẻ bộ flashcard với cộng đồng và học cùng nhau.',
    color: 'bg-orange-100 text-orange-600',
  },
];

const stats = [
  { value: '500+', label: 'Khóa học' },
  { value: '10K+', label: 'Học viên' },
  { value: '50K+', label: 'Flashcard' },
  { value: '98%', label: 'Hài lòng' },
];

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>Nền tảng học tập thế hệ mới</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Học thông minh hơn với{' '}
              <span className="text-yellow-300">LearnFlow</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Kết hợp LMS mini và Flashcard với thuật toán spaced repetition,
              giúp bạn tiếp thu kiến thức hiệu quả và ghi nhớ lâu hơn.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
                    Vào Dashboard <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth/register">
                    <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
                      Bắt đầu miễn phí <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Xem khóa học
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-blue-200 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tại sao chọn LearnFlow?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Tất cả công cụ bạn cần để học tập hiệu quả
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-md transition-all group">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bắt đầu chỉ trong 3 bước</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Tạo tài khoản', desc: 'Đăng ký miễn phí và thiết lập hồ sơ học tập của bạn.' },
              { step: '02', title: 'Chọn khóa học', desc: 'Duyệt qua các khóa học và đăng ký học theo chủ đề yêu thích.' },
              { step: '03', title: 'Học với Flashcard', desc: 'Tạo và ôn tập flashcard để củng cố kiến thức.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Học viên nói gì?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Minh Tuấn', role: 'Sinh viên CNTT', text: 'LearnFlow giúp mình ôn thi rất hiệu quả. Flashcard với spaced repetition thực sự tuyệt vời!', stars: 5 },
              { name: 'Thu Hương', role: 'Giáo viên Tiếng Anh', text: 'Tôi dùng LearnFlow để tạo bài giảng và bộ flashcard cho học sinh. Rất dễ sử dụng.', stars: 5 },
              { name: 'Văn Đức', role: 'Lập trình viên', text: 'Platform sạch sẽ, giao diện đẹp. Tôi học thêm kỹ năng mới mà không mất nhiều thời gian.', stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm dark:bg-gray-800/50">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu chưa?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Tham gia hàng nghìn học viên đang học tập hiệu quả mỗi ngày
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {[
                'Miễn phí hoàn toàn',
                'Không cần thẻ tín dụng',
                'Bắt đầu ngay hôm nay',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-blue-100">
                  <CheckCircle className="h-4 w-4 text-green-300 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/auth/register" className="inline-block mt-8">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg px-8">
                Đăng ký ngay — Miễn phí <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">LF</span>
            </div>
            <span className="text-white font-semibold">LearnFlow</span>
          </div>
          <p className="text-sm">© 2024 LearnFlow. Nền tảng học tập thông minh.</p>
        </div>
      </footer>
    </div>
  );
}
