const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple file upload endpoint (base64)
router.post('/upload', (req, res) => {
    try {
        const { fileName, fileData, cardId } = req.body;
        
        if (!fileName || !fileData || !cardId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a unique filename
        const timestamp = Date.now();
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${cardId}_${timestamp}_${safeFileName}`;
        const filePath = path.join(uploadsDir, uniqueFileName);

        // Decode base64 and save file
        const base64Data = fileData.replace(/^data:.*?;base64,/, '');
        fs.writeFileSync(filePath, base64Data, 'base64');

        res.status(201).json({
            fileName: fileName,
            storedName: uniqueFileName,
            size: fs.statSync(filePath).size,
            uploadedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Download file endpoint
router.get('/download/:fileName', (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.fileName);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Delete file endpoint
router.delete('/:fileName', (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.fileName);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;
