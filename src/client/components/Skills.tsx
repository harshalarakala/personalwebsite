import React, { useState, useRef, useEffect } from 'react';
import { FaReact, FaNodeJs, FaAws, FaPython, FaJava, FaDatabase } from 'react-icons/fa';
import { SiTypescript, SiCsharp, SiDjango, SiElasticsearch, SiTailwindcss, SiDocker } from 'react-icons/si';
import { DiScrum, DiGit } from 'react-icons/di';
import '../css/SkillsAnimation.css';

const skillsData = [
  {
    category: 'Languages & Frameworks',
    items: [
      { name: 'React', icon: <FaReact />, time: '2 years' },
      { name: 'Node.js', icon: <FaNodeJs />, time: '1.5 years' },
      { name: 'TypeScript', icon: <SiTypescript />, time: '2 years' },
      { name: 'C#/.NET', icon: <SiCsharp />, time: '1 year' },
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
    <div className="max-w-6xl mx-auto p-6">
      {skillsData.map((categoryData, categoryIndex) => (
        <div key={categoryIndex} className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">{categoryData.category}</h3>
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
  const [dragOffset, setDragOffset] = useState(0);

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
    const itemWidth = 220; // The width of each carousel item
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
      const itemWidth = 220; // The width of each carousel item

      // Update dragOffset to calculate the index shift
      setDragOffset(dragDistance);

      // If the drag distance is significant, shift the index
      if (Math.abs(dragDistance) > 150) {
        if (dragDistance > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
        setDragStartX(e.clientX); // Reset the start position after moving to the next/prev item
        setDragOffset(0); // Reset drag offset after slide shift
      }
    }
  };

  const handleMouseUp = () => {
    setDragStartX(null);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (dragStartX !== null) {
      handleMouseUp();
    }
  };

  return (
    <div
      className="carousel-wrapper relative flex items-center justify-center overflow-hidden"
      style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
    >
      <button className="prev absolute left-0 text-2xl p-2 bg-gray-700 text-white rounded-full" onClick={prevSlide}>
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
              width: '200px', // Define the fixed width of the carousel item
            }}
          >
            <div className="card p-4 border border-gray-300 rounded-lg shadow-lg bg-white flex flex-col items-center hover:bg-gray-100 transform transition-all duration-300 ease-out">
              <div className="text-4xl text-blue-500 mb-4">{item.icon}</div>
              <h4 className="text-xl font-medium">{item.name}</h4>
              <p className="text-gray-600">Experience: {item.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="next absolute right-0 text-2xl p-2 bg-gray-700 text-white rounded-full" onClick={nextSlide}>
        ›
      </button>
    </div>
  );
};

export default Skills;
