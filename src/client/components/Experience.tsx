import React, { useState, useEffect, useRef } from 'react';
import { experiences, projects } from './data';

const parseStartDate = (duration: string): Date => {
  const [start] = duration.split(' — ');
  const [month, year] = start.split(' ');
  return new Date(`${month} 1, ${year}`);
};

const ExperienceComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const [view, setView] = useState<'experiences' | 'projects'>('experiences');
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const sortedData = (view === 'experiences' ? experiences : projects).sort((a, b) => {
    const dateA = parseStartDate(a.duration);
    const dateB = parseStartDate(b.duration);
    return sortByDate === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  const handleCardClick = (index: number) => {
    if (index !== currentIndex) {
      setImageVisible(false);
      setTimeout(() => {
        setCurrentIndex(index);
        setImageVisible(true);
      }, 300);
    }
  };

  const scrollToCurrent = () => {
    const currentItem = itemRefs.current[currentIndex];
    if (currentItem && listRef.current) {
      listRef.current.scrollTo({
        top: currentItem.offsetTop - listRef.current.offsetTop - 85,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToCurrent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < sortedData.length - 1) {
      handleCardClick(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleCardClick(currentIndex - 1);
    }
  };

  const renderFullDescription = (fullDescription: string) => {
    return fullDescription.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('### ')) {
        const heading = paragraph.replace('### ', '');
        return (
          <h2 key={idx} className="text-2xl font-bold mt-4 mb-2 text-red-800">
            {heading}
          </h2>
        );
      } else {
        return (
          <p key={idx} className="text-gray-700 mb-4">
            {paragraph}
          </p>
        );
      }
    });
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Highlighted Item - Hidden on mobile */}
      <div className="flex-1 flex flex-col pt-8 bg-gray-100 overflow-y-auto rounded-xl relative mb-10 lg:mb-20 lg:ml-10 lg:block">
        {/* Floating Navigation Bar */}
        <div className="fixed bottom-4 left-4 lg:bottom-[2.5rem] lg:left-[4rem] bg-white shadow-md p-4 rounded-lg flex justify-between w-48 z-50">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === sortedData.length - 1}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="flex-1 max-w-5xl w-full mx-auto pb-16 mb-8 relative px-4">
          <div className={`transition-all duration-300 ${imageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <img
              src={sortedData[currentIndex].media}
              alt={`Media for ${sortedData[currentIndex].title}`}
              className="w-full h-64 object-cover rounded-lg mb-6 shadow-lg"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{sortedData[currentIndex].title}</h1>

          {sortedData[currentIndex].duration && (
            <p className="text-lg text-gray-500 mb-4">{sortedData[currentIndex].duration}</p>
          )}

          <div className="prose prose-lg max-w-none flex-1 overflow-y-auto">
            {renderFullDescription(sortedData[currentIndex].fullDescription)}
          </div>
        </div>
      </div>

      {/* Vertical List of Experiences/Projects */}
      <div
        ref={listRef}
        className="lg:w-1/3 w-full bg-white lg:pr-8 lg:pl-8 pb-8 overflow-y-auto mb-10 flex flex-col items-center"
      >
        {/* Toggle Selector with sticky positioning */}
        <div className="bg-gray-100 p-2 lg:p-4 rounded-lg mb-4 w-full shadow-md sticky top-0 z-20">
          <div className="flex flex-wrap justify-center items-center">
            <button
              className={`p-2 lg:p-2 m-2 lg:m-2 rounded ${
                view === 'experiences' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                setView('experiences');
                setCurrentIndex(0);
              }}
            >
              Experiences
            </button>
            <button
              className={`p-2 m-2 rounded ${
                view === 'projects' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                setView('projects');
                setCurrentIndex(0);
              }}
            >
              Projects
            </button>
            {/* Sort by Date Button */}
            <button
              className="p-2 m-2 rounded border-red-500 bg-gray-300 border-2"
              onClick={() => {
                setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
              }}
            >
              Sort by: {sortByDate === 'desc' ? 'Recent' : 'Oldest'}
            </button>
          </div>
        </div>
        <div className="max-w-[97%]">
          {sortedData.map((item, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className="cursor-pointer border rounded-lg overflow-hidden mb-4 transition-transform transform hover:scale-[1.02] shadow-lg drop-shadow-4xl border-gray-200"
              onClick={() => handleCardClick(index)}
            >
              <img
                src={item.media}
                alt={`Media for ${item.title}`}
                className={`w-full object-cover transition-all duration-300 ${
                  index === currentIndex ? 'h-0 opacity-0' : 'h-40 opacity-100'
                }`}
              />
              <div className="p-4">
                <h3 className={`transition-all duration-700 ${index === currentIndex ? 'text-red-500' : ''}`}>{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.duration}</p>
                <p className="text-gray-700 text-sm">{item.briefDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceComponent;
