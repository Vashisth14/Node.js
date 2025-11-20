# After-School Lessons – Backend API (CST3144)

This repository (`Node.js`) contains the **Node.js + Express + MongoDB backend** for the **After-School Lessons** full-stack coursework project for **CST3144 – Full Stack Development**.

The backend exposes a REST API to:

- List lessons
- Search lessons (for search-as-you-type)
- Create orders
- Update lesson spaces
- View / delete orders (for testing)
- Serve lesson images
- Log all incoming requests

The **frontend (Vue.js)** is in a separate repo and is hosted on GitHub Pages:
- Frontend: [`vue.js` repo, GitHub Pages](https://vashisth14.github.io/vue.js/)

The backend is hosted on **Render**:
- Backend: [`node-js-d2bi` on Render](https://node-js-d2bi.onrender.com)

## 1. Project Overview

### 1.1 Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (cloud)
- **ORM/Driver**: Official MongoDB Node.js Driver
- **Hosting**: Render (Web Service)
- **Logging**: Morgan
- **CORS**: `cors` package
- **Env Management**: dotenv

### 1.2 Key Files

- `server.js` – Main Express server, routes, middleware, and REST API.
- `db.js` – MongoDB connection helper (getDb / getClient, indexes).
- `seed.js` – Database seeding script (inserts 10 lessons, clears orders).
- `package.json` – Dependencies and scripts.

## API Reference

| Method | Route | Description |
|--------|--------|-------------|
| GET | / | API root welcome message |
| GET | /health | Health check |
| GET | /lessons | Get all lessons (with search & sort) |
| GET | /search | Shortcut alias for /lessons?q= |
| PUT | /lessons/:id | Update lesson (any field) |
| GET | /images/:name | Serve static image |
| POST | /orders | Create new order (transactional) |
| GET | /orders/debug | List latest 5 orders |

## Features
- `GET /lessons` – fetch all lessons with search, sort, and filter
- `POST /orders` – create new order, transactional update of lesson spaces
- `PUT /lessons/:id` – generic lesson update (any field: subject, location, price, spaces)
- `GET /orders/debug` – view recent orders (for demo)
- `GET /health` – simple status check
- `GET /images/:name` – serve static images (for demonstration of static middleware)
- Uses middleware:
  - **morgan** (request logging)
  - **cors** (frontend access)
  - **express.json()** (body parser)
  - **express.static()** (static content)
- Includes MongoDB indexes and connection pooling.

## Database Collections

### lessons
```json
{
  "_id": ObjectId(),
  "subject": "Mathematics",
  "location": "Port Louis",
  "price": 1000,
  "spaces": 5
}

orders
{
  "_id": ObjectId(),
  "name": "John Doe",
  "phone": "58123456",
  "items": [
    { "lessonId": ObjectId(), "qty": 2 }
  ],
  "createdAt": ISODate()
}

How to Run Locally

Install dependencies

npm install

Seed sample lessons

npm run seed

Start the server

npm run dev