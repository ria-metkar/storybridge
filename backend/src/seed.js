/* eslint-disable no-console */
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { Book } from './models/Book.js';
import { Plan } from './models/Plan.js';
import { Shipment } from './models/Shipment.js';
import { Subscription } from './models/Subscription.js';
import { User } from './models/User.js';
import { addOneMonth } from './utils/helpers.js';

/**
 * Builds pages from [illustration, primaryText, secondaryText] tuples.
 * No audioUrl/timestamps here, so the player narrates with on-device speech.
 * For recorded audio, set page.audioUrl and give each line start/end seconds.
 */
const pagesFrom = ([primary, secondary], spreads) =>
  spreads.map(([illustration, a, b], i) => ({
    number: i + 1,
    illustration,
    lines: [
      { lang: primary, text: a },
      { lang: secondary, text: b },
    ],
  }));

const plans = [
  {
    slug: 'little-reader',
    name: 'Little Reader',
    description: 'One bilingual picture book every month.',
    priceCents: 1499,
    booksPerMonth: 1,
    features: ['1 hardcover book / month', 'Native-speaker read-along audio', 'Free shipping'],
    sortOrder: 1,
  },
  {
    slug: 'family-shelf',
    name: 'Family Shelf',
    description: 'Two books a month for growing bookworms.',
    priceCents: 2499,
    booksPerMonth: 2,
    features: ['2 hardcover books / month', 'Native-speaker read-along audio', 'Free shipping', 'Pause anytime'],
    sortOrder: 2,
  },
  {
    slug: 'story-explorer',
    name: 'Story Explorer',
    description: 'Four books a month for multilingual households.',
    priceCents: 4499,
    booksPerMonth: 4,
    features: ['4 hardcover books / month', 'Native-speaker read-along audio', 'Free express shipping', 'Pause anytime'],
    sortOrder: 3,
  },
];

