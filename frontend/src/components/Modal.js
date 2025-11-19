import React, { useState } from 'react';

const Modal = ({ title, onClose, onSubmit, fields }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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