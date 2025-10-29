'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-white">
          SOVRYN
        </h1>
        <p className="mb-2 text-xl text-white/70">
          The All-in-One AI Platform
        </p>
        <p className="mb-8 text-sm text-white/50">
          Multi-Model AI • Real-Time Search • Citation-Rich Research
        </p>
        <div className="space-x-4 mb-4">
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="inline-block rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition"
          >
            Sign In
          </Link>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 text-white/50 hover:text-white underline text-sm"
        >
          → Go directly to Dashboard (test)
        </button>
      </div>
    </div>
  );
}
