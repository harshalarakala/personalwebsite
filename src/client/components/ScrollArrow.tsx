import React, { useState, useEffect } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const ScrollArrow: React.FC = () => {
    const [isAtBottom, setIsAtBottom] = useState(false);

    const handleScroll = () => {
        const bottomThreshold = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
        setIsAtBottom(bottomThreshold);
    };

    const handleScrollClick = () => {
        if (isAtBottom) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } else {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className="fixed bottom-8 right-8 cursor-pointer"
            onClick={handleScrollClick}
        >
            <div className="flex items-center justify-center bg-white p-4 rounded-lg shadow-lg">
                {isAtBottom ? (
                    <>
                        <FaArrowUp
                            className="text-4xl animate-bounce"
                            style={{
                                background: 'linear-gradient(to right, #3b82f6, #f59e0b, #ef4444)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                animation: 'gradientShift 4s ease infinite',
                                backgroundSize: '200% 200%',
                            }}
                        />
                        <span className="ml-2 text-gray-900">Scroll to Top</span>
                    </>
                ) : (
                    <>
                        <FaArrowDown
                            className="text-4xl animate-bounce"
                            style={{
                                background: 'linear-gradient(to right, #3b82f6, #f59e0b, #ef4444)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                animation: 'gradientShift 4s ease infinite',
                                backgroundSize: '200% 200%',
                            }}
                        />
                        <span className="ml-2 text-gray-900">Scroll to Bottom</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ScrollArrow;
