const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Apply admin authentication middleware to all routes
router.use(adminController.authenticateAdmin);

// Dashboard
router.get('/dash', adminController.dash_get);

// Teacher Management
router.get('/teachers', adminController.teachers_get);
router.get('/teachers/create', adminController.teacher_create_get);
router.post('/teachers/create', adminController.teacher_create_post);
router.get('/teachers/:teacherId/edit', adminController.teacher_edit_get);
router.post('/teachers/:teacherId/edit', adminController.teacher_edit_post);
router.delete('/teachers/:teacherId', adminController.teacher_delete);
router.get('/teachers/:teacherId/students', adminController.teacher_students_get);

// Code Management
router.get('/codes', adminController.codes_get);
router.get('/codes/create', adminController.codes_create_get);
router.post('/codes/create', adminController.codes_create_post);
router.post('/codes/upload-excel', adminController.codes_upload_excel);
router.get('/codes/manage', adminController.codes_manage_get);
router.delete('/codes/:codeId', adminController.code_delete);
router.delete('/codes/delete-unused', adminController.codes_delete_unused);
router.get('/codes/export', adminController.codes_export);

// API routes for admin to access teacher data
router.get('/api/videos/chapter/:chapterId', adminController.getVideosByChapter);
router.get('/api/quizzes/grade/:grade/teacher/:teacherId', adminController.getQuizzesByGradeAndTeacher);

// Logout route
router.get('/logout', adminController.logout);

module.exports = router;
