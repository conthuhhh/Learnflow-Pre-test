# 🎓 LearnFlow — Mini LMS + Flashcard + Quiz Platform

> Nền tảng học tập tích hợp: quản lý khóa học, flashcard với Spaced Repetition, và hệ thống quiz kiểm tra kiến thức.

---

## 🌐 Demo

> Deploy link sẽ được cập nhật sau khi deploy lên Vercel

---

## ✨ Tính năng chính

### 🔐 Authentication & Phân quyền
- Đăng ký / Đăng nhập qua Supabase Auth
- **2 role**: `student` (học viên) và `instructor` (giảng viên)
- Protected routes theo role — RLS bảo vệ tại tầng database
- Validate form: họ tên không chứa số, email đúng định dạng, password strength meter

### 🏫 LMS Mini (Khóa học)
- Duyệt & tìm kiếm khóa học theo danh mục, cấp độ, từ khóa
- Xem chi tiết khóa học với danh sách bài học
- Đăng ký / hủy đăng ký khóa học (chỉ student)
- Học bài với sidebar điều hướng, theo dõi tiến độ từng bài
- Nhúng video YouTube tự động (hỗ trợ mọi dạng link)
- Đánh dấu hoàn thành từng bài, progress bar tổng khóa học

### 📋 Quản lý khóa học (Instructor)
- Tạo / sửa / xóa khóa học (tiêu đề, mô tả, danh mục, cấp độ, trạng thái)
- Tạo / sửa / xóa bài học (nội dung văn bản + video URL)
- Xuất bản / để nháp khóa học

### 🧠 Flashcard
- Tạo bộ thẻ với danh mục, mô tả, chế độ công khai/riêng tư
- Thêm / sửa / xóa thẻ (mặt trước / mặt sau)
- Flip animation 3D khi click thẻ
- Tab **Cộng đồng** — xem bộ thẻ public từ người dùng khác
- Ôn tập với thuật toán **SM-2 Spaced Repetition**:
  - 3 mức đánh giá: Dễ / Trung bình / Khó
  - Tự động tính ngày ôn tiếp theo
  - Màn hình kết quả với thống kê sau mỗi phiên

### � Quiz
- Instructor tạo quiz cho từng khóa học (tiêu đề, thời gian giới hạn, điểm qua)
- Thêm câu hỏi không giới hạn số lượng, mỗi câu có 4 đáp án
- Click chọn đáp án đúng (highlight màu xanh), thêm giải thích tùy chọn
- Student làm bài: chọn đáp án, nhảy tự do giữa câu, countdown timer
- Nộp bài tự động khi hết giờ
- Màn hình kết quả: điểm %, pass/fail, xem lại từng câu với giải thích
- Lưu lịch sử làm bài, hiển thị điểm cao nhất

### 📊 Dashboard
- **Student**: thống kê khóa học đang học, bộ flashcard, thẻ cần ôn hôm nay, khóa học hoàn thành
- **Instructor**: thống kê khóa học đã tạo, số bài học, trạng thái xuất bản

### 👤 Hồ sơ & Cài đặt
- Cập nhật họ tên
- **Dark mode** — toggle 🌙/☀️, lưu preference vào localStorage

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand + persist middleware |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Deploy | Vercel |

---

## 📁 Cấu trúc Project

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Navigation + dark toggle + role badge
│   │   ├── MainLayout.tsx      # Wrapper chính
│   │   ├── ProtectedRoute.tsx  # Redirect nếu chưa đăng nhập
│   │   └── RoleGuard.tsx       # Bảo vệ route theo role
│   └── ui/
│       ├── Button.tsx          # 5 variants, loading state
│       ├── Input.tsx           # Label, error, icon trái/phải
│       ├── Textarea.tsx
│       ├── Select.tsx
│       ├── Card.tsx            # Card, CardHeader, CardContent, CardFooter
│       ├── Modal.tsx           # Accessible dialog, keyboard close
│       ├── Badge.tsx           # 6 color variants
│       ├── Progress.tsx        # Progress bar + label
│       ├── Spinner.tsx         # Loading spinner + LoadingScreen
│       └── Toast.tsx           # Toast notifications (success/error/info/warning)
│
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── utils.ts                # Helpers: cn(), formatDate(), SM-2, toYouTubeEmbedUrl()
│   └── database.sql            # Schema đầy đủ cho Supabase
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx    # Role selection, password strength
│   ├── courses/
│   │   ├── CoursesPage.tsx     # Danh sách + filter + search
│   │   ├── CourseDetailPage.tsx
│   │   ├── CourseLearnPage.tsx # Player với sidebar bài học
│   │   ├── CourseManagePage.tsx# CRUD khóa học (instructor)
│   │   └── LessonManagePage.tsx# CRUD bài học (instructor)
│   ├── flashcards/
│   │   ├── FlashcardsPage.tsx  # Danh sách deck + tab cộng đồng
│   │   ├── DeckDetailPage.tsx  # Grid thẻ + flip animation
│   │   └── StudyPage.tsx       # Phiên ôn tập SM-2
│   ├── quiz/
│   │   ├── QuizManagePage.tsx  # CRUD quiz + câu hỏi (instructor)
│   │   └── QuizPage.tsx        # Làm bài + kết quả (student)
│   ├── DashboardPage.tsx       # Dashboard theo role
│   ├── HomePage.tsx            # Landing page
│   └── ProfilePage.tsx
│
├── store/
│   ├── authStore.ts            # Auth state, signIn/signUp, role helpers
│   ├── courseStore.ts          # Courses, lessons, enrollments, progress
│   ├── flashcardStore.ts       # Decks, cards, reviews (SM-2)
│   ├── quizStore.ts            # Quizzes, questions, attempts
│   ├── themeStore.ts           # Dark/light mode
│   └── uiStore.ts              # Toast notifications
│
├── types/
│   └── index.ts                # TypeScript interfaces: User, Course, Lesson,
│                               # Enrollment, FlashcardDeck, Flashcard, CardReview,
│                               # Quiz, QuizQuestion, QuizAttempt, Toast...
│
├── App.tsx                     # Routes với ProtectedRoute + RoleGuard
└── main.tsx                    # Entry point, theme init
```

---

## 🗄 Database Schema

```
auth.users (Supabase built-in)
    │
    └── profiles (id, full_name, avatar_url, role)
            │
            ├── courses (title, description, category, level, status, instructor_id)
            │       │
            │       ├── lessons (title, content, video_url, order_index, duration_minutes)
            │       │       │
            │       │       └── lesson_progress (user_id, completed, completed_at)
            │       │
            │       ├── enrollments (user_id, enrolled_at)
            │       │
            │       └── quizzes (title, time_limit_minutes, pass_score)
            │               │
            │               ├── quiz_questions (question, options JSONB, correct_index, explanation)
            │               │
            │               └── quiz_attempts (user_id, answers JSONB, score, passed)
            │
            └── flashcard_decks (title, category, is_public)
                    │
                    └── flashcards (front, back, order_index)
                            │
                            └── card_reviews (difficulty, next_review_at, interval_days, ease_factor)
