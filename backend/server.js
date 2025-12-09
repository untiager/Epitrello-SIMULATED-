const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { initializeDatabase, migrateJsonData } = require('./db');
const { seedTemplates } = require('./seedTemplates');

const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');
const uploadRoutes = require('./routes/uploads');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const activityRoutes = require('./routes/activity');
const templateRoutes = require('./routes/templates');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
const dataFiles = ['boards.json', 'lists.json', 'cards.json'];
dataFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        const initialData = file === 'boards.json' ? [] : [];
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-board', (boardId) => {
        socket.join(`board-${boardId}`);
        console.log(`Client ${socket.id} joined board ${boardId}`);
    });

    socket.on('leave-board', (boardId) => {
        socket.leave(`board-${boardId}`);
        console.log(`Client ${socket.id} left board ${boardId}`);
    });

    socket.on('card-created', (data) => {
        socket.to(`board-${data.boardId}`).emit('card-created', data.card);
    });

    socket.on('card-updated', (data) => {
        socket.to(`board-${data.boardId}`).emit('card-updated', data.card);
    });

    socket.on('card-deleted', (data) => {
        socket.to(`board-${data.boardId}`).emit('card-deleted', data.cardId);
    });

    socket.on('list-created', (data) => {
        socket.to(`board-${data.boardId}`).emit('list-created', data.list);
    });

    socket.on('list-updated', (data) => {
        socket.to(`board-${data.boardId}`).emit('list-updated', data.list);
    });

    socket.on('list-deleted', (data) => {
        socket.to(`board-${data.boardId}`).emit('list-deleted', data.listId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Epitrello API is running' });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database schema
        await initializeDatabase();
        
        // Seed default templates
        await seedTemplates();
        
        // Migrate existing JSON data if database is empty
        // await migrateJsonData(); // Uncomment if you want to migrate existing data
        
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('Database initialized successfully');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();