import React, { createContext, useContext, useState, useCallback } from "react";

const loaderContext = createContext();

export const LoadingProfile = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const toggleLoading = useCallback((isLoading) => {
    setLoading((prev) => {
      if (prev === isLoading) {
        console.log("Redundant loading state, skipping update.");
        return prev;
      }
      console.log(`Loading state updated to: ${isLoading}`);
      return isLoading;
    });
  }, []);

  return (
    <loaderContext.Provider value={{ loading, toggleLoading }}>
      {children}
    </loaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(loaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoadingProfile");
  }
  return context;
};
