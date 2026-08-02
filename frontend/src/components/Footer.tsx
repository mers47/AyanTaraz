'use client';

import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiLinkedin } from 'react-icons/fi';

const footerLinks = {
  services: [
    { href: '/services/tax-consultation', label: 'Tax Consultation' },
    { href: '/services/accounting', label: 'Accounting Services' },
    { href: '/services/audit', label: 'Audit Services' },
    { href: '/services/consultation', label: 'Business Consultation' },
  ],
  resources: [
    { href: '/articles', label: 'Articles' },
    { href: '/videos', label: 'Videos' },
    { href: '/mini-books', label: 'Mini Books' },
    { href: '/tax-assistant', label: 'Tax Assistant' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Our Team' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com/ayantaraz', icon: <FiFacebook className="w-5 h-5" />, label: 'Facebook' },
  { href: 'https://instagram.com/ayantaraz', icon: <FiInstagram className="w-5 h-5" />, label: 'Instagram' },
  { href: 'https://twitter.com/ayantaraz', icon: <FiTwitter className="w-5 h-5" />, label: 'Twitter' },
  { href: 'https://linkedin.com/company/ayantaraz', icon: <FiLinkedin className="w-5 h-5" />, label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">Ayan Taraz</h3>
            <p className="text-gray-400 mb-4">
              Professional Accounting & Tax Advisory Services
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <FiPhone className="w-5 h-5 mr-3 text-gold-400" />
                <span>+98 (21) 1234 5678</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FiMail className="w-5 h-5 mr-3 text-gold-400" />
                <span>info@ayantaraz.ir</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FiMapPin className="w-5 h-5 mr-3 text-gold-400" />
                <span>Tehran, Iran</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Services</h3>
            <ul>
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h3 className="footer-title">Resources</h3>
            <ul>
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h3 className="footer-title">Company</h3>
            <ul>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="footer-text mb-4 md:mb-0">
              © {new Date().getFullYear()} Ayan Taraz. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gold-400 transition-colors duration-200"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                {footerLinks.legal.map((link) => (
                  <Link key={link.href} href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
