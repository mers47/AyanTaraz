'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPhone, FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { authApi } from '@/lib/api';
import { User } from '@/types';

// Auth Context (simplified - in production, use a proper context)
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await authApi.getMe();
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (phone: string, code: string) => {
    try {
      const response = await authApi.login(phone, code);
      localStorage.setItem('accessToken', response.data.accessToken);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return { user, isAuthenticated, isLoading, login, logout };
};

// OTP Timer Component
const OTPTimer = ({ seconds }: { seconds: number }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const handleSendOTP = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate phone number
      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }

      const response = await authApi.sendOTP(phone, 'PHONE_VERIFICATION');
      setOtpSent(true);
      setOtpExpiry(300); // 5 minutes
      setStep('otp');
      setSuccess('OTP sent successfully! Check your phone.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!code || code.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }

      const response = await authApi.login(phone, code);
      localStorage.setItem('accessToken', response.data.accessToken);
      setStep('success');
      setSuccess('Login successful! Redirecting...');

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.sendOTP(phone, 'PHONE_VERIFICATION');
      setOtpExpiry(300);
      setSuccess('New OTP sent successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Login Successful!</h2>
            <p className="text-gray-400 mb-4">{success}</p>
            <div className="animate-pulse">
              <div className="h-2 w-full bg-gray-700 rounded-full mb-2" />
              <div className="h-2 w-3/4 bg-gray-600 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="flex items-center text-gold-400 hover:text-gold-300 transition-colors">
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {step === 'phone' ? 'Login' : 'Verify OTP'}
            </h1>
            <p className="text-gray-400">
              {step === 'phone' 
                ? 'Enter your phone number to receive an OTP code'
                : `We've sent an OTP code to ${phone}`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message mb-4">
              <FiAlertCircle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message mb-4">
              <FiCheckCircle className="w-5 h-5 inline mr-2" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 'phone' ? (
              <>
                <div className="mb-4">
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+989123456789"
                      className="input pl-12"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black border-r-transparent" />
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="code" className="label">
                    OTP Code
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="input pl-12 text-center text-xl tracking-widest"
                      required
                    />
                  </div>
                </div>

                {/* OTP Timer */}
                <div className="text-center mb-4">
                  {otpExpiry > 0 ? (
                    <p className="text-gray-400 text-sm">
                      OTP expires in: <OTPTimer seconds={otpExpiry} />
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">OTP expired</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || code.length !== 6}
                  className="btn btn-primary w-full mb-4"
                >
                  {isLoading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black border-r-transparent" />
                  ) : (
                    'Verify & Login'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || otpExpiry > 0}
                    className="text-gray-400 hover:text-gold-400 transition-colors text-sm"
                  >
                    {otpExpiry > 0 ? 'Resend OTP' : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/contact" className="text-gold-400 hover:text-gold-300">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
