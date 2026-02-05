# Sushrimala Mahila Bachat Gat - Frontend

Frontend application for the Sushrimala Mahila Bachat Gat platform, built with React, TypeScript, and Vite.

## Project Overview

This is the frontend component of the Sushrimala Mahila Bachat Gat web application. It provides a user interface for members, officers, and administrators to manage self-help group activities including member contributions, loan applications, group management, and financial tracking.

## Technologies Used

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Development
```bash
# Start the development server
npm run dev
```

### Build
```bash
# Create a production build
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   └── ui/             # Shared UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── pages/              # Page components
└── App.tsx             # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
```

## Features

### User Authentication
- Member registration and login
- Role-based access control
- JWT token management

### Dashboard
- Personal profile management
- Group information display
- Financial overview
- Loan status tracking

### Group Management
- Bachat Gat group details
- Member listing and management
- Officer assignment
- Contribution tracking

### Financial Features
- Loan application and management
- Monthly contribution recording
- Payment history tracking
- Financial transparency reports

### Communication
- Enquiry form for new members
- Email notifications
- Contact information display

## Role-Based Access

### Member
- View personal information
- View group details
- Submit loan applications
- View contribution status

### Officers (President, Secretary, Treasurer)
- All member features
- Manage group members
- Record contributions
- Approve/reject loans
- Process membership enquiries

### Admin
- All officer features
- Create and manage groups
- System-wide administration

## API Integration

The frontend communicates with the backend API through Axios HTTP client. All API calls are made to the base URL specified in the environment variables.

## Deployment

The application can be deployed to any static hosting service that supports SPA (Single Page Application) routing:

1. Build the application: `npm run build`
2. Deploy the contents of the `dist/` folder
3. Configure routing to serve `index.html` for all routes

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.