import DanceStyle from '../models/DanceStyle.js';
import FAQ from '../models/FAQ.js';

const danceStyles = [
  ['Ballet', 'ballet', 'Posture, strength and grace. Beginner to advanced.'],
  ['Hip hop', 'hip-hop', 'Grooves, freestyle and choreography to current tracks.'],
  ['Salsa & bachata', 'salsa-bachata', 'Partner dancing with a social night every month.'],
  ['Contemporary', 'contemporary', 'Floor work, release and expressive movement.'],
  ['Little movers', 'little-movers', 'Playful classes for ages 4 to 7.'],
];

const faqs = [
  ['Do I need experience to join?', 'No. Most classes have a beginner level, and teachers adapt moves to suit you.'],
  ['What should I wear to my first class?', 'Comfortable clothes you can move in. Ballet needs soft shoes or bare feet; hip hop needs clean trainers; salsa works with smooth-soled shoes.'],
  ['Is the first class really free?', 'Yes. Sign up, choose a class from the timetable, and turn up 10 minutes early.'],
  ['How much do classes cost?', 'Single classes are $18. Packs of 10 are $150, and unlimited monthly membership is $95.'],
  ['What if I miss a class?', 'Cancel at least 12 hours ahead and your credit stays on your account for 90 days.'],
  ['Do you teach children and teenagers?', 'Yes. Little movers is for ages 4 to 7, and ballet, hip hop and contemporary have youth groups.'],
  ['Can I book private lessons or a wedding dance?', 'Yes. Use the contact form and tell us your date and the style you want.'],
];

export default async function seedPublicContent() {
  await Promise.all([
    ...danceStyles.map(([name, slug, description]) => DanceStyle.updateOne(
      { slug },
      { $setOnInsert: { name, slug, description } },
      { upsert: true },
    )),
    ...faqs.map(([question, answer], order) => FAQ.updateOne(
      { question },
      { $setOnInsert: { question, answer, order } },
      { upsert: true },
    )),
  ]);
}
