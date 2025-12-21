import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../lib/mongodb';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.cookies['auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Authorization middleware for specific roles
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin middleware
export const requireAdmin = requireRole(['admin', 'super_admin']);

// Customer or Admin middleware - allows both customers and admins
export const requireCustomerOrAdmin = requireRole(['customer', 'user', 'admin', 'super_admin']);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.cookies['auth-token'];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
    console.log('Optional auth failed:', error);
  }

  next();
};

// Ownership validation middleware - checks if user owns the resource
// Admins bypass this check and can access any resource
export const requireOwnership = (Model: any, resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admins can access any resource
      if (user.role === 'admin' || user.role === 'super_admin') {
        return next();
      }

      // For customers, check ownership
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      // Connect to database to check ownership
      const { db } = await connectToDatabase();
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if resource has createdBy field and if it matches the user
      if (resource.createdBy && resource.createdBy.toString() !== user.userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to modify this resource'
        });
      }

      // If no createdBy field exists, allow access (for backward compatibility)
      // In production, you might want to restrict this
      next();
    } catch (error) {
      console.error('Ownership validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate ownership'
      });
    }
  };
};
