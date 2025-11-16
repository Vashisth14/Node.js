// server.js
import express from "express";
import morgan from "morgan";    // logger middleware
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import { getDb, getClient } from "./db.js";  // database + transaction client

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8080;
const ORIGIN =  "https://node-js-d2bi.onrender.com";

// MIDDLEWARE
// Logger middleware – logs every request (method, URL, status, response time)
app.use(morgan("dev"));

// JSON body parser + CORS
app.use(express.json());

// CORS – allows the frontend (index.html) to talk to the backend
app.use(cors({ origin: ORIGIN, methods: ["GET","POST","PUT","OPTIONS"] }));

// root + health
app.get("/", (_req, res) => 
  res.type("text").send("CST3144 API ✓  Try: GET /health, GET /lessons")
);

app.get("/health", (_req, res) => 
  res.json({ ok: true })
);

// GET /lessons
app.get("/lessons", async (req, res) => {
  const db = await getDb();
  const { search = "", sort = "subject", dir = "asc" } = req.query;

  const q = String(search || "").trim().toLowerCase();

  // Build MongoDB query filter
  const filter = q
    ? {
        $or: [
          { subject:  { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } }
        ]
      }
    : {};

  // if numeric-like, also match price/spaces numerically
  if (q && !isNaN(Number(q))) {
    const num = Number(q);
    (filter.$or || (filter.$or = [])).push({ price: num }, { spaces: num });
  }

   // Sorting key + direction
  const sortKey = ["subject","location","price","spaces"].includes(sort) 
  ? sort
  : "subject";
  const sortDir = dir === "desc" ? -1 : 1;

  // Execute query
  const lessons = await db.collection("lessons")
    .find(filter)
    .sort({ [sortKey]: sortDir })
    .toArray();

  res.json(lessons);
});

// PUT /lessons/:id – Update ANY lesson field
app.put("/lessons/:id", async (req, res) => {
  const db = await getDb();
  const { id } = req.params;

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  // Only allow updating safe fields
  const allowed = ["subject", "location", "price", "spaces", "image"];
  const updates = {};
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  // Spaces must remain non-negative
  if ("spaces" in updates && (typeof updates.spaces !== "number" || updates.spaces < 0)) {
    return res.status(400).json({ error: "spaces must be a number >= 0" });
  }

  const result = await db.collection("lessons").updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );

  if (!result.matchedCount) return res.status(404).json({ error: "Lesson not found" });
  res.json({ ok: true });
});

// GET /search – Backend search-as-you-type
// Front-end sends GET /search?q=typing...
// Backend returns MongoDB-filtered results.
app.get("/search", async (req, res) => {
  const db = await getDb();
   

  const term = String(q || "").trim().toLowerCase();

  // Build query filter
  const filter = term
    ? {
        $or: [
          { subject:  { $regex: term, $options: "i" } },
          { location: { $regex: term, $options: "i" } },
        ]
      }
    : {};

  // if numeric-like, also match price/spaces
  if (term && !isNaN(Number(term))) {
    const num = Number(term);
    (filter.$or || (filter.$or = [])).push({ price: num }, { spaces: num });
  }

  // Sorting
  const sortKey = ["subject","location","price","spaces"].includes(sort) 
    ? sort 
    : "subject";
  const sortDir = dir === "desc" ? -1 : 1;

  const results = await db.collection("lessons")
    .find(filter)
    .sort({ [sortKey]: sortDir })
    .toArray();

  res.json(results);
});

// STATIC IMAGE MIDDLEWARE 
// GET /images/:name
// If an image exists → return file
// If NOT → return JSON 404 error
app.get('/images/:name', (req,res)=>{
  const p = path.join(process.cwd(),'public','images', req.params.name);
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(404).json({ error: 'Image not found' });
});

// POST /orders – Create an order
app.post("/orders", async (req, res) => {
  const db = await getDb();
  const client = await getClient();                 // <-- get client here

  const { name, phone, items } = req.body || {};

  // Validate request body
  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  for (const it of items) {
    if (!ObjectId.isValid(it.lessonId) || typeof it.qty !== "number" || it.qty <= 0) {
      return res.status(400).json({ error: "Invalid line item" });
    }
  }

  // Start transaction
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      // For each lesson, ensure enough spaces exist, then deduct
      for (const it of items) {
        const filter = { _id: new ObjectId(it.lessonId), spaces: { $gte: it.qty } };
        const update = { $inc: { spaces: -it.qty } };
        const updRes = await db.collection("lessons").updateOne(filter, update, { session });

        if (!updRes.matchedCount) {
          throw new Error("NOT_ENOUGH_SPACES");
        }
      }

       // Save order record
      await db.collection("orders").insertOne(
        {
          name,
          phone,
          items: items.map(i => ({ 
            lessonId: new ObjectId(i.lessonId), 
            qty: i.qty 
          })),
          createdAt: new Date()
        }, 
        { session }
      );
    });

    res.status(201).json({ ok: true });

  } catch (err) {
    if (err.message === "NOT_ENOUGH_SPACES") {
      return res.status(409).json({ error: "Not enough spaces for one or more lessons" });
    }

    console.error(err);
    res.status(500).json({ error: "Order failed" });

  } finally {
    await session.endSession();
  }
});

// Debug route – view most recent 5 orders
app.get("/orders/debug", async (_req, res) => {
  const db = await getDb();
  const orders = await db.collection("orders")
  .find()
  .sort({ createdAt: -1 })
  .limit(5)
  .toArray();

  res.json(orders);
});

// Also serve /public as /static (not required by rubric, but useful)
app.use("/static", express.static("public"));

// START SERVER
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
