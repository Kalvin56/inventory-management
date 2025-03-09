module.exports = function (roles) {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    const hasRole = userRoles.some(role => roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    next();
  };
};