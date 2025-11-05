import React, { useContext } from 'react';
import NavBar from './components/NavBar';
import { SectionProvider, AppContext } from './context/AppContext';
import Overview from './components/Overview';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import CareerLadder from './components/CareerLadder';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './css/LiquidGlass.css';

const App: React.FC = () => {
  // Mouse tracking for liquid glass effect
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--mouse-x', `${x}%`);
    element.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <GoogleOAuthProvider clientId="195786252954-j2p1t5tceicbnnocri51jospice15f99.apps.googleusercontent.com">
      <SectionProvider>
        <div className='min-h-screen flex flex-col relative'>
          <header className="App-header">
            <NavBar />
          </header>
          <main className='pt-16 flex-grow flex items-center justify-center'>
            <SectionRenderer />
          </main>
          <CareerLadderButton onMouseMove={handleMouseMove} />
        </div>
      </SectionProvider>
    </GoogleOAuthProvider>
  );
};

const SectionRenderer: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('SectionRenderer must be used within a SectionProvider');
  }

  const { state } = context;

  const renderSection = () => {
    switch (state.currentSection) {
      case 'overview':
        return <Overview />;
      case 'experience':
        return <Experience />;
      case 'projects':
        return <Projects />;
      case 'skills':
        return <Skills />;
      case 'contact':
        return <Contact />;
      case 'careerladder':
        return <CareerLadder />;
      default:
        return <Overview />;
    }
  };

  return renderSection();
};

// Floating Career Ladder Button Component
const CareerLadderButton: React.FC<{ onMouseMove: (e: React.MouseEvent<HTMLElement>) => void }> = ({ onMouseMove }) => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { dispatch } = context;

  const handleClick = () => {
    dispatch({ type: 'SET_SECTION', payload: 'careerladder' });
  };

  return (
    <button
      onClick={handleClick}
      onMouseMove={onMouseMove}
      className="liquid-glass-button fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
      style={{ 
        background: 'rgba(59, 130, 246, 0.8)', 
        borderColor: 'rgba(59, 130, 246, 0.6)',
        color: 'white'
      } as React.CSSProperties}
      aria-label="My Interview Experiences"
      title="My Interview Experiences"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-8 w-8" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
        />
      </svg>
    </button>
  );
};

export default App;