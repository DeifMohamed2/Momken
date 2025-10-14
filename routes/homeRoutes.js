// Import the necessary libraries
const express = require("express");
const homeController = require('../controllers/homeController');

const router = express.Router();

// Main routes
router.get("/", homeController.home_page);
router.get('/chaptersByGrade', homeController.getChaptersByGrade);
router.get("/login", homeController.public_login_get);
router.post("/login", homeController.public_login_post);
router.get("/Register", homeController.public_Register_get);
router.post("/Register", homeController.public_Register_post);

router.post('/send-verification-code', homeController.send_verification_code);

router.get("/forgetPassword", homeController.forgetPassword_get);
router.post("/forgetPassword", homeController.forgetPassword_post);
router.get("/reset-password/:id/:token", homeController.reset_password_get);
router.post("/reset-password/:id/:token", homeController.reset_password_post);

// Teacher-specific routes (with :teacherSlug parameter)
router.get("/:teacherSlug", homeController.home_page);
router.get("/:teacherSlug/login", homeController.public_login_get);
router.post("/:teacherSlug/login", homeController.public_login_post);
router.get("/:teacherSlug/Register", homeController.public_Register_get);
router.post("/:teacherSlug/Register", homeController.public_Register_post);
router.get("/:teacherSlug/forgetPassword", homeController.forgetPassword_get);
router.post("/:teacherSlug/forgetPassword", homeController.forgetPassword_post);








        

module.exports = router;

