import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useForumPosts, useForumCategories } from '../hooks/useForum';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const Forum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Use refs for values that shouldn't trigger re-renders
  const filtersRef = useRef({
    category: '',
    search: '',
    sortBy: 'createdAt',
    order: 'DESC',
  });
  
  // State for filters - only update when needed
  const [filters, setFilters] = useState({ ...filtersRef.current });
  
  // Separate state for search input to avoid rapid updates
  const [searchInput, setSearchInput] = useState('');
  
  // Track if filters have been applied to prevent initial load loops
  const filtersAppliedRef = useRef(false);

  // Use the forum hooks with current filters
  const {
    posts,
    loading,
    error,
    pagination,
    handlePageChange,
  } = useForumPosts(filtersAppliedRef.current ? filters : {});

  const { categories } = useForumCategories();

  // Mark initial load as complete
  useEffect(() => {
    if (!loading && initialLoad) {
      setInitialLoad(false);
    }
  }, [loading, initialLoad]);

  // Apply filters with debouncing
  const applyFilters = useCallback((newFilters) => {
    filtersRef.current = newFilters;
    setFilters({ ...newFilters });
    filtersAppliedRef.current = true;
  }, []);

  // Handle search form submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const newFilters = {
      ...filtersRef.current,
      search: searchInput,
      page: 1,
    };
    applyFilters(newFilters);
  }, [searchInput, applyFilters]);

  // Handle category filter
  const handleCategoryFilter = useCallback((categoryId) => {
    const newFilters = {
      ...filtersRef.current,
      category: categoryId === filtersRef.current.category ? '' : categoryId,
      page: 1,
    };
    applyFilters(newFilters);
  }, [applyFilters]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy, order = 'DESC') => {
    const newFilters = {
      ...filtersRef.current,
      sortBy,
      order,
    };
    applyFilters(newFilters);
  }, [applyFilters]);

  // Handle new topic button
  const handleNewTopic = useCallback(() => {
    navigate('/forum/new');
  }, [navigate]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Memoize calculated values
  const totalReplies = useMemo(() => 
    posts.reduce((sum, post) => sum + (post.commentCount || 0), 0),
    [posts]
  );

  const totalViews = useMemo(() => 
    posts.reduce((sum, post) => sum + (post.views || 0), 0),
    [posts]
  );

  // Loading skeleton
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton for page header */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Skeleton for sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-200 mr-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton for main content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 animate-pulse">
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table header skeleton */}
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-6 py-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>

                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-12 px-6 py-4 items-center border-b border-gray-100">
                    <div className="col-span-6 flex items-start">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="col-span-2">
                        <div className="h-4 bg-gray-200 rounded w-10 mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <Navbar/>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Forum</h1>
            <p className="text-gray-600">Connect with other athletes, share tips, and get advice</p>
          </div>
          <button
            onClick={handleNewTopic}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Topic
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleCategoryFilter('')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    !filters.category 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-100 mr-3"></div>
                    <span>All Categories</span>
                  </div>
                  <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {pagination?.total || 0}
                  </span>
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      filters.category === String(category.id)
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-full">
                      {category.postCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Forum Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Forum Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Topics</span>
                  <span className="font-semibold text-gray-800">{pagination?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Replies</span>
                  <span className="font-semibold text-gray-800">{totalReplies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-semibold text-gray-800">{totalViews}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Forum Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search forum topics..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="submit" className="absolute left-3 top-2.5">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSortChange('createdAt', 'DESC')}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      filters.sortBy === 'createdAt' && filters.order === 'DESC'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSortChange('likes', 'DESC')}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      filters.sortBy === 'likes'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Popular
                  </button>
                </div>
              </form>
            </div>

            {/* Topics Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="col-span-6 font-medium text-gray-700">Topic</div>
                <div className="col-span-2 font-medium text-gray-700 text-center">Replies</div>
                <div className="col-span-2 font-medium text-gray-700 text-center">Views</div>
                <div className="col-span-2 font-medium text-gray-700 text-center">Last Activity</div>
              </div>

              {/* Topics List */}
              <div className="divide-y divide-gray-100">
                {posts.length === 0 && !loading ? (
                  <div className="px-6 py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <p className="text-gray-500">No posts found. Be the first to start a discussion!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <Link 
                      key={post.id} 
                      to={`/topic/${post.id}`}
                      className="block hover:bg-blue-50 transition-colors"
                    >
                      <div className="grid grid-cols-12 px-6 py-4 items-center">
                        {/* Topic Title and Info */}
                        <div className="col-span-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-gray-800 font-medium hover:text-blue-600 transition-colors">
                                {post.title}
                              </h3>
                              <div className="flex items-center mt-1">
                                {post.category && (
                                  <span 
                                    className="text-xs font-medium px-2 py-0.5 rounded-full mr-3"
                                    style={{ 
                                      backgroundColor: `${post.category.color}20`,
                                      color: post.category.color 
                                    }}
                                  >
                                    {post.category.name}
                                  </span>
                                )}
                                <span className="text-sm text-gray-500">
                                  by {post.user?.username || 'Anonymous'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        <div className="col-span-2 text-center">
                          <div className="inline-flex items-center justify-center">
                            <span className="text-gray-800 font-medium">{post.commentCount || 0}</span>
                            <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                          </div>
                        </div>

                        {/* Views */}
                        <div className="col-span-2 text-center">
                          <div className="inline-flex items-center justify-center">
                            <span className="text-gray-800 font-medium">{post.views || 0}</span>
                            <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </div>
                        </div>

                        {/* Last Activity */}
                        <div className="col-span-2 text-center">
                          <span className="text-sm text-gray-600">
                            {formatDate(post.updatedAt || post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Pagination - Only show if there are posts */}
            {posts.length > 0 && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} topics
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Loading indicator for subsequent loads */}
            {loading && posts.length > 0 && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500 mt-2">Loading more posts...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;