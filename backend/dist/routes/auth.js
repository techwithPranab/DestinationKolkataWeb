"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("../lib/mongodb");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact support.'
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            role: user.role || 'user',
            name: user.name
        }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
        await db.collection('users').updateOne({ _id: user._id }, {
            $set: {
                lastLogin: new Date(),
                'loginHistory.lastIpAddress': req.ip,
                'loginHistory.lastUserAgent': req.get('User-Agent')
            },
            $inc: { 'loginHistory.loginCount': 1 }
        });
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        };
        res.cookie('auth-token', token, cookieOptions);
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            role: 'user',
            status: 'active',
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            loginHistory: {
                loginCount: 0,
                lastIpAddress: null,
                lastUserAgent: null
            },
            preferences: {
                newsletter: true,
                notifications: true
            }
        };
        const result = await db.collection('users').insertOne(newUser);
        const token = jsonwebtoken_1.default.sign({
            userId: result.insertedId,
            email,
            role: 'user',
            name
        }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        };
        res.cookie('auth-token', token, cookieOptions);
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: { ...userWithoutPassword, _id: result.insertedId },
                token
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('auth-token');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { db } = await (0, mongodb_1.connectToDatabase)();
        const user = await db.collection('users').findOne({ _id: decoded.userId }, { projection: { password: 0 } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map