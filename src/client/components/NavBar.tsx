import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useAnimate, stagger } from 'framer-motion';

const NavBar: React.FC = () => {
    const context = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scope, animate] = useAnimate();

    if (!context) {
        throw new Error('NavBar must be used within a SectionProvider');
    }

    const { state, dispatch } = context;

    const getTabClass = (section: string) => {
        const isActive = state.currentSection === section;
        return `relative content-center text-center h-full cursor-pointer transition-all duration-200 ${
            isActive
                ? 'text-sm font-semibold text-gray-900'
                : 'text-sm font-medium text-gray-600'
        }${!isActive ? ' hover:text-gray-900' : ''}`;
    };

    // Add resize listener to handle screen size changes
    useEffect(() => {
        const handleResize = () => {
            // If screen size is desktop (lg breakpoint is typically 1024px)
            if (window.innerWidth >= 1024) {
                // Reset animation for desktop view if needed
                animate([
                    ['nav', { transform: 'translateX(0%)' }],
                    ['li', { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }]
                ]);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [animate]);

    useEffect(() => {
        const menuAnimations = isOpen
            ? [
                  [
                      'nav',
                      { transform: 'translateX(0%)' },
                      { ease: [0.08, 0.65, 0.53, 0.96], duration: 0.6 }
                  ],
                  [
                      'li',
                      { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
                      { delay: stagger(0.05), at: '-0.1' }
                  ]
              ]
            : [
                  [
                      'li',
                      { transform: 'scale(0.5)', opacity: 0, filter: 'blur(10px)' },
                      { delay: stagger(0.05, { from: 'last' }), at: '<' }
                  ],
                  ['nav', { transform: 'translateX(-100%)' }, { at: '-0.1' }]
              ];

        if (window.innerWidth < 1024) {
            animate(menuAnimations as [string, any, any][]);
        }
    }, [isOpen, animate]);

    return (
        <div ref={scope} className="fixed top-0 left-0 right-0 z-50">
            {/* Toggle button for mobile */}
            <div className="lg:hidden fixed top-4 right-4 z-50">
              <button
                  className="cursor-pointer w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-md hover:bg-gray-100 transition-colors p-1.5"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle menu"
              >
                  {!isOpen ? (
                      <>
                          <div className="w-5 h-0.5 bg-gray-900 rounded-full transition-all duration-300"></div>
                          <div className="w-5 h-0.5 bg-gray-900 rounded-full transition-all duration-300"></div>
                          <div className="w-5 h-0.5 bg-gray-900 rounded-full transition-all duration-300"></div>
                      </>
                  ) : (
                      <>
                          <div className="w-5 h-0.5 bg-gray-900 rounded-full rotate-45 translate-y-1.5 transition-all duration-300"></div>
                          <div className="w-5 h-0.5 bg-gray-900 rounded-full opacity-0 transition-all duration-300"></div>
                          <div className="w-5 h-0.5 bg-gray-900 rounded-full -rotate-45 -translate-y-1.5 transition-all duration-300"></div>
                      </>
                  )}
              </button>
          </div>

            {/* Full-Screen Mobile Menu */}
            <nav
                className={`fixed top-0 left-0 w-full z-40 lg:flex lg:justify-center lg:items-center lg:h-16 lg:bg-white/95 lg:backdrop-blur-sm lg:border-b lg:border-gray-200 lg:shadow-sm ${
                    isOpen ? 'flex bg-white h-screen w-screen overflow-y-auto' : 'hidden lg:flex'
                }`}
            >
                <ul className="flex flex-col lg:flex-row justify-center items-center w-full">
                    <li
                        className={`${getTabClass('overview')} w-full lg:w-auto py-4 lg:py-0 lg:pl-4 lg:pr-8 lg:hover:bg-gray-50 lg:rounded-md transition-colors`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'overview' });
                            setIsOpen(false);
                        }}
                    >
                        <span className="relative z-10">Overview</span>
                        {state.currentSection === 'overview' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full lg:block hidden"></span>
                        )}
                    </li>
                    <li
                        className={`${getTabClass('experience')} w-full lg:w-auto py-4 lg:py-0 lg:pl-4 lg:pr-8 lg:hover:bg-gray-50 lg:rounded-md transition-colors`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'experience' });
                            setIsOpen(false);
                        }}
                    >
                        <span className="relative z-10">Experiences</span>
                        {state.currentSection === 'experience' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full lg:block hidden"></span>
                        )}
                    </li>
                    <li
                        className={`${getTabClass('projects')} w-full lg:w-auto py-4 lg:py-0 lg:pl-4 lg:pr-8 lg:hover:bg-gray-50 lg:rounded-md transition-colors`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'projects' });
                            setIsOpen(false);
                        }}
                    >
                        <span className="relative z-10">Projects</span>
                        {state.currentSection === 'projects' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full lg:block hidden"></span>
                        )}
                    </li>
                    <li
                        className={`${getTabClass('skills')} w-full lg:w-auto py-4 lg:py-0 lg:pl-4 lg:pr-8 lg:hover:bg-gray-50 lg:rounded-md transition-colors`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'skills' });
                            setIsOpen(false);
                        }}
                    >
                        <span className="relative z-10">Skills</span>
                        {state.currentSection === 'skills' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full lg:block hidden"></span>
                        )}
                    </li>
                    <li
                        className={`${getTabClass('contact')} w-full lg:w-auto py-4 lg:py-0 lg:pl-4 lg:pr-4 lg:hover:bg-gray-50 lg:rounded-md transition-colors`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'contact' });
                            setIsOpen(false);
                        }}
                    >
                        <span className="relative z-10">Contact</span>
                        {state.currentSection === 'contact' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full lg:block hidden"></span>
                        )}
                    </li>
                    
                </ul>
            </nav>
        </div>
    );
};

export default NavBar;
