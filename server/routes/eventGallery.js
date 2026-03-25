const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const EventPhoto = require('../models/EventPhoto');

// ── Upload directory ────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'event-gallery');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer config: disk storage keyed by eventId ────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const eventDir = path.join(UPLOAD_DIR, req.params.eventId);
    if (!fs.existsSync(eventDir)) fs.mkdirSync(eventDir, { recursive: true });
    cb(null, eventDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 8 MB per image
});

// ──────────────────────────────────────────────────────────────────────────
// GET /api/events/:eventId/gallery
// Returns all photos for an event as a JSON array
// ──────────────────────────────────────────────────────────────────────────
router.get('/:eventId/gallery', async (req, res) => {
  try {
    const { eventId } = req.params;
    const photos = await EventPhoto.find({ eventId }).sort({ uploadedAt: -1 }).lean();

    // Build a public URL for each photo
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result  = photos.map(p => ({
      id:         p._id,
      eventId:    p.eventId,
      url:        `${baseUrl}/uploads/event-gallery/${p.eventId}/${p.filename}`,
      caption:    p.caption,
      uploadedAt: p.uploadedAt
    }));

    res.json({ success: true, count: result.length, photos: result });
  } catch (err) {
    console.error('GET gallery error:', err);
    res.status(500).json({ success: false, error: 'Could not fetch gallery' });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/events/:eventId/gallery/upload
// Upload one or more images for an event (multipart/form-data, field: photos)
// ──────────────────────────────────────────────────────────────────────────
router.post('/:eventId/gallery/upload', upload.array('photos', 20), async (req, res) => {
  try {
    const { eventId } = req.params;
    const captions    = req.body.captions || []; // optional parallel array

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files received' });
    }

    const docs = req.files.map((file, i) => ({
      eventId,
      filename:     file.filename,
      originalName: file.originalname,
      mimeType:     file.mimetype,
      size:         file.size,
      caption:      Array.isArray(captions) ? (captions[i] || '') : (captions || '')
    }));

    const saved = await EventPhoto.insertMany(docs);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result  = saved.map(p => ({
      id:      p._id,
      url:     `${baseUrl}/uploads/event-gallery/${p.eventId}/${p.filename}`,
      caption: p.caption
    }));

    res.status(201).json({ success: true, count: result.length, photos: result });
  } catch (err) {
    console.error('POST gallery error:', err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/events/:eventId/gallery/:photoId
// Remove a single photo from DB + disk
// ──────────────────────────────────────────────────────────────────────────
router.delete('/:eventId/gallery/:photoId', async (req, res) => {
  try {
    const { eventId, photoId } = req.params;
    const photo = await EventPhoto.findOneAndDelete({ _id: photoId, eventId });

    if (!photo) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, eventId, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    console.error('DELETE gallery error:', err);
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});

module.exports = router;
