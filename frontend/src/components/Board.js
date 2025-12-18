import React, { useState } from 'react';
import List from './List';
import Modal from './Modal';
import SearchBar from './SearchBar';

const Board = ({ board, lists, cards, onCreateList, onCreateCard, onDeleteCard, onDeleteList, onCardClick }) => {
  const [showListModal, setShowListModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const handleCreateList = (data) => {
    onCreateList(data.name);
    setShowListModal(false);
  };

  // If search results are shown, display them instead of normal board
  if (searchResults !== null && searchResults.length > 0) {
    return (
      <>
        <div style={{ padding: '20px' }}>
          <SearchBar onSearchResults={setSearchResults} boardId={board.id} />
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              Search Results ({searchResults.length} cards found)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {searchResults.map(card => (
                <div
                  key={card.id}
                  className="card"
                  onClick={() => onCardClick(card)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="card-title">{card.title}</h4>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
                          onDeleteCard(card.id);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0 4px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {card.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b778c' }}>
                      {card.description}
                    </p>
                  )}
                  {card.dueDate && (
                    <div style={{ marginTop: '8px', fontSize: '11px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#e3e8ef', color: '#172b4d' }}>
                      📅 {card.dueDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Normal board view with search bar
  return (
    <>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #e1e4e8' }}>
        <SearchBar onSearchResults={(results) => {
          if (results.length > 0) {
            setSearchResults(results);
          } else {
            setSearchResults(null);
          }
        }} boardId={board.id} />
        {searchResults !== null && searchResults.length === 0 && (
          <div style={{ marginTop: '10px', color: '#6b778c', fontSize: '14px' }}>
            No results found
          </div>
        )}
        {searchResults !== null && searchResults.length === 0 && (
          <button
            onClick={() => setSearchResults(null)}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              backgroundColor: '#172b4d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Board
          </button>
        )}
      </div>
      
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