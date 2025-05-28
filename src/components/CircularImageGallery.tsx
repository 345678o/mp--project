'use client';

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
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

// Moved updateActiveContent outside useEffect and made it a standalone function
const updateActiveContentState = (
  index: number,
  items: NodeListOf<HTMLDivElement> | null,
  previewImage: HTMLImageElement | null,
  activeItemIndexRef: React.MutableRefObject<number>,
  setCurrentImageDescription: React.Dispatch<React.SetStateAction<string>>
) => {
  activeItemIndexRef.current = index;
  if (items && items[index]) {
    const itemImage = items[index].querySelector('img');
    if (itemImage && previewImage) {
      previewImage.src = itemImage.src;
    }
  }
  setCurrentImageDescription(sampleImageTexts[index % NUM_UNIQUE_IMAGES]);
};

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

  const scrollToItem = useCallback((index: number) => {
    if (!itemsRef.current || itemsRef.current.length === 0 || !scrollTriggerInstanceRef.current) return;

    updateActiveContentState(
      index,
      itemsRef.current, 
      previewImageRef.current, 
      activeItemIndexRef,
      setCurrentImageDescription
    );

    const itemInitialAngle = index * angleIncrementRef.current - 90;
    // Target angle is 270 (bottom of the circle)
    const requiredRotationProgress = (270 - itemInitialAngle + 360 * 5) % 360; // Add multiples of 360 to ensure positive result and shortest path
    const scrollProgressTarget = requiredRotationProgress / 360;

    gsap.to(window, {
      scrollTo: {
        y: scrollTriggerInstanceRef.current.start + (scrollTriggerInstanceRef.current.end - scrollTriggerInstanceRef.current.start) * scrollProgressTarget,
        autoKill: true
      },
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        ScrollTrigger.refresh(); // Refresh ScrollTrigger to ensure its internal state is up-to-date
      }
    });
  }, [setCurrentImageDescription]);

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

    // Local reference for updateActiveContent to be used inside useEffect callbacks
    const updateContentForEffect = (index: number) => {
        updateActiveContentState(
            index, 
            items, 
            previewImage, 
            activeItemIndexRef, 
            setCurrentImageDescription
        );
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
        updateContentForEffect(index); // Use the local version
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

      // Add click listener to each item
      item.addEventListener('click', () => {
        scrollToItem(index);
      });
    });

    scrollTriggerInstanceRef.current = ScrollTrigger.create({
      trigger: 'body', // Ensure this trigger is appropriate for your layout
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const rotationProgress = self.progress * 360 * 1; // Adjust multiplier for rotation speed/direction if needed
        let newActiveIndex = 0;
        let minAngleDiff = 360;

        items.forEach((itemElement, idx) => {
          const currentAngle = (idx * angleIncrement - 90 + rotationProgress);
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

        if (activeItemIndexRef.current !== newActiveIndex) {
             updateContentForEffect(newActiveIndex);
        }
      },
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        scrollToItem((activeItemIndexRef.current + 1) % items.length);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        scrollToItem((activeItemIndexRef.current - 1 + items.length) % items.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    updateContentForEffect(0);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      if (scrollTriggerInstanceRef.current) {
        scrollTriggerInstanceRef.current.kill();
      }
      items.forEach(item => {
        gsap.killTweensOf(item);
        // It's good practice to remove event listeners here, especially if items can be re-rendered
        // However, since these items are static within this component's lifecycle and get cleaned up,
        // we might not strictly need to remove individual mouseover/mouseout/click here if performance isn't an issue.
        // For robustness: item.removeEventListener('mouseover', ...); item.removeEventListener('mouseout', ...); item.removeEventListener('click', ...);
      });
      if (gallery) gsap.killTweensOf(gallery);
    };
  }, [galleryItemsData, setCurrentImageDescription, scrollToItem]);

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