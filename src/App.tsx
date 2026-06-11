import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { LoadingScreen } from '@/components/ui/Spinner';
import { ToastContainer } from '@/components/ui/Toast';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CoursesPage } from '@/pages/courses/CoursesPage';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { CourseLearnPage } from '@/pages/courses/CourseLearnPage';
import { CourseManagePage } from '@/pages/courses/CourseManagePage';
import { LessonManagePage } from '@/pages/courses/LessonManagePage';
import { FlashcardsPage } from '@/pages/flashcards/FlashcardsPage';
import { DeckDetailPage } from '@/pages/flashcards/DeckDetailPage';
import { StudyPage } from '@/pages/flashcards/StudyPage';
import { QuizManagePage } from '@/pages/quiz/QuizManagePage';
import { QuizPage } from '@/pages/quiz/QuizPage';

function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/courses" element={<MainLayout><CoursesPage /></MainLayout>} />
        <Route path="/courses/:id" element={<MainLayout><CourseDetailPage /></MainLayout>} />

        {/* ── Any authenticated user ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>
        } />
        <Route path="/flashcards" element={
          <ProtectedRoute><MainLayout><FlashcardsPage /></MainLayout></ProtectedRoute>
        } />
        <Route path="/flashcards/:id" element={
          <ProtectedRoute><MainLayout><DeckDetailPage /></MainLayout></ProtectedRoute>
        } />
        <Route path="/flashcards/:id/study" element={
          <ProtectedRoute><StudyPage /></ProtectedRoute>
        } />

        {/* ── Student only ── */}
        <Route path="/courses/:id/learn" element={
          <ProtectedRoute>
            <RoleGuard role="student" redirectTo="/courses">
              <MainLayout><CourseLearnPage /></MainLayout>
            </RoleGuard>
          </ProtectedRoute>
        } />

        {/* ── Instructor only ── */}
        <Route path="/courses/manage" element={
          <ProtectedRoute>
            <RoleGuard role="instructor" redirectTo="/courses">
              <MainLayout><CourseManagePage /></MainLayout>
            </RoleGuard>
          </ProtectedRoute>
        } />
        <Route path="/courses/:id/lessons" element={
          <ProtectedRoute>
            <RoleGuard role="instructor" redirectTo="/courses">
              <MainLayout><LessonManagePage /></MainLayout>
            </RoleGuard>
          </ProtectedRoute>
        } />
        <Route path="/courses/:id/quizzes" element={
          <ProtectedRoute>
            <RoleGuard role="instructor" redirectTo="/courses">
              <MainLayout><QuizManagePage /></MainLayout>
            </RoleGuard>
          </ProtectedRoute>
        } />

        {/* ── Student: take quiz ── */}
        <Route path="/courses/:courseId/quiz/:quizId" element={
          <ProtectedRoute>
            <RoleGuard role="student" redirectTo="/courses">
              <QuizPage />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
