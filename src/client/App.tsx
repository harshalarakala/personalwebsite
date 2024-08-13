import React, { useContext } from 'react';
import NavBar from './components/NavBar';
import { SectionProvider, AppContext } from './context/AppContext';
import Overview from './components/Overview';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';

const App: React.FC = () => {
  return (
    <SectionProvider>
      <div className="App font-nunito">
        <header className="App-header">
          <NavBar />
        </header>
        <main>
          <SectionRenderer />
        </main>
      </div>
    </SectionProvider>
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
      case 'projects':
        return <Projects />;
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
