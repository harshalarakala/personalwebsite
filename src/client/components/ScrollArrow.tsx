import React, { useState, useEffect } from 'react';
import { FaFileDownload } from 'react-icons/fa';

const ScrollArrow: React.FC = () => {
    const [animateResume, setAnimateResume] = useState(false);
    const [animateTranscript, setAnimateTranscript] = useState(false);

    const handleDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    useEffect(() => {
        const resumeTimer = setTimeout(() => {
            setAnimateResume(true);
            setTimeout(() => setAnimateResume(false), 2000);
        }, 2000);

        const transcriptTimer = setTimeout(() => {
            setAnimateTranscript(true);
            setTimeout(() => setAnimateTranscript(false), 2000);
        }, 3000);

        return () => {
            clearTimeout(resumeTimer);
            clearTimeout(transcriptTimer);
        };
    }, []);

    return (
        <div className="fixed bottom-8 right-8 cursor-pointer space-y-4">
            <div
                className={`p-6 text-xl font-bold border-[3px] drop-shadow-2xl ${animateResume ? 'animate-pulse-border' : 'border-red-500'} bg-white text-black rounded-lg flex-1 text-center hover:bg-gray-100 transition duration-200 flex items-center justify-center cursor-pointer`}
                onClick={() => handleDownload('/files/Harshal_Arakala_Resume_UVA.pdf', 'Harshal_Arakala_Resume_UVA.pdf')}
            >
                <FaFileDownload className="inline-block mr-4 w-6 h-6" />
                Resume
            </div>

            <div
                className={`p-6 text-xl font-bold border-[3px] drop-shadow-2xl ${animateTranscript ? 'animate-pulse-border' : 'border-red-500'} bg-white text-black rounded-lg flex-1 text-center hover:bg-gray-100 transition duration-200 flex items-center justify-center cursor-pointer`}
                onClick={() => handleDownload('/files/Harshal_Arakala_Transcript_UVA.pdf', 'Harshal_Arakala_Transcript_UVA.pdf')}
            >
                <FaFileDownload className="inline-block mr-4 w-6 h-6" />
                Transcript
            </div>
        </div>
    );
};

export default ScrollArrow;
