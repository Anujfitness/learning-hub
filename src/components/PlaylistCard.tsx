import React, { useState } from 'react';
import { Playlist } from '../types';
import { Heart, Play, Video, MoreVertical, Edit2, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlistId: string) => void;
  onFavoriteChange?: (playlistId: string, isFavorite: boolean) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onClick,
  onEdit,
  onDelete,
  onFavoriteChange,
}) => {
  const { user, isAdmin, openLogin } = useAuth();
  const [isFavorite, setIsFavorite] = useState(playlist.isFavorite ?? false);
  const [favoritesCount, setFavoritesCount] = useState(playlist.favoritesCount ?? 0);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = user && (user.id === playlist.userId || isAdmin);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openLogin();
      return;
    }

    if (isFavoriting) return;
    setIsFavoriting(true);

    try {
      const res = await api.toggleFavorite(playlist.id);
      setIsFavorite(res.isFavorite);
      setFavoritesCount(res.favoritesCount);
      onFavoriteChange?.(playlist.id, res.isFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.(playlist);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      onDelete?.(playlist.id);
    }
  };

  // Color mapping by category
  const categoryStyles: Record<string, string> = {
    DevOps: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    Linux: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    Python: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
    AWS: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
    Docker: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800/40',
    'Web Development': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
    'Data Science': 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800/40',
    'AI & ML': 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-200 dark:border-violet-800/40',
    Cybersecurity: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
  };

  const defaultCategoryStyle =
    'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';

  const progress = playlist.progressPercentage ?? 0;
  const isCompleted = progress === 100;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={playlist.thumbnailUrl}
          alt={playlist.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Video Count Badge */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-xs font-medium">
          <Video className="h-3.5 w-3.5" />
          <span>{playlist.videoCount ?? 0} {playlist.videoCount === 1 ? 'lesson' : 'lessons'}</span>
        </div>

        {/* Level Tag */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide">
          {playlist.level}
        </div>

        {/* Save/Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove favorite' : 'Save playlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isFavorite
              ? 'bg-rose-500/90 text-white shadow-sm'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover play prompt */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
        {/* Category & Stats */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
              categoryStyles[playlist.category] || defaultCategoryStyle
            }`}
          >
            {playlist.category}
          </span>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {favoritesCount > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                {favoritesCount}
              </span>
            )}
            {playlist.views > 0 && <span>{playlist.views} views</span>}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {playlist.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1">
          {playlist.description || 'No description provided.'}
        </p>

        {/* Learning Progress Bar (if logged in and started) */}
        {user && (playlist.completedCount !== undefined && playlist.completedCount > 0) && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                  </>
                ) : (
                  <>Progress</>
                )}
              </span>
              <span className="text-zinc-500 font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: Creator & Actions */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {playlist.authorName ? playlist.authorName[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
              {playlist.authorName || 'Educator'}
            </span>
          </div>

          {/* Owner / Admin Management Dropdown */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg py-1 z-30 animate-in fade-in"
                  onClick={e => e.stopPropagation()}
                >
                  {onEdit && (
                    <button
                      onClick={handleEditClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left font-medium"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Playlist
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
