const User = require('../models/User');
const Chapter = require('../models/Chapter');
const Teacher = require('../models/Teacher');
const Quiz = require('../models/Quiz');

const waapi = require('@api/waapi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWTSECRET;
const waapiAPI = process.env.WAAPIAPI;
waapi.auth(`${waapiAPI}`);

const home_page = async (req, res) => {
  try {
    // Check if we're accessing a teacher-specific landing page
    const teacherSlug = req.params.teacherSlug;
    
    if (teacherSlug) {
      // Find teacher by slug
      const teacher = await Teacher.findOne({ 
        slug: teacherSlug,
        isActive: true 
      });
      
      console.log('Teacher lookup by slug:', teacherSlug, teacher ? 'found' : 'not found');
      
      if (!teacher) {
        return res.status(404).send('Teacher not found');
      }
      
      // Get teacher's landing page data
      const landingPageData = teacher.getLandingPageData();
      console.log('Landing page data:', landingPageData);
      
      // Render teacher-specific landing page
      return res.render('index', {
        title: `${teacher.brandName} - Home Page`,
        teacher: landingPageData,
        isTeacherPage: true,
        teacherSlug
      });
    }
    
    // Find the default teacher if exists
    const defaultTeacher = await Teacher.findOne({ isDefault: true });
    
    // Render main landing page
    res.render('index', {
      title: 'Momken Academy',
      teacher: defaultTeacher ? defaultTeacher.getLandingPageData() : null,
      isTeacherPage: false
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getChaptersByGrade = async (req, res) => {
  const { grade } = req.query; // Extract grade from query params
  console.log('grade', grade);
  try {
    const chapters = await Chapter.find({
      chapterGrade: grade,
    }).sort({ createdAt: -1 });
    console.log('chapters', chapters);
    res.json(chapters); // Send the filtered chapters as JSON
  } catch (error) {
    console.error('Error fetching chapters by grade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// const changeChapters = async (req, res) => {
// }

const public_login_get = (req, res) => {
  const StudentCode = req.query.StudentCode;
  res.render('login', {
    title: 'Login Page',
    Email: '',
    Password: '',
    error: '',
    StudentCode: StudentCode || '',
  });
};

const public_login_post = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Debug logging
    console.log('Login attempt:', { 
      phone, 
      requestBody: req.body 
    });

    const user = await User.findOne({ phone: phone});
    console.log('User data:', user ? {
      id: user._id,
      username: user.Username,
      isTeacher: user.isTeacher,
      isAdmin: user.isAdmin,
      phone: user.phone
    } : 'No user found');
    
    if (!user) {
      return res
        .status(401)
        .render('login', {
          title: 'Login Page',
          Email: '',
          Password: null,
          error: ' رقم الهاتف او كلمه المرور خاطئ او الاكونت غير مفعل',
        });
    }

    // Check if password matches either the hashed password or the plain text password (for backward compatibility)
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.Password);
    } catch (bcryptError) {
      console.log('Bcrypt comparison error:', bcryptError);
      // If bcrypt comparison fails, try direct comparison with unhashed password as fallback
      isPasswordValid = (password === user.PasswordWithOutHash);
    }
    
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).render('login', {
        title: 'Login Page',
        Email: '',
        Password: null,
        error: ' رقم الهاتف او كلمه المرور خاطئ او الاكونت غير مفعل',
      });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Check if the user is an admin
    console.log('Login successful for user:', { 
      username: user.Username, 
      isTeacher: Boolean(user.isTeacher), 
      isAdmin: Boolean(user.isAdmin) 
    });
    
    // Automatically redirect admin users to admin dashboard
    if (user.isTeacher === true && user.isAdmin === true) {
      console.log('Admin user detected, redirecting to /admin/dash');
      return res.redirect('/admin/dash');
    } else if (user.isTeacher === true) {
      // Regular teacher goes to teacher dashboard
      console.log('Teacher user detected, redirecting to /teacher/dash');
      return res.redirect('/teacher/dash');
    } else {
      // Student goes to student dashboard
      console.log('Student user detected, redirecting to /student/dash');
      return res.redirect('/student/dash');
      // if (user.subscribe) {
      // } else {
      //   return res.redirect('/login?StudentCode=' + user.Code);
      // }
    }
  } catch (error) {
    console.log('Login error:', error);
    return res.status(500).render('login', {
      title: 'Login Page',
      Email: '',
      Password: null,
      error: 'حدث خطأ في النظام، يرجى المحاولة مرة أخرى',
    });
  }
};

const public_Register_get = async (req, res) => {
  const StudentCode = req.query.StudentCode;
  const teacherSlug = req.params.teacherSlug;
  
  try {
    // Get all active teachers for the dropdown
    const teachers = await Teacher.find({ isActive: true })
      .select('_id name brandName slug');
    
    // If accessed through a teacher slug, pre-select that teacher
    let selectedTeacher = null;
    if (teacherSlug) {
      selectedTeacher = await Teacher.findOne({ slug: teacherSlug });
    }
    
    res.render('Register', {
      title: 'Register Page',
      formData: req.body,
      firebaseError: '',
      StudentCode,
      teachers,
      selectedTeacherId: selectedTeacher ? selectedTeacher._id : null,
      teacherSlug
    });
  } catch (error) {
    console.error('Register page error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const public_Register_post = async (req, res) => {
  const {
    password,
    password2,
    Username,
    gov,
    Markez,
    schoolName,
    Grade,
    gender,
    phone,
    parentPhone,
    teacherId
  } = req.body;
  
  // Get teacher slug for redirect if present
  const teacherSlug = req.params.teacherSlug;
  
  // For debugging
  console.log('Registration data:', { 
    Username, 
    Grade, 
    teacherId, 
    teacherSlug
  });

  // Create an object to store validation errors
  const errors = {};

  if (password.length < 7) {
    req.body.Password = '';
    errors.password = '- كلمة المرور يجب ان لا تقل عن 7';
  }

  if (password !== password2) {
    req.body.Password = '';
    req.body.Password2 = '';
    errors.password = '- كلمة المرور غير متطابقة';
  }


  let Code = Math.floor(Math.random() * 400000 + 600000);

  // Check if the phone number has 11 digits
  // if (phone.length !== 222) {
  //   req.body.phone = '';
  //   errors.phone = '- رقم الهاتف يجب ان يحتوي علي 11 رقم';
  // }

  // Check if the parent's phone number has 11 digits
  // if (parentPhone.length !== 11) {
  //   req.body.parentPhone = '';
  //   errors.parentPhone = '- رقم هاتف ولي الامر يجب ان يحتوي علي 11 رقم';
  // }

  // Check if phone is equal to parentPhone
  if (phone === parentPhone) {
    // Clear the phone and parentPhone fields in the form data
    req.body.phone = '';
    req.body.parentPhone = '';

    // Set an error message for this condition
    errors.phone = '- رقم هاتف الطالب لا يجب ان يساوي رقم هاتف ولي الامر';
  }
  if (!gov) {
    errors.gov = '- يجب اختيار محافظة';
  }
  if (!Grade) {
    errors.Grade = '- يجب اختيار الصف الدراسي';
  }

  if (!Markez) {
    errors.Markez = '- يجب اختيار المركز';
  }
  if (!schoolName) {
    errors.schoolName = '- يجب ادخال اسم المدرسة';
  }
  
  // Check if teacher is selected when not coming from a teacher-specific page
  if (!teacherSlug && !teacherId) {
    errors.teacherId = '- يجب اختيار المعلم';
  }
  console.log('req.body', req.body);

  console.log('errors', errors);

  if (Object.keys(errors).length > 0) {
    try {
      // Get all active teachers for the dropdown again
      const teachers = await Teacher.find({ isActive: true })
        .select('_id name brandName slug');
      
      // If accessed through a teacher slug, pre-select that teacher
      let selectedTeacher = null;
      if (teacherSlug) {
        selectedTeacher = await Teacher.findOne({ slug: teacherSlug });
      }
      
      return res.render('Register', {
        title: 'Register Page',
        errors: errors,
        firebaseError: '',
        formData: req.body, // Pass the form data back to pre-fill the form
        teachers,
        selectedTeacherId: selectedTeacher ? selectedTeacher._id : (teacherId || null),
        teacherSlug
      });
    } catch (error) {
      console.error('Error fetching teachers for form validation:', error);
      return res.render('Register', {
        title: 'Register Page',
        errors: {...errors, server: 'حدث خطأ في النظام، يرجى المحاولة مرة أخرى'},
        firebaseError: '',
        formData: req.body
      });
    }
  }



  // auth Of jwt

  let quizesInfo = [];
  let videosInfo = [];

  try {
    // Get all chapters and quizzes for the student's grade in parallel
    const [chapters, quizzes] = await Promise.all([
      Chapter.find({ chapterGrade: Grade ,teacherId: teacherId }).lean(),
      Quiz.find({ Grade: Grade ,teacherId: teacherId }).lean()
    ]);

    // Initialize arrays
    videosInfo = [];
    quizesInfo = [];

    // Process chapters to get all videos
    for (const chapter of chapters) {
      const allVideos = [
        ...(chapter.chapterLectures || []),
        ...(chapter.chapterSummaries || []),
        ...(chapter.chapterSolvings || [])
      ];
      
      for (const video of allVideos) {
        if (video._id && (video.videoName || video.lectureName)) {
          videosInfo.push({
            _id: video._id,
            videoName: video.videoName || video.lectureName,
            chapterId: chapter._id,
            videoType: video.videoType || 'lecture',
            fristWatch: null,
            lastWatch: null,
            videoAllowedAttemps: 10,
            numberOfWatches: 0,
            videoPurchaseStatus: false,
            purchaseDate: null,
            purchaseCode: null,
            isUserEnterQuiz: false,
            isHWIsUploaded: false,
            isUserUploadPerviousHWAndApproved: false,
            prerequisites: video.prerequisites || 'none',
            accessibleAfterViewing: null
          });
        }
      }
    }

    // Process quizzes
    for (const quiz of quizzes) {
      if (quiz._id && quiz.quizName) {
        quizesInfo.push({
          _id: quiz._id,
          quizName: quiz.quizName,
          chapterId: quiz.chapterId,
          isEnterd: false,
          inProgress: false,
          Score: 0,
          answers: [],
          randomQuestionIndices: [],
          quizPurchaseStatus: false,
          purchaseDate: null,
          purchaseCode: null,
          startTime: null,
          endTime: null,
          solvedAt: null
        });
      }
    }
  } catch (error) {
    console.error('Error initializing student data:', error);
    // Handle error appropriately
    videosInfo = [];
    quizesInfo = [];
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Validate teacher ID if provided
    let validTeacherId = null;
    let selectedTeacher = null;
    
    console.log('Teacher selection process - teacherId:', teacherId);
    console.log('Teacher selection process - teacherSlug:', teacherSlug);
    
    // First try to use the provided teacherId from the form
    if (teacherId) {
      selectedTeacher = await Teacher.findById(teacherId);
      if (selectedTeacher && selectedTeacher.isActive) {
        validTeacherId = selectedTeacher._id;
        console.log('Teacher selected from form input:', selectedTeacher.name);
      }
    }
    
    // If no valid teacher ID and we're on a teacher page, try to get that teacher
    if (!validTeacherId && teacherSlug) {
      selectedTeacher = await Teacher.findOne({ slug: teacherSlug, isActive: true });
      if (selectedTeacher) {
        validTeacherId = selectedTeacher._id;
        console.log('Teacher selected from slug:', selectedTeacher.name);
      }
    }
    
    // If still no valid teacher, try to get default teacher
    if (!validTeacherId) {
      selectedTeacher = await Teacher.findOne({ isDefault: true, isActive: true });
      if (selectedTeacher) {
        validTeacherId = selectedTeacher._id;
        console.log('Default teacher selected:', selectedTeacher.name);
      } else {
        // If no default teacher, get any active teacher
        const anyTeacher = await Teacher.findOne({ isActive: true });
        if (anyTeacher) {
          validTeacherId = anyTeacher._id;
          console.log('Fallback to any active teacher:', anyTeacher.name);
        } else {
          console.log('No active teachers found in the system');
        }
      }
    }
    
    // Log the final selection
    console.log('Final teacher selection:', validTeacherId);
    
    const user = new User({
      Username: Username,
      Password: hashedPassword,
      PasswordWithOutHash: password,
      gov: gov,
      Markez: Markez,
      schoolName: schoolName,
      Grade: Grade,
      gender: 'male',
      phone: phone,
      parentPhone: parentPhone,
      place: 'online',
      Code: Code,
      subscribe: false,
      quizesInfo: quizesInfo,
      videosInfo: videosInfo,
      totalScore: 0,
      examsEnterd: 0,
      totalQuestions: 0,
      totalSubscribed: 0,
      isTeacher: false,
      ARorEN: 'AR',
      chaptersPaid: [],
      videosPaid: [],
      examsPaid: [],
      teacherId: validTeacherId, // Add teacher reference
      // Add other fields as needed
    });
    user
      .save()
      .then((result) => {
        // If registration was from a teacher page, redirect back to that page
        const redirectUrl = teacherSlug 
          ? `/${teacherSlug}/Register?StudentCode=${encodeURIComponent(Code)}`
          : `Register?StudentCode=${encodeURIComponent(Code)}`;
        
        res.status(201).redirect(redirectUrl);
      })
      .catch((error) => {
        if (error.name === 'MongoServerError' && error.code === 11000) {
          // Duplicate key error
          errors.emailDub = 'هذا الرقم مستخدم من قبل';
          // Handle the error as needed
          res.render('Register', {
            title: 'Register Page',
            errors: errors,
            firebaseError: '',
            formData: req.body, // Pass the form data back to pre-fill the form
          });
        } else {
          // Handle other errors
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      });
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      // Duplicate key error
      errors.emailDub = 'This email is already in use.';
      // Handle the error as needed
      res.status(409).json({ message: 'User already in use' });
    } else {
      // Handle other errors
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

const send_verification_code = async (req, res) => {
  try {
    const { phone } = req.body;
    const code = Math.floor(Math.random() * 400000 + 600000);
    const message = `كود التحقق الخاص بك هو ${code}`;

    // Send the message via the waapi (already present)
    await waapi
      .postInstancesIdClientActionSendMessage(
        {
          chatId: `2${phone}@c.us`,
          message: message,
        },
        { id: '21299' }
      )

      .then(({ data }) => {
        // Store the verification code and phone in the session or database
        req.session.verificationCode = code; // Assuming session middleware is used
        req.session.phone = phone;

        // Send a successful response after setting the session
        res.status(201).json({ success: true, data });
      })
      .catch((err) => {
        // Handle any error that occurs during the waapi call
        console.error(err);
        res.status(500).json({ success: false, error: err });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

const forgetPassword_get = (req, res) => {
  res.render('forgetPassword', {
    title: 'Forget Password',
    error: null,
    success: null,
  });
};

const forgetPassword_post = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({
      $or: [{ phone: phone }],
    });

    if (!user && phone) {
      res.render('forgetPassword', {
        title: 'Forget Password',
        error: 'لا يوجد حساب لهذا الايميل او رقم الهاتف',
        success: null,
      });
      return '';
    } else if (user && phone) {
      const secret = jwtSecret + user.Password;
      const token = jwt.sign({ phone: phone, _id: user._id }, secret, {
        expiresIn: '15m',
      });
      const link = `http://localhost:3000/reset-password/${user._id}/${token}`;

      console.log('aerd', link, postData);

      return '';
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error'); // Handle other errors
  }

  res.render('forgetPassword', {
    title: 'Forget Password',
    error: null,
    success: null,
  });
};

const reset_password_get = async (req, res) => {
  try {
    const { id, token } = req.params;

    const user = await User.findOne({ _id: id });
    if (!user) {
      res.send('invalid Id....');
      return;
    }
    const secret = jwtSecret + user.Password;
    const payload = jwt.verify(token, secret);
    res.render('reset-password', { phone: user.phone, error: null });
  } catch (error) {
    res.send(error.message);
  }
};

const reset_password_post = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password1, password2 } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      res.send('invalid Id....');
      return;
    }
    if (password1 === password2) {
      const secret = jwtSecret + user.Password;
      const payload = jwt.verify(token, secret);
      const hashedPassword = await bcrypt.hash(password1, 10);
      await User.findByIdAndUpdate({ _id: id }, { Password: hashedPassword })
        .then(() => {
          res.redirect('/login');
        })
        .catch((error) => {
          res.send(error.message);
        });
    } else {
      res.render('reset-password', {
        phone: user.phone,
        error: 'لازم يكونو شبه بعض',
      });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// ================== Authentication Middleware ====================== //

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.redirect('/login');
    }
    // if(!user.subscribe){
    //   return res.redirect('/login?StudentCode=' + user.Code);
    // }

    // Get teacher profile if exists
    let teacherProfile = null;
    if (user.teacherId) {
      teacherProfile = await Teacher.findById(user.teacherId);
    }
  
    req.userData = user;
    req.teacherProfile = teacherProfile; // Add teacher profile for filtering
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.redirect('/login');
  }
};

const authenticateTeacher = async (req, res, next) => {
  try {
    console.log('authenticateTeacher middleware called');
    const token = req.cookies.token;
    
    if (!token) {
      console.log('No token found, redirecting to login');
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('No user found with token, redirecting to login');
      return res.redirect('/login');
    }

    console.log('Teacher authentication check:', {
      username: user.Username,
      isTeacher: typeof user.isTeacher,
      isTeacherValue: user.isTeacher
    });

    if (user.isTeacher !== true) {
      console.log('User is not a teacher, redirecting to login');
      res.clearCookie('token');
      return res.redirect('/login');
    }

    // Get teacher profile if exists
    let teacherProfile = null;
    if (user.teacherId) {
      teacherProfile = await Teacher.findById(user.teacherId);
      console.log('Found teacher profile:', teacherProfile ? teacherProfile.name : 'No profile found');
    }

    req.userData = user;
    req.teacherData = user; // Additional reference for teacher
    req.teacherProfile = teacherProfile; // Add teacher profile for filtering
    console.log('Teacher authentication successful');
    next();
  } catch (error) {
    console.error('Teacher authentication error:', error);
    return res.redirect('/login');
  }
};

module.exports = {
  home_page,
  getChaptersByGrade,
  public_login_get,
  public_Register_get,
  public_Register_post,
  send_verification_code,
  public_login_post,
  forgetPassword_get,
  forgetPassword_post,
  reset_password_get,
  reset_password_post,
  authenticateUser,
  authenticateTeacher,
};
