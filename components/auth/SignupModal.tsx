// components/auth/SignupModal.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignupForm } from './SignupForm';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center mb-4">
            {/* Hotel Logo Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <DialogTitle className="text-3xl font-bold text-white">
              Join <span className="text-amber-500">Hotel Hippo Buck</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create your staff account to get started
            </DialogDescription>
          </div>
        </DialogHeader>

        <SignupForm onSuccess={onClose} />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
          >
            Sign in to your account →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};