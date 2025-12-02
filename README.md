# Nomix Backend

The backend server for the **Nomix** application, a recipe management platform. Built with Node.js, Express, and MongoDB.

[Nomix Frontend](https://github.com/mja09h/Nomix-FE)

## 🚀 Features

- **Recipe Management**: Create, read, update, and delete recipes.
- **RESTful API**: Structured API endpoints for easy frontend integration.
- **Data Persistence**: Uses MongoDB for storing recipe data.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **Authentication**: JWT & Bcrypt (Setup in progress)
- **Other Tools**: Morgan (Logging), Cors, Dotenv

## 📂 Project Structure

```
NomixBE/
├── src/
│   ├── apis/           # API routes and controllers
│   │   ├── recipes/    # Recipe related logic
│   │   ├── categories/ # Category related logic (In Progress)
│   │   └── user/       # User auth related logic (In Progress)
│   ├── middlewares/    # Custom express middlewares (ErrorHandler, etc.)
│   ├── models/         # Mongoose database models
│   ├── app.ts          # App entry point
│   └── database.ts     # Database connection
├── package.json
└── tsconfig.json
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB (Local or Atlas URI)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ynalrajhy/NomixBE.git
   cd NomixBE
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your configuration:

   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the server:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:8000`.

## 📡 API Endpoints

### Recipes (`/api/recipes`)

| Method   | Endpoint | Description         | Auth Required | Required Data                                                                   | Returned Data                                               |
| :------- | :------- | :------------------ | :------------ | :------------------------------------------------------------------------------ | :---------------------------------------------------------- |
| `GET`    | `/`      | Fetch all recipes   | No            | None                                                                            | `{ success: true, data: [Recipe] }`                         |
| `POST`   | `/`      | Create a new recipe | No            | `name`, `category`, `ingredients`, `instructions`, `image` (file)               | `{ success: true, data: Recipe }`                           |
| `PUT`    | `/:id`   | Update a recipe     | No            | `id` (param), `name`, `category`, `ingredients`, `instructions`, `image` (file) | `{ success: true, data: Recipe }`                           |
| `DELETE` | `/:id`   | Delete a recipe     | No            | `id` (param)                                                                    | `{ success: true, message: "Recipe deleted successfully" }` |

### Users (`/api/users`)

| Method | Endpoint | Description         | Auth Required | Required Data                                      | Returned Data                                                                     |
| :----- | :------- | :------------------ | :------------ | :------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `POST` | `/`      | Register a new user | No            | `username`, `email`, `password`, `confirmPassword` | `{ success: true, data: User, token: string }`                                    |
| `POST` | `/login` | Login a user        | No            | `username`, `password`                             | `{ success: true, message: "Logged in successfully", data: User, token: string }` |
| `GET`  | `/`      | Fetch all users     | Yes           | None                                               | `{ success: true, data: [User] }`                                                 |

## 👥 Credits

### Backend Developers

- **Yousef Alrajhy**
- **Mohamad AlQalaf**
- **Fahad Saeed**

## Team 1

- **Mohammad Jassim Aljumaah**
- **Yousef Alrajhy**
- **Mohamad AlQalaf**
- **Fahad Saeed**
