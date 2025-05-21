import React, { useState } from 'react';
import { Typewriter } from 'react-simple-typewriter';

const Projects: React.FC = () => {
  const projects = [
    {
      title: 'Data Technical Team Lead, CavGpt Course Scheduler, Charlottesville, VA',
      duration: 'Aug 2023 — Present',
      description: `Created an AI-driven mobile app that integrates UVA-proprietary services to facilitate course selection in a centralized system. Utilized React Native for the chatbot and calendar interfaces, ensuring cross-platform usability. Connected to a Python backend using the OpenAI API and a database of class schedules and ratings to power the chatbot. Simplified course enrollment for hundreds of students in a closed beta, achieving high satisfaction.`,
      media: '/path/to/cavgpt-course-scheduler-media.jpg',
    },
    {
      title: 'Creator and Lead Developer, PrizePicks Bot, Remote',
      duration: 'Feb 2024 — Present',
      description: `Engineered a PrizePicks automation bot with Python and Selenium to automate betting, increasing efficiency and generating over $20,000 in revenue among 10 beta testers. Implemented advanced web scraping techniques and data monitoring capabilities, integrating OpenAI and Discord APIs to predict optimal unit sizes. Developed an automated notification system for tracking bets using remote data clusters, informing users via email and SMS.`,
      media: '/path/to/prizepicks-bot-media.jpg',
    },
  ];

  // Add state to track expanded descriptions on mobile
  const [expandedItems, setExpandedItems] = useState<{[key: number]: boolean}>({});

  // Toggle description expansion for mobile view
  const toggleDescription = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Projects</h2>
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {projects.map((project, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-xl sm:text-2xl font-semibold px-4 pt-4 pb-2 text-center">
              <Typewriter
                words={[project.title]}
                loop={1}
                cursor
                cursorStyle="|"
                typeSpeed={50}
                deleteSpeed={0}
                delaySpeed={500}
              />
            </h3>
            <p className="text-center text-gray-500 text-sm sm:text-base mb-3 sm:mb-4 px-4">{project.duration}</p>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/3 p-4">
                <img
                  src={project.media}
                  alt={project.title}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg shadow-md mx-auto"
                />
              </div>
              <div className="w-full lg:w-2/3 p-4 sm:p-6">
                {/* On mobile: Use line-clamp with expand/collapse functionality */}
                <div className={`relative ${expandedItems[index] ? '' : 'max-h-[500px]'}`}>
                  <div 
                    className={`text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed ${
                      expandedItems[index] ? '' : 'line-clamp-4 lg:line-clamp-none'
                    }`}
                  >
                    {project.description.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                  
                  {/* Show gradient fade at the bottom on mobile when collapsed */}
                  {!expandedItems[index] && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent lg:hidden"></div>
                  )}
                </div>
                
                {/* Toggle button for mobile only */}
                <div className="mt-2 block lg:hidden">
                  <button 
                    onClick={() => toggleDescription(index)}
                    className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center"
                  >
                    {expandedItems[index] ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Show less
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Read more
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
