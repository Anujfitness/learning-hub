import React, { useEffect, useState } from 'react';
import { Playlist } from '../types';
import { api } from '../lib/api';
import { Hero } from '../components/Hero';
import { PlaylistCard } from '../components/PlaylistCard';
import {
  TrendingUp,
  Clock,
  ArrowRight,
  Terminal,
  Server,
  Cloud,
  Layers,
  Code2,
  Cpu,
  Shield,
  Database,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  onSelectPlaylist: (playlistId: string) => void;
  onNavigate: (view: string) => void;
  onOpenCreatePlaylist: () => void;
  onFilterByCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  DevOps: <Layers className="h-5 w-5" />,
  Linux: <Terminal className="h-5 w-5" />,
  Python: <Code2 className="h-5 w-5" />,
  AWS: <Cloud className="h-5 w-5" />,
  Docker: <Server className="h-5 w-5" />,
  'Web Development': <Cpu className="h-5 w-5" />,
  'Data Science': <Database className="h-5 w-5" />,
  'AI & ML': <Sparkles className="h-5 w-5" />,
  Cybersecurity: <Shield className="h-5 w-5" />,
};

export const HomePage: React.FC<HomePageProps> = ({
  onSelectPlaylist,
  onNavigate,
  onFilterByCategory,
}) => {
  const [popularPlaylists, setPopularPlaylists] = useState<Playlist[]>([]);
  const [recentPlaylists, setRecentPlaylists] = useState<Playlist[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [popRes, recRes, catRes] = await Promise.all([
          api.getPlaylists({ sort: 'popular' }),
          api.getPlaylists({ sort: 'newest' }),
          api.getCategories(),
        ]);

        setPopularPlaylists(popRes.playlists.slice(0, 6));
        setRecentPlaylists(recRes.playlists.slice(0, 4));
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (query: string) => {
    // Navigate to explore page with search query
    onNavigate(`explore?q=${encodeURIComponent(query)}`);
  };

  const handleCategorySelect = (category: string) => {
    if (category === 'All') {
      onNavigate('explore');
    } else {
      onFilterByCategory(category);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <Hero
        onSearch={handleSearch}
        onSelectCategory={handleCategorySelect}
        onExploreClick={() => onNavigate('explore')}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Categories Showcase Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Explore by Domain
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Curated specializations designed to take you from foundational concepts to production skills
              </p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {['DevOps', 'Linux', 'Python', 'AWS', 'Docker', 'Web Development'].map(catName => {
              const matched = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
              const count = matched?.count || 1;
              return (
                <button
                  key={catName}
                  onClick={() => handleCategorySelect(catName)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition text-center group"
                >
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                    {CATEGORY_ICONS[catName] || <Layers className="h-5 w-5" />}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {catName}
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {count} {count === 1 ? 'path' : 'paths'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Popular Playlists */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Popular Playlists
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Most saved and completed learning paths across the community
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('explore')}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition"
            >
              <span>See more</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPlaylists.map(playlist => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => onSelectPlaylist(playlist.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recently Added Playlists */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Recently Added
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Fresh curriculum additions and roadmaps from educators
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('explore')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentPlaylists.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => onSelectPlaylist(playlist.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
