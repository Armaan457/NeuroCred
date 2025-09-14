"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './OtpVerify.css';

interface OtpVerifyProps {
  email?: string;
  onVerificationSuccess?: (token: string) => void;
}

const OtpVerify: React.FC<OtpVerifyProps> = ({ email: initialEmail, onVerificationSuccess }) => {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from localStorage if not provided as prop
    if (!initialEmail) {
      const signupData = localStorage.getItem('signupData');
      if (signupData) {
        const { email } = JSON.parse(signupData);
        setEmail(email);
      }
    }
  }, [initialEmail]);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validateOTP = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch('http://localhost:1000/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP resent successfully!');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
      } else {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOTP(otp)) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:1000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification successful!');
        if (data.token) {
          localStorage.setItem('token', data.token);
          if (onVerificationSuccess) {
            onVerificationSuccess(data.token);
          }
          // Clear signup data from localStorage
          localStorage.removeItem('signupData');
          // Redirect to dashboard or home page
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <h2>Verify Your Email</h2>
      <p className="email-info">
        Please enter the 6-digit code sent to<br />
        <strong>{email}</strong>
      </p>

      {message && (
        <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) setOtp(value);
            }}
            maxLength={6}
            required
            className="otp-input"
          />
        </div>

        <button 
          type="submit" 
          className="verify-button"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="timer-section">
          {timeLeft > 0 ? (
            <p>Resend OTP in {formatTime(timeLeft)}</p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="resend-button"
              disabled={isLoading || !canResend}
            >
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OtpVerify;