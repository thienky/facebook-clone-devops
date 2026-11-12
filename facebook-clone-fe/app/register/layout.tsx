import '../globals.css';

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
} 