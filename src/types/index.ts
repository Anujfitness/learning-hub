export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
  bio?: string;
  isBanned?: boolean;
  createdAt: string;
  playlistCount?: number;
}

export interface Video {
  id: string;
  playlistId: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  description: string;
  duration: string;
  order: number;
  notesUrl?: string;
  createdAt: string;
  completed?: boolean;
}

export interface Playlist {
  id: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  tags: string[];
  thumbnailUrl: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  videoCount?: number;
  favoritesCount?: number;
  isFavorite?: boolean;
  completedCount?: number;
  progressPercentage?: number;
  isOwner?: boolean;
  isCompleted?: boolean;
}

export interface Report {
  id: string;
  playlistId: string;
  playlistTitle: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPlaylists: number;
  totalVideos: number;
  totalReports: number;
  pendingReports: number;
}

export interface DashboardData {
  myPlaylists: Playlist[];
  savedPlaylists: Playlist[];
  inProgressPlaylists: Playlist[];
  stats: {
    createdPlaylistsCount: number;
    savedPlaylistsCount: number;
    inProgressCount: number;
    completedPlaylistsCount: number;
    totalVideosCompleted: number;
  };
}
