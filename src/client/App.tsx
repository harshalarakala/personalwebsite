import React, { useContext } from 'react';
import NavBar from './components/NavBar';
import { SectionProvider, AppContext } from './context/AppContext';
import Overview from './components/Overview';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Contact from './components/Contact';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="195786252954-j2p1t5tceicbnnocri51jospice15f99.apps.googleusercontent.com">
      <SectionProvider>
        <div className='min-h-screen flex flex-col'>
          <header className="App-header">
            <NavBar />
          </header>
          <main className='pt-16 flex-grow flex items-center justify-center'>
            <SectionRenderer />
          </main>
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
      case 'skills':
        return <Skills />;
      case 'contact':
        return <Contact />;
      default:
        return <Overview />;
    }
  };

  return renderSection();
};

export default App;