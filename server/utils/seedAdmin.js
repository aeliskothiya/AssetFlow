require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'System Admin';

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    console.log('Seed admin already exists');
    process.exit(0);
  }

  await User.create({
    name,
    email,
    password,
    role: 'Admin',
  });

  console.log('Seed admin created successfully');
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error('Seed admin failed:', error.message);
  process.exit(1);
});
