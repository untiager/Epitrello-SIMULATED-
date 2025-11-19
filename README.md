# Epitrello - A Trello-like Project Management Tool

Epitrello is a simple, web-based project management application inspired by Trello. It allows you to create boards, organize tasks in lists, and manage cards with drag-and-drop functionality.

## Features

- 📋 **Board Management**: Create and manage multiple project boards
- 📝 **List Organization**: Create lists to organize your workflow
- 🎯 **Card Management**: Add, edit, and organize task cards
- 🖱️ **Drag & Drop**: Move cards between lists with intuitive drag-and-drop
- 💾 **Data Persistence**: All data is stored in JSON files for simplicity
- 🐳 **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Beautiful DnD** - Drag and drop functionality
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with Trello-inspired design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **File System** - JSON file storage for persistence
- **CORS** - Cross-origin resource sharing support

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd epitrello
   ```

2. **Launch with Docker Compose**
   ```bash
   sudo docker-compose up --build
   ```
   Note: You may need `sudo` for Docker permissions.

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

That's it! The application will be running with both frontend and backend containers.

## Alternative: Local Development (No Docker)

If you prefer to run without Docker or encounter permission issues:

1. **Start the Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend will run on http://localhost:3001

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3000

This approach is great for development and doesn't require Docker setup.

## Development Setup

If you prefer to run the services individually for development:

### Prerequisites
- Node.js 18+ 
- npm

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Runs with nodemon for auto-restart
```

### Frontend Setup
```bash
cd frontend
npm install
npm start   # Runs React development server
```

## Project Structure

```
epitrello/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Board.js     # Main board component
│   │   │   ├── List.js      # List component
│   │   │   ├── Card.js      # Card component
│   │   │   └── Modal.js     # Modal component for forms
│   │   ├── services/        # API services
│   │   │   └── api.js       # API client configuration
│   │   ├── App.js           # Main app component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── backend/                  # Node.js/Express backend
│   ├── routes/              # API route handlers
│   │   ├── boards.js        # Board CRUD operations
│   │   ├── lists.js         # List CRUD operations
│   │   └── cards.js         # Card CRUD operations
│   ├── data/                # JSON data storage
│   │   ├── boards.json      # Boards data
│   │   ├── lists.json       # Lists data
│   │   └── cards.json       # Cards data
│   ├── server.js            # Express server setup
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Docker orchestration
└── README.md
```

## API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get a specific board
- `POST /api/boards` - Create a new board
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board

### Lists
- `GET /api/lists/board/:boardId` - Get all lists for a board
- `GET /api/lists/:id` - Get a specific list
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id` - Update a list
- `DELETE /api/lists/:id` - Delete a list

### Cards
- `GET /api/cards/list/:listId` - Get all cards for a list
- `GET /api/cards/:id` - Get a specific card
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card

## Usage

1. **Create a Board**: Click "New Board" to create your first project board
2. **Add Lists**: Click "+ Add a list" to create workflow columns (e.g., "To Do", "In Progress", "Done")
3. **Create Cards**: Click "+ Add a card" to add tasks to your lists
4. **Drag & Drop**: Move cards between lists by dragging them
5. **Edit**: Click on cards to edit their content

## Data Persistence

The application uses simple JSON file storage:
- Data is stored in the `backend/data/` directory
- Files are automatically created on first run
- Data persists between container restarts through Docker volumes

## Development Notes

- The frontend uses React Beautiful DnD for drag-and-drop functionality
- The backend provides a RESTful API with full CRUD operations
- CORS is enabled for cross-origin requests during development
- The application follows a component-based architecture

## Future Enhancements

Potential features to add:
- User authentication and authorization
- Real-time collaboration with WebSockets
- Card due dates and notifications
- File attachments
- Database integration (PostgreSQL/MongoDB)
- Advanced search and filtering
- Card comments and activity history

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.