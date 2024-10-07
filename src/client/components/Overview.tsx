import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import profileImage from '../images/profile.jpeg';
import ReactTypingEffect from 'react-typing-effect';
import { Typewriter } from 'react-simple-typewriter';
import { FaRobot, FaCar, FaPlane, FaBrain, FaUserTie, FaChalkboardTeacher, FaHandsHelping, FaCertificate, FaDollarSign, FaSchool, FaUniversity, FaFileDownload, FaLaptopCode, FaTools, FaGraduationCap } from 'react-icons/fa';
import ScrollArrow from './ScrollArrow'; // Import the ScrollArrow component

const Overview: React.FC = () => {
    const { dispatch } = useContext(AppContext) ?? {};

    const handleDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    return (
        <section id="overview" className="relative min-h-screen bg-gray-900 text-white p-8 pb-24">
            <div className="container mx-auto px-4 md:px-8">
                {/* Profile Image and About Section */}
                <div className="flex flex-col md:flex-row items-center justify-between md:space-x-8 mt-8">
                    <div className="w-full md:w-1/3 flex justify-center">
                        <img
                            src={profileImage}
                            alt="Harshal Arakala"
                            className="rounded-xl w-64 h-auto md:w-80 md:h-80 object-cover shadow-lg"
                            style={{ objectPosition: 'center left', zoom: '1.2' }}  // Adjust position and zoom
                        />
                    </div>
                    <div className="w-full md:w-2/3 bg-white text-gray-900 rounded-lg p-6 shadow-lg text-lg leading-relaxed mt-8 md:mt-0">
                        <h1 className="text-4xl font-bold text-center">
                            <Typewriter
                                words={['Harshal Arakala']}
                                loop={1}
                                cursor
                                cursorStyle="|"
                                typeSpeed={10}
                                deleteSpeed={0}
                                delaySpeed={1000}
                            />
                        </h1>
                        <p className="text-xl font-semibold text-green-400 text-center">
                            <Typewriter
                                words={['Software Engineer and Student @ UVA']}
                                loop={1}
                                cursor
                                cursorStyle="|"
                                typeSpeed={10}
                                deleteSpeed={0}
                                delaySpeed={1000}
                            />
                        </p>
                        <p className="mt-4 text-left">
                            <Typewriter
                                words={[
                                    'My name is Harshal Arakala, and I am an aspiring software engineer with a deep passion for cars, planes, leadership, math, robotics, and engineering. I grew up in the Herndon area, where these interests drove me to constantly explore and learn, whether tinkering with machines or leading team projects at school. My journey has been marked by continuous learning, growth, and a strong commitment to both academics and extracurricular activities, laying the foundation for my future in engineering and technology. I am currently pursuing a degree in Computer Science at the University of Virginia, where I have taken part in various impactful projects and competitions.',
                                    'Throughout my academic career, I have honed my skills in software development, focusing on both front-end and back-end technologies, including React, Node.js, and C#. My experience in projects such as developing full-stack applications and implementing machine learning models for data analysis has equipped me with a strong technical foundation and problem-solving skills.',
                                    'I am passionate about leveraging technology to solve real-world problems and have a particular interest in artificial intelligence and cloud computing. My hands-on experience with AWS and Elastic Search has enabled me to optimize data handling and improve system performance, reflecting my commitment to continuous improvement and innovation.',
                                    'In addition to my technical skills, I believe in the power of collaboration and effective communication. My roles in various team projects and leadership positions have taught me the importance of teamwork, adaptability, and the ability to thrive in dynamic environments. I am driven by a desire to create meaningful impact through technology and am eager to continue learning and growing as a software engineer.'
                                ]}
                                loop={1}
                                cursor
                                cursorStyle="|"
                                typeSpeed={25}
                                deleteSpeed={0}
                                delaySpeed={1000}
                            />
                        </p>
                    </div>
                </div>
                {/* Interests Section */}
                <div className="container mx-auto mt-8">
                    <div className="w-full bg-white text-gray-900 rounded-lg p-6 shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Interests</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ul className="list-none space-y-4">
                                <li className="flex items-center">
                                    <FaLaptopCode className="text-green-500 w-6 h-6 mr-4" /> 
                                    <div>
                                        <strong>Software Engineering</strong>
                                        <p className="text-sm mt-1">Passionate about developing scalable software and solving complex problems through coding.</p>
                                    </div>
                                </li>
                                <li className="flex items-center">
                                    <FaRobot className="text-green-500 w-6 h-6 mr-4" />
                                    <div>
                                        <strong>Robotics</strong>
                                        <p className="text-sm mt-1">Engaged in building and programming robots for various competitions and personal projects.</p>
                                    </div>
                                </li>
                                <li className="flex items-center">
                                    <FaCar className="text-green-500 w-6 h-6 mr-4" />
                                    <div>
                                        <strong>Automotive Engineering</strong>
                                        <p className="text-sm mt-1">Interested in the design, development, and testing of vehicle systems and technologies.</p>
                                    </div>
                                </li>
                                <li className="flex items-center">
                                    <FaPlane className="text-green-500 w-6 h-6 mr-4" />
                                    <div>
                                        <strong>Planes</strong>
                                        <p className="text-sm mt-1">Fascinated by aviation and the engineering behind aircraft design and flight dynamics.</p>
                                    </div>
                                </li>
                            </ul>
                            <ul className="list-none space-y-4">
                                <li className="flex items-center">
                                    <FaBrain className="text-green-500 w-6 h-6 mr-4" />
                                    <div>
                                        <strong>Artificial Intelligence</strong>
                                        <p className="text-sm mt-1">Exploring machine learning and AI technologies to create intelligent systems.</p>
                                    </div>
                                </li>
                                <li className="flex items-center">
                                    <FaUserTie className="text-green-500 w-6 h-6 mr-4" />
                                    <div>
                                        <strong>Leadership</strong>
                                        <p className="text-sm mt-1">Committed to leading teams and projects, fostering collaboration and innovation.</p>
                                    </div>
                                </li>
                                <li className="flex items-center">
                                    <FaChalkboardTeacher className="text-green-500 w-6 h-6 mr-4" />
                                    <div>
                                        <strong>STEM Education</strong>
                                        <p className="text-sm mt-1">Dedicated to promoting STEM education and mentoring younger students in technology.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Projects and Skills Button Cards */}
                    <div className="flex flex-wrap -mx-4">
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-green-500 text-white text-xl font-semibold py-6 px-12 rounded-lg shadow-lg flex-1 hover:bg-green-600 transition duration-200 flex items-center justify-center cursor-pointer" onClick={
                                dispatch ? () => dispatch({
                                    type: 'SET_SECTION',
                                    payload: 'experience'
                                }) : undefined
                            }>
                                <FaLaptopCode className="inline-block mr-4 w-6 h-6" />
                                Explore My Experience
                            </div>
                        </div>
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-yellow-500 text-white text-xl font-semibold py-6 px-12 rounded-lg shadow-lg flex-1 hover:bg-yellow-600 transition duration-200 flex items-center justify-center cursor-pointer" onClick={
                                dispatch ? () => dispatch({
                                    type: 'SET_SECTION',
                                    payload: 'skills'
                                }) : undefined
                            }>
                                <FaTools className="inline-block mr-4 w-6 h-6" />
                                Explore My Skills
                            </div>
                        </div>

                        {/* Resume and Transcript Download Cards */}
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-blue-500 text-white py-6 px-12 rounded-lg shadow-lg flex-1 text-center hover:bg-blue-600 transition duration-200 flex items-center justify-center cursor-pointer" onClick={() => handleDownload('/path/to/resume.pdf', 'Harshal_Arakala_Resume.pdf')}>
                                <FaFileDownload className="inline-block mr-4 w-6 h-6" />
                                Download Resume
                            </div>
                        </div>
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-red-500 text-white py-6 px-12 rounded-lg shadow-lg flex-1 text-center hover:bg-red-600 transition duration-200 flex items-center justify-center cursor-pointer" onClick={() => handleDownload('/path/to/transcript.pdf', 'Harshal_Arakala_Transcript.pdf')}>
                                <FaFileDownload className="inline-block mr-4 w-6 h-6" />
                                Download Transcript
                            </div>
                        </div>
                    </div>

                    {/* Leadership and Volunteer Work (Two Cards Per Row) */}
                    <div className="flex flex-wrap -mx-4">
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg flex-1">
                                <h2 className="text-2xl font-semibold mb-4 text-center">Leadership</h2>
                                <ul className="list-none space-y-4">
                                    <li className="flex items-center">
                                        <FaDollarSign className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Financial Director at Virginia Motorsport</strong>
                                            <p className="text-sm mt-1">Managed budgets, secured funding, and oversaw financial operations for Virginia Motorsport.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <FaUniversity className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Data Lead at Business and AI Club at UVA</strong>
                                            <p className="text-sm mt-1">Led data analytics projects, guiding teams to leverage data for insights and strategic decisions.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <FaSchool className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Teaching Assistant</strong>
                                            <p className="text-sm mt-1">Assisted in teaching courses, grading assignments, and mentoring students in computer science.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg flex-1">
                                <h2 className="text-2xl font-semibold mb-4 text-center">Volunteer Work</h2>
                                <ul className="list-none space-y-4">
                                    <li className="flex items-center">
                                        <FaHandsHelping className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Feed My Starving Children</strong>
                                            <p className="text-sm mt-1">Packed meals to be sent to children in need around the world, helping to fight hunger.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <FaRobot className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>FIRST Robotics</strong>
                                            <p className="text-sm mt-1">Mentored students in robotics, helping them design, build, and program robots for competitions.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <FaSchool className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Local Elementary Schools</strong>
                                            <p className="text-sm mt-1">Volunteered as a tutor, helping students with their studies in math and science.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <FaUserTie className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>RAY Non-Profit</strong>
                                            <p className="text-sm mt-1">Founded and led a non-profit focused on youth empowerment through education and technology.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                   {/* Certifications and Education (Two Cards Per Row) */}
                    <div className="flex flex-wrap -mx-4">
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg flex-1">
                                <h2 className="text-2xl font-semibold mb-4 text-center">Certifications</h2>
                                <ul className="list-none space-y-4">
                                    <li className="flex items-center">
                                        <FaCertificate className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Certified AWS Cloud Practitioner</strong>
                                            <p className="text-sm mt-1">Obtained an AWS Cloud Practitioner certification, demonstrating expertise in designing and deploying scalable cloud solutions.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center">
                                        <FaCertificate className="text-green-500 w-6 h-6 mr-4" />
                                        <div>
                                            <strong>Certified ScrumMaster (CSM)</strong>
                                            <p className="text-sm mt-1">Earned the CSM certification, showcasing proficiency in Agile methodologies and Scrum practices.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Education Card */}
                        <div className="md:w-1/2 px-4 mb-8 flex">
                            <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg flex-1">
                                <h2 className="text-2xl font-semibold mb-4 text-center">Education</h2>
                                <div className="flex flex-wrap">
                                    <div className="w-full md:w-1/2 px-2">
                                        <div className="flex items-start">
                                            <FaUniversity className="text-green-500 w-6 h-6 mr-4" />
                                            <div>
                                                <strong>University of Virginia</strong>
                                                <p className="text-sm mt-1">Bachelor's in Computer Science</p>
                                                <p className="text-sm mt-1">Expected Graduation: May 2026</p>
                                                <p className="text-sm mt-1">Current GPA: 3.81</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 px-2">
                                        <div className="flex items-start">
                                            <FaGraduationCap className="text-green-500 w-6 h-6 mr-4" />
                                            <div>
                                                <strong>Westfield High School</strong>
                                                <p className="text-sm mt-1">Honors with AP Distinction Diploma</p>
                                                <p className="text-sm mt-1">Graduated: June 2022</p>
                                                <p className="text-sm mt-1">Final GPA: 4.51</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Include ScrollArrow Component */}
            <ScrollArrow />
        </section>
    );
};

export default Overview;
