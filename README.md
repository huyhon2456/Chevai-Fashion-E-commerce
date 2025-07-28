# 🛍️ Chevai Fashion E-commerce

A full-stack e-commerce fashion website built with React.js, Node.js, and MongoDB.

## 🌟 Features

### Frontend (Customer)
- 🏠 **Homepage** with hero section and featured products
- 🛒 **Product catalog** with filtering and sorting
- 🔍 **Search functionality** 
- 🛍️ **Shopping cart** with quantity management
- 👤 **User authentication** (Login/Register)
- 📦 **Order management** and history
- 💳 **Multiple payment methods** (COD, VNPay)
- 📱 **Responsive design** for all devices

### Admin Panel
- 📊 **Dashboard** with order statistics
- ➕ **Product management** (Add, Edit, Delete)
- 📋 **Order management** with status updates
- 👥 **User management**
- 📈 **Sales analytics**

### Backend
- 🔐 **JWT Authentication** 
- 🗄️ **MongoDB** database
- ☁️ **Cloudinary** image storage
- 💰 **VNPay** payment integration
- 🛡️ **Secure API** endpoints

## 🚀 Tech Stack

**Frontend:**
- React.js
- React Router
- Context API
- Tailwind CSS
- Axios
- React Toastify

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

**Payment Integration:**
- VNPay Gateway
- Cash on Delivery (COD)

**Cloud Services:**
- Cloudinary (Image storage)
- MongoDB Atlas (Database)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
- VNPay merchant account (for payment)

### 1. Clone the repository
```bash
git clone https://github.com/huyhon2456/Chevai-Fashion-E-commerce.git
cd Chevai-Fashion-E-commerce
```

### 2. Backend Setup
```bash
cd BE
npm install
```

Create `.env` file in BE folder:
```env
mongodb_uri=your_mongodb_connection_string
jwt_key=your_jwt_secret_key
cloudinary_name=your_cloudinary_name
cloudinary_api_key=your_cloudinary_api_key
cloudinary_api_secret=your_cloudinary_api_secret
admin_email=admin@chevai.com
admin_password=your_admin_password
vnp_TmnCode=your_vnpay_terminal_code
vnp_HashSecret=your_vnpay_hash_secret
vnp_Url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnp_ReturnUrl=http://localhost:5173/verify-payment
```

Start backend server:
```bash
npm run server
```

### 3. Frontend Setup
```bash
cd ../FE
npm install
```

Create `.env` file in FE folder:
```env
VITE_BE_URL=http://localhost:4000
```

Start frontend:
```bash
npm run dev
```

### 4. Admin Panel Setup
```bash
cd ../ADMIN
npm install
npm run dev
```

## 🌐 Access URLs

- **Frontend:** http://localhost:5173
- **Admin Panel:** http://localhost:5174  
- **Backend API:** http://localhost:4000

## 💳 Payment Testing

### VNPay Sandbox
Use these test credentials:
- **Card Number:** 9704198526191432198
- **Cardholder:** NGUYEN VAN A
- **Expiry:** 07/15
- **OTP:** 123456

## 📱 Features Overview

### Customer Features
- Browse products by category (Men, Women, Kids)
- Filter by type (Topwear, Bottomwear, Winterwear)
- Sort by price (Low to High, High to Low)
- Add products to cart
- Secure checkout process
- Order tracking
- VND currency formatting

### Admin Features
- Add new products with multiple images
- Manage inventory and pricing
- Process and update order status
- View sales analytics
- User management

## 🔧 Key Integrations

### VNPay Payment Gateway
- Secure payment processing
- Automatic order status updates
- Payment verification
- Vietnamese Dong (VND) support

### Cloudinary Image Management
- Optimized image storage
- Multiple image upload
- Responsive image delivery

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/admin` - Admin login

### Product Endpoints
- `GET /api/product/list` - Get all products
- `POST /api/product/add` - Add new product (Admin)
- `POST /api/product/remove` - Remove product (Admin)

### Order Endpoints
- `POST /api/order/place` - Place COD order
- `POST /api/order/vnpay` - Create VNPay payment
- `GET /api/order/vnpay-return` - VNPay callback
- `POST /api/order/userorders` - Get user orders
- `POST /api/order/list` - Get all orders (Admin)
- `POST /api/order/status` - Update order status (Admin)

### Cart Endpoints
- `POST /api/cart/add` - Add to cart
- `POST /api/cart/update` - Update cart
- `POST /api/cart/get` - Get user cart

## 📞 Support

For support, email huyhon2456@gmail.com or create an issue in this repository.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Huy Hon](https://github.com/huyhon2456)
