import React, { useState, useEffect, useRef } from 'react';
import { experiences, projects } from './data';
import MDEditor from '@uiw/react-md-editor';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

interface ExperienceOrProject {
  title: string;
  media: string;
  duration: string;
  fullDescription: string;
  briefDescription: string;
}

const parseStartDate = (duration: string): Date => {
  try {
    const [start] = duration.split(' — ');
    const [month, year] = start.split(' ');
    return new Date(`${month} 1, ${year}`);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

const ExperienceComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const [view, setView] = useState<'experiences' | 'projects'>('experiences');
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [experiencesData, setExperiencesData] = useState<ExperienceOrProject[]>(experiences);
  const [projectsData, setProjectsData] = useState<ExperienceOrProject[]>(projects);
  const [newItem, setNewItem] = useState<ExperienceOrProject>({
    title: '',
    duration: '',
    briefDescription: '',
    fullDescription: '',
    media: ''
  });
  
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const AUTHORIZED_EMAIL = "harshal.arakala@gmail.com";

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedExperiences = localStorage.getItem('experiences');
    const storedProjects = localStorage.getItem('projects');
    
    if (storedExperiences) {
      setExperiencesData(JSON.parse(storedExperiences));
    } else {
      setExperiencesData(experiences);
    }
    
    if (storedProjects) {
      setProjectsData(JSON.parse(storedProjects));
    } else {
      setProjectsData(projects);
    }
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (itemRefs.current.length !== sortedData.length) {
      itemRefs.current = new Array(sortedData.length).fill(null);
    }
  }, [view, sortByDate]);

  const sortedData = (view === 'experiences' ? experiencesData : projectsData).sort((a, b) => {
    const dateA = parseStartDate(a.duration);
    const dateB = parseStartDate(b.duration);
    return sortByDate === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  const handleCardClick = (index: number) => {
    if (index !== currentIndex) {
      setImageVisible(false);
      setTimeout(() => {
        setCurrentIndex(index);
        setImageVisible(true);
      }, 300);
    }
  };

  const scrollToCurrent = () => {
    const currentItem = itemRefs.current[currentIndex];
    if (currentItem && listRef.current) {
      listRef.current.scrollTo({
        top: currentItem.offsetTop - listRef.current.offsetTop - 85,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToCurrent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < sortedData.length - 1) {
      handleCardClick(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleCardClick(currentIndex - 1);
    }
  };

  const handleLoginSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      if (decoded.email === AUTHORIZED_EMAIL) {
        setIsAuthenticated(true);
        setUserData({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        });
      } else {
        console.log("Unauthorized user attempted to login");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(sortedData[currentIndex].fullDescription);
  };

  const handleSaveEdit = () => {
    if (view === 'experiences') {
      const updatedExperiences = [...experiencesData];
      updatedExperiences[currentIndex] = {
        ...updatedExperiences[currentIndex],
        fullDescription: editContent
      };
      setExperiencesData(updatedExperiences);
      // Save to localStorage
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
    } else {
      const updatedProjects = [...projectsData];
      updatedProjects[currentIndex] = {
        ...updatedProjects[currentIndex],
        fullDescription: editContent
      };
      setProjectsData(updatedProjects);
      // Save to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setNewItem({
      title: '',
      duration: '',
      briefDescription: '',
      fullDescription: '',
      media: ''
    });
  };

  const handleSaveNew = () => {
    if (view === 'experiences') {
      const updatedExperiences = [...experiencesData, newItem];
      setExperiencesData(updatedExperiences);
      // Save to localStorage
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
    } else {
      const updatedProjects = [...projectsData, newItem];
      setProjectsData(updatedProjects);
      // Save to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
    setIsCreating(false);
    // Set current index to the newly added item
    setTimeout(() => {
      const newIndex = sortedData.length;
      setCurrentIndex(newIndex);
    }, 100);
  };

  const renderFullDescription = (fullDescription: string) => {
    return fullDescription.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('### ')) {
        const heading = paragraph.replace('### ', '');
        return (
          <h2 key={idx} className="text-2xl font-bold mt-4 mb-2 text-red-800">
            {heading}
          </h2>
        );
      } else {
        return (
          <p key={idx} className="text-gray-700 mb-4">
            {paragraph}
          </p>
        );
      }
    });
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Highlighted Item - Hidden on mobile */}
      <div className="flex-1 flex flex-col pt-8 bg-gray-100 overflow-y-auto rounded-xl relative mb-10 lg:mb-20 lg:ml-10 lg:block">
        {/* Authentication Section */}
        <div className="absolute top-4 right-4 z-50">
          {!isAuthenticated ? (
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log('Login Failed')}
            />
          ) : (
            <div className="flex items-center bg-white/80 p-1 rounded-full shadow-sm hover:bg-white transition-colors">
              {userData?.picture && (
                <img 
                  src={userData.picture} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-xs ml-1 mr-1 text-gray-700">{userData?.name?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-gray-200 text-gray-700 rounded-full p-1 h-5 w-5 flex items-center justify-center"
                aria-label="Logout"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Floating Navigation Bar */}
        <div className="fixed bottom-4 left-4 lg:bottom-[2.5rem] lg:left-[4rem] bg-white shadow-md p-4 rounded-lg flex justify-between w-48 z-50">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous item"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === sortedData.length - 1}
            className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next item"
          >
            Next
          </button>
        </div>
        
        <div className="flex-1 max-w-5xl w-full mx-auto pb-16 mb-8 relative px-4">
          {sortedData.length > 0 ? (
            <>
              <div className={`transition-all duration-300 ${imageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <img
                  src={sortedData[currentIndex].media}
                  alt={`Media for ${sortedData[currentIndex].title}`}
                  className="w-full h-64 object-cover rounded-lg mb-6 shadow-lg"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">{sortedData[currentIndex].title}</h1>
                {isAuthenticated && !isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditClick}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      aria-label="Edit content"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleCreateNew}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                      aria-label="Add new item"
                    >
                      Add New
                    </button>
                  </div>
                )}
              </div>

              {sortedData[currentIndex].duration && (
                <p className="text-lg text-gray-500 mb-4">{sortedData[currentIndex].duration}</p>
              )}

              <div className="prose prose-lg max-w-none flex-1 overflow-y-auto">
                {isEditing ? (
                  <div>
                    <MDEditor
                      value={editContent}
                      onChange={(val) => setEditContent(val || "")}
                      height={400}
                      preview="edit"
                    />
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  renderFullDescription(sortedData[currentIndex].fullDescription)
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-xl text-gray-500">No items to display</p>
              {isAuthenticated && (
                <button
                  onClick={handleCreateNew}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                >
                  Add Your First {view === 'experiences' ? 'Experience' : 'Project'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vertical List of Experiences/Projects */}
      <div
        ref={listRef}
        className="lg:w-1/3 w-full bg-white lg:pr-8 lg:pl-8 pb-8 overflow-y-auto mb-10 flex flex-col items-center"
      >
        {/* Toggle Selector with sticky positioning */}
        <div className="bg-gray-100 p-2 lg:p-4 rounded-lg mb-4 w-full shadow-md sticky top-0 z-20">
          <div className="flex flex-wrap justify-center items-center">
            <button
              className={`p-2 lg:p-2 m-2 lg:m-2 rounded ${
                view === 'experiences' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                setView('experiences');
                setCurrentIndex(0);
                setIsEditing(false);
              }}
              aria-label="Show experiences"
            >
              Experiences
            </button>
            <button
              className={`p-2 m-2 rounded ${
                view === 'projects' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                setView('projects');
                setCurrentIndex(0);
                setIsEditing(false);
              }}
              aria-label="Show projects"
            >
              Projects
            </button>
            {/* Sort by Date Button */}
            <button
              className="p-2 m-2 rounded border-red-500 bg-gray-300 border-2"
              onClick={() => {
                setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
              }}
              aria-label={`Sort by ${sortByDate === 'desc' ? 'oldest first' : 'recent first'}`}
            >
              Sort by: {sortByDate === 'desc' ? 'Recent' : 'Oldest'}
            </button>
          </div>
        </div>
        <div className="max-w-[97%]">
          {sortedData.map((item, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className="cursor-pointer border rounded-lg overflow-hidden mb-4 transition-transform transform hover:scale-[1.02] shadow-lg drop-shadow-4xl border-gray-200"
              onClick={() => handleCardClick(index)}
            >
              <img
                src={item.media}
                alt={`Media for ${item.title}`}
                className={`w-full object-cover transition-all duration-300 ${
                  index === currentIndex ? 'h-0 opacity-0' : 'h-40 opacity-100'
                }`}
              />
              <div className="p-4">
                <h3 className={`transition-all duration-700 ${index === currentIndex ? 'text-red-500' : ''}`}>{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.duration}</p>
                <p className="text-gray-700 text-sm">{item.briefDescription}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Item Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New {view === 'experiences' ? 'Experience' : 'Project'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input 
                  type="text"
                  value={newItem.duration}
                  onChange={(e) => setNewItem({...newItem, duration: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  placeholder="Month Year — Month Year"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Brief Description</label>
                <textarea 
                  value={newItem.briefDescription}
                  onChange={(e) => setNewItem({...newItem, briefDescription: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Description (Markdown)</label>
                <MDEditor
                  value={newItem.fullDescription}
                  onChange={(val) => setNewItem({...newItem, fullDescription: val || ""})}
                  height={200}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input 
                  type="text"
                  value={newItem.media}
                  onChange={(e) => setNewItem({...newItem, media: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

  </div>
);
};

export default ExperienceComponent;
