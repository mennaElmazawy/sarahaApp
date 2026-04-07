# 🚀 Saraha App (Anonymous Messaging Platform)

## 📌 Overview

Saraha App is a backend project that allows users to receive anonymous messages securely. The project focuses on building a scalable and secure RESTful API using Node.js and modern backend practices.

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MongoDB & Mongoose
* JWT (Authentication)
* Bcrypt (Password Hashing)

---

## ✨ Features

* User Authentication (Signup / Login)
* JWT-based Authorization
* Send Anonymous Messages
* Secure Password Hashing
* Protected Routes
* Error Handling & Validation

---

## 📂 Project Structure

```
├── src
│   ├── modules
│   ├── DB
│   ├── common
│   ├── app.controller.js
│   └── index.js
├── config
│    ├── .env
├── package.json
```

---

## 🔑 API Endpoints (Examples)

### Auth

* POST /signup
* POST /signIn

### Messages

* POST /send
* GET /getMessage/:messageId


---

## 🔒 Security

* Passwords are hashed using Bcrypt
* Authentication handled using JWT
* Protected routes using middleware

---

## 🚀 Getting Started

### 1. Clone the repo

```
git clone https://github.com/mennaElmazawy/sarahaApp.git
```

### 2. Install dependencies

```
npm install
```

### 3. Setup environment variables

Create a `.env` file and add:

```
PORT = "5000"

SALT_ROUNDS =YOUR_SALT_ROUNDS

DB_URI =your_mongodb_uri
CLIENT_ID = your_client_id

ACCESS_SECRET_KEY =your_access_secret_Key
REFRESH_SECRET_KEY =yor_refresh_secret_Key

CLOUD_NAME= your_cloed_name
API_KEY= your_api_key
API_SECRET= your_api_secret_key

PREFIX = "Bearer"
EMAIL =  your_email
PASSWORD = your_password
REDIS_URL= your_redis_url
WHITE_LIST =your_white_list
```

### 4. Run the project

```
npm run dev
```

---

## 📚 What I Learned

* Building RESTful APIs
* Authentication & Authorization
* Structuring scalable backend projects
* Handling real-world security practices

---

## 🤝 Contributing

Feel free to fork the repo and submit pull requests.

---

## 📬 Contact

If you have any feedback, feel free to reach out!

---

⭐ If you like this project, don’t forget to give it a star on GitHub!
