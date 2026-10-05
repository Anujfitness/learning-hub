import React, { useState, useEffect } from 'react';
import { DashboardData, Playlist } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PlaylistCard } from '../components/PlaylistCard';
import {
  LayoutDashboard,
  Bookmark,
  TrendingUp,
  PlusCircle,
  Video,
  CheckCircle2,
  FolderOpen,
  Award,
  Sparkles,
  User,
  Shield,
  Clock,
} from 'lucide-react';

interface DashboardPageProps {
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreatePlaylist: () => void;
  onEditPlaylist: (playlist: Playlist) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onEditPlaylist,
}) => {
  const { user, openLogin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'saved' | 'progress'>('my');

  const loadDashboard = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const handleDeletePlaylist = async (id: string) => {
    try {
      await api.deletePlaylist(id);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to delete playlist');
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 inline-block">
          <LayoutDashboard className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Protected User Dashboard</h2>
        <p className="text-sm text-zinc-500">
          Please sign in to access your personal study playlists, bookmarks, and progress records.
        </p>
        <button
          onClick={openLogin}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition"
        >
          Sign In to Dashboard
        </button>
      </div>
    );
  }

  const stats = data?.stats || {
    createdPlaylistsCount: 0,
    savedPlaylistsCount: 0,
    inProgressCount: 0,
    completedPlaylistsCount: 0,
    totalVideosCompleted: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {user.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
            {user.bio && (
              <p className="text-xs text-zinc-600 dark:text-zinc-300 pt-1 italic">{user.bio}</p>
            )}
          </div>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition self-start md:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Playlist</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              {stats.createdPlaylistsCount}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Created Playlists</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              {stats.savedPlaylistsCount}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Saved Playlists</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              {stats.inProgressCount}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Paths in Progress</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              {stats.totalVideosCompleted}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Lessons Completed</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('my')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
              activeTab === 'my'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>My Playlists ({data?.myPlaylists.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Playlists ({data?.savedPlaylists.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
              activeTab === 'progress'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Learning Progress ({data?.inProgressPlaylists.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: My Playlists */}
        {activeTab === 'my' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : data?.myPlaylists.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
                <FolderOpen className="h-8 w-8 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">You haven't created any playlists yet</h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                  Build custom educational playlists by organizing YouTube videos with titles, descriptions, and notes.
                </p>
                <button
                  onClick={onOpenCreatePlaylist}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.myPlaylists.map(playlist => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => onSelectPlaylist(playlist.id)}
                    onEdit={onEditPlaylist}
                    onDelete={handleDeletePlaylist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Playlists */}
        {activeTab === 'saved' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : data?.savedPlaylists.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
                <Bookmark className="h-8 w-8 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">No saved playlists</h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                  Click the heart icon on any playlist in Explore or Home to bookmark it for quick access.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.savedPlaylists.map(playlist => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => onSelectPlaylist(playlist.id)}
                    onFavoriteChange={loadDashboard}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Learning Progress */}
        {activeTab === 'progress' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : data?.inProgressPlaylists.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
                <TrendingUp className="h-8 w-8 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">No active learning progress</h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                  When you mark lessons as completed in any playlist, your progress will show up right here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.inProgressPlaylists.map(playlist => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => onSelectPlaylist(playlist.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
