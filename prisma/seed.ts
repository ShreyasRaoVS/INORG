import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create Departments
  console.log('Creating departments...');
  const engineering = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: {
      name: 'Engineering',
      description: 'Software development and engineering',
      color: '#3B82F6',
      icon: '💻',
    },
  });

  const marketing = await prisma.department.upsert({
    where: { name: 'Marketing' },
    update: {},
    create: {
      name: 'Marketing',
      description: 'Marketing and communications',
      color: '#EF4444',
      icon: '📢',
    },
  });

  const sales = await prisma.department.upsert({
    where: { name: 'Sales' },
    update: {},
    create: {
      name: 'Sales',
      description: 'Sales and business development',
      color: '#10B981',
      icon: '💰',
    },
  });

  const hr = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'HR and people operations',
      color: '#8B5CF6',
      icon: '👥',
    },
  });

  const operations = await prisma.department.upsert({
    where: { name: 'Operations' },
    update: {},
    create: {
      name: 'Operations',
      description: 'Operations and logistics',
      color: '#F59E0B',
      icon: '⚙️',
    },
  });

  console.log('✓ Departments created\n');

  // Create Admin User
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inorg.com' },
    update: {},
    create: {
      email: 'admin@inorg.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: hr.id,
      skills: ['Management', 'Leadership', 'Strategic Planning', 'HR Operations'],
      bio: 'Chief Administrative Officer with 15 years of experience in organizational management.',
      phone: '+1 (555) 001-0001',
    },
  });

  console.log('✓ Admin user created');
  console.log('  Email: admin@inorg.com');
  console.log('  Password: admin123');
  console.log('  Role: ADMIN (Full System Access)\n');

  // Create Manager Users
  console.log('Creating manager users...');
  
  const engineeringManager = await prisma.user.upsert({
    where: { email: 'manager.eng@inorg.com' },
    update: {},
    create: {
      email: 'manager.eng@inorg.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'John',
      lastName: 'Martinez',
      role: 'MANAGER',
      status: 'ACTIVE',
      departmentId: engineering.id,
      skills: ['Project Management', 'Agile', 'Team Leadership', 'Software Architecture'],
      bio: 'Engineering Manager leading the core development team.',
      phone: '+1 (555) 002-0002',
    },
  });

  const salesManager = await prisma.user.upsert({
    where: { email: 'manager.sales@inorg.com' },
    update: {},
    create: {
      email: 'manager.sales@inorg.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'Emily',
      lastName: 'Thompson',
      role: 'MANAGER',
      status: 'ACTIVE',
      departmentId: sales.id,
      skills: ['Sales Strategy', 'Client Relations', 'Team Management', 'Revenue Growth'],
      bio: 'Sales Manager driving business development and client acquisition.',
      phone: '+1 (555) 003-0003',
    },
  });

  const marketingManager = await prisma.user.upsert({
    where: { email: 'manager.marketing@inorg.com' },
    update: {},
    create: {
      email: 'manager.marketing@inorg.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'David',
      lastName: 'Chen',
      role: 'MANAGER',
      status: 'ACTIVE',
      departmentId: marketing.id,
      skills: ['Digital Marketing', 'Brand Strategy', 'Content Creation', 'Analytics'],
      bio: 'Marketing Manager specializing in digital transformation and brand growth.',
      phone: '+1 (555) 004-0004',
    },
  });

  console.log('✓ Manager users created (3)');
  console.log('  Email: manager.eng@inorg.com / manager.sales@inorg.com / manager.marketing@inorg.com');
  console.log('  Password: manager123');
  console.log('  Role: MANAGER (Team & Project Management)\n');

  // Create Regular User Employees
  console.log('Creating employee users...');

  const seniorDev = await prisma.user.upsert({
    where: { email: 'dev.senior@inorg.com' },
    update: {},
    create: {
      email: 'dev.senior@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Jane',
      lastName: 'Anderson',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: engineering.id,
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      bio: 'Senior Full-Stack Developer with expertise in modern web technologies.',
      phone: '+1 (555) 101-0001',
    },
  });

  const juniorDev = await prisma.user.upsert({
    where: { email: 'dev.junior@inorg.com' },
    update: {},
    create: {
      email: 'dev.junior@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Alex',
      lastName: 'Rivera',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: engineering.id,
      skills: ['TypeScript', 'React', 'Git', 'REST APIs'],
      bio: 'Junior Developer eager to learn and contribute to innovative projects.',
      phone: '+1 (555) 102-0002',
    },
  });

  const uxDesigner = await prisma.user.upsert({
    where: { email: 'designer@inorg.com' },
    update: {},
    create: {
      email: 'designer@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Sophie',
      lastName: 'Williams',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: engineering.id,
      skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping'],
      bio: 'UX Designer creating intuitive and beautiful user experiences.',
      phone: '+1 (555) 103-0003',
    },
  });

  const salesRep = await prisma.user.upsert({
    where: { email: 'sales.rep@inorg.com' },
    update: {},
    create: {
      email: 'sales.rep@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: sales.id,
      skills: ['B2B Sales', 'CRM', 'Negotiation', 'Client Relations'],
      bio: 'Sales Representative focused on building lasting client relationships.',
      phone: '+1 (555) 201-0001',
    },
  });

  const marketingSpec = await prisma.user.upsert({
    where: { email: 'marketing.specialist@inorg.com' },
    update: {},
    create: {
      email: 'marketing.specialist@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Lisa',
      lastName: 'Garcia',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: marketing.id,
      skills: ['Social Media', 'Content Writing', 'SEO', 'Campaign Management'],
      bio: 'Marketing Specialist driving engagement through creative campaigns.',
      phone: '+1 (555) 202-0002',
    },
  });

  const hrCoordinator = await prisma.user.upsert({
    where: { email: 'hr.coordinator@inorg.com' },
    update: {},
    create: {
      email: 'hr.coordinator@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Rachel',
      lastName: 'Kim',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: hr.id,
      skills: ['Recruitment', 'Employee Relations', 'Compliance', 'Training'],
      bio: 'HR Coordinator supporting employee growth and organizational development.',
      phone: '+1 (555) 301-0001',
    },
  });

  const opsAnalyst = await prisma.user.upsert({
    where: { email: 'ops.analyst@inorg.com' },
    update: {},
    create: {
      email: 'ops.analyst@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Daniel',
      lastName: 'O\'Connor',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: operations.id,
      skills: ['Data Analysis', 'Process Optimization', 'Excel', 'Reporting'],
      bio: 'Operations Analyst improving efficiency through data-driven insights.',
      phone: '+1 (555) 401-0001',
    },
  });

  const intern = await prisma.user.upsert({
    where: { email: 'intern@inorg.com' },
    update: {},
    create: {
      email: 'intern@inorg.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Emma',
      lastName: 'Taylor',
      role: 'MEMBER',
      status: 'ACTIVE',
      departmentId: engineering.id,
      skills: ['Python', 'JavaScript', 'Learning'],
      bio: 'Engineering Intern gaining hands-on experience in software development.',
      phone: '+1 (555) 501-0001',
    },
  });

  console.log('✓ Employee users created (8)');
  console.log('  Password for all: user123');
  console.log('  Role: USER (Standard Employee Access)\n');

  // Create Sample Team
  console.log('Creating sample team...');
  const team = await prisma.team.create({
    data: {
      name: 'Engineering Team Alpha',
      description: 'Core product development team',
      departmentId: engineering.id,
      members: {
        create: [
          {
            userId: engineeringManager.id,
            role: 'LEAD',
          },
          {
            userId: seniorDev.id,
            role: 'MEMBER',
          },
          {
            userId: juniorDev.id,
            role: 'MEMBER',
          },
          {
            userId: uxDesigner.id,
            role: 'MEMBER',
          },
        ],
      },
    },
  });

  console.log('✓ Team created\n');

  // Create Sample Project
  console.log('Creating sample project...');
  const project = await prisma.project.create({
    data: {
      name: 'INORG Platform Development',
      description: 'Building the employee management system',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 65,
      startDate: new Date('2024-01-01'),
      deadline: new Date('2024-12-31'),
      creatorId: admin.id,
      teamId: team.id,
      departmentId: engineering.id,
      tasks: {
        create: [
          {
            title: 'Setup Project Infrastructure',
            description: 'Initialize project structure and dependencies',
            status: 'COMPLETED',
            priority: 'HIGH',
            creatorId: admin.id,
            assigneeId: seniorDev.id,
            tags: ['setup', 'infrastructure'],
            completedAt: new Date(),
          },
          {
            title: 'Implement Authentication',
            description: 'Build JWT-based authentication system',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            creatorId: engineeringManager.id,
            assigneeId: seniorDev.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            tags: ['auth', 'security'],
          },
          {
            title: 'Design Dashboard UI',
            description: 'Create responsive dashboard interface',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            creatorId: engineeringManager.id,
            assigneeId: uxDesigner.id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            tags: ['ui', 'design'],
          },
          {
            title: 'Build REST API Endpoints',
            description: 'Develop backend API for client integration',
            status: 'TODO',
            priority: 'HIGH',
            creatorId: engineeringManager.id,
            assigneeId: juniorDev.id,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            tags: ['backend', 'api'],
          },
        ],
      },
    },
  });

  console.log('✓ Sample project created\n');

  // Create Additional Projects
  console.log('Creating additional projects...');
  
  const salesProject = await prisma.project.create({
    data: {
      name: 'Q4 Sales Campaign',
      description: 'Launch comprehensive sales campaign for Q4',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 45,
      startDate: new Date('2024-10-01'),
      deadline: new Date('2024-12-31'),
      creatorId: salesManager.id,
      departmentId: sales.id,
    },
  });

  const marketingProject = await prisma.project.create({
    data: {
      name: 'Brand Redesign Initiative',
      description: 'Complete brand refresh and marketing materials update',
      status: 'PLANNING',
      priority: 'MEDIUM',
      progress: 15,
      startDate: new Date('2024-11-01'),
      deadline: new Date('2025-02-28'),
      creatorId: marketingManager.id,
      departmentId: marketing.id,
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build native mobile applications for iOS and Android',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      progress: 30,
      startDate: new Date('2024-09-01'),
      deadline: new Date('2025-01-31'),
      creatorId: engineeringManager.id,
      teamId: team.id,
      departmentId: engineering.id,
    },
  });

  console.log('✓ Additional projects created\n');

  // Create More Tasks
  console.log('Creating additional tasks...');
  
  await prisma.task.createMany({
    data: [
      // Sales tasks
      {
        title: 'Prepare Sales Presentation',
        description: 'Create compelling sales deck for enterprise clients',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: salesProject.id,
        creatorId: salesManager.id,
        assigneeId: salesRep.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['sales', 'presentation'],
      },
      {
        title: 'Contact Potential Leads',
        description: 'Reach out to 50 qualified leads from the database',
        status: 'TODO',
        priority: 'HIGH',
        projectId: salesProject.id,
        creatorId: salesManager.id,
        assigneeId: salesRep.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['outreach', 'leads'],
      },
      // Marketing tasks
      {
        title: 'Social Media Content Calendar',
        description: 'Plan content for next month across all platforms',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: marketingProject.id,
        creatorId: marketingManager.id,
        assigneeId: marketingSpec.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['social-media', 'content'],
      },
      {
        title: 'Update Company Website',
        description: 'Refresh homepage with new brand guidelines',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: marketingProject.id,
        creatorId: marketingManager.id,
        assigneeId: marketingSpec.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        tags: ['website', 'branding'],
      },
      // Mobile app tasks
      {
        title: 'iOS App UI Design',
        description: 'Design mobile interface for iOS application',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        projectId: mobileProject.id,
        creatorId: engineeringManager.id,
        assigneeId: uxDesigner.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tags: ['ios', 'design', 'mobile'],
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure automated build and deployment',
        status: 'TODO',
        priority: 'HIGH',
        projectId: mobileProject.id,
        creatorId: engineeringManager.id,
        assigneeId: seniorDev.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['devops', 'automation'],
      },
      {
        title: 'Write API Documentation',
        description: 'Document all REST API endpoints',
        status: 'BLOCKED',
        priority: 'MEDIUM',
        projectId: project.id,
        creatorId: engineeringManager.id,
        assigneeId: juniorDev.id,
        tags: ['documentation', 'api'],
      },
      {
        title: 'Code Review Sprint',
        description: 'Review pull requests from last sprint',
        status: 'COMPLETED',
        priority: 'HIGH',
        projectId: project.id,
        creatorId: engineeringManager.id,
        assigneeId: seniorDev.id,
        tags: ['review', 'quality'],
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✓ Additional tasks created\n');

  // Create Additional Teams
  console.log('Creating additional teams...');
  
  const salesTeam = await prisma.team.create({
    data: {
      name: 'Sales Team',
      description: 'Business development and sales',
      departmentId: sales.id,
      members: {
        create: [
          { userId: salesManager.id, role: 'LEAD' },
          { userId: salesRep.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const marketingTeam = await prisma.team.create({
    data: {
      name: 'Marketing Team',
      description: 'Brand and digital marketing',
      departmentId: marketing.id,
      members: {
        create: [
          { userId: marketingManager.id, role: 'LEAD' },
          { userId: marketingSpec.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✓ Additional teams created\n');

  // Create Documents
  console.log('Creating sample documents...');
  
  await prisma.document.createMany({
    data: [
      {
        name: 'Employee Handbook 2024',
        fileName: 'employee-handbook-2024.pdf',
        filePath: '/uploads/employee-handbook-2024.pdf',
        fileSize: 2456789,
        mimeType: 'application/pdf',
        type: 'PDF',
        uploaderId: admin.id,
      },
      {
        name: 'Project Requirements Document',
        fileName: 'project-requirements.docx',
        filePath: '/uploads/project-requirements.docx',
        fileSize: 156789,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        type: 'DOC',
        projectId: project.id,
        uploaderId: engineeringManager.id,
      },
      {
        name: 'Q4 Sales Report',
        fileName: 'q4-sales-report.xlsx',
        filePath: '/uploads/q4-sales-report.xlsx',
        fileSize: 89456,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        type: 'SPREADSHEET',
        projectId: salesProject.id,
        uploaderId: salesManager.id,
      },
      {
        name: 'Brand Guidelines',
        fileName: 'brand-guidelines.pdf',
        filePath: '/uploads/brand-guidelines.pdf',
        fileSize: 5678901,
        mimeType: 'application/pdf',
        type: 'PDF',
        projectId: marketingProject.id,
        uploaderId: marketingManager.id,
      },
      {
        name: 'UI Mockups',
        fileName: 'ui-mockups.png',
        filePath: '/uploads/ui-mockups.png',
        fileSize: 3456789,
        mimeType: 'image/png',
        type: 'IMAGE',
        projectId: mobileProject.id,
        uploaderId: uxDesigner.id,
      },
    ],
  });

  console.log('✓ Sample documents created\n');

  // Create Notifications
  console.log('Creating sample notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Implement Authentication"',
        userId: seniorDev.id,
        read: false,
      },
      {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Design Dashboard UI"',
        userId: uxDesigner.id,
        read: false,
      },
      {
        type: 'DEADLINE_REMINDER',
        title: 'Upcoming Deadline',
        message: 'Task "Prepare Sales Presentation" is due in 5 days',
        userId: salesRep.id,
        read: false,
      },
      {
        type: 'PROJECT_UPDATED',
        title: 'Project Progress Updated',
        message: 'INORG Platform Development is now 65% complete',
        userId: engineeringManager.id,
        read: true,
      },
      {
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        message: 'Code Review Sprint has been marked as completed',
        userId: engineeringManager.id,
        read: false,
      },
    ],
  });

  console.log('✓ Sample notifications created\n');

  // Create Activity Logs
  console.log('Creating activity logs...');
  await prisma.activity.createMany({
    data: [
      {
        type: 'PROJECT_CREATED',
        description: `Project "${project.name}" was created`,
        userId: admin.id,
        projectId: project.id,
      },
      {
        type: 'PROJECT_CREATED',
        description: `Project "${salesProject.name}" was created`,
        userId: salesManager.id,
        projectId: salesProject.id,
      },
      {
        type: 'PROJECT_CREATED',
        description: `Project "${marketingProject.name}" was created`,
        userId: marketingManager.id,
        projectId: marketingProject.id,
      },
      {
        type: 'TASK_CREATED',
        description: 'New task "Setup Project Infrastructure" was created',
        userId: admin.id,
        projectId: project.id,
      },
      {
        type: 'TASK_COMPLETED',
        description: 'Task "Code Review Sprint" was completed',
        userId: seniorDev.id,
        projectId: project.id,
      },
      {
        type: 'MEMBER_ADDED',
        description: `${seniorDev.firstName} ${seniorDev.lastName} joined Engineering Team Alpha`,
        userId: engineeringManager.id,
      },
      {
        type: 'DOCUMENT_UPLOADED',
        description: 'Employee Handbook 2024 was uploaded',
        userId: admin.id,
      },
    ],
  });

  console.log('✓ Activity logs created\n');

  // Create Company Banner
  console.log('Creating company banner...');
  
  await prisma.companyBanner.create({
    data: {
      title: 'Welcome to INORG',
      content: 'We are excited to have you on board! Check out our new employee handbook and training materials.',
      type: 'announcement',
      isActive: true,
      priority: 1,
    },
  });

  console.log('✓ Company banner created\n');

  // Create Sample Onboarding Processes
  console.log('Creating onboarding processes...');
  
  await prisma.onboarding.createMany({
    data: [
      {
        userId: intern.id,
        status: 'IN_PROGRESS',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        assignedBuddy: seniorDev.id,
        checklistItems: [
          { id: 1, title: 'Complete personal profile', completed: true },
          { id: 2, title: 'Review company policies', completed: true },
          { id: 3, title: 'Setup workstation', completed: true },
          { id: 4, title: 'Meet team members', completed: false },
          { id: 5, title: 'Access granted to systems', completed: false },
          { id: 6, title: 'First week training completed', completed: false },
        ],
        notes: 'Emma is progressing well. She has completed the initial setup and is getting familiar with the codebase.',
      },
      {
        userId: juniorDev.id,
        status: 'COMPLETED',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        assignedBuddy: seniorDev.id,
        checklistItems: [
          { id: 1, title: 'Complete personal profile', completed: true },
          { id: 2, title: 'Review company policies', completed: true },
          { id: 3, title: 'Setup workstation', completed: true },
          { id: 4, title: 'Meet team members', completed: true },
          { id: 5, title: 'Access granted to systems', completed: true },
          { id: 6, title: 'First week training completed', completed: true },
        ],
        notes: 'Alex completed onboarding successfully and is now fully integrated into the team.',
      },
    ],
  });

  console.log('✓ Onboarding processes created\n');

  // Create Sample Offboarding Process
  console.log('Creating offboarding process...');
  
  await prisma.offboarding.create({
    data: {
      userId: opsAnalyst.id,
      status: 'IN_PROGRESS',
      reason: 'Resignation',
      lastWorkingDay: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      checklistItems: [
        { id: 1, title: 'Exit interview scheduled', completed: true },
        { id: 2, title: 'Knowledge transfer completed', completed: true },
        { id: 3, title: 'Return company assets', completed: false },
        { id: 4, title: 'Revoke system access', completed: false },
        { id: 5, title: 'Clear pending tasks', completed: false },
        { id: 6, title: 'Final payroll processed', completed: false },
      ],
      exitInterviewCompleted: true,
      assetsReturned: false,
      accessRevoked: false,
      notes: 'Daniel is moving to another company. Exit interview completed. Knowledge transfer in progress.',
    },
  });

  console.log('✓ Offboarding process created\n');

  console.log('✅ Seeding completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 LOGIN CREDENTIALS BY ROLE:\n');
  console.log('🔴 ADMIN (Full System Access):');
  console.log('   Email: admin@inorg.com');
  console.log('   Password: admin123');
  console.log('   Name: Sarah Mitchell (HR Department)');
  console.log('   Access: All features, user management, system settings\n');
  console.log('🟡 MANAGERS (Team & Project Management):');
  console.log('   Email: manager.eng@inorg.com');
  console.log('   Password: manager123');
  console.log('   Name: John Martinez (Engineering)\n');
  console.log('   Email: manager.sales@inorg.com');
  console.log('   Password: manager123');
  console.log('   Name: Emily Thompson (Sales)\n');
  console.log('   Email: manager.marketing@inorg.com');
  console.log('   Password: manager123');
  console.log('   Name: David Chen (Marketing)');
  console.log('   Access: Team oversight, project management, task assignment\n');
  console.log('🟢 USERS (Standard Employees):');
  console.log('   Email: dev.senior@inorg.com');
  console.log('   Name: Jane Anderson (Senior Developer)\n');
  console.log('   Email: dev.junior@inorg.com');
  console.log('   Name: Alex Rivera (Junior Developer)\n');
  console.log('   Email: designer@inorg.com');
  console.log('   Name: Sophie Williams (UX Designer)\n');
  console.log('   Email: sales.rep@inorg.com');
  console.log('   Name: Michael Brown (Sales Rep)\n');
  console.log('   Email: marketing.specialist@inorg.com');
  console.log('   Name: Lisa Garcia (Marketing Specialist)\n');
  console.log('   Email: hr.coordinator@inorg.com');
  console.log('   Name: Rachel Kim (HR Coordinator)\n');
  console.log('   Email: ops.analyst@inorg.com');
  console.log('   Name: Daniel O\'Connor (Operations Analyst)\n');
  console.log('   Email: intern@inorg.com');
  console.log('   Name: Emma Taylor (Engineering Intern)');
  console.log('   Password for all: user123');
  console.log('   Access: Personal tasks, assigned projects, team collaboration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 TIP: Try logging in with different roles to see');
  console.log('    how the dashboard adapts to each hierarchy level!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
