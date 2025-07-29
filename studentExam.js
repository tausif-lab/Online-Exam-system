// Global variables
//let currentExam = null;
//let questions = [];
//let userAnswers = {}
let currentExam = null;
let questions = [];
let userAnswers = {};
let examTimer = null;
let timeRemaining = 0;
let examStartTime = null;


// Create results element
function createResultsElement() {
    const resultsElement = document.createElement('div');
    resultsElement.id = 'examResults';
    resultsElement.className = 'exam-results';
    resultsElement.style.display = 'none';
    document.body.appendChild(resultsElement);
    return resultsElement;
}

// Show message for already submitted exam (fallback)
function showAlreadySubmittedMessage() {
    hideLoading();
    hideError();
    
    const examQuestionsElement = document.getElementById('examQuestions');
    const examInfoElement = document.getElementById('examInfo');
    
    if (examQuestionsElement) examQuestionsElement.style.display = 'none';
    if (examInfoElement) examInfoElement.style.display = 'none';
    
    const messageElement = document.getElementById('alreadySubmittedMessage') || createAlreadySubmittedElement();
    messageElement.style.display = 'block';
    
    messageElement.innerHTML = `
        <div class="already-submitted-container">
            <div class="message-icon">📝</div>
            <h2>Exam Already Submitted</h2>
            <div class="message-content">
                <p>You have already submitted this exam.</p>
                <p>Your results should be available shortly.</p>
            </div>
            <div class="action-buttons">
                <button onclick="retryLoadResults()" class="btn btn-primary">🔄 Try Loading Results</button>
                <button onclick="goToDashboard()" class="btn btn-secondary">📋 Back to Dashboard</button>
                <button onclick="contactSupport()" class="btn btn-outline">📞 Contact Support</button>
            </div>
        </div>
    `;
}

// Create already submitted message element
function createAlreadySubmittedElement() {
    const messageElement = document.createElement('div');
    messageElement.id = 'alreadySubmittedMessage';
    messageElement.className = 'already-submitted-message';
    messageElement.style.display = 'none';
    document.body.appendChild(messageElement);
    return messageElement;
}

// Show submission success (fallback)
function showSubmissionSuccess(resultData) {
    const examQuestionsElement = document.getElementById('examQuestions');
    const examInfoElement = document.getElementById('examInfo');
    
    if (examQuestionsElement) examQuestionsElement.style.display = 'none';
    if (examInfoElement) examInfoElement.style.display = 'none';
    
    const successElement = document.getElementById('submissionSuccess') || createSuccessElement();
    successElement.style.display = 'block';
    
    successElement.innerHTML = `
        <div class="success-container">
            <h2>✅ Exam Submitted Successfully!</h2>
            <div class="submission-details">
                <p><strong>Submission ID:</strong> ${resultData.submissionId || 'Generated'}</p>
                <p><strong>Total Questions:</strong> ${resultData.totalQuestions || questions.length}</p>
                <p><strong>Questions Answered:</strong> ${resultData.answeredQuestions || Object.values(userAnswers).filter(a => a !== null).length}</p>
                <p><strong>Submitted At:</strong> ${new Date(resultData.submittedAt || Date.now()).toLocaleString()}</p>
                <p><strong>Time Taken:</strong> ${formatDuration(resultData.timeTaken || 0)}</p>
            </div>
            <div class="action-buttons">
                <button onclick="retryLoadResults()" class="btn btn-primary">View Results</button>
                <button onclick="goToDashboard()" class="btn btn-secondary">Back to Dashboard</button>
            </div>
        </div>
    `;
}

// Create success element
function createSuccessElement() {
    const successElement = document.createElement('div');
    successElement.id = 'submissionSuccess';
    successElement.style.display = 'none';
    successElement.className = 'submission-success';
    document.body.appendChild(successElement);
    return successElement;
}

// Start exam timer
function startTimer() {
    if (examTimer) {
        clearInterval(examTimer);
    }
    
    updateTimerDisplay();
    
    examTimer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining === 300) {
            alert('Warning: 5 minutes remaining!');
        }
        
        if (timeRemaining === 60) {
            alert('Warning: 1 minute remaining!');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(examTimer);
            examTimer = null;
            autoSubmitExam();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('examTimer');
    if (timerElement) {
        timerElement.textContent = timeString;
    }
    
    const timerDisplayElement = document.getElementById('timerDisplay');
    if (timerDisplayElement) {
        timerDisplayElement.textContent = `Time Remaining: ${timeString}`;
    }
    
    if (timeRemaining <= 300) {
        if (timerElement) timerElement.style.color = 'red';
        if (timerDisplayElement) timerDisplayElement.style.color = 'red';
    } else if (timeRemaining <= 600) {
        if (timerElement) timerElement.style.color = 'orange';
        if (timerDisplayElement) timerDisplayElement.style.color = 'orange';
    }
}

// Auto-submit exam when time runs out
async function autoSubmitExam() {
    alert('Time has expired! The exam will be submitted automatically.');
    try {
        await submitExam(true);
    } catch (error) {
        console.error('Auto-submit failed:', error);
        showError('Time expired and auto-submit failed. Please try submitting manually.');
    }
}

// Retry loading results
async function retryLoadResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('examId');
    
    if (examId) {
        try {
            showLoading();
            await showResultsForSubmittedExam(examId);
        } catch (error) {
            showError('Still unable to load results. Please try again later or contact support.');
        }
    }
}

// Navigation and utility functions
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function printResults() {
    window.print();
}

function goToDashboard() {
    window.location.href = '/student-dashboard';
}

function takeAnotherExam() {
    window.location.href = '/student-dashboard';
}

function contactSupport() {
    window.location.href = '/support.html';
}

function toggleDebugInfo() {
    const debugInfo = document.querySelector('.debug-info');
    if (debugInfo) {
        debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    }
}

// Utility functions for UI
function showLoading() {
    const loadingElement = document.getElementById('loadingSection');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loadingSection');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function showError(message) {
    const errorElement = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    if (errorElement && errorMessage) {
        errorMessage.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert('Error: ' + message);
    }
}

function hideError() {
    const errorElement = document.getElementById('errorSection');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Event delegation for radio button clicks
function setupEventListeners() {
    document.addEventListener('change', function(event) {
        if (event.target.type === 'radio' && event.target.name.startsWith('question_')) {
            const questionId = event.target.getAttribute('data-question-id');
            const optionIndex = event.target.getAttribute('data-option-index');
            
            if (questionId && optionIndex !== null) {
                selectAnswer(questionId, optionIndex);
            }
        }
    });
    
    const submitButton = document.getElementById('submitExam');
    if (submitButton) {
        submitButton.addEventListener('click', () => submitExam(false));
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => submitExam(false));
    }
}

// Initialize exam when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing exam');
    setupEventListeners();
    initializeExam();
});

// Handle page unload
window.addEventListener('beforeunload', (event) => {
    if (examTimer && currentExam && timeRemaining > 0) {
        event.preventDefault();
        event.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
        return event.returnValue;
    }
});

// Expose functions to global scope for debugging
window.examDebug = {
    userAnswers,
    questions,
    currentExam,
    timeRemaining,
    updateProgress,
    updateTimerDisplay,
    convertAnswersToArray,
    toggleDebugInfo
};;
/*let examTimer = null;
let timeRemaining = 0;
let examStartTime = null;*/

// API Base URL - Update this to match your backend
const API_BASE_URL = '/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Helper function to make authenticated API calls
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
}

// Check if exam was already submitted and get results
async function checkExamSubmissionStatus(examId) {
    try {
        const response = await apiCall(`/results/exam/${examId}`);
        if (response.success && response.data) {
            return {
                isSubmitted: true,
                result: response.data
            };
        }
        return { isSubmitted: false };
    } catch (error) {
        console.log('Could not check submission status:', error.message);
        return { isSubmitted: false };
    }
}

// Initialize the exam
async function initializeExam() {
    showLoading();
    
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('examId');
    
    if (!examId) {
        showError('No exam ID provided in URL parameters');
        return;
    }
    
    try {
        // First check if exam was already submitted
        const submissionStatus = await checkExamSubmissionStatus(examId);
        
        if (submissionStatus.isSubmitted) {
            // Show results directly instead of exam interface
            showExamResults(submissionStatus.result);
            return;
        }
        
        // If not submitted, load exam normally
        await loadExam(examId);
    } catch (error) {
        console.error('Failed to initialize exam:', error);
        
        // If we get "already submitted" error, try to load results
        if (error.message.includes('already submitted')) {
            try {
                await showResultsForSubmittedExam(examId);
            } catch (resultError) {
                showError('You have already submitted this exam, but we cannot load your results at the moment. Please contact support.');
            }
        } else {
            showError('Failed to load exam: ' + error.message);
        }
    }
}

