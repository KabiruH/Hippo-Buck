// app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Users as UsersIcon } from 'lucide-react';
import { UserStats } from '@/components/users/UserStats';
import { UserFilters } from '@/components/users/UserFilters';
import { UserCard } from '@/components/users/UserCard';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';

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

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/admin/users';
      const params = new URLSearchParams();

      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }
      if (filterStatus !== 'all') {
        params.append('isActive', filterStatus);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUserRole(data.user.role);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleApprove = async (userId: string, userName: string) => {
    if (!confirm(`Approve account for ${userName}?`)) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      setAlert({
        type: 'success',
        message: `${userName}'s account has been approved!`,
      });
      fetchUsers();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to approve user',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!confirm(`Reject and delete account for ${userName}? This cannot be undone.`)) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject user');
      }

      setAlert({
        type: 'success',
        message: `${userName}'s account has been rejected and deleted.`,
      });
      fetchUsers();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to reject user',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    adminCount: users.filter((u) => u.role === 'ADMIN').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              User <span className="text-amber-500">Management</span>
            </h1>
            <p className="text-gray-400">Manage staff accounts and permissions</p>
          </div>

          <CreateUserDialog
            onUserCreated={fetchUsers}
            onError={(message) => setAlert({ type: 'error', message })}
            onSuccess={(message) => setAlert({ type: 'success', message })}
          />
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            variant={alert.type === 'error' ? 'destructive' : 'default'}
            className={`mb-6 ${alert.type === 'success'
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-red-900/30 border-red-700 text-red-400'
              }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <UserStats {...stats} />

        {/* Filters */}
        <UserFilters
          filterRole={filterRole}
          filterStatus={filterStatus}
          onRoleChange={setFilterRole}
          onStatusChange={setFilterStatus}
        />

        {/* Users List */}
        {users.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
            <p className="text-gray-400">No users match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onApprove={handleApprove}
                onReject={handleReject}
                onUserUpdated={fetchUsers} // Your function to refresh the user list
                isLoading={actionLoading === user.id}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}