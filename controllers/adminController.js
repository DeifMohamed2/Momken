const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Code = require('../models/Code');
const Chapter = require('../models/Chapter');
const Quiz = require('../models/Quiz');
const Video = require('../models/Video');
const PDFs = require('../models/PDFs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const jwtSecret = process.env.JWTSECRET;

// ==================  Dashboard  ====================== //

const dash_get = async (req, res) => {

  // Update all existing data to associate with teacher ID 68ee9cf223696e7cbcf4a188
  const updateAllDataForTeacher = async () => {
    try {
      const teacherId = new mongoose.Types.ObjectId('68ee9cf223696e7cbcf4a188');
      
      // Check if teacher exists
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        console.error('Teacher not found with ID: 68ee9cf223696e7cbcf4a188');
        return false;
      }
      // Update all users
      await User.updateMany(
        { teacherId: { $ne: teacherId } },
        { $set: { teacherId: teacherId } }
      );

      // Update all chapters
      await Chapter.updateMany(
        { teacherId: { $ne: teacherId } },
        { $set: { teacherId: teacherId } }
      );
      
      // Update all quizzes
      await Quiz.updateMany(
        { teacherId: { $ne: teacherId } },
        { $set: { teacherId: teacherId } }
      );
      
      // Update all codes
      await Code.updateMany(
        { teacherId: { $ne: teacherId } },
        { $set: { teacherId: teacherId } }
      );
      
      // Update all PDFs
      if (PDFs) {
        await PDFs.updateMany(
          { teacherId: { $ne: teacherId } },
          { $set: { teacherId: teacherId } }
        );
      }
      
      // Update all videos
      if (Video) {
        await Video.updateMany(
          { teacherId: { $ne: teacherId } },
          { $set: { teacherId: teacherId } }
        );
      }
      
      console.log('Successfully updated all content to teacher ID: 68ee9cf223696e7cbcf4a188');
      return true;
    } catch (error) {
      console.error('Error updating data for teacher:', error);
      return false;
    }
  };
  
  // Run the update function when the dashboard loads
  // This will ensure all data is associated with the specified teacher
  updateAllDataForTeacher();



  try {
    // Get counts for admin dashboard
    const [
      totalTeachers,
      totalStudents,
      activeTeachers
    ] = await Promise.all([
      Teacher.countDocuments({}),
      User.countDocuments({ isTeacher: false }),
      Teacher.countDocuments({ isActive: true })
    ]);

    // Get recent teachers
    const recentTeachers = await Teacher.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dash', {
      title: 'لوحة التحكم - الإدارة',
      path: req.path,
      adminData: req.userData,
      stats: {
        totalTeachers,
        totalStudents,
        activeTeachers
      },
      recentTeachers,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// ==================  Teacher Management  ====================== //

const teachers_get = async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const perPage = 10;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get teachers with pagination
    const teachers = await Teacher.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    
    const totalTeachers = await Teacher.countDocuments(query);
    
    // Get associated user data for each teacher
    const teachersWithUsers = await Promise.all(
      teachers.map(async (teacher) => {
        const user = await User.findById(teacher.userId).select('Username phone');
        return {
          ...teacher.toObject(),
          user: user || { Username: 'Unknown', phone: 'Unknown' }
        };
      })
    );
    
    res.render('admin/teachers', {
      title: 'إدارة المعلمين',
      path: req.path,
      adminData: req.userData,
      teachers: teachersWithUsers,
      totalTeachers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTeachers / perPage),
      search,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Teachers list error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const teacher_create_get = async (req, res) => {
  try {
    res.render('admin/teacher-create', {
      title: 'إضافة معلم جديد',
      path: req.path,
      adminData: req.userData,
      error: req.query.error,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Teacher create get error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const teacher_create_post = async (req, res) => {
  try {
    const {
      username,
      password,
      userPhone,
      isAdmin,
      name,
      slug,
      email,
      description,
      logoImage,
      coverImage,
      facebook,
      isDefault
    } = req.body;
    
    console.log('Creating teacher with data:', { 
      username, 
      userPhone, 
      isAdmin: isAdmin === 'true', 
      name, 
      slug 
    });
    
    // Validation for required fields - only username, password, userPhone, name, and email are required
    if (!username || !password || !userPhone || !name || !email) {
      return res.redirect('/admin/teachers/create?error=' + encodeURIComponent('يرجى ملء جميع الحقول المطلوبة'));
    }
    
    // Check if password is strong enough
    if (password.length < 6) {
      return res.redirect('/admin/teachers/create?error=' + encodeURIComponent('كلمة المرور يجب أن تكون 6 أحرف على الأقل'));
    }
    
    // Check if phone is already in use
    const existingUserWithPhone = await User.findOne({ phone: userPhone });
    if (existingUserWithPhone) {
      return res.redirect('/admin/teachers/create?error=' + encodeURIComponent('رقم الهاتف مستخدم بالفعل، يرجى استخدام رقم آخر'));
    }
    
    // Check if slug is already in use
    if (slug) {
      const existingTeacher = await Teacher.findOne({ slug });
      if (existingTeacher) {
        return res.redirect('/admin/teachers/create?error=' + encodeURIComponent('الرابط المخصص مستخدم بالفعل، يرجى اختيار رابط آخر'));
      }
    }
    
    // If this is set as default, unset any existing default
    if (isDefault === 'true') {
      await Teacher.updateMany({}, { isDefault: false });
    }
    
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (bcryptError) {
      console.error('Error hashing password:', bcryptError);
      return res.redirect('/admin/teachers/create?error=' + encodeURIComponent('حدث خطأ أثناء تشفير كلمة المرور'));
    }
    
    // Generate a random code for the teacher
    const teacherCode = Math.floor(100000 + Math.random() * 900000);
    
    // Create user account with explicit boolean values for isTeacher and isAdmin
    const user = new User({
      Username: username,
      Password: hashedPassword,
      PasswordWithOutHash: password, // Store plain password for backup access
      phone: userPhone,
      parentPhone: userPhone, // Use the same phone number for both fields
      gov: 'Admin',
      Markez: 'Admin',
      schoolName: 'Admin',
      Grade: 'Grade3',
      gender: 'male',
      place: 'online',
      Code: teacherCode,
      ARorEN: 'AR',
      isTeacher: true, // Explicitly set as boolean true
      isAdmin: isAdmin === 'true' ? true : false, // Explicitly convert to boolean
      subscribe: true,
      // Required fields with default values
      totalScore: 0,
      examsEnterd: 0,
      totalQuestions: 0,
      totalSubscribed: 0,
      quizesInfo: [],
      videosInfo: []
    });
    
    const savedUser = await user.save();
    console.log('Teacher user created:', {
      id: savedUser._id,
      username: savedUser.Username,
      isTeacher: savedUser.isTeacher,
      isAdmin: savedUser.isAdmin
    });
    
    // Create teacher profile
    const teacher = new Teacher({
      userId: savedUser._id,
      name,
      slug: slug || undefined, // Let the pre-save hook generate if not provided
      email,
      phone: userPhone, // Use the same phone number for consistency
      brandName: name, // Use the teacher name as the brand name by default
      description: description || '',
      logoImage: logoImage || '/assetsLanding/img/logoMomke.png',
      coverImage: coverImage || '/assetsLanding/img/in-front.jpg',
      facebook: facebook || '',
      isDefault: isDefault === 'true' ? true : false // Explicitly convert to boolean
    });
    
    const savedTeacher = await teacher.save();
    console.log('Teacher profile created:', {
      id: savedTeacher._id,
      name: savedTeacher.name,
      slug: savedTeacher.slug
    });
    
    // Update user with teacher reference
    await User.findByIdAndUpdate(savedUser._id, { teacherId: savedTeacher._id });
    
    res.redirect('/admin/teachers?success=' + encodeURIComponent('تم إنشاء حساب المعلم بنجاح'));
  } catch (error) {
    console.error('Teacher create error:', error);
    res.redirect('/admin/teachers/create?error=' + encodeURIComponent('حدث خطأ أثناء إنشاء الحساب: ' + error.message));
  }
};

const teacher_edit_get = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).send('Teacher not found');
    }
    
    // Get associated user
    const user = await User.findById(teacher.userId).select('Username phone');
    
    res.render('admin/teacher-edit', {
      title: `تعديل ${teacher.name}`,
      path: req.path,
      adminData: req.userData,
      teacher,
      user,
      error: req.query.error,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('Teacher edit get error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const teacher_edit_post = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const {
      name,
      slug,
      email,
      phone,
      description,
      logoImage,
      coverImage,
      facebook,
      isActive,
      isDefault
    } = req.body;
    
    // Validation - only name, email required
    if (!name || !email) {
      return res.redirect(`/admin/teachers/${teacherId}/edit?error=missing_fields`);
    }
    
    // Check if slug is already in use (if changed)
    if (slug) {
      const existingTeacher = await Teacher.findOne({ 
        slug, 
        _id: { $ne: teacherId } 
      });
      
      if (existingTeacher) {
        return res.redirect(`/admin/teachers/${teacherId}/edit?error=slug_in_use`);
      }
    }
    
    // If this is set as default, unset any existing default
    if (isDefault === 'true') {
      await Teacher.updateMany({ _id: { $ne: teacherId } }, { isDefault: false });
    }
    
    // Update teacher profile
    const updateData = {
      name,
      slug: slug || undefined,
      email,
      phone: phone || '',
      brandName: name, // Use the teacher name as the brand name
      description: description || '',
      logoImage: logoImage || '/assetsLanding/img/logoMomke.png',
      coverImage: coverImage || '/assetsLanding/img/in-front.jpg',
      facebook: facebook || '',
      isActive: isActive === 'true',
      isDefault: isDefault === 'true',
      updatedAt: new Date()
    };
    
    await Teacher.findByIdAndUpdate(teacherId, updateData);
    
    res.redirect('/admin/teachers?success=teacher_updated');
  } catch (error) {
    console.error('Teacher edit error:', error);
    res.redirect(`/admin/teachers/${req.params.teacherId}/edit?error=update_failed`);
  }
};

const teacher_delete = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    // Get teacher to find associated user
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    // Update user to remove teacher reference
    await User.findByIdAndUpdate(teacher.userId, { teacherId: null });
    
    // Delete teacher profile
    await Teacher.findByIdAndDelete(teacherId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Teacher delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const teacher_students_get = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).send('Teacher not found');
    }
    
    // Get students assigned to this teacher
    const students = await User.find({ 
      teacherId: teacherId,
      isTeacher: false
    }).select('Username Code Grade phone parentPhone subscribe createdAt');
    
    res.render('admin/teacher-students', {
      title: `طلاب ${teacher.name}`,
      path: req.path,
      adminData: req.userData,
      teacher,
      students,
      totalStudents: students.length,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Teacher students error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// ==================  Code Management  ====================== //

const codes_get = async (req, res) => {
  try {
    const { search, type, status, grade, page = 1, teacherId } = req.query;
    const perPage = 20;
    
    // Build query
    let query = {};
    
    // Add teacher filtering if teacher ID exists
    if (teacherId) {
      query.teacherId = teacherId;
    }
    
    if (search) {
      // Search in both Code and usedBy fields
      const searchNumber = parseInt(search);
      const searchRegex = { $regex: search, $options: 'i' };
      
      if (!isNaN(searchNumber)) {
        // If search is a number, search in both Code and usedBy
        query.$or = [
          { Code: searchRegex },
          { usedBy: searchNumber }
        ];
      } else {
        // If search is not a number, search in Code field only
        query.Code = searchRegex;
      }
    }
    
    if (type) {
      query.codeType = type;
    }
    
    if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'unused') {
      query.isUsed = false;
    }
    
    if (grade) {
      query.codeGrade = grade;
    }
    
    // Get statistics for codes
    const codeStats = await Code.aggregate([
      {
        $group: {
          _id: null,
          totalCodes: { $sum: 1 },
          usedCodes: { $sum: { $cond: [{ $eq: ['$isUsed', true] }, 1, 0] } },
          chapterCodes: { $sum: { $cond: [{ $eq: ['$codeType', 'Chapter'] }, 1, 0] } },
          videoCodes: { $sum: { $cond: [{ $eq: ['$codeType', 'Video'] }, 1, 0] } },
          quizCodes: { $sum: { $cond: [{ $eq: ['$codeType', 'Quiz'] }, 1, 0] } },
          pdfCodes: { $sum: { $cond: [{ $eq: ['$codeType', 'PDF'] }, 1, 0] } },
          generalCodes: { $sum: { $cond: [{ $eq: ['$isGeneralCode', true] }, 1, 0] } }
        }
      }
    ]);
    
    // Get chapters for code generation
    const chapters = await Chapter.find({ isActive: true }).select('chapterName chapterGrade');
    
    // Get quizzes for code generation
    const quizzes = await Quiz.find({ isQuizActive: true }).select('quizName Grade');
    
    // Get all teachers for selection
    const teachers = await Teacher.find({ isActive: true }).select('name slug');
    
    // Get codes with pagination
    const codes = await Code.find(query)
      .sort({ createdAt: -1 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .populate('teacherId', 'name slug');
    
    const totalCodes = await Code.countDocuments(query);
    
    const stats = codeStats[0] || { 
      totalCodes: 0, 
      usedCodes: 0, 
      chapterCodes: 0, 
      videoCodes: 0, 
      quizCodes: 0, 
      pdfCodes: 0, 
      generalCodes: 0 
    };
    
    res.render('admin/codes', {
      title: 'إدارة الأكواد',
      path: req.path,
      adminData: req.userData,
      stats: {
        totalCodes: stats.totalCodes,
        usedCodes: stats.usedCodes,
        availableCodes: stats.totalCodes - stats.usedCodes,
        chapterCodes: stats.chapterCodes,
        videoCodes: stats.videoCodes,
        quizCodes: stats.quizCodes,
        pdfCodes: stats.pdfCodes,
        generalCodes: stats.generalCodes
      },
      chapters,
      quizzes,
      teachers,
      codes,
      totalCodes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCodes / perPage),
      filters: { search, type, status, grade, teacherId },
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Admin codes error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const codes_create_get = async (req, res) => {
  try {
    // Get all teachers for selection
    const teachers = await Teacher.find({ isActive: true }).select('name slug');
    
    // Get chapters for code generation (from all teachers)
    const chapters = await Chapter.find({ isActive: true }).select('chapterName chapterGrade teacherId');
    
    // Get quizzes for code generation (from all teachers)
    const quizzes = await Quiz.find({ isQuizActive: true }).select('quizName Grade teacherId');
    
    res.render('admin/codes-create', {
      title: 'إنشاء أكواد',
      path: req.path,
      adminData: req.userData,
      teachers,
      chapters,
      quizzes,
      generatedCodes: [],
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Admin codes create get error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const codes_create_post = async (req, res) => {
  try {
    const {
      codeType,
      count,
      grade,
      isGeneral,
      chapterId,
      contentId,
      teacherId
    } = req.body;

    // Validation
    if (!codeType || !count || !grade || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة'
      });
    }

    const codesCount = parseInt(count);
    if (codesCount < 1 || codesCount > 100) {
      return res.status(400).json({
        success: false,
        message: 'عدد الأكواد يجب أن يكون بين 1 و 100'
      });
    }

    // Generate numeric-only codes (12 digits)
    const generatedCodes = [];
    const usedCodes = new Set();

    for (let i = 0; i < codesCount; i++) {
      let code;
      do {
        // Generate 12-digit numeric code
        code = Math.floor(Math.random() * 900000000000) + 100000000000; // 12 digits
        code = code.toString();
      } while (usedCodes.has(code));

      usedCodes.add(code);

      // Determine content details based on code type
      let contentName = 'عام';
      let chapterName = '';

      if (!isGeneral || isGeneral === 'false') {
        if (chapterId) {
          const chapter = await Chapter.findById(chapterId);
          if (chapter) {
            chapterName = chapter.chapterName;
          }
        }

        if (contentId) {
          if (codeType === 'Video') {
            const video = await Video.findById(contentId);
            if (video) {
              contentName = video.videoTitle || video.lectureName;
            }
          } else if (codeType === 'Quiz') {
            const quiz = await Quiz.findById(contentId);
            if (quiz) {
              contentName = quiz.quizName;
            }
          } else if (codeType === 'PDF') {
            const pdf = await PDFs.findById(contentId);
            if (pdf) {
              contentName = pdf.pdfName;
            }
          }
        }
      }

      // Create code object
      const codeObj = {
        Code: code,
        codeType: codeType,
        codeGrade: grade,
        isGeneral: isGeneral === 'true',
        isAllGrades: grade === 'AllGrades',
        chapterId: chapterId || null,
        contentId: contentId || null,
        contentName: contentName,
        chapterName: chapterName,
        teacherId: teacherId, // Use selected teacher
        usedBy: null,
        createdAt: new Date()
      };

      generatedCodes.push(codeObj);
    }

    // Save codes to database
    const savedCodes = await Code.insertMany(generatedCodes);

    // Return JSON response for AJAX
    return res.json({
      success: true,
      message: `تم إنشاء ${codesCount} كود بنجاح`,
      codes: savedCodes
    });

  } catch (error) {
    console.error('Admin code creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الأكواد'
    });
  }
};

const codes_upload_excel = async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const { codeType, grade, isGeneral, chapterId, contentId, teacherId } = req.body;
    
    // Check if file was uploaded
    if (!req.files || !req.files.excelFile) {
      return res.status(400).json({
        success: false,
        message: 'يرجى رفع ملف Excel'
      });
    }

    const excelFile = req.files.excelFile;
    
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(excelFile.mimetype) && !excelFile.name.match(/\.(xlsx|xls)$/)) {
      return res.status(400).json({
        success: false,
        message: 'يرجى رفع ملف Excel صحيح (.xlsx أو .xls)'
      });
    }

    // Validation
    if (!codeType || !grade || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة'
      });
    }

    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelFile.data);
    
    const worksheet = workbook.getWorksheet(1); // Get first worksheet
    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم العثور على بيانات في ملف Excel'
      });
    }

    // Find the code column
    let codeColumnIndex = -1;
    const headerRow = worksheet.getRow(1);
    
    // Look for code column headers (Arabic or English)
    const possibleHeaders = ['الكود', 'Code', 'كود', 'code', 'الكود', 'الرمز'];
    
    headerRow.eachCell((cell, colNumber) => {
      const cellValue = cell.value ? cell.value.toString().trim() : '';
      if (possibleHeaders.includes(cellValue)) {
        codeColumnIndex = colNumber;
      }
    });

    if (codeColumnIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم العثور على عمود "الكود" أو "Code" في ملف Excel'
      });
    }

    // Extract codes from Excel
    const extractedCodes = [];
    const usedCodes = new Set();
    
    // Get existing codes from database to avoid duplicates
    const existingCodes = await Code.find({}, 'Code');
    existingCodes.forEach(code => usedCodes.add(code.Code));

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const codeCell = row.getCell(codeColumnIndex);
      const codeValue = codeCell.value;
      
      if (codeValue) {
        const code = codeValue.toString().trim();
        
        // Validate code format (should be numeric and 12 digits)
        if (code && /^\d{12}$/.test(code)) {
          // Check if code already exists
          if (!usedCodes.has(code)) {
            usedCodes.add(code);
            extractedCodes.push(code);
          }
        }
      }
    });

    if (extractedCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم العثور على أكواد صحيحة في ملف Excel'
      });
    }

    // Determine content details based on code type
    let contentName = 'عام';
    let chapterName = '';

    if (!isGeneral || isGeneral === 'false') {
      if (chapterId) {
        const chapter = await Chapter.findById(chapterId);
        if (chapter) {
          chapterName = chapter.chapterName;
        }
      }

      if (contentId) {
        if (codeType === 'Video') {
          const video = await Video.findById(contentId);
          if (video) {
            contentName = video.videoTitle || video.lectureName;
          }
        } else if (codeType === 'Quiz') {
          const quiz = await Quiz.findById(contentId);
          if (quiz) {
            contentName = quiz.quizName;
          }
        } else if (codeType === 'PDF') {
          const pdf = await PDFs.findById(contentId);
          if (pdf) {
            contentName = pdf.pdfName;
          }
        }
      }
    }

    // Create code objects
    const codesToSave = extractedCodes.map(code => ({
      Code: code,
      codeType: codeType,
      codeGrade: grade,
      isGeneral: isGeneral === 'true',
      isAllGrades: grade === 'AllGrades',
      chapterId: chapterId || null,
      contentId: contentId || null,
      contentName: contentName,
      chapterName: chapterName,
      teacherId: teacherId, // Use selected teacher
      usedBy: null,
      createdAt: new Date()
    }));

    // Save codes to database
    const savedCodes = await Code.insertMany(codesToSave);

    return res.json({
      success: true,
      message: `تم رفع ${savedCodes.length} كود بنجاح`,
      codes: savedCodes
    });

  } catch (error) {
    console.error('Admin Excel upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع ملف Excel'
    });
  }
};

const codes_manage_get = async (req, res) => {
  try {
    const { type, status, grade, search, page = 1, teacherId } = req.query;
    const perPage = 50;
    
    let query = {};
    
    // Add teacher filtering if teacher ID exists
    if (teacherId) {
      query.teacherId = teacherId;
    }
    
    if (type) {
      query.codeType = type;
    }
    
    if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'unused') {
      query.isUsed = false;
    }
    
    if (grade) {
      query.codeGrade = grade;
    }
    
    if (search) {
      // Check if search is a number (for usedBy field)
      const searchNumber = parseInt(search);
      if (!isNaN(searchNumber)) {
        // If search is a number, search in usedBy field
        query.usedBy = searchNumber;
      } else {
        // If search is not a number, search in Code field only
        query.Code = { $regex: search, $options: 'i' };
      }
    }
    
    // Get all teachers for selection
    const teachers = await Teacher.find({ isActive: true }).select('name slug');
    
    const codes = await Code.find(query)
      .sort({ createdAt: -1 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .populate('teacherId', 'name slug');
    
    const totalCodes = await Code.countDocuments(query);
    
    res.render('admin/codes-manage', {
      title: 'إدارة الأكواد',
      path: req.path,
      adminData: req.userData,
      teachers,
      codes,
      totalCodes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCodes / perPage),
      filters: { type, status, grade, search, teacherId }
    });
  } catch (error) {
    console.error('Admin codes manage error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const code_delete = async (req, res) => {
  try {
    const codeId = req.params.codeId;
    
    await Code.findByIdAndDelete(codeId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Admin code delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const codes_delete_unused = async (req, res) => {
  try {
    const result = await Code.deleteMany({ isUsed: false });
    
    res.json({ 
      success: true, 
      message: `تم حذف ${result.deletedCount} كود غير مستخدم`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Admin delete unused codes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const codes_export = async (req, res) => {
  try {
    const { search, type, status, grade, teacherId } = req.query;
    
    let query = {};
    
    // Add teacher filtering if teacher ID exists
    if (teacherId) {
      query.teacherId = teacherId;
    }
    
    if (search) {
      // Check if search is a number (for usedBy field)
      const searchNumber = parseInt(search);
      if (!isNaN(searchNumber)) {
        // If search is a number, search in usedBy field
        query.usedBy = searchNumber;
      } else {
        // If search is not a number, search in Code field only
        query.Code = { $regex: search, $options: 'i' };
      }
    }
    
    if (type) {
      query.codeType = type;
    }
    
    if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'unused') {
      query.isUsed = false;
    }
    
    if (grade) {
      query.codeGrade = grade;
    }
    
    const codes = await Code.find(query)
      .sort({ createdAt: -1 })
      .populate('teacherId', 'name');
    
    // Create CSV content
    let csvContent = 'الكود,النوع,الصف,المحتوى المرتبط,المعلم,الحالة,مستخدم بواسطة,تاريخ الإنشاء,تاريخ الاستخدام\n';
    
    codes.forEach(code => {
      const codeType = code.codeType === 'Chapter' ? 'فصل' : 
                      code.codeType === 'Video' ? 'فيديو' : 
                      code.codeType === 'Quiz' ? 'اختبار' : 
                      code.codeType === 'PDF' ? 'PDF' : code.codeType;
      
      const status = code.isUsed ? 'مستخدم' : 'متاح';
      const usedBy = code.usedBy || 'غير مستخدم';
      const createdAt = new Date(code.createdAt).toLocaleString('ar-EG');
      const usageDate = code.usageDate ? new Date(code.usageDate).toLocaleString('ar-EG') : 'غير مستخدم';
      const content = code.contentName || code.chapterName || 'غير محدد';
      const teacherName = code.teacherId ? code.teacherId.name : 'غير محدد';
      
      csvContent += `"${code.Code}","${codeType}","${code.codeGrade || 'غير محدد'}","${content}","${teacherName}","${status}","${usedBy}","${createdAt}","${usageDate}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="codes-export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Admin codes export error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// ==================  API Routes for Admin ====================== //

const getVideosByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findById(chapterId);
    
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }
    
    // Extract videos from chapter
    const videos = [];
    
    if (chapter.chapterLectures) {
      chapter.chapterLectures.forEach(lecture => {
        videos.push({
          _id: lecture._id,
          title: lecture.lectureName || lecture.videoTitle,
          type: 'lecture'
        });
      });
    }
    
    if (chapter.chapterSummaries) {
      chapter.chapterSummaries.forEach(summary => {
        videos.push({
          _id: summary._id,
          title: summary.summaryName || summary.videoTitle,
          type: 'summary'
        });
      });
    }
    
    if (chapter.chapterSolvings) {
      chapter.chapterSolvings.forEach(solving => {
        videos.push({
          _id: solving._id,
          title: solving.solvingName || solving.videoTitle,
          type: 'solving'
        });
      });
    }
    
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Get videos by chapter error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getQuizzesByGradeAndTeacher = async (req, res) => {
  try {
    const { grade, teacherId } = req.params;
    
    const quizzes = await Quiz.find({ 
      Grade: grade,
      teacherId: teacherId,
      isQuizActive: true 
    }).select('quizName _id');
    
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Get quizzes by grade and teacher error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ==================  Authentication Middleware ====================== //

const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('authenticateAdmin middleware called');
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

    console.log('Admin authentication check:', {
      username: user.Username,
      isTeacher: Boolean(user.isTeacher),
      isAdmin: Boolean(user.isAdmin),
      path: req.path
    });

    // Explicitly check both isTeacher and isAdmin flags
    console.log('Detailed user data for admin check:', {
      id: user._id,
      username: user.Username,
      isTeacher: typeof user.isTeacher, 
      isTeacherValue: user.isTeacher,
      isAdmin: typeof user.isAdmin,
      isAdminValue: user.isAdmin
    });
    
    // Strict boolean comparison to ensure proper type checking
    if (user.isTeacher !== true || user.isAdmin !== true) {
      console.log('User is not an admin, redirecting to login');
      res.clearCookie('token');
      return res.redirect('/login');
    }

    // Get teacher profile if exists
    let teacherProfile = null;
    if (user.teacherId) {
      teacherProfile = await Teacher.findById(user.teacherId);
      console.log('Found admin teacher profile:', teacherProfile ? teacherProfile.name : 'No profile found');
    }

    console.log('Admin authentication successful');
    req.userData = user;
    req.teacherProfile = teacherProfile; // Add teacher profile for admin
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.redirect('/login');
  }
};

module.exports = {
  // Dashboard
  dash_get,
  
  // Teacher Management
  teachers_get,
  teacher_create_get,
  teacher_create_post,
  teacher_edit_get,
  teacher_edit_post,
  teacher_delete,
  teacher_students_get,
  
  // Code Management
  codes_get,
  codes_create_get,
  codes_create_post,
  codes_upload_excel,
  codes_manage_get,
  code_delete,
  codes_delete_unused,
  codes_export,
  
  // API Routes
  getVideosByChapter,
  getQuizzesByGradeAndTeacher,
  
  // Authentication
  authenticateAdmin,
  logout
};

// ================== Logout ====================== //

function logout(req, res) {
  res.clearCookie('token');
  res.redirect('/login');
}
