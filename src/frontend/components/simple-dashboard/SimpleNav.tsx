import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function SimpleNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  const links = [
    { href: '/dashboard', label: 'Главная' },
    { href: '/buy', label: 'Купить' },
    { href: '/purchases', label: 'Мои покупки' },
    { href: '/claim', label: 'Забрать' }
  ];

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-8 py-4">
        <div className="flex gap-8 justify-center">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
                currentPath === link.href
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
