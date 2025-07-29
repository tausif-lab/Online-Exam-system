
document.addEventListener('DOMContentLoaded', loadAvailableExams);

async function loadAvailableExams() {
    const token = localStorage.getItem('token');
    const examsContainer = document.getElementById('examsList');
    examsContainer.innerHTML = '<p>Loading exams...</p>';

    try {
        const response = await fetch('/api/exams', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            examsContainer.innerHTML = '<p>Failed to load exams.</p>';
            return;
        }

        const data = await response.json();
        if (!data.success || !data.data || !Array.isArray(data.data)) {
            examsContainer.innerHTML = '<p>No exams found.</p>';
            return;
        }

        // Generate exam links
        examsContainer.innerHTML = data.data.map(exam => `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${exam.title}</h5>
                    <p class="card-text">${exam.description || ''}</p>
                    <a class="btn btn-primary" href="/student-exam.html?examId=${exam._id}">
                        Start Exam
                    </a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        examsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}




window.addEventListener('load', function() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token || user.role !== 'student') {
                window.location.href = '/login';
                return;
            }
            
            // Display user name
            document.getElementById('userName').textContent = user.fullName || 'Student';
            
            // Load user profile
            loadProfile();
        });
        
        async function loadProfile() {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    document.getElementById('userName').textContent = user.fullName;
                } else {
                    console.error('Failed to load profile');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }
        
        function viewExams() {
            alert('Exam module will be implemented in the next phase');
        }
        
        function viewResults() {
            alert('Results module will be implemented in the next phase');
        }
        
        function viewProfile() {
            alert('Profile module will be implemented in the next phase');
        }
        
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

