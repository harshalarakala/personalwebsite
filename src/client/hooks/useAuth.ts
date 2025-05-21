import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, isAuthorizedEditor } from '../services/authService';

interface AuthState {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    user: null,
    isAuthenticated: false,
    isAuthorized: false
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      const isAuthorized = isAuthorizedEditor(user);
      
      setState({
        isLoading: false,
        user,
        isAuthenticated: !!user,
        isAuthorized
      });
    });
    
    return () => unsubscribe();
  }, []);

  return state;
} 