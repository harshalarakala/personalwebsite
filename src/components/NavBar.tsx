import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const NavBar: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('NavBar must be used within a SectionProvider');
  }

  const { state, dispatch } = context;

const getTabClass = (section: string) => {
    return `content-center text-center h-full cursor-pointer transition-transform transition-duration-500 ease-in-out w-[250px] ${
        state.currentSection === section
            ? 'text-4xl font-bold transform scale-125'
            : 'text-xl'
    }${state.currentSection !== section ? ' hover:underline hover:text-red-500' : ''}`;
};

  return (
    <nav className="flex justify-center items-center h-16">
      <div className="flex justify-between align-middle">
        <span
          className={`${getTabClass('overview')} min-h-[50px] leading-[1.5]`}
          onClick={() => dispatch({ type: 'SET_SECTION', payload: 'overview' })}
        >
          Overview
        </span>
        <span
          className={`${getTabClass('projects')} min-h-[50px] leading-[1.5]`}
          onClick={() => dispatch({ type: 'SET_SECTION', payload: 'projects' })}
        >
          Projects
        </span>
        <span
          className={`${getTabClass('skills')} min-h-[50px] leading-[1.5]`}
          onClick={() => dispatch({ type: 'SET_SECTION', payload: 'skills' })}
        >
          Skills
        </span>
        <span
          className={`${getTabClass('contact')} min-h-[50px] leading-[1.5]`}
          onClick={() => dispatch({ type: 'SET_SECTION', payload: 'contact' })}
        >
          Contact
        </span>
      </div>
    </nav>
  );
};

export default NavBar;
