'use client';

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Helix } from 'ldrs/react';
import './CircularImageGallery.css';
import CustomCursor from '@/components/ui/CustomCursor';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const NUM_ITEMS = 150;
const NUM_UNIQUE_IMAGES = 15;

// Updated sample data for each unique image
const sampleProjectData = [
  {
    title: "Upload Your Project",
    description: "Share your amazing work with the community. Upload images, add descriptions, and showcase your skills.",
    link: "/projects/upload",
    stats: "Easy Upload | Community Driven"
  },
  {
    title: "Browse Projects",
    description: "Discover incredible projects created by talented developers from around the world.",
    link: "/projects",
    stats: "Community Projects | Open Source"
  },
  {
    title: "Web Development",
    description: "Modern web applications built with cutting-edge technologies and best practices.",
    link: "/projects",
    stats: "React | Next.js | Node.js"
  },
  {
    title: "Mobile Applications",
    description: "Cross-platform mobile apps that deliver exceptional user experiences.",
    link: "/projects",
    stats: "React Native | Flutter | Swift"
  },
  {
    title: "Data Science Projects",
    description: "Insightful data analysis and machine learning projects that solve real-world problems.",
    link: "/projects",
    stats: "Python | ML | Analytics"
  },
  {
    title: "Creative Coding",
    description: "Artistic and interactive projects that blend technology with creativity.",
    link: "/projects",
    stats: "p5.js | Three.js | WebGL"
  },
  {
    title: "Open Source",
    description: "Community-driven projects that anyone can contribute to and learn from.",
    link: "/projects",
    stats: "GitHub | Collaboration | Learning"
  },
  {
    title: "Full Stack Applications",
    description: "Complete applications with both frontend and backend implementations.",
    link: "/projects",
    stats: "MERN | MEAN | JAMstack"
  },
  {
    title: "API Development",
    description: "RESTful APIs and GraphQL services that power modern applications.",
    link: "/projects",
    stats: "REST | GraphQL | Microservices"
  },
  {
    title: "DevOps Projects",
    description: "Infrastructure and deployment solutions that streamline development workflows.",
    link: "/projects",
    stats: "Docker | CI/CD | Cloud"
  },
  {
    title: "Game Development",
    description: "Interactive games and simulations built with various game engines and frameworks.",
    link: "/projects",
    stats: "Unity | Godot | JavaScript"
  },
  {
    title: "IoT Solutions",
    description: "Internet of Things projects that connect the physical and digital worlds.",
    link: "/projects",
    stats: "Arduino | Raspberry Pi | Sensors"
  },
  {
    title: "AI & Machine Learning",
    description: "Artificial intelligence projects that showcase the power of modern ML techniques.",
    link: "/projects",
    stats: "TensorFlow | PyTorch | NLP"
  },
  {
    title: "Blockchain Projects",
    description: "Decentralized applications and smart contracts built on various blockchain platforms.",
    link: "/projects",
    stats: "Ethereum | Solidity | DeFi"
  },
  {
    title: "Community Showcase",
    description: "Join our growing community of developers and share your passion projects with the world.",
    link: "/projects/upload",
    stats: "Share | Learn | Grow"
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
    const exploreButtonContainer = exploreButtonContainerRef.current;

    if (!gallery || !previewImage || !bgText || !previewImgContainer || !descriptionText || !exploreButtonContainer) {
      console.error('CircularImageGallery: A critical ref is missing when expected to be present.', {
        gallery, previewImage, bgText, previewImgContainer, descriptionText, exploreButtonContainer
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
      if (exploreButtonContainer) gsap.killTweensOf(exploreButtonContainer);
      tl.kill();
    };
  }, [isClientMounted, showLoader, galleryItemsData, setCurrentImageDetails, scrollToItem]);

  if (!isClientMounted || showLoader) {
    // Using the Helix React component for the loader
    return (
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'white',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999
        }}>
        <Helix
          size={45} // Props are passed as numbers/strings
          speed={2.5}
          color="#2563eb"
        />
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      
      <div className="background-text" ref={backgroundTextRef}>
        Project
        <br />
        Showcase
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
              <a href={currentImageDetails.link} target="_blank" rel="noopener noreferrer">Click here to view the project</a>
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