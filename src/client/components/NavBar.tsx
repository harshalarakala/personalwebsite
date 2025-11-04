import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useAnimate, stagger } from 'framer-motion';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthChange, isAuthorizedEditor } from '../services/authService';

const NavBar: React.FC = () => {
    const context = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scope, animate] = useAnimate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    if (!context) {
        throw new Error('NavBar must be used within a SectionProvider');
    }

    const { state, dispatch } = context;

    // Listen to authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (user && isAuthorizedEditor(user)) {
                setIsAuthenticated(true);
                setUserData(user);
            } else {
                setIsAuthenticated(false);
                setUserData(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLoginSuccess = async () => {
        try {
            const result = await signInWithGoogle();
            if (result && result.isAuthorized) {
                setIsAuthenticated(true);
                setUserData(result.user);
            } else {
                console.log("Unauthorized user attempted to login");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setIsAuthenticated(false);
            setUserData(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

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
                {/* Authentication Section - Top Right */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-3 hidden lg:flex">
                    {!isAuthenticated ? (
                        <button 
                            onClick={handleLoginSuccess}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            aria-label="Login with Google"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.2461 14V10H19.8701C20.0217 10.544 20.1217 11.022 20.1217 11.58C20.1217 16.128 16.9143 19 12.2461 19C8.12574 19 4.74611 15.6196 4.74611 11.5C4.74611 7.38037 8.12574 4 12.2461 4C14.1959 4 15.9272 4.76394 17.2077 6.02332L14.4445 8.67553C13.8908 8.14129 13.1263 7.73255 12.2461 7.73255C10.1578 7.73255 8.47869 9.42343 8.47869 11.5C8.47869 13.5766 10.1578 15.2675 12.2461 15.2675C13.8958 15.2675 15.0856 14.3951 15.499 13.17H12.2461V14Z" fill="currentColor"/>
                            </svg>
                            Sign in
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 hidden xl:inline">{userData?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                aria-label="Logout"
                            >
                                Sign out
                            </button>
                        </div>
                    )}
                </div>

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
