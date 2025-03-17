import { useEffect, useRef } from 'react';

/**
 * Predefined easing functions using cubic-bezier curves
 */
export const Easing = {
  // Standard curves
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design standard
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)', // For elements entering the screen
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)', // For elements leaving the screen
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)', // For elements that may return to screen
  
  // Custom curves
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy effect
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Very smooth transitions
  gentle: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // Gentle acceleration
  anticipate: 'cubic-bezier(0.47, -0.1, 0.5, 1.5)' // Slight anticipation
};

/**
 * Common durations for different types of animations (in ms)
 */
export const Duration = {
  veryFast: 150,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800
};

/**
 * Creates transition CSS string for a set of properties
 * 
 * @param {string[]} properties - CSS properties to animate
 * @param {number} duration - Animation duration in ms
 * @param {string} easing - CSS timing function
 * @param {number} delay - Delay before animation starts (ms)
 * @returns {string} - CSS transition string
 */
export const createTransition = (
  properties = ['all'],
  duration = Duration.normal,
  easing = Easing.easeInOut,
  delay = 0
) => {
  return properties
    .map(property => `${property} ${duration}ms ${easing} ${delay}ms`)
    .join(', ');
};

/**
 * Hook to handle component transitions on mount and unmount
 * 
 * @param {boolean} visible - Whether the component is visible
 * @param {Object} options - Transition options
 * @returns {Object} - Transition state and refs
 */
export const useTransitionEffect = (visible, options = {}) => {
  const {
    duration = Duration.normal,
    enterDelay = 0,
    exitDelay = 0,
    onExited = () => {}
  } = options;
  
  const nodeRef = useRef(null);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    if (nodeRef.current) {
      if (visible) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Apply enter transitions
        const enterTimeout = setTimeout(() => {
          if (nodeRef.current) {
            nodeRef.current.style.opacity = '1';
            nodeRef.current.style.transform = 'translateY(0)';
          }
        }, enterDelay);
        
        timeoutRef.current = enterTimeout;
      } else {
        // Apply exit transitions
        if (nodeRef.current) {
          nodeRef.current.style.opacity = '0';
          nodeRef.current.style.transform = 'translateY(10px)';
        }
        
        // Cleanup after transition
        const exitTimeout = setTimeout(() => {
          onExited();
        }, duration + exitDelay);
        
        timeoutRef.current = exitTimeout;
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration, enterDelay, exitDelay, onExited]);
  
  return {
    ref: nodeRef,
    style: {
      opacity: visible ? 0 : 1,
      transform: 'translateY(20px)',
      transition: createTransition(
        ['opacity', 'transform'],
        duration,
        Easing.easeOut
      )
    }
  };
};

/**
 * Hook for applying CSS transitions to elements when dependencies change
 * 
 * @param {any[]} dependencies - Dependencies that trigger transitions
 * @param {Object} options - Transition options
 * @returns {Object} - Style props to apply to the element
 */
export const useTransition = (dependencies = [], options = {}) => {
  const {
    properties = ['opacity', 'transform'],
    duration = Duration.normal,
    easing = Easing.easeInOut,
    initialStyles = {},
    activeStyles = {},
    delay = 0
  } = options;
  
  // Create a transition string
  const transition = createTransition(properties, duration, easing, delay);
  
  // Basic transition styles
  return {
    style: {
      transition,
      ...initialStyles
    },
    activeStyles
  };
};