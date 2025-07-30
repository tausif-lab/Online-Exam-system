// Check authentication
        window.addEventListener('load', function() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token || user.role !== 'admin') {
                window.location.href = '/login';
                return;
            }
            
            // Display admin name
            document.getElementById('adminName').textContent = user.fullName || 'Admin';
            
            // Load admin profile and statistics
            loadProfile();
            loadStatistics();
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
                    document.getElementById('adminName').textContent = user.fullName;
                } else {
                    console.error('Failed to load profile');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }
        
        function loadStatistics() {
            // Mock statistics - will be implemented with real data later
            document.getElementById('totalStudents').textContent = '45';
            document.getElementById('activeExams').textContent = '3';
            document.getElementById('completedExams').textContent = '12';
            document.getElementById('averageScore').textContent = '78%';
        }
        
       /*function manageExams() {
            alert('Exam management module will be implemented in the next phase');
        }*/
        
        function manageUsers() {
            alert('User management module will be implemented in the next phase');
        }
        
        function viewReports() {
            alert('Reports module will be implemented in the next phase');
        }
        
        function systemSettings() {
            alert('System settings module will be implemented in the next phase');
        }
        
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }