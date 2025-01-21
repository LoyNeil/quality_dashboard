import React from "react";
import { useLoader } from "./LoaderContext";
import { ColorRing } from "react-loader-spinner";

const Loader = () => {
  const { loading } = useLoader(); // Correctly access context

  if (!loading) return null; // Return nothing if not loading

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <ColorRing
          visible={true}
          height="150"
          width="150"
          colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
        />
      </div>
    </div>
  );
};

export default Loader;
