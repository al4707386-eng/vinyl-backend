function checkAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Доступ только для администратора' });
  }

  next();
}

module.exports = checkAdmin;