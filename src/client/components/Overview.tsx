import React, { useContext, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../context/AppContext';
import profileImage from '../images/profile.jpeg';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileDownload, FaBriefcase, FaPhone, FaGithub, FaLinkedin, FaCode, FaTasks } from 'react-icons/fa';
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

    // Show toast only once per full page load (first time Overview mounts)
    useEffect(() => {
        const w = window as any;
        if (w.__interviewsToastShown) return;

        const msg = (
            <span>
                New Feature: Check out My Interviews tab to see an overview of all companies I've interviewed at!{' '}
                <button
                    onClick={() => handleNavigate('careerladder')}
                    className="underline text-blue-600 hover:text-blue-700"
                >
                    Explore now!
                </button>
            </span>
        );
        // small delay to ensure global toast container is mounted
        setTimeout(() => {
            toast.info(msg, {
                position: 'top-right',
                autoClose: 7000,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }, 250);
        w.__interviewsToastShown = true;
    }, []);

    const handleNavigate = (path: string) => {
        dispatch({ type: 'SET_SECTION', payload: path });
    };

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
        <section id="overview" className="relative bg-white text-black p-4 sm:p-6 md:p-8 pb-16 sm:pb-20 md:pb-24 overflow-hidden flex items-center justify-center w-full h-full">
            <div className="flex flex-col self-center w-full max-w-screen-xl mx-auto md:flex-row items-center md:items-start text-center md:text-left space-y-8 md:space-y-0 md:space-x-8 lg:space-x-12 px-4 sm:px-6">
                <motion.div
                    className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden shadow-lg border-4 border-gray-200 flex-shrink-0 mx-auto md:mx-0"
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
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 md:mb-4 text-gray-900">
                        Hi, I'm Harshal Arakala
                    </h1>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentStatement}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.8 }}
                            className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600"
                        >
                            {statements[currentStatement]}
                        </motion.p>
                    </AnimatePresence>
                    <p className="text-base sm:text-lg md:text-xl text-gray-700 mt-3 md:mt-4">
                        I'm a passionate Software Engineer and student at the University of Virginia, specializing in creating seamless digital experiences. Let's build something amazing.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5 md:mt-6">
                        <a
                            href="https://drive.google.com/file/d/1Xv1mTfBa8JXecL5humVqRYjkMm1TVOjC/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseMove={handleMouseMove}
                            className="liquid-glass-button liquid-glass-dark inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            style={{ 
                                background: 'rgba(17, 24, 39, 0.8)', 
                                borderColor: 'rgba(17, 24, 39, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaFileDownload className="mr-2" />
                            Resume
                        </a>

                        <a
                            href="https://drive.google.com/file/d/1-hgzf2SoU1tZBXIe706HUfJAmr_XoSx3/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseMove={handleMouseMove}
                            className="liquid-glass-button liquid-glass-dark inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            style={{ 
                                background: 'rgba(17, 24, 39, 0.8)', 
                                borderColor: 'rgba(17, 24, 39, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaFileDownload className="mr-2" />
                            Transcript
                        </a>

                        <motion.button
                            className="liquid-glass-button liquid-glass-dark inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onMouseMove={handleMouseMove}
                            onClick={() => handleNavigate('experience')}
                            style={{ 
                                background: 'rgba(17, 24, 39, 0.8)', 
                                borderColor: 'rgba(17, 24, 39, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaBriefcase className="mr-2" />
                            Experiences
                        </motion.button>

                        <motion.button
                            className="liquid-glass-button liquid-glass-dark inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onMouseMove={handleMouseMove}
                            onClick={() => handleNavigate('projects')}
                            style={{ 
                                background: 'rgba(17, 24, 39, 0.8)', 
                                borderColor: 'rgba(17, 24, 39, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaBriefcase className="mr-2" />
                            Projects
                        </motion.button>

                        <motion.button
                            className="liquid-glass-button liquid-glass-orange inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onMouseMove={handleMouseMove}
                            onClick={() => handleNavigate('skills')}
                            style={{ 
                                background: 'rgba(251, 146, 60, 0.8)', 
                                borderColor: 'rgba(251, 146, 60, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaCode className="mr-2" />
                            Skills
                        </motion.button>

                        <a
                            href="https://github.com/harshalarakala"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseMove={handleMouseMove}
                            className="liquid-glass-button liquid-glass-gray inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            style={{ 
                                background: 'rgba(107, 114, 128, 0.8)', 
                                borderColor: 'rgba(107, 114, 128, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaGithub className="mr-2" />
                            GitHub
                        </a>

                        <a
                            href="https://www.linkedin.com/in/harshalarakala"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseMove={handleMouseMove}
                            className="liquid-glass-button liquid-glass-blue inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700"
                            style={{ 
                                background: 'rgba(59, 130, 246, 0.15)', 
                                borderColor: 'rgba(59, 130, 246, 0.3)' 
                            } as React.CSSProperties}
                        >
                            <FaLinkedin className="mr-2" />
                            LinkedIn
                        </a>

                        <motion.button
                            className="liquid-glass-button liquid-glass-green inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onMouseMove={handleMouseMove}
                            onClick={() => handleNavigate('contact')}
                            style={{ 
                                background: 'rgba(22, 163, 74, 0.8)', 
                                borderColor: 'rgba(22, 163, 74, 0.6)' 
                            } as React.CSSProperties}
                        >
                            <FaPhone className="mr-2" />
                            Get in Touch
                        </motion.button>
                    </div>
                </motion.div>
            </div>
            {/* Toasts rendered by App-level container */}
        </section>
    );
};

export default Overview;
