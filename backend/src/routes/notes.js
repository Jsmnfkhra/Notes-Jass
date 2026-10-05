const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

router.use(auth); // Semua aksi catatan butuh login

// Ambil semua catatan milik user
router.get('/', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.userId },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah catatan baru
router.post('/', async (req, res) => {
  const { title, content, tag, isPinned } = req.body;
  try {
    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        tag: tag || 'Ide',
        isPinned: Boolean(isPinned),
        userId: req.user.userId
      }
    });
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update catatan (edit isi / pin)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, tag, isPinned } = req.body;
  try {
    const updatedNote = await prisma.note.update({
      where: { id: parseInt(id) },
      data: { title, content, tag, isPinned }
    });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hapus catatan
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.note.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Catatan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;