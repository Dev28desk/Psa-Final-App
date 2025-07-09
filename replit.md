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
- July 08, 2025. Implemented streamlined payment recording system:
  - Added quick payment recording with student name search
  - Auto-display of student sport and fee amount
  - Easy payment method selection (Cash, UPI, Card, Online)
  - One-click payment recording workflow
  - Integrated payment tracking with overview and pending tabs
- July 08, 2025. Enhanced sidebar with flexible hide/show functionality:
  - Added collapsible sidebar with toggle button
  - Made all layout elements adaptive to sidebar state
  - Implemented smooth transitions between collapsed/expanded states
  - Added mobile backdrop and close functionality
  - Created responsive main content area that adapts to sidebar width
- July 08, 2025. Completed AI insights and notification system implementation:
  - Integrated Gemini AI API for intelligent analytics and insights
  - Added AI-powered student analysis, revenue forecasting, and attendance insights
  - Implemented WhatsApp notification system for fee reminders and alerts
  - Created comprehensive API key management in settings
  - Fixed theme and appearance settings with proper dark mode functionality
  - Enhanced pending payments display with sports and batch-wise grouping
  - Added working reports generation system with downloadable data
  - Improved upload functionality with proper file handling
  - Created fully functional AI insights dashboard with real-time data
- July 08, 2025. Completed advanced WhatsApp Business API integration with automated campaigns:
  - Implemented comprehensive campaign management system with full CRUD operations
  - Added automated campaign engine with triggers for fee reminders, welcome messages, attendance follow-up, and birthday wishes
  - Created complete campaign database schema with campaigns, campaignMessages, and messageTemplates tables
  - Built advanced campaign frontend interface with scheduling, targeting, and analytics capabilities
  - Integrated automated campaign triggers with scheduling system
  - Added predefined campaign templates for common use cases
  - Enhanced campaign management with status tracking and analytics
  - Implemented real-time message delivery tracking and analytics
  - Created comprehensive campaign automation rules engine
  - Added campaigns to navigation sidebar with proper routing
- July 08, 2025. Completed GPS tracking and user management systems:
  - Implemented real-time GPS tracking for coach attendance with geofencing capabilities
  - Created comprehensive user permission management system with role-based access control
  - Added GPS tracking dashboard with live location monitoring, geofence management, and coach check-in/check-out
  - Built user management interface with permission assignment and role management
  - Created robust database schema for permissions, location tracking, geofences, and coach attendance
  - Integrated GPS tracking and user management pages into main navigation
  - Added error handling for database table creation delays
  - Implemented comprehensive API endpoints for all GPS and user management features
  - Moved advanced features (Campaigns, Advanced Reports, AI Insights, Users, GPS Tracking) to settings page for better organization
  - Fixed database table creation issues by manually creating required tables
  - Successfully synchronized all database schemas for GPS tracking and user management
- July 08, 2025. Implemented AI-powered predictive analytics with student retention forecasting:
  - Added comprehensive retention forecasting functionality using Gemini AI
  - Created calculateRetentionMetrics function to analyze student cohorts, dropout patterns, and payment behavior
  - Implemented retention forecast API endpoint with detailed forecasting insights
  - Added retention forecast frontend with real-time analytics display
  - Integrated retention metrics including current vs predicted retention rates, at-risk student identification, and intervention strategies
  - Created visual retention dashboard with color-coded metrics and actionable insights
  - Added comprehensive retention factors analysis (positive/negative influences)
  - Implemented automated action plan generation with step-by-step recommendations
  - Enhanced AI insights page with retention forecasting section alongside existing analytics
- July 08, 2025. Completed comprehensive gamified achievement badges system:
  - Built complete backend infrastructure with badge schema and management system
  - Created comprehensive badge, student_badge, student_points, and achievement_history database tables
  - Implemented gamification service with automated badge awarding for payments and attendance
  - Added badge-related methods to IStorage interface for complete database operations
  - Created comprehensive Student Badges frontend page with badge management and student progress tracking
  - Integrated badge awarding triggers in payment and attendance processing
  - Added sidebar navigation for Student Badges with proper routing
  - Implemented badge creation, awarding, and points management system
  - Added achievement history tracking with comprehensive analytics
- July 09, 2025. Completed comprehensive mobile application development:
  - Created dedicated mobile apps for coaches and students with full functionality
  - Built complete mobile authentication system with role-based access
  - Developed Coach App with dashboard, class management, attendance marking, and profile
  - Created Student App with dashboard, schedule, attendance tracking, payments, achievements, and profile  
  - Added mobile-specific backend API routes and storage methods
  - Implemented mobile-optimized UI components with responsive design and bottom navigation
  - Integrated mobile routes into main application accessible at `/mobile`
  - Added theme provider and fixed all component dependencies
  - **Decision made: Proceeding with React Native for true native mobile apps**
  - Created comprehensive React Native setup guide and component conversion documentation
  - Prepared all React Native components, navigation, and authentication service
  - All backend APIs ready for React Native integration
- July 09, 2025. Completed Firebase OTP student registration system:
  - Implemented comprehensive Firebase phone authentication with OTP verification
  - Created complete 6-step student registration flow (Phone → OTP → Details → Sport/Batch → Payment → Complete)
  - Built Firebase service with reCAPTCHA integration and error handling
  - Added multi-step form validation with Zod schemas and React Hook Form
  - Integrated student registration API with badge awarding and payment recording
  - Added phone number duplicate checking and registration completion workflow
  - Firebase configuration keys provided and integrated successfully
  - Students can now register independently using phone number verification
- July 09, 2025. Completed React Native Firebase configuration:
  - Configured Firebase for both iOS and Android React Native apps
  - Added iOS configuration (com.psa.user) and Android configurations (com.psa.coatch, com.psanashik.user)
  - Created Firebase authentication service for React Native with OTP verification
  - Built comprehensive React Native Firebase setup guide
  - Added Firebase configuration files for native mobile development
  - Created PhoneAuthScreen component for React Native OTP authentication
  - Prepared complete React Native project structure with Firebase integration

## User Preferences

Preferred communication style: Simple, everyday language.
Mobile-first design approach: All components must be mobile-responsive and desktop-adaptive.
Payment integration: COD collect and Online Payment buttons required in student registration.
Dark mode support: Full dark mode implementation across all components.
GPS tracking: Real-time location tracking with geofencing for coach attendance verification.
User management: Role-based permission system with limited account creation capabilities.
Deployment preference: VPS deployment for full control and cost-effectiveness over managed hosting.