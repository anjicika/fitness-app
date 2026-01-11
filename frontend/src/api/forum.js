import axios from 'axios';

// Use the correct base URL with /api/v1
const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      // You can redirect to login here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Forum Posts API - Use /forum prefix since base is /api/v1
export const forumApi = {
  // Get all posts
  getPosts: (params) => api.get('/forum/posts', { params }),
  
  // Get single post
  getPostById: (id) => api.get(`/forum/posts/${id}`),
  
  // Create post (requires auth)
  createPost: (data) => api.post('/forum/posts', data),
  
  // Get comments for post
  getComments: (postId, params) => api.get(`/forum/posts/${postId}/comments`, { params }),
  
  // Create comment (requires auth)
  createComment: (postId, data) => api.post(`/forum/posts/${postId}/comments`, data),
  
  // Get categories
  getCategories: () => api.get('/forum/categories'),
  
  // Get posts by category
  getPostsByCategory: (categoryId, params) => api.get(`/forum/categories/${categoryId}/posts`, { params }),
};

export default api;