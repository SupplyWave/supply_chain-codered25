# 🔗 Blockchain Supply Chain Management Platform

A comprehensive, decentralized supply chain management system built with blockchain technology, featuring role-based authentication, real-time GPS tracking, and transparent transaction management.

## 🌟 Overview

This platform revolutionizes supply chain management by providing a transparent, secure, and efficient ecosystem that connects suppliers, producers, and customers through blockchain technology. The system ensures traceability, authenticity, and trust throughout the entire supply chain process.
🔗 **Live App**: [https://supplywave.vercel.app/](https://supplywave.vercel.app/)

## ✨ Key Features

### 🔐 **Role-Based Authentication**
- **MetaMask Integration**: Secure wallet-based authentication
- **Three User Roles**: Supplier, Producer, Customer with distinct permissions
- **Protected Routes**: Role-specific access control and dashboard isolation
- **Profile Management**: Comprehensive user profiles with company information

### 📊 **Professional Dashboard System**
- **Trust & Technology Design**: Navy blue, light blue, and lime green color scheme
- **Synchronized UI**: Consistent design across all user types
- **Real-time Stats**: Dynamic metrics and performance indicators
- **Responsive Design**: Mobile-optimized interface for all devices

### 🏭 **Supplier Management**
- **Raw Material Inventory**: Add, edit, and manage material stock
- **Automatic Stock Management**: Materials automatically removed when stock reaches zero
- **Order Tracking**: Monitor material orders and delivery status
- **GPS Integration**: Real-time location updates for shipments

### 🏗️ **Producer Operations**
- **Raw Material Sourcing**: Browse and purchase materials from suppliers
- **Product Manufacturing**: Create products using purchased materials
- **Order Management**: Handle customer orders and production scheduling
- **Multi-tab Interface**: Materials, Products, Orders, and Tracking sections

### 🛒 **Customer Experience**
- **Product Catalog**: Browse available products from producers
- **Secure Purchasing**: Blockchain-based transaction processing
- **Order Tracking**: Real-time GPS tracking of purchases
- **Producer Discovery**: View active producers and their offerings

### 🌍 **GPS Tracking System**
- **Real-time Location Updates**: Automatic GPS coordinates for shipments
- **Status Management**: Complete tracking lifecycle from order to delivery
- **Delivery Predictions**: Estimated delivery times and next update schedules
- **Visual Tracking**: Interactive tracking interface with status indicators

### 🔗 **Blockchain Integration**
- **Web3 Technology**: Ethereum-based smart contracts
- **Transaction Security**: Immutable transaction records
- **Decentralized Storage**: Distributed data management
- **Wallet Integration**: MetaMask for secure transactions

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15.1.3**: React framework with server-side rendering
- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Headless UI**: Accessible UI components
- **Heroicons**: Professional icon library

### **Backend**
- **Node.js**: JavaScript runtime environment
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **RESTful APIs**: Comprehensive API endpoints for all operations

### **Blockchain**
- **Web3.js**: Ethereum JavaScript API
- **MetaMask**: Browser wallet integration
- **Smart Contracts**: Ethereum-based contract deployment
- **Blockchain Networks**: Support for multiple networks

### **Additional Technologies**
- **GPS Integration**: Real-time location services
- **JWT Authentication**: Secure token-based authentication
- **File Upload**: Image and document handling
- **Real-time Updates**: Live data synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd my-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_NETWORK_ID=your_blockchain_network_id
```

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser

### MetaMask Setup
1. Install MetaMask browser extension
2. Create or import a wallet
3. Connect to your preferred blockchain network
4. Ensure you have test tokens for transactions

## 📱 User Roles & Permissions

### 🏭 **Supplier**
- ✅ Add and manage raw materials inventory
- ✅ Set pricing and availability
- ✅ Track material orders and payments
- ✅ Update GPS location for shipments
- ✅ View order history and analytics

### 🏗️ **Producer**
- ✅ Browse and purchase raw materials
- ✅ Create and manage product catalog
- ✅ Process customer orders
- ✅ Track raw material deliveries
- ✅ Manage production workflow

### 🛒 **Customer**
- ✅ Browse product marketplace
- ✅ Make secure purchases
- ✅ Track order delivery status
- ✅ View purchase history
- ✅ Rate and review products

## 🎨 Design System

### **Trust & Technology Color Scheme**
- **Primary Navy Blue (#1F3A93)**: Headers, primary buttons, main branding
- **Secondary Light Blue (#5DADE2)**: Secondary actions, informational elements
- **Accent Lime Green (#2ECC71)**: Success states, completed actions, active tabs
- **Light Gray (#F4F6F7)**: Backgrounds, subtle elements
- **Dark Gray (#2C3E50)**: Text content, readable elements

### **Component Library**
- **Cards**: Professional shadow effects and hover animations
- **Buttons**: Consistent styling with hover states and transitions
- **Forms**: Accessible inputs with focus states and validation
- **Navigation**: Clean tab interfaces with active state indicators
- **Icons**: SVG-based icons for scalability and performance

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login with MetaMask
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### **Raw Materials**
- `GET /api/rawMaterial` - Get all raw materials
- `POST /api/rawMaterial` - Add new raw material
- `PUT /api/rawMaterial?id={id}` - Update raw material
- `DELETE /api/rawMaterial?id={id}` - Delete raw material

### **Products**
- `GET /api/products/enhanced` - Get all products
- `POST /api/addProduct` - Add new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### **Orders & Purchases**
- `GET /api/purchases/user` - Get user purchases
- `POST /api/purchase/create` - Create new purchase
- `PUT /api/purchase/{id}` - Update purchase status

### **Tracking**
- `POST /api/rawmaterial/tracking` - Update GPS tracking
- `GET /api/tracking/{id}` - Get tracking information

## 🔧 Development

### **Project Structure**
```
my-app/
├── pages/                 # Next.js pages and API routes
│   ├── api/              # Backend API endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Role-specific dashboards
│   └── index.js          # Landing page
├── Components/           # Reusable React components
├── Context/              # React context providers
├── models/               # MongoDB schemas
├── lib/                  # Utility functions
├── styles/               # CSS and styling
└── utils/                # Helper functions
```

### **Key Components**
- **NavBar**: Responsive navigation with role-based menu items
- **ProtectedRoute**: Route protection based on user roles
- **MetaMaskStatus**: Wallet connection status indicator
- **GPSTrackingUpdate**: Real-time location tracking interface
- **ProfileDropdown**: User profile management interface

### **Database Models**
- **User**: User profiles and authentication data
- **RawMaterial**: Supplier inventory and material specifications
- **Product**: Producer catalog and product information
- **Purchase**: Transaction records and order management
- **Tracking**: GPS location and delivery status data

## 🚀 Deployment

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Variables**
Ensure all environment variables are properly configured for production:
- Database connections
- Blockchain network settings
- Authentication secrets
- API keys for external services

### **Deployment Platforms**
- **Vercel**: Recommended for Next.js applications


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the API documentation for integration help

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Comprehensive reporting dashboard
- **Multi-chain Support**: Support for multiple blockchain networks
- **AI Integration**: Predictive analytics and smart recommendations
- **IoT Integration**: Sensor data integration for enhanced tracking
- **Multi-language Support**: Internationalization features

## 🔄 Recent Updates

### **v2.0.0 - Trust & Technology UI Overhaul**
- ✅ **Complete UI Redesign**: Professional Trust & Technology color scheme
- ✅ **Navigation Restructure**: Logo removed, Home button beside company name
- ✅ **Dashboard Synchronization**: Consistent design across all user types
- ✅ **Enhanced Stats Cards**: Professional metrics with SVG icons
- ✅ **Improved Accessibility**: Better contrast ratios and focus states

### **v1.9.0 - GPS Tracking Enhancement**
- ✅ **Real-time GPS Updates**: Automatic location tracking for shipments
- ✅ **Status Management**: Complete tracking lifecycle support
- ✅ **Delivery Predictions**: Estimated delivery times and updates
- ✅ **Visual Tracking Interface**: Interactive status indicators

### **v1.8.0 - Stock Management Automation**
- ✅ **Automatic Stock Removal**: Materials deleted when stock reaches zero
- ✅ **Enhanced API Endpoints**: Improved error handling and validation
- ✅ **Real-time Updates**: Live inventory synchronization
- ✅ **Validation Fixes**: Resolved tracking status enum issues

## 🏗️ Architecture Overview

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│                 │    │                 │    │                 │
│ • Next.js       │◄──►│ • Node.js       │◄──►│ • Web3.js       │
│ • React         │    │ • MongoDB       │    │ • MetaMask      │
│ • Tailwind CSS  │    │ • RESTful APIs  │    │ • Smart Contracts│
│ • Context API   │    │ • Mongoose      │    │ • Ethereum      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**
```
User Action → Frontend → API Route → Database → Blockchain → Response
     ↑                                                           │
     └───────────────── UI Update ←─────────────────────────────┘
```

## 🔐 Security Features

### **Authentication Security**
- **MetaMask Integration**: Secure wallet-based authentication
- **Role-based Access Control**: Granular permissions per user type
- **Protected Routes**: Server-side route protection
- **Session Management**: Secure token handling

### **Data Security**
- **Input Validation**: Comprehensive data validation on all endpoints
- **MongoDB Security**: Parameterized queries prevent injection attacks
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Proper cross-origin resource sharing

### **Blockchain Security**
- **Smart Contract Validation**: Secure contract interactions
- **Transaction Verification**: Multi-step transaction validation
- **Wallet Security**: MetaMask integration for secure key management
- **Network Security**: Support for secure blockchain networks

## 📈 Performance Features

### **Frontend Optimizations**
- **Server-Side Rendering**: Next.js SSR for faster initial loads
- **Code Splitting**: Automatic optimization for bundle sizes
- **Image Optimization**: Next.js automatic image processing
- **Caching Strategy**: Efficient static and dynamic content caching

### **Backend Optimizations**
- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **API Response Caching**: Cached responses for frequently accessed data
- **Connection Pooling**: Efficient database connection management
- **Error Handling**: Comprehensive logging and error management

## 🧪 Testing & Quality Assurance

### **Testing Strategy**
- **Unit Testing**: Component and function level validation
- **Integration Testing**: API endpoint and database testing
- **End-to-End Testing**: Complete user workflow validation
- **Security Testing**: Vulnerability assessment and penetration testing

### **Code Quality**
- **ESLint**: JavaScript code linting and style enforcement
- **Prettier**: Automatic code formatting
- **TypeScript Ready**: Prepared for TypeScript migration
- **Git Hooks**: Pre-commit validation and testing

## 📊 Monitoring & Analytics

### **Application Monitoring**
- **Real-time Error Tracking**: Immediate error detection and alerting
- **Performance Metrics**: Application speed and responsiveness monitoring
- **User Analytics**: Behavior tracking and engagement analysis
- **API Monitoring**: Endpoint performance and availability tracking

### **Business Intelligence**
- **Supply Chain KPIs**: Key performance indicators and metrics
- **Transaction Analytics**: Blockchain transaction analysis and reporting
- **User Engagement**: Dashboard usage and feature adoption tracking
- **Revenue Analytics**: Financial performance and growth monitoring

## 🌐 Browser Support

### **Supported Browsers**
- ✅ **Chrome 90+**: Full feature support including MetaMask
- ✅ **Firefox 88+**: Complete functionality with wallet extensions
- ✅ **Safari 14+**: Core features with limited Web3 support
- ✅ **Edge 90+**: Full compatibility with all features
- ⚠️ **Mobile Browsers**: Basic functionality, limited Web3 support

### **MetaMask Compatibility**
- ✅ **Desktop**: Full MetaMask integration and functionality
- ✅ **Mobile**: MetaMask mobile app integration
- ✅ **Hardware Wallets**: Ledger and Trezor support through MetaMask
- ✅ **Multiple Networks**: Ethereum, Polygon, BSC support

---

**Built with ❤️ by SupplyWave Team**

*Last Updated: January 2025 | Version 2.0.0*
