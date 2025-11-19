import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Board from './components/Board';
import Modal from './components/Modal';
import { boardsApi, listsApi, cardsApi } from './services/api';

function App() {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (currentBoard) {
      loadLists(currentBoard.id);
    }
  }, [currentBoard]);

  useEffect(() => {
    if (lists.length > 0) {
      loadAllCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists]);

  const loadBoards = async () => {
    try {
      const response = await boardsApi.getAll();
      setBoards(response.data);
      if (response.data.length > 0) {
        setCurrentBoard(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async (boardId) => {
    try {
      const response = await listsApi.getByBoardId(boardId);
      setLists(response.data.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const loadAllCards = async () => {
    try {
      const allCards = [];
      for (const list of lists) {
        const response = await cardsApi.getByListId(list.id);
        allCards.push(...response.data);
      }
      setCards(allCards.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const createBoard = async (name, description) => {
    try {
      const response = await boardsApi.create({ name, description });
      setBoards([...boards, response.data]);
      setCurrentBoard(response.data);
      setShowBoardModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const createList = async (name) => {
    if (!currentBoard) return;
    
    try {
      const response = await listsApi.create({ 
        name, 
        boardId: currentBoard.id,
        position: lists.length 
      });
      setLists([...lists, response.data]);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const createCard = async (title, listId) => {
    try {
      const listCards = cards.filter(card => card.listId === listId);
      const response = await cardsApi.create({ 
        title, 
        listId,
        position: listCards.length 
      });
      setCards([...cards, response.data]);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const card = cards.find(c => c.id === draggableId);
    if (!card) return;

    const updatedCards = cards.filter(c => c.id !== draggableId);
    const newCard = {
      ...card,
      listId: destination.droppableId,
      position: destination.index
    };

    setCards([...updatedCards, newCard].sort((a, b) => a.position - b.position));

    try {
      await cardsApi.update(draggableId, {
        listId: destination.droppableId,
        position: destination.index
      });
    } catch (error) {
      console.error('Error updating card:', error);
      // Revert on error
      setCards(cards);
    }
  };

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="app">
        <header className="header">
          <h1>Epitrello</h1>
          <div>
            {boards.length > 0 && (
              <select 
                value={currentBoard?.id || ''} 
                onChange={(e) => {
                  const board = boards.find(b => b.id === e.target.value);
                  setCurrentBoard(board);
                }}
                style={{ marginRight: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {boards.map(board => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </select>
            )}
            <button 
              className="btn-primary" 
              onClick={() => setShowBoardModal(true)}
            >
              New Board
            </button>
          </div>
        </header>

        {currentBoard ? (
          <Board 
            board={currentBoard}
            lists={lists}
            cards={cards}
            onCreateList={createList}
            onCreateCard={createCard}
          />
        ) : (
          <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
            <h2>Welcome to Epitrello!</h2>
            <p>Create your first board to get started.</p>
            <button 
              className="btn-primary" 
              onClick={() => setShowBoardModal(true)}
            >
              Create Board
            </button>
          </div>
        )}

        {showBoardModal && (
          <Modal
            title="Create New Board"
            onClose={() => setShowBoardModal(false)}
            onSubmit={(data) => createBoard(data.name, data.description)}
            fields={[
              { name: 'name', label: 'Board Name', required: true },
              { name: 'description', label: 'Description', type: 'textarea' }
            ]}
          />
        )}
      </div>
    </DragDropContext>
  );
}

export default App;