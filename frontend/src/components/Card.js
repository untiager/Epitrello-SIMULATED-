import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onDelete, onClick }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      onDelete(card.id);
    }
  };

  const handleClick = (e) => {
    // Don't open modal if clicking delete button
    if (e.target.closest('.delete-btn')) {
      return;
    }
    onClick(card);
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && new Date(card.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    // Parse the date string directly to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? `${provided.draggableProps.style?.transform} rotate(5deg)` 
              : provided.draggableProps.style?.transform,
            opacity: snapshot.isDragging ? 0.8 : 1,
            borderLeft: isOverdue ? '3px solid #dc3545' : (isDueSoon && !isOverdue) ? '3px solid #ffc107' : 'none',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 className="card-title" style={{ flex: 1 }}>{card.title}</h4>
            <button
              className="delete-btn"
              onClick={handleDelete}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 4px',
                marginLeft: '8px'
              }}
              title="Delete card"
            >
              ×
            </button>
          </div>
          {card.description && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b778c' }}>
              {card.description}
            </p>
          )}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {card.dueDate && (
              <span 
                style={{ 
                  fontSize: '11px', 
                  padding: '2px 6px', 
                  borderRadius: '3px',
                  backgroundColor: isOverdue ? '#dc3545' : (isDueSoon && !isOverdue) ? '#ffc107' : '#e3e8ef',
                  color: (isOverdue || (isDueSoon && !isOverdue)) ? 'white' : '#172b4d',
                  fontWeight: '500'
                }}
              >
                📅 {formatDate(card.dueDate)}
              </span>
            )}
            {card.attachments && card.attachments.length > 0 && (
              <span 
                style={{ 
                  fontSize: '11px', 
                  padding: '2px 6px', 
                  borderRadius: '3px',
                  backgroundColor: '#e3e8ef',
                  color: '#172b4d',
                  fontWeight: '500'
                }}
              >
                📎 {card.attachments.length}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;