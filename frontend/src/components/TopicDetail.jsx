import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaUser, FaCalendarAlt, FaComment, FaEye, 
  FaHeart, FaShareAlt, FaEllipsisV, FaTag,
  FaEdit, FaTrash, FaArrowLeft
} from 'react-icons/fa';

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/forum/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTopic(data.data);
        setLikeCount(data.data.likeCount || data.data.likes || 0);
        setIsLiked(data.data.isLikedByUser || false);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to load topic');
      console.error('Fetch topic error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/forum/posts/${id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsLiked(data.data.liked);
        setLikeCount(data.data.likes);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/forum/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        const data = await response.json();
        
        if (data.success) {
          navigate('/forum');
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading topic...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/forum')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Topic not found</div>
      </div>
    );
  }

  const isOwner = topic.author?.id === JSON.parse(localStorage.getItem('user'))?.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition duration-200"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        {/* Main Topic Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                  {topic.author?.avatar ? (
                    <img 
                      src={topic.author.avatar} 
                      alt={topic.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-500 text-xl" />
                  )}
                </div>
                <div>
                  <Link 
                    to={`/profile/${topic.author?.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition duration-200"
                  >
                    {topic.author?.username || 'Anonymous'}
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FaCalendarAlt className="mr-1" />
                    {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Options Menu */}
              {isOwner && (
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 rounded-full hover:bg-gray-100 transition duration-200"
                  >
                    <FaEllipsisV className="text-gray-500" />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                      <button 
                        onClick={() => navigate(`/forum/edit/${topic.id}`)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center text-gray-700"
                      >
                        <FaEdit className="mr-3 text-gray-500" /> Edit
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center text-red-600"
                      >
                        <FaTrash className="mr-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{topic.title}</h1>
            
            <div className="prose max-w-none text-gray-700 mb-6 whitespace-pre-wrap">
              {topic.content}
            </div>

            {/* Tags */}
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {topic.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    <FaTag className="mr-1" size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Category */}
            {topic.category && (
              <Link 
                to={`/forum/category/${topic.category.id}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {topic.category.name}
              </Link>
            )}
          </div>

          {/* Footer - Stats */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 rounded-lg transition duration-200 ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaHeart className={`mr-2 ${isLiked ? 'text-red-500' : ''}`} />
                  <span className="font-medium">{likeCount}</span>
                  <span className="ml-1">{likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>
                
                <div className="flex items-center text-gray-600">
                  <FaComment className="mr-2" />
                  <span className="font-medium">{topic.comments?.length || 0}</span>
                  <span className="ml-1">Comments</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FaEye className="mr-2" />
                  <span className="font-medium">{topic.viewCount || 0}</span>
                  <span className="ml-1">Views</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-200"
              >
                <FaShareAlt className="mr-2" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Comments ({topic.comments?.length || 0})
          </h3>
          
          {topic.comments && topic.comments.length > 0 ? (
            <div className="space-y-4">
              {/* Comment list would go here */}
              <p className="text-gray-500 italic">Comments feature coming soon...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No comments yet</div>
              <p className="text-gray-500">Be the first to comment!</p>
            </div>
          )}
          
          {/* Comment Form */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <textarea 
              placeholder="Add a comment..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              rows="3"
            />
            <div className="flex justify-end mt-3">
              <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200">
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;