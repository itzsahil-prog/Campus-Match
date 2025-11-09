const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'itzsahil@admin.campusmatch.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: 'itzsahil@admin.campusmatch.com',
      password: 'radhekrishna',
      emailVerified: true,
      role: 'admin',
      profile: {
        name: 'Admin Sahil',
        age: 25,
        gender: 'male',
        college: 'CampusMatch Admin',
        bio: 'Platform Administrator'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email: itzsahil@admin.campusmatch.com');
    console.log('Password: radhekrishna');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
