# Epitrello - A Trello-like Project Management Tool

Epitrello is a simple, web-based project management application inspired by Trello. It allows you to create boards, organize tasks in lists, and manage cards with drag-and-drop functionality.

## Features

### Core Features (Delivered 5/12)
- **Board Management**: Create and manage multiple project boards
- **List Organization**: Create lists to organize your workflow
- **Card Management**: Add, edit, and organize task cards
- **Delete Operations**: Delete cards and lists with confirmation dialogs
- **Drag & Drop**: Move cards between lists with intuitive drag-and-drop
- **Due Dates**: Set due dates on cards with visual indicators for overdue items
- **Notifications**: Real-time notifications for due dates and overdue cards
- **File Attachments**: Upload and attach files to cards
- **User Authentication**: Register and login with secure authentication
- **Real-time Collaboration**: WebSocket-powered live updates across users

### Advanced Features (Delivered 18/12)
- **Database Integration**: PostgreSQL database with full schema and migrations
- **Advanced Search & Filtering**: Search cards by text, due date, comments, and attachments
- **Card Comments**: Add, view, and delete comments on cards
- **Activity History**: Track all card and board activities with timestamps
- **Board Templates**: Create templates from existing boards and instantiate new boards
- **Quick Filters**: View overdue and due-soon cards instantly

### Infrastructure
- **Data Persistence**: PostgreSQL database with JSON file fallback
- **Docker Support**: Multi-container setup with PostgreSQL, backend, and frontend

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Beautiful DnD** - Drag and drop functionality
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with Trello-inspired design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **PostgreSQL** - Relational database for data persistence
- **pg (node-postgres)** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing support
- **Crypto** - Password hashing and token generation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration (PostgreSQL, Backend, Frontend)
- **PostgreSQL 15** - Database container with Alpine Linux

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
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Board.js     # Main board component
│   │   │   ├── List.js      # List component with delete functionality
│   │   │   ├── Card.js      # Card component with due dates & attachments
│   │   │   ├── Modal.js     # Modal component for forms with file upload
│   │   │   ├── CardDetailModal.js  # Enhanced card view with comments (NEW)
│   │   │   ├── CardComments.js     # Comments and activity UI (NEW)
│   │   │   ├── SearchBar.js        # Advanced search interface (NEW)
│   │   │   ├── Templates.js        # Template management UI (NEW)
│   │   │   ├── Login.js     # Authentication component
│   │   │   └── Notifications.js  # Due date notification system
│   │   ├── services/        # API services
│   │   │   └── api.js       # API client (boards, lists, cards, uploads, comments, activity, templates, search)
│   │   ├── App.js           # Main app with WebSocket integration
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── backend/                 # Node.js/Express backend
│   ├── routes/              # API route handlers
│   │   ├── boards.js        # Board CRUD operations
│   │   ├── lists.js         # List CRUD operations
│   │   ├── cards.js         # Card CRUD with due dates & attachments
│   │   ├── auth.js          # User authentication endpoints
│   │   ├── uploads.js       # File upload/download handlers
│   │   ├── comments.js      # Card comments endpoints (NEW)
│   │   ├── activity.js      # Activity logging endpoints (NEW)
│   │   ├── templates.js     # Board templates endpoints (NEW)
│   │   └── search.js        # Advanced search endpoints (NEW)
│   ├── data/                # JSON data storage (legacy)
│   │   ├── boards.json      # Boards data
│   │   ├── lists.json       # Lists data
│   │   ├── cards.json       # Cards data
│   │   └── users.json       # User accounts
│   ├── uploads/             # File attachment storage
│   ├── db.js                # PostgreSQL database configuration (NEW)
│   ├── server.js            # Express server with Socket.IO & DB
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current authenticated user

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
- `POST /api/cards` - Create a new card (supports dueDate and attachments)
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card

### File Uploads
- `POST /api/uploads/upload` - Upload a file attachment
- `GET /api/uploads/download/:fileName` - Download a file
- `DELETE /api/uploads/:fileName` - Delete a file

### Comments
- `GET /api/comments/card/:cardId` - Get all comments for a card
- `POST /api/comments` - Create a new comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment

### Activity Logs
- `GET /api/activity/card/:cardId` - Get activity log for a card
- `GET /api/activity/board/:boardId` - Get activity log for a board
- `POST /api/activity` - Create an activity log entry

