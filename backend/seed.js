import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@servicehub.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Email: admin@servicehub.com`);
      console.log(`  Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@servicehub.com',
      password: 'admin123',
      role: 'admin',
      phone: '0000000000',
      address: 'ServiceHub HQ',
    });

    console.log('✅ Admin user created successfully!');
    console.log(`  Email: admin@servicehub.com`);
    console.log(`  Password: admin123`);
    console.log(`  Role: admin`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
