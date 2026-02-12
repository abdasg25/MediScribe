'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { User, Lock, Save, CheckCircle } from 'lucide-react';
import { isAuthenticated, getUser, setUser as saveUser } from '@/lib/auth';
import Header from '@/components/shared/Header';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';
import api from '@/lib/api';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  specialization?: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
  } = useForm<ProfileFormData>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>();

  const newPassword = watch('new_password');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const currentUser = getUser();
    setUser(currentUser);

    if (currentUser) {
      setValue('first_name', currentUser.first_name);
      setValue('last_name', currentUser.last_name);
      setValue('specialization', currentUser.specialization || '');
    }
  }, [router, setValue]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);

    try {
      const response = await api.put('/api/auth/profile', {
        first_name: data.first_name,
        last_name: data.last_name,
        specialization: data.specialization || null,
      });

      // Update local storage
      saveUser(response.data);
      setUser(response.data);

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);

    try {
      await api.post('/api/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });

      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-600">Update your personal details</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name *"
                    icon={User}
                    placeholder="John"
                    {...registerProfile('first_name', {
                      required: 'First name is required',
                      minLength: {
                        value: 1,
                        message: 'First name must be at least 1 character',
                      },
                    })}
                    error={profileErrors.first_name?.message}
                  />

                  <Input
                    label="Last Name *"
                    icon={User}
                    placeholder="Doe"
                    {...registerProfile('last_name', {
                      required: 'Last name is required',
                      minLength: {
                        value: 1,
                        message: 'Last name must be at least 1 character',
                      },
                    })}
                    error={profileErrors.last_name?.message}
                  />
                </div>

                <Input
                  label="Specialization"
                  placeholder="e.g., Cardiology, General Practice"
                  {...registerProfile('specialization')}
                  error={profileErrors.specialization?.message}
                />

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Password Settings */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-600">Update your password</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  label="Current Password *"
                  type="password"
                  icon={Lock}
                  placeholder="Enter current password"
                  {...registerPassword('current_password', {
                    required: 'Current password is required',
                  })}
                  error={passwordErrors.current_password?.message}
                />

                <Input
                  label="New Password *"
                  type="password"
                  icon={Lock}
                  placeholder="Enter new password"
                  {...registerPassword('new_password', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must include uppercase, lowercase, and number',
                    },
                  })}
                  error={passwordErrors.new_password?.message}
                />

                <Input
                  label="Confirm New Password *"
                  type="password"
                  icon={Lock}
                  placeholder="Confirm new password"
                  {...registerPassword('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  error={passwordErrors.confirm_password?.message}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Password Requirements:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains at least one uppercase letter</li>
                    <li>• Contains at least one lowercase letter</li>
                    <li>• Contains at least one number</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
