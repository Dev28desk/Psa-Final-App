# Parmanand Sports Academy Admin Panel

## Overview

This is a comprehensive sports academy management system built with React/TypeScript frontend and Node.js/Express backend. The application provides a modern, data-driven admin panel for managing students, payments, attendance, and sports activities with real-time updates and AI-powered insights.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand for client-side state management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Real-time**: WebSocket implementation for live updates
- **API Design**: RESTful APIs with TypeScript
- **Validation**: Zod schemas for runtime type checking
- **Session Management**: Built-in session handling

## Key Components

### Dashboard System
- **Metrics Display**: Real-time statistics cards showing student count, revenue, attendance
- **Analytics Charts**: Revenue trends, sports distribution, attendance patterns
- **AI Insights Panel**: Predictive analytics and recommendations
- **Activity Feed**: Real-time updates of system activities

### Student Management
- **Student Registration**: Complete enrollment workflow with validation
- **Digital Student Cards**: QR code-enabled student identification
- **Profile Management**: Comprehensive student information tracking
- **Batch Assignment**: Automatic batch allocation based on sport and skill level

### Payment System
- **Fee Collection**: Multi-payment method support (cash, UPI, card, online)
- **Payment Tracking**: Monthly fee tracking with status indicators
- **Revenue Analytics**: Detailed financial reporting and trends
- **Pending Payment Management**: Automated reminders and follow-ups

### Attendance Management
- **Calendar View**: Monthly attendance visualization
- **Batch-wise Tracking**: Attendance marking by sports batches
- **Real-time Updates**: Live attendance status updates
- **Reporting**: Attendance analytics and trend analysis

### Sports & Batch Management
- **Sport Configuration**: Sport-specific fee structures and skill levels
- **Batch Scheduling**: Time slot management and capacity control
- **Coach Assignment**: Instructor allocation to batches
- **Skill Level Tracking**: Progressive skill development monitoring

## Data Flow

1. **Client Requests**: Frontend makes API calls through React Query
2. **API Layer**: Express.js handles routing and business logic
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Real-time Updates**: WebSocket broadcasts changes to connected clients
5. **State Management**: Zustand stores manage local component state
6. **UI Updates**: React components re-render based on query invalidation

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Efficient database connection management

### UI Components
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: React charting library for data visualization
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Fast build tool with HMR
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon development instance
- **WebSocket**: Local WebSocket server for real-time features

### Production Build
- **Frontend**: Vite production build with code splitting
- **Backend**: ESBuild compilation for Node.js deployment
- **Static Assets**: Optimized asset bundling and compression
- **Environment Variables**: Secure configuration management

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema Sync**: Automatic database schema synchronization
- **Connection Management**: Pooled connections for scalability

## Changelog
- July 08, 2025. Initial setup
- July 08, 2025. Completed comprehensive mobile optimization:
  - Added mobile-responsive student form with optimized field layouts
  - Implemented COD collect and Online Payment buttons with proper styling
  - Created mobile-friendly settings page with compressed tab navigation
  - Enhanced sidebar with dark mode support and mobile hamburger menu
  - Optimized dashboard metrics cards for mobile viewing
  - Added responsive student table with mobile card view
  - Implemented sticky mobile header with dark mode toggle
  - Added proper dark mode CSS variables throughout components
  - Created mobile-first responsive design approach

## User Preferences

Preferred communication style: Simple, everyday language.
Mobile-first design approach: All components must be mobile-responsive and desktop-adaptive.
Payment integration: COD collect and Online Payment buttons required in student registration.
Dark mode support: Full dark mode implementation across all components.