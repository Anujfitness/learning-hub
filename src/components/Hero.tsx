import React, { useState } from 'react';
import { Search, Sparkles, Video, Users, CheckCircle, ArrowRight } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
  onExploreClick: () => void;
}

const CATEGORIES = [
  'All',
  'DevOps',
  'Linux',
  'Python',
  'AWS',
  'Docker',
  'Web Development',
  'Data Science',
  'AI & ML',
  'Cybersecurity',
];

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  onSelectCategory,
  selectedCategory = 'All',
  onExploreClick,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput.trim());
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
      {/* Subtle decorative background gradient */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
        <div className="h-[450px] w-[750px] rounded-full bg-gradient-to-tr from-indigo-500 via-sky-400 to-purple-500 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Pill Tagline */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Curated Video Learning Paths</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-800 bg-clip-text text-transparent dark:from-indigo-400 dark:via-sky-300 dark:to-purple-400">
              Learn. Organize. Grow.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-xl text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
            Turn fragmented YouTube videos and technical resources into clean, step-by-step educational playlists with tracked learning progress.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl relative flex items-center shadow-lg shadow-indigo-500/5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition"
        >
          <div className="pl-3 text-zinc-400 dark:text-zinc-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search playlists by topic, skill, tool, or creator..."
            className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold active:scale-95 transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Popular Learning Categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">Curated Lessons</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Ordered YouTube paths</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">Progress Tracking</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Track video completion</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">Personal Dashboard</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Manage & save lists</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs flex items-center gap-3 cursor-pointer hover:border-indigo-400 transition" onClick={onExploreClick}>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">Explore All</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Dive into the library</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
