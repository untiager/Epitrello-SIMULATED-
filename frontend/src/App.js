import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Board from './components/Board';
import Modal from './components/Modal';
import Notifications from './components/Notifications';
import Login from './components/Login';
import { boardsApi, listsApi, cardsApi, uploadsApi } from './services/api';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';

function App() {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowLogin(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogin(true);
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socket || !currentBoard) return;

    socket.emit('join-board', currentBoard.id);

    socket.on('card-created', (card) => {
      setCards(prev => [...prev, card]);
    });

    socket.on('card-updated', (updatedCard) => {
      setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    });

    socket.on('card-deleted', (cardId) => {
      setCards(prev => prev.filter(c => c.id !== cardId));
    });

    socket.on('list-created', (list) => {
      setLists(prev => [...prev, list]);
    });

    socket.on('list-updated', (updatedList) => {
      setLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
    });

    socket.on('list-deleted', (listId) => {
      setLists(prev => prev.filter(l => l.id !== listId));
      setCards(prev => prev.filter(c => c.listId !== listId));
    });

    return () => {
      socket.emit('leave-board', currentBoard.id);
      socket.off('card-created');
      socket.off('card-updated');
      socket.off('card-deleted');
      socket.off('list-created');
      socket.off('list-updated');
      socket.off('list-deleted');
    };
  }, [socket, currentBoard]);

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
      if (socket) {
        socket.emit('list-created', { boardId: currentBoard.id, list: response.data });
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const createCard = async (cardData, listId) => {
    try {
      const listCards = cards.filter(card => card.listId === listId);
      
      // Upload attachments if any
      let uploadedAttachments = [];
      if (cardData.attachments && cardData.attachments.length > 0) {
        const cardId = Date.now().toString();
        const uploadPromises = cardData.attachments.map(async (att) => {
          try {
            const uploadResponse = await uploadsApi.upload({
              fileName: att.fileName,
              fileData: att.fileData,
              cardId: cardId
            });
            return {
              fileName: att.fileName,
              storedName: uploadResponse.data.storedName,
              size: att.size
            };
          } catch (err) {
            console.error('Error uploading file:', err);
            return null;
          }
        });
        uploadedAttachments = (await Promise.all(uploadPromises)).filter(a => a !== null);
      }

      const response = await cardsApi.create({ 
        title: typeof cardData === 'string' ? cardData : cardData.title,
        description: typeof cardData === 'object' ? cardData.description : '',
        dueDate: typeof cardData === 'object' ? cardData.dueDate : null,
        attachments: uploadedAttachments,
        listId,
        position: listCards.length 
      });
      setCards([...cards, response.data]);
      if (socket && currentBoard) {
        socket.emit('card-created', { boardId: currentBoard.id, card: response.data });
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const deleteCard = async (cardId) => {
    try {
      await cardsApi.delete(cardId);
      setCards(cards.filter(c => c.id !== cardId));
      if (socket && currentBoard) {
        socket.emit('card-deleted', { boardId: currentBoard.id, cardId });
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const deleteList = async (listId) => {
    try {
      await listsApi.delete(listId);
      // Also remove all cards associated with this list
      setCards(cards.filter(c => c.listId !== listId));
      setLists(lists.filter(l => l.id !== listId));
      if (socket && currentBoard) {
        socket.emit('list-deleted', { boardId: currentBoard.id, listId });
      }
    } catch (error) {
      console.error('Error deleting list:', error);
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

  if (showLogin) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="app">
        <Notifications cards={cards} />
        <header className="header">
          <h1>Epitrello</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user && !user.isGuest && (
              <span style={{ color: 'white', marginRight: '10px' }}>
                👤 {user.username}
              </span>
            )}
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
            {user && (
              <button 
                className="btn-secondary" 
                onClick={handleLogout}
                style={{ marginLeft: '10px' }}
              >
                Logout
              </button>
            )}
          </div>
        </header>

        {currentBoard ? (
          <Board 
            board={currentBoard}
            lists={lists}
            cards={cards}
            onCreateList={createList}
            onCreateCard={createCard}
            onDeleteCard={deleteCard}
            onDeleteList={deleteList}
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