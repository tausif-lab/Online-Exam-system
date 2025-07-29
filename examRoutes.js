const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const questionController = require('../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/exams - Get all exams
router.get('/', authenticateToken, examController.getAllExams);

// GET /api/exams/:id - Get exam by ID
router.get('/:id', authenticateToken, examController.getExamById);

// POST /api/exams - Create new exam (Admin only)
router.post('/', authenticateToken, requireAdmin, examController.createExam);

// PUT /api/exams/:id - Update exam (Admin only)
router.put('/:id', authenticateToken, requireAdmin, examController.updateExam);

// DELETE /api/exams/:id - Delete exam (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, examController.deleteExam);

// Question routes under exams (backward compatibility)
// GET /api/exams/:id/questions - Get questions for an exam
router.get('/:id/questions', authenticateToken, questionController.getQuestionsByExam);

// POST /api/exams/:id/questions - Add question to exam (Admin only)
router.post('/:id/questions', authenticateToken, requireAdmin, (req, res, next) => {
    req.params.examId = req.params.id; // Map id to examId for controller
    questionController.addQuestion(req, res, next);
});



module.exports = router;
