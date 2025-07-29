const { Exam, Question } = require('../models');

// Get all exams
const getAllExams = async (req, res, next) => {
    try {
        console.log('Fetching exams for user:', req.user.userId);
        const exams = await Exam.find().populate('createdBy', 'fullName');
        
        // Get question count for each exam
        const examsWithQuestionCount = await Promise.all(
            exams.map(async (exam) => {
                const questionCount = await Question.countDocuments({ examId: exam._id });
                return {
                    id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    category: exam.category,
                    duration: exam.duration,
                    status: exam.status,
                    questionCount: questionCount,
                    createdAt: exam.createdAt,
                    createdBy: exam.createdBy ? exam.createdBy.fullName : 'Unknown'
                };
            })
        );

        console.log('Fetched exams:', examsWithQuestionCount.length);
        res.json(examsWithQuestionCount);
    } catch (error) {
        console.error('Get exams error:', error);
        next(error);
    }
};

// Create new exam
const createExam = async (req, res, next) => {
    try {
        const { title, description, category, duration, status } = req.body;
        console.log('Creating exam:', { title, category, duration, status });

        // Validation
        if (!title || !category || !duration) {
            return res.status(400).json({ message: 'Title, category, and duration are required' });
        }

        const exam = new Exam({
            title,
            description: description || '',
            category,
            duration: parseInt(duration),
            status: status || 'draft',
            createdBy: req.user.userId
        });

        const savedExam = await exam.save();
        console.log('Exam created successfully:', savedExam._id);

        res.status(201).json({
            message: 'Exam created successfully',
            exam: {
                id: savedExam._id,
                title: savedExam.title,
                description: savedExam.description,
                category: savedExam.category,
                duration: savedExam.duration,
                status: savedExam.status,
                questionCount: 0,
                createdAt: savedExam.createdAt
            }
        });

    } catch (error) {
        console.error('Create exam error:', error);
        next(error);
    }
};

// Update exam
const updateExam = async (req, res, next) => {
    try {
        const { title, description, category, duration, status } = req.body;
        const examId = req.params.id;
        console.log('Updating exam:', examId, { title, category, duration, status });

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Update exam fields
        if (title) exam.title = title;
        if (description !== undefined) exam.description = description;
        if (category) exam.category = category;
        if (duration) exam.duration = parseInt(duration);
        if (status) exam.status = status;

        const updatedExam = await exam.save();
        const questionCount = await Question.countDocuments({ examId: exam._id });

        console.log('Exam updated successfully:', updatedExam._id);

        res.json({
            message: 'Exam updated successfully',
            exam: {
                id: updatedExam._id,
                title: updatedExam.title,
                description: updatedExam.description,
                category: updatedExam.category,
                duration: updatedExam.duration,
                status: updatedExam.status,
                questionCount: questionCount,
                createdAt: updatedExam.createdAt
            }
        });

    } catch (error) {
        console.error('Update exam error:', error);
        next(error);
    }
};

// Delete exam
const deleteExam = async (req, res, next) => {
    try {
        const examId = req.params.id;
        console.log('Deleting exam:', examId);

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Delete all questions associated with this exam
        await Question.deleteMany({ examId: examId });
        console.log('Deleted questions for exam:', examId);

        // Delete the exam
        await Exam.findByIdAndDelete(examId);
        console.log('Exam deleted successfully:', examId);

        res.json({ message: 'Exam deleted successfully' });

    } catch (error) {
        console.error('Delete exam error:', error);
        next(error);
    }
};

// Get exam by ID
const getExamById = async (req, res, next) => {
    try {
        const examId = req.params.id;
        const exam = await Exam.findById(examId).populate('createdBy', 'fullName');
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const questionCount = await Question.countDocuments({ examId: exam._id });
        
        res.json({
            id: exam._id,
            title: exam.title,
            description: exam.description,
            category: exam.category,
            duration: exam.duration,
            status: exam.status,
            questionCount: questionCount,
            createdAt: exam.createdAt,
            createdBy: exam.createdBy ? exam.createdBy.fullName : 'Unknown'
        });
    } catch (error) {
        console.error('Get exam by ID error:', error);
        next(error);
    }
};

module.exports = {
    getAllExams,
    createExam,
    updateExam,
    deleteExam,
    getExamById
};
