const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'kunci_rahasia_notes_super_aman_2026');
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
};