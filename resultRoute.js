/*const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticateToken } = require('../middleware/auth');

// Student routes
router.post('/exam/:examId/submit', authenticateToken, resultController.submitExam);
router.get('/exam/:examId', authenticateToken, resultController.getExamResult);
router.get('/student/all', authenticateToken, resultController.getStudentResults);

// Admin routes
router.get('/admin/exam/:examId', authenticateToken, resultController.getExamResults);
router.delete('/admin/:submissionId', authenticateToken, resultController.deleteSubmission);

module.exports = router;*/
const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticateToken } = require('../middleware/auth');

// Student routes
router.post('/submit/:examId', authenticateToken, resultController.submitExam);
router.get('/exam/:examId', authenticateToken, resultController.getExamResult);
router.get('/student/all', authenticateToken, resultController.getStudentResults);

// Admin routes
router.get('/admin/exam/:examId', authenticateToken, resultController.getExamResults);
router.delete('/admin/:submissionId', authenticateToken, resultController.deleteSubmission);

module.exports = router;
