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
                        Experience & Projects
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
                    <li className="w-full lg:w-auto py-4 lg:py-0 flex justify-center lg:justify-start">
                        <a
                            href="https://utilities.harshalarakala.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lg:inline-flex lg:items-center lg:gap-2 lg:px-4 lg:py-2 lg:bg-gradient-to-r lg:from-blue-600 lg:to-purple-600 lg:hover:from-blue-700 lg:hover:to-purple-700 lg:text-white lg:rounded-lg lg:shadow-lg lg:hover:shadow-xl lg:transition-all lg:duration-300 lg:transform lg:hover:scale-105 lg:border-2 lg:border-white/20 lg:backdrop-blur-sm w-full text-center text-xl py-4 lg:py-0 text-black hover:underline hover:text-red-500 transition-all duration-300"
                        >
                            <svg className="hidden lg:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="font-medium">My Tools</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default NavBar;
