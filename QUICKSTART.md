# 🚀 Quick Start - INORG Employee Management System

## Initial Setup (First Time)

### 1. Install Dependencies
```powershell
# Run the setup script
.\setup.ps1

# Or manually:
npm install
cd client
npm install
cd ..
```

### 2. Configure Environment
Edit `.env` file with your settings:
```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/inorg_db"
JWT_SECRET=change-this-to-a-random-secure-string
```

### 3. Setup Database
```powershell
# Create database
createdb inorg_db

# Run migrations
npm run prisma:generate
npm run prisma:migrate

# Seed with sample data (Optional but recommended)
npm run prisma:seed
```

## Running the Application

### Development Mode
```powershell
npm run dev
```
Access at: http://localhost:3000

### Backend Only
```powershell
npm run server:dev
```

### Frontend Only
```powershell
npm run client:dev
```

## Default Login Credentials (After Seeding)

**Admin Account:**
- Email: `admin@inorg.com`
- Password: `admin123`

**Manager Account:**
- Email: `manager@inorg.com`
- Password: `password123`

**Developer Account:**
- Email: `dev@inorg.com`
- Password: `password123`

## Common Tasks

### View/Edit Database
```powershell
npm run prisma:studio
```

### Reset Database
```powershell
npm run prisma:migrate reset
```

### Build for Production
```powershell
npm run build
npm start
```

## Project Structure Quick Reference

```
ERP/
├── client/src/
│   ├── pages/          # All page components
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utilities, API client
│   ├── store/         # State management
│   └── types/         # TypeScript types
│
├── src/server/
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth, error handling
│   └── config/        # Database config
│
└── prisma/
    └── schema.prisma  # Database schema
```

## Key Features Locations

### Frontend Pages
- **Dashboard**: `client/src/pages/Dashboard.tsx`
- **Projects**: `client/src/pages/projects/`
- **Tasks**: `client/src/pages/tasks/`
- **Teams**: `client/src/pages/teams/`
- **Members**: `client/src/pages/members/`
- **Analytics**: `client/src/pages/Analytics.tsx`
- **Onboarding**: `client/src/pages/onboarding/`
- **Offboarding**: `client/src/pages/offboarding/`

### Backend Routes
- **Auth**: `src/server/routes/auth.routes.ts`
- **Projects**: `src/server/routes/project.routes.ts`
- **Tasks**: `src/server/routes/task.routes.ts`
- **Teams**: `src/server/routes/team.routes.ts`
- **Users**: `src/server/routes/user.routes.ts`
- **Analytics**: `src/server/routes/analytics.routes.ts`

## Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### Database Connection Error
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify database exists: `psql -l`

### Prisma Client Not Found
```powershell
npm run prisma:generate
```

### Module Not Found Errors
```powershell
# Backend
npm install

# Frontend
cd client
npm install
```

## Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes to:**
   - Database: Update `prisma/schema.prisma` → Run `npm run prisma:migrate`
   - Backend: Add/modify routes in `src/server/routes/`
   - Frontend: Add/modify components in `client/src/`

3. **Test your changes**
   ```powershell
   npm run dev
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

## API Testing

Use tools like:
- **Postman**: Import the base URL `http://localhost:5000/api`
- **Thunder Client** (VS Code Extension)
- **curl** or PowerShell

Example API call:
```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@inorg.com","password":"admin123"}'

# Use token
$token = $response.token
Invoke-RestMethod -Uri "http://localhost:5000/api/projects" `
  -Headers @{"Authorization"="Bearer $token"}
```

## Performance Tips

- Use React DevTools to debug component renders
- Monitor database queries in Prisma Studio
- Check Network tab for API response times
- Enable React.StrictMode for development checks

## Next Steps

1. ✅ Complete initial setup
2. ✅ Seed database with sample data
3. ✅ Login and explore the dashboard
4. 🔜 Customize departments for your organization
5. 🔜 Add team members
6. 🔜 Create your first project
7. 🔜 Assign tasks to team members
8. 🔜 Track progress in analytics

## Need Help?

- 📖 Check `README.md` for detailed documentation
- 🐛 Report issues on GitHub
- 💬 Review code comments in source files
- 🔍 Search existing issues and discussions

---

**Happy Building! 🚀**
