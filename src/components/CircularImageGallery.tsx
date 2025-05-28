'use client';

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import './CircularImageGallery.css';
import { FloatingNav } from '@/components/ui/floating-navbar';

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

  const [currentImageDetails, setCurrentImageDetails] = useState<ProjectDetails>(
    sampleProjectData[0]
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
    const gallery = galleryRef.current;
    const previewImage = previewImageRef.current;
    const bgText = backgroundTextRef.current;
    const previewImgContainer = previewImgContainerRef.current;
    const descriptionText = descriptionTextRef.current;

    if (!gallery || !previewImage || !bgText || !previewImgContainer || !descriptionText) return;

    itemsRef.current = gallery.querySelectorAll('.item') as NodeListOf<HTMLDivElement>;
    const items = itemsRef.current;
    if (items.length === 0) return;

    const numberOfItems = items.length;
    angleIncrementRef.current = 360 / numberOfItems;
    const angleIncrement = angleIncrementRef.current;

    gsap.set(items, { 
      y: window.innerHeight / 2,
      rotationY: 90,
      rotationZ: (idx: number) => idx * angleIncrement - 90 + 180,
      scale: 0.5,
      opacity: 0,
      transformOrigin: '50% 400px'
    });
    gsap.set(bgText, { color: '#000000', opacity: 1 });
    gsap.set(previewImgContainer, { opacity: 0 });
    gsap.set(descriptionText, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(items, {
      y: 0,
      scale: 1,
      opacity: 1,
      rotationZ: (idx: number) => idx * angleIncrement - 90,
      duration: 1.2,
      stagger: 0.03,
      delay: 0.5
    })
    .to(bgText, { color: 'rgba(0, 0, 0, 0.12)', duration: 0.8 }, "<0.0")
    .to(previewImgContainer, { opacity: 1, duration: 0.5 }, ">-0.3")
    .to(descriptionText, { opacity: 1, duration: 0.5 }, ">");

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
      tl.kill();
    };
  }, [galleryItemsData, setCurrentImageDetails, scrollToItem]);

  const navItems = [
    { name: "Projects", link: "/projects" },
    { name: "Contact Us", link: "/contact" },
    { name: "Make Your Own Projects", link: "/make-your-own" },
  ];

  return (
    <>
      <FloatingNav navItems={navItems} />

      <div className="background-text" ref={backgroundTextRef}>
        Micro
        <br />
        Projects
      </div>

      <div className="preview-img" ref={previewImgContainerRef}>
        <img ref={previewImageRef} src="/assets/img1.jpg" alt="Preview" />
      </div>

      <div className="image-specific-text" ref={descriptionTextRef}>
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
              <a href="/projects" target="_blank" rel="noopener noreferrer">Click here to view all projects</a>
            </p>
          </>
        )}
      </div>

      <div className="standalone-explore-button-container">
        <a href="/projects" className="standalone-explore-button" target="_blank" rel="noopener noreferrer">
          Explore More Projects
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