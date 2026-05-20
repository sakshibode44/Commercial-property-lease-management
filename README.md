# Lease Management System

A comprehensive lease management system for commercial property landlords to track tenant agreements, rent payments, maintenance requests, and utility billing.

## Features

### Backend Features
- **User Authentication**: JWT-based authentication with role-based access
- **Property Management**: Track commercial properties with details like address, type, amenities
- **Tenant Management**: Manage tenant information and company details
- **Lease Management**: Track lease agreements with escalation clauses and renewal dates
- **Payment Tracking**: Record rent payments with automatic receipt generation
- **Maintenance Requests**: Handle property maintenance issues
- **Utility Billing**: Track utility consumption and billing
- **Analytics Dashboard**: Real-time analytics including occupancy rates and revenue trends
- **Automated Reminders**: Email notifications for lease renewals and payment due dates
- **Security Deposit Tracking**: Monitor deposit refunds and forfeitures

### Frontend Features
- **Modern React UI**: Built with React 19 and Vite
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Dashboard**: Charts and analytics for key metrics
- **Property Management**: Add and manage properties
- **Tenant Portal**: View tenant information
- **Payment Management**: Track payments and generate receipts

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email notifications
- **Node-cron** for scheduled tasks
- **Winston** for logging

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Chart.js** for data visualization
- **Lucide React** for icons

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URL=mongodb://localhost:27017/lease_management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

### Properties
- `GET /api/v1/properties` - Get all properties
- `POST /api/v1/properties` - Create new property
- `GET /api/v1/properties/:id` - Get property by ID
- `PATCH /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property

### Tenants
- `GET /api/v1/tenants` - Get all tenants
- `POST /api/v1/tenants` - Create new tenant
- `GET /api/v1/tenants/:id` - Get tenant by ID
- `PATCH /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Delete tenant

### Leases
- `GET /api/v1/leases` - Get all leases
- `POST /api/v1/leases` - Create new lease
- `GET /api/v1/leases/:id` - Get lease by ID
- `PATCH /api/v1/leases/:id` - Update lease
- `DELETE /api/v1/leases/:id` - Delete lease

### Payments
- `GET /api/v1/payments` - Get all payments
- `GET /api/v1/payments/:id` - Get payment by ID
- `PATCH /api/v1/payments/:id/record` - Record payment
- `GET /api/v1/payments/:id/receipt` - Generate receipt

### Maintenance
- `GET /api/v1/maintenance` - Get all maintenance requests
- `POST /api/v1/maintenance` - Create maintenance request
- `GET /api/v1/maintenance/:id` - Get maintenance request
- `PATCH /api/v1/maintenance/:id` - Update maintenance request
- `DELETE /api/v1/maintenance/:id` - Delete maintenance request

### Utilities
- `GET /api/v1/utilities` - Get all utility bills
- `POST /api/v1/utilities` - Create utility bill
- `GET /api/v1/utilities/:id` - Get utility bill
- `PATCH /api/v1/utilities/:id` - Update utility bill
- `PATCH /api/v1/utilities/:id/pay` - Mark as paid
- `DELETE /api/v1/utilities/:id` - Delete utility bill

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard analytics

## Automated Features

### Email Reminders
- **Lease Renewal Reminders**: Sent 30 days before lease expiration
- **Payment Due Reminders**: Sent for overdue payments
- Scheduled to run daily at 9 AM and 10 AM respectively

### Lease Status Updates
- Automatically updates expired leases to "expired" status
- Runs daily at 11 PM

## Database Models

### User
- email, password, name, role

### Property
- name, address, type, totalArea, totalUnits, amenities, status

### Tenant
- companyName, contactPerson, email, phone, address

### Lease
- propertyId, tenantId, unitNumber, startDate, endDate, monthlyRent, securityDeposit, escalationRate, escalationFrequency, status

### Payment
- leaseId, tenantId, amount, dueDate, paidDate, method, status, receiptNumber

### Maintenance
- propertyId, tenantId, title, description, priority, status, assignedTo

### Utility
- leaseId, tenantId, propertyId, utilityType, amount, billingPeriod, dueDate, paidDate, status

## Usage

1. Register/Login as an admin user
2. Add properties to the system
3. Add tenants
4. Create lease agreements
5. Record payments and generate receipts
6. Track maintenance requests
7. Monitor utility bills
8. View analytics on the dashboard

## Development

### Running Tests
```bash
cd backend
npm test
```

### Code Formatting
```bash
cd frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.