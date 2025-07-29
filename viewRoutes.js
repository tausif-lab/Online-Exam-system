/*const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// GET / - Home page
router.get('/', viewController.getHomePage);

// GET /login - Login page
router.get('/login', viewController.getLoginPage);

// GET /register - Registration page
router.get('/register', viewController.getRegisterPage);

// GET /student-dashboard - Student dashboard
router.get('/student-dashboard', viewController.getStudentDashboard);

// GET /admin-dashboard - Admin dashboard
router.get('/admin-dashboard', viewController.getAdminDashboard);

// GET /manage-exams - Manage exams page
router.get('/manage-exams', viewController.getManageExamsPage);

// GET /exam - Exam page for students
router.get('/student-exam', viewController.getExamPage);

module.exports = router;*/
const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// GET / - Home page
router.get('/', viewController.getHomePage);

// GET /login - Login page
router.get('/login', viewController.getLoginPage);

// GET /register - Registration page
router.get('/register', viewController.getRegisterPage);

// GET /student-dashboard - Student dashboard
router.get('/student-dashboard', viewController.getStudentDashboard);

// GET /student-dashboard.html - Alternative route for student dashboard (for compatibility)
router.get('/student-dashboard.html', viewController.getStudentDashboard);

// GET /admin-dashboard - Admin dashboard
router.get('/admin-dashboard', viewController.getAdminDashboard);

// GET /manage-exams - Manage exams page
router.get('/manage-exams', viewController.getManageExamsPage);

// GET /student-exam - Exam page for students
router.get('/student-exam', viewController.getExamPage);

// GET /student-exam.html - Alternative route for exam page (referenced in student-dashboard.html)
router.get('/student-exam.html', viewController.getExamPage);

// Add error handling middleware for missing routes
router.use('*', (req, res) => {
    res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>The requested page ${req.originalUrl} was not found.</p>
        <a href="/student-dashboard">Back to Dashboard</a>
    `);
});

module.exports = router;
