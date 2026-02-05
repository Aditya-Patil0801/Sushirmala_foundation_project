# Sushrimala Mahila Bachat Gat

A comprehensive web application for women's self-help groups (SHGs) focused on community savings, financial empowerment, and social development.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Role-Based Access Control](#role-based-access-control)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Sushrimala Mahila Bachat Gat is a digital platform designed to empower women through financial inclusion and community savings. The application facilitates the management of self-help groups, member contributions, loan applications, and group activities.

## Features

### Core Features
- **User Management**: Registration, authentication, and profile management
- **Group Management**: Creation and management of Bachat Gat groups
- **Contribution Tracking**: Monthly contribution recording and tracking
- **Loan Management**: Loan applications, approvals, and repayment tracking
- **Meeting Management**: Scheduling and attendance tracking for group meetings
- **Enquiry System**: Membership application process with approval workflow
- **Multi-language Support**: English, Hindi, and Marathi interfaces
- **Financial Transparency**: Real-time visibility of group finances

### Role-Based Features
- **Members**: View personal information, group details, and contribution status
- **Officers (President, Secretary, Treasurer)**: Manage group operations and member data
- **Admin**: System-wide management and oversight

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Shadcn/ui component library
- React Router for navigation
- Axios for HTTP requests
- Lucide React for icons

### Backend
- Node.js 18+
- Express.js web framework
- MongoDB with Mongoose ODM
- JWT for authentication
- Nodemailer for email notifications
- Multer for file uploads

### Database
- MongoDB 5.0+

### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Nodemon for development server
- Concurrently for running multiple processes

## Installation

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Email configuration (for notifications)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

## Usage

### User Roles
1. **Member**: Regular group members
2. **President**: Group leader with administrative privileges
3. **Secretary**: Group administrator with management capabilities
4. **Treasurer**: Financial officer responsible for group funds
5. **Admin**: System administrator with full access

### Key Workflows

#### Membership Process
1. Visitor submits enquiry form through public access
2. President or Secretary reviews and approves/rejects application
3. Approved applicants receive email notification
4. New members register and join groups

#### Contribution Management
1. Officers record monthly contributions for members
2. All members can view contribution status
3. System tracks payment history and arrears

#### Loan Process
1. Members submit loan applications
2. President or Secretary reviews and approves/rejects
3. Approved loans are tracked with repayment schedules

## Project Structure

```
sushrimala_foundation/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.tsx
│   └── index.html
└── README.md
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Bachat Gat Groups
- `GET /api/bachatgat` - Get all groups
- `GET /api/bachatgat/:id` - Get specific group
- `POST /api/bachatgat` - Create new group (admin)
- `PUT /api/bachatgat/:id` - Update group (officers)

### Contributions
- `POST /api/contributions` - Record contribution (officers)
- `GET /api/contributions/bachat-gat/:id` - Get group contributions
- `GET /api/contributions/member/:id` - Get member contributions

### Loans
- `GET /api/loans/bachat-gat/:id` - Get group loans
- `POST /api/loans` - Create loan application
- `PATCH /api/loans/:id/status` - Approve/reject loan

### Enquiries
- `POST /api/enquiries/submit` - Submit enquiry (public)
- `GET /api/enquiries/bachat-gat/:id` - Get group enquiries
- `PATCH /api/enquiries/:id/approve` - Approve enquiry
- `PATCH /api/enquiries/:id/reject` - Reject enquiry

## Database Schema

### User
- name (String)
- email (String, unique)
- password (String)
- role (Enum: president, secretary, treasurer, member)
- bachatGatId (ObjectId, ref: BachatGat)
- phone (String)
- address (Object)
- monthlyIncome (Number)
- aadharNumber (String, unique)

### BachatGat
- name (String, unique)
- description (String)
- members (Array of ObjectIds, ref: User)
- president (ObjectId, ref: User)
- secretary (ObjectId, ref: User)
- treasurer (ObjectId, ref: User)
- monthlyContribution (Number)
- totalFunds (Number)

### Contribution
- memberId (ObjectId, ref: User)
- bachatGatId (ObjectId, ref: BachatGat)
- amount (Number)
- month (Number)
- year (Number)
- recordedBy (ObjectId, ref: User)

### Loan
- memberId (ObjectId, ref: User)
- groupId (ObjectId, ref: BachatGat)
- amount (Number)
- purpose (String)
- status (Enum: pending, approved, rejected, completed)
- interestRate (Number)
- duration (Number)
- approvedBy (ObjectId, ref: User)

### Enquiry
- name (String)
- email (String)
- phone (String)
- address (Object)
- interestedInJoining (Boolean)
- livesInRentedHouse (Boolean)
- status (Enum: pending, approved, rejected)
- bachatGatId (ObjectId, ref: BachatGat)

## Role-Based Access Control

### Member
- View personal profile and loan information
- View group information and approved loans
- View contribution status of all members
- Submit enquiry forms

### President
- All member privileges
- Manage group members (add/remove)
- Record member contributions
- Approve/reject loans
- Approve/reject membership enquiries
- Manage group settings

### Secretary
- All member privileges
- Manage group members (add/remove)
- Record member contributions
- Approve/reject loans
- Approve/reject membership enquiries
- Manage group settings

### Treasurer
- All member privileges
- Record member contributions
- Manage group finances
- Update monthly contribution amounts

### Admin
- All officer privileges
- Create/modify Bachat Gat groups
- View system-wide statistics
- Manage all users and groups

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.