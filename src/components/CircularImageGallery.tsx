'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CircularImageGallery.css';

gsap.registerPlugin(ScrollTrigger);

const NUM_ITEMS = 150;
const NUM_UNIQUE_IMAGES = 15;

const CircularImageGallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const activeItemIndexRef = useRef<number>(0); // To track the active item for keyboard nav
  const itemsRef = useRef<NodeListOf<HTMLDivElement> | null>(null); // To store items for access in keydown handler
  const angleIncrementRef = useRef<number>(0); // To store angleIncrement
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null); // To store ScrollTrigger instance

  // Create an array of item data to be mapped in JSX
  const galleryItemsData = useMemo(() => {
    return Array.from({ length: NUM_ITEMS }, (_, i) => ({
      id: i,
      imgSrc: `/assets/img${(i % NUM_UNIQUE_IMAGES) + 1}.jpg`,
    }));
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    const previewImage = previewImageRef.current;

    if (!gallery || !previewImage) return;

    itemsRef.current = gallery.querySelectorAll('.item') as NodeListOf<HTMLDivElement>;
    const items = itemsRef.current;
    if (items.length === 0) return;

    const numberOfItems = items.length;
    angleIncrementRef.current = 360 / numberOfItems;
    const angleIncrement = angleIncrementRef.current;

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const rotateX = 55 + percentY * 2;
      const rotateY = percentX * 2;

      gsap.to(gallery, {
        duration: 1,
        ease: 'power2.out',
        rotateX: rotateX,
        rotateY: rotateY,
        overwrite: 'auto',
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    items.forEach((item, index) => {
      gsap.set(item, {
        rotationY: 90,
        rotationZ: index * angleIncrement - 90,
        transformOrigin: '50% 400px',
      });

      // Update activeItemIndexRef on mouseover for consistency with keyboard nav
      item.addEventListener('mouseover', () => {
        const imgInsideItem = item.querySelector('img');
        if (imgInsideItem) {
          previewImage.src = imgInsideItem.src;
        }
        activeItemIndexRef.current = index; // Update active index
        gsap.to(item, {
          x: 10,
          z: 10,
          y: 10,
          ease: 'power2.out',
          duration: 0.5,
        });
      });

      item.addEventListener('mouseout', () => {
        // previewImage.src = '/assets/img1.jpg'; // Default preview image - might be overwritten by scroll/key nav immediately
        gsap.to(item, {
          x: 0,
          y: 0,
          z: 0,
          ease: 'power2.out',
          duration: 0.5,
        });
      });
    });

    scrollTriggerInstanceRef.current = ScrollTrigger.create({
      trigger: 'body', // Consider a more specific trigger if body causes issues
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const rotationProgress = self.progress * 360 * 1; // Multiplier for scroll speed effect
        let minAngleDiff = 360; // Max possible angle difference

        items.forEach((item, index) => {
          const currentAngle = (index * angleIncrement - 90 + rotationProgress);
          gsap.to(item, {
            rotationZ: currentAngle,
            duration: 0.5, // Smoother transition for individual items
            ease: 'power1.out',
            overwrite: 'auto',
          });

          // Determine the item closest to the top (270 deg in this setup)
          const targetAngle = 270;
          // Normalize currentAngle to be within [0, 360) for comparison
          const normalizedCurrentAngle = (currentAngle % 360 + 360) % 360;
          let angleDiff = Math.abs(normalizedCurrentAngle - targetAngle);
          angleDiff = Math.min(angleDiff, 360 - angleDiff); // Accounts for cyclical nature

          if (angleDiff < minAngleDiff) {
            minAngleDiff = angleDiff;
            activeItemIndexRef.current = index; // Update active index based on scroll
          }
        });

        const activeItemImage = items[activeItemIndexRef.current]?.querySelector('img');
        if (activeItemImage && previewImage) {
          previewImage.src = activeItemImage.src;
        }
      },
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!itemsRef.current || itemsRef.current.length === 0 || !scrollTriggerInstanceRef.current) return;
      const items = itemsRef.current;
      const numItems = items.length;
      let newActiveIndex = activeItemIndexRef.current;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        newActiveIndex = (activeItemIndexRef.current + 1) % numItems;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        newActiveIndex = (activeItemIndexRef.current - 1 + numItems) % numItems;
      }

      if (newActiveIndex !== activeItemIndexRef.current) {
        activeItemIndexRef.current = newActiveIndex;
        const activeItemImage = items[newActiveIndex]?.querySelector('img');
        if (activeItemImage && previewImageRef.current) {
          previewImageRef.current.src = activeItemImage.src;
        }

        // Optional: Animate gallery to bring the new active item to the front
        // This requires calculating the scroll position that makes the item active.
        // The target rotationZ for an item to be at the top (270deg) is:
        // itemOriginalRotationZ + rotationProgress = 270
        // (newActiveIndex * angleIncrement - 90) + progress * 360 = 270
        // progress * 360 = 270 - (newActiveIndex * angleIncrement - 90)
        // progress = (360 - newActiveIndex * angleIncrement) / 360
        // progress = 1 - (newActiveIndex * angleIncrementRef.current) / 360;
        // This formula might need adjustment based on how rotationProgress maps to visual front.
        // For simplicity, let's calculate the progress needed to make items[newActiveIndex] face front.
        // The desired final rotationZ for items[newActiveIndex] is 270 degrees.
        // Original rotationZ is: newActiveIndex * angleIncrement - 90.
        // Let R = rotationProgress (from scroll, self.progress * 360)
        // newActiveIndex * angleIncrement - 90 + R = 270 (or 270 + k*360)
        // R = 360 - newActiveIndex * angleIncrement (modulo 360)
        // scrollProgress = R / 360
        
        let targetRotation = (360 - (newActiveIndex * angleIncrementRef.current)) % 360;
        if (targetRotation < 0) targetRotation += 360; // ensure positive
        // We need the rotationProgress that makes items[newActiveIndex] be at 270 degrees
        // (newActiveIndex * angleIncrement - 90 + rotationProgressVal) % 360 = 270
        // Let currentItemInitialAngle = newActiveIndex * angleIncrementRef.current - 90;
        // (currentItemInitialAngle + desiredRotationProgress) % 360 = 270;
        // desiredRotationProgress = (270 - currentItemInitialAngle % 360 + 360) % 360;
        // This is the rotation for the *whole gallery*
        // The scrollProgress = desiredRotationProgress / (360 * 1) where 1 is the multiplier

        const itemInitialAngle = newActiveIndex * angleIncrementRef.current - 90;
        const requiredRotationProgress = (270 - itemInitialAngle + 360 * 5) % 360; // Add large multiple of 360 to ensure positive before modulo. Made const.
        
        const scrollProgressTarget = requiredRotationProgress / (360 * 1); // *1 is the multiplier in onUpdate

        // Animate scroll position
        gsap.to(window, {
            scrollTo: {
                y: scrollTriggerInstanceRef.current.start + (scrollTriggerInstanceRef.current.end - scrollTriggerInstanceRef.current.start) * scrollProgressTarget,
            },
            duration: 0.7,
            ease: 'power2.inOut'
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      if (scrollTriggerInstanceRef.current) {
        scrollTriggerInstanceRef.current.kill();
      }
      items.forEach(item => gsap.killTweensOf(item));
      if (gallery) gsap.killTweensOf(gallery);
    };
  }, [galleryItemsData]);

  return (
    <>
      <nav>
        <p>Codegrid &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;14 04 2024</p>
        <p>Subscribe &nbsp;&nbsp;&nbsp Instagram &nbsp;&nbsp;&nbsp Twitter</p>
      </nav>
      <footer>
        <p>Unlock Source Code with PRO</p>
        <p>Link In Description</p>
      </footer>

      <div className="preview-img">
        <img ref={previewImageRef} src="/assets/img1.jpg" alt="Preview" />
      </div>

      <div className="container">
        <div ref={galleryRef} className="gallery">
          {/* Render items using React map */}
          {galleryItemsData.map(itemData => (
            <div key={itemData.id} className="item">
              <img src={itemData.imgSrc} alt={`Image ${itemData.id % NUM_UNIQUE_IMAGES + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CircularImageGallery; 