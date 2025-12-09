const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'epitrello',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create boards table
        await client.query(`
            CREATE TABLE IF NOT EXISTS boards (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                is_template BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create lists table
        await client.query(`
            CREATE TABLE IF NOT EXISTS lists (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
                position INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create cards table
        await client.query(`
            CREATE TABLE IF NOT EXISTS cards (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
                position INTEGER DEFAULT 0,
                due_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create attachments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS attachments (
                id SERIAL PRIMARY KEY,
                card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                file_size INTEGER,
                mime_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create comments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create activity_logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(100) NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create board_templates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS board_templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                template_data JSONB NOT NULL,
                is_public BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query('COMMIT');
        console.log('Database schema initialized successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Migration function to import existing JSON data
async function migrateJsonData() {
    const client = await pool.connect();
    try {
        const dataDir = path.join(__dirname, 'data');
        
        // Check if JSON files exist
        const boardsPath = path.join(dataDir, 'boards.json');
        const listsPath = path.join(dataDir, 'lists.json');
        const cardsPath = path.join(dataDir, 'cards.json');
        const usersPath = path.join(dataDir, 'users.json');

        if (fs.existsSync(boardsPath)) {
            const boards = JSON.parse(fs.readFileSync(boardsPath, 'utf8'));
            for (const board of boards) {
                await client.query(
                    'INSERT INTO boards (name, description, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                    [board.name, board.description || '', board.createdAt]
                );
            }
        }

        if (fs.existsSync(listsPath)) {
            const lists = JSON.parse(fs.readFileSync(listsPath, 'utf8'));
            for (const list of lists) {
                const boardResult = await client.query('SELECT id FROM boards LIMIT 1');
                if (boardResult.rows.length > 0) {
                    await client.query(
                        'INSERT INTO lists (title, board_id, position, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                        [list.title, boardResult.rows[0].id, list.position || 0, list.createdAt || new Date()]
                    );
                }
            }
        }

        if (fs.existsSync(cardsPath)) {
            const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
            for (const card of cards) {
                const listResult = await client.query('SELECT id FROM lists LIMIT 1');
                if (listResult.rows.length > 0) {
                    await client.query(
                        'INSERT INTO cards (title, description, list_id, position, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
                        [card.title, card.description || '', listResult.rows[0].id, card.position || 0, card.dueDate, card.createdAt]
                    );
                }
            }
        }

        console.log('JSON data migration completed');
    } catch (error) {
        console.error('Error migrating JSON data:', error);
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    initializeDatabase,
    migrateJsonData
};
