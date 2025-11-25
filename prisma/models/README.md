# Database Models

This directory contains the Prisma schema split into separate model files for easier maintenance and editing.

## Model Files

- **user.prisma** - User accounts, authentication, and profiles
- **department.prisma** - Organizational departments
- **project.prisma** - Project management and tracking
- **task.prisma** - Task management and assignments
- **team.prisma** - Teams and team memberships
- **comment.prisma** - Comments on tasks
- **activity.prisma** - Activity feed and audit trail
- **notification.prisma** - User notifications
- **document.prisma** - Document management
- **chat.prisma** - Real-time messaging (ChatRoom, Message, ChatRoomMember)
- **banner.prisma** - Company-wide announcements
- **onboarding.prisma** - Onboarding and offboarding processes

## Usage

All models are consolidated in the main `schema.prisma` file. Edit individual model files here for better organization, then the main schema file contains all definitions.

## Making Changes

1. Edit the model file you need to change
2. Run `npx prisma format` to format the schema
3. Run `npx prisma migrate dev --name your_change_description` to create a migration
4. Run `npx prisma generate` to update the Prisma Client

## Database Structure

The database follows these key relationships:
- Users belong to Departments
- Projects are created by Users and belong to Departments/Teams
- Tasks belong to Projects and are assigned to Users
- Teams have multiple Users through TeamMembers
- ChatRooms have multiple Users through ChatRoomMembers
