import React from 'react';
import { BookOpen, Server, Box, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onCategorySelect?: (cat: string) => void;
  onNavigate?: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategorySelect, onNavigate }) => {
  const categories = ['DevOps', 'Linux', 'Python', 'AWS', 'Docker', 'Web Development'];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 mt-20 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                Study<span className="text-indigo-600 dark:text-indigo-400">Playlist</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Curate, organize, and master topics with structured video roadmaps, notes, and progress tracking.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                <Box className="h-3.5 w-3.5" /> Docker Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                <Server className="h-3.5 w-3.5" /> AWS EC2 Ready
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
              Top Disciplines
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onCategorySelect?.(cat);
                      onNavigate?.('explore');
                    }}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
              Explore & Learn
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('explore')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Browse All Playlists
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Learning Progress
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Create & Share
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture / Deployment notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
              Architecture
            </h4>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2 text-xs">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                Full-Stack Express + React 19
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                Backed by a persistent relational/document storage engine with JWT authentication, role-based access control, and complete CRUD.
              </p>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                Ready for multi-container Docker & AWS EC2 hosting.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Study Playlist. Built for educational mastery.</p>
          <div className="flex items-center gap-1">
            <span>Learn. Organize. Grow.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
