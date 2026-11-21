import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters.');
}

await connectDB();
const email = ADMIN_EMAIL.trim().toLowerCase();
const existing = await User.findOne({ email });
if (existing) throw new Error('An account already exists for ADMIN_EMAIL.');

await User.create({ name: ADMIN_NAME.trim(), email, password: ADMIN_PASSWORD, role: 'admin' });
console.info(`Admin account created for ${email}`);
process.exit(0);
