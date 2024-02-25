import { useState, useEffect } from 'react';

// From ChatGPT4
// Custom Hook to get the current window width
function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
            setWidth(window.innerWidth);
        }
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Call handler right away so state gets updated with initial window size
        handleResize();
        
        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return width;
}

export default useWindowWidth;

