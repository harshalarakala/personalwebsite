import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, isAuthorizedEditor } from '../services/authService';
import { 
  Interview, 
  Season, 
  PositionType,
  PayType,
  InterviewRound,
  WorkType,
  getInterviews, 
  createInterview, 
  updateInterview, 
  deleteInterview 
} from '../services/interviewService';
import MDEditor from '@uiw/react-md-editor';
import '../css/LiquidGlass.css';

const CareerLadder: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'year-desc' | 'year-asc' | 'position'>('year-desc');
  const [filterSeason, setFilterSeason] = useState<Season | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [searchText, setSearchText] = useState('');

  // Edit form state
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyImageUrl, setEditCompanyImageUrl] = useState('');
  const [editPositionName, setEditPositionName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWorkType, setEditWorkType] = useState<WorkType | null>(null);
  const [editSeason, setEditSeason] = useState<Season>('Fall');
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
  const [editPositionType, setEditPositionType] = useState<PositionType>('New Grad');
  const [editOffer, setEditOffer] = useState(false);
  const [editPay, setEditPay] = useState<number | null>(null);
  const [editPayType, setEditPayType] = useState<PayType>('Yearly');
  const [editRound, setEditRound] = useState<InterviewRound | null>(null);
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editInterviewNotes, setEditInterviewNotes] = useState('');

  // Create form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyImageUrl, setNewCompanyImageUrl] = useState('');
  const [newPositionName, setNewPositionName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newWorkType, setNewWorkType] = useState<WorkType | null>(null);
  const [newSeason, setNewSeason] = useState<Season>('Fall');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newPositionType, setNewPositionType] = useState<PositionType>('New Grad');
  const [newOffer, setNewOffer] = useState(false);
  const [newPay, setNewPay] = useState<number | null>(null);
  const [newPayType, setNewPayType] = useState<PayType>('Yearly');
  const [newRound, setNewRound] = useState<InterviewRound | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newInterviewNotes, setNewInterviewNotes] = useState('');

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

  // Fetch interviews from Firebase
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        const data = await getInterviews();
        setInterviews(data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Mouse tracking for liquid glass effect
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty('--mouse-x', `${x}%`);
    element.style.setProperty('--mouse-y', `${y}%`);
  };

  // Helper function to normalize pay to yearly equivalent for comparison
  const getYearlyPay = (interview: Interview): number => {
    if (!interview.offer || !interview.pay) return 0;
    // Convert hourly to yearly (assuming 2080 hours/year = 40 hours/week * 52 weeks)
    if (interview.payType === 'Hourly') {
      return interview.pay * 2080;
    }
    return interview.pay;
  };

  // Get unique years for filter
  const uniqueYears = React.useMemo(() => {
    const years = new Set<number>();
    interviews.forEach(interview => {
      years.add(interview.year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [interviews]);

  // Filter and sort interviews
  const sortedInterviews = React.useMemo(() => {
    let filtered = [...interviews];

    // Apply text search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(interview => {
        const positionMatch = interview.positionName.toLowerCase().includes(searchLower);
        const companyMatch = interview.companyName?.toLowerCase().includes(searchLower);
        const locationMatch = interview.location?.toLowerCase().includes(searchLower);
        return positionMatch || companyMatch || locationMatch;
      });
    }

    // Apply season filter
    if (filterSeason) {
      filtered = filtered.filter(interview => interview.season === filterSeason);
    }

    // Apply year filter
    if (filterYear) {
      filtered = filtered.filter(interview => interview.year === filterYear);
    }

    // Sort the filtered results
    switch (sortBy) {
      case 'year-desc':
        return filtered.sort((a, b) => {
          // First sort by year (descending)
          if (a.year !== b.year) return b.year - a.year;
          // Within same year, sort by pay (highest first) - normalized to yearly
          const payA = getYearlyPay(a);
          const payB = getYearlyPay(b);
          if (payA !== payB) return payB - payA;
          // If same pay or no pay, sort by season
          const seasonOrder = { 'Fall': 1, 'Summer': 2, 'Spring': 3 };
          return seasonOrder[a.season] - seasonOrder[b.season];
        });
      case 'year-asc':
        return filtered.sort((a, b) => {
          // First sort by year (ascending)
          if (a.year !== b.year) return a.year - b.year;
          // Within same year, sort by pay (highest first) - normalized to yearly
          const payA = getYearlyPay(a);
          const payB = getYearlyPay(b);
          if (payA !== payB) return payB - payA;
          // If same pay or no pay, sort by season
          const seasonOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3 };
          return seasonOrder[a.season] - seasonOrder[b.season];
        });
      case 'position':
        return filtered.sort((a, b) => a.positionName.localeCompare(b.positionName));
        default:
        return filtered;
    }
  }, [interviews, sortBy, filterSeason, filterYear, searchText]);

  const handleEditClick = (interview: Interview) => {
    setActiveInterview(interview);
    setIsEditing(true);
    setEditCompanyName(interview.companyName);
    setEditCompanyImageUrl(interview.companyImageUrl);
    setEditPositionName(interview.positionName);
    setEditLocation(interview.location || '');
    setEditWorkType(interview.workType || null);
    setEditSeason(interview.season);
    setEditYear(interview.year);
    setEditPositionType(interview.positionType);
    setEditOffer(interview.offer || false);
    setEditPay(interview.pay || null);
    setEditPayType(interview.payType || 'Yearly');
    setEditRound(interview.round || null);
    setEditRating(interview.rating || null);
    setEditInterviewNotes(interview.interviewNotes);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setNewCompanyName('');
    setNewCompanyImageUrl('');
    setNewPositionName('');
    setNewLocation('');
    setNewWorkType(null);
    setNewSeason('Fall');
    setNewYear(new Date().getFullYear());
    setNewPositionType('New Grad');
    setNewOffer(false);
    setNewPay(null);
    setNewPayType('Yearly');
    setNewRound(null);
    setNewRating(null);
    setNewInterviewNotes('');
    setActiveInterview(null);
  };

  const handleSaveEdit = async () => {
    if (!activeInterview || !activeInterview.id) {
      alert("Cannot save: interview missing ID");
      return;
    }

    try {
      const updatedInterview: Interview = {
        ...activeInterview,
        companyName: editCompanyName,
        companyImageUrl: editCompanyImageUrl,
        positionName: editPositionName,
        location: editLocation.trim() || null,
        workType: editWorkType,
        season: editSeason,
        year: editYear,
        positionType: editPositionType,
        offer: editOffer,
        pay: editOffer ? editPay : null,
        payType: editOffer ? editPayType : null,
        round: !editOffer ? editRound : null,
        rating: editRating,
        interviewNotes: editInterviewNotes
      };

      await updateInterview(updatedInterview);
      setInterviews(interviews.map(i => i.id === activeInterview.id ? updatedInterview : i));
      setIsEditing(false);
      setActiveInterview(null);
    } catch (error) {
      console.error("Error saving interview:", error);
      alert("Failed to save changes: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleSaveNew = async () => {
    try {
      const newInterview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'> = {
        companyName: newCompanyName,
        companyImageUrl: newCompanyImageUrl,
        positionName: newPositionName,
        location: newLocation.trim() || null,
        workType: newWorkType,
        season: newSeason,
        year: newYear,
        positionType: newPositionType,
        offer: newOffer,
        pay: newOffer ? newPay : null,
        payType: newOffer ? newPayType : null,
        round: !newOffer ? newRound : null,
        rating: newRating,
        interviewNotes: newInterviewNotes
      };

      const newId = await createInterview(newInterview);
      const createdInterview: Interview = {
        ...newInterview,
        id: newId
      };

      setInterviews([...interviews, createdInterview]);
      setIsCreating(false);
      
      // Reset form
      setNewCompanyName('');
      setNewCompanyImageUrl('');
      setNewPositionName('');
      setNewLocation('');
      setNewWorkType(null);
      setNewSeason('Fall');
      setNewYear(new Date().getFullYear());
      setNewPositionType('New Grad');
      setNewOffer(false);
      setNewPay(null);
      setNewPayType('Yearly');
      setNewRound(null);
      setNewRating(null);
      setNewInterviewNotes('');
    } catch (error) {
      console.error("Error saving new interview:", error);
      alert("Failed to save new interview: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDeleteInterview = async (interview: Interview) => {
    if (!window.confirm("Are you sure you want to delete this interview? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteInterview(interview);
      setInterviews(interviews.filter(i => i.id !== interview.id));
      if (activeInterview?.id === interview.id) {
        setActiveInterview(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview");
    }
  };

  const seasons: Season[] = ['Fall', 'Spring', 'Summer'];
  const positionTypes: PositionType[] = ['Co-Op', 'Intern', 'New Grad', 'SWE1', 'SWE2', 'Senior SWE'];
  const payTypes: PayType[] = ['Hourly', 'Yearly'];
  const interviewRounds: InterviewRound[] = ['Technical', 'Super Day', 'Hiring Manager', 'Behavioral', 'Phone Screen'];
  const workTypes: WorkType[] = ['Remote', 'Hybrid', 'In Person'];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading interviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Interview Experiences</h1>
            {isAuthenticated && (
              <button
                onClick={handleCreateNew}
                onMouseMove={handleMouseMove}
                className="liquid-glass-button liquid-glass-green inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                style={{ 
                  background: 'rgba(22, 163, 74, 0.8)', 
                  borderColor: 'rgba(22, 163, 74, 0.6)' 
                } as React.CSSProperties}
              >
                + New Interview
              </button>
            )}
          </div>
          
          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by position, company, or location..."
              className="liquid-glass-card px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                borderColor: 'rgba(255, 255, 255, 0.6)',
                minWidth: '200px',
                flex: '1 1 200px'
              } as React.CSSProperties}
            />
            
            <select
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value as Season | '')}
              onMouseMove={handleMouseMove}
              className="liquid-glass-select px-4 py-2 text-sm font-medium text-gray-700 rounded-md"
            >
              <option value="">All Seasons</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
            
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : '')}
              onMouseMove={handleMouseMove}
              className="liquid-glass-select px-4 py-2 text-sm font-medium text-gray-700 rounded-md"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              onMouseMove={handleMouseMove}
              className="liquid-glass-select px-4 py-2 text-sm font-medium text-gray-700 rounded-md"
            >
              <option value="year-desc">Sort: Year (Newest)</option>
              <option value="year-asc">Sort: Year (Oldest)</option>
              <option value="position">Sort: Position</option>
            </select>

            {(filterSeason || filterYear || searchText.trim()) && (
              <button
                onClick={() => {
                  setFilterSeason('');
                  setFilterYear('');
                  setSearchText('');
                }}
                onMouseMove={handleMouseMove}
                className="liquid-glass-button px-4 py-2 text-sm font-medium text-gray-700 rounded-md"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.6)', 
                  borderColor: 'rgba(255, 255, 255, 0.4)' 
                } as React.CSSProperties}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {sortedInterviews.map((interview) => (
            <div
              key={interview.id || interview.positionName}
              onMouseMove={handleMouseMove}
              className="liquid-glass-card group relative rounded-xl cursor-pointer"
              style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                borderColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              } as React.CSSProperties}
              onClick={() => setActiveInterview(interview)}
            >
              {interview.companyImageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                  <img
                    src={interview.companyImageUrl}
                    alt={interview.positionName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      {interview.positionName}
                    </h2>
                    {interview.companyName && (
                      <p className="text-sm text-gray-600 mt-1">{interview.companyName}</p>
                    )}
                    {interview.location && (
                      <p className="text-sm text-gray-500 mt-1">📍 {interview.location}</p>
                    )}
                    {interview.workType && (
                      <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs text-purple-700 mt-1">
                        {interview.workType}
                      </span>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                        {interview.season} {interview.year}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                        {interview.positionType}
                      </span>
                      {interview.offer ? (
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs text-green-700 font-semibold">
                          ✓ Offer
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border-2 border-red-300 bg-red-50 px-2.5 py-0.5 text-xs text-red-700 font-bold">
                          ✗ Rejected
                        </span>
                      )}
                      {interview.offer && interview.pay && (
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 font-semibold">
                          ${interview.pay.toLocaleString()} {interview.payType === 'Hourly' ? '/hr' : '/yr'} USD
                        </span>
                      )}
                      {!interview.offer && interview.round && (
                        <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700 font-semibold">
                          Rejected at: {interview.round}
                        </span>
                      )}
                      {interview.rating && (
                        <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs text-yellow-700">
                          {'⭐'.repeat(interview.rating)}{'☆'.repeat(5 - interview.rating)} ({interview.rating}/5)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(interview);
                      }}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-button liquid-glass-blue inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700"
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.15)', 
                        borderColor: 'rgba(59, 130, 246, 0.3)' 
                      } as React.CSSProperties}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInterview(interview);
                      }}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-button liquid-glass-red inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white"
                      style={{ 
                        background: 'rgba(220, 38, 38, 0.8)', 
                        borderColor: 'rgba(220, 38, 38, 0.6)' 
                      } as React.CSSProperties}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedInterviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No interviews recorded yet.</p>
            {isAuthenticated && (
              <button
                onClick={handleCreateNew}
                onMouseMove={handleMouseMove}
                className="liquid-glass-button liquid-glass-green inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                style={{ 
                  background: 'rgba(22, 163, 74, 0.8)', 
                  borderColor: 'rgba(22, 163, 74, 0.6)' 
                } as React.CSSProperties}
              >
                Add Your First Interview
              </button>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && activeInterview && (
          <div 
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" 
            onClick={() => {
              setIsEditing(false);
              setActiveInterview(null);
            }}
          >
            <div
              className="max-w-3xl w-full max-h-[90vh] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Interview</h2>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setActiveInterview(null);
                    }}
                    onMouseMove={handleMouseMove}
                    className="liquid-glass-button flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      borderColor: 'rgba(255, 255, 255, 0.6)' 
                    } as React.CSSProperties}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                    <input 
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Image URL *</label>
                    <input 
                      type="text"
                      value={editCompanyImageUrl}
                      onChange={(e) => setEditCompanyImageUrl(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Name *</label>
                    <input 
                      type="text"
                      value={editPositionName}
                      onChange={(e) => setEditPositionName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location <span className="text-gray-400">(optional)</span>
                    </label>
                    <input 
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Work Type <span className="text-gray-400">(optional)</span>
                    </label>
                    <select
                      value={editWorkType || ''}
                      onChange={(e) => setEditWorkType(e.target.value as WorkType | null)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select work type...</option>
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Season *</label>
                      <select
                        value={editSeason}
                        onChange={(e) => setEditSeason(e.target.value as Season)}
                        onMouseMove={handleMouseMove}
                        className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {seasons.map(season => (
                          <option key={season} value={season}>{season}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Year *</label>
                      <input 
                        type="number"
                        value={editYear}
                        onChange={(e) => setEditYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="2000"
                        max="2100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Type *</label>
                    <select
                      value={editPositionType}
                      onChange={(e) => setEditPositionType(e.target.value as PositionType)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {positionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="checkbox"
                        checked={editOffer}
                        onChange={(e) => setEditOffer(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Received Offer</span>
                    </label>
                  </div>
                  {editOffer && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay (USD) *</label>
                        <input 
                          type="number"
                          value={editPay || ''}
                          onChange={(e) => setEditPay(e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Type *</label>
                        <select
                          value={editPayType}
                          onChange={(e) => setEditPayType(e.target.value as PayType)}
                          onMouseMove={handleMouseMove}
                          className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {payTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  {!editOffer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Round Reached *</label>
                      <select
                        value={editRound || ''}
                        onChange={(e) => setEditRound(e.target.value as InterviewRound | null)}
                        onMouseMove={handleMouseMove}
                        className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select round...</option>
                        {interviewRounds.map(round => (
                          <option key={round} value={round}>{round}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rating (Public) <span className="text-gray-400">(optional)</span>
                    </label>
                    <select
                      value={editRating || ''}
                      onChange={(e) => setEditRating(e.target.value ? parseInt(e.target.value) : null)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No rating</option>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>
                          {'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)} ({rating}/5)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Notes (Private) *</label>
                    <MDEditor
                      value={editInterviewNotes}
                      onChange={(val: string | undefined) => setEditInterviewNotes(val || "")}
                      height={400}
                      preview="edit"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleSaveEdit}
                  onMouseMove={handleMouseMove}
                  className="liquid-glass-button liquid-glass-green inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                  style={{ 
                    background: 'rgba(22, 163, 74, 0.8)', 
                    borderColor: 'rgba(22, 163, 74, 0.6)' 
                  } as React.CSSProperties}
                >
                  Save Changes
                </button>
                {activeInterview.id && (
                  <button
                    onClick={() => handleDeleteInterview(activeInterview)}
                    onMouseMove={handleMouseMove}
                    className="liquid-glass-button liquid-glass-red inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                    style={{ 
                      background: 'rgba(220, 38, 38, 0.8)', 
                      borderColor: 'rgba(220, 38, 38, 0.6)' 
                    } as React.CSSProperties}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setActiveInterview(null);
                  }}
                  onMouseMove={handleMouseMove}
                  className="liquid-glass-button inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    borderColor: 'rgba(255, 255, 255, 0.6)' 
                  } as React.CSSProperties}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {isCreating && (
          <div 
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" 
            onClick={() => setIsCreating(false)}
          >
            <div
              className="max-w-3xl w-full max-h-[90vh] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create New Interview</h2>
                  <button
                    onClick={() => setIsCreating(false)}
                    onMouseMove={handleMouseMove}
                    className="liquid-glass-button flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      borderColor: 'rgba(255, 255, 255, 0.6)' 
                    } as React.CSSProperties}
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                    <input 
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Image URL *</label>
                    <input 
                      type="text"
                      value={newCompanyImageUrl}
                      onChange={(e) => setNewCompanyImageUrl(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Name *</label>
                    <input 
                      type="text"
                      value={newPositionName}
                      onChange={(e) => setNewPositionName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location <span className="text-gray-400">(optional)</span>
                    </label>
                    <input 
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Work Type <span className="text-gray-400">(optional)</span>
                    </label>
                    <select
                      value={newWorkType || ''}
                      onChange={(e) => setNewWorkType(e.target.value as WorkType | null)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select work type...</option>
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Season *</label>
                      <select
                        value={newSeason}
                        onChange={(e) => setNewSeason(e.target.value as Season)}
                        onMouseMove={handleMouseMove}
                        className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {seasons.map(season => (
                          <option key={season} value={season}>{season}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Year *</label>
                      <input 
                        type="number"
                        value={newYear}
                        onChange={(e) => setNewYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="2000"
                        max="2100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Type *</label>
                    <select
                      value={newPositionType}
                      onChange={(e) => setNewPositionType(e.target.value as PositionType)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {positionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 mb-1.5">
                      <input
                        type="checkbox"
                        checked={newOffer}
                        onChange={(e) => setNewOffer(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Received Offer</span>
                    </label>
                  </div>
                  {newOffer && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay (USD) *</label>
                        <input 
                          type="number"
                          value={newPay || ''}
                          onChange={(e) => setNewPay(e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Type *</label>
                        <select
                          value={newPayType}
                          onChange={(e) => setNewPayType(e.target.value as PayType)}
                          onMouseMove={handleMouseMove}
                          className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {payTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  {!newOffer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Round Reached *</label>
                      <select
                        value={newRound || ''}
                        onChange={(e) => setNewRound(e.target.value as InterviewRound | null)}
                        onMouseMove={handleMouseMove}
                        className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select round...</option>
                        {interviewRounds.map(round => (
                          <option key={round} value={round}>{round}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rating (Public) <span className="text-gray-400">(optional)</span>
                    </label>
                    <select
                      value={newRating || ''}
                      onChange={(e) => setNewRating(e.target.value ? parseInt(e.target.value) : null)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-select w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No rating</option>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>
                          {'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)} ({rating}/5)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Interview Notes (Private) *</label>
                    <MDEditor
                      value={newInterviewNotes}
                      onChange={(val: string | undefined) => setNewInterviewNotes(val || "")}
                      height={400}
                      preview="edit"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleSaveNew}
                  onMouseMove={handleMouseMove}
                  className="liquid-glass-button liquid-glass-green inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white"
                  style={{ 
                    background: 'rgba(22, 163, 74, 0.8)', 
                    borderColor: 'rgba(22, 163, 74, 0.6)' 
                  } as React.CSSProperties}
                >
                  Create Interview
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  onMouseMove={handleMouseMove}
                  className="liquid-glass-button inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    borderColor: 'rgba(255, 255, 255, 0.6)' 
                  } as React.CSSProperties}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {activeInterview && !isEditing && !isCreating && (
          <div 
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" 
            onClick={() => setActiveInterview(null)}
          >
            <div
              className="max-w-3xl w-full max-h-[90vh] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeInterview.companyImageUrl && (
                <div className="aspect-video w-full overflow-hidden flex-shrink-0">
                  <img src={activeInterview.companyImageUrl} alt={activeInterview.positionName} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50">
                {/* Dashboard layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left column: overview cards */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{activeInterview.positionName}</h2>
                      {activeInterview.companyName && (
                        <p className="text-base text-gray-600 mb-3">{activeInterview.companyName}</p>
                      )}
                      {(activeInterview.location || activeInterview.workType) && (
                        <p className="text-sm text-gray-700 mb-4">
                          {activeInterview.location && (<><span>📍 {activeInterview.location}</span></>)}
                          {activeInterview.location && activeInterview.workType && <span> • </span>}
                          {activeInterview.workType && (<span>{activeInterview.workType}</span>)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full border-2 border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-800">
                          {activeInterview.season} {activeInterview.year}
                        </span>
                        <span className="inline-flex items-center rounded-full border-2 border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-800">
                          {activeInterview.positionType}
                        </span>
                        {activeInterview.offer && (
                          <span className="inline-flex items-center rounded-full border-2 border-green-300 bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800">
                            ✓ Offer
                          </span>
                        )}
                        {activeInterview.offer && activeInterview.pay && (
                          <span className="inline-flex items-center rounded-full border-2 border-blue-300 bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-800">
                            💰 ${activeInterview.pay.toLocaleString()} {activeInterview.payType === 'Hourly' ? '/hr' : '/yr'} USD
                          </span>
                        )}
                        {!activeInterview.offer && activeInterview.round && (
                          <span className="inline-flex items-center rounded-full border-2 border-red-300 bg-red-100 px-3 py-1.5 text-sm font-bold text-red-800">
                            ❌ Rejected at: {activeInterview.round}
                          </span>
                        )}
                        {activeInterview.rating && (
                          <span className="inline-flex items-center rounded-full border-2 border-yellow-300 bg-yellow-100 px-3 py-1.5 text-sm font-bold text-yellow-800">
                            <span className="text-base mr-1">{'⭐'.repeat(activeInterview.rating)}{'☆'.repeat(5 - activeInterview.rating)}</span>
                            <span>({activeInterview.rating}/5)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {activeInterview.companyImageUrl && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <img src={activeInterview.companyImageUrl} alt={activeInterview.positionName} className="w-full h-48 object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Right column: notes */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Interview Notes</h3>
                        <span className="text-xs text-gray-400">Private</span>
                      </div>
                      {!isAuthenticated && (
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                          Interview notes are private. You can request view access to the Interview Experiences page to see them.
                        </div>
                      )}
                      {isAuthenticated && activeInterview.interviewNotes ? (
                        <div className="prose prose-sm sm:prose-base max-w-none" data-color-mode="light">
                          <MDEditor.Markdown source={activeInterview.interviewNotes} />
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No notes available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                <div className="p-5 sm:p-6 pt-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
                  {isAuthenticated && (
                    <button
                      onClick={() => handleEditClick(activeInterview)}
                      onMouseMove={handleMouseMove}
                      className="liquid-glass-button liquid-glass-blue inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700"
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.15)', 
                        borderColor: 'rgba(59, 130, 246, 0.3)' 
                      } as React.CSSProperties}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setActiveInterview(null)}
                    onMouseMove={handleMouseMove}
                    className="liquid-glass-button inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      borderColor: 'rgba(255, 255, 255, 0.6)' 
                    } as React.CSSProperties}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerLadder;

