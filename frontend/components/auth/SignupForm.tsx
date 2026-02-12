'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';
import { setToken, setUser, isAuthenticated } from '@/lib/auth';
import { UserCreate } from '@/types/user';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';

export default function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserCreate & { confirmPassword: string }>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: UserCreate & { confirmPassword: string }) => {
    setIsLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = data;

      // Signup request
      const signupResponse = await api.post('/api/auth/signup', signupData);
      
      // Auto-login after signup
      const loginResponse = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      const { access_token } = loginResponse.data;

      // Store token
      setToken(access_token);

      // Get user info
      const userResponse = await api.get('/api/auth/me');
      setUser(userResponse.data);

      // Show success message
      toast.success('Account created successfully! Welcome to MediScribe.');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Handle validation errors with formatted details
      if (err.response?.data?.formattedDetail) {
        toast.error(err.response.data.formattedDetail);
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors;
        const errorMessages = validationErrors
          .map((e: any) => e.msg?.replace('Value error, ', '') || e.message)
          .join(', ');
        toast.error(errorMessages || 'Please check your input and try again.');
      } else if (err.response?.status === 400) {
        toast.error('This email is already registered. Please use a different email or login.');
      } else if (!err.response) {
        toast.error('Unable to connect to server. Please check your internet connection.');
      } else {
        // Show generic error message
        const errorMessage = err.response?.data?.detail || 'Signup failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
        <p className="text-gray-600 mt-2">Get started with MediScribe</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.first_name?.message}
            {...register('first_name', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
            })}
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.last_name?.message}
            {...register('last_name', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
            })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="doctor@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label="Specialization (Optional)"
          placeholder="e.g., Cardiology, General Practice"
          {...register('specialization')}
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number',
              },
            })}
          />
          <div className="text-xs text-gray-600 space-y-1 mt-1">
            <p className="font-medium">Password requirements:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>At least 8 characters long</li>
              <li>Contains at least one uppercase letter (A-Z)</li>
              <li>Contains at least one lowercase letter (a-z)</li>
              <li>Contains at least one number (0-9)</li>
            </ul>
          </div>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
