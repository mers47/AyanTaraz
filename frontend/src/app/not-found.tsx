'use client';

import Link from 'next/link';
import { FiAlertTriangle, FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-6">
          <FiAlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            <FiHome className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
          <Link href="/contact" className="btn btn-outline">
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
