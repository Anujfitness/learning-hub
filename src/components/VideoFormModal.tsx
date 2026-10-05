import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import { X, Youtube, Clock, FileText, Link, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onSuccess: (video: Video) => void;
  videoToEdit?: Video | null;
}

function extractYouTubeId(url: string): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  return '';
}

export const VideoFormModal: React.FC<VideoFormModalProps> = ({
  isOpen,
  onClose,
  playlistId,
  onSuccess,
  videoToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [notesUrl, setNotesUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoToEdit) {
      setTitle(videoToEdit.title);
      setYoutubeUrl(videoToEdit.youtubeUrl);
      setDuration(videoToEdit.duration);
      setDescription(videoToEdit.description);
      setNotesUrl(videoToEdit.notesUrl || '');
    } else {
      setTitle('');
      setYoutubeUrl('');
      setDuration('15:00');
      setDescription('');
      setNotesUrl('');
    }
    setError(null);
  }, [videoToEdit, isOpen]);

  if (!isOpen) return null;

  const currentYtId = extractYouTubeId(youtubeUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentYtId) {
      setError('Please provide a valid YouTube URL or 11-character video ID.');
      return;
    }

    setLoading(true);

    try {
      if (videoToEdit) {
        const res = await api.updateVideo(playlistId, videoToEdit.id, {
          title,
          youtubeUrl,
          duration,
          description,
          notesUrl: notesUrl.trim() || undefined,
        });
        onSuccess(res.video);
      } else {
        const res = await api.addVideo(playlistId, {
          title,
          youtubeUrl,
          duration,
          description,
          notesUrl: notesUrl.trim() || undefined,
        });
        onSuccess(res.video);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 relative my-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
          {videoToEdit ? 'Edit Lesson' : 'Add Lesson / Video'}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5">
          Paste any YouTube tutorial or lecture link to integrate into this course.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Video Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Linux Permissions"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">YouTube URL or ID *</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-red-500">
                <Youtube className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {currentYtId && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <img
                  src={`https://img.youtube.com/vi/${currentYtId}/mqdefault.jpg`}
                  alt="Preview"
                  className="w-20 aspect-video rounded-md object-cover"
                />
                <div className="text-xs">
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✓ Valid YouTube Video
                  </p>
                  <p className="text-[11px] text-zinc-400">ID: {currentYtId}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Duration</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 18:25"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Resource / Notes URL</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-400">
                  <Link className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  value={notesUrl}
                  onChange={e => setNotesUrl(e.target.value)}
                  placeholder="https://docs.link..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Lesson Description / Key Takeaways</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Summary of topics covered, timestamps, or practice exercises..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {loading ? 'Saving...' : videoToEdit ? 'Save Changes' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
