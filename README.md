# 🛒 E-Commerce Store (Full-Stack MERN + Firebase)

A modern, responsive, full-stack E-Commerce web application built with **React, Node.js, Express, MongoDB Atlas**, and **Firebase Authentication**. This application provides a premium shopping experience, complete with secure authentication, real-time product filtering, a functional shopping cart, simulated checkout, and order history tracking.

---

## 🚀 Key Features

*   **🔒 Secure Authentication:** Implemented via Firebase Authentication (Email/Password registration and login) synced with a custom MongoDB backend user profile.
*   **📦 Product Discovery:** Dynamic product searching, filtering by categories, sorting by prices/ratings, and interactive detailed product views.
*   **🛒 Shopping Cart:** Fully persistent cart items per user, allowing real-time quantity updates and stock validation.
*   **💳 Checkout & Orders:** Simulated checkout with shipping address entry, inventory deduction, and automated order generation.
*   **👤 User Profile:** Secure dashboard showing user details and interactive past order history.
*   **🎨 Premium UI/UX:** Styled using Tailwind CSS and DaisyUI, featuring modern glassmorphic designs, clean transitions, and fully responsive layouts.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 19 (Vite)
*   **Routing:** React Router v7
*   **Styling:** Tailwind CSS, DaisyUI
*   **State Management:** React Context API (`AuthContext`, `CartContext`)
*   **Services:** Firebase Client SDK

### Backend
*   **Runtime:** Node.js (ES Modules)
*   **Framework:** Express.js
*   **Database:** MongoDB Atlas (via Mongoose)
*   **Security:** Firebase Admin SDK (Token verification middleware)

---

## 📂 Project Structure

```text
simple-ecommerce/
├── backend/                   # Node/Express Backend
│   ├── vercel.json            # Vercel Serverless Config
│   ├── server.js              # Server entry point & API routes
│   ├── db.js                  # Database connection, schemas & seeding
│   ├── auth.js                # Firebase token verification middleware
│   └── package.json           
├── frontend/                  # React/Vite Frontend
│   ├── src/
│   │   ├── components/        # Shared components (Navbar, Footer, ProductCard)
│   │   ├── context/           # Auth and Cart React contexts
│   │   ├── pages/             # Pages (Home, ProductDetails, Cart, Checkout, etc.)
│   │   ├── firebase.js        # Firebase configuration initialized
│   │   ├── main.jsx           
│   │   └── App.jsx            
│   ├── vercel.json            # Frontend routing config for Vercel
│   └── package.json
└── README.md                  # Project Documentation (This file)
```

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or above recommended)
*   [Git](https://git-scm.com/)

---

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/mdmonirhossion/-E-Commerce.git
cd simple-ecommerce
```

#### 2. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env` file in the `backend/` directory or make sure to provide the required environment variables:
    *   `PORT` (Default: `5000`)
    *   `MONGODB_URI` (Already configured in [db.js]() but can be overridden)
4.  Start the development server:
    ```bash
    npm run dev
    ```

#### 3. Frontend Setup
1.  Open a new terminal and navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend application:
    ```bash
    npm run dev
    ```
    The application will run on [http://localhost:5173](http://localhost:5173) (or the next available port, e.g., `5174`).

---

## 🔌 API Endpoints Reference

All backend API routes are prefixed with `/api`. Authenticated routes require an `Authorization: Bearer <Firebase_ID_Token>` header.

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/me` | `GET` | Required | Retrieve / sync current user profile details |
| `/api/products` | `GET` | None | Fetch all products (supports search, category filter, sort) |
| `/api/products/:id` | `GET` | None | Get detailed information for a single product |
| `/api/products` | `POST` | Required (Admin) | Create a new product |
| `/api/cart` | `GET` | Required | Retrieve current user's shopping cart |
| `/api/cart` | `POST` | Required | Add or update a product's quantity in cart |
| `/api/cart/:product_id` | `DELETE` | Required | Remove an item from the cart |
| `/api/orders` | `GET` | Required | Retrieve order history for the logged-in user |
| `/api/orders` | `POST` | Required | Place a new order (checkout) |

---

## 🚀 Deployment

The project is fully pre-configured for one-click/command deployment to Vercel:

### Deploying Frontend to Vercel
```bash
cd frontend
vercel --prod
```

### Deploying Backend to Vercel
```bash
cd backend
vercel --prod
```

---

## 📄 License
This project is open-source and available under the MIT License.
