import { Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditUserDialog } from './EditUserDialogue';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserCardProps {
  user: User;
  onApprove: (userId: string, userName: string) => void;
  onReject: (userId: string, userName: string) => void;
  onUserUpdated: () => void;
  isLoading: boolean;
  currentUserRole: string;
}

export function UserCard({
  user,
  onApprove,
  onReject,
  onUserUpdated,
  isLoading,
  currentUserRole,
}: UserCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'STAFF':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const userName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{userName}</h3>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
                {user.isActive ? (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-600 ml-15">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              Joined:{' '}
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 md:flex-col lg:flex-row">
          {/* Edit Button - Only for admins and active users */}
          {user.isActive && (
            <EditUserDialog
              user={user}
              onUserUpdated={onUserUpdated}
              currentUserRole={currentUserRole}
            />
          )}

          {/* Approve/Reject Buttons - Only for inactive users */}
          {!user.isActive && (
            <>
              <Button
                onClick={() => onApprove(user.id, userName)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onReject(user.id, userName)}
                disabled={isLoading}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 shadow-sm"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}