import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