const books = [
  {
    slug: 'the-moon-and-the-mango-tree',
    title: { primary: 'The Moon and the Mango Tree', secondary: 'La Luna y el Árbol de Mango' },
    languages: { primary: 'en', secondary: 'es' },
    author: 'Lucía Ramos',
    illustrator: 'Tomás Vega',
    narrator: 'Lucía Ramos & Daniel Price',
    summary: 'A gentle bedtime story about a curious mango tree and the moon that lights every child’s way home.',
    ageMin: 2,
    ageMax: 6,
    coverColor: '#3d5a80',
    coverEmoji: '🌙',
    audioCode: 'MOON-ES',
    isSample: true,
    pages: pagesFrom(['en', 'es'], [
      ['🌙', 'Every night, the moon visits the old mango tree.', 'Cada noche, la luna visita el viejo árbol de mango.'],
      ['🥭', '“Why do you shine so bright?” asks the tree.', '«¿Por qué brillas tanto?», pregunta el árbol.'],
      ['✨', '“So little ones can find their way home,” says the moon.', '«Para que los pequeños encuentren el camino a casa», dice la luna.'],
      ['🏡', 'And every child sleeps safe and sound.', 'Y cada niño duerme sano y salvo.'],
    ]),
  },
  {
    slug: 'grandmas-kite',
    title: { primary: "Grandma's Kite", secondary: 'दादी की पतंग' },
    languages: { primary: 'en', secondary: 'hi' },
    author: 'Priya Natarajan',
    illustrator: 'Arjun Mehta',
    narrator: 'Priya Natarajan',
    summary: 'Grandma builds a red-and-gold kite, and the whole neighbourhood looks up.',
    ageMin: 3,
    ageMax: 7,
    coverColor: '#c8553d',
    coverEmoji: '🪁',
    audioCode: 'KITE-HI',
    pages: pagesFrom(['en', 'hi'], [
      ['🪁', 'Grandma made a kite of red and gold.', 'दादी ने लाल और सुनहरी पतंग बनाई।'],
      ['🌬️', 'The wind lifted it high above the rooftops.', 'हवा ने उसे छतों के ऊपर ऊँचा उठा दिया।'],
      ['🐦', 'The birds said hello to the kite.', 'चिड़ियों ने पतंग को नमस्ते कहा।'],
      ['❤️', 'Grandma smiled. “Some things fly because we love them.”', 'दादी मुस्कुराईं। “कुछ चीज़ें इसलिए उड़ती हैं क्योंकि हम उनसे प्यार करते हैं।”'],
    ]),
  },
  {
    slug: 'little-fox-counts',
    title: { primary: 'Little Fox Counts', secondary: 'Petit Renard Compte' },
    languages: { primary: 'en', secondary: 'fr' },
    author: 'Camille Laurent',
    illustrator: 'Hugo Bernard',
    narrator: 'Camille Laurent',
    summary: 'A first counting book about apples, friendship and sharing.',
    ageMin: 1,
    ageMax: 4,
    coverColor: '#e07a1f',
    coverEmoji: '🦊',
    audioCode: 'FOX-FR',
    pages: pagesFrom(['en', 'fr'], [
      ['🦊', 'Little Fox finds one red apple.', 'Petit Renard trouve une pomme rouge.'],
      ['🍎🍎', 'Two apples for his sister.', 'Deux pommes pour sa sœur.'],
      ['🍎🍎🍎', 'Three apples for his friends.', 'Trois pommes pour ses amis.'],
      ['🧺', 'Sharing makes the basket feel full.', 'Partager remplit le panier.'],
    ]),
  },
  {
    slug: 'the-dragon-who-loved-dumplings',
    title: { primary: 'The Dragon Who Loved Dumplings', secondary: '爱吃饺子的小龙' },
    languages: { primary: 'en', secondary: 'zh' },
    author: 'Mei Lin',
    illustrator: 'Chen Hao',
    narrator: 'Mei Lin',
    summary: 'A small cloud-dragon learns to fold dumplings with Grandma — and brings a whole village together.',
    ageMin: 3,
    ageMax: 8,
    coverColor: '#2a9d8f',
    coverEmoji: '🐉',
    audioCode: 'DRAGON-ZH',
    pages: pagesFrom(['en', 'zh'], [
      ['🐉', 'A small dragon lived on a cloud.', '一条小龙住在云朵上。'],
      ['🥟', 'He loved dumplings more than anything.', '他最爱吃饺子。'],
      ['👵', 'One day, he learned to make them with Grandma.', '有一天，他和奶奶一起学包饺子。'],
      ['🎉', 'Now everyone in the village eats together.', '现在，村里的每个人都一起吃饭。'],
    ]),
  },
  {
    slug: 'rain-on-the-roof',
    title: { primary: 'Rain on the Roof', secondary: 'Lluvia en el Tejado' },
    languages: { primary: 'es', secondary: 'en' },
    author: 'Andrés Molina',
    illustrator: 'Sofía Duarte',
    narrator: 'Andrés Molina',
    summary: 'Plip, plop, splash! A sound-filled story for rainy afternoons.',
    ageMin: 1,
    ageMax: 5,
    coverColor: '#6a4c93',
    coverEmoji: '🌧️',
    audioCode: 'RAIN-ES',
    pages: pagesFrom(['es', 'en'], [
      ['🌧️', 'La lluvia canta en el tejado: plip, plop.', 'The rain sings on the roof: plip, plop.'],
      ['🐸', 'La rana baila en el charco.', 'The frog dances in the puddle.'],
      ['🌈', 'Sale el sol y aparece un arcoíris.', 'The sun comes out and a rainbow appears.'],
    ]),
  },
];

async function seed() {
  await connectDB(env.mongoUri);

  await Promise.all([Plan.deleteMany({}), Book.deleteMany({})]);
  const [littleReader] = await Plan.insertMany(plans);
  // Insert one at a time so createdAt order (used for monthly picks) follows the array.
  for (const book of books) await Book.create(book);
  console.log(`Seeded ${plans.length} plans and ${books.length} books`);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@storybridge.test').toLowerCase();
  if (!(await User.exists({ email: adminEmail }))) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin12345',
      role: 'admin',
    });
    console.log(`Created admin: ${adminEmail}`);
  }

  const demoEmail = 'parent@storybridge.test';
  let demo = await User.findOne({ email: demoEmail });
  if (!demo) {
    demo = await User.create({
      name: 'Demo Parent',
      email: demoEmail,
      password: 'Parent12345',
      children: [{ name: 'Mateo', birthYear: new Date().getFullYear() - 4, primaryLanguage: 'en', secondaryLanguage: 'es' }],
    });
    console.log(`Created demo customer: ${demoEmail} / Parent12345`);
  }

  await Shipment.deleteMany({ user: demo._id });
  await Subscription.deleteMany({ user: demo._id });
  const now = new Date();
  await Subscription.create({
    user: demo._id,
    plan: littleReader._id,
    languages: { primary: 'en', secondary: 'es' },
    childId: demo.children[0]?._id,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: addOneMonth(now),
    lastPaymentRef: 'seed',
    shippingAddress: {
      fullName: 'Demo Parent',
      line1: '12 Story Lane',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States',
    },
  });
  console.log('Gave demo customer an active Little Reader subscription (English ⇄ Spanish)');

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error(err);
  await disconnectDB();
  process.exit(1);
});
