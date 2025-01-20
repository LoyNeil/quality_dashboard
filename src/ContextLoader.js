import React, {createContext} from 'react'
import {useState} from 'react';

export const LoadingContext = createContext();

export function LoadingProvider({children}) {
    const [isLoading, setIsLoading] = useState(true);
  return (
    <LoadingContext.Provider value={{isLoading, setIsLoading}}>
        {children}
    </LoadingContext.Provider>
  );
}