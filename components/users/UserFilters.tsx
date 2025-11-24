// app/admin/users/components/UserFilters.tsx
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface UserFiltersProps {
  filterRole: string;
  filterStatus: string;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function UserFilters({
  filterRole,
  filterStatus,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-white mb-2 block">Filter by Role</Label>
            <Select value={filterRole} onValueChange={onRoleChange}>
              <SelectTrigger className="bg-black border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="text-white mb-2 block">Filter by Status</Label>
            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="bg-black border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}