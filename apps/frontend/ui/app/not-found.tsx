'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg"
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </div>
    </main>
  );
}