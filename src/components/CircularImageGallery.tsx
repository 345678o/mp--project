'use client';

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
// Removed Helix import from 'ldrs/react'
import './CircularImageGallery.css';
import { FloatingNav } from '@/components/ui/floating-navbar';
import CustomCursor from '@/components/ui/CustomCursor';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const NUM_ITEMS = 150;
const NUM_UNIQUE_IMAGES = 15;

// Updated sample data for each unique image
const sampleProjectData = [
  {
    title: "Andromeda's Wonders",
    description: "Exploring the Andromeda Galaxy - a vast expanse of stars and cosmic wonders beyond imagination.",
    link: "/projects/andromeda",
    stats: "Viewers: 1.2M | Likes: 300K"
  },
  {
    title: "The Art of Bonsai",
    description: "Cultivating miniature trees, a tradition from ancient Japan requiring patience and artistry.",
    link: "/projects/bonsai",
    stats: "Followers: 50K | Rating: 4.8/5"
  },
  {
    title: "Future Architecture",
    description: "A look into the sustainable and breathtaking architectural designs of tomorrow.",
    link: "/projects/architecture",
    stats: "Designs: 100+ | Innovators: 25"
  },
  {
    title: "Deep Sea Mysteries",
    description: "Unveiling the strange and beautiful creatures lurking in the ocean's darkest abyss.",
    link: "/projects/deep-sea",
    stats: "Species: 200+ | Depth: 8km"
  },
  {
    title: "Global Street Food",
    description: "Tasting the unique and vibrant flavors of street food from bustling cities around the world.",
    link: "/projects/street-food",
    stats: "Countries: 30+ | Recipes: 500+"
  },
  {
    title: "Vintage Car Elegance",
    description: "Celebrating the timeless beauty and engineering marvels of classic automobile designs.",
    link: "/projects/vintage-cars",
    stats: "Models: 75+ | Era: 1920-1970"
  },
  {
    title: "Digital Abstract Art",
    description: "Where complex algorithms and human creativity meet to form stunning new visual experiences.",
    link: "/projects/digital-art",
    stats: "Artists: 50+ | Pieces: 1000+"
  },
  {
    title: "Serene Lakeside Vistas",
    description: "Capturing a peaceful and awe-inspiring moment by a tranquil mountain lakeside vista.",
    link: "/projects/lakeside",
    stats: "Locations: 10+ | Photographers: 15"
  },
  {
    title: "Urban Hidden Gems",
    description: "Discovering the secret spots and untold stories hidden within bustling cityscapes.",
    link: "/projects/urban-gems",
    stats: "Cities: 20+ | Secrets: 200+"
  },
  {
    title: "Robotics & AI Future",
    description: "How artificial intelligence is shaping the future of automated assistance and daily life.",
    link: "/projects/robotics-ai",
    stats: "Innovations: 300+ | Labs: 40+"
  },
  {
    title: "Siberian Tiger Encounter",
    description: "A breathtaking close encounter with a majestic Siberian tiger in its natural habitat.",
    link: "/projects/siberian-tiger",
    stats: "Sightings: 12 | Cubs: 3"
  },
  {
    title: "Luxury Swiss Horology",
    description: "The intricate and fascinating mechanics behind a high-end luxury Swiss timepiece.",
    link: "/projects/swiss-watch",
    stats: "Brands: 10+ | Parts: 500+"
  },
  {
    title: "Valley Paragliding",
    description: "Soaring like a bird above picturesque valleys, mountains, and serene landscapes.",
    link: "/projects/paragliding",
    stats: "Flights: 1000+ | Heights: 2km"
  },
  {
    title: "Microscopic Universe",
    description: "A hidden universe teeming with diverse and fascinating life, invisible to the naked eye.",
    link: "/projects/microscopic",
    stats: "Organisms: 1M+ | Discoveries: 50+"
  },
  {
    title: "Egyptian Pyramid Secrets",
    description: "Unearthing the ancient secrets, history, and engineering marvels of the Egyptian pyramids.",
    link: "/projects/pyramids",
    stats: "Dynasties: 30+ | Artifacts: 10K+"
  }
];

interface ProjectDetails {
  title: string;
  description: string;
  link: string;
  stats: string;
}

const updateActiveContentState = (
  index: number,
  items: NodeListOf<HTMLDivElement> | null,
  previewImage: HTMLImageElement | null,
  activeItemIndexRef: React.MutableRefObject<number>,
  setCurrentImageDetails: React.Dispatch<React.SetStateAction<ProjectDetails>>
) => {
  activeItemIndexRef.current = index;
  if (items && items[index]) {
    const itemImage = items[index].querySelector('img');
    if (itemImage && previewImage) {
      previewImage.src = itemImage.src;
    }
  }
  setCurrentImageDetails(sampleProjectData[index % NUM_UNIQUE_IMAGES]);
};

const CircularImageGallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const activeItemIndexRef = useRef<number>(0);
  const itemsRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const angleIncrementRef = useRef<number>(0);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);
  const backgroundTextRef = useRef<HTMLDivElement>(null);
  const previewImgContainerRef = useRef<HTMLDivElement>(null);
  const descriptionTextRef = useRef<HTMLDivElement>(null);
  const floatingNavRef = useRef<HTMLDivElement>(null);
  const exploreButtonContainerRef = useRef<HTMLDivElement>(null);

  const [showLoader, setShowLoader] = useState(true);
  const [isClientMounted, setIsClientMounted] = useState(false);

  const [currentImageDetails, setCurrentImageDetails] = useState<ProjectDetails>(
    sampleProjectData[0]
  );

  const galleryItemsData = useMemo(() => {
    return Array.from({ length: NUM_ITEMS }, (_, i) => ({
      id: i,
      imgSrc: `/assets/img${(i % NUM_UNIQUE_IMAGES) + 1}.jpg`,
    }));
  }, []);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (isClientMounted) {
      setShowLoader(false);
    }
  }, [isClientMounted]);

  const scrollToItem = useCallback((index: number) => {
    if (!itemsRef.current || itemsRef.current.length === 0 || !scrollTriggerInstanceRef.current) return;

    updateActiveContentState(
      index,
      itemsRef.current, 
      previewImageRef.current, 
      activeItemIndexRef,
      setCurrentImageDetails
    );

    const itemInitialAngle = index * angleIncrementRef.current - 90;
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
        ScrollTrigger.refresh();
      }
    });
  }, [setCurrentImageDetails]);

  useEffect(() => {
    if (!isClientMounted || showLoader) {
      return;
    }

    const gallery = galleryRef.current;
    const previewImage = previewImageRef.current;
    const bgText = backgroundTextRef.current;
    const previewImgContainer = previewImgContainerRef.current;
    const descriptionText = descriptionTextRef.current;
    const navElement = floatingNavRef.current;
    const exploreButtonContainer = exploreButtonContainerRef.current;

    if (!gallery || !previewImage || !bgText || !previewImgContainer || !descriptionText || !navElement || !exploreButtonContainer) {
      console.error('CircularImageGallery: A critical ref is missing when expected to be present.', {
        gallery, previewImage, bgText, previewImgContainer, descriptionText, navElement, exploreButtonContainer
      });
      return;
    }

    itemsRef.current = gallery.querySelectorAll('.item') as NodeListOf<HTMLDivElement>;
    const items = itemsRef.current;
    if (items.length === 0) {
      console.error('CircularImageGallery: No items found when expected.');
      return;
    }

    const numberOfItems = items.length;
    angleIncrementRef.current = 360 / numberOfItems;
    const angleIncrement = angleIncrementRef.current;
    
    const isMobile = window.innerWidth <= 768;
    const itemTransformOrigin = isMobile ? '50% 336px' : '50% 320px';

    gsap.set(items, { 
      y: window.innerHeight / 2,
      rotationY: 90,
      rotationZ: (idx: number) => idx * angleIncrement - 90 + 180,
      scale: 0.5,
      opacity: 0,
      transformOrigin: itemTransformOrigin 
    });
    gsap.set(bgText, { color: '#000000', opacity: 1 });
    gsap.set(previewImgContainer, { opacity: 0 });
    gsap.set(descriptionText, { opacity: 0 });
    gsap.set(navElement, { y: -100, opacity: 0 });
    gsap.set(exploreButtonContainer, { y: 100, opacity: 0 });

    const tl = gsap.timeline({ 
      defaults: { ease: "power3.out" },
      delay: 0.1,
    });

    // 1. Micro Projects Text Fade (slower, with EaseIn)
    const textFadeDuration = 1.5;
    tl.to(bgText, { 
        color: 'rgba(0, 0, 0, 0.12)', 
        duration: textFadeDuration,
        ease: "power1.in"
    });

    // 2. Image Spiral Animation (starts after MP text fade completes)
    const itemAnimationDuration = 0.4;
    tl.to(items, {
      y: 0,
      scale: 1,
      opacity: 1,
      rotationZ: (idx: number) => idx * angleIncrement - 90,
      duration: itemAnimationDuration,
      stagger: 0.015,
    }, ">");

    // 3. Preview Image (starts after spiral completes)
    const previewFadeDuration = 0.4;
    tl.to(previewImgContainer, { 
        opacity: 1, 
        duration: previewFadeDuration 
    }, ">");

    // 4. Description Text (starts after preview image finishes)
    const descriptionFadeDuration = 0.4;
    tl.to(descriptionText, { 
        opacity: 1, 
        duration: descriptionFadeDuration 
    }, ">");

    // 5. Navbar and Explore Button (start together, after description text finishes)
    const navAndButtonDuration = 0.4;
    tl.to(navElement, { 
        y: 0, 
        opacity: 1, 
        duration: navAndButtonDuration 
    }, ">");

    tl.to(exploreButtonContainer, { 
        y: 0,
        opacity: 1,
        duration: navAndButtonDuration
    }, "<" );

    const updateContentForEffect = (index: number) => {
        updateActiveContentState(
            index, items, previewImage, activeItemIndexRef, setCurrentImageDetails
        );
    };

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      const rotateXVal = 55 + percentY * 2;
      const rotateYVal = percentX * 2;
      gsap.to(gallery, {
        duration: 1, ease: 'power2.out', rotateX: rotateXVal, rotateY: rotateYVal, overwrite: 'auto',
      });
    };
    document.addEventListener('mousemove', handleMouseMove);

    items.forEach((item, index) => {
      item.addEventListener('mouseover', () => {
        updateContentForEffect(index);
        gsap.to(item, { x: 10, z: 10, y: 10, ease: 'power2.out', duration: 0.5 });
      });
      item.addEventListener('mouseout', () => {
        gsap.to(item, { x: 0, y: 0, z: 0, ease: 'power2.out', duration: 0.5 });
      });
      item.addEventListener('click', () => { scrollToItem(index); });
    });

    scrollTriggerInstanceRef.current = ScrollTrigger.create({
      trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2,
      onUpdate: (self) => {
        const rotationProgress = self.progress * 360 * 1;
        let newActiveIndex = 0;
        let minAngleDiff = 360;
        items.forEach((itemElement, idx) => {
          const targetItemAngle = (idx * angleIncrement - 90 + rotationProgress);
          gsap.set(itemElement, { rotationZ: targetItemAngle });

          const frontTargetAngle = 270;
          const normalizedCurrentAngle = (targetItemAngle % 360 + 360) % 360;
          let angleDiff = Math.abs(normalizedCurrentAngle - frontTargetAngle);
          angleDiff = Math.min(angleDiff, 360 - angleDiff);
          if (angleDiff < minAngleDiff) { minAngleDiff = angleDiff; newActiveIndex = idx; }
        });
        if (activeItemIndexRef.current !== newActiveIndex) { updateContentForEffect(newActiveIndex); }
      },
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!itemsRef.current || itemsRef.current.length === 0) return;
      const len = itemsRef.current.length;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { scrollToItem((activeItemIndexRef.current + 1) % len); }
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { scrollToItem((activeItemIndexRef.current - 1 + len) % len); }
    };
    document.addEventListener('keydown', handleKeyDown);

    updateContentForEffect(0);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      if (scrollTriggerInstanceRef.current) { scrollTriggerInstanceRef.current.kill(); }
      items.forEach(item => { gsap.killTweensOf(item); });
      if (gallery) gsap.killTweensOf(gallery);
      if (bgText) gsap.killTweensOf(bgText);
      if (previewImgContainer) gsap.killTweensOf(previewImgContainer);
      if (descriptionText) gsap.killTweensOf(descriptionText);
      if (navElement) gsap.killTweensOf(navElement);
      if (exploreButtonContainer) gsap.killTweensOf(exploreButtonContainer);
      tl.kill();
    };
  }, [isClientMounted, showLoader, galleryItemsData, setCurrentImageDetails, scrollToItem]);

  const navItems = [
    { name: "Projects", link: "/projects" },
    { name: "Mentors", link: "/mentors" },
    { name: "Resources", link: "/resources" },
    { name: "Contact Us", link: "/contact" },
    { name: "Make Your Own Projects", link: "/make-your-own" },
  ];

  if (!isClientMounted || showLoader) {
    // Note: For web components, ensure Next.js knows this is custom element if issues persist.
    // You might need to declare global { namespace JSX { interface IntrinsicElements { 'l-helix': any; } } }
    // in a .d.ts file if TypeScript complains about <l-helix>.
    return (
      <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'white', /* Changed to white */
          position: 'fixed', 
          top: 0,
          left: 0,
          zIndex: 9999 
        }}>
        {/* Using the web component for the loader */}
        <l-helix size="45" speed="2.5" color="#2563eb"></l-helix> {/* Changed to blue */}
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      <div ref={floatingNavRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <FloatingNav navItems={navItems} />
      </div>

      <div className="background-text" ref={backgroundTextRef}>
        Micro
        <br />
        Projects
      </div>

      <div className="preview-img" ref={previewImgContainerRef}>
        <img ref={previewImageRef} src="/assets/img1.jpg" alt="Preview" />
      </div>

      <div 
        className="image-specific-text" 
        ref={descriptionTextRef} 
        style={showLoader ? { opacity: 0, visibility: 'hidden' } : {}}
      >
        {currentImageDetails && (
          <>
            <h2>
              <a href={currentImageDetails.link} className="project-title-link" target="_blank" rel="noopener noreferrer">
                {currentImageDetails.title}
              </a>
            </h2>
            <p className="description">{currentImageDetails.description}</p>
            <p className="stats">{currentImageDetails.stats}</p>
            <p className="view-project-link-text">
              <a href="/projects" target="_blank" rel="noopener noreferrer">Click here to view the project</a>
            </p>
          </>
        )}
      </div>

      <div className="standalone-explore-button-container" ref={exploreButtonContainerRef}>
        <a href="/projects" className="standalone-explore-button" target="_blank" rel="noopener noreferrer">
          Explore All Projects
        </a>
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