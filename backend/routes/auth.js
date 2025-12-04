const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usersPath = path.join(__dirname, '../data/users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
}

// Simple hash function (in production, use bcrypt)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Generate simple token (in production, use JWT)
const generateToken = (userId) => {
    return crypto.randomBytes(32).toString('hex') + '-' + userId;
};

// Register new user
router.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

        // Check if user already exists
        if (users.find(u => u.email === email || u.username === username)) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashPassword(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

        const token = generateToken(newUser.id);

        res.status(201).json({
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const user = users.find(u => u.email === email);

        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user (simple token validation)
router.get('/me', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const userId = token.split('-')[1];
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Failed to authenticate' });
    }
});

module.exports = router;
