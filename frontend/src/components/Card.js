import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      onDelete(card.id);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? `${provided.draggableProps.style?.transform} rotate(5deg)` 
              : provided.draggableProps.style?.transform,
            opacity: snapshot.isDragging ? 0.8 : 1,
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
        </div>
      )}
    </Draggable>
  );
};

export default Card;