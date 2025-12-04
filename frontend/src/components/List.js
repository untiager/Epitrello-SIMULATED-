import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import Modal from './Modal';

const List = ({ list, cards, onCreateCard, onDeleteCard, onDeleteList }) => {
  const [showCardModal, setShowCardModal] = useState(false);

  const handleCreateCard = (data) => {
    onCreateCard(data, list.id);
    setShowCardModal(false);
  };

  const handleDeleteList = () => {
    if (window.confirm(`Are you sure you want to delete "${list.name}" and all its cards?`)) {
      onDeleteList(list.id);
    }
  };

  return (
    <>
      <div className="list">
        <div className="list-header">
          <h3 className="list-title">{list.name}</h3>
          <div className="list-actions">
            <button 
              className="btn"
              onClick={() => setShowCardModal(true)}
              title="Add card"
            >
              +
            </button>
            <button 
              className="btn"
              onClick={handleDeleteList}
              style={{ marginLeft: '4px', color: '#dc3545' }}
              title="Delete list"
            >
              🗑
            </button>
          </div>
        </div>
        
        <Droppable droppableId={list.id}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                backgroundColor: snapshot.isDraggingOver ? '#f4f5f7' : 'transparent',
                minHeight: '20px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
              }}
            >
              {cards.map((card, index) => (
                <Card key={card.id} card={card} index={index} onDelete={onDeleteCard} />
              ))}
              {provided.placeholder}
              
              <div 
                className="add-card"
                onClick={() => setShowCardModal(true)}
              >
                + Add a card
              </div>
            </div>
          )}
        </Droppable>
      </div>

      {showCardModal && (
        <Modal
          title="Create New Card"
          onClose={() => setShowCardModal(false)}
          onSubmit={handleCreateCard}
          fields={[
            { name: 'title', label: 'Card Title', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'dueDate', label: 'Due Date', type: 'date' }
          ]}
        />
      )}
    </>
  );
};

export default List;