```

Tất cả bảng đều có **Row Level Security (RLS)** — bảo vệ data tại tầng database.

---

## 🔐 Phân quyền theo Role

| Tính năng | Student | Instructor |
|-----------|---------|-----------|
| Xem khóa học | ✅ | ✅ |
| Đăng ký khóa học | ✅ | ❌ |
| Học bài, làm quiz | ✅ | ❌ |
| Tạo/sửa khóa học | ❌ | ✅ |
| Quản lý bài học | ❌ | ✅ |
| Tạo/sửa quiz | ❌ | ✅ |
| Flashcard | ✅ | ✅ |
| Dashboard | Học tập | Giảng dạy |

---

## 🚀 Cài đặt & Chạy

### 1. Clone và cài dependencies

```bash
git clone https://github.com/your-username/learnflow.git
cd learnflow
npm install
```

### 2. Tạo Supabase project

1. Vào [supabase.com](https://supabase.com) → tạo project mới
2. Vào **SQL Editor** → **New query**
3. Copy nội dung `src/lib/database.sql` → paste → **Run**
4. Vào **Settings → API** → copy **Project URL** và **anon key**

### 3. Cấu hình biến môi trường

```bash
cp .env.example .env
```

Điền vào `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Chạy dev server

```bash
npm run dev
```

Mở `http://localhost:5173`

---

## 🏗 Build & Deploy

### Build production

```bash
npm run build
```

### Deploy lên Vercel

**Cách 1 — Qua GitHub (khuyến nghị):**
1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → Import repo
3. Thêm 2 Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

**Cách 2 — Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

**Sau khi deploy**, cập nhật Supabase:
- **Authentication → URL Configuration → Site URL**: URL Vercel của bạn
- **Redirect URLs**: thêm `https://your-app.vercel.app/**`

---

## 🧮 Thuật toán SM-2 (Spaced Repetition)

Flashcard dùng thuật toán **SuperMemo 2** để tối ưu lịch ôn tập:

```
Đánh giá "Dễ"       → interval × ease_factor (tăng dần)
Đánh giá "Trung bình" → interval × ease_factor (tăng nhẹ)
Đánh giá "Khó"      → reset về 1 ngày
```

| Field | Ý nghĩa |
|-------|---------|
| `interval_days` | Số ngày đến lần ôn kế tiếp |
| `ease_factor` | Hệ số nhân, khởi đầu 2.5 |
| `next_review_at` | Timestamp ôn tập tiếp theo |
| `review_count` | Tổng số lần đã ôn |

---

## � Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `VITE_SUPABASE_URL` | ✅ | URL của Supabase project |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Anonymous/public key |

---

## 📋 Routes

| Route | Quyền truy cập | Mô tả |
|-------|---------------|-------|
| `/` | Public | Landing page |
| `/auth/login` | Public | Đăng nhập |
| `/auth/register` | Public | Đăng ký (chọn role) |
| `/courses` | Public | Danh sách khóa học |
| `/courses/:id` | Public | Chi tiết khóa học |
| `/dashboard` | Đăng nhập | Dashboard (theo role) |
| `/profile` | Đăng nhập | Hồ sơ cá nhân |
| `/flashcards` | Đăng nhập | Bộ flashcard |
| `/flashcards/:id` | Đăng nhập | Chi tiết bộ thẻ |
| `/flashcards/:id/study` | Đăng nhập | Phiên ôn tập |
| `/courses/:id/learn` | **Student** | Học bài |
| `/courses/:courseId/quiz/:quizId` | **Student** | Làm quiz |
| `/courses/manage` | **Instructor** | Quản lý khóa học |
| `/courses/:id/lessons` | **Instructor** | Quản lý bài học |
| `/courses/:id/quizzes` | **Instructor** | Quản lý quiz |

---

## 👥 Tác giả


**Tech Stack:** React · TypeScript · Tailwind CSS · Zustand · Supabase
