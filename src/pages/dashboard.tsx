import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth-context';
import Navbar from '@/components/Navbar';
import QueueSection from '@/components/QueueSection';

export default function Dashboard() {
  const router = useRouter();
  const { user, loja } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl text-white mb-4">
          Bem-vindo à {loja?.replace('_', ' ').toUpperCase()}
        </h1>
        <QueueSection />
      </main>
    </div>
  );
} 