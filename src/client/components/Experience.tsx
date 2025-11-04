import React, { useState, useEffect, useRef, useMemo } from 'react';
import { experiences as initialExperiences } from './data';
import MDEditor from '@uiw/react-md-editor';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthChange, isAuthorizedEditor } from '../services/authService';
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

type ExperienceComponentProps = {
  mode?: 'experiences' | 'projects';
};

const ExperienceComponent: React.FC<ExperienceComponentProps> = ({ mode }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [imageVisible, setImageVisible] = useState(true);
  const [sortByDate, setSortByDate] = useState<'asc' | 'desc'>('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [editContent, setEditContent] = useState("");
  const [editBrief, setEditBrief] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [experiencesData, setExperiencesData] = useState<ExperienceOrProject[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
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
  
  // Add error state
  const [error, setError] = useState<string | null>(null);
  
  // Add state to track screen size
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Listen to authentication state changes for persistence
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

  // Check screen size on mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint is 1024px
    };
    
    // Check on mount
    checkScreenSize();
    
    // Add listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  // Fetch data from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        // Seed data if needed (only happens first time)
        await seedInitialData(
          initialExperiences.map(exp => ({ 
            ...exp, 
            type: 'experience' as const
          })),
          []
        );
        
        // Fetch experiences only
        const experiences = await getItems('experience', showArchived);
        
        setExperiencesData(experiences);
        
        // Only auto-set currentIndex on large screens
        if (isLargeScreen && experiences.length > 0) {
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Using local fallback data.');
        
        // Fallback to local data with generated IDs
        const localExperiences = initialExperiences.map((exp, index) => ({ 
          ...exp, 
          id: `local-exp-${index}`,
          type: 'experience' as const 
        }));
        
        setExperiencesData(localExperiences);
        
        // Only auto-set currentIndex on large screens
        if (isLargeScreen && localExperiences.length > 0) {
          setCurrentIndex(0);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showArchived, isLargeScreen]);

  // Get unique companies and locations for filters
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    experiencesData.forEach(exp => {
      if (exp.company && !exp.archived) {
        companies.add(exp.company);
      }
    });
    return Array.from(companies).sort();
  }, [experiencesData]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    experiencesData.forEach(exp => {
      if (exp.location && !exp.archived) {
        locations.add(exp.location);
      }
    });
    return Array.from(locations).sort();
  }, [experiencesData]);

  // Filter and sort data
  const sortedData = useMemo(() => {
    let filtered = experiencesData.filter(exp => !exp.archived);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(query) ||
        exp.company?.toLowerCase().includes(query) ||
        exp.briefDescription?.toLowerCase().includes(query) ||
        exp.location?.toLowerCase().includes(query)
      );
    }

    // Apply company filter
    if (filterCompany) {
      filtered = filtered.filter(exp => exp.company === filterCompany);
    }

    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter(exp => exp.location === filterLocation);
    }

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = parseStartDate(a.duration);
      const dateB = parseStartDate(b.duration);
      return sortByDate === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }, [experiencesData, searchQuery, filterCompany, filterLocation, sortByDate]);

  // useEffect to update itemRefs when sortedData length changes
  useEffect(() => {
    if (itemRefs.current.length !== sortedData.length) {
      itemRefs.current = new Array(sortedData.length).fill(null);
    }
  }, [sortByDate, sortedData.length]);
  
  // Reset currentIndex or set it based on screen size
  useEffect(() => {
    if (isLargeScreen) {
      // Auto-select first item on large screens
      if (sortedData && sortedData.length > 0) {
        setCurrentIndex(0);
      }
    } else {
      // Reset to no selected item on mobile/medium screens
      setCurrentIndex(-1);
    }
  }, [isLargeScreen, sortedData]);

  // Ensure currentIndex is valid after filtering
  useEffect(() => {
    // Reset currentIndex if it's out of bounds after filtering
    if (sortedData.length > 0 && currentIndex >= sortedData.length) {
      setCurrentIndex(0);
    } else if (sortedData.length === 0) {
      setCurrentIndex(-1);
    }
  }, [sortedData.length, currentIndex]);
  
  // Modify the useEffect to only cancel editing when switching items, not when editing
  useEffect(() => {
    // Only cancel editing if we're actually switching to a different item
    if (previousIndexRef.current !== currentIndex) {
      setIsEditing(false);
      if (sortedData.length > 0 && currentIndex >= 0 && currentIndex < sortedData.length) {
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
    if (index < 0) {
      // This is used to close the modal
      setCurrentIndex(-1); // Set to invalid index to hide modal
      setImageVisible(false);
      setShowFullDescription(false);
      return;
    }
    
    if (sortedData && index < sortedData.length && index !== currentIndex) {
      setImageVisible(false);
      setShowFullDescription(false);
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
    if (sortedData && currentIndex < sortedData.length - 1) {
      setShowFullDescription(false);
      handleCardClick(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setShowFullDescription(false);
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
      const updatedExperiences = [...experiencesData];
      const indexToUpdate = updatedExperiences.findIndex(item => item.id === currentItem.id);
      if (indexToUpdate !== -1) {
        updatedExperiences[indexToUpdate] = updatedItem;
        setExperiencesData(updatedExperiences);
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
      type: 'experience'
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
        duration,
        type: 'experience' as const
      };
      
      // Add new item to Firebase
      const newItemId = await createItem(itemToCreate as ExperienceType);
      
      // Add to local state with the new ID
      const createdItem = {
        ...itemToCreate,
        id: newItemId
      };
      
      setExperiencesData([...experiencesData, createdItem]);
      
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
      const updatedExperiences = [...experiencesData];
      updatedExperiences[currentIndex] = {
        ...updatedExperiences[currentIndex],
        archived: !currentItem.archived
      };
      setExperiencesData(updatedExperiences);
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
      setExperiencesData(experiencesData.filter((_, i) => i !== currentIndex));
      
      // Update current index if needed
      if (currentIndex >= sortedData.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renderFullDescription = (fullDescription: string) => {
    // On desktop (sm and above), always show the full description
    // On mobile, show a toggle button to show/hide the description
    return (
      <div data-color-mode="light" className="prose-container px-1 sm:px-2">
        <div className="sm:hidden mb-3">
          <button 
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs flex items-center justify-center w-full"
          >
            {showFullDescription ? "Hide Details" : "Show Details"}
          </button>
        </div>
        
        <div className={`${showFullDescription ? 'block' : 'hidden'} sm:block`}>
          <MDEditor.Markdown 
            source={fullDescription} 
            style={{ 
              background: 'transparent',
              color: '#374151',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              overflowWrap: 'break-word',
              wordWrap: 'break-word'
            }}
            className="mobile-markdown-content"
          />
        </div>
      </div>
    );
  };

  // Update the edit form JSX to include date pickers
  // Replace the existing editor form with this one
  const renderEditForm = () => (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Title</label>
        <input 
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Company <span className="text-gray-400">(optional)</span>
        </label>
        <input 
          type="text"
          value={editCompany}
          onChange={(e) => setEditCompany(e.target.value)}
          className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
          placeholder="Company or Organization Name (optional)"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Location</label>
        <input 
          type="text"
          value={editLocation}
          onChange={(e) => setEditLocation(e.target.value)}
          className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
          placeholder="City, State or Remote"
        />
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Start Date</label>
          <DatePicker
            selected={editStartDate}
            onChange={(date: Date | null) => setEditStartDate(date)}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
            placeholderText="Select start date"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">End Date</label>
          <div className="flex items-center space-x-2">
            <DatePicker
              selected={isOngoing ? null : editEndDate as Date | null}
              onChange={(date: Date | null) => setEditEndDate(date)}
              dateFormat="MMM yyyy"
              showMonthYearPicker
              className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
              placeholderText="Select end date"
              disabled={isOngoing}
            />
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="ongoingCheckbox" 
                checked={isOngoing} 
                onChange={() => setIsOngoing(!isOngoing)} 
                className="mr-1 sm:mr-2"
              />
              <label htmlFor="ongoingCheckbox" className="text-xs sm:text-sm text-gray-700">Present</label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Brief Description</label>
        <textarea 
          value={editBrief}
          onChange={(e) => setEditBrief(e.target.value)}
          className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Description (Markdown)</label>
        <MDEditor
          value={editContent}
          onChange={(val: string | undefined) => setEditContent(val || "")}
          height={400}
          preview="edit"
        />
      </div>

      <div className="mt-3 sm:mt-4 flex space-x-2">
        <button
          onClick={handleSaveEdit}
          className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 p-4 text-center">
          Loading content...
        </div>
      </div>
    );
  }
  
  // Handle empty data
  if (!experiencesData || experiencesData.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 p-4 text-center">
          {error ? (
            <div className="text-red-500 mb-2">{error}</div>
          ) : null}
          No experiences found. Please add some content.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* Highlighted Item - hidden on mobile and medium screens */}
      <div className="hidden lg:flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8 bg-white overflow-y-auto relative mb-6 sm:mb-8 lg:mb-20 lg:ml-10">
        {/* Authentication Section */}
        <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-50 flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {!isAuthenticated ? (
            <button 
              onClick={handleLoginSuccess}
              className="hidden lg:flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Login with Google"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.2461 14V10H19.8701C20.0217 10.544 20.1217 11.022 20.1217 11.58C20.1217 16.128 16.9143 19 12.2461 19C8.12574 19 4.74611 15.6196 4.74611 11.5C4.74611 7.38037 8.12574 4 12.2461 4C14.1959 4 15.9272 4.76394 17.2077 6.02332L14.4445 8.67553C13.8908 8.14129 13.1263 7.73255 12.2461 7.73255C10.1578 7.73255 8.47869 9.42343 8.47869 11.5C8.47869 13.5766 10.1578 15.2675 12.2461 15.2675C13.8958 15.2675 15.0856 14.3951 15.499 13.17H12.2461V14Z" fill="currentColor"/>
              </svg>
              Sign in
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm text-gray-600">{userData?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                aria-label="Logout"
              >
                Sign out
              </button>
            </div>
          )}
          
          {isAuthenticated && (
            <button
              onClick={handleToggleArchived}
              className={`hidden lg:inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors shadow-sm ${
                showArchived 
                  ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={showArchived ? "Hide archived" : "Show archived"}
            >
              {showArchived ? "Hide Archived" : "Show Archived"}
            </button>
          )}
        </div>

        {/* Floating Navigation Bar - Adjusted for better mobile positioning */}
        <div className="fixed bottom-2 sm:bottom-3 lg:bottom-[2.5rem] left-2 sm:left-3 lg:left-[4rem] bg-white border border-gray-200 shadow-lg p-2 sm:p-3 lg:p-4 rounded-lg flex justify-between gap-2 w-36 sm:w-40 lg:w-48 z-50">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
            aria-label="Previous item"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === sortedData.length - 1}
            className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
            aria-label="Next item"
          >
            Next
          </button>
        </div>
        
        <div className="flex-1 max-w-5xl w-full mx-auto pb-12 sm:pb-14 lg:pb-16 mb-4 sm:mb-6 lg:mb-8 relative px-3 sm:px-4 lg:px-6 pt-12 sm:pt-14 lg:pt-16">
          {sortedData && sortedData.length > 0 && currentIndex >= 0 && currentIndex < sortedData.length ? (
            <>
              <div className={`transition-all duration-300 ${imageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="w-4/5 mx-auto aspect-video max-h-64 overflow-hidden rounded-xl mb-4 sm:mb-5 lg:mb-6">
                  <img
                    src={sortedData[currentIndex].media}
                    alt={`Media for ${sortedData[currentIndex].title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                    {sortedData[currentIndex].title}
                  </h1>
                  {sortedData[currentIndex].company && (
                    <p className="text-xl sm:text-2xl md:text-3xl text-gray-500 font-normal mb-2">{sortedData[currentIndex].company}</p>
                  )}
                  {sortedData[currentIndex].location && (
                    <p className="text-sm sm:text-base text-gray-600 mb-2">{sortedData[currentIndex].location}</p>
                  )}
                  {sortedData[currentIndex].duration && (
                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">
                      {sortedData[currentIndex].duration}
                    </div>
                  )}
                </div>
                {isAuthenticated && !isEditing && (
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={handleEditClick}
                      className="inline-flex items-center justify-center rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                      aria-label="Edit content"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleCreateNew}
                      className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-3 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                      aria-label="Add new item"
                    >
                      Add New
                    </button>
                    <button
                      onClick={handleArchiveItem}
                      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white transition-colors shadow-sm ${
                        sortedData[currentIndex].archived ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                      aria-label={sortedData[currentIndex].archived ? "Unarchive" : "Archive"}
                    >
                      {sortedData[currentIndex].archived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      onClick={handleDeleteItem}
                      className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 px-3 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                      aria-label="Delete"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {sortedData[currentIndex].archived && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 sm:p-4 mb-4 rounded-lg text-sm">
                  <p className="font-semibold">Archived</p>
                  <p className="text-xs sm:text-sm">This item is archived and not publicly visible unless specifically requested.</p>
                </div>
              )}

              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none flex-1 overflow-y-auto text-gray-900">
                {isEditing ? renderEditForm() : renderFullDescription(sortedData[currentIndex].fullDescription)}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 sm:h-48 md:h-56 lg:h-64">
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">No items to display</p>
              {isAuthenticated && (
                <button
                  onClick={handleCreateNew}
                  className="mt-3 sm:mt-4 inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                >
                  Add Your First Experience
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vertical List of Experiences - full width on mobile/medium screens */}
      <div
        ref={listRef}
        className="lg:w-1/3 w-full bg-white border-l border-gray-200 lg:pr-8 lg:pl-8 pb-4 sm:pb-6 lg:pb-8 overflow-y-auto mb-6 sm:mb-8 lg:mb-10 flex flex-col items-center"
      >
        {/* Filters and Sort - sticky positioning */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4 w-full sticky top-0 z-20 space-y-3">
          {/* Search */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            {/* Company Filter */}
            {uniqueCompanies.length > 0 && (
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            )}

            {/* Location Filter */}
            {uniqueLocations.length > 0 && (
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            )}

            {/* Sort Button */}
            <button
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
              onClick={() => {
                setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
              }}
              aria-label={`Sort by ${sortByDate === 'desc' ? 'oldest first' : 'recent first'}`}
            >
              Sort: {sortByDate === 'desc' ? 'Newest' : 'Oldest'}
            </button>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterCompany || filterLocation) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCompany('');
                setFilterLocation('');
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
        <div className="max-w-[97%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[97%] w-full px-2 sm:px-0">
          {sortedData && sortedData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No experiences found matching your filters.</p>
              {(searchQuery || filterCompany || filterLocation) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCompany('');
                    setFilterLocation('');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters to see all experiences
                </button>
              )}
            </div>
          ) : (
            sortedData && sortedData.map((item, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`group relative rounded-xl border overflow-hidden mb-3 sm:mb-4 transition-all duration-200 cursor-pointer ${
                index === currentIndex 
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
              } ${item.archived ? 'opacity-60' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              {index !== currentIndex && (
                <div className="w-full h-32 sm:h-36 overflow-hidden">
                  <img
                    src={item.media}
                    alt={`Media for ${item.title}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className={`text-base sm:text-lg font-semibold transition-all duration-700 ${
                      index === currentIndex ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {item.title}
                      {item.company && (
                        <span className="text-gray-500 font-normal"> @ {item.company}</span>
                      )}
                    </h3>
                    {item.duration && (
                      <div className="mt-2 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                        {item.duration}
                      </div>
                    )}
                  </div>
                  {item.archived && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                      Archived
                    </span>
                  )}
                </div>
                {item.briefDescription && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {item.briefDescription}
                  </p>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile/Medium screen details modal */}
      <div className={`lg:hidden fixed inset-0 bg-black/50 z-50 ${currentIndex >= 0 && sortedData && sortedData.length > currentIndex ? 'flex' : 'hidden'} items-center justify-center p-3`}>
        <div className="bg-white p-4 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
          <button 
            onClick={() => handleCardClick(-1)} 
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full text-xl font-bold"
            aria-label="Close details"
          >
            ×
          </button>
          
          {sortedData && sortedData.length > 0 && currentIndex >= 0 && currentIndex < sortedData.length && (
            <>
              <img
                src={sortedData[currentIndex].media}
                alt={`Media for ${sortedData[currentIndex].title}`}
                className="w-full h-40 object-cover rounded-lg mb-4 shadow-lg"
              />
              
              <h1 className="text-xl font-bold mb-1">
                {sortedData[currentIndex].title}
                {sortedData[currentIndex].company && (
                  <span className="text-gray-700 block text-base"> @ {sortedData[currentIndex].company}</span>
                )}
              </h1>
              
              {sortedData[currentIndex].location && (
                <p className="text-sm text-gray-600 mb-1">{sortedData[currentIndex].location}</p>
              )}
              
              {sortedData[currentIndex].duration && (
                <p className="text-sm text-gray-500 mb-3">{sortedData[currentIndex].duration}</p>
              )}
              
              <div className="prose prose-sm max-w-none mt-4">
                <MDEditor.Markdown 
                  source={sortedData[currentIndex].fullDescription} 
                  style={{ 
                    background: 'transparent',
                    color: '#374151',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create New Item Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Add New Experience</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1.5 sm:p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Company <span className="text-gray-400">(optional)</span>
                </label>
                <input 
                  type="text"
                  value={newItem.company || ''}
                  onChange={(e) => setNewItem({...newItem, company: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1.5 sm:p-2 border"
                  placeholder="Company or Organization Name (optional)"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Location</label>
                <input 
                  type="text"
                  value={newItem.location || ''}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1.5 sm:p-2 border"
                  placeholder="City, State or Remote"
                />
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Start Date</label>
                  <DatePicker
                    selected={newStartDate}
                    onChange={(date: Date | null) => setNewStartDate(date)}
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
                    placeholderText="Select start date"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">End Date</label>
                  <div className="flex items-center space-x-2">
                    <DatePicker
                      selected={newIsOngoing ? null : newEndDate}
                      onChange={(date: Date | null) => setNewEndDate(date)}
                      dateFormat="MMM yyyy"
                      showMonthYearPicker
                      className="w-full p-1.5 sm:p-2 border rounded text-xs sm:text-sm"
                      placeholderText="Select end date"
                      disabled={newIsOngoing}
                    />
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="newOngoingCheckbox" 
                        checked={newIsOngoing} 
                        onChange={() => setNewIsOngoing(!newIsOngoing)} 
                        className="mr-1 sm:mr-2"
                      />
                      <label htmlFor="newOngoingCheckbox" className="text-xs sm:text-sm text-gray-700">Present</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Brief Description</label>
                <textarea 
                  value={newItem.briefDescription}
                  onChange={(e) => setNewItem({...newItem, briefDescription: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1.5 sm:p-2 border"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Description (Markdown)</label>
                <MDEditor
                  value={newItem.fullDescription}
                  onChange={(val: string | undefined) => setNewItem({...newItem, fullDescription: val || ""})}
                  height={200}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Image URL</label>
                <input 
                  type="text"
                  value={newItem.media}
                  onChange={(e) => setNewItem({...newItem, media: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-1.5 sm:p-2 border"
                />
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-800 rounded text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded text-xs sm:text-sm"
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
