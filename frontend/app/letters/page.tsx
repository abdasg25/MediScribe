'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/shared/Header';
import Card from '@/components/shared/Card';

export default function LettersPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Letters</h1>
        
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>Letters list will be implemented in Phase 3</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
