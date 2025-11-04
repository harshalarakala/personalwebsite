import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import profileImage from '../images/profile.jpeg';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileDownload, FaBriefcase, FaPhone, FaGithub, FaLinkedin } from 'react-icons/fa';
import './CubeStyles.css';

const Overview: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('Overview must be used within an AppProvider');
    }
    const { dispatch } = context;

    const [currentStatement, setCurrentStatement] = useState(0);
    const statements = [
        "Crafting Code into Impactful Solutions",
        "Building Seamless Digital Experiences",
        "Innovating with Data and AI",
        "Leading Teams to Success",
    ];

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStatement((prev) => (prev + 1) % statements.length);
        }, 3000);

        const timer = setTimeout(() => setAnimate(true), 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [statements.length]);

    const handleNavigate = (path: string) => {
        dispatch({ type: 'SET_SECTION', payload: path });
    };

    return (
        <section id="overview" className="relative bg-white text-black p-4 sm:p-6 md:p-8 pb-16 sm:pb-20 md:pb-24 overflow-hidden flex items-center justify-center w-full h-full">
            <div className="flex flex-col self-center w-full max-w-screen-xl mx-auto md:flex-row items-center md:items-start text-center md:text-left space-y-8 md:space-y-0 md:space-x-8 lg:space-x-12 px-4 sm:px-6">
                <motion.div
                    className={`w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden shadow-lg border-4 border-red-500 flex-shrink-0 mx-auto md:mx-0 ${animate ? 'animate-pulse-border' : ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img
                        src={profileImage}
                        alt="Harshal Arakala"
                        className="object-cover w-full h-full"
                        style={{ objectPosition: 'left', transform: 'translate(-5%, -13%)', scale: '1.35' }}
                    />
                </motion.div>

                <motion.div
                    className="text-gray-900 p-2 sm:p-4 md:p-6 flex-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 md:mb-4">
                        <span className={` ${animate ? 'animate-pulse-text' : ''}`}>Hi,</span> I'm Harshal Arakala
                    </h1>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentStatement}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.8 }}
                            className={`text-lg sm:text-xl md:text-2xl font-semibold text-red-500`}
                        >
                            {statements[currentStatement]}
                        </motion.p>
                    </AnimatePresence>
                    <p className="text-base sm:text-lg md:text-xl text-gray-700 mt-3 md:mt-4">
                        I'm a passionate Software Engineer and student at the University of Virginia, specializing in creating seamless digital experiences. Let's build something amazing together.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5 md:mt-6">
                        <a
                            href="https://drive.google.com/file/d/1Xv1mTfBa8JXecL5humVqRYjkMm1TVOjC/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-2 sm:border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                        >
                            <FaFileDownload className="mr-2" />
                            Resume
                        </a>

                        <a
                            href="https://drive.google.com/file/d/1-hgzf2SoU1tZBXIe706HUfJAmr_XoSx3/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-2 sm:border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                        >
                            <FaFileDownload className="mr-2" />
                            Transcript
                        </a>

                        <motion.button
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-2 sm:border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate('experience')}
                        >
                            <FaBriefcase className="mr-2" />
                            Experiences
                        </motion.button>

                        <motion.button
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-2 sm:border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate('projects')}
                        >
                            <FaBriefcase className="mr-2" />
                            Projects
                        </motion.button>

                        <a
                            href="https://github.com/harshalarakala"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg border-2 sm:border-4 border-gray-900 ${animate ? 'animate-pulse-border' : ''} hover:bg-black transition duration-200`}
                        >
                            <FaGithub className="mr-2" />
                            GitHub
                        </a>

                        <a
                            href="https://www.linkedin.com/in/harshalarakala"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg border-2 sm:border-4 border-blue-600 ${animate ? 'animate-pulse-border' : ''} hover:bg-blue-700 transition duration-200`}
                        >
                            <FaLinkedin className="mr-2" />
                            LinkedIn
                        </a>

                        <motion.button
                            className={`flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 bg-gray-200 text-gray-900 font-bold rounded-lg shadow-lg border-2 sm:border-4 border-gray-300 ${animate ? 'animate-pulse-border' : ''} hover:bg-gray-300 transition duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate('contact')}
                        >
                            <FaPhone className="mr-2" />
                            Get in Touch
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Overview;
