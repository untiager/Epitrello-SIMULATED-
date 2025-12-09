import React, { useState, useEffect } from 'react';
import { templatesApi, boardsApi } from '../services/api';

const Templates = ({ onBoardCreated }) => {
  const [templates, setTemplates] = useState([]);
  const [boards, setBoards] = useState([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showUseTemplate, setShowUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    boardId: '',
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchBoards();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesApi.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await boardsApi.getAll();
      setBoards(response.data);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.boardId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await templatesApi.create(templateForm);
      alert('Template created successfully!');
      setShowCreateTemplate(false);
      setTemplateForm({ name: '', description: '', boardId: '', isPublic: true });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || !newBoardName) {
      alert('Please select a template and enter a board name');
      return;
    }

    setLoading(true);
    try {
      const response = await templatesApi.createBoard(selectedTemplate.id, {
        name: newBoardName,
        userId: null, // Add user ID if available
      });
      alert('Board created from template successfully!');
      setShowUseTemplate(false);
      setNewBoardName('');
      setSelectedTemplate(null);
      if (onBoardCreated) {
        onBoardCreated(response.data);
      }
    } catch (error) {
      console.error('Failed to create board from template:', error);
      alert('Failed to create board from template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await templatesApi.delete(templateId);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    }
  };

  return (
    <div className="templates-container">
      <div className="templates-header">
        <h2>Board Templates</h2>
        <div className="template-actions">
          <button onClick={() => setShowCreateTemplate(true)}>
            Create Template
          </button>
          <button onClick={() => setShowUseTemplate(true)} className="primary">
            Use Template
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {templates.length === 0 ? (
          <p>No templates available. Create one from an existing board!</p>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="template-card">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <div className="template-meta">
                <span>{template.is_public ? 'Public' : 'Private'}</span>
                <span>{new Date(template.created_at).toLocaleDateString()}</span>
              </div>
              <div className="template-actions">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowUseTemplate(true);
                  }}
                >
                  Use Template
                </button>
                <button onClick={() => handleDeleteTemplate(template.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateTemplate && (
        <div className="modal-overlay" onClick={() => setShowCreateTemplate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Template</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Select Board *</label>
                <select
                  value={templateForm.boardId}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, boardId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select a Board --</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={templateForm.isPublic}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, isPublic: e.target.checked })
                    }
                  />
                  Make template public
                </label>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Template'}
                </button>
                <button type="button" onClick={() => setShowCreateTemplate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUseTemplate && (
        <div className="modal-overlay" onClick={() => setShowUseTemplate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Board from Template</h2>
            <form onSubmit={handleUseTemplate}>
              {!selectedTemplate && (
                <div className="form-group">
                  <label>Select Template *</label>
                  <select
                    onChange={(e) => {
                      const template = templates.find(
                        (t) => t.id === parseInt(e.target.value)
                      );
                      setSelectedTemplate(template);
                    }}
                    required
                  >
                    <option value="">-- Select a Template --</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTemplate && (
                <>
                  <div className="selected-template">
                    <h3>{selectedTemplate.name}</h3>
                    <p>{selectedTemplate.description}</p>
                  </div>

                  <div className="form-group">
                    <label>New Board Name *</label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Enter board name"
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="submit" disabled={loading || !selectedTemplate}>
                  {loading ? 'Creating...' : 'Create Board'}
                </button>
                <button type="button" onClick={() => setShowUseTemplate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
