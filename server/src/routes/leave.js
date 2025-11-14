import express from 'express';
import auth from '../middlewares/auth.js';
import { uploadAttachments } from '../config/multer.js';
import {
  applyLeave,
  getMyLeaves,
  facultyList,
  approveLeave,
  rejectLeave,
  cancelLeave
} from '../controllers/leaveController.js';

const router = express.Router();

// Student apply (multipart/form-data if attachments)
router.post('/apply', auth, uploadAttachments.array('attachments', 5), applyLeave);

// Student's leaves
router.get('/mine', auth, getMyLeaves);

// Student cancel
router.post('/:id/cancel', auth, cancelLeave);

// Faculty: list leaves of mapped students (optional ?status=pending)
router.get('/faculty', auth, facultyList);

// Approve / Reject (faculty or admin)
router.post('/:id/approve', auth, approveLeave);
router.post('/:id/reject', auth, rejectLeave);

export default router;
