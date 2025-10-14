/**
 * Admin User Seed Script for Momken Academy
 * 
 * This script creates an admin user with teacher privileges in the database.
 * It also creates a corresponding teacher profile for the admin.
 * 
 * Usage:
 * node seedAdmin.js [options]
 * 
 * Options:
 * --force           Force create a new admin even if one already exists
 * --username=NAME   Set the admin username (default: Admin)
 * --password=PASS   Set the admin password (default: admin123456)
 * --phone=NUMBER    Set the admin phone number (default: 01000000000)
 * --code=NUMBER     Set the admin code (default: 999999)
 * 
 * Examples:
 * node seedAdmin.js
 * node seedAdmin.js --force --username=SuperAdmin --password=strongpass123 --phone=01234567890 --code=888888
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Teacher = require('./models/Teacher');

// MongoDB connection
const dbURI = 'mongodb+srv://deif:1qaz2wsx@3devway.aa4i6ga.mongodb.net/momkenAcademy?retryWrites=true&w=majority&appName=Cluster0';

// Get command line arguments
const args = process.argv.slice(2);
const force = args.includes('--force');
const username = args.find(arg => arg.startsWith('--username='))?.split('=')[1] || 'Admin';
const password = args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'admin123456';
const phone = args.find(arg => arg.startsWith('--phone='))?.split('=')[1] || '01000000000';
const code = parseInt(args.find(arg => arg.startsWith('--code='))?.split('=')[1] || '999999');

// Admin user data
const adminData = {
  Username: username,
  Password: password, // This will be hashed
  gov: 'Cairo',
  Markez: 'Admin',
  schoolName: 'Admin',
  Grade: 'Grade3', // Using a valid grade
  gender: 'male',
  phone: phone, // Unique admin phone
  parentPhone: phone, // Same as phone for admin
  place: 'online',
  Code: code, // Unique admin code
  ARorEN: 'AR',
  isTeacher: true,
  isAdmin: true,
  subscribe: true
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { phone: adminData.phone },
        { Code: adminData.Code },
        { Username: adminData.Username, isAdmin: true }
      ]
    });

    if (existingAdmin && !force) {
      console.log('Admin user already exists!');
      console.log(`Username: ${existingAdmin.Username}`);
      console.log(`Phone: ${existingAdmin.phone}`);
      console.log(`Code: ${existingAdmin.Code}`);
      console.log('\nTo override, use --force flag:');
      console.log('node seedAdmin.js --force --username=NewAdmin --password=newpassword --phone=01234567890 --code=888888');
      await mongoose.connection.close();
      return;
    }
    
    if (existingAdmin && force) {
      console.log(`Removing existing admin user: ${existingAdmin.Username}`);
      
      // Remove associated teacher profile if exists
      if (existingAdmin.teacherId) {
        await Teacher.findByIdAndDelete(existingAdmin.teacherId);
        console.log('Removed associated teacher profile');
      }
      
      // Remove existing admin user
      await User.findByIdAndDelete(existingAdmin._id);
      console.log('Existing admin user removed');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.Password, 10);

    // Create the admin user
    const adminUser = new User({
      ...adminData,
      Password: hashedPassword,
      PasswordWithOutHash: adminData.Password, // Store plain password for reference
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the admin user
    const savedAdmin = await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Username: ${savedAdmin.Username}`);
    console.log(`Phone: ${savedAdmin.phone}`);
    console.log(`Code: ${savedAdmin.Code}`);
    console.log(`Password (plain): ${adminData.Password}`);

    // Create a teacher profile for the admin
    const adminTeacher = new Teacher({
      name: 'Admin',
      email: 'admin@momkenacademy.com',
      phone: adminData.phone, // Add phone field
      slug: 'admin',
      brandName: 'Momken Academy Admin',
      description: 'منصة متكاملة بها كل ما يحتاجه الطالب ليتفوق',
      isActive: true,
      isDefault: true,
      userId: savedAdmin._id
    });

    const savedTeacher = await adminTeacher.save();
    
    // Update the admin user with the teacher reference
    await User.findByIdAndUpdate(savedAdmin._id, { teacherId: savedTeacher._id });
    
    console.log('Admin teacher profile created successfully!');
    console.log(`Teacher Name: ${savedTeacher.name}`);
    console.log(`Teacher Slug: ${savedTeacher.slug}`);

    console.log('\nAdmin creation completed successfully!');
    console.log('\nYou can now login with:');
    console.log(`Phone: ${adminData.phone}`);
    console.log(`Password: ${adminData.Password}`);

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedAdmin();
