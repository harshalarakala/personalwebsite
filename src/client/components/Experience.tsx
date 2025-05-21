import React, { useState, useEffect, useRef } from 'react';
import { experiences as initialExperiences, projects as initialProjects } from './data';
import MDEditor from '@uiw/react-md-editor';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut } from '../services/authService';
import { Experience as ExperienceType, getItems, createItem, updateItem, toggleArchiveItem, deleteItem, seedInitialData } from '../services/experienceService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.css';

interface ExperienceOrProject {
  id?: string;
  title: string;
  company?: string | null;
  media: string;
  duration: string;
  fullDescription: string;
  briefDescription: string;
  location?: string | null;
  type: 'experience' | 'project';
  archived?: boolean;
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

// Add a utility function to parse and format dates for the duration field
const formatDateRange = (startDate: Date | null, endDate: Date | null | string): string => {
  if (!startDate) return '';
  
  const formatDate = (date: Date): string => {
    // Format as "Month Year" (e.g., "Jan 2023")
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const startStr = formatDate(startDate);
  
  // Handle "Present" as a special case
  if (endDate === 'present' || endDate === 'Present') {
    return `${startStr} — Present`;
  }
  
  // Handle null end date (ongoing)
  if (!endDate) {
    return `${startStr} — Present`;
  }
  
  // Handle actual end date
  if (endDate instanceof Date) {
    return `${startStr} — ${formatDate(endDate)}`;
  }
  
  // Return start date only if end date is invalid
  return startStr;
};

// Parse a duration string like "Jan 2022 — Present" into start and end dates
const parseDurationDates = (duration: string): { startDate: Date | null, endDate: Date | null | string } => {
  try {
    const parts = duration.split(' — ');
    
    // Parse start date
    let startDate: Date | null = null;
    if (parts[0]) {
      const [month, year] = parts[0].split(' ');
      startDate = new Date(`${month} 1, ${year}`);
      if (isNaN(startDate.getTime())) startDate = null;
    }
    
    // Parse end date
    let endDate: Date | null | string = null;
    if (parts[1]) {
      if (parts[1] === 'Present' || parts[1] === 'present') {
        endDate = 'present';
      } else {
        const [month, year] = parts[1].split(' ');
        endDate = new Date(`${month} 1, ${year}`);
        if (isNaN(endDate.getTime())) endDate = null;
      }
    }
    
    return { startDate, endDate };
  } catch (error) {
    console.error('Error parsing duration:', error);
    return { startDate: null, endDate: null };
  }
};

const ExperienceComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const [view, setView] = useState<'experiences' | 'projects'>('experiences');
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editBrief, setEditBrief] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [experiencesData, setExperiencesData] = useState<ExperienceOrProject[]>([]);
  const [projectsData, setProjectsData] = useState<ExperienceOrProject[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState<ExperienceOrProject>({
    title: '',
    company: '',
    duration: '',
    briefDescription: '',
    fullDescription: '',
    media: '',
    location: '',
    type: 'experience'
  });
  
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Add state for date picker
  const [editStartDate, setEditStartDate] = useState<Date | null>(null);
  const [editEndDate, setEditEndDate] = useState<Date | null | string>(null);
  const [isOngoing, setIsOngoing] = useState(false);
  
  // Create previousIndexRef outside useEffect
  const previousIndexRef = useRef<number>(0);
  
  // Add state for new item dates
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newIsOngoing, setNewIsOngoing] = useState(false);
  
  // Fetch data from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Seed data if needed (only happens first time)
        await seedInitialData(
          initialExperiences.map(exp => ({ 
            ...exp, 
            type: 'experience' as const
          })),
          initialProjects.map(proj => ({ 
            ...proj, 
            type: 'project' as const
          }))
        );
        
        // Fetch experiences and projects
        const experiences = await getItems('experience', showArchived);
        const projects = await getItems('project', showArchived);
        
