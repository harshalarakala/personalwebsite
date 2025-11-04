import React, { useEffect, useMemo, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthChange, isAuthorizedEditor } from '../services/authService';
import { Experience as ExperienceType, getItems, createItem, updateItem, deleteItem } from '../services/experienceService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type ProjectItem = ExperienceType & {
  link?: string | null;
};

const extractFirstUrl = (text?: string): string | null => {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match ? match[0] : null;
};

// Ensure link is an absolute URL
const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // If it already starts with http:// or https://, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Otherwise, prepend https://
  return `https://${trimmed}`;
};

// Format dates into duration string
const formatDateRange = (startDate: Date | null, endDate: Date | null | string): string => {
  if (!startDate) return '';
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const startStr = formatDate(startDate);
  
  if (endDate === 'present' || endDate === 'Present') {
    return `${startStr} — Present`;
  }
  
  if (!endDate) {
    return `${startStr} — Present`;
  }
  
  if (endDate instanceof Date) {
    return `${startStr} — ${formatDate(endDate)}`;
  }
  
  return startStr;
};

// Parse duration string into start and end dates
const parseDurationDates = (duration: string): { startDate: Date | null, endDate: Date | null | string } => {
  try {
    const parts = duration.split(' — ');
    
    let startDate: Date | null = null;
    if (parts[0]) {
      const [month, year] = parts[0].split(' ');
      startDate = new Date(`${month} 1, ${year}`);
      if (isNaN(startDate.getTime())) startDate = null;
    }
    
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

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ProjectItem | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Edit form state
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCompany, setEditCompany] = useState<string>('');
  const [editBrief, setEditBrief] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editMedia, setEditMedia] = useState<string>('');
  const [editLink, setEditLink] = useState<string>('');
  const [editStartDate, setEditStartDate] = useState<Date | null>(null);
  const [editEndDate, setEditEndDate] = useState<Date | null | string>(null);
  const [isOngoing, setIsOngoing] = useState<boolean>(false);
  
  // Create form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newBrief, setNewBrief] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newMedia, setNewMedia] = useState<string>('');
  const [newLink, setNewLink] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newIsOngoing, setNewIsOngoing] = useState<boolean>(false);

  // Listen to authentication state changes
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
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const items = await getItems('project', false);
        const mapped: ProjectItem[] = (items || []).map((p: any) => ({
          ...p,
          link: p.link || extractFirstUrl(p.fullDescription) || extractFirstUrl(p.briefDescription) || null,
        }));
        setProjects(mapped);
      } catch (e) {
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEditClick = (item: ProjectItem) => {
    // Open modal in edit mode immediately with the provided item
    setActive(item);
    setIsEditing(true);
    setEditTitle(item.title);
    setEditCompany(item.company || '');
    setEditBrief(item.briefDescription);
    setEditContent(item.fullDescription);
    setEditMedia(item.media);
    setEditLink(item.link || '');

    const { startDate, endDate } = parseDurationDates(item.duration);
    setEditStartDate(startDate);

    if (endDate === 'present') {
      setIsOngoing(true);
      setEditEndDate(null);
    } else {
      setIsOngoing(false);
      setEditEndDate(endDate);
    }
  };

  const handleSaveEdit = async () => {
    if (!active || !active.id) {
      alert("Cannot save: project missing ID");
      return;
    }

    try {
      const duration = formatDateRange(editStartDate, isOngoing ? 'present' : editEndDate);
      
      const updatedItem: ProjectItem = {
        ...active,
        title: editTitle,
        company: editCompany.trim() || null,
        briefDescription: editBrief,
        fullDescription: editContent,
        media: editMedia,
        link: editLink.trim() || null,
        duration,
        type: 'project'
      };

      await updateItem(updatedItem as ExperienceType);
      
      // Update local state
      const updatedProjects = projects.map(p => 
        p.id === active.id ? { ...updatedItem, link: updatedItem.link || extractFirstUrl(updatedItem.fullDescription) || extractFirstUrl(updatedItem.briefDescription) || null } : p
      );
      setProjects(updatedProjects);
      setActive(updatedItem);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Failed to save changes: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setNewTitle('');
    setNewCompany('');
    setNewBrief('');
    setNewContent('');
    setNewMedia('');
    setNewLink('');
    setNewStartDate(null);
    setNewEndDate(null);
    setNewIsOngoing(false);
    setActive(null);
  };

  const handleSaveNew = async () => {
    try {
      const duration = formatDateRange(newStartDate, newIsOngoing ? 'present' : newEndDate);
      
      const newItem: Omit<ExperienceType, 'id' | 'createdAt' | 'updatedAt'> = {
        title: newTitle,
        company: newCompany.trim() || null,
        briefDescription: newBrief,
        fullDescription: newContent,
        media: newMedia,
        duration,
        type: 'project',
        location: null,
        link: newLink.trim() || null,
        archived: false
      };

      const newItemId = await createItem(newItem);
      
      const createdItem: ProjectItem = {
        ...newItem,
        id: newItemId,
        link: newLink.trim() || null
      };
      
      const allProjects = [...projects, createdItem];
      setProjects(allProjects);
      setIsCreating(false);
      
      // Reset form
      setNewTitle('');
      setNewCompany('');
      setNewBrief('');
      setNewContent('');
      setNewMedia('');
      setNewLink('');
      setNewStartDate(null);
      setNewEndDate(null);
      setNewIsOngoing(false);
    } catch (error) {
      console.error("Error saving new project:", error);
      alert("Failed to save new project: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDeleteItem = async () => {
    if (!active || !active.id) {
      alert("Cannot delete: project missing ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteItem(active as ExperienceType);
      setProjects(projects.filter(p => p.id !== active.id));
      setActive(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  const sorted = useMemo(() => {
    const parseStart = (d?: string) => {
      if (!d) return 0;
      const [start] = d.split(' — ');
      const [m, y] = (start || '').split(' ');
      const dt = new Date(`${m || 'Jan'} 1, ${y || '1970'}`);
      return dt.getTime();
    };
    return [...projects].sort((a, b) =>
      sortOrder === 'desc'
        ? parseStart(b.duration) - parseStart(a.duration)
        : parseStart(a.duration) - parseStart(b.duration)
    );
  }, [projects, sortOrder]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading projects…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              {sortOrder === 'desc' ? 'Sort: Newest' : 'Sort: Oldest'}
            </button>
            {isAuthenticated && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
              >
                + New Project
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <button
                onClick={handleLoginSuccess}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Sign in
              </button>
            ) : (
              <>
                <span className="text-sm text-gray-600">{userData?.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {sorted.map((p) => (
            <div
              key={p.id || p.title}
              className="group relative rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => setActive(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive(p);
                }
              }}
            >
              {p.media && (
                <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                  <img
                    src={p.media}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      {p.title}
                      {p.company && (
                        <span className="text-gray-500 font-normal"> @ {p.company}</span>
                      )}
                    </h2>
                    {p.duration && (
                      <div className="mt-2 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                        {p.duration}
                      </div>
                    )}
                  </div>
                </div>

                {p.briefDescription && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {p.briefDescription}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setActive(p)}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Details
                  </button>
                  {p.link && (
                    <a
                      href={ensureAbsoluteUrl(p.link) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-md bg-[#7c4dff] hover:bg-[#6a3dff] px-3.5 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                    >
                      Visit Project
                    </a>
                  )}
                  {isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(p);
                      }}
                      className="inline-flex items-center justify-center rounded-md border border-blue-300 bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
                </div>
                
      {/* Create Modal */}
      {isCreating && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" 
          onClick={() => setIsCreating(false)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create New Project</h2>
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="flex-shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                    <input 
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company (optional)</label>
                    <input 
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company or Organization"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                      <DatePicker
                        selected={newStartDate}
                        onChange={(date) => setNewStartDate(date)}
                        dateFormat="MMM yyyy"
                        showMonthYearPicker
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                        placeholderText="Select start date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          selected={newIsOngoing ? null : newEndDate}
                          onChange={(date) => setNewEndDate(date)}
                          dateFormat="MMM yyyy"
                          showMonthYearPicker
                          className="flex-1 p-2.5 border border-gray-300 rounded-md text-sm"
                          placeholderText="Select end date"
                          disabled={newIsOngoing}
                        />
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={newIsOngoing} 
                            onChange={() => setNewIsOngoing(!newIsOngoing)} 
                            className="mr-1.5"
                          />
                          <label className="text-sm text-gray-700">Present</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                    <input 
                      type="text"
                      value={newMedia}
                      onChange={(e) => setNewMedia(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Link (optional)</label>
                    <input 
                      type="text"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Brief Description</label>
                    <textarea 
                      value={newBrief}
                      onChange={(e) => setNewBrief(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description (Markdown)</label>
                    <MDEditor
                      value={newContent}
                      onChange={(val) => setNewContent(val || "")}
                      height={400}
                      preview="edit"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleSaveNew}
                  className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/View Modal */}
      {active && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" 
          onClick={() => {
            if (!isEditing) setActive(null);
          }}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {!isEditing && active.media && (
              <div className="aspect-video w-full overflow-hidden flex-shrink-0">
                <img src={active.media} alt={active.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {!isEditing ? (
                      <>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                          {active.title}
                          {active.company && (
                            <span className="text-gray-500 font-normal"> @ {active.company}</span>
                          )}
                        </h2>
                        {active.duration && (
                          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                            {active.duration}
                          </div>
                        )}
                      </>
                    ) : (
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Edit Project</h2>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                      } else {
                        setActive(null);
                      }
                    }}
                    className="flex-shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    {isEditing ? 'Cancel' : 'Close'}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                      <input 
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Company (optional)</label>
                      <input 
                        type="text"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                        <DatePicker
                          selected={editStartDate}
                          onChange={(date) => setEditStartDate(date)}
                          dateFormat="MMM yyyy"
                          showMonthYearPicker
                          className="w-full p-2.5 border border-gray-300 rounded-md text-sm"
                          placeholderText="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                        <div className="flex items-center gap-2">
                          <DatePicker
                            selected={isOngoing ? null : editEndDate as Date | null}
                            onChange={(date) => setEditEndDate(date)}
                            dateFormat="MMM yyyy"
                            showMonthYearPicker
                            className="flex-1 p-2.5 border border-gray-300 rounded-md text-sm"
                            placeholderText="Select end date"
                            disabled={isOngoing}
                          />
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={isOngoing} 
                              onChange={() => setIsOngoing(!isOngoing)} 
                              className="mr-1.5"
                            />
                            <label className="text-sm text-gray-700">Present</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                      <input 
                        type="text"
                        value={editMedia}
                        onChange={(e) => setEditMedia(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Link (optional)</label>
                      <input 
                        type="text"
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Brief Description</label>
                      <textarea 
                        value={editBrief}
                        onChange={(e) => setEditBrief(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description (Markdown)</label>
                      <MDEditor
                        value={editContent}
                        onChange={(val) => setEditContent(val || "")}
                        height={400}
                        preview="edit"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {active.fullDescription && (
                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                      <div className="prose prose-sm sm:prose-base max-w-none" data-color-mode="light">
                        <MDEditor.Markdown
                          source={active.fullDescription}
                          style={{ background: 'transparent', color: '#374151' }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="p-5 sm:p-6 pt-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                    >
                      Save Changes
                    </button>
                    {active.id && (
                      <button
                        onClick={handleDeleteItem}
                        className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {isAuthenticated && active && (
                      <button
                        onClick={() => handleEditClick(active)}
                        className="inline-flex items-center justify-center rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    )}
                    {active.link && (
                      <a
                        href={ensureAbsoluteUrl(active.link) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md bg-[#7c4dff] hover:bg-[#6a3dff] px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                      >
                        Visit Project
                      </a>
                    )}
                    <button
                      onClick={() => setActive(null)}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Projects;
