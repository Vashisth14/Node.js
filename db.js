// db.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "cst3144";

if (!uri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

let client;
let db;

export async function getDb() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  // Helpful indexes
  await db.collection("lessons").createIndexes([
    { key: { subject: 1 } },
    { key: { location: 1 } },
    { key: { price: 1 } },
    { key: { spaces: 1 } }
  ]);
  await db.collection("orders").createIndex({ createdAt: -1 });
  return db;
}

// NEW: expose the MongoClient so routes can start sessions cleanly
export async function getClient() {
  if (!client) await getDb();
  return client;
}
