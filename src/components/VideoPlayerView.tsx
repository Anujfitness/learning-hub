import React from 'react';
import { Video, Playlist } from '../types';
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VideoPlayerViewProps {
  playlist: Playlist;
  videos: Video[];
  activeVideo: Video;
  onSelectVideo: (video: Video) => void;
  onToggleProgress: (video: Video) => void;
  onClose?: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  playlist,
  videos,
  activeVideo,
  onSelectVideo,
  onToggleProgress,
  onClose,
}) => {
  const { user, openLogin } = useAuth();

  const currentIndex = videos.findIndex(v => v.id === activeVideo.id);
  const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  const handleProgressClick = () => {
    if (!user) {
      openLogin();
      return;
    }
    onToggleProgress(activeVideo);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden mb-8 transition-colors">
      {/* Player Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Lesson {currentIndex + 1} of {videos.length}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
            {activeVideo.title}
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left/Main Column: YouTube Video Iframe + Action Bar */}
        <div className="lg:col-span-2 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800">
          {/* Responsive 16:9 Iframe Container */}
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          {/* Action Bar & Controls */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  disabled={!prevVideo}
                  onClick={() => prevVideo && onSelectVideo(prevVideo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={!nextVideo}
                  onClick={() => nextVideo && onSelectVideo(nextVideo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Mark Completed Toggle */}
              <button
                onClick={handleProgressClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 shadow-xs ${
                  activeVideo.completed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {activeVideo.completed ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed!</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 text-zinc-400" />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>
            </div>

            {/* Video Description & Notes */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {activeVideo.duration}
                </span>
                {activeVideo.notesUrl && (
                  <a
                    href={activeVideo.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Resources & Notes
                  </a>
                )}
              </div>

              {activeVideo.description && (
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                  {activeVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Playlist Lesson List */}
        <div className="flex flex-col bg-zinc-50/50 dark:bg-zinc-950/40 max-h-[500px] lg:max-h-none overflow-y-auto">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Curriculum ({videos.length} videos)
            </h3>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {videos.map((vid, index) => {
              const isActive = vid.id === activeVideo.id;
              return (
                <div
                  key={vid.id}
                  onClick={() => onSelectVideo(vid)}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-l-4 border-indigo-600'
                      : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!user) {
                        openLogin();
                        return;
                      }
                      onToggleProgress(vid);
                    }}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-500 transition"
                  >
                    {vid.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold line-clamp-2 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-900 dark:text-zinc-200'
                      }`}
                    >
                      {index + 1}. {vid.title}
                    </p>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {vid.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
