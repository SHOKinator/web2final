// middleware/authorize.js
const authorize = (roles) => {
    return (req, res, next) => {
      // Если роль пользователя не совпадает с одной из разрешенных
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };
  
  module.exports = authorize;
  
