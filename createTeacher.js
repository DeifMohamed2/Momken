require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');

// Connect to MongoDB
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create the teacher
    const teacherData = {
      _id: new mongoose.Types.ObjectId('68e8f639d6630e36e8f60224'),
      userId: new mongoose.Types.ObjectId('68e8f639d6630e36e8f60222'),
      name: "Deif mohamed",
      slug: "deif-mohamed",
      email: "deifmo123@gmail.com",
      phone: "01156012078",
      brandName: "sdagsdag",
      description: "cadasd",
      logoImage: "https://res.cloudinary.com/dusod9wxt/image/upload/v1760097839/aqvazzza",
      coverImage: "https://res.cloudinary.com/dusod9wxt/image/upload/v1760097847/u0pr7cvb",
      primaryColor: "#007bff",
      secondaryColor: "#6c757d",
      facebook: "http://localhost:9520/admin/teachers/create",
      twitter: "http://localhost:9520/admin/teachers/create",
      instagram: "http://localhost:9520/admin/teachers/create",
      youtube: "http://localhost:9520/admin/teachers/create",
      isActive: true,
      isDefault: false,
      studentCount: 0,
      courseCount: 0
    };

    try {
      // Check if teacher already exists
      const existingTeacher = await Teacher.findOne({ slug: teacherData.slug });
      
      if (existingTeacher) {
        console.log('Teacher already exists:', existingTeacher);
      } else {
        // Create new teacher
        const newTeacher = new Teacher(teacherData);
        const savedTeacher = await newTeacher.save();
        console.log('Teacher created successfully:', savedTeacher);
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
