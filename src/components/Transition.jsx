import React, { useState, useEffect, useRef } from 'react';
import { createTransition, Easing, Duration } from '../hooks/useTransitions';

/**
 * Transition component to wrap elements with smooth animations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elements to animate
 * @param {boolean} props.in - Whether the component is visible
 * @param {string} props.type - Type of transition (fade, slide, scale, etc.)
 * @param {number} props.duration - Animation duration in ms
 * @param {string} props.easing - CSS timing function
 * @param {number} props.delay - Delay before animation starts (ms)
 * @param {Function} props.onExited - Callback when exit animation completes
 * @returns {JSX.Element}
 */
export const Transition = ({
  children,
  in: inProp = true,
  type = 'fade',
  duration = Duration.normal,
  easing = Easing.easeInOut,
  delay = 0,
  onExited = () => {},
  style = {},
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(inProp);
  const [isExited, setIsExited] = useState(!inProp);
  const nodeRef = useRef(null);
  
  // Handle visibility changes
  useEffect(() => {
    if (inProp) {
      setIsVisible(true);
      setIsExited(false);
    } else {
      const timer = setTimeout(() => {
        setIsExited(true);
        onExited();
      }, duration + delay);
      
      return () => clearTimeout(timer);
    }
  }, [inProp, duration, delay, onExited]);
  
  // Don't render if completely exited
  if (isExited && !inProp) {
    return null;
  }
  
  // Generate transition styles based on type
  const getTransitionStyles = () => {
    // Base transition
    const transition = createTransition(['all'], duration, easing, delay);
    
    // Initial and active states
    let initialStyles = {};
    let activeStyles = {};
    
    switch (type) {
      case 'fade':
        initialStyles = { opacity: 0 };
        activeStyles = { opacity: 1 };
        break;
      
      case 'slide-up':
        initialStyles = { opacity: 0, transform: 'translateY(20px)' };
        activeStyles = { opacity: 1, transform: 'translateY(0)' };
        break;
      
      case 'slide-down':
        initialStyles = { opacity: 0, transform: 'translateY(-20px)' };
        activeStyles = { opacity: 1, transform: 'translateY(0)' };
        break;
      
      case 'slide-left':
        initialStyles = { opacity: 0, transform: 'translateX(20px)' };
        activeStyles = { opacity: 1, transform: 'translateX(0)' };
        break;
      
      case 'slide-right':
        initialStyles = { opacity: 0, transform: 'translateX(-20px)' };
        activeStyles = { opacity: 1, transform: 'translateX(0)' };
        break;
      
      case 'scale':
        initialStyles = { opacity: 0, transform: 'scale(0.9)' };
        activeStyles = { opacity: 1, transform: 'scale(1)' };
        break;
      
      case 'scale-up':
        initialStyles = { opacity: 0, transform: 'scale(0.8) translateY(20px)' };
        activeStyles = { opacity: 1, transform: 'scale(1) translateY(0)' };
        break;
      
      default:
        initialStyles = { opacity: 0 };
        activeStyles = { opacity: 1 };
    }
    
    return {
      transition,
      ...initialStyles,
      ...(inProp ? activeStyles : initialStyles),
      ...style
    };
  };
  
  return (
    <div
      ref={nodeRef}
      style={{
        ...getTransitionStyles(),
        willChange: 'opacity, transform'
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Group component to manage transitions for multiple children
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} props.type - Type of transition
 * @param {number} props.duration - Duration in ms
 * @param {string} props.easing - CSS easing function
 * @param {number} props.stagger - Stagger delay between children in ms
 * @returns {JSX.Element}
 */
export const TransitionGroup = ({
  children,
  type = 'fade',
  duration = Duration.normal,
  easing = Easing.easeInOut,
  stagger = 50,
  ...rest
}) => {
  // Apply staggered transitions to each child
  const childrenWithTransitions = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    return (
      <Transition
        type={type}
        duration={duration}
        easing={easing}
        delay={index * stagger}
        {...rest}
      >
        {child}
      </Transition>
    );
  });
  
  return <>{childrenWithTransitions}</>;
};

export default Transition;