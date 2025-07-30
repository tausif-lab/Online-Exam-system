

let currentExamId = null;
        let exams = [];
        let questions = [];

        // Initialize page
        window.addEventListener('load', function() {
            checkAuth();
            loadExams();
        });

        function checkAuth() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token || user.role !== 'admin') {
                window.location.href = '/login';
                return;
            }
            
            document.getElementById('adminName').textContent = user.fullName || 'Admin';
        }

        async function loadExams() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/exams', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    exams = await response.json();
                    displayExams();
                } else {
                    console.error('Failed to load exams');
                    // Show empty state if no exams
                    exams = [];
                    displayExams();
                }
            } catch (error) {
                console.error('Error loading exams:', error);
                exams = [];
                displayExams();
            }
        }

        function displayExams() {
            const examsList = document.getElementById('examsList');
            examsList.innerHTML = '';

            if (exams.length === 0) {
                examsList.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="card">
                            <div class="card-body">
                                <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                                <h5>No exams found</h5>
                                <p class="text-muted">Create your first exam to get started</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            exams.forEach(exam => {
                const statusClass = `status-${exam.status}`;
                // Use _id if id is not available
                const examId = exam.id || exam._id;
                const examCard = `
                    <div class="col-md-6 col-lg-4">
                        <div class="card exam-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <h5 class="card-title">${exam.title}</h5>
                                    <span class="exam-status ${statusClass}">${exam.status.toUpperCase()}</span>
                                </div>
                                <p class="card-text text-muted">${exam.description}</p>
                                <div class="row text-center mb-3">
                                    <div class="col-6">
                                        <small class="text-muted">Duration</small>
                                        <div><strong>${exam.duration} min</strong></div>
                                    </div>
                                    <div class="col-6">
                                        <small class="text-muted">Questions</small>
                                        <div><strong>${exam.questionCount}</strong></div>
                                    </div>
                                </div>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary" onclick="manageQuestions('${examId}')">
                                        <i class="fas fa-edit me-2"></i>Manage Questions
                                    </button>
                                    <div class="btn-group">
                                        <button class="btn btn-outline-secondary" onclick="editExam('${examId}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" onclick="deleteExam('${examId}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                examsList.innerHTML += examCard;
            });
        }

        function createNewExam() {
            document.getElementById('examModalTitle').textContent = 'Create New Exam';
            document.getElementById('examForm').reset();
            currentExamId = null;
            new bootstrap.Modal(document.getElementById('examModal')).show();
        }

        function editExam(id) {
            const exam = exams.find(e => (e.id === id || e._id === id));
            if (!exam) return;

            document.getElementById('examModalTitle').textContent = 'Edit Exam';
            document.getElementById('examTitle').value = exam.title;
            document.getElementById('examDuration').value = exam.duration;
            document.getElementById('examCategory').value = exam.category;
            document.getElementById('examStatus').value = exam.status;
            document.getElementById('examDescription').value = exam.description;
            
            currentExamId = id;
            new bootstrap.Modal(document.getElementById('examModal')).show();
        }

        async function saveExam() {
            const title = document.getElementById('examTitle').value;
            const duration = document.getElementById('examDuration').value;
            const category = document.getElementById('examCategory').value;
            const status = document.getElementById('examStatus').value;
            const description = document.getElementById('examDescription').value;

            if (!title || !duration || !category || !status) {
                alert('Please fill in all required fields');
                return;
            }

            const examData = {
                title,
                duration: parseInt(duration),
                category,
                status,
                description
            };

            try {
                const token = localStorage.getItem('token');
                let response;
                
                if (currentExamId) {
                    // Update existing exam
                    response = await fetch(`/api/exams/${currentExamId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(examData)
                    });
                } else {
                    // Create new exam
                    response = await fetch('/api/exams', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(examData)
                    });
                }
                
                if (response.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('examModal')).hide();
                    loadExams(); // Reload exams from server
                    alert(currentExamId ? 'Exam updated successfully!' : 'Exam created successfully!');
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + (errorData.message || 'Failed to save exam'));
                }
            } catch (error) {
                console.error('Error saving exam:', error);
                alert('Network error. Please try again.');
            }
        }

        async function deleteExam(id) {
            if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/exams/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        loadExams(); // Reload exams from server
                        alert('Exam deleted successfully!');
                    } else {
                        const errorData = await response.json();
                        alert('Error: ' + (errorData.message || 'Failed to delete exam'));
                    }
                } catch (error) {
                    console.error('Error deleting exam:', error);
                    alert('Network error. Please try again.');
                }
            }
        }

        function manageQuestions(examId) {
            currentExamId = examId;
            const exam = exams.find(e => (e.id === examId || e._id === examId));
            document.getElementById('questionModalTitle').textContent = `Manage Questions - ${exam.title}`;
            
            loadQuestions(examId);
            new bootstrap.Modal(document.getElementById('questionModal')).show();
        }

        async function loadQuestions(examId) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/exams/${examId}/questions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    questions = await response.json();
                    console.log('Loaded questions:', questions); // Debug log
                    displayQuestions();
                } else {
                    console.error('Failed to load questions');
                    questions = [];
                    displayQuestions();
                }
            } catch (error) {
                console.error('Error loading questions:', error);
                questions = [];
                displayQuestions();
            }
        }

        function displayQuestions() {
            const questionsList = document.getElementById('questionsList');
            questionsList.innerHTML = '';

            if (questions.length === 0) {
                questionsList.innerHTML = `
                    <div class="text-center">
                        <p class="text-muted">No questions added yet. Click "Add New Question" to get started.</p>
                    </div>
                `;
                return;
            }

            questions.forEach((question, index) => {
                // Use _id if id is not available
                const questionId = question.id || question._id;
                console.log('Question ID for display:', questionId); // Debug log
                
                const questionHtml = `
                    <div class="question-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6>Question ${index + 1}</h6>
                                <p>${question.text}</p>
                                <div class="options-list">
                                    ${question.options.map((option, optIndex) => `
                                        <div class="option-item ${optIndex === question.correctAnswer ? 'correct-option' : ''}">
                                            ${String.fromCharCode(65 + optIndex)}. ${option}
                                            ${optIndex === question.correctAnswer ? '<i class="fas fa-check text-success ms-2"></i>' : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="ms-3">
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteQuestion('${questionId}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                questionsList.innerHTML += questionHtml;
            });
        }

        function addNewQuestion() {
            document.getElementById('addQuestionCard').style.display = 'block';
            document.getElementById('questionForm').reset();
            setupQuestionForm();
        }

        function setupQuestionForm() {
            const questionType = document.getElementById('questionType');
            questionType.addEventListener('change', function() {
                updateOptionsContainer();
            });
            updateOptionsContainer();
        }

        function updateOptionsContainer() {
            const questionType = document.getElementById('questionType').value;
            const optionsList = document.getElementById('optionsList');
            
            if (questionType === 'multiple-choice') {
                optionsList.innerHTML = `
                    <div class="col-md-6 mb-2">
                        <input type="text" class="form-control" id="option0" placeholder="Option A" required>
                    </div>
                    <div class="col-md-6 mb-2">
                        <input type="text" class="form-control" id="option1" placeholder="Option B" required>
                    </div>
                    <div class="col-md-6 mb-2">
                        <input type="text" class="form-control" id="option2" placeholder="Option C" required>
                    </div>
                    <div class="col-md-6 mb-2">
                        <input type="text" class="form-control" id="option3" placeholder="Option D" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Correct Answer</label>
                        <select class="form-select" id="correctAnswer" required>
                            <option value="">Select correct answer</option>
                            <option value="0">Option A</option>
                            <option value="1">Option B</option>
                            <option value="2">Option C</option>
                            <option value="3">Option D</option>
                        </select>
                    </div>
                `;
            } else if (questionType === 'true-false') {
                optionsList.innerHTML = `
                    <div class="col-12">
                        <label class="form-label">Correct Answer</label>
                        <select class="form-select" id="correctAnswer" required>
                            <option value="">Select correct answer</option>
                            <option value="0">True</option>
                            <option value="1">False</option>
                        </select>
                    </div>
                `;
            }
        }

        async function saveQuestion() {
            const questionText = document.getElementById('questionText').value;
            const questionType = document.getElementById('questionType').value;
            const correctAnswer = document.getElementById('correctAnswer').value;

            if (!questionText || !questionType || correctAnswer === '') {
                alert('Please fill in all required fields');
                return;
            }

            let options = [];
            if (questionType === 'multiple-choice') {
                options = [
                    document.getElementById('option0').value,
                    document.getElementById('option1').value,
                    document.getElementById('option2').value,
                    document.getElementById('option3').value
                ];
                
                if (options.some(opt => !opt.trim())) {
                    alert('Please fill in all options');
                    return;
                }
            } else {
                options = ['True', 'False'];
            }

            const questionData = {
                text: questionText,
                type: questionType,
                options: options,
                correctAnswer: parseInt(correctAnswer)
            };

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/exams/${currentExamId}/questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(questionData)
                });
                
                if (response.ok) {
                    loadQuestions(currentExamId); // Reload questions from server
                    loadExams(); // Reload exams to update question count
                    cancelAddQuestion();
                    alert('Question added successfully!');
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + (errorData.message || 'Failed to add question'));
                }
            } catch (error) {
                console.error('Error saving question:', error);
                alert('Network error. Please try again.');
            }
        }

        async function deleteQuestion(questionId) {
            console.log('Attempting to delete question with ID:', questionId); // Debug log
            
            if (!questionId) {
                alert('Error: Question ID is missing');
                return;
            }

            if (confirm('Are you sure you want to delete this question?')) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/questions/${questionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('Delete response status:', response.status); // Debug log
                    
                    if (response.ok) {
                        loadQuestions(currentExamId); // Reload questions from server
                        loadExams(); // Reload exams to update question count
                        alert('Question deleted successfully!');
                    } else {
                        const errorData = await response.json();
                        console.error('Delete error response:', errorData); // Debug log
                        alert('Error: ' + (errorData.message || errorData.error || 'Failed to delete question'));
                    }
                } catch (error) {
                    console.error('Error deleting question:', error);
                    alert('Network error. Please try again.');
                }
            }
        }

        function cancelAddQuestion() {
            document.getElementById('addQuestionCard').style.display = 'none';
            document.getElementById('questionForm').reset();
        }

        function refreshExams() {
            loadExams();
            alert('Exams refreshed successfully!');
        }

        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }            