import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return formatDate(dateString);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// SM-2 Spaced Repetition Algorithm
export function calculateNextReview(
  difficulty: 'easy' | 'medium' | 'hard',
  currentInterval: number,
  currentEaseFactor: number
): { nextInterval: number; newEaseFactor: number } {
  let quality: number;
  switch (difficulty) {
    case 'easy': quality = 5; break;
    case 'medium': quality = 3; break;
    case 'hard': quality = 1; break;
  }

  const newEaseFactor = Math.max(
    1.3,
    currentEaseFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  let nextInterval: number;
  if (quality < 3) {
    nextInterval = 1;
  } else if (currentInterval === 0) {
    nextInterval = 1;
  } else if (currentInterval === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(currentInterval * newEaseFactor);
  }

  return { nextInterval, newEaseFactor };
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };
  return labels[level] || level;
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };
  return colors[level] || 'bg-gray-100 text-gray-700';
}

/**
 * Chuyển bất kỳ dạng link YouTube nào sang embed URL.
 * Hỗ trợ:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID  (giữ nguyên)
 *   https://youtube.com/shorts/ID
 * Trả về null nếu không phải link YouTube.
 */
export function toYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('?')[0];
    }
    // youtube.com/watch?v=ID
    else if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
      videoId = u.searchParams.get('v');
    }
    // youtube.com/embed/ID  (đã là embed)
    else if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
      return url; // đã đúng rồi
    }
    // youtube.com/shorts/ID
    else if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/shorts/')) {
      videoId = u.pathname.replace('/shorts/', '').split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  } catch {
    return null;
  }
}
