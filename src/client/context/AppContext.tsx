import React, { createContext, useReducer, ReactNode, Dispatch } from 'react';

// Define types for state and action
type State = {
  currentSection: string;
};

type Action = {
  type: 'SET_SECTION';
  payload: string;
};

// Define the context type
type AppContextType = {
  state: State;
  dispatch: Dispatch<Action>;
};

// Create the context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the reducer
const sectionReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SECTION':
      return {
        ...state,
        currentSection: action.payload,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: State = {
  currentSection: 'overview',
};

// Create a provider component
export const SectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sectionReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
