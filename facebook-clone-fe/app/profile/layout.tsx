import Header from '@/components/layout/Header';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div>{children}</div>
    </div>
  );
} 