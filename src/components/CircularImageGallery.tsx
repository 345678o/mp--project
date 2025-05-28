'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import './CircularImageGallery.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const NUM_ITEMS = 150;
const NUM_UNIQUE_IMAGES = 15;

// Updated sample texts for each unique image for more variety
const sampleImageTexts = [
  "Exploring the Andromeda Galaxy - a vast expanse of stars and cosmic wonders.",
  "The Art of Bonsai: Cultivating miniature trees, a tradition from ancient Japan.",
  "Architectural Marvels: A look into the sustainable designs of tomorrow.",
  "Deep Sea Creatures: Unveiling the mysteries lurking in the ocean's abyss.",
  "Culinary Journeys: Tasting the unique flavors of street food from around the world.",
  "Vintage Automobiles: Celebrating the timeless elegance of classic car designs.",
  "Abstract Digital Art: Where algorithms and creativity meet to form new visuals.",
  "The Serenity of Nature: Capturing a peaceful moment by a mountain lakeside vista.",
  "Urban Exploration: Discovering hidden gems in the bustling cityscapes.",
  "Innovations in Robotics: How AI is shaping the future of automated assistance.",
  "Wildlife Photography: A close encounter with a majestic Siberian tiger in its habitat.",
  "Horology & Timepieces: The intricate mechanics behind a luxury Swiss watch.",
  "Adventures in Paragliding: Soaring above picturesque valleys and mountains.",
  "The World of Microscopic Organisms: A hidden universe teeming with life.",
  "Ancient Civilizations: Unearthing the secrets of the Egyptian pyramids."
];

const CircularImageGallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const activeItemIndexRef = useRef<number>(0);
  const itemsRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const angleIncrementRef = useRef<number>(0);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  const [currentImageDescription, setCurrentImageDescription] = useState<string>(
    sampleImageTexts[0] // Initial text for the first image
  );

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

    const updateActiveContent = (index: number) => {
      activeItemIndexRef.current = index;
      const itemImage = items[index]?.querySelector('img');
      if (itemImage && previewImage) {
        previewImage.src = itemImage.src;
      }
      setCurrentImageDescription(sampleImageTexts[index % NUM_UNIQUE_IMAGES]);
    };

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

      item.addEventListener('mouseover', () => {
        updateActiveContent(index);
        gsap.to(item, {
          x: 10, z: 10, y: 10,
          ease: 'power2.out', duration: 0.5,
        });
      });

      item.addEventListener('mouseout', () => {
        gsap.to(item, {
          x: 0, y: 0, z: 0,
          ease: 'power2.out', duration: 0.5,
        });
      });
    });

    scrollTriggerInstanceRef.current = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const rotationProgress = self.progress * 360 * 1;
        let newActiveIndex = 0;
        let minAngleDiff = 360;

        items.forEach((itemElement, idx) => {
          const currentAngle = (idx * angleIncrement - 90 + rotationProgress);
          // Use gsap.set for direct manipulation tied to scrub
          gsap.set(itemElement, { rotationZ: currentAngle });

          const targetAngle = 270; // Angle considered "front-most"
          const normalizedCurrentAngle = (currentAngle % 360 + 360) % 360;
          let angleDiff = Math.abs(normalizedCurrentAngle - targetAngle);
          angleDiff = Math.min(angleDiff, 360 - angleDiff);

          if (angleDiff < minAngleDiff) {
            minAngleDiff = angleDiff;
            newActiveIndex = idx;
          }
        });
        // Update content only if the active index has actually changed via scroll logic
        if (activeItemIndexRef.current !== newActiveIndex) {
             updateActiveContent(newActiveIndex);
        }
      },
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!itemsRef.current || itemsRef.current.length === 0 || !scrollTriggerInstanceRef.current) return;
      
      const numItems = itemsRef.current.length;
      let newIndex = activeItemIndexRef.current;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        newIndex = (activeItemIndexRef.current + 1) % numItems;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        newIndex = (activeItemIndexRef.current - 1 + numItems) % numItems;
      }

      if (newIndex !== activeItemIndexRef.current) {
        updateActiveContent(newIndex);

        const itemInitialAngle = newIndex * angleIncrementRef.current - 90;
        const requiredRotationProgress = (270 - itemInitialAngle + 360 * 5) % 360;
        const scrollProgressTarget = requiredRotationProgress / 360;

        gsap.to(window, {
            scrollTo: {
                y: scrollTriggerInstanceRef.current.start + (scrollTriggerInstanceRef.current.end - scrollTriggerInstanceRef.current.start) * scrollProgressTarget,
                autoKill: true
            },
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
                // After scroll, ensure ScrollTrigger updates its internal progress if necessary
                ScrollTrigger.refresh();
            }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Set initial content
    updateActiveContent(0);

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
      <div className="background-text">
        Micro
        <br />
        Projects
      </div>
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

      <div className="image-specific-text">
        <p>{currentImageDescription}</p>
      </div>

      <div className="container">
        <div ref={galleryRef} className="gallery">
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