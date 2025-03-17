import { useRef, useEffect } from 'react';

/**
 * Custom hook to preserve scroll position when state changes cause re-renders
 * 
 * @param {any[]} dependencies - Array of dependencies that should trigger scroll position restoration
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Delay in ms before restoring scroll position (default: 50)
 * @param {string} options.behavior - Scroll behavior ('auto', 'smooth', 'instant') (default: 'instant')
 * @param {boolean} options.onlyForLargeChanges - Only restore scroll if position is above threshold (default: true)
 * @param {number} options.threshold - Minimum scroll position to trigger restoration (default: 200)
 * @returns {Object} - Object containing saveScrollPosition function
 */
export const useScrollPreservation = (dependencies = [], options = {}) => {
  const { 
    delay = 50, 
    behavior = 'instant',
    onlyForLargeChanges = true,
    threshold = 200
  } = options;
  
  // Reference to store scroll position
  const scrollPositionRef = useRef(0);
  
  // Skip first render
  const componentDidMountRef = useRef(false);
  
  // Maintain scroll position without automatically scrolling to elements
  useEffect(() => {
    // Skip the first render
    if (!componentDidMountRef.current) {
      componentDidMountRef.current = true;
      return;
    }
    
    // We're deliberately NOT auto-scrolling to any elements here
    // as that was causing the unpleasant jumping effect
    
    // Only restore position when we have significant scroll (for back navigation)
    // or when the user has scrolled far down
    if (scrollPositionRef.current > threshold && onlyForLargeChanges) {
      // Use a small delay to ensure the DOM has fully updated
      const scrollTimeout = setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant' // Use instant to avoid animation
        });
      }, delay);
      
      return () => clearTimeout(scrollTimeout);
    }
    
    // Otherwise, don't touch the scroll position at all
    // This keeps the view stable during transitions
  }, dependencies);
  
  // Function to save current scroll position
  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
  };
  
  return { saveScrollPosition };
};