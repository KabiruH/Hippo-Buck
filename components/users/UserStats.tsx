// app/admin/users/components/UserStats.tsx
import { Users, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
}

export function UserStats({ totalUsers, activeUsers, adminCount }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Users */}
      <Card className="bg-linear-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium mb-1">Total Users</p>
              <p className="text-4xl font-bold text-amber-900">{totalUsers}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium mb-1">Active Users</p>
              <p className="text-4xl font-bold text-green-900">{activeUsers}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admins */}
      <Card className="bg-linear-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium mb-1">Admins</p>
              <p className="text-4xl font-bold text-red-900">{adminCount}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}