# Weekly Educational Tracking Application

## Overview

This is a French-language educational tracking application designed for monitoring weekly progress of children with special educational needs. The application serves administrators and observers (teachers, AESH educators, parents) who need to track individualized student progress through structured weekly reports. The system features a responsive web interface accessible on mobile, tablet, and desktop devices, with comprehensive forms for evaluating student skills across multiple developmental areas including autonomy, fine motor skills, communication, and social interaction.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form schemas
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon Database as the serverless provider
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Session Storage**: PostgreSQL-based session store for authentication persistence
- **Schema Design**: Structured tables for users, weekly reports, and session management

### Authentication and Authorization
- **Provider**: Replit Auth with OpenID Connect protocol
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session storage
- **User Management**: Automatic user creation and profile synchronization
- **Route Protection**: Middleware-based authentication checks for protected endpoints
- **Security**: CSRF protection and secure session configuration

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Driver**: @neondatabase/serverless for optimized serverless connections

### Authentication Services
- **Replit Auth**: Integrated OAuth provider with OpenID Connect
- **Session Store**: connect-pg-simple for PostgreSQL-backed session persistence

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development experience enhancements for Replit environment

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema generation
- **Drizzle Zod**: Integration between Drizzle schemas and Zod validation

### Date and Internationalization
- **date-fns**: Date manipulation library with French locale support
- **French Localization**: UI text and date formatting in French language