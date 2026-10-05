import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// GET user dashboard data
router.get('/dashboard', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const userId = user.id;

    // 1. My Created Playlists
    const allPlaylists = db.getPlaylists();
    const myPlaylists = allPlaylists
      .filter(p => p.userId === userId)
      .map(p => {
        const videos = db.getVideosByPlaylistId(p.id);
        const favoritesCount = db.getFavoriteCount(p.id);
        const isFavorite = db.isFavorite(userId, p.id);
        const progressList = db.getVideoProgressForUserAndPlaylist(userId, p.id);
        const completedIds = new Set(progressList.filter(pr => pr.completed).map(pr => pr.videoId));
        const completedCount = videos.filter(v => completedIds.has(v.id)).length;
        const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

        return {
          ...p,
          videoCount: videos.length,
          favoritesCount,
          isFavorite,
          completedCount,
          progressPercentage,
          isOwner: true,
        };
      });

    // 2. Saved Playlists (Favorites)
    const userFavorites = db.getFavoritesByUserId(userId);
    const favoritePlaylistIds = new Set(userFavorites.map(f => f.playlistId));
    const savedPlaylists = allPlaylists
      .filter(p => favoritePlaylistIds.has(p.id))
      .map(p => {
        const videos = db.getVideosByPlaylistId(p.id);
        const favoritesCount = db.getFavoriteCount(p.id);
        const progressList = db.getVideoProgressForUserAndPlaylist(userId, p.id);
        const completedIds = new Set(progressList.filter(pr => pr.completed).map(pr => pr.videoId));
        const completedCount = videos.filter(v => completedIds.has(v.id)).length;
        const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

        return {
          ...p,
          videoCount: videos.length,
          favoritesCount,
          isFavorite: true,
          completedCount,
          progressPercentage,
          isOwner: p.userId === userId,
        };
      });

    // 3. Learning Progress (all playlists where user completed at least 1 video)
    const allUserProgress = db.getAllProgressForUser(userId).filter(p => p.completed);
    const touchedPlaylistIds = Array.from(new Set(allUserProgress.map(p => p.playlistId)));

    const inProgressPlaylists = touchedPlaylistIds
      .map(pId => db.getPlaylistById(pId))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map(p => {
        const videos = db.getVideosByPlaylistId(p.id);
        const favoritesCount = db.getFavoriteCount(p.id);
        const isFavorite = db.isFavorite(userId, p.id);
        const progressList = db.getVideoProgressForUserAndPlaylist(userId, p.id);
        const completedIds = new Set(progressList.filter(pr => pr.completed).map(pr => pr.videoId));
        const completedCount = videos.filter(v => completedIds.has(v.id)).length;
        const progressPercentage = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

        return {
          ...p,
          videoCount: videos.length,
          favoritesCount,
          isFavorite,
          completedCount,
          progressPercentage,
          isOwner: p.userId === userId,
          isCompleted: progressPercentage === 100,
        };
      });

    // Summary statistics
    const stats = {
      createdPlaylistsCount: myPlaylists.length,
      savedPlaylistsCount: savedPlaylists.length,
      inProgressCount: inProgressPlaylists.filter(p => !p.isCompleted).length,
      completedPlaylistsCount: inProgressPlaylists.filter(p => p.isCompleted).length,
      totalVideosCompleted: allUserProgress.length,
    };

    res.json({
      myPlaylists,
      savedPlaylists,
      inProgressPlaylists,
      stats,
    });
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

export default router;
