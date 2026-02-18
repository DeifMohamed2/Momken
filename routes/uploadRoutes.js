const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Upload directories
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
const IMAGES_DIR = path.join(UPLOAD_DIR, 'images');
const VIDEOS_DIR = path.join(UPLOAD_DIR, 'videos');
const PDFS_DIR = path.join(UPLOAD_DIR, 'pdfs');

// Ensure directories exist
[UPLOAD_DIR, IMAGES_DIR, VIDEOS_DIR, PDFS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Generate a unique filename
 */
function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}${ext}`;
}

/**
 * Get file type category
 */
function getFileType(mimetype) {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'video';
  if (ALLOWED_PDF_TYPES.includes(mimetype)) return 'pdf';
  return null;
}

/**
 * Upload Image
 * POST /upload/image
 */
router.post('/image', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'لا يوجد ملف للرفع' 
      });
    }

    const file = req.files.file;
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WEBP' 
      });
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({ 
        success: false, 
        error: 'حجم الملف كبير جدًا. الحد الأقصى: 10MB' 
      });
    }

    // Generate unique filename and save
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(IMAGES_DIR, filename);
    
    await file.mv(filepath);

    // Return the public URL
    const publicUrl = `/uploads/images/${filename}`;
    
    res.json({
      success: true,
      secure_url: publicUrl,
      url: publicUrl,
      filename: filename,
      original_filename: file.name,
      size: file.size,
      mimetype: file.mimetype
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ أثناء رفع الصورة' 
    });
  }
});

/**
 * Upload Video
 * POST /upload/video
 */
router.post('/video', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'لا يوجد ملف للرفع' 
      });
    }

    const file = req.files.file;
    
    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'نوع الملف غير مدعوم. الأنواع المدعومة: MP4, WEBM, OGG' 
      });
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return res.status(400).json({ 
        success: false, 
        error: 'حجم الملف كبير جدًا. الحد الأقصى: 500MB' 
      });
    }

    // Generate unique filename and save
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(VIDEOS_DIR, filename);
    
    await file.mv(filepath);

    // Return the public URL
    const publicUrl = `/uploads/videos/${filename}`;
    
    res.json({
      success: true,
      secure_url: publicUrl,
      url: publicUrl,
      filename: filename,
      original_filename: file.name,
      size: file.size,
      mimetype: file.mimetype
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ أثناء رفع الفيديو' 
    });
  }
});

/**
 * Upload PDF
 * POST /upload/pdf
 */
router.post('/pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'لا يوجد ملف للرفع' 
      });
    }

    const file = req.files.file;
    
    // Validate file type
    if (!ALLOWED_PDF_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'نوع الملف غير مدعوم. النوع المدعوم: PDF فقط' 
      });
    }

    // Validate file size
    if (file.size > MAX_PDF_SIZE) {
      return res.status(400).json({ 
        success: false, 
        error: 'حجم الملف كبير جدًا. الحد الأقصى: 50MB' 
      });
    }

    // Generate unique filename and save
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(PDFS_DIR, filename);
    
    await file.mv(filepath);

    // Return the public URL
    const publicUrl = `/uploads/pdfs/${filename}`;
    
    res.json({
      success: true,
      secure_url: publicUrl,
      url: publicUrl,
      filename: filename,
      original_filename: file.name,
      size: file.size,
      mimetype: file.mimetype
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ أثناء رفع الملف' 
    });
  }
});

/**
 * Generic Upload (auto-detect file type)
 * POST /upload
 */
router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'لا يوجد ملف للرفع' 
      });
    }

    const file = req.files.file;
    const fileType = getFileType(file.mimetype);
    
    if (!fileType) {
      return res.status(400).json({ 
        success: false, 
        error: 'نوع الملف غير مدعوم' 
      });
    }

    // Determine directory and max size based on file type
    let uploadDir, maxSize;
    switch (fileType) {
      case 'image':
        uploadDir = IMAGES_DIR;
        maxSize = MAX_IMAGE_SIZE;
        break;
      case 'video':
        uploadDir = VIDEOS_DIR;
        maxSize = MAX_VIDEO_SIZE;
        break;
      case 'pdf':
        uploadDir = PDFS_DIR;
        maxSize = MAX_PDF_SIZE;
        break;
    }

    // Validate file size
    if (file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        error: 'حجم الملف كبير جدًا' 
      });
    }

    // Generate unique filename and save
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(uploadDir, filename);
    
    await file.mv(filepath);

    // Return the public URL
    const publicUrl = `/uploads/${fileType}s/${filename}`;
    
    res.json({
      success: true,
      secure_url: publicUrl,
      url: publicUrl,
      filename: filename,
      original_filename: file.name,
      size: file.size,
      mimetype: file.mimetype,
      type: fileType
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ أثناء رفع الملف' 
    });
  }
});

/**
 * Delete uploaded file
 * DELETE /upload/:type/:filename
 */
router.delete('/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate type
    if (!['images', 'videos', 'pdfs'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'نوع غير صالح' 
      });
    }

    // Sanitize filename (prevent directory traversal)
    const sanitizedFilename = path.basename(filename);
    const filepath = path.join(UPLOAD_DIR, type, sanitizedFilename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'الملف غير موجود' 
      });
    }

    // Delete the file
    fs.unlinkSync(filepath);

    res.json({
      success: true,
      message: 'تم حذف الملف بنجاح'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ أثناء حذف الملف' 
    });
  }
});

module.exports = router;
