import { User, Playlist, Video, DashboardData, AdminStats, Report } from '../types';

const TOKEN_KEY = 'study_playlist_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; role?: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getCurrentUser: () =>
    request<{ user: User }>('/auth/me'),

  updateProfile: (body: { name?: string; bio?: string; avatar?: string }) =>
    request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Playlists
  getCategories: () =>
    request<{ categories: { name: string; count: number }[] }>('/playlists/categories'),

  getPlaylists: (params?: { category?: string; search?: string; level?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.level) query.set('level', params.level);
    if (params?.sort) query.set('sort', params.sort);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ playlists: Playlist[] }>(`/playlists${queryString}`);
  },

  getPlaylistById: (id: string) =>
    request<{ playlist: Playlist; videos: Video[] }>(`/playlists/${id}`),

  createPlaylist: (body: {
    title: string;
    description: string;
    category: string;
    level: string;
    tags?: string[] | string;
    thumbnailUrl?: string;
  }) =>
    request<{ message: string; playlist: Playlist }>('/playlists', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updatePlaylist: (id: string, body: Partial<Playlist>) =>
    request<{ message: string; playlist: Playlist }>(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deletePlaylist: (id: string) =>
    request<{ message: string }>(`/playlists/${id}`, {
      method: 'DELETE',
    }),

  // Videos
  addVideo: (playlistId: string, body: {
    title: string;
    youtubeUrl: string;
    description?: string;
    duration?: string;
    notesUrl?: string;
  }) =>
    request<{ message: string; video: Video }>(`/playlists/${playlistId}/videos`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateVideo: (playlistId: string, videoId: string, body: Partial<Video>) =>
    request<{ message: string; video: Video }>(`/playlists/${playlistId}/videos/${videoId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteVideo: (playlistId: string, videoId: string) =>
    request<{ message: string }>(`/playlists/${playlistId}/videos/${videoId}`, {
      method: 'DELETE',
    }),

  // Favorites
  toggleFavorite: (playlistId: string) =>
    request<{ message: string; isFavorite: boolean; favoritesCount: number }>(`/playlists/${playlistId}/favorite`, {
      method: 'POST',
    }),

  // Learning Progress
  toggleVideoProgress: (playlistId: string, videoId: string, completed?: boolean) =>
    request<{
      message: string;
      completed: boolean;
      completedCount: number;
      totalCount: number;
      progressPercentage: number;
    }>(`/playlists/${playlistId}/videos/${videoId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    }),

  // Report Playlist
  reportPlaylist: (playlistId: string, body: { reason: string; details?: string }) =>
    request<{ message: string; reportId: string }>(`/playlists/${playlistId}/report`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // User Dashboard
  getDashboard: () =>
    request<DashboardData>('/user/dashboard'),

  // Admin
  getAdminStats: () =>
    request<{ stats: AdminStats }>('/admin/stats'),

  getAdminReports: () =>
    request<{ reports: Report[] }>('/admin/reports'),

  updateAdminReport: (id: string, status: 'pending' | 'resolved' | 'dismissed') =>
    request<{ message: string }>(`/admin/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteAdminReport: (id: string) =>
    request<{ message: string }>(`/admin/reports/${id}`, {
      method: 'DELETE',
    }),

  getAdminUsers: () =>
    request<{ users: User[] }>('/admin/users'),

  updateUserRole: (id: string, role: 'admin' | 'user') =>
    request<{ message: string; user: User }>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  updateUserBan: (id: string, isBanned: boolean) =>
    request<{ message: string; user: User }>(`/admin/users/${id}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ isBanned }),
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  adminDeletePlaylist: (id: string) =>
    request<{ message: string }>(`/admin/playlists/${id}`, {
      method: 'DELETE',
    }),
};