### Templates
- `GET /api/templates` - Get all board templates
- `GET /api/templates/:id` - Get a specific template
- `POST /api/templates` - Create a template from a board
- `POST /api/templates/:id/create-board` - Create a board from a template
- `DELETE /api/templates/:id` - Delete a template

### Search & Filtering
- `GET /api/search` - Advanced search with filters (query, boardId, dates, etc.)
- `GET /api/search/boards` - Search boards by name/description
- `GET /api/search/overdue` - Get overdue cards
- `GET /api/search/due-soon` - Get cards due in the next 7 days

## Usage

### Basic Operations
1. **Login/Register**: On first visit, create an account or continue as guest
2. **Create a Board**: Click "New Board" to create your first project board
3. **Add Lists**: Click "+ Add a list" to create workflow columns (e.g., "To Do", "In Progress", "Done")
4. **Create Cards**: Click "+ Add a card" to add tasks to your lists
5. **Set Due Dates**: Add due dates when creating cards - overdue cards show in red, due soon in yellow
6. **Attach Files**: Upload files when creating cards using the file attachment option
7. **Drag & Drop**: Move cards between lists by dragging them
8. **Delete**: Use the × button on cards or 🗑️ on lists to delete them
9. **Real-time Updates**: Changes sync automatically across all connected users

### Advanced Features
10. **View Card Details**: Click on a card to open detailed view with comments and activity
11. **Add Comments**: In card detail view, write comments to collaborate with team members
12. **Track Activity**: View all card activities and changes in the Activity tab
13. **Search Cards**: Use the search bar to find cards by title, description, or filters
14. **Advanced Filtering**: Filter by due date range, cards with comments, or attachments
15. **Quick Filters**: Instantly view overdue cards or cards due in the next 7 days
16. **Create Templates**: Save a board as a template for reuse
17. **Use Templates**: Create new boards from existing templates with one click

## Data Persistence

The application uses PostgreSQL for data storage:
- **Database**: PostgreSQL 15 running in a Docker container
- **Schema**: Automatically initialized on first startup
- **Tables**: users, boards, lists, cards, comments, activity_logs, attachments, board_templates
- **Migrations**: JSON data can be migrated to PostgreSQL using the migration function
- **File Attachments**: Stored in `backend/uploads/` directory
- **Volumes**: PostgreSQL data persists through Docker volume `postgres-data`
- **Backup**: All data can be backed up using standard PostgreSQL tools (pg_dump)

### Database Schema
- **users**: User accounts with authentication
- **boards**: Project boards with optional templates
- **lists**: Task lists within boards
- **cards**: Task cards with due dates and descriptions
- **comments**: Card comments with user attribution
- **activity_logs**: Activity tracking for cards and boards
- **attachments**: File attachment metadata
- **board_templates**: Reusable board templates

## Development Notes

- The frontend uses React Beautiful DnD for drag-and-drop functionality
- The backend provides a RESTful API with full CRUD operations
- Real-time collaboration powered by Socket.IO WebSockets
- Database operations use parameterized queries to prevent SQL injection
- User authentication with SHA-256 password hashing
- File uploads support base64 encoding with size limits (50MB)
- Due dates displayed in DD/MM/YYYY format with PostgreSQL timestamp support
- Visual indicators: red (overdue), yellow (due soon), gray (future)
- CORS is enabled for cross-origin requests during development
- The application follows a component-based architecture
- Comments and activity logs are automatically tracked in the database
- Advanced search uses PostgreSQL full-text search and filtering
- Templates stored as JSONB for flexible structure

## Future Enhancements

Completed features (delivered 5/12):
- Possibility to delete cards and lists
- User authentication and authorization
- Real-time collaboration with WebSockets
- Card due dates and notifications
- File attachments

Completed features (delivered 18/12):
- Database integration (PostgreSQL)
- Advanced search and filtering
- Card comments and activity history
- Board templates

Potential features for future releases:
- Email notifications for due dates and mentions
- Card labels and tags for better organization
- Advanced permission system (view, edit, admin roles)
- Card checklists and subtasks
- Board sharing with external users
- Export boards to PDF or CSV
- Calendar view for due dates
- Mobile responsive design improvements
- API rate limiting and authentication tokens
- Automated backups and restore functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.