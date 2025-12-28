const { ForumPost, Comment, ForumCategory, PostLike } = require('../models');
const { Op } = require('sequelize');

// Get all posts with pagination and filters
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
      tags,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = { [Op.overlap]: tagArray };
    }

    // Get posts
    const { count, rows: posts } = await ForumPost.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      include: [
        {
          model: ForumCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'color'],
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id'],
        },
      ],
      distinct: true,
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_POSTS_ERROR',
        message: 'Failed to fetch posts',
      },
    });
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findByPk(id, {
      include: [
        {
          model: ForumCategory,
          as: 'category',
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: Comment,
              as: 'replies',
            },
          ],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    // Increment views
    await post.increment('views');

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_POST_ERROR',
        message: 'Failed to fetch post',
      },
    });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, categoryId, tags } = req.body;
    const userId = req.user.id; // From auth

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and content are required',
        },
      });
    }

    if (title.length < 3 || title.length > 255) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title must be between 3 and 255 characters',
        },
      });
    }

    // Create post
    const post = await ForumPost.create({
      userId,
      title,
      content,
      categoryId: categoryId || null,
      tags: tags || [],
    });

    // Increment category post count
    if (categoryId) {
      await ForumCategory.increment('postCount', {
        where: { id: categoryId },
      });
    }

    // Fetch created post with associations
    const createdPost = await ForumPost.findByPk(post.id, {
      include: [
        {
          model: ForumCategory,
          as: 'category',
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdPost,
      message: 'Post created successfully',
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_POST_ERROR',
        message: 'Failed to create post',
      },
    });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tags } = req.body;
    const userId = req.user.id;

    const post = await ForumPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    // Check ownership
    if (post.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit your own posts',
        },
      });
    }

    // Check if locked
    if (post.isLocked) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'POST_LOCKED',
          message: 'This post is locked and cannot be edited',
        },
      });
    }

    // Update post
    await post.update({
      title: title || post.title,
      content: content || post.content,
      categoryId: categoryId !== undefined ? categoryId : post.categoryId,
      tags: tags || post.tags,
    });

    const updatedPost = await ForumPost.findByPk(id, {
      include: [
        {
          model: ForumCategory,
          as: 'category',
        },
      ],
    });

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_POST_ERROR',
        message: 'Failed to update post',
      },
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await ForumPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    // Check ownership
    if (post.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own posts',
        },
      });
    }

    // Decrement category post count
    if (post.categoryId) {
      await ForumCategory.decrement('postCount', {
        where: { id: post.categoryId },
      });
    }

    await post.destroy();

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_POST_ERROR',
        message: 'Failed to delete post',
      },
    });
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await ForumPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    // Check if already liked
    const existingLike = await PostLike.findOne({
      where: { postId: id, userId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likes');

      return res.json({
        success: true,
        data: { liked: false, likes: post.likes - 1 },
        message: 'Post unliked',
      });
    } else {
      // Like
      await PostLike.create({ postId: id, userId });
      await post.increment('likes');

      return res.json({
        success: true,
        data: { liked: true, likes: post.likes + 1 },
        message: 'Post liked',
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOGGLE_LIKE_ERROR',
        message: 'Failed to toggle like',
      },
    });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        postId: id,
        parentCommentId: null, // Only top-level comments
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Comment,
          as: 'replies',
        },
      ],
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_COMMENTS_ERROR',
        message: 'Failed to fetch comments',
      },
    });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Comment content is required',
        },
      });
    }

    // Check if post exists
    const post = await ForumPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    // Check if post is locked
    if (post.isLocked) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'POST_LOCKED',
          message: 'This post is locked, cannot add comments',
        },
      });
    }

    // Create comment
    const comment = await Comment.create({
      postId: id,
      userId,
      content,
      parentCommentId: parentCommentId || null,
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment created successfully',
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_COMMENT_ERROR',
        message: 'Failed to create comment',
      },
    });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found',
        },
      });
    }

    // Check ownership
    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit your own comments',
        },
      });
    }

    await comment.update({ content });

    res.json({
      success: true,
      data: comment,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_COMMENT_ERROR',
        message: 'Failed to update comment',
      },
    });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMMENT_NOT_FOUND',
          message: 'Comment not found',
        },
      });
    }

    // Check ownership
    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments',
        },
      });
    }

    await comment.destroy();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_COMMENT_ERROR',
        message: 'Failed to delete comment',
      },
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ForumCategory.findAll({
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_CATEGORIES_ERROR',
        message: 'Failed to fetch categories',
      },
    });
  }
};

// Get posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const category = await ForumCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    const { count, rows: posts } = await ForumPost.findAndCountAll({
      where: { categoryId: id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Comment,
          as: 'comments',
          attributes: ['id'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        category,
        posts,
      },
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get posts by category error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_POSTS_BY_CATEGORY_ERROR',
        message: 'Failed to fetch posts',
      },
    });
  }
};
