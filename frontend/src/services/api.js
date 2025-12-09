import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const boardsApi = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
};

export const listsApi = {
  getByBoardId: (boardId) => api.get(`/lists/board/${boardId}`),
  getById: (id) => api.get(`/lists/${id}`),
  create: (data) => api.post('/lists', data),
  update: (id, data) => api.put(`/lists/${id}`, data),
  delete: (id) => api.delete(`/lists/${id}`),
};

export const cardsApi = {
  getByListId: (listId) => api.get(`/cards/list/${listId}`),
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
};

export const uploadsApi = {
  upload: (data) => api.post('/uploads/upload', data),
  download: (fileName) => api.get(`/uploads/download/${fileName}`),
  delete: (fileName) => api.delete(`/uploads/${fileName}`),
};

export const commentsApi = {
  getByCardId: (cardId) => api.get(`/comments/card/${cardId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const activityApi = {
  getByCardId: (cardId) => api.get(`/activity/card/${cardId}`),
  getByBoardId: (boardId) => api.get(`/activity/board/${boardId}`),
  create: (data) => api.post('/activity', data),
};

export const templatesApi = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  createBoard: (id, data) => api.post(`/templates/${id}/create-board`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

export const searchApi = {
  search: (params) => api.get('/search', { params }),
  searchBoards: (params) => api.get('/search/boards', { params }),
  getOverdue: (params) => api.get('/search/overdue', { params }),
  getDueSoon: (params) => api.get('/search/due-soon', { params }),
};