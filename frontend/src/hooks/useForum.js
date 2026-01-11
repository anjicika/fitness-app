import { useState, useEffect, useCallback, useRef } from 'react';
import { forumApi } from '../api/forum';

export const useForumPosts = (initialParams = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Use refs to prevent infinite loops
  const initialLoadRef = useRef(true);
  const prevParamsRef = useRef(initialParams);
  const prevPageRef = useRef(1);

  const fetchPosts = useCallback(async (params = {}) => {
    // Prevent duplicate calls
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await forumApi.getPosts({
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      });
      
      if (response.data.success) {
        setPosts(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError({
        code: 'FETCH_ERROR',
        message: err.response?.data?.error?.message || 'Failed to load posts',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, loading]);

  // Custom effect to fetch posts only when needed
  useEffect(() => {
    const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(initialParams);
    const pageChanged = prevPageRef.current !== pagination.page;
    
    // Only fetch if:
    // 1. It's the initial load, OR
    // 2. Params changed, OR
    // 3. Page changed
    if (initialLoadRef.current || paramsChanged || pageChanged) {
      fetchPosts(initialParams);
      initialLoadRef.current = false;
      prevParamsRef.current = initialParams;
      prevPageRef.current = pagination.page;
    }
  }, [initialParams, pagination.page, fetchPosts]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return {
    posts,
    loading,
    error,
    pagination,
    fetchPosts,
    handlePageChange,
  };
};

export const useForumCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (hasFetchedRef.current || loading) return;
    
    try {
      setLoading(true);
      const response = await forumApi.getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      setError({
        code: 'FETCH_ERROR',
        message: 'Failed to load categories',
      });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, fetchCategories };
};

// Rest of the file remains the same...