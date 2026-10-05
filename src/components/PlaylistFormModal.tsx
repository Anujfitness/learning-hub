import React, { useState, useEffect } from 'react';
import { Playlist } from '../types';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface PlaylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (playlist: Playlist) => void;
  playlistToEdit?: Playlist | null;
}

const CATEGORIES = [
  'DevOps',
  'Linux',
  'Python',
  'AWS',
  'Docker',
  'Web Development',
  'Data Science',
  'AI & ML',
  'Cybersecurity',
  'General Programming',
];

const PRESET_THUMBNAILS = [
  { label: 'DevOps & Cloud', url: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80' },
  { label: 'Linux & Terminal', url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80' },
  { label: 'Python & Code', url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80' },
  { label: 'AWS & Network', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' },
  { label: 'Docker & Microservices', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Web Dev & React', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80' },
];

export const PlaylistFormModal: React.FC<PlaylistFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  playlistToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DevOps');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [tags, setTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playlistToEdit) {
      setTitle(playlistToEdit.title);
      setDescription(playlistToEdit.description);
      setCategory(playlistToEdit.category);
      setLevel(playlistToEdit.level);
      setTags(playlistToEdit.tags?.join(', ') || '');
      setThumbnailUrl(playlistToEdit.thumbnailUrl);
    } else {
      setTitle('');
      setDescription('');
      setCategory('DevOps');
      setLevel('All Levels');
      setTags('');
      setThumbnailUrl(PRESET_THUMBNAILS[0].url);
    }
    setError(null);
  }, [playlistToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (playlistToEdit) {
        const res = await api.updatePlaylist(playlistToEdit.id, {
          title,
          description,
          category,
          level,
          tags: parsedTags,
          thumbnailUrl,
        });
        onSuccess(res.playlist);
      } else {
        const res = await api.createPlaylist({
          title,
          description,
          category,
          level,
          tags: parsedTags,
          thumbnailUrl,
        });
        onSuccess(res.playlist);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save playlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 relative my-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
          {playlistToEdit ? 'Edit Playlist' : 'Create New Playlist'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          {playlistToEdit
            ? 'Update your playlist details, curriculum metadata, and cover'
            : 'Assemble videos into a structured learning path for yourself and others'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Playlist Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Complete Docker & Kubernetes Pipeline"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Difficulty Level *</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the goals of this playlist, target audience, and prerequisites..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Docker, Containers, CI/CD, DevOps"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Thumbnail Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Cover Thumbnail</span>
              <span className="text-[11px] font-normal text-zinc-400">Click preset or enter custom URL</span>
            </label>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_THUMBNAILS.map(preset => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setThumbnailUrl(preset.url)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                    thumbnailUrl === preset.url
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white py-0.5 px-1 truncate text-center">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="relative flex items-center pt-1">
              <div className="absolute left-3 text-zinc-400">
                <ImageIcon className="h-4 w-4" />
              </div>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="Or paste an image URL (https://...)"
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : playlistToEdit ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