        setExperiencesData(experiences);
        setProjectsData(projects);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to local data with generated IDs
        setExperiencesData(
          initialExperiences.map((exp, index) => ({ 
            ...exp, 
            id: `local-exp-${index}`,
            type: 'experience' as const 
          }))
        );
        setProjectsData(
          initialProjects.map((proj, index) => ({ 
            ...proj, 
            id: `local-proj-${index}`,
            type: 'project' as const 
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showArchived]);

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
  
  // Modify the useEffect to only cancel editing when switching items, not when editing
  useEffect(() => {
    // Only cancel editing if we're actually switching to a different item
    if (previousIndexRef.current !== currentIndex) {
      setIsEditing(false);
      if (sortedData.length > 0) {
        setEditContent(sortedData[currentIndex].fullDescription);
        setEditBrief(sortedData[currentIndex].briefDescription);
        setEditLocation(sortedData[currentIndex].location || '');
        setEditCompany(sortedData[currentIndex].company || '');
        setEditTitle(sortedData[currentIndex].title);
        
        // Parse the duration into start and end dates
        const { startDate, endDate } = parseDurationDates(sortedData[currentIndex].duration);
        setEditStartDate(startDate);
        
        // Check if it's ongoing/present
        if (endDate === 'present') {
          setIsOngoing(true);
          setEditEndDate(null);
        } else {
          setIsOngoing(false);
          setEditEndDate(endDate);
        }
      }
    }
    
    // Update the ref for next comparison
    previousIndexRef.current = currentIndex;
  }, [currentIndex, sortedData, sortedData.length]);

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

  const handleToggleArchived = async () => {
    setShowArchived(!showArchived);
  };

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
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(sortedData[currentIndex].fullDescription);
    setEditBrief(sortedData[currentIndex].briefDescription);
    setEditLocation(sortedData[currentIndex].location || '');
    setEditCompany(sortedData[currentIndex].company || '');
    setEditTitle(sortedData[currentIndex].title);
    
    // Parse the duration into start and end dates
    const { startDate, endDate } = parseDurationDates(sortedData[currentIndex].duration);
    setEditStartDate(startDate);
    
    // Check if it's ongoing/present
    if (endDate === 'present') {
      setIsOngoing(true);
      setEditEndDate(null);
    } else {
      setIsOngoing(false);
      setEditEndDate(endDate);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const currentItem = sortedData[currentIndex];
      
      // Check if item has ID
      if (!currentItem.id) {
        throw new Error("Cannot save item without ID - please reload the page");
      }
      
      // Format dates into duration string
      const duration = formatDateRange(
        editStartDate,
        isOngoing ? 'present' : editEndDate
      );
      
      const updatedItem = {
        ...currentItem,
        title: editTitle,
        fullDescription: editContent,
        briefDescription: editBrief,
        location: editLocation.trim() || null,
        company: editCompany.trim() || null,
        duration
      };
      
      console.log("Saving item:", updatedItem);
      
      await updateItem(updatedItem as ExperienceType);
      
      // Update local state
      if (view === 'experiences') {
        const updatedExperiences = [...experiencesData];
        const indexToUpdate = updatedExperiences.findIndex(item => item.id === currentItem.id);
        if (indexToUpdate !== -1) {
          updatedExperiences[indexToUpdate] = updatedItem;
          setExperiencesData(updatedExperiences);
        }
      } else {
        const updatedProjects = [...projectsData];
        const indexToUpdate = updatedProjects.findIndex(item => item.id === currentItem.id);
        if (indexToUpdate !== -1) {
          updatedProjects[indexToUpdate] = updatedItem;
          setProjectsData(updatedProjects);
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Failed to save changes: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    // Reset all form fields
    setNewItem({
      title: '',
      company: '',
      duration: '',
      briefDescription: '',
      fullDescription: '',
      media: '',
      location: '',
      type: view === 'experiences' ? 'experience' : 'project'
    });
    setNewStartDate(null);
    setNewEndDate(null);
    setNewIsOngoing(false);
  };

  const handleSaveNew = async () => {
    try {
      // Format the duration string from date values
      const duration = formatDateRange(
        newStartDate,
        newIsOngoing ? 'present' : newEndDate
      );
      
      // Create the new item with the formatted duration
      const itemToCreate = {
        ...newItem,
        company: newItem.company?.trim() || null,
        location: newItem.location?.trim() || null,
        duration
      };
      
      // Add new item to Firebase
      const newItemId = await createItem(itemToCreate as ExperienceType);
      
      // Add to local state with the new ID
      const createdItem = {
        ...itemToCreate,
        id: newItemId
      };
      
      if (view === 'experiences') {
        setExperiencesData([...experiencesData, createdItem]);
      } else {
        setProjectsData([...projectsData, createdItem]);
      }
      
      setIsCreating(false);
      
      // Set current index to the newly added item
      setTimeout(() => {
        const newIndex = sortedData.length;
        setCurrentIndex(newIndex);
      }, 100);
    } catch (error) {
      console.error("Error saving new item:", error);
      alert("Failed to save new item: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const handleArchiveItem = async () => {
    try {
      const currentItem = sortedData[currentIndex];
      await toggleArchiveItem(currentItem as ExperienceType, !currentItem.archived);
      
      // Update local state
      if (view === 'experiences') {
        const updatedExperiences = [...experiencesData];
        updatedExperiences[currentIndex] = {
          ...updatedExperiences[currentIndex],
          archived: !currentItem.archived
        };
        setExperiencesData(updatedExperiences);
      } else {
        const updatedProjects = [...projectsData];
        updatedProjects[currentIndex] = {
          ...updatedProjects[currentIndex],
          archived: !currentItem.archived
        };
        setProjectsData(updatedProjects);
      }
    } catch (error) {
      console.error("Error archiving/unarchiving item:", error);
    }
  };
  
  const handleDeleteItem = async () => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }
    
    try {
      const currentItem = sortedData[currentIndex];
      await deleteItem(currentItem as ExperienceType);
      
      // Update local state
      if (view === 'experiences') {
        setExperiencesData(experiencesData.filter((_, i) => i !== currentIndex));
      } else {
        setProjectsData(projectsData.filter((_, i) => i !== currentIndex));
      }
      
      // Update current index if needed
      if (currentIndex >= sortedData.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renderFullDescription = (fullDescription: string) => {
    return (
      <div data-color-mode="light" className="prose prose-lg max-w-none">
        <MDEditor.Markdown 
          source={fullDescription} 
          style={{ 
            background: 'transparent',
            color: '#374151'
          }}
        />
      </div>
    );
  };

  // Update the edit form JSX to include date pickers
  // Replace the existing editor form with this one
  const renderEditForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input 
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company <span className="text-gray-400">(optional)</span>
        </label>
        <input 
          type="text"
          value={editCompany}
          onChange={(e) => setEditCompany(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Company or Organization Name (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input 
          type="text"
          value={editLocation}
          onChange={(e) => setEditLocation(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="City, State or Remote"
        />
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <DatePicker
            selected={editStartDate}
            onChange={(date) => setEditStartDate(date)}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            className="w-full p-2 border rounded"
            placeholderText="Select start date"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <div className="flex items-center space-x-2">
            <DatePicker
              selected={isOngoing ? null : editEndDate as Date | null}
              onChange={(date) => setEditEndDate(date)}
              dateFormat="MMM yyyy"
              showMonthYearPicker
              className="w-full p-2 border rounded"
              placeholderText="Select end date"
              disabled={isOngoing}
            />
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="ongoingCheckbox" 
                checked={isOngoing} 
                onChange={() => setIsOngoing(!isOngoing)} 
                className="mr-2"
              />
              <label htmlFor="ongoingCheckbox" className="text-sm text-gray-700">Present</label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description</label>
        <textarea 
          value={editBrief}
          onChange={(e) => setEditBrief(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Description (Markdown)</label>
        <MDEditor
          value={editContent}
          onChange={(val) => setEditContent(val || "")}
          height={400}
          preview="edit"
        />
      </div>

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
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Highlighted Item - Hidden on mobile */}
      <div className="flex-1 flex flex-col pt-8 bg-gray-100 overflow-y-auto rounded-xl relative mb-10 lg:mb-20 lg:ml-10 lg:block">
        {/* Authentication Section */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
          {!isAuthenticated ? (
            <button 
              onClick={handleLoginSuccess}
              className="px-3 py-1 bg-blue-500 text-white rounded flex items-center"
              aria-label="Login with Google"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.2461 14V10H19.8701C20.0217 10.544 20.1217 11.022 20.1217 11.58C20.1217 16.128 16.9143 19 12.2461 19C8.12574 19 4.74611 15.6196 4.74611 11.5C4.74611 7.38037 8.12574 4 12.2461 4C14.1959 4 15.9272 4.76394 17.2077 6.02332L14.4445 8.67553C13.8908 8.14129 13.1263 7.73255 12.2461 7.73255C10.1578 7.73255 8.47869 9.42343 8.47869 11.5C8.47869 13.5766 10.1578 15.2675 12.2461 15.2675C13.8958 15.2675 15.0856 14.3951 15.499 13.17H12.2461V14Z" fill="currentColor"/>
              </svg>
              Login
            </button>
          ) : (
            <div className="flex items-center bg-white/80 p-2 rounded-lg shadow-sm hover:bg-white transition-colors">
              {userData?.photoURL && (
                <img 
                  src={userData.photoURL} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <span className="text-sm text-gray-700 mr-2">{userData?.displayName?.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-200 text-gray-700 rounded-full p-1 h-5 w-5 flex items-center justify-center"
                aria-label="Logout"
              >
                ×
              </button>
            </div>
          )}
          
          {isAuthenticated && (
            <button
              onClick={handleToggleArchived}
              className={`px-3 py-1 ${showArchived ? 'bg-purple-500' : 'bg-gray-500'} text-white rounded text-sm`}
              aria-label={showArchived ? "Hide archived" : "Show archived"}
            >
              {showArchived ? "Hide Archived" : "Show Archived"}
            </button>
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
                <div>
                  <h1 className="text-3xl font-bold">
                    {sortedData[currentIndex].title}
                    {sortedData[currentIndex].company && (
                      <span className="text-gray-700"> @ {sortedData[currentIndex].company}</span>
                    )}
                  </h1>
                  {sortedData[currentIndex].location && (
                    <p className="text-lg text-gray-600 mb-1">{sortedData[currentIndex].location}</p>
                  )}
                </div>
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
                    <button
                      onClick={handleArchiveItem}
                      className={`px-3 py-1 ${sortedData[currentIndex].archived ? 'bg-green-500' : 'bg-yellow-500'} text-white rounded`}
                      aria-label={sortedData[currentIndex].archived ? "Unarchive" : "Archive"}
                    >
                      {sortedData[currentIndex].archived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      onClick={handleDeleteItem}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      aria-label="Delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {sortedData[currentIndex].duration && (
                <p className="text-lg text-gray-500 mb-4">{sortedData[currentIndex].duration}</p>
              )}

              {sortedData[currentIndex].archived && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                  <p className="font-bold">Archived</p>
                  <p>This item is archived and not publicly visible unless specifically requested.</p>
                </div>
              )}

              <div className="prose prose-lg max-w-none flex-1 overflow-y-auto">
                {isEditing ? renderEditForm() : renderFullDescription(sortedData[currentIndex].fullDescription)}
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
              className={`cursor-pointer border rounded-lg overflow-hidden mb-4 transition-transform transform hover:scale-[1.02] shadow-lg drop-shadow-4xl border-gray-200 ${
                item.archived ? 'opacity-60 border-yellow-400 border-2' : ''
              }`}
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
                <div className="flex justify-between items-center">
                  <h3 className={`transition-all duration-700 ${index === currentIndex ? 'text-red-500' : ''}`}>
                    {item.title}
                  </h3>
                  {item.archived && (
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                      Archived
                    </span>
                  )}
                </div>
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
                <label className="block text-sm font-medium text-gray-700">
                  Company <span className="text-gray-400">(optional)</span>
                </label>
                <input 
                  type="text"
                  value={newItem.company || ''}
                  onChange={(e) => setNewItem({...newItem, company: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  placeholder="Company or Organization Name (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input 
                  type="text"
                  value={newItem.location || ''}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  placeholder="City, State or Remote"
                />
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <DatePicker
                    selected={newStartDate}
                    onChange={(date) => setNewStartDate(date)}
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    className="w-full p-2 border rounded"
                    placeholderText="Select start date"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <div className="flex items-center space-x-2">
                    <DatePicker
                      selected={newIsOngoing ? null : newEndDate}
                      onChange={(date) => setNewEndDate(date)}
                      dateFormat="MMM yyyy"
                      showMonthYearPicker
                      className="w-full p-2 border rounded"
                      placeholderText="Select end date"
                      disabled={newIsOngoing}
                    />
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="newOngoingCheckbox" 
                        checked={newIsOngoing} 
                        onChange={() => setNewIsOngoing(!newIsOngoing)} 
                        className="mr-2"
                      />
                      <label htmlFor="newOngoingCheckbox" className="text-sm text-gray-700">Present</label>
                    </div>
                  </div>
                </div>
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
