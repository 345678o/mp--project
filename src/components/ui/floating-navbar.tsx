'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion';
import { isLoggedIn, logout } from '../../data/auth';
import './floating-navbar.css';

interface NavItem {
  name: string;
  link?: string;
  icon?: JSX.Element;
  onClick?: () => void;
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
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    setIsUserLoggedIn(isLoggedIn());
  }, []);

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

      if (currentScrollYVal < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
          setIsMobileMenuOpen(false);
        }
      }
      lastScrollY.current = currentScrollYVal;
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItemsWithAuth = [
    ...navItems,
    isUserLoggedIn 
      ? { name: 'Logout', onClick: logout }
      : { name: 'Mentor Login', link: '/mentors/login' }
  ];

  return (
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
              {navItemsWithAuth.map((navItem: NavItem, idx: number) => (
                navItem.onClick ? (
                  <button
                    key={`button-${idx}`}
                    onClick={() => {
                      navItem.onClick?.();
                      if (isMobileView) setIsMobileMenuOpen(false);
                    }}
                    className={`nav-item-base ${navItem.icon ? 'has-icon' : ''}`}
                  >
                    {navItem.icon && <span className="nav-icon-wrapper">{navItem.icon}</span>}
                    <span className="nav-text-wrapper">{navItem.name}</span>
                  </button>
                ) : (
                  <a
                    key={`link-${idx}`}
                    href={navItem.link}
                    className={`nav-item-base ${navItem.icon ? 'has-icon' : ''}`}
                    onClick={() => {
                      if (isMobileView) setIsMobileMenuOpen(false);
                    }}
                  >
                    {navItem.icon && <span className="nav-icon-wrapper">{navItem.icon}</span>}
                    <span className="nav-text-wrapper">{navItem.name}</span>
                  </a>
                )
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 