# 🌆 Beezeelinx – Inventory Management Web App

## 📌 Description  
Beezeelinx is a **full-stack inventory management web application** built with **Angular 16** for the frontend and **Node.js** for the backend. It interacts with a **MongoDB** database through **secure REST APIs**.

### ✨ Key Features  
- ✅ **Product Management**: Create, update, and delete products.  
- ✅ **Web app** built with Angular 16.  
- ✅ **Secure REST API** with user role-based access control.  
- ✅ **MongoDB Database** for data persistence.  

## 🚀 Installation & Setup  

### 📄 Environment Variables  
- Create a `.env` file in **./api** and at the **root directory**, using `.env.template` as a reference.  
- Create a `mongo-init.js` file in **./docker-entrypoint-init**, using `mongo-init-template` as a reference.  

### 🐳 Start the Containers  
```bash
docker compose up -d
```

### 📦 Install Dependencies & Run
```bash
cd api
npm install
npm run dev
```

```bash
cd web-app
npm install
npm start
```

### 👤 Create the First Admin User
```bash
cd api/commands
node createAdmin.js ${password}
```

### 🧪 Running Tests
```bash
cd api
npm test
```

### 🏭 Running in Production Mode
```bash
docker compose -f compose.prod.yml up -d
```
**Note:** For a complete production setup, you should add a domain name and configure SSL to secure your application.