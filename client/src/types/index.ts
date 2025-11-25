export type Role = 'ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'MEMBER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'OFFBOARDING';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type OnboardingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type OffboardingStatus = 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role: Role;
  status?: UserStatus;
  skills?: string[];
  bio?: string;
  joinDate?: string;
  lastActive?: string;
  department?: Department;
  departmentId?: string;
  teamMemberships?: TeamMember[];
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  users?: User[];
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  department?: Department;
  departmentId?: string;
  members?: User[];
  projects?: Project[];
}

export interface TeamMember {
  id: string;
  role: 'LEAD' | 'MEMBER' | 'CONTRIBUTOR';
  user: User;
  team: Team;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  progress: number;
  creator: User;
  department?: Department;
  team?: Team;
  tasks?: Task[];
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  project: Project;
  assignee?: User;
  creator: User;
  tags: string[];
  attachments: string[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  user?: User;
  project?: Project;
  task?: Task;
  metadata?: any;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  type?: 'PDF' | 'DOC' | 'SPREADSHEET' | 'IMAGE' | 'VIDEO' | 'OTHER';
  project?: Project;
  uploadedBy?: User;
  uploadedAt: string;
  createdAt?: string;
}

export interface Onboarding {
  id: string;
  user: User;
  status: OnboardingStatus;
  checklistItems: Array<{ id: number; title: string; completed: boolean }>;
  assignedBuddy?: string;
  startDate: string;
  completedDate?: string;
  notes?: string;
}

export interface Offboarding {
  id: string;
  user: User;
  status: OffboardingStatus;
  reason?: string;
  lastWorkingDay: string;
  checklistItems: Array<{ id: number; title: string; completed: boolean }>;
  exitInterviewCompleted: boolean;
  assetsReturned: boolean;
  accessRevoked: boolean;
  notes?: string;
  completedDate?: string;
}

export interface OnboardingProcess {
  id: string;
  user?: User;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: string;
  completedDate?: string;
  checklistItems?: Array<{ id: number; title: string; completed: boolean }>;
  assignedBuddy?: string;
  notes?: string;
  createdAt?: string;
}

export interface OffboardingProcess {
  id: string;
  user?: User;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: string;
  lastWorkingDay?: string;
  reason?: string;
  completedDate?: string;
  checklistItems?: Array<{ id: number; title: string; completed: boolean }>;
  notes?: string;
  exitInterviewCompleted?: boolean;
  assetsReturned?: boolean;
  accessRevoked?: boolean;
  createdAt?: string;
}
