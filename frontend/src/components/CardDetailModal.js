import React, { useState } from 'react';
import CardComments from './CardComments';

const CardDetailModal = ({ card, onClose, onUpdate, userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState({ ...card });

  const handleSave = () => {
    onUpdate(editedCard);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedCard(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content card-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {isEditing ? (
            <input
              type="text"
              value={editedCard.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="form-input"
              style={{ fontSize: '20px', fontWeight: 'bold' }}
            />
          ) : (
            <h2 className="modal-title">{card.title}</h2>
          )}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="card-detail-content">
          <div className="card-section">
            <h3>Description</h3>
            {isEditing ? (
              <textarea
                value={editedCard.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-textarea"
                rows="4"
              />
            ) : (
              <p>{card.description || 'No description'}</p>
            )}
          </div>

          <div className="card-section">
            <h3>Due Date</h3>
            {isEditing ? (
              <input
                type="date"
                value={editedCard.dueDate ? editedCard.dueDate.split('T')[0] : ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="form-input"
              />
            ) : (
              <p>{formatDate(card.dueDate)}</p>
            )}
          </div>

          {card.attachments && card.attachments.length > 0 && (
            <div className="card-section">
              <h3>Attachments ({card.attachments.length})</h3>
              <div className="attachments-list">
                {card.attachments.map((att, idx) => (
                  <div key={idx} className="attachment-item">
                    📎 {att.fileName}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-actions-section">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary">
                  Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Card
              </button>
            )}
          </div>

          <CardComments cardId={card.id} userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
