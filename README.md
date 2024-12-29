# CommuniTree

CommuniTree is a community engagement platform designed to connect municipalities with their residents, facilitating volunteer work, paid tasks, and intergenerational collaboration.

## Features

- User management system with CRUD operations
- Enhanced multi-language support (English and Swedish) with comprehensive translations
- Project management system with CRUD operations and detailed project views
- Event management system with CRUD operations
- Community management system with CRUD operations
- Community event calendar with RSVP functionality and community filtering
- Search and filter functionality for projects, events, and communities
- Pagination for project and event listings
- User authentication system with JWT and token refresh mechanism
- Protected routes for authenticated users
- Messaging system for user communication
- User profiles with edit capabilities
- Notification system for user alerts
- Improved error handling and user feedback
- Location-based theming system
- User-selectable themes with dark mode support
- Weather-based theming system with periodic updates
- Community Management System:
  - Rich community profiles with activity feeds
  - Multi-community support with easy switching
  - Community-specific content filtering
  - Community membership management
  - Community-based project and event organization
  - Community statistics and analytics
- Comprehensive Role-Based Access Control:
  - Hierarchical role system (Super Admin → Guest)
  - Granular permission definitions
  - Scoped access control (global, community, self)
  - Role-based navigation and UI adaptation
  - Permission-based feature access
  - Community-specific role assignments
- Enhanced Project Management System:
  - Centralized project data management with custom hooks
  - Advanced filtering and sorting capabilities
  - Skills-based search and validation
  - Progress tracking and volunteer management
  - Standardized project status handling
- Enhanced Error Handling System:
  - Standardized error responses across all components
  - Automatic retry mechanisms for recoverable errors
  - Comprehensive error boundary system
  - File upload error handling with progress tracking
  - Rate limiting protection
  - Request cancellation management
  - Network error recovery
  - Form validation with real-time feedback
  - Skeleton loading states
  - Error monitoring and reporting
  - Multi-language error messages

## Technical Stack

- Backend: Node.js with Express
- Frontend: React (Create React App)
- Database: PostgreSQL
- State Management: React Hooks (useState, useEffect)
- Internationalization: react-i18next
- Authentication: JSON Web Tokens (JWT)
- UI Components: Chakra UI and custom components
- Theming: Chakra UI theming system with custom hooks
- Testing: Jest and Supertest
- Weather Data: OpenWeatherMap API
- Scheduling: node-schedule
- State Management: 
  - React Hooks (useState, useEffect)
  - Custom hooks for domain-specific logic
  - Utility functions for common operations
- Error Handling:
  - Custom API error handler
  - Request retry mechanisms
  - AbortController for request cancellation
  - Error monitoring system
  - Standardized error responses

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL


### Installation

1. Clone the repository:
   ```
   git clone https://github.com/BjornKennethHolmstrom/CommuniTree.git
   cd communitree
   ```

