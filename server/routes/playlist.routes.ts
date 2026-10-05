import { Router } from 'express';
import { db, Playlist, Video, extractYouTubeId } from '../db.js';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// GET all categories with playlist counts
router.get('/categories', (_req, res) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// GET all playlists with filter, search, sorting
router.get('/', optionalAuthMiddleware, (req: AuthRequest, res) => {
  try {
    const { category, search, level, sort } = req.query as {
      category?: string;
      search?: string;
      level?: string;
      sort?: string;
    };

    let playlists = db.getPlaylists();

    // Filter by Category
    if (category && category !== 'All') {
      playlists = playlists.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by Level
    if (level && level !== 'All') {
      playlists = playlists.filter(
        p => p.level.toLowerCase() === level.toLowerCase()
      );
    }

    // Filter by Search Query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      playlists = playlists.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Enrich playlists with video counts, total duration, favorites count, user's progress if logged in
    const userId = req.user?.id;
    const enriched = playlists.map(p => {
      const videos = db.getVideosByPlaylistId(p.id);
      const favoritesCount = db.getFavoriteCount(p.id);
      const isFavorite = userId ? db.isFavorite(userId, p.id) : false;

      let progressPercentage = 0;
      let completedCount = 0;
      if (userId && videos.length > 0) {
        const progressList = db.getVideoProgressForUserAndPlaylist(userId, p.id);
        const completedIds = new Set(progressList.filter(pr => pr.completed).map(pr => pr.videoId));
        completedCount = videos.filter(v => completedIds.has(v.id)).length;
        progressPercentage = Math.round((completedCount / videos.length) * 100);
      }

      return {
        ...p,
        videoCount: videos.length,
        favoritesCount,
        isFavorite,
        completedCount,
        progressPercentage,
      };
    });

    // Sorting
    if (sort === 'popular') {
      enriched.sort((a, b) => (b.views + b.favoritesCount * 10) - (a.views + a.favoritesCount * 10));
    } else if (sort === 'videos') {
      enriched.sort((a, b) => b.videoCount - a.videoCount);
    } else {
      // Default: newest
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ playlists: enriched });
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ error: 'Failed to retrieve playlists' });
  }
});

// GET single playlist with videos and learning progress
router.get('/:id', optionalAuthMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const playlist = db.getPlaylistById(id);

  if (!playlist) {
    res.status(404).json({ error: 'Playlist not found.' });
    return;
  }

  // Increment views
  db.incrementPlaylistViews(id);

  const videos = db.getVideosByPlaylistId(id);
  const favoritesCount = db.getFavoriteCount(id);
  const userId = req.user?.id;
  const isFavorite = userId ? db.isFavorite(userId, id) : false;

  // Progress mapping
  let completedCount = 0;
  const userProgressMap: Record<string, boolean> = {};
  if (userId) {
    const progressList = db.getVideoProgressForUserAndPlaylist(userId, id);
    progressList.forEach(p => {
      userProgressMap[p.videoId] = p.completed;
    });
    completedCount = videos.filter(v => userProgressMap[v.id]).length;
  }

  const enrichedVideos = videos.map(v => ({
    ...v,
    completed: !!userProgressMap[v.id],
  }));

  const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  res.json({
    playlist: {
      ...playlist,
      videoCount: videos.length,
      favoritesCount,
      isFavorite,
      completedCount,
      progressPercentage,
      isOwner: userId === playlist.userId || req.user?.role === 'admin',
    },
    videos: enrichedVideos,
  });
});

