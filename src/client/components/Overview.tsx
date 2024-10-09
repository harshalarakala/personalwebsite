// Overview.tsx
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import profileImage from '../images/profile.jpeg';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileDownload, FaBriefcase, FaPhone } from 'react-icons/fa';
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

    const handleDownload = (filePath: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        link.click();
    };

    const handleNavigate = (path: string) => {
        dispatch({ type: 'SET_SECTION', payload: path });
    };

    return (
        <section id="overview" className="relative min-h-screen bg-white text-black p-8 pb-24 overflow-hidden flex items-center justify-center">

            <div className="flex flex-col self-center md:flex-row items-center md:items-start text-center md:text-left space-y-8 md:space-y-0 md:space-x-12 w-[60%]">
                <motion.div
                    className={`w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden shadow-lg border-4 border-red-500 flex-shrink-0 ${animate ? 'animate-pulse-border' : ''}`}
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
                    className="text-gray-900 p-6 flex-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-6xl font-extrabold mb-4">
                        <span className={` ${animate ? 'animate-pulse-text' : ''}`}>Hi,</span> I'm Harshal Arakala
                    </h1>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentStatement}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.8 }}
                            className={`text-xl md:text-2xl font-semibold text-red-500`}
                        >
                            {statements[currentStatement]}
                        </motion.p>
                    </AnimatePresence>
                    <p className="text-lg md:text-xl text-gray-700 mt-4">
                        I'm a passionate Software Engineer and student at the University of Virginia, specializing in creating seamless digital experiences. Let's build something amazing together.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 mt-6">
                        <motion.button
                            className={`flex items-center justify-center px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload('/files/Harshal_Arakala_Resume_UVA.pdf', 'Harshal_Arakala_Resume_UVA.pdf')}
                        >
                            <FaFileDownload className="mr-2" />
                            Resume
                        </motion.button>

                        <motion.button
                            className={`flex items-center justify-center px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload('/files/Harshal_Arakala_Transcript_UVA.pdf', 'Harshal_Arakala_Transcript_UVA.pdf')}
                        >
                            <FaFileDownload className="mr-2" />
                            Transcript
                        </motion.button>

                        <motion.button
                            className={`flex items-center justify-center px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate('experiences')}
                        >
                            <FaBriefcase className="mr-2" />
                            Experiences
                        </motion.button>

                        <motion.button
                            className={`flex items-center justify-center px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-lg border-4 border-red-500 ${animate ? 'animate-pulse-border' : ''} hover:bg-red-600 transition duration-200`}
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
