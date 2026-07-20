# Premium E-Commerce Store

A gorgeous, responsive, and responsive online shopping website built using **React (Vite)**, **Node.js (Express)**, and **SQLite**. The styling uses modern glassmorphic designs, typography powered by **Urbanist** Google Font, and interactive animations powered by **Tailwind CSS** and **daisyUI**.

---

## 🌟 Key Features

1. **User Authentication**:
   - Clean register/login forms with validation.
   - JWT-based protected sessions (stored in local storage).
   - Automated token validation on mount.
2. **Product Browsing & Discovery**:
   - Grid layout of premium products with hover states.
   - Sidebar filters for search query, product category, and price boundaries.
   - Dynamic sorting (Price: low to high, Price: high to low, Latest arrivals, Highest rated).
   - Dynamic stock status alerts.
3. **Interactive Shopping Cart**:
   - In-memory cart for guest users, auto-saved in local storage.
   - Real-time cart synchronization with the SQLite database for authenticated users.
   - Quantity adjustment widgets with upper-bound checks against actual inventory stock.
4. **Checkout & Order Flow**:
   - Secure shipping detail forms and mock credit card forms.
   - Inventory verification and stock deduction during order checkout.
   - Order history listing with status badges (Pending, Processing, Completed) and exact items detail cards.
5. **Interactive UI**:
   - Dual-theme control (Light and Dark) that toggles the `data-theme` attribute on the DOM.
   - Clean notifications, loading skeletons, and interactive button states.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, React Router Dom v6, Tailwind CSS v3, daisyUI v4, React Icons, Vite
* **Backend**: Node.js, Express.js, JWT, bcryptjs, CORS
* **Database**: SQLite3 (zero-configuration local file db)

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js installed on your machine.

### Installation & Initialization
To install dependencies for the root orchestrator, frontend, and backend all at once, run:
```bash
npm run install-all
```

### Running the Application in Development Mode
You can start both the backend server (on `http://localhost:5000`) and the frontend client (on `http://localhost:5173`) concurrently using a single command:
```bash
npm run dev
```

### Running the Production Build
To create a production build and preview the app, run:
```bash
npm start
```

---

## 🔐 Mock Credentials for Testing

During database initialization, the backend automatically seeds two accounts:
1. **Customer Account**:
   - **Email**: `user@example.com`
   - **Password**: `user123`
2. **Admin Account**:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
