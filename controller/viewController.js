const { get } = require('http');
const path = require('path');

// Serve home page
const getHomePage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'front.html'));
};

// Serve login page
const getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'login.html'));
};

// Serve registration page
const getRegisterPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'register.html'));
};

// Serve student dashboard
const getStudentDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'student-dashboard.html'));
};

// Serve admin dashboard
const getAdminDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'admin-dashboard.html'));
};

// Serve manage exams page
const getManageExamsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'manage-exam.html'));
};
//new exam for student
const getExamPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../view', 'studentExam.html'));
};

module.exports = {
    getHomePage,
    getLoginPage,
    getRegisterPage,
    getStudentDashboard,
    getAdminDashboard,
    getManageExamsPage,
    getExamPage
   
};
