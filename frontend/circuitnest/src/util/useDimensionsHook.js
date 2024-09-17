import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export const useDimensions = (targetRef) => {

    // Function to get the dimensions of the target element
    // Use callback to save the function in memory
    const getDimensions = useCallback(() => {
        return {
            width: targetRef.current ? targetRef.current.offsetWidth : 0,
            height: targetRef.current ? targetRef.current.offsetHeight : 0
        };
    }, [targetRef]);
  
    const [dimensions, setDimensions] = useState(getDimensions);
  
    // Resize handler
    // Use callback to save the function in memory
    const handleResize = useCallback(() => {
        setDimensions(getDimensions());
    }, [getDimensions]);
  
    // Add event listeners to the window on component mount
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);
  
    // Use layout effect to get the dimensions after the first render
    useLayoutEffect(() => {
        handleResize();
    }, [handleResize]);
  
    return dimensions;
}