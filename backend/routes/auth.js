const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { fullName, email, name, password } = req.body;
    
    if (!fullName || !email || !name || !password) {
        return res.status(400).json({ message: "Eksik bilgi gönderildi." });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await connection.execute(
            'INSERT INTO `Customer` (`fullName`, `email`, `role`) VALUES (?, ?, ?)',
            [fullName, email, 'Customer']
        );
        
        const [[{ insertId }]] = await connection.execute('SELECT LAST_INSERT_ID() AS insertId');
        
        await connection.execute(
            'INSERT INTO `User` (`customerID`, `name`, `password`) VALUES (?, ?, ?)',
            [insertId, name, hashedPassword]
        );
        
        await connection.commit();

        const userPayload = {
            customerID: insertId,
            fullName,
            email,
            role: 'Customer',
            name
        };

        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            token,
            customerID: insertId,
            fullName,
            email,
            role: 'Customer',
            name,
            user: userPayload
        });
    } catch (err) {
        await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Bu kullanıcı adı veya e-posta zaten alınmış." });
        }
        res.status(500).json({ message: "Kayıt işlemi başarısız.", error: err.message });
    } finally {
        connection.release();
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { name, password } = req.body;
    
    if (!name || !password) {
        return res.status(400).json({ message: "Eksik bilgi gönderildi." });
    }

    try {
        const query = `
            SELECT u.\`customerID\`, u.\`name\`, u.\`password\`, c.\`fullName\`, c.\`email\`, c.\`role\`
            FROM \`User\` u
            JOIN \`Customer\` c ON u.\`customerID\` = c.\`customerID\`
            WHERE u.\`name\` = ?`;
            
        const [users] = await db.execute(query, [name]);
        
        if (users.length === 0) return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
        
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
        
        const userPayload = {
            customerID: user.customerID,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            customerID: user.customerID,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            name: user.name,
            user: userPayload
        });
    } catch (err) {
        res.status(500).json({ message: "Giriş işlemi başarısız.", error: err.message });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ message: "Çıkış başarılı." });
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Giriş yapılmamış." });
    }
    res.json(req.user);
});

module.exports = router;
