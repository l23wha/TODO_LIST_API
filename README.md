# Secure Todo List API 🚀

A robust, secure, and fully RESTful Todo List API built with Node.js, Express, and MongoDB. It features user authentication using JSON Web Tokens (JWT), password hashing with Bcrypt, and strict resource ownership verification.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (JWT)
* **Security:** Bcrypt.js (Password Hashing), Ownership Validation (403 Forbidden checks)

---

## 📋 Features

* **User Registration & Login:** Secure signup and signin with hashed passwords and token generation.
* **JWT Authentication:** Protected routes requiring a valid Bearer token.
* **Todo CRUD Operations:** Create, Read, Update, and Delete todo items.
* **Resource Ownership & Security:** Users can only modify or delete their own todos. Unauthorized modifications trigger a `403 Forbidden` error.
* **Pagination & Filtering:** Support for filtering by completion status and paginating results.

---

## ⚙️ Installation & Setup

