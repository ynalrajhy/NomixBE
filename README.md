# Nomix Backend

The backend server for the **Nomix** application, a recipe management platform. Built with Node.js, Express, and MongoDB.

[Nomix Frontend](https://github.com/mja09h/Nomix-FE)

## 🚀 Features

- **Recipe Management**: Create, read, update, and delete recipes with multiple images
- **User Authentication**: JWT-based authentication with admin roles
- **Social Features**: Like recipes, comment, reply to comments, follow users
- **Reporting System**: Report inappropriate content (recipes, users, comments, etc.)
- **Admin Panel**: Manage users, ban/unban, view reports, delete content
- **Categories & Ingredients**: Organize recipes by categories and ingredients
- **RESTful API**: Structured API endpoints for easy frontend integration
- **Data Persistence**: Uses MongoDB for storing data

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **Authentication**: JWT & Bcrypt
- **File Upload**: Multer
- **Other Tools**: Morgan (Logging), Cors, Dotenv

## 📂 Project Structure

```
NomixBE/
├── src/
│   ├── apis/
│   │   ├── recipes/      # Recipe CRUD, likes, comments
│   │   ├── categories/   # Category management
│   │   ├── Ingredients/  # Ingredient management
│   │   ├── user/         # User auth, profile, follow
│   │   └── reports/      # Reporting system
│   ├── middlewares/
│   │   ├── auth.ts       # JWT auth & admin middleware
│   │   ├── multer.ts     # File upload handling
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── models/           # Mongoose schemas
│   ├── types/            # TypeScript types
│   ├── app.ts            # App entry point
│   └── database.ts       # Database connection
├── uploads/              # Uploaded files
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
   HOST=127.0.0.1
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the server:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:8000`.

---

## 📡 API Endpoints

### Authentication & Users (`/api/auth`)

#### Public Routes

| Method | Endpoint | Description       | Body                                    |
| ------ | -------- | ----------------- | --------------------------------------- |
| `POST` | `/`      | Register new user | `name`, `username`, `email`, `password` |
| `POST` | `/login` | Login user        | `identifier`, `password`                |

#### Authenticated Routes

| Method   | Endpoint               | Description            | Body/Params                                                 |
| -------- | ---------------------- | ---------------------- | ----------------------------------------------------------- |
| `GET`    | `/`                    | Get all active users   | -                                                           |
| `GET`    | `/:id`                 | Get user by ID         | `id` (param)                                                |
| `PUT`    | `/:id`                 | Update user profile    | `name`, `username`, `email`, `bio`, `profilePicture` (file) |
| `DELETE` | `/`                    | Deactivate account     | `identifier`, `password`                                    |
| `PUT`    | `/:id/change-password` | Change password        | `oldPassword`, `newPassword`                                |
| `POST`   | `/favorites/:recipeId` | Toggle favorite recipe | `recipeId` (param)                                          |
| `POST`   | `/follow/:userId`      | Toggle follow user     | `userId` (param)                                            |

#### Admin Routes

| Method | Endpoint       | Description                        | Body                                      |
| ------ | -------------- | ---------------------------------- | ----------------------------------------- |
| `GET`  | `/admin/all`   | Get all users (including inactive) | Query: `status`, `banned`                 |
| `PUT`  | `/:id/active`  | Activate/deactivate user           | `isActive` (boolean)                      |
| `PUT`  | `/:id/admin`   | Make/remove admin                  | `isAdmin` (boolean)                       |
| `POST` | `/:id/ban`     | Ban user                           | `duration`, `unit` (hours/days), `reason` |
| `POST` | `/:id/unban`   | Unban user                         | -                                         |
| `GET`  | `/:id/reports` | Get reports for user               | `id` (param)                              |

---

### Recipes (`/api/recipes`)

#### Public Routes

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| `GET`  | `/`                     | Get all public recipes               |
| `GET`  | `/random`               | Get a random public recipe           |
| `GET`  | `/:id`                  | Get single recipe (increments views) |
| `GET`  | `/category/:categoryId` | Get recipes by category              |
| `GET`  | `/user/:userId`         | Get recipes by user                  |

#### Authenticated Routes

| Method   | Endpoint      | Description          | Body                                                                                                                                          |
| -------- | ------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/`           | Create recipe        | `name`, `description`, `category`, `ingredients`, `instructions`, `calories`, `protein`, `carbohydrates`, `fat`, `isPublic`, `images` (files) |
| `PUT`    | `/:id`        | Update recipe        | Same as create + `removeImages`, `replaceImages`                                                                                              |
| `DELETE` | `/:id`        | Delete own recipe    | -                                                                                                                                             |
| `POST`   | `/:id/images` | Add images to recipe | `images` (files)                                                                                                                              |
| `DELETE` | `/:id/images` | Remove image         | `imageUrl`                                                                                                                                    |

#### Social Features (Authenticated)

| Method   | Endpoint                                         | Description         | Body   |
| -------- | ------------------------------------------------ | ------------------- | ------ |
| `POST`   | `/:id/like`                                      | Toggle like recipe  | -      |
| `POST`   | `/:id/comments`                                  | Add comment         | `text` |
| `DELETE` | `/:id/comments/:commentId`                       | Delete comment      | -      |
| `POST`   | `/:id/comments/:commentId/like`                  | Toggle like comment | -      |
| `POST`   | `/:id/comments/:commentId/replies`               | Reply to comment    | `text` |
| `POST`   | `/:id/comments/:commentId/replies/:replyId/like` | Toggle like reply   | -      |

#### Admin Routes

| Method   | Endpoint             | Description                         |
| -------- | -------------------- | ----------------------------------- |
| `GET`    | `/admin/all`         | Get all recipes (including private) |
| `DELETE` | `/admin/:id`         | Delete any recipe                   |
| `GET`    | `/admin/:id/reports` | Get reports for recipe              |

---

### Categories (`/api/categories`)

#### Public Routes

| Method | Endpoint               | Description                                 |
| ------ | ---------------------- | ------------------------------------------- |
| `GET`  | `/`                    | Get all categories                          |
| `GET`  | `/random-with-recipes` | Get 10 random categories with a recipe each |
| `GET`  | `/:id`                 | Get single category                         |

#### Authenticated Routes

| Method   | Endpoint | Description     | Body   |
| -------- | -------- | --------------- | ------ |
| `POST`   | `/`      | Create category | `name` |
| `PUT`    | `/:id`   | Update category | `name` |
| `DELETE` | `/:id`   | Delete category | -      |

#### Admin Routes

| Method   | Endpoint             | Description                     |
| -------- | -------------------- | ------------------------------- |
| `GET`    | `/admin/all`         | Get all categories with recipes |
| `DELETE` | `/admin/:id`         | Delete any category             |
| `GET`    | `/admin/:id/reports` | Get reports for category        |

---

### Ingredients (`/api/ingredients`)

#### Public Routes

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| `GET`  | `/`      | Get all ingredients   |
| `GET`  | `/:id`   | Get single ingredient |

#### Authenticated Routes

| Method   | Endpoint | Description       | Body               |
| -------- | -------- | ----------------- | ------------------ |
| `POST`   | `/`      | Create ingredient | `name`, `quantity` |
| `PUT`    | `/:id`   | Update ingredient | `name`, `quantity` |
| `DELETE` | `/:id`   | Delete ingredient | -                  |

#### Admin Routes

| Method   | Endpoint             | Description                      |
| -------- | -------------------- | -------------------------------- |
| `GET`    | `/admin/all`         | Get all ingredients with recipes |
| `DELETE` | `/admin/:id`         | Delete any ingredient            |
| `GET`    | `/admin/:id/reports` | Get reports for ingredient       |

---

### Reports (`/api/reports`)

#### User Routes (Authenticated)

| Method | Endpoint      | Description              | Body                                                                         |
| ------ | ------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `POST` | `/`           | Create report            | `targetType`, `targetId`, `reason`, `description`, `recipeId` (for comments) |
| `GET`  | `/my-reports` | Get my submitted reports | -                                                                            |

**Target Types:** `recipe`, `ingredient`, `category`, `user`, `comment`

**Reasons:** `inappropriate`, `spam`, `misleading`, `copyright`, `harassment`, `other`

#### Admin Routes

| Method   | Endpoint      | Description          | Body                                           |
| -------- | ------------- | -------------------- | ---------------------------------------------- |
| `GET`    | `/`           | Get all reports      | Query: `status`, `targetType`                  |
| `GET`    | `/:id`        | Get single report    | -                                              |
| `PUT`    | `/:id/status` | Update report status | `status` (pending/reviewed/resolved/dismissed) |
| `DELETE` | `/:id`        | Delete report        | -                                              |

---

## 📝 Data Models

### User

```javascript
{
  name: String,
  username: String (unique),
  email: String,
  password: String (hashed),
  recipes: [ObjectId],
  favorites: [ObjectId],
  profilePicture: String,
  bio: String,
  followers: [ObjectId],
  following: [ObjectId],
  isActive: Boolean,
  isAdmin: Boolean,
  isBanned: Boolean,
  banExpiresAt: Date,
  banReason: String
}
```

### Recipe

```javascript
{
  name: String,
  description: String,
  category: [ObjectId],
  ingredients: [ObjectId],
  instructions: [String],
  images: [String],
  likes: [ObjectId],
  comments: [{
    user: ObjectId,
    text: String,
    likes: [ObjectId],
    replies: [{
      user: ObjectId,
      text: String,
      likes: [ObjectId]
    }]
  }],
  views: Number,
  isPublic: Boolean,
  calories: Number,
  protein: Number,
  carbohydrates: Number,
  fat: Number,
  userId: ObjectId
}
```

### Report

```javascript
{
  reporter: ObjectId,
  targetType: String (recipe/ingredient/category/user/comment),
  targetId: ObjectId,
  recipeId: ObjectId (for comments),
  reason: String,
  description: String,
  status: String (pending/reviewed/resolved/dismissed)
}
```

---

## 👥 Credits

### Backend Developers

- **Yousef Alrajhy**
- **Mohamad AlQalaf**
- **Mohammad Jassim Aljumaah**
- **Fahad Saeed**

## Team 1

- **Mohammad Jassim Aljumaah**
- **Yousef Alrajhy**
- **Mohamad AlQalaf**
- **Fahad Saeed**
