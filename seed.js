// seed.js
import { getDb } from "./db.js";

const LESSONS = [
  { subject: "Mathematics",          location: "Port Louis",     price: 1000, spaces: 5 },
  { subject: "English Skills",       location: "Rose-Hill",      price: 900,  spaces: 5 },
  { subject: "Science Lab",          location: "Curepipe",       price: 950,  spaces: 5 },
  { subject: "History of Mauritius", location: "Moka",           price: 800,  spaces: 5 },
  { subject: "Coding (Beginner)",    location: "Ebène (Online)", price: 1200, spaces: 5 },
  { subject: "Art & Craft",          location: "Quatre Bornes",  price: 700,  spaces: 5 },
  { subject: "Music – Ravanne",      location: "Vacoas",         price: 850,  spaces: 5 },
  { subject: "Sega Dance Basics",    location: "Flic-en-Flac",   price: 900,  spaces: 5 },
  { subject: "Robotics Club",        location: "Grand Baie",     price: 1500, spaces: 5 },
  { subject: "PE & Fitness",         location: "Beau-Bassin",    price: 600,  spaces: 5 }
];

(async () => {
  const db = await getDb();
  await db.collection("orders").deleteMany({});
  await db.collection("lessons").deleteMany({});
  const { insertedIds } = await db.collection("lessons").insertMany(LESSONS);
  console.log("Seeded lessons:", insertedIds);
  process.exit(0);
})();
