

        const ExamSubmission = require('../models/ExamSubmission');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// Submit exam answers and calculate results
exports.submitExam = async (req, res, next) => {
    try {
        const { examId } = req.params;
        const { answers, timeTaken, userAnswers } = req.body;
        const studentId = req.user.userId;

        console.log('Submit exam data received:', {
            examId,
            answersLength: answers?.length,
            timeTaken,
            userAnswersKeys: userAnswers ? Object.keys(userAnswers).length : 0
        });

        // Validate input
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers array is required'
            });
        }

        // Check if exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if student has already submitted
        const existingSubmission = await ExamSubmission.findOne({
            examId,
            studentId
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this exam'
            });
        }

        // Get all questions for this exam
        const questions = await Question.find({ examId });
        
        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found for this exam'
            });
        }

        console.log(`Found ${questions.length} questions for exam ${examId}`);

        // Calculate results
        let score = 0;
        const processedAnswers = [];

        // Process answers array format
        answers.forEach(answer => {
            const question = questions.find(q => q._id.toString() === answer.questionId);
            
            if (question) {
                // Check if answer is valid (not -1 and not null/undefined)
                const hasValidAnswer = answer.selectedOption !== null && 
                                     answer.selectedOption !== undefined && 
                                     answer.selectedOption !== -1;
                
                let isCorrect = false;
                if (hasValidAnswer) {
                    isCorrect = question.correctAnswer === answer.selectedOption;
                    if (isCorrect) {
                        score++;
                        console.log(`Question ${question._id}: Correct! Selected: ${answer.selectedOption}, Correct: ${question.correctAnswer}`);
                    } else {
                        console.log(`Question ${question._id}: Wrong! Selected: ${answer.selectedOption}, Correct: ${question.correctAnswer}`);
                    }
                } else {
                    console.log(`Question ${question._id}: Not answered`);
                }

                processedAnswers.push({
                    questionId: answer.questionId,
                    selectedOption: hasValidAnswer ? answer.selectedOption : null,
                    isCorrect: isCorrect
                });
            } else {
                console.log(`Question not found for ID: ${answer.questionId}`);
            }
        });

        // Also process userAnswers object format if available (fallback)
        if (userAnswers && Object.keys(userAnswers).length > 0) {
            console.log('Processing userAnswers object as fallback...');
            
            Object.keys(userAnswers).forEach(questionId => {
                const selectedOption = userAnswers[questionId];
                
                // Skip if already processed in answers array
                if (processedAnswers.find(a => a.questionId === questionId)) {
                    return;
                }
                
                const question = questions.find(q => q._id.toString() === questionId);
                
                if (question && selectedOption !== null && selectedOption !== undefined) {
                    const isCorrect = question.correctAnswer === selectedOption;
                    if (isCorrect) score++;

                    processedAnswers.push({
                        questionId: questionId,
                        selectedOption: selectedOption,
                        isCorrect: isCorrect
                    });
                }
            });
        }

        console.log(`Final score calculation: ${score}/${questions.length}`);

        // Ensure we have all questions represented
        questions.forEach(question => {
            if (!processedAnswers.find(a => a.questionId === question._id.toString())) {
                processedAnswers.push({
                    questionId: question._id.toString(),
                    selectedOption: null,
                    isCorrect: false
                });
            }
        });

        // Create submission record with validated data
        const submission = new ExamSubmission({
            examId,
            studentId,
            answers: processedAnswers,
            score: score,
            totalQuestions: questions.length,
            timeTaken: timeTaken || 0,
            status: 'completed',
            submittedAt: new Date()
        });

        await submission.save();

        console.log('Submission saved:', {
            submissionId: submission._id,
            score: submission.score,
            totalQuestions: submission.totalQuestions
        });

        // Calculate percentage
        const percentage = questions.length > 0 ? ((score / questions.length) * 100).toFixed(2) : 0;

        // Return result
        res.status(201).json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                submissionId: submission._id,
                score: score,
                totalQuestions: questions.length,
                percentage: percentage,
                correctAnswers: score,
                incorrectAnswers: questions.length - score,
                timeTaken: timeTaken || 0,
                submittedAt: submission.submittedAt
            }
        });

    } catch (error) {
        console.error('Error submitting exam:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting exam',
            error: error.message
        });
    }
};


