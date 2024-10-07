import React, { useState, useEffect, useRef } from 'react';
import { experiences, projects, Experience, Project } from './data';

const ExperienceComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const [view, setView] = useState<'experiences' | 'projects'>('experiences');
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const data: (Experience | Project)[] = view === 'experiences' ? experiences : projects;

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
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      handleCardClick(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleCardClick(currentIndex - 1);
    }
  };

  const isExperience = (item: Experience | Project): item is Experience => item.type === 'experience';

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* Highlighted Item */}
      <div className="flex-1 flex flex-col pt-8 bg-gray-100 overflow-y-auto rounded-xl relative mb-20 ml-10">
        {/* Floating Navigation Bar */}
        <div className="fixed bottom-[2rem] right-[44rem] bg-white shadow-md p-4 rounded-lg flex justify-between w-48 z-50">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === data.length - 1}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="flex-1 max-w-4xl w-full mx-auto pb-16 mb-8 relative">
          <div className={`transition-all duration-300 ${imageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <img
              src={data[currentIndex].media}
              alt={`Media for ${data[currentIndex].title}`}
              className="w-full h-64 object-cover rounded-lg mb-6 shadow-lg"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{data[currentIndex].title}</h1>

          {isExperience(data[currentIndex]) && (
            <p className="text-lg text-gray-500 mb-4">{data[currentIndex].duration}</p>
          )}

          <div className="prose prose-lg max-w-none flex-1 overflow-y-auto">
            {isExperience(data[currentIndex]) ? (
              data[currentIndex].fullDescription.split('\n\n').map((paragraph, idx) => {
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
              })
            ) : (
              <p className="text-gray-700 mb-4">{data[currentIndex].fullDescription}</p>
            )}
          </div>
        </div>
      </div>

      {/* Vertical List of Experiences/Projects */}
      <div
        ref={listRef}
        className="w-1/3 bg-white pr-8 pl-8 pb-8 overflow-y-auto mb-10"
        style={{ maxHeight: '100vh' }}
      >
        {/* Toggle Selector with sticky positioning */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4 w-full shadow-md sticky top-0 z-10">
          <div className="flex justify-center">
            <button
              className={`px-4 py-2 mx-2 rounded ${
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
              className={`px-4 py-2 mx-2 rounded ${
                view === 'projects' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                setView('projects');
                setCurrentIndex(0);
              }}
            >
              Projects
            </button>
          </div>
        </div>

        {data.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            className={`cursor-pointer border rounded-lg overflow-hidden mb-4 transition-transform transform hover:scale-[1.02] ${
              index === currentIndex ? 'border-red-500 shadow-lg' : 'border-gray-200'
            }`}
            onClick={() => handleCardClick(index)}
          >
            <img
              src={item.media}
              alt={`Media for ${item.title}`}
              className={`w-full object-cover transition-all duration-300 ${index === currentIndex ? 'h-0 opacity-0' : 'h-40 opacity-100'}`}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              {isExperience(item) && (
                <p className="text-sm text-gray-500 mb-2">{item.duration}</p>
              )}
              <p className="text-gray-700 text-sm">{isExperience(item) ? item.briefDescription : item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceComponent;