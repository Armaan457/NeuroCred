"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import '../Login/LoginForm.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await apiService.requestPasswordReset({ email });
      setMessage(res.message || 'If an account with that email exists, a password reset link has been sent.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request password reset';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-container w-full max-w-md">
        <h2>Reset Password</h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we will send you a link to reset your password.
        </p>

        {error && <div className="error-message">{error}</div>}
        {message && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? <div className="spinner" /> : 'Send Reset Link'}
          </motion.button>
        </form>

        <p className="toggle-form">
          Remember your password?{' '}
          <span onClick={() => router.push('/Login')} className="toggle-link">
            Back to Sign In
          </span>
        </p>
      </div>
    </motion.div>
  );
}