// Get exam results for a specific exam and user - UPDATED VERSION
exports.getExamResult = async (req, res) => {
    try {
        const { examId } = req.params;
        const userId = req.user.userId;
        
        console.log(`Fetching results for examId: ${examId}, userId: ${userId}`);
        
        // Find the submission for this user and exam
        const submission = await ExamSubmission.findOne({
            examId: examId,
            studentId: userId
        });
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'No results found for this exam'
            });
        }
        
        console.log('Found submission:', {
            id: submission._id,
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            percentage: submission.percentage
        });
        
        // Use the new getDetailedResult method
        const detailedResult = await submission.getDetailedResult();
        
        console.log('Sending detailed result:', {
            score: detailedResult.score,
            totalQuestions: detailedResult.totalQuestions,
            questionsCount: detailedResult.questions.length
        });
        
        res.json({
            success: true,
            data: detailedResult
        });
        
    } catch (error) {
        console.error('Get exam results error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exam results',
            error: error.message
        });
    }
};

// Get all results for a student
exports.getStudentResults = async (req, res, next) => {
    try {
        const studentId = req.user.userId;

        const submissions = await ExamSubmission.find({ studentId })
            .populate('examId', 'title description category duration')
            .sort({ submittedAt: -1 });

        const results = submissions.map(submission => {
            const score = Number(submission.score) || 0;
            const totalQuestions = Number(submission.totalQuestions) || 0;
            const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;
            
            return {
                submissionId: submission._id,
                exam: {
                    id: submission.examId._id,
                    title: submission.examId.title,
                    category: submission.examId.category,
                    duration: submission.examId.duration
                },
                score: score,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeTaken: submission.timeTaken,
                submittedAt: submission.submittedAt,
                status: submission.status
            };
        });

        res.status(200).json({
            success: true,
            data: {
                totalExamsTaken: submissions.length,
                results: results
            }
        });

    } catch (error) {
        console.error('Error fetching student results:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching results',
            error: error.message
        });
    }
};

// Get all results for an exam (Admin only)
exports.getExamResults = async (req, res, next) => {
    try {
        const { examId } = req.params;

        // Verify user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const submissions = await ExamSubmission.find({ examId })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        // Calculate statistics with proper number validation
        const totalSubmissions = submissions.length;
        const validScores = submissions.map(sub => Number(sub.score) || 0);
        const averageScore = totalSubmissions > 0 
            ? (validScores.reduce((sum, score) => sum + score, 0) / totalSubmissions).toFixed(2)
            : 0;

        const validPercentages = submissions.map(sub => {
            const score = Number(sub.score) || 0;
            const total = Number(sub.totalQuestions) || 0;
            return total > 0 ? (score / total) * 100 : 0;
        });
        
        const averagePercentage = totalSubmissions > 0
            ? (validPercentages.reduce((sum, pct) => sum + pct, 0) / totalSubmissions).toFixed(2)
            : 0;

        const results = submissions.map(submission => {
            const score = Number(submission.score) || 0;
            const totalQuestions = Number(submission.totalQuestions) || 0;
            const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;
            
            return {
                submissionId: submission._id,
                student: {
                    id: submission.studentId._id,
                    name: submission.studentId.name,
                    email: submission.studentId.email
                },
                score: score,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeTaken: submission.timeTaken,
                submittedAt: submission.submittedAt,
                status: submission.status
            };
        });

        res.status(200).json({
            success: true,
            data: {
                exam: {
                    id: exam._id,
                    title: exam.title,
                    category: exam.category,
                    duration: exam.duration
                },
                statistics: {
                    totalSubmissions,
                    averageScore,
                    averagePercentage
                },
                results: results
            }
        });

    } catch (error) {
        console.error('Error fetching exam results:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching exam results',
            error: error.message
        });
    }
};

// Delete a submission (Admin only)
exports.deleteSubmission = async (req, res, next) => {
    try {
        const { submissionId } = req.params;

        // Verify user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const submission = await ExamSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        await ExamSubmission.findByIdAndDelete(submissionId);

        res.status(200).json({
            success: true,
            message: 'Submission deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting submission',
            error: error.message
        });
    }
};
