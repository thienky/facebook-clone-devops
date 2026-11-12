'use client';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      router.replace(`/profile/${user.id}`);
    }
  }, [user, router]);

  return null;
} 