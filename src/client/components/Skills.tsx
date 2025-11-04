import React, { useState, useRef, useEffect } from 'react';
import { FaReact, FaNodeJs, FaAws, FaPython, FaJava, FaDatabase } from 'react-icons/fa';
import { SiTypescript, SiDotnet, SiDjango, SiElasticsearch, SiTailwindcss, SiDocker } from 'react-icons/si';
import { DiScrum, DiGit } from 'react-icons/di';
import '../css/SkillsAnimation.css';
import '../css/LiquidGlass.css';

const skillsData = [
  {
    category: 'Languages & Frameworks',
    items: [
      { name: 'React', icon: <FaReact />, time: '2 years' },
      { name: 'Node.js', icon: <FaNodeJs />, time: '1.5 years' },
      { name: 'TypeScript', icon: <SiTypescript />, time: '2 years' },
      { name: 'C#/.NET', icon: <SiDotnet />, time: '1 year' },
      { name: 'Django', icon: <SiDjango />, time: '1 year' },
      { name: 'Java', icon: <FaJava />, time: '3 years' },
    ],
  },
  {
    category: 'Cloud & DevOps',
    items: [
      { name: 'AWS', icon: <FaAws />, time: '2 years' },
      { name: 'Docker', icon: <SiDocker />, time: '1 year' },
      { name: 'Elasticsearch', icon: <SiElasticsearch />, time: '1 year' },
      { name: 'Git', icon: <DiGit />, time: '3 years' },
      { name: 'Scrum/Agile', icon: <DiScrum />, time: '2 years' },
    ],
  },
  {
    category: 'Data & Databases',
    items: [
      { name: 'SQL', icon: <FaDatabase />, time: '3 years' },
      { name: 'Firebase', icon: <FaDatabase />, time: '1 year' },
      { name: 'BigQuery', icon: <FaDatabase />, time: '1 year' },
      { name: 'Azure', icon: <FaDatabase />, time: '1 year' },
      { name: 'Python', icon: <FaPython />, time: '3 years' },
    ],
  },
  {
    category: 'Design & UI',
    items: [
      { name: 'Tailwind CSS', icon: <SiTailwindcss />, time: '1.5 years' },
      { name: 'Figma', icon: <FaDatabase />, time: '1 year' },
    ],
  },
];

const Skills: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 py-8 w-full h-full flex flex-col justify-center">
      {skillsData.map((categoryData, categoryIndex) => (
        <div key={categoryIndex} className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">{categoryData.category}</h3>
          <SkillCarousel items={categoryData.items} />
        </div>
      ))}
    </div>
  );
};

const SkillCarousel: React.FC<{ items: Array<{ name: string, icon: JSX.Element, time: string }> }> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [translateXValue, setTranslateXValue] = useState(0); // State to hold translateX
  const carouselRef = useRef<HTMLDivElement>(null); // Reference to the carousel
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  useEffect(() => {
    // Calculate initial centering
    setTranslateXValue(calculateTranslateX(currentIndex));
  }, [currentIndex]); // Recalculate when currentIndex changes

  // Auto-rotate every 3 seconds
  useEffect(() => {
    let rotationInterval: NodeJS.Timeout;
    if (isRotating) {
      rotationInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
      }, 3000);
    }

    return () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
      }
    };
  }, [isRotating, items.length]);

  const nextSlide = () => {
    setIsRotating(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    setIsRotating(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const handleCardClick = (index: number) => {
    setIsRotating(false);
    setCurrentIndex(index);
  };

  const calculateTranslateX = (index: number) => {
    const carouselWidth = carouselRef.current?.offsetWidth || 0;
    const itemWidth = 220;
    const centerPosition = (carouselWidth / 2) - (itemWidth / 2);
    return centerPosition - index * itemWidth;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsRotating(false);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX !== null) {
      const dragDistance = e.clientX - dragStartX;

      if (Math.abs(dragDistance) > 150) {
        if (dragDistance > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
        setDragStartX(e.clientX);
      }
    }
  };

  const handleMouseUp = () => {
    setDragStartX(null);
  };

  const handleMouseLeave = () => {
    if (dragStartX !== null) {
      handleMouseUp();
    }
  };

  // Mouse tracking for liquid glass effect
  const handleGlassMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--mouse-x', `${x}%`);
    element.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div
      className="carousel-wrapper relative flex items-center justify-center overflow-hidden"
      style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
    >
      <button 
        onMouseMove={handleGlassMouseMove}
        className="liquid-glass-button prev absolute left-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors shadow-sm"
        style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          borderColor: 'rgba(255, 255, 255, 0.6)' 
        } as React.CSSProperties}
        onClick={prevSlide}
      >
        ‹
      </button>
      <div
        ref={carouselRef}
        className="carousel flex justify-center items-center transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${translateXValue}px)` }} // Apply the calculated translateX
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleCardClick(index)}
            style={{
              transform: `scale(${index === currentIndex ? 1.2 : 0.8})`,
              opacity: `${index === currentIndex ? 1 : 0.5}`,
              transition: dragStartX !== null ? 'none' : 'transform 0.5s, opacity 0.5s',
              margin: '0 10px',
              cursor: 'pointer',
              width: '200px',
            }}
          >
            <div 
              onMouseMove={handleGlassMouseMove}
              className="liquid-glass-card card p-4 flex flex-col items-center shadow-sm transition-all duration-300 ease-out"
              style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                borderColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              } as React.CSSProperties}
            >
              <div className="text-4xl text-gray-700 mb-4">{item.icon}</div>
              <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-600 mt-1">Experience: {item.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button 
        onMouseMove={handleGlassMouseMove}
        className="liquid-glass-button next absolute right-0 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors shadow-sm"
        style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          borderColor: 'rgba(255, 255, 255, 0.6)' 
        } as React.CSSProperties}
        onClick={nextSlide}
      >
        ›
      </button>
    </div>
  );
};

export default Skills;
