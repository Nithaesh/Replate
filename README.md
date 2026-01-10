# 🍲 RePlate: Food Rescue & Donation Platform

> **Minimizing food waste, one meal at a time.** > RePlate connects restaurants, hotels, and individual donors with local NGOs and shelters to ensure surplus food reaches those in need instantly.

---

## 🚀 Overview

**RePlate** is a real-time, geolocation-based web platform designed to bridge the gap between food surplus and food scarcity. It features separate "Command Center" dashboards for Donors and NGOs, utilizing **Live Maps**, **Instant Chat**, and **Real-Time Status Tracking** to facilitate seamless food recovery operations.

## ✨ Key Features

### 🍎 For Donors (Individuals & Restaurants)
* **Dual Donation Modes:**
    * **Broadcast Donation:** Blast a request to all nearby NGOs on the map.
    * **Direct Donation:** Select a specific NGO from the map and offer food directly.
* **Live Impact Tracking:** Real-time "Meals Saved" counter and "Karma Points" gamification system.
* **Geolocation Map:** Automatically detects user location and shows verified NGOs within a 15km radius.
* **Secure Chat:** Instantly communicate with the NGO once a donation is accepted.
* **History & Analytics:** Track past donations and total impact over time.

### 🚛 For NGOs (Receivers)
* **Operations Command Center:** A split-screen dashboard designed for high-efficiency logistics.
    * **Left Panel:** Live Map of incoming donation requests & pending list.
    * **Right Panel:** Active task management & communication hub.
* **One-Click Acceptance:** Instantly claim food donations from the live feed.
* **Automated Workflow:**
    * Auto-activates chat upon acceptance.
    * System generates safety/verification prompts automatically.
* **Status Management:** Update statuses in real-time (Accepted → Pickup in Progress → Completed).

### 🛡️ For Admins
* **NGO Verification:** Review and approve/suspend NGO registrations.
* **Platform Oversight:** Monitor all platform activity and user statistics.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite)
* **Styling:** CSS3 (Custom Glassmorphism / Dark Theme Design System)
* **Database & Auth:** Firebase (Firestore, Authentication)
* **Mapping:** Leaflet.js / React-Leaflet
* **State Management:** React Context API

---

## 📸 Application Preview

### 1. Donor Dashboard
*Features a dark-themed glassmorphism UI with live map integration and impact stats.*

### 2. NGO Command Center
*A professional logistics interface allowing NGOs to visualize donor locations and manage pickups efficiently.*

### 3. Real-Time Chat
*Integrated messaging system that unlocks only when a donation is accepted to coordinate pickups securely.*

---

## ⚙️ Installation & Setup

Follow these steps to run RePlate locally.

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* A Firebase Project (Free Tier)

### Steps

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/replate.git](https://github.com/your-username/replate.git)
    cd replate
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Firebase**
    * Create a project at [firebase.google.com](https://firebase.google.com).
    * Enable **Authentication** (Google & Email/Password).
    * Enable **Firestore Database**.
    * Create a file named `.env` in the root directory and add your keys:
    ```env
    VITE_API_KEY=your_api_key
    VITE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_PROJECT_ID=your_project_id
    VITE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_MESSAGING_SENDER_ID=your_sender_id
    VITE_APP_ID=your_app_id
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🔒 Security & Roles

* **Public:** Landing Page, Login, Registration.
* **Private:**
    * `/dashboard/donor` (Accessible only to Donors)
    * `/dashboard/ngo` (Accessible only to Verified NGOs)
    * `/admin` (Accessible only to Super Admins)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ to fight hunger.
</p>
