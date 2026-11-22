import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError('');
    try {
      const res = await authService.login(data);
      if (res.success && res.data) {
        login(res.data);
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setApiError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center pt-28 pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-lg border border-stone-200 shadow-md overflow-hidden p-8 sm:p-10"
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-md">
            <div className="w-8 h-8 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L21 21H17L12 11L7 21H3L12 3Z" fill="currentColor"/>
              </svg>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
            Welcome home.
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Sign in to view saved properties and manage your account.
          </p>
        </div>

        {/* Error Callout */}
        {apiError && (
          <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                {...registerField('email')}
                className={`w-full pl-10 pr-4 py-3 rounded-md border text-xs font-semibold text-stone-800 focus:outline-none transition-all ${
                  errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-stone-200 bg-stone-50/50 focus:border-[#14532D] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#14532D]'
                }`}
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="login-password" className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...registerField('password')}
                className={`w-full pl-10 pr-10 py-3 rounded-md border text-xs font-semibold text-stone-800 focus:outline-none transition-all ${
                  errors.password ? 'border-rose-500 bg-rose-50/30' : 'border-stone-200 bg-stone-50/50 focus:border-[#14532D] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#14532D]'
                }`}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-sm p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-md bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500 font-medium">
          New to HAVEN?{' '}
          <Link to="/register" className="text-[#14532D] font-bold hover:underline focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs">
            Let's find your place.
          </Link>
        </div>

      </motion.div>
    </div>
  );
};