// CREATE new playlist
router.post('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { title, description, category, level, tags, thumbnailUrl } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Playlist title is required.' });
      return;
    }

    if (!category || !category.trim()) {
      res.status(400).json({ error: 'Category is required.' });
      return;
    }

    // Default curated thumbnails by category if none provided
    const categoryThumbnails: Record<string, string> = {
      DevOps: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80',
      Linux: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
      Python: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80',
      AWS: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      Docker: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80',
      'Web Development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      'AI & ML': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
      Cybersecurity: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    };

    const finalThumbnail =
      thumbnailUrl && thumbnailUrl.trim()
        ? thumbnailUrl.trim()
        : categoryThumbnails[category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';

    const parsedTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [category];

    const now = new Date().toISOString();
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      authorName: user.name,
      authorEmail: user.email,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      level: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(level) ? level : 'All Levels',
      tags: parsedTags.length > 0 ? parsedTags : [category.trim()],
      thumbnailUrl: finalThumbnail,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    db.createPlaylist(newPlaylist);
    res.status(201).json({
      message: 'Playlist created successfully!',
      playlist: {
        ...newPlaylist,
        videoCount: 0,
        favoritesCount: 0,
        isFavorite: false,
        completedCount: 0,
        progressPercentage: 0,
        isOwner: true,
      },
    });
  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// UPDATE playlist (Owner or Admin)
router.put('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const existing = db.getPlaylistById(id);

    if (!existing) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      res.status(403).json({ error: 'You do not have permission to edit this playlist.' });
      return;
    }

    const { title, description, category, level, tags, thumbnailUrl } = req.body;
    const updates: Partial<Playlist> = {};

    if (title && title.trim()) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category && category.trim()) updates.category = category.trim();
    if (level && ['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(level)) updates.level = level;
    if (tags) {
      updates.tags = Array.isArray(tags)
        ? tags.map(t => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : existing.tags;
    }
    if (thumbnailUrl && thumbnailUrl.trim()) updates.thumbnailUrl = thumbnailUrl.trim();

    const updated = db.updatePlaylist(id, updates);
    res.json({ message: 'Playlist updated successfully!', playlist: updated });
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// DELETE playlist (Owner or Admin)
router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const existing = db.getPlaylistById(id);

    if (!existing) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      res.status(403).json({ error: 'You do not have permission to delete this playlist.' });
      return;
    }

    db.deletePlaylist(id);
    res.json({ message: 'Playlist deleted successfully.' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// ADD VIDEO to playlist (Owner or Admin)
router.post('/:id/videos', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const playlist = db.getPlaylistById(id);

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    if (playlist.userId !== user.id && user.role !== 'admin') {
      res.status(403).json({ error: 'You do not have permission to add videos to this playlist.' });
      return;
    }

    const { title, youtubeUrl, description, duration, notesUrl } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Video title is required.' });
      return;
    }

    if (!youtubeUrl || !youtubeUrl.trim()) {
      res.status(400).json({ error: 'YouTube URL is required.' });
      return;
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      res.status(400).json({ error: 'Invalid YouTube URL. Please provide a valid YouTube link.' });
      return;
    }

    const existingVideos = db.getVideosByPlaylistId(id);
    const newOrder = existingVideos.length + 1;

    const newVideo: Video = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playlistId: id,
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeId,
      description: description ? description.trim() : '',
      duration: duration && duration.trim() ? duration.trim() : '10:00',
      order: newOrder,
      notesUrl: notesUrl && notesUrl.trim() ? notesUrl.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    db.createVideo(newVideo);
    res.status(201).json({ message: 'Video added successfully!', video: newVideo });
  } catch (err) {
    console.error('Error adding video:', err);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// UPDATE VIDEO in playlist (Owner or Admin)
router.put('/:id/videos/:videoId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id, videoId } = req.params;
    const playlist = db.getPlaylistById(id);

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    if (playlist.userId !== user.id && user.role !== 'admin') {
      res.status(403).json({ error: 'Permission denied.' });
      return;
    }

    const video = db.getVideoById(videoId);
    if (!video || video.playlistId !== id) {
      res.status(404).json({ error: 'Video not found in this playlist.' });
      return;
    }

    const { title, youtubeUrl, description, duration, notesUrl, order } = req.body;
    const updates: Partial<Video> = {};

    if (title && title.trim()) updates.title = title.trim();
    if (youtubeUrl && youtubeUrl.trim()) {
      const ytId = extractYouTubeId(youtubeUrl);
      if (!ytId) {
        res.status(400).json({ error: 'Invalid YouTube URL.' });
        return;
      }
      updates.youtubeUrl = youtubeUrl.trim();
      updates.youtubeId = ytId;
    }
    if (description !== undefined) updates.description = description.trim();
    if (duration !== undefined) updates.duration = duration.trim();
    if (notesUrl !== undefined) updates.notesUrl = notesUrl.trim();
    if (typeof order === 'number') updates.order = order;

    const updated = db.updateVideo(videoId, updates);
    res.json({ message: 'Video updated successfully!', video: updated });
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// DELETE VIDEO from playlist (Owner or Admin)
router.delete('/:id/videos/:videoId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id, videoId } = req.params;
    const playlist = db.getPlaylistById(id);

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    if (playlist.userId !== user.id && user.role !== 'admin') {
      res.status(403).json({ error: 'Permission denied.' });
      return;
    }

    const success = db.deleteVideo(videoId);
    if (!success) {
      res.status(404).json({ error: 'Video not found.' });
      return;
    }

    res.json({ message: 'Video deleted successfully.' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// TOGGLE FAVORITE
router.post('/:id/favorite', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const playlist = db.getPlaylistById(id);

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    const isFavorite = db.toggleFavorite(user.id, id);
    const count = db.getFavoriteCount(id);

    res.json({
      message: isFavorite ? 'Playlist saved to favorites!' : 'Removed from favorites',
      isFavorite,
      favoritesCount: count,
    });
  } catch (err) {
    console.error('Error toggling favorite:', err);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

// TOGGLE VIDEO PROGRESS (mark completed / uncompleted)
router.post('/:id/videos/:videoId/progress', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id, videoId } = req.params;
    const { completed } = req.body;

    const playlist = db.getPlaylistById(id);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    const video = db.getVideoById(videoId);
    if (!video || video.playlistId !== id) {
      res.status(404).json({ error: 'Video not found in playlist.' });
      return;
    }

    const newCompletedState = db.toggleVideoProgress(user.id, id, videoId, completed);

    // Compute updated playlist progress
    const videos = db.getVideosByPlaylistId(id);
    const progressList = db.getVideoProgressForUserAndPlaylist(user.id, id);
    const completedIds = new Set(progressList.filter(p => p.completed).map(p => p.videoId));
    const completedCount = videos.filter(v => completedIds.has(v.id)).length;
    const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

    res.json({
      message: newCompletedState ? 'Video marked as completed!' : 'Video marked as uncompleted',
      completed: newCompletedState,
      completedCount,
      totalCount: videos.length,
      progressPercentage,
    });
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ error: 'Failed to update learning progress' });
  }
});

// REPORT PLAYLIST (Inappropriate content)
router.post('/:id/report', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { reason, details } = req.body;

    const playlist = db.getPlaylistById(id);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found.' });
      return;
    }

    if (!reason || !reason.trim()) {
      res.status(400).json({ error: 'Report reason is required.' });
      return;
    }

    const report = db.createReport({
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      playlistId: id,
      playlistTitle: playlist.title,
      reporterId: user.id,
      reporterName: user.name,
      reporterEmail: user.email,
      reason: reason.trim(),
      details: details ? details.trim() : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Thank you. The report has been submitted to the moderation team for review.',
      reportId: report.id,
    });
  } catch (err) {
    console.error('Error reporting playlist:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

export default router;
