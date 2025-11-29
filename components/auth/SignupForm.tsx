// components/auth/SignupForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '@/lib/constant';
import { CheckCircle2, AlertCircle, User, Mail, Phone, Lock } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STAFF,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({
          type: 'error',
          message: data.error || 'Signup failed. Please try again.',
        });
        return;
      }

      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setAlert({
        type: 'success',
        message: 'Account created successfully! Redirecting...',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Alert Messages */}
      {alert && (
        <Alert
          variant={alert.type === 'error' ? 'destructive' : 'default'}
          className={
            alert.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-400'
              : 'bg-red-900/30 border-red-700 text-red-400'
          }
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-gray-300">
            First Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={isLoading}
              className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-400">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-gray-300">
            Last Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={isLoading}
              className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-red-400">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="email"
            type="email"
            placeholder="staff@hotelhippobuck.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={isLoading}
            className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
          />
        </div>
        {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-gray-300">
          Phone Number <span className="text-gray-500">(Optional)</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="phone"
            type="tel"
            placeholder="+254 712 345 678"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={isLoading}
            className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${
              errors.phone ? 'border-red-500' : ''
            }`}
          />
        </div>
        {errors.phone && <p className="text-sm text-red-400">{errors.phone}</p>}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-gray-300">
          Role
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleChange('role', value)}
          disabled={isLoading}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:ring-blue-500">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
            <SelectItem value={UserRole.STAFF}>Staff</SelectItem>
            <SelectItem value={UserRole.HOUSEKEEPING}>Housekeeping</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-sm text-red-400">{errors.role}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isLoading}
            className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${
              errors.password ? 'border-red-500' : ''
            }`}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-300">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            disabled={isLoading}
            className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-400">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <input
          id="terms"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
        />
        <Label
          htmlFor="terms"
          className="text-sm text-gray-300 font-normal leading-relaxed"
        >
          I agree to the{' '}
          <a href="#" className="text-blue-500 hover:text-blue-400 underline">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-500 hover:text-blue-400 underline">
            Privacy Policy
          </a>
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};