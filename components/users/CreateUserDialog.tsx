// app/admin/users/components/CreateUserDialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

interface NewUserForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
}

interface CreateUserDialogProps {
  onUserCreated: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function CreateUserDialog({
  onUserCreated,
  onError,
  onSuccess,
}: CreateUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [newUser, setNewUser] = useState<NewUserForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'STAFF',
    isActive: true,
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      onSuccess(`User ${newUser.firstName} ${newUser.lastName} created successfully!`);

      // Reset form
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'STAFF',
        isActive: true,
      });

      setIsOpen(false);
      onUserCreated();
    } catch (error: any) {
      onError(error.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-5 h-5 mr-2" />
            Add New User
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md max-h-[90vh] overflow-y-auto shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">First Name *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="bg-gray-50 border-gray-300 text-gray-900 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-600">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newUser.isActive}
                onChange={(e) => setNewUser({ ...newUser, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isActive" className="text-sm text-gray-700">
                Activate account immediately
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={formLoading}
              >
                {formLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
}