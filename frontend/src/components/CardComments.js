import React, { useState, useEffect } from 'react';
import { commentsApi, activityApi } from '../services/api';

const CardComments = ({ cardId, userId }) => {
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchActivity();
  }, [cardId]);

  const fetchComments = async () => {
    try {
      const response = await commentsApi.getByCardId(cardId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await activityApi.getByCardId(cardId);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await commentsApi.create({
        cardId,
        userId,
        content: newComment,
      });
      setNewComment('');
      await fetchComments();
      await fetchActivity();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsApi.delete(commentId);
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="card-comments-section">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments ({comments.length})
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity ({activities.length})
        </button>
      </div>

      {activeTab === 'comments' && (
        <div className="comments-tab">
          <form onSubmit={handleAddComment} className="add-comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? 'Adding...' : 'Add Comment'}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.user_name || comment.user_email || 'Anonymous'}</strong>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <button
                    className="delete-comment-btn"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="activity-tab">
          <div className="activity-list">
            {activities.length === 0 ? (
              <p className="no-activity">No activity yet</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-header">
                    <strong>{activity.user_name || activity.user_email || 'System'}</strong>
                    <span className="activity-date">{formatDate(activity.created_at)}</span>
                  </div>
                  <div className="activity-action">{activity.action.replace(/_/g, ' ')}</div>
                  {activity.details && (
                    <div className="activity-details">{activity.details}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComments;
