"use client"

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import '../Login/LoginForm.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Reset token is required');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.resetPassword({
        token,
        new_password: newPassword,
      });
      setMessage(res.message || 'Password successfully updated.');
      setTimeout(() => {
        router.push('/Login');
      }, 2500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container w-full max-w-md">
      <h2>New Password</h2>
      <p className="text-gray-600 mb-6 text-center">
        Enter your reset token and your new password below.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
          {message} Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!tokenFromUrl && (
          <div className="form-group">
            <input
              type="text"
              name="token"
              placeholder="Reset Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            placeholder="New Password"
            className="pr-12"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <div className="form-group">
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <motion.button
          type="submit"
          className="submit-button"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? <div className="spinner" /> : 'Confirm Reset'}
        </motion.button>
      </form>

      <p className="toggle-form">
        Back to{' '}
        <span onClick={() => router.push('/Login')} className="toggle-link">
          Sign In
        </span>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<div className="spinner" />}>
        <ResetPasswordForm />
      </Suspense>
    </motion.div>
  );
}
