'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export default function ScrollNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Change navbar background after scrolling 50px
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/docs', label: 'Documentation' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-2xl px-6 py-3 transition-all duration-300 ${
          scrolled 
            ? 'glass-card shadow-2xl border border-gray-200 dark:border-gray-800' 
            : 'bg-transparent border border-transparent'
        }`}>
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm group-hover:scale-105 transition-transform">
                    PS
                  </div>
                  <span className="font-bold text-lg tracking-tight">PortSmith</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:w-full transition-all duration-300" />
                    </Link>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-3">
                  <ModeToggle />
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>

              {/* Mobile Menu */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="md:hidden overflow-hidden"
                  >
                    <div className="pt-4 pb-2 space-y-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="pt-2 space-y-2">
                        <div className="px-4 py-2 flex items-center justify-between">
                          <span className="text-sm font-medium">Theme</span>
                          <ModeToggle />
                        </div>
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-sm font-medium text-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="block px-4 py-2 text-sm font-medium text-center rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Get Started
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
  );
}
