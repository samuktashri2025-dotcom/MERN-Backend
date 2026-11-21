import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import seedPublicContent from './config/seed.js';

const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || '';

if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}

await connectDB();
await seedPublicContent();
app.listen(port, () => {
  console.info(`Samchu Dance Studio API listening on port ${port}`);
});
