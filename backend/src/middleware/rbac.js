const RBAC = {
  user: {
    read: ['user'],
    update: ['self'],
    delete: ['self']
  },
  admin: {
    read: ['all'],
    update: ['all'],
    delete: ['all']
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

const checkPermission = (action, resource) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const permissions = RBAC[userRole];

    if (!permissions || !permissions[action]) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
    }

    const allowedScopes = permissions[action];
    
    if (allowedScopes.includes('all')) {
      return next();
    }

    if (allowedScopes.includes('self') && req.params.id === req.user.id) {
      return next();
    }

    if (allowedScopes.includes(resource)) {
      return next();
    }

    res.status(403).json({
      success: false,
      error: 'Permission denied'
    });
  };
};

module.exports = {
  checkRole,
  checkPermission
};