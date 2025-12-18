import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../lib/mongodb';

const router = Router();

// POST /api/auth/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
  console.log('Login attempt received for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const { db } = await connectToDatabase();

    // Find user
    const user = await db.collection('users').findOne({ email });
    console.log('User lookup:', !!user, user ? { email: user.email, status: user.status } : null);
    if (!user) {
      console.log('Login failed - no user found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
  console.log('Login failed - user inactive for email:', email, 'status:', user.status);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result for', email, ':', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Login failed - password invalid for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role || 'customer',
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: tokenExpiry }
    );

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          'loginHistory.lastIpAddress': req.ip,
          'loginHistory.lastUserAgent': req.get('User-Agent')
        },
        $inc: { 'loginHistory.loginCount': 1 }
      }
    );

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
      sameSite: 'strict' as const
    };

    res.cookie('auth-token', token, cookieOptions);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/signup - User registration
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'customer',
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertedId,
        email,
        role: 'customer',
        name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict' as const
    };

    res.cookie('auth-token', token, cookieOptions);

    // Send welcome email to new user and admin notification
    try {
      const { sendEmailWithLogging, getEmailTemplate } = await import('../lib/email-service');

      // Send welcome email to new user
      const welcomeTemplate = await getEmailTemplate('registration_welcome', {
        userName: name,
        userEmail: email,
        loginLink: `${process.env.FRONTEND_URL}/auth/login`
      });

      await sendEmailWithLogging(
        {
          to: email,
          subject: welcomeTemplate.subject,
          html: welcomeTemplate.html,
          replyTo: process.env.ADMIN_EMAIL
        },
        'registration_welcome',
        db,
        {
          userId: result.insertedId.toString(),
          userName: name,
          registrationType: 'new_user'
        }
      );

      // Send admin notification email
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminTemplate = await getEmailTemplate('registration_admin_notification', {
        userName: name,
        userEmail: email,
        registrationDate: new Date().toISOString(),
        adminDashboardLink: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/admin/users/${result.insertedId.toString()}`
      });

      await sendEmailWithLogging(
        {
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          replyTo: email
        },
        'registration_admin_notification',
        db,
        {
          userId: result.insertedId.toString(),
          userName: name,
          userEmail: email,
          notificationType: 'new_user_registration'
        }
      );
    } catch (emailError) {
      console.error('Error sending registration emails:', emailError);
      // Don't fail the registration if email sending fails
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: { ...userWithoutPassword, _id: result.insertedId },
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth-token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne(
      { _id: decoded.userId },
      { projection: { password: 0 } }
    );

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
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// POST /api/auth/next-auth - Exchange NextAuth session for backend JWT and set cookie
router.post('/next-auth', async (req: Request, res: Response) => {
  try {
    const { email, name, provider, oauthId } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for NextAuth sync'
      })
    }

    const { db } = await connectToDatabase()

    // Try to find existing user by email
    let user = await db.collection('users').findOne({ email })

    if (!user) {
      // Create a minimal customer record when not found
      const newUser = {
        name: name || '',
        email,
        role: 'customer',
        status: 'active',
        provider: provider || 'nextauth',
        oauthId: oauthId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await db.collection('users').insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
    } else {
      // Optionally update name or oauthId
      const update: any = {}
      if (!user.name && name) update.name = name
      if (!user.oauthId && oauthId) update.oauthId = oauthId
      if (Object.keys(update).length > 0) {
        update.updatedAt = new Date()
        await db.collection('users').updateOne({ _id: user._id }, { $set: update })
        user = await db.collection('users').findOne({ _id: user._id })
      }
    }

    // Ensure user exists and generate JWT token for the user
    if (!user) {
      return res.status(500).json({ success: false, message: 'Failed to create user' })
    }

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role || 'customer',
      name: user.name
    }

    const jwtSecret = process.env.JWT_SECRET as string
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string

    const token = jwt.sign(payload as any, jwtSecret as any, { expiresIn } as any)

    // Set HTTP-only cookie for auth-token (same options as login)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict' as const
    }
    res.cookie('auth-token', token, cookieOptions)

    // Don't include password in returned object
    const { password: _pwd, ...userWithoutPassword } = user as any

    res.status(200).json({ success: true, data: { user: userWithoutPassword, token } })
  } catch (error) {
    console.error('NextAuth sync error:', error)
    res.status(500).json({ success: false, message: 'Failed to sync NextAuth session' })
  }
})

export default router;
