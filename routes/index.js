/*const express = require('express');
const authRoutes = require('./authRoutes');
const examRoutes = require('./examRoutes');
const questionRoutes = require('./questionRoutes');
const viewRoutes = require('./viewRoutes');
const resultRoutes = require('./resultRoute');

const router = express.Router();

// Mount routes
router.use('/api', authRoutes);            // Authentication routes (backward compatibility)
router.use('/api/exams', examRoutes);      // Exam management routes
router.use('/api/questions', questionRoutes); // Question management routes
router.use('/', viewRoutes);               // View routes (HTML pages)
router.use('/api/results', resultRoutes);
module.exports = router;*/
const express = require('express');
const authRoutes = require('./authRoutes');
const examRoutes = require('./examRoutes');
const questionRoutes = require('./questionRoutes');
const viewRoutes = require('./viewRoutes');
const resultRoutes = require('./resultRoute');

const router = express.Router();

// Mount API routes first (more specific routes)
router.use('/api/auth', authRoutes);       // Authentication routes with proper prefix
router.use('/api/exams', examRoutes);      // Exam management routes
router.use('/api/questions', questionRoutes); // Question management routes
router.use('/api/results', resultRoutes); // Results routes
router.use('/api', authRoutes);            // Backward compatibility - keep this for any /api routes not caught above

// Mount view routes last (catch-all for HTML pages)
router.use('/', viewRoutes);               // View routes (HTML pages)

module.exports = router;
