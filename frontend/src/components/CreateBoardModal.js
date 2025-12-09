import React, { useState, useEffect } from 'react';
import { templatesApi } from '../services/api';

const CreateBoardModal = ({ onClose, onSubmit }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesApi.getAll();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setTemplates([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!boardName.trim()) {
      alert('Please enter a board name');
      return;
    }

    setLoading(true);
    try {
      if (selectedTemplate) {
        // Create board from template
        await onSubmit({ templateId: selectedTemplate, name: boardName });
      } else {
        // Create blank board
        await onSubmit({ name: boardName, description: boardDescription });
      }
    } catch (error) {
      console.error('Failed to create board:', error);
      alert('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Create New Board</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Board Name *</label>
            <input
              type="text"
              className="form-input"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Enter board name"
              required
            />
          </div>

          {!selectedTemplate && (
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                placeholder="Enter board description (optional)"
                rows="3"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Choose a Template (Optional)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '12px',
              marginTop: '8px'
            }}>
              {/* Blank board option */}
              <div
                onClick={() => setSelectedTemplate(null)}
                style={{
                  padding: '16px',
                  border: selectedTemplate === null ? '2px solid #0079bf' : '2px solid #dfe1e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  backgroundColor: selectedTemplate === null ? '#e4f0f6' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Blank Board</div>
                <div style={{ fontSize: '12px', color: '#6b778c', marginTop: '4px' }}>
                  Start from scratch
                </div>
              </div>

              {/* Template options */}
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  style={{
                    padding: '16px',
                    border: selectedTemplate === template.id ? '2px solid #0079bf' : '2px solid #dfe1e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: selectedTemplate === template.id ? '#e4f0f6' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {template.name.toLowerCase().includes('kanban') ? '📊' :
                     template.name.toLowerCase().includes('project') ? '🎯' :
                     template.name.toLowerCase().includes('sprint') ? '⚡' :
                     template.name.toLowerCase().includes('todo') ? '✅' : '📁'}
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{template.name}</div>
                  {template.description && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#6b778c', 
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {template.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {templates.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#6b778c',
                fontSize: '14px'
              }}>
                No templates available yet
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'flex-end',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
