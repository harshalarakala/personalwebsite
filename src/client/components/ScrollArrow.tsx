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
                            className="text-4xl"
                            style={{ color: 'black' }}
                        />
                        <span className="ml-2 text-gray-900">Scroll to Top</span>
                    </>
                ) : (
                    <>
                        <FaArrowDown
                            className="text-4xl"
                            style={{ color: 'black' }}
                        />
                        <span className="ml-2 text-gray-900">Scroll to Bottom</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ScrollArrow;
