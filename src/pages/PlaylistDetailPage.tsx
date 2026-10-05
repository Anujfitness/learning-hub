import React, { useState, useEffect } from 'react';
import { Playlist, Video } from '../types';
import { api } from '../lib/api';
import { VideoPlayerView } from '../components/VideoPlayerView';
import { VideoFormModal } from '../components/VideoFormModal';
import { PlaylistFormModal } from '../components/PlaylistFormModal';
import { ReportModal } from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Heart,
  Share2,
  Flag,
  PlusCircle,
  Edit2,
  Trash2,
  Play,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  Video as VideoIcon,
  Sparkles,
  Trophy,
  Check,
} from 'lucide-react';

interface PlaylistDetailPageProps {
  playlistId: string;
  onBack: () => void;
  onPlaylistDeleted?: () => void;
}

export const PlaylistDetailPage: React.FC<PlaylistDetailPageProps> = ({
  playlistId,
  onBack,
  onPlaylistDeleted,
}) => {
  const { user, isAdmin, openLogin } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active watching video
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Modals
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);
  const [editPlaylistOpen, setEditPlaylistOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPlaylistById(playlistId);
      setPlaylist(res.playlist);
      setVideos(res.videos);
      // Auto-select first video if not already selected
      if (res.videos.length > 0 && !activeVideo) {
        // select first incomplete video, or first video
        const firstIncomplete = res.videos.find(v => !v.completed);
        setActiveVideo(firstIncomplete || res.videos[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load playlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [playlistId]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      openLogin();
      return;
    }
    if (!playlist) return;

    try {
      const res = await api.toggleFavorite(playlist.id);
      setPlaylist(prev =>
        prev
          ? {
              ...prev,
              isFavorite: res.isFavorite,
              favoritesCount: res.favoritesCount,
            }
          : null
      );
      showToast(res.message);
    } catch (err) {
      console.error('Failed to favorite playlist:', err);
    }
  };

  const handleToggleProgress = async (vid: Video) => {
    if (!user) {
      openLogin();
      return;
    }
    if (!playlist) return;

    try {
      const res = await api.toggleVideoProgress(playlist.id, vid.id);

      // Update videos list
      const updatedVideos = videos.map(v =>
        v.id === vid.id ? { ...v, completed: res.completed } : v
      );
      setVideos(updatedVideos);

      // Update active video if it was modified
      if (activeVideo && activeVideo.id === vid.id) {
        setActiveVideo({ ...activeVideo, completed: res.completed });
      }

      // Update playlist state
      setPlaylist(prev =>
        prev
          ? {
              ...prev,
              completedCount: res.completedCount,
              progressPercentage: res.progressPercentage,
            }
          : null
      );

      if (res.progressPercentage === 100) {
        showToast('🎉 Congratulations! You have completed all lessons in this playlist!');
      } else {
        showToast(res.message);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    if (confirm(`Are you sure you want to permanently delete "${playlist.title}"?`)) {
      try {
        await api.deletePlaylist(playlist.id);
        showToast('Playlist deleted successfully.');
        onPlaylistDeleted?.();
      } catch (err: any) {
        alert(err.message || 'Failed to delete playlist');
      }
    }
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!playlist) return;
    if (confirm(`Delete lesson "${videoTitle}"?`)) {
      try {
        await api.deleteVideo(playlist.id, videoId);
        showToast('Lesson deleted.');
        if (activeVideo?.id === videoId) {
          const remaining = videos.filter(v => v.id !== videoId);
          setActiveVideo(remaining[0] || null);
        }
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete video');
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Playlist link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Playlist Not Found</h2>
        <p className="text-zinc-500 text-sm">{error || 'This playlist may have been deleted or moved.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwner = user && (user.id === playlist.userId || isAdmin);
  const progress = playlist.progressPercentage ?? 0;
  const isAllCompleted = progress === 100 && videos.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xl border border-zinc-700 dark:border-zinc-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Playlist Hero Banner */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8">
          {/* Cover Image */}
          <div className="relative aspect-video md:aspect-4/3 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md">
            <img
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 text-white text-xs font-semibold backdrop-blur-xs">
              <VideoIcon className="h-3.5 w-3.5" />
              <span>{videos.length} {videos.length === 1 ? 'lesson' : 'lessons'}</span>
            </div>
          </div>

          {/* Details & Metadata */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {playlist.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {playlist.level}
                  </span>
                </div>

                {/* Actions: Favorite, Share, Report */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      playlist.isFavorite
                        ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${playlist.isFavorite ? 'fill-current' : ''}`} />
                    <span>{playlist.isFavorite ? 'Saved' : 'Save'}</span>
                    {playlist.favoritesCount !== undefined && playlist.favoritesCount > 0 && (
                      <span className="opacity-70">({playlist.favoritesCount})</span>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Share link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (!user) openLogin();
                      else setReportModalOpen(true);
                    }}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                    title="Report playlist"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {playlist.title}
              </h1>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {playlist.description || 'No description provided for this playlist.'}
              </p>

              {/* Tags */}
              {playlist.tags && playlist.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {playlist.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Author info & Owner controls */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {playlist.authorName ? playlist.authorName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Created by {playlist.authorName}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVideoToEdit(null);
                      setVideoModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Video</span>
                  </button>
                  <button
                    onClick={() => setEditPlaylistOpen(true)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Edit playlist metadata"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDeletePlaylist}
                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="Delete playlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning Progress Section */}
        {user && videos.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 sm:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Your Course Progress
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {playlist.completedCount || 0} of {videos.length} completed
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {progress}% Complete
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAllCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Completion Trophy Card */}
      {isAllCompleted && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
              Mastery Achieved! 🎓
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
              You have completed all lessons in "{playlist.title}". You can review lessons anytime or explore more topics!
            </p>
          </div>
        </div>
      )}

      {/* Embedded Active Video Player */}
      {activeVideo && (
        <div>
          <VideoPlayerView
            playlist={playlist}
            videos={videos}
            activeVideo={activeVideo}
            onSelectVideo={vid => setActiveVideo(vid)}
            onToggleProgress={handleToggleProgress}
          />
        </div>
      )}

      {/* Full Lessons Curriculum List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Curriculum Lessons ({videos.length})
          </h2>
          {isOwner && (
            <button
              onClick={() => {
                setVideoToEdit(null);
                setVideoModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Lesson</span>
            </button>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
            <VideoIcon className="h-8 w-8 text-zinc-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">No lessons added yet</h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">
              Add YouTube video lessons to this playlist to build your structured learning curriculum.
            </p>
            {isOwner && (
              <button
                onClick={() => {
                  setVideoToEdit(null);
                  setVideoModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Add First Lesson
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {videos.map((vid, idx) => {
              const isCurrent = activeVideo?.id === vid.id;
              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleProgress(vid);
                      }}
                      className="mt-0.5 sm:mt-0 text-zinc-400 hover:text-emerald-500 transition"
                      title={vid.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {vid.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400">
                          #{idx + 1}
                        </span>
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isCurrent
                              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'text-zinc-900 dark:text-white'
                          }`}
                        >
                          {vid.title}
                        </h4>
                      </div>
                      {vid.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {vid.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {vid.duration}
                      </span>
                      {vid.notesUrl && (
                        <a
                          href={vid.notesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Notes
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveVideo(vid);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white text-xs font-medium transition"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Watch</span>
                      </button>

                      {isOwner && (
                        <>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setVideoToEdit(vid);
                              setVideoModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Edit lesson"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteVideo(vid.id, vid.title);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            title="Delete lesson"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal (Add / Edit) */}
      <VideoFormModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        playlistId={playlist.id}
        videoToEdit={videoToEdit}
        onSuccess={() => {
          showToast(videoToEdit ? 'Lesson updated!' : 'Lesson added to playlist!');
          loadData();
        }}
      />

      {/* Playlist Modal (Edit) */}
      <PlaylistFormModal
        isOpen={editPlaylistOpen}
        onClose={() => setEditPlaylistOpen(false)}
        playlistToEdit={playlist}
        onSuccess={updated => {
          setPlaylist(updated);
          showToast('Playlist details updated!');
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        playlistId={playlist.id}
        playlistTitle={playlist.title}
        onSuccess={() => showToast('Report submitted for moderation review.')}
      />
    </div>
  );
};
