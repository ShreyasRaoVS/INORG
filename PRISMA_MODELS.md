# Database Models Organization

The Prisma schema has been split into separate model files for easier editing and maintenance.

## 📁 Structure

```
prisma/
├── schema.prisma          # Main schema file (consolidated)
└── models/                # Individual model files
    ├── README.md
    ├── user.prisma        # User accounts & auth
    ├── department.prisma  # Departments
    ├── project.prisma     # Projects
    ├── task.prisma        # Tasks
    ├── team.prisma        # Teams & members
    ├── comment.prisma     # Comments
    ├── activity.prisma    # Activity feed
    ├── notification.prisma # Notifications
    ├── document.prisma    # Documents
    ├── chat.prisma        # Real-time chat
    ├── banner.prisma      # Company banners
    └── onboarding.prisma  # Onboarding/Offboarding
```

## ✏️ Editing Models

To edit a specific model:

1. **Open the model file** in `prisma/models/` directory
   - Example: Edit `prisma/models/user.prisma` to modify User model
   
2. **Make your changes** to that specific file

3. **Update main schema** (models are currently duplicated in schema.prisma for Prisma to work)

4. **Generate migration**:
   ```bash
   npx prisma migrate dev --name your_change_description
   ```

5. **Update Prisma Client**:
   ```bash
   npx prisma generate
   ```

## 🎯 Benefits

- ✅ **Organized**: Each model in its own file
- ✅ **Easy to find**: Quickly locate User, Project, Task models
- ✅ **Better diffs**: Git shows changes per model file
- ✅ **Team friendly**: Multiple people can edit different models simultaneously
- ✅ **Clear structure**: Understand relationships at a glance

## 📝 Available Models

| File | Models | Purpose |
|------|--------|---------|
| `user.prisma` | User, Role, UserStatus | User management & authentication |
| `department.prisma` | Department | Organizational structure |
| `project.prisma` | Project, ProjectStatus, Priority | Project tracking |
| `task.prisma` | Task, TaskStatus | Task management |
| `team.prisma` | Team, TeamMember | Team organization |
| `comment.prisma` | Comment | Task comments |
| `activity.prisma` | Activity, ActivityType | Audit trail |
| `notification.prisma` | Notification, NotificationType | User notifications |
| `document.prisma` | Document | File management |
| `chat.prisma` | ChatRoom, ChatRoomMember, Message, MessageStatus | Real-time messaging |
| `banner.prisma` | CompanyBanner | Announcements |
| `onboarding.prisma` | OnboardingProcess, OffboardingProcess | HR processes |

## 🔄 Workflow

```bash
# 1. Edit model file
code prisma/models/user.prisma

# 2. Format schema
npx prisma format

# 3. Create migration
npx prisma migrate dev --name add_user_field

# 4. Generate client
npx prisma generate

# 5. Restart dev server
npm run server:dev
```
