// db.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();  // Load .env variables (MONGODB_URI, MONGODB_DB, etc.)

// Load environment variables
const uri = process.env.MONGODB_URI;              // Full MongoDB connection string
const dbName = process.env.MONGODB_DB || "cst3144";  // Default database name

// If URI is missing → backend cannot run
if (!uri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

let client; // MongoClient instance
let db; // Database instance

// Connect to MongoDB and return the database instance

export async function getDb() {
  // Reuse existing database connection if already created
  if (db) return db;

  // Create new MongoDB client
  client = new MongoClient(uri);

  // Open connection to database server
  await client.connect();

  // Get database by name
  db = client.db(dbName);

  // Create helpful indexes on "lessons" collection
  // These improve search & sorting performance for:
  //   • backend search (subject/location)
  //   • numeric search (price/spaces)
  //   • sorting in GET /lessons and GET /search
  await db.collection("lessons").createIndexes([
    { key: { subject: 1 } },
    { key: { location: 1 } },
    { key: { price: 1 } },
    { key: { spaces: 1 } }
  ]);

  // Index for order listing by date (debug route)
  await db.collection("orders").createIndex({ createdAt: -1 });
  return db;
}

// NEW: expose the MongoClient so routes can start sessions cleanly
export async function getClient() {
   // If client not initialized → call getDb() first to initialize everything
  if (!client) await getDb();
  return client;
}
