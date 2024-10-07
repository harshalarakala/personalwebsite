import React from 'react';
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

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Projects</h2>
      {projects.map((project, index) => (
        <div key={index} className="mb-8">
          <h3 className="text-2xl font-semibold mb-2 text-center">
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
          <p className="text-center text-gray-500 mb-4">{project.duration}</p>
          <div className="flex flex-col md:flex-row items-center mb-4">
            <img
              src={project.media}
              alt={project.title}
              className="w-full md:w-1/3 rounded-lg shadow-lg mb-4 md:mb-0 md:mr-4"
            />
            <p className="text-gray-700 text-left leading-relaxed">{project.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Projects;
