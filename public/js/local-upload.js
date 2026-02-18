/**
 * Local File Upload Utility
 * Replaces Cloudinary uploads with local server uploads
 */

const LocalUploader = {
  // Upload endpoints
  endpoints: {
    image: '/upload/image',
    video: '/upload/video',
    pdf: '/upload/pdf',
    auto: '/upload'
  },

  /**
   * Upload a file to the local server
   * @param {File} file - The file to upload
   * @param {Object} options - Upload options
   * @param {string} options.type - File type: 'image', 'video', 'pdf', or 'auto'
   * @param {Function} options.onProgress - Progress callback (percent)
   * @param {Function} options.onSuccess - Success callback (response)
   * @param {Function} options.onError - Error callback (error)
   * @returns {XMLHttpRequest} - The XHR object for potential cancellation
   */
  upload: function(file, options = {}) {
    const type = options.type || 'auto';
    const endpoint = this.endpoints[type] || this.endpoints.auto;
    
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);

    // Track upload progress
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable && options.onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        options.onProgress(percentComplete, e.loaded, e.total);
      }
    };

    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && options.onSuccess) {
            options.onSuccess(response);
          } else if (!response.success && options.onError) {
            options.onError(response.error || 'Upload failed');
          }
        } catch (e) {
          if (options.onError) {
            options.onError('Invalid server response');
          }
        }
      } else {
        if (options.onError) {
          try {
            const response = JSON.parse(xhr.responseText);
            options.onError(response.error || 'Upload failed');
          } catch (e) {
            options.onError('Upload failed with status: ' + xhr.status);
          }
        }
      }
    };

    xhr.onerror = function() {
      if (options.onError) {
        options.onError('Network error occurred');
      }
    };

    xhr.send(formData);
    return xhr;
  },

  /**
   * Upload an image file
   * @param {File} file - The image file
   * @param {Object} options - Upload options (onProgress, onSuccess, onError)
   */
  uploadImage: function(file, options = {}) {
    return this.upload(file, { ...options, type: 'image' });
  },

  /**
   * Upload a video file
   * @param {File} file - The video file
   * @param {Object} options - Upload options (onProgress, onSuccess, onError)
   */
  uploadVideo: function(file, options = {}) {
    return this.upload(file, { ...options, type: 'video' });
  },

  /**
   * Upload a PDF file
   * @param {File} file - The PDF file
   * @param {Object} options - Upload options (onProgress, onSuccess, onError)
   */
  uploadPDF: function(file, options = {}) {
    return this.upload(file, { ...options, type: 'pdf' });
  },

  /**
   * Create file input and trigger file selection
   * @param {Object} options - Options for file selection and upload
   * @param {string[]} options.accept - Accepted file types (e.g., ['image/*', '.pdf'])
   * @param {boolean} options.multiple - Allow multiple files
   * @param {string} options.type - Upload type: 'image', 'video', 'pdf', 'auto'
   * @param {Function} options.onProgress - Progress callback
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   * @param {Function} options.onSelect - Called when files are selected (before upload)
   */
  openFilePicker: function(options = {}) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = options.accept ? options.accept.join(',') : '*/*';
    input.multiple = options.multiple || false;

    input.onchange = (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (options.onSelect) {
        options.onSelect(files);
      }

      // Upload each file
      Array.from(files).forEach(file => {
        this.upload(file, {
          type: options.type || 'auto',
          onProgress: options.onProgress,
          onSuccess: options.onSuccess,
          onError: options.onError
        });
      });
    };

    input.click();
  },

  /**
   * Open image picker with common image types
   */
  openImagePicker: function(options = {}) {
    this.openFilePicker({
      ...options,
      accept: options.accept || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      type: 'image'
    });
  },

  /**
   * Open video picker with common video types
   */
  openVideoPicker: function(options = {}) {
    this.openFilePicker({
      ...options,
      accept: options.accept || ['video/mp4', 'video/webm', 'video/ogg'],
      type: 'video'
    });
  },

  /**
   * Open PDF picker
   */
  openPDFPicker: function(options = {}) {
    this.openFilePicker({
      ...options,
      accept: options.accept || ['application/pdf'],
      type: 'pdf'
    });
  },

  /**
   * Validate file before upload
   * @param {File} file - The file to validate
   * @param {Object} options - Validation options
   * @param {number} options.maxSize - Maximum file size in bytes
   * @param {string[]} options.allowedTypes - Allowed MIME types
   * @returns {Object} - { valid: boolean, error: string }
   */
  validateFile: function(file, options = {}) {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options.allowedTypes || [];

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return { valid: false, error: `حجم الملف كبير جدًا. الحد الأقصى: ${sizeMB}MB` };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype || file.type)) {
      return { valid: false, error: 'نوع الملف غير مدعوم' };
    }

    return { valid: true, error: null };
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size string
   */
  formatFileSize: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalUploader;
}
