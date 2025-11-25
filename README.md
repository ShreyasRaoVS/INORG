# INORG - Employee Management System

A comprehensive employee management platform with project & task management, team collaboration, onboarding/offboarding workflows, analytics, and document management.

## 🚀 Features

### ✅ Core Features (Implemented)

1. **Project & Task Management**
   - Project creation and tracking
   - Task assignment and status updates
   - Deadlines and priority labels
   - Multi-user visibility
   - Team activity view

2. **Member & Team Management**
   - Add/remove team members
   - Role assignment (Admin, Manager, Team Lead, Member, Viewer)
   - Skill-based tagging
   - Department mapping
   - Access rights and permissions
   - Team-wise visibility

3. **Onboarding & Offboarding Pipeline**
   - Automated new member onboarding
   - Task allocation to new joiners
   - Offboarding checklist
   - Access role removal
   - Pending task clearing

4. **Analytics Dashboard**
   - Productivity metrics
   - Task completion tracking
   - Department activity
   - Weekly output reports
   - Team performance analytics

5. **Document Management**
   - File attachments
   - Document viewing
   - Upload management
   - Internal references

6. **Event & Workflow Tracking**
   - Event recording
   - Project stage tracking
   - Status logs
   - Activity history

7. **Multi-Department Support**
   - Separate dashboards
   - Department-wise KPIs
   - Department task boards

8. **Secure Authentication**
   - JWT-based authentication
   - Protected dashboards
   - User accounts
   - Role-based access control

### 🚧 Planned Features (Coming Soon)

- AI Assistant "TIRAN" for task summaries and analytics
- GitHub/GitLab synchronization
- Real-time notifications
- Advanced reporting

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **PostgreSQL** with **Prisma ORM**
- **JWT** for authentication
- **Multer** for file uploads

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Hook Form** for forms
- **Axios** for API calls
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd ERP
```

### 2. Install dependencies

#### Backend
```bash
npm install
```

#### Frontend
```bash
cd client
npm install
cd ..
```

### 3. Database Setup

Create a PostgreSQL database:
```bash
createdb inorg_db
```

Copy the environment file:
```bash
copy .env.example .env
```

Edit `.env` and update the database connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/inorg_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Run Prisma migrations:
```bash
npm run prisma:migrate
```

Generate Prisma client:
```bash
npm run prisma:generate
```

### 4. Seed Initial Data (Optional)

You can use Prisma Studio to add initial departments:
```bash
npm run prisma:studio
```

Or create a seed script to add:
- Departments (Engineering, Marketing, Sales, HR, etc.)
- An admin user

## 🚀 Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them separately:

**Backend only:**
```bash
npm run server:dev
```

**Frontend only:**
```bash
npm run client:dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api

### Production Build

Build the entire application:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 📁 Project Structure

```
ERP/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   └── package.json
│
├── src/
│   └── server/             # Express backend
│       ├── config/         # Configuration files
│       ├── middleware/     # Express middleware
│       ├── routes/         # API routes
│       └── index.ts        # Server entry point
│
├── prisma/
│   └── schema.prisma       # Database schema
│
├── uploads/                # Uploaded files
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 🔐 Default Roles

- **ADMIN**: Full system access
- **MANAGER**: Department and team management
- **TEAM_LEAD**: Team and project management
- **MEMBER**: Access to assigned tasks and projects
- **VIEWER**: Read-only access

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/comments` - Add comment

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department

### Onboarding/Offboarding
- `GET /api/onboarding` - List onboarding records
- `POST /api/onboarding` - Create onboarding record
- `GET /api/offboarding` - List offboarding records
- `POST /api/offboarding` - Create offboarding record

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/team-performance` - Team performance
- `GET /api/analytics/user/:id` - User productivity

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id/download` - Download document

## 🎨 UI Components

The application uses a custom Tailwind CSS design system with:
- Predefined button styles (`.btn`, `.btn-primary`, `.btn-secondary`)
- Card components (`.card`)
- Form inputs (`.input`, `.label`)
- Badge components (`.badge`)
- Status color utilities

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inorg_db"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Frontend
CLIENT_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -l`

### Port Already in Use
- Change PORT in `.env`
- Or kill existing process: `npx kill-port 5000`

### Prisma Issues
```bash
# Reset database
npm run prisma:migrate reset

# Regenerate client
npm run prisma:generate
```

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please follow the standard fork-and-pull-request workflow.

## 🆘 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ for modern employee management**
