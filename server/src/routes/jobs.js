const express = require('express');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/jobController');
const d = require('../controllers/jobDetailController');

const router = express.Router();

router.get('/', requireAuth, c.listJobs);
router.post('/', requireAuth, c.createJob);

// Bulk (before /:id routes)
router.post('/bulk/move', requireAuth, c.moveJobs);
router.post('/bulk/archive', requireAuth, c.archiveJobs);
router.post('/bulk/unarchive', requireAuth, c.unarchiveJobs);
router.post('/bulk/delete', requireAuth, c.trashJobs);
router.post('/bulk/restore', requireAuth, c.restoreJobs);
router.post('/bulk/delete-forever', requireAuth, c.deleteJobsForever);

router.post('/bulk/export', requireAuth, c.exportJobs);
router.get('/export', requireAuth, c.exportFilteredJobs);

// Must come before DELETE /:id
router.delete('/trash', requireAuth, c.emptyTrash);

// Single
router.patch('/:id/move', requireAuth, c.moveJob);
router.patch('/:id/archive', requireAuth, c.archiveJob);
router.patch('/:id/unarchive', requireAuth, c.unarchiveJob);
router.patch('/:id/restore', requireAuth, c.restoreJob);
router.delete('/:id', requireAuth, c.trashJob);
router.delete('/:id/permanent', requireAuth, c.deleteJobForever);

router.get('/:id', requireAuth, d.getJob);
router.get('/:id/notes', requireAuth, d.getNotes);
router.get('/:id/documents', requireAuth, d.getDocuments);
router.get('/:id/interviews', requireAuth, d.getInterviews);
router.get('/:id/reminders', requireAuth, d.getReminders);
router.get('/:id/timeline', requireAuth, d.getTimeline);
router.patch('/:id', requireAuth, d.updateJob);
router.post('/:id/notes', requireAuth, d.createNote);
router.patch('/:id/notes/:noteId', requireAuth, d.updateNote);
router.delete('/:id/notes/:noteId', requireAuth, d.deleteNote);

module.exports = router;