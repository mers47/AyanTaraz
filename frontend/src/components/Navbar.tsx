'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiPhone, FiUser, FiHome, FiFileText, FiFile, FiCalendar, FiInfo, FiMail } from 'react-icons/fi';

const navLinks = [
  { href: '/', label: 'Home', icon: <FiHome className="w-5 h-5" /> },
  { href: '/services', label: 'Services', icon: <FiFileText className="w-5 h-5" /> },
  { href: '/articles', label: 'Articles', icon: <FiFileText className="w-5 h-5" /> },
  { href: '/tax-assistant', label: 'Tax Assistant', icon: <FiFile className="w-5 h-5" /> },
  { href: '/consultation', label: 'Consultation', icon: <FiCalendar className="w-5 h-5" /> },
  { href: '/about', label: 'About', icon: <FiInfo className="w-5 h-5" /> },
  { href: '/contact', label: 'Contact', icon: <FiMail className="w-5 h-5" /> },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className={`navbar ${isScrolled ? 'bg-opacity-95' : 'bg-opacity-80'}`}>
      <div className="navbar-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="navbar-brand">
            <span className="text-xl font-bold text-gold-400">Ayan Taraz</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${pathname === link.href ? 'text-gold-400' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="navbar-link">
              <FiUser className="w-5 h-5 inline mr-1" />
              Login
            </Link>
            <Link href="/contact" className="btn btn-outline">
              <FiPhone className="w-4 h-4 inline mr-1" />
              Contact
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="navbar-toggle"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mobile-menu-link ${pathname === link.href ? 'text-gold-400 bg-gray-800' : ''}`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="divider" />
              <Link href="/login" className="mobile-menu-link">
                <FiUser className="w-5 h-5 inline mr-3" />
                Login
              </Link>
              <Link href="/contact" className="mobile-menu-link">
                <FiPhone className="w-5 h-5 inline mr-3" />
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
