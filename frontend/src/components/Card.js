import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index }) => {
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
          <h4 className="card-title">{card.title}</h4>
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