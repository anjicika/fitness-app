const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/posts', forumController.getPosts);
router.get('/posts/:id', forumController.getPostById);
router.get('/posts/:id/comments', forumController.getComments);
router.get('/categories', forumController.getCategories);
router.get('/categories/:id/posts', forumController.getPostsByCategory);

// Protected routes (require authentication)
router.post('/posts', authenticate, forumController.createPost);
router.put('/posts/:id', authenticate, forumController.updatePost);
router.delete('/posts/:id', authenticate, forumController.deletePost);
router.post('/posts/:id/like', authenticate, forumController.toggleLike);
router.post('/posts/:id/comments', authenticate, forumController.createComment);
router.put('/comments/:commentId', authenticate, forumController.updateComment);
router.delete(
  '/comments/:commentId',
  authenticate,
  forumController.deleteComment
);

module.exports = router;
