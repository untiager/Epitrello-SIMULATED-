import React, { useState } from 'react';
import List from './List';
import Modal from './Modal';

const Board = ({ board, lists, cards, onCreateList, onCreateCard, onDeleteCard, onDeleteList, onCardClick }) => {
  const [showListModal, setShowListModal] = useState(false);

  const handleCreateList = (data) => {
    onCreateList(data.name);
    setShowListModal(false);
  };

  return (
    <>
      <div className="board">
        {lists.map(list => (
          <List
            key={list.id}
            list={list}
            cards={cards.filter(card => card.listId === list.id)}
            onCreateCard={onCreateCard}
            onDeleteCard={onDeleteCard}
            onDeleteList={onDeleteList}
            onCardClick={onCardClick}
          />
        ))}
        <button 
          className="add-list"
          onClick={() => setShowListModal(true)}
        >
          + Add a list
        </button>
      </div>

      {showListModal && (
        <Modal
          title="Create New List"
          onClose={() => setShowListModal(false)}
          onSubmit={handleCreateList}
          fields={[
            { name: 'name', label: 'List Name', required: true }
          ]}
        />
      )}
    </>
  );
};

export default Board;