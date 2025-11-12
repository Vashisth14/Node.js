
---

## 🟣 BACKEND – `README.md`

```markdown
# Lesson Booking – Backend (Node.js / Express / MongoDB)

This is the **Express API** for the CST3144 coursework.  
It provides all backend functionality for lesson management and orders.

---

## 🌐 Live API
https://<your-render-app>.onrender.com

## 📘 API Reference

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
| DELETE | /orders/debug *(optional)* | Delete all orders (admin only) |

---

## 🧩 Features
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

---

## 🛠️ Technologies
- Node.js 20+
- Express 5.x
- MongoDB 6.x (native driver)
- dotenv, morgan, cors
- Atlas Database (`cst3144`)

---

## 🧱 Database Collections

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

Create .env

PORT=8080
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
MONGODB_DB=cst3144
ALLOW_ORIGIN=http://127.0.0.1:5500


Seed sample lessons

npm run seed


Start the server

npm run dev