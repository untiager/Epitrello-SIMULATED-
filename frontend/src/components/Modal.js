import React, { useState } from 'react';

const Modal = ({ title, onClose, onSubmit, fields }) => {
  const [formData, setFormData] = useState({});
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, attachments });
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            fileName: file.name,
            fileData: event.target.result,
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    const fileData = await Promise.all(filePromises);
    setAttachments(prev => [...prev, ...fileData]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label className="form-label">
                {field.label}
                {field.required && ' *'}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="form-textarea"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className="form-input"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
          
          <div className="form-group">
            <label className="form-label">Attachments</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="form-input"
              style={{ padding: '8px' }}
            />
            {attachments.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {attachments.map((att, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '4px 8px',
                    backgroundColor: '#f4f5f7',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '12px' }}>📎 {att.fileName}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;