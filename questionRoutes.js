/*const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/questions/exam/:examId - Get questions for an exam
router.get('/exam/:examId', authenticateToken, questionController.getQuestionsByExam);

// GET /api/questions/:id - Get question by ID
router.get('/:id', authenticateToken, questionController.getQuestionById);

// POST /api/questions/exam/:examId - Add question to exam (Admin only)
router.post('/exam/:examId', authenticateToken, requireAdmin, questionController.addQuestion);

// PUT /api/questions/:id - Update question (Admin only)
router.put('/:id', authenticateToken, requireAdmin, questionController.updateQuestion);

// DELETE /api/questions/:id - Delete question (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, questionController.deleteQuestion);

module.exports = router;*/

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth'); // Adjust path as needed

// ===== STUDENT ROUTES =====
// Get questions for exam (WITHOUT correct answers - for taking exam)
router.get('/exam/:examId', authenticateToken, questionController.getExamQuestions);

// ===== ADMIN ROUTES =====
// Get questions for admin (WITH correct answers - for managing)
router.get('/admin/exam/:examId', authenticateToken, questionController.getQuestionsForAdmin);

// CRUD operations for questions (Admin only)
router.post('/exam/:examId', authenticateToken, questionController.addQuestion);
router.put('/:id', authenticateToken, questionController.updateQuestion);
router.delete('/:id', authenticateToken, questionController.deleteQuestion);
router.get('/:id', authenticateToken, questionController.getQuestionById);

// ===== BACKWARD COMPATIBILITY =====
// Support your existing route structure (if you have any existing frontend code using these)
router.get('/exam/:examId/all', authenticateToken, questionController.getQuestionsByExam);

module.exports = router;
