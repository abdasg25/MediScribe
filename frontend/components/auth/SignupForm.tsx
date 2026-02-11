'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { UserCreate } from '@/types/user';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';

export default function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserCreate & { confirmPassword: string }>();

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
      
      // Show user-friendly error message
      const errorMessage = err.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(errorMessage);
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
          })}
        />

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
