const jwt = require('jsonwebtoken');
const db = require('../../database/connection');

const protect = (requiredRole) => async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database
      let user;
      if (requiredRole === 'admin') {
        const [rows] = await db.query('SELECT * FROM Admins WHERE admin_id = ?', [decoded.id]);
        user = rows[0];
      } else if (requiredRole === 'customer') {
        const [rows] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [decoded.id]);
        user = rows[0];
      }

      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = { protect };
