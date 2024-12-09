const jwt = require('jsonwebtoken');
const Prisma = require("../config/database")


// Authentication middleware (verify if the user is logged in)
exports.authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

// Authorization middleware (check if the user has admin role)
exports.authorizeAdmin = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    // Find the user by ID to check their role
    const user = await Prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is not an admin, deny access
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    next(); // Allow the request to continue to the next middleware/route
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Authorization middleware (check if the user owns the order)
exports.authorizeOwner = async (req, res, next) => {
  const userId = req.user.userId;
  const orderId = parseInt(req.params.id); // Order ID from the route parameter

  try {
    const order = await Prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If the user is not the owner of the order or an admin, deny access
    if (order.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have permission to access this order' });
    }

    next(); // Allow the request to continue
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
