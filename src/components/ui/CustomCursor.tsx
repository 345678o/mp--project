'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CustomCursor.css'; // We'll create this CSS file

const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;

    if (!dot || !ring) return;

    const onMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      gsap.to(dot, {
        x: clientX,
        y: clientY,
        duration: 0.1, // Faster update for the dot
        ease: 'power2.out',
      });
      gsap.to(ring, {
        x: clientX,
        y: clientY,
        duration: 0.3, // Slower update for the ring, creating the trail effect
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Hide default cursor when component mounts and custom cursor is active
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      // Restore default cursor when component unmounts
      document.body.style.cursor = 'auto';
      if (dot) gsap.killTweensOf(dot);
      if (ring) gsap.killTweensOf(ring);
    };
  }, []);

  return (
    <>
      <div ref={cursorDotRef} className="custom-cursor-dot"></div>
      <div ref={cursorRingRef} className="custom-cursor-ring"></div>
    </>
  );
};

export default CustomCursor; 