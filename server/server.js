const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());

// JSON Database file path
const dbPath = path.join(__dirname, '../json-server/db.json');

// Helper to read JSON database
const readDB = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading database:', err);
        return { users: [], usageEvents: [], sessions: [], apiKeys: [] };
    }
};

// Helper to write JSON database
const writeDB = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error writing database:', err);
    }
};

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '30d',
    });
};

// ========== AUTH ROUTES ==========

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, adminCode } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const db = readDB();
        const userExists = db.users.find(u => u.email === email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role
        let role = 'user';
        const envAdmin = process.env.ADMIN_REGISTRATION_CODE;
        if (adminCode) {
            if (!envAdmin) {
                return res.status(403).json({ message: 'Admin registration is disabled on this server' });
            }
            if (adminCode !== envAdmin) {
                return res.status(400).json({ message: 'Invalid admin registration code' });
            }
            role = 'admin';
        }

        // Create user
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password: hashedPassword,
            role,
        };

        db.users.push(newUser);
        writeDB(db);

        res.status(201).json({
            _id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser.id),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = readDB();
        const user = db.users.find(u => u.email === email);

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        const db = readDB();
        const user = db.users.find(u => u.id === decoded.id);

        if (user) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

// ========== USAGE ROUTES ==========

// Ingest event
app.post('/api/usage/ingest', (req, res) => {
    try {
        const { userId, eventType, metadata } = req.body;

        if (!userId || !eventType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const db = readDB();
        const newEvent = {
            id: db.usageEvents.length > 0 ? Math.max(...db.usageEvents.map(e => e.id)) + 1 : 1,
            userId,
            eventType,
            timestamp: new Date().toISOString(),
            metadata: metadata || {},
        };

        db.usageEvents.push(newEvent);
        writeDB(db);

        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Ingest error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Get events
app.get('/api/usage/events', (req, res) => {
    try {
        const db = readDB();
        res.json(db.usageEvents);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// ========== METRICS ROUTES ==========

app.get('/api/metrics/dau', (req, res) => {
    try {
        const db = readDB();
        const today = new Date().toISOString().split('T')[0];
        const dauUsers = new Set();

        db.usageEvents
            .filter(e => e.timestamp.startsWith(today))
            .forEach(e => dauUsers.add(e.userId));

        res.json({
            date: today,
            count: dauUsers.size,
            users: Array.from(dauUsers),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

app.get('/api/metrics/mau', (req, res) => {
    try {
        const db = readDB();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const mauUsers = new Set();

        db.usageEvents
            .filter(e => e.timestamp >= thirtyDaysAgo)
            .forEach(e => mauUsers.add(e.userId));

        res.json({
            period: 'last_30_days',
            count: mauUsers.size,
            users: Array.from(mauUsers),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

app.get('/api/metrics/retention', (req, res) => {
    try {
        const db = readDB();
        // Simple retention calculation
        const retention = db.users.length > 0
            ? Math.round((db.usageEvents.length / (db.users.length * 10)) * 100)
            : 0;

        res.json({
            retention,
            totalUsers: db.users.length,
            totalEvents: db.usageEvents.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// ========== USER ROUTES ==========

app.get('/api/user/profile', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        const db = readDB();
        const user = db.users.find(u => u.id === decoded.id);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// ========== API KEY ROUTES ==========

app.get('/api/apikeys/list', (req, res) => {
    try {
        const db = readDB();
        res.json(db.apiKeys || []);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`JSON Database: ${dbPath}`);
});
