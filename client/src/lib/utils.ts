import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Task Status
    TODO: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    BLOCKED: 'bg-red-100 text-red-700',
    
    // Project Status
    PLANNING: 'bg-gray-100 text-gray-700',
    ON_HOLD: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
    
    // Priority
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
    
    // User Status
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700',
    OFFBOARDING: 'bg-orange-100 text-orange-700',
    
    // Onboarding/Offboarding
    PENDING: 'bg-yellow-100 text-yellow-700',
    INITIATED: 'bg-blue-100 text-blue-700',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    LOW: '⬇️',
    MEDIUM: '➡️',
    HIGH: '⬆️',
    URGENT: '🔥',
  };
  return icons[priority] || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
