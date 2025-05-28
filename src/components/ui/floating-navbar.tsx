'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react'; // Explicit import for JSX type
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import './floating-navbar.css'; // We will create this CSS file

interface NavItem {
  name: string;
  link: string;
  icon?: JSX.Element; // Made icon optional
}

interface FloatingNavProps {
  navItems: NavItem[];
  className?: string;
}

export const FloatingNav = ({
  navItems,
  className,
}: FloatingNavProps) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true); // Default to true to be initially visible
  const lastScrollY = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", () => {
    const currentScrollYVal = scrollYProgress.get();
    if (typeof currentScrollYVal === "number" && typeof lastScrollY.current === "number") {
      const direction = currentScrollYVal - lastScrollY.current;

      if (currentScrollYVal < 0.05) { // Show if near the top
        setVisible(true);
      } else {
        if (direction < 0) { // Scrolling up
          setVisible(true);
        } else { // Scrolling down
          setVisible(false);
          setIsMobileMenuOpen(false); // Close mobile menu on scroll down
        }
      }
      lastScrollY.current = currentScrollYVal;
    }
  });

  // Effect to ensure navbar is visible when at the very top initially or after full scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) { // Adjust threshold as needed
        setVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    // Added a fixed wrapper for centering
    <div className="floating-nav-centering-wrapper">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{
            opacity: 1,
            y: 0,
          }}
          animate={{
            y: visible ? 0 : -120,
            opacity: visible ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className={`floating-nav-base ${className || ''} ${isMobileView ? 'mobile' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
        >
          {isMobileView && (
            <button className="hamburger-menu" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <span />
              <span />
              <span />
            </button>
          )}
          
          {(!isMobileView || isMobileMenuOpen) && (
            <div className={`nav-items-container ${isMobileView ? 'mobile-nav-items' : 'desktop-nav-items'}`}>
              {navItems.map((navItem: NavItem, idx: number) => (
                <a
                  key={`link=${idx}`}
                  href={navItem.link}
                  className={`nav-item-base ${navItem.icon ? 'has-icon' : ''}`}
                  onClick={() => isMobileView && setIsMobileMenuOpen(false)} // Close menu on item click
                >
                  {navItem.icon && <span className="nav-icon-wrapper">{navItem.icon}</span>}
                  <span className="nav-text-wrapper">{navItem.name}</span>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 