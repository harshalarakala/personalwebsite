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
        return `content-center text-center h-full cursor-pointer transition-transform duration-500 ease-in-out ${
            state.currentSection === section
                ? 'text-xl font-bold transform scale-[1.01] text-red-500'
                : 'text-xl'
        }${state.currentSection !== section ? ' hover:underline hover:text-red-500' : ''}`;
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
              <div
                  className="cursor-pointer w-7 h-7 flex flex-col justify-between"
                  onClick={() => setIsOpen(!isOpen)}
              >
                  {!isOpen ? (
                      <>
                          <div className="w-full h-[3px] bg-black rounded-full"></div>
                          <div className="w-full h-[3px] bg-black rounded-full"></div>
                          <div className="w-full h-[3px] bg-black rounded-full"></div>
                      </>
                  ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                              d="M 3 3 L 21 21"
                              stroke="black"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                          />
                          <path
                              d="M 21 3 L 3 21"
                              stroke="black"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                          />
                      </svg>
                  )}
              </div>
          </div>

            {/* Full-Screen Mobile Menu */}
            <nav
                className={`fixed top-0 left-0 w-full z-40 lg:flex lg:justify-center lg:items-center lg:h-16 lg:backdrop-blur-lg lg:bg-white/80 ${
                    isOpen ? 'flex bg-white h-screen w-screen overflow-y-auto' : 'hidden lg:flex'
                }`}
            >
                <ul className="flex flex-col lg:flex-row justify-center items-center lg:space-x-8 w-full">
                    <li
                        className={`${getTabClass('overview')} w-full lg:w-auto py-4 lg:py-0`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'overview' });
                            setIsOpen(false);
                        }}
                    >
                        Overview
                    </li>
                    <li
                        className={`${getTabClass('experience')} w-full lg:w-auto py-4 lg:py-0`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'experience' });
                            setIsOpen(false);
                        }}
                    >
                        Experiences
                    </li>
                    <li
                        className={`${getTabClass('projects')} w-full lg:w-auto py-4 lg:py-0`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'projects' });
                            setIsOpen(false);
                        }}
                    >
                        Projects
                    </li>
                    <li
                        className={`${getTabClass('skills')} w-full lg:w-auto py-4 lg:py-0`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'skills' });
                            setIsOpen(false);
                        }}
                    >
                        Skills
                    </li>
                    <li
                        className={`${getTabClass('contact')} w-full lg:w-auto py-4 lg:py-0`}
                        onClick={() => {
                            dispatch({ type: 'SET_SECTION', payload: 'contact' });
                            setIsOpen(false);
                        }}
                    >
                        Contact
                    </li>
                    
                </ul>
            </nav>
        </div>
    );
};

export default NavBar;