// Load exam data from API (original function for new exams)
async function loadExam(examId) {
    try {
        showLoading();
        
        const data = await apiCall(`/questions/exam/${examId}`);
        
        if (data.success && data.data.questions && data.data.questions.length > 0) {
            currentExam = data.data.exam;
            questions = data.data.questions;
            
            // Initialize user answers object - ensure all questions have entries
            userAnswers = {};
            questions.forEach(question => {
                userAnswers[question._id] = null;
            });
            
            console.log('Loaded exam:', currentExam);
            console.log('Loaded questions:', questions.length);
            console.log('Initialized userAnswers:', userAnswers);
            
            displayExam();
        } else {
            throw new Error('No questions found for this exam');
        }
    } catch (error) {
        console.error('Load exam error:', error);
        throw error; // Re-throw to be handled by initializeExam
    }
}

// Display exam interface (for new exams)
function displayExam() {
    hideLoading();
    hideError();
    
    const examInfoElement = document.getElementById('examInfo');
    if (examInfoElement) {
        examInfoElement.style.display = 'block';
        
        const examTitleElement = document.getElementById('examTitle');
        const examCategoryElement = document.getElementById('examCategory');
        const examDurationElement = document.getElementById('examDuration');
        const totalQuestionsElement = document.getElementById('totalQuestions');
        
        if (examTitleElement) examTitleElement.textContent = currentExam.title;
        if (examCategoryElement) examCategoryElement.textContent = currentExam.category;
        if (examDurationElement) examDurationElement.textContent = `${currentExam.duration} minutes`;
        if (totalQuestionsElement) totalQuestionsElement.textContent = `${questions.length} questions`;
    }
    
    const examQuestionsElement = document.getElementById('examQuestions');
    if (examQuestionsElement) {
        examQuestionsElement.style.display = 'block';
    }
    
    renderQuestions();
    updateProgress();
    
    timeRemaining = currentExam.duration * 60;
    examStartTime = new Date();
    startTimer();
}

// Render all questions
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container) {
        console.error('Questions container not found');
        return;
    }
    
    container.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionElement = createQuestionElement(question, index);
        container.appendChild(questionElement);
    });
}

// Create individual question element
function createQuestionElement(question, index) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-container';
    questionDiv.setAttribute('data-question-id', question._id);
    
    let optionsHTML = '';
    question.options.forEach((option, optionIndex) => {
        const isSelected = userAnswers[question._id] === optionIndex;
        optionsHTML += `
            <div class="option-container">
                <label class="option-label">
                    <input type="radio" 
                           name="question_${question._id}" 
                           value="${optionIndex}"
                           data-question-id="${question._id}"
                           data-option-index="${optionIndex}"
                           ${isSelected ? 'checked' : ''}>
                    <span class="option-text">${option}</span>
                </label>
            </div>
        `;
    });
    
    questionDiv.innerHTML = `
        <div class="question-header">
            <h3>Question ${index + 1}</h3>
            <span class="question-points">${question.points || 1} point(s)</span>
        </div>
        <div class="question-text">
            ${question.question || question.text}
        </div>
        <div class="options-container">
            ${optionsHTML}
        </div>
    `;
    
    return questionDiv;
}

// Handle answer selection
function selectAnswer(questionId, optionIndex) {
    // Ensure optionIndex is a number
    const selectedOption = parseInt(optionIndex);
    
    userAnswers[questionId] = selectedOption;
    updateProgress();
    
    console.log(`Selected option ${selectedOption} for question ${questionId}`);
    console.log('Current userAnswers:', userAnswers);
}

// Update progress display
function updateProgress() {
    const answeredCount = Object.values(userAnswers).filter(answer => 
        answer !== null && answer !== undefined
    ).length;
    const totalQuestions = questions.length;
    
    const progressElement = document.getElementById('examProgress');
    if (progressElement) {
        progressElement.textContent = `${answeredCount}/${totalQuestions} questions answered`;
    }
    
    const progressTextElement = document.getElementById('progressText');
    if (progressTextElement) {
        progressTextElement.textContent = `Questions Answered: ${answeredCount}/${totalQuestions}`;
    }
    
    const remainingElement = document.getElementById('remainingQuestions');
    if (remainingElement) {
        const remaining = totalQuestions - answeredCount;
        remainingElement.textContent = `${remaining} questions remaining`;
    }
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
    }
}

// Convert answers to array format - FIXED VERSION
function convertAnswersToArray() {
    const answersArray = [];
    
    questions.forEach(question => {
        const selectedOption = userAnswers[question._id];
        
        // Check if answer is valid
        const hasValidAnswer = selectedOption !== null && 
                             selectedOption !== undefined && 
                             !isNaN(selectedOption);
        
        answersArray.push({
            questionId: question._id,
            selectedOption: hasValidAnswer ? parseInt(selectedOption) : -1,
            isAnswered: hasValidAnswer
        });
    });
    
    console.log('Converted answers array:', answersArray);
    return answersArray;
}

// Submit exam - ENHANCED VERSION
async function submitExam(isAutoSubmit = false) {
    if (!isAutoSubmit) {
        const unansweredCount = Object.values(userAnswers).filter(answer => 
            answer === null || answer === undefined
        ).length;
        
        if (unansweredCount > 0) {
            const confirmSubmit = confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
            if (!confirmSubmit) return;
        }
    }
    
    try {
        showLoading();
        
        if (examTimer) {
            clearInterval(examTimer);
            examTimer = null;
        }
        
        const examDuration = examStartTime ? Math.floor((new Date() - examStartTime) / 1000) : 0;
        const answersArray = convertAnswersToArray();
        
        // Calculate answered questions count
        const answeredQuestions = answersArray.filter(answer => 
            answer.isAnswered && 
            answer.selectedOption !== null && 
            answer.selectedOption !== undefined && 
            answer.selectedOption !== -1
        ).length;
        
        // Prepare submission data with both formats for compatibility
        const submissionData = {
            answers: answersArray, // Array format for backend processing
            userAnswers: userAnswers, // Object format for fallback
            submittedAt: new Date().toISOString(),
            timeTaken: examDuration,
            isAutoSubmit: isAutoSubmit,
            totalQuestions: questions.length,
            answeredQuestions: answeredQuestions
        };
        
        console.log('Submitting exam with data:', submissionData);
        
        const urlParams = new URLSearchParams(window.location.search);
        const examId = urlParams.get('examId');
        
        const result = await apiCall(`/results/submit/${examId}`, {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
        
        console.log('Submission result:', result);
        
        if (result.success) {
            // Wait a moment then load results
            setTimeout(async () => {
                try {
                    await showResultsForSubmittedExam(examId);
                } catch (error) {
                    console.error('Error loading results after submission:', error);
                    showSubmissionSuccess(result.data);
                }
            }, 2000);
        } else {
            throw new Error(result.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Submit exam error:', error);
        showError('Failed to submit exam: ' + error.message);
        
        if (!isAutoSubmit && timeRemaining > 0) {
            startTimer();
        }
    } finally {
        hideLoading();
    }
}

// Show results for already submitted exam
async function showResultsForSubmittedExam(examId) {
    try {
        showLoading();
        const resultData = await apiCall(`/results/exam/${examId}`);
        
        console.log('Received result data from API:', resultData);
        
        if (resultData.success && resultData.data) {
            showExamResults(resultData.data);
        } else {
            throw new Error('Could not load exam results');
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showAlreadySubmittedMessage();
    }
}

// Display exam results - FIXED VERSION
function showExamResults(resultData) {
    hideLoading();
    hideError();
    
    console.log('Displaying results with data:', resultData);
    
    // Hide all exam interface elements
    const examInfoElement = document.getElementById('examInfo');
    const examQuestionsElement = document.getElementById('examQuestions');
    
    if (examInfoElement) examInfoElement.style.display = 'none';
    if (examQuestionsElement) examQuestionsElement.style.display = 'none';
    
    // Show results
    const resultsElement = document.getElementById('examResults') || createResultsElement();
    resultsElement.style.display = 'block';
    
    // Safe data extraction with proper validation
    const score = (resultData.score !== null && 
                  resultData.score !== undefined && 
                  !isNaN(resultData.score)) ? parseInt(resultData.score) : 0;
                  
    const totalQuestions = (resultData.totalQuestions !== null && 
                           resultData.totalQuestions !== undefined && 
                           !isNaN(resultData.totalQuestions)) ? parseInt(resultData.totalQuestions) : 0;
    
    // Calculate percentage safely
    let percentage = 0;
    if (totalQuestions > 0 && score >= 0) {
        percentage = ((score / totalQuestions) * 100).toFixed(2);
    }
    
    const status = parseFloat(percentage) >= 60 ? 'PASSED' : 'FAILED';
    
    // Safe date formatting
    let submittedDate = 'Unknown';
    if (resultData.submittedAt) {
        try {
            submittedDate = new Date(resultData.submittedAt).toLocaleString();
        } catch (error) {
            console.error('Date parsing error:', error);
            submittedDate = 'Invalid Date';
        }
    }
    
    // Safe time formatting
    const timeTaken = parseInt(resultData.timeTaken) || 0;
    
    resultsElement.innerHTML = `
        <div class="results-container">
            <div class="results-header">
                <h1>📊 Exam Results</h1>
                <div class="status-badge ${status.toLowerCase()}">${status}</div>
            </div>
            
            <div class="results-summary">
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-number">${score}</span>
                        <span class="score-total">/${totalQuestions}</span>
                    </div>
                    <div class="percentage">${percentage}%</div>
                </div>
                
                <div class="result-details">
                    <div class="detail-item">
                        <label>Exam:</label>
                        <span>${resultData.examTitle || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Category:</label>
                        <span>${resultData.examCategory || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Total Questions:</label>
                        <span>${totalQuestions}</span>
                    </div>
                    <div class="detail-item">
                        <label>Correct Answers:</label>
                        <span>${score}</span>
                    </div>
                    <div class="detail-item">
                        <label>Wrong Answers:</label>
                        <span>${Math.max(0, totalQuestions - score)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Submitted At:</label>
                        <span>${submittedDate}</span>
                    </div>
                    <div class="detail-item">
                        <label>Time Taken:</label>
                        <span>${formatDuration(timeTaken)}</span>
                    </div>
                </div>
            </div>
            
            ${resultData.questions && Array.isArray(resultData.questions) && resultData.questions.length > 0 ? `
                <div class="detailed-results">
                    <h3>Question-wise Results</h3>
                    <div class="questions-review">
                        ${resultData.questions.map((q, index) => {
                            const isCorrect = q.isCorrect === true;
                            const selectedOptionText = (q.selectedOption !== null && 
                                                       q.selectedOption !== undefined && 
                                                       q.options && 
                                                       q.options[q.selectedOption]) 
                                                     ? q.options[q.selectedOption] 
                                                     : 'Not answered';
                            const correctOptionText = (q.correctAnswer !== null && 
                                                      q.correctAnswer !== undefined && 
                                                      q.options && 
                                                      q.options[q.correctAnswer]) 
                                                     ? q.options[q.correctAnswer] 
                                                     : 'N/A';
                            
                            return `
                                <div class="question-result ${isCorrect ? 'correct' : 'incorrect'}">
                                    <div class="question-header">
                                        <span class="question-number">Q${index + 1}</span>
                                        <span class="result-icon">${isCorrect ? '✅' : '❌'}</span>
                                    </div>
                                    <div class="question-text">${q.question || 'Question text not available'}</div>
                                    <div class="answer-comparison">
                                        <div class="your-answer">
                                            <strong>Your Answer:</strong> ${selectedOptionText}
                                        </div>
                                        <div class="correct-answer">
                                            <strong>Correct Answer:</strong> ${correctOptionText}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : `
                <div class="no-details">
                    <p>Detailed question results are not available.</p>
                </div>
            `}
            
            <div class="results-actions">
                <button onclick="printResults()" class="btn btn-secondary">🖨️ Print Results</button>
                <button onclick="goToDashboard()" class="btn btn-primary">📋 Back to Dashboard</button>
                <button onclick="takeAnotherExam()" class="btn btn-outline">📝 Take Another Exam</button>
            </div>
            
            <!-- Debug info for troubleshooting -->
            <div class="debug-info" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px; display: none;">
                <h4>Debug Information:</h4>
                <p>Raw Score: ${resultData.rawScore}</p>
                <p>Raw Total Questions: ${resultData.rawTotalQuestions}</p>
                <p>Answers Count: ${resultData.answersCount}</p>
                <p>Calculated Score: ${score}</p>
                <p>Calculated Total: ${totalQuestions}</p>
                <button onclick="toggleDebugInfo()" style="margin-top: 10px;">Toggle Debug Info</button>
            </div>
        </div>
    `;
                    }