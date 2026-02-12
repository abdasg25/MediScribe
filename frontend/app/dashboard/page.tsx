'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUser } from '@/lib/auth';
import Header from '@/components/shared/Header';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Mic, FileText, Clock, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/shared/Toast';

interface DashboardStats {
  total_recordings: number;
  total_letters: number;
  total_transcriptions: number;
  this_week_recordings: number;
  this_week_letters: number;
  estimated_time_saved_hours: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    setUser(getUser());
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await api.get<DashboardStats>('/api/stats/dashboard');
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load dashboard statistics');
      }
    } finally {
      setIsLoadingStats(false);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr. {user.last_name}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your documentation today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recordings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoadingStats ? '...' : stats?.total_recordings || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Letters Generated</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoadingStats ? '...' : stats?.total_letters || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoadingStats ? '...' : `${stats?.estimated_time_saved_hours || 0}h`}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {isLoadingStats ? '...' : stats?.this_week_letters || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/recording">
              <button className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors text-left">
                <Mic className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">New Recording</h3>
                <p className="text-sm text-gray-600">Start recording a new consultation</p>
              </button>
            </Link>

            <Link href="/letters">
              <button className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors text-left">
                <FileText className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Generate Letter</h3>
                <p className="text-sm text-gray-600">Create a new clinical letter</p>
              </button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" description="Your latest recordings and letters">
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">Start by creating a new recording</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