2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   ```

3. Set up your PostgreSQL database and update the `.env` file with your database credentials.

   ```# After database setup, you can populate with sample data:
   psql -U your_username -d your_database -f scripts/init.sql
   psql -U your_username -d your_database -f scripts/sample-data.sql
   ```


4. Start the backend server:
   ```
   npm run dev
   ```

5. In a new terminal, start the React frontend:
   ```
   cd client
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Database Setup

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE communitree;
   ```

2. Initialize the database schema:
   ```bash
   # Run the initial schema setup
   psql -U postgres -d communitree -f scripts/init.sql
   
   # Add sample data
   psql -U postgres -d communitree -f scripts/sample-data.sql

   # Run roles schema updates
   psql -U postgres -d communitree -f scripts/roles-schema.sql
   
   # Run community schema updates
   psql -U postgres -d communitree -f scripts/community-schema.sql
   ```

3. Create admin user:
   ```bash
   npm run create-admin
   ```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=communitree
DB_PASSWORD=your_password
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Project Structure

The project follows a monorepo structure:

```
CommuniTree
├── babel.config.js
├── CHANGELOG.md
├── client
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── communitree-logo.svg
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── locales
│   │   │   ├── en
│   │   │   │   └── translation.json
│   │   │   └── sv
│   │   │       └── translation.json
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src
│       ├── api.js
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── assets
│       ├── components
│       │   ├── AddUserForm.js
│       │   ├── Comments.js
│       │   ├── common
│       │   │   ├── AccessibleButton.js
│       │   │   ├── AccessibleCard.js
│       │   │   ├── AccessibleForm.js
│       │   │   └── index.js
│       │   ├── communities
│       │   │   ├── CommunityForm.js
│       │   │   ├── CommunityForm.test.js
│       │   │   └── CommunityManagement.js
│       │   ├── CommunityDetails.js
│       │   ├── CommunityLanding.js
│       │   ├── CommunityLanding.test.js
│       │   ├── CommunityList.js
│       │   ├── CommunityList.test.js
│       │   ├── CommunitySwitcher.js
│       │   ├── CommunitySwitcher.test.js
│       │   ├── CreateProject.js
│       │   ├── CreateProject.test.js
│       │   ├── Dashboard.js
│       │   ├── EditUserForm.js
│       │   ├── ErrorBoundary.js
│       │   ├── ErrorContext.js
│       │   ├── EventCalendar.js
│       │   ├── FileUpload.js
│       │   ├── ForgotPassword.js
│       │   ├── ForgotPassword.test.js
│       │   ├── LanguageSwitcher.js
│       │   ├── Login.js
│       │   ├── Login.test.js
│       │   ├── MessagingComponent.js
│       │   ├── Navigation.js
│       │   ├── NotificationComponent.js
│       │   ├── PrivateRoute.js
│       │   ├── ProjectDetails.js
│       │   ├── ProjectDetails.test.js
│       │   ├── ProjectForm.js
│       │   ├── ProjectForm.test.js
│       │   ├── ProjectList.js
│       │   ├── ProjectList.test.js
│       │   ├── RegisterFormField.js
│       │   ├── Register.js
│       │   ├── Register.test.js
│       │   ├── ResetPassword.js
│       │   ├── ResetPassword.test.js
│       │   ├── ThemeSwitcher.js
│       │   ├── ui
│       │   │   └── alert.js
│       │   ├── UserDetails.js
│       │   ├── UserList.js
│       │   └── UserProfile.js
│       ├── config
│       │   └── roles.js
│       ├── contexts
│       │   ├── AuthContext.js
│       │   ├── CommunityContext.js
│       │   ├── ErrorContext.js
│       │   ├── PermissionContext.js
│       │   └── ThemeContext.js
│       ├── hooks
│       │   ├── useLocationTheme.js
│       │   └── useProject.js
│       ├── i18n.js
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── reportWebVitals.js
│       ├── setupTests.js
│       ├── __tests__
│       │   ├── hooks
│       │   │   └── useProject.test.js
│       │   └── utils
│       │       └── projectUtils.test.js
│       ├── theme
│       │   ├── locationThemes.js
│       │   ├── theme.js
│       │   ├── userThemes.js
│       │   └── weatherTheme.js
│       └── utils
│           ├── apiUtils.js
│           ├── permissions.js
│           └── projectUtils.js
├── config
│   └── database.js
├── cypress
├── cypress.config.js
├── docs
│   ├── communitree-project-summary.md
│   ├── communitree-roadmap.md
│   ├── detailed-plan.md
│   ├── error-safety-implementation-plan.md
│   ├── features-ideas-and-considerations.md
│   ├── food-forests-and-permaculture.md
│   ├── postgresql-management-guide.md
│   └── proptypes-checklist.md
├── generate_fresh_token.js
├── jest.config.js
├── LICENSE.md
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   ├── community-schema.sql
│   ├── createAdminUser.js
│   ├── initRolesAndPermissions.js
│   ├── init.sql
│   ├── roles-schema.sql
│   └── sample-data.sql
├── server.js
├── src
│   ├── config
│   │   └── roles.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── communityController.js
│   │   ├── dashboardController.js
│   │   ├── eventController.js
│   │   ├── fileController.js
│   │   ├── projectController.js
│   │   └── userController.js
│   ├── middleware
│   │   ├── auth.js
│   │   └── checkPermission.js
│   ├── __mocks__
│   │   ├── database.js
│   │   └── multer.js
│   ├── models
│   │   ├── community.js
│   │   ├── communityMembership.js
│   │   ├── event.js
│   │   ├── index.js
│   │   ├── project.js
│   │   ├── role.js
│   │   ├── user.js
│   │   └── weather.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── fileRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── projectRoutes.js
│   │   └── users.js
│   ├── schedulers
│   │   └── weatherScheduler.js
│   └── services
│       └── weatherService.js
├── start.js
├── tests
│   ├── api
│   │   ├── auth.test.js
│   │   └── project.test.js
│   ├── controllers
│   │   ├── authController.test.js
│   │   ├── commentController.test.js
│   │   ├── communityController.test.js
│   │   ├── dashboardController.test.js
│   │   ├── eventController.test.js
│   │   ├── fileController.test.js
│   │   ├── projectController.test.js
│   │   └── userController.test.js
│   ├── integration
│   │   ├── projectFlow.test.js
│   │   └── weatherAPI.test.js
│   ├── routes
│   │   ├── authRoutes.test.js
│   │   ├── commentRoutes.test.js
│   │   ├── communityRoutes.test.js
│   │   ├── dashboardRoutes.test.js
│   │   ├── eventRoutes.test.js
│   │   ├── fileRoutes.test.js
│   │   ├── messageRoutes.test.js
│   │   ├── notificationRoutes.test.js
│   │   ├── projectRoutes.test.js
│   │   └── users.test.js
│   ├── schedulers
│   │   └── weatherScheduler.test.js
│   ├── services
│   │   └── weatherService.test.js
│   └── setup.js
└── uploads

```

## Contributing

We welcome contributions to CommuniTree! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under a custom license - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Claude 3.5 Sonnet for invaluable assistance
