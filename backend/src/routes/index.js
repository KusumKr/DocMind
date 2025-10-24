import express from 'express';
import { upload } from '../middleware/fileUpload.js';
import {
  uploadDocument,
  getDocument,
  getAllDocuments,
  deleteDocument,
} from '../controllers/documentController.js';
import { askQuestion } from '../controllers/questionController.js';

const router = express.Router();

// Document routes
router.post('/upload', upload.single('pdf'), uploadDocument);
router.get('/document/:documentId', getDocument);
router.get('/documents', getAllDocuments);
router.delete('/document/:documentId', deleteDocument);

// Question route
router.post('/ask', askQuestion);

export default router;