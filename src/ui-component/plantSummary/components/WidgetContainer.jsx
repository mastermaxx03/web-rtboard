// // src/ui-component/plantSummary/components/WidgetContainer.jsx

// import React from 'react';
// // Assuming you have an icon library like 'react-icons' configured
// // If not, you might need to use a simple text 'Expand' for now or install 'react-icons'
// import { FiMaximize2 } from 'react-icons/fi'; // Example icon

// const WidgetContainer = ({ title, children, style = {} }) => {
//   // Base styles for all widgets, matching the clean demo dashboard look
//   const containerBaseStyle = {
//     backgroundColor: '#fff', // White background
//     borderRadius: '12px', // Rounded corners
//     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)', // Subtle shadow for depth
//     padding: '20px', // Internal padding
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100%', // Ensure it fills its grid cell
//     // Merge any custom styles passed in via the 'style' prop
//     ...style
//   };

//   const headerStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '15px' // Space below the header
//   };

//   const titleStyle = {
//     fontSize: '16px', // Font size for the title
//     fontWeight: '600', // Semi-bold title
//     color: '#333' // Darker text for readability
//   };

//   const expandButtonStyle = {
//     background: 'none', // No background for the button
//     border: 'none', // No border
//     cursor: 'pointer', // Indicate it's clickable
//     color: '#999', // Grey icon color
//     fontSize: '18px', // Icon size
//     padding: '5px', // Padding around the icon
//     display: 'flex', // Center icon
//     alignItems: 'center',
//     justifyContent: 'center'
//   };

//   const contentStyle = {
//     flexGrow: 1, // Make content area fill remaining space
//     width: '100%',
//     height: '100%' // Ensure chart fills this area
// //   };

// //   return (
// //     <div style={containerBaseStyle}>
// //       <div style={headerStyle}>
// //         <h3 style={titleStyle}>{title}</h3>
// //         <button style={expandButtonStyle} /* onClick handler for expand function goes here later */>
// //           <FiMaximize2 /> {/* This is the expand icon */}
// //         </button>
// //       </div>
// //       <div style={contentStyle}>
// //         {children} {/* Your chart component will go here */}
// //       </div>
// //     </div>
// //   );
// // };

// // export default WidgetContainer;
// // src/ui-component/plantSummary/components/WidgetContainer.jsx

// import React from 'react';
// // Assuming you have an icon library like 'react-icons' configured
// // If not, you might need to use a simple text 'Expand' for now or install 'react-icons'
// import { FiMaximize2 } from 'react-icons/fi'; // Example icon

// const WidgetContainer = ({ title, children, style = {} }) => {
//   // Base styles for all widgets, matching the clean demo dashboard look
//   const containerBaseStyle = {
//     backgroundColor: '#fff', // White background
//     borderRadius: '12px', // Rounded corners
//     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)', // Subtle shadow for depth
//     padding: '20px', // Internal padding
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100%', // Ensure it fills its grid cell
//     // Merge any custom styles passed in via the 'style' prop
//     ...style
//   };

//   const headerStyle = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '15px' // Space below the header
//   };

//   const titleStyle = {
//     fontSize: '16px', // Font size for the title
//     fontWeight: '600', // Semi-bold title
//     color: '#333' // Darker text for readability
//   };

//   const expandButtonStyle = {
//     background: 'none', // No background for the button
//     border: 'none', // No border
//     cursor: 'pointer', // Indicate it's clickable
//     color: '#999', // Grey icon color
//     fontSize: '18px', // Icon size
//     padding: '5px', // Padding around the icon
//     display: 'flex', // Center icon
//     alignItems: 'center',
//     justifyContent: 'center'
//   };

//   const contentStyle = {
//     flexGrow: 1, // Make content area fill remaining space
//     width: '100%',
//     height: '100%' // Ensure chart fills this area
//   };

//   // src/ui-component/plantSummary/components/WidgetContainer.jsx

import React from 'react';
import { FiMaximize2 } from 'react-icons/fi'; // Example icon

const WidgetContainer = ({ title, children, style = {} }) => {
  // Base styles for all widgets, matching the clean demo dashboard look
  const containerBaseStyle = {
    backgroundColor: '#fff', // White background
    borderRadius: '12px', // Rounded corners
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)', // Subtle shadow for depth
    padding: '20px', // Internal padding
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // Ensure it fills its grid cell
    // Merge any custom styles passed in via the 'style' prop
    ...style
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px' // Space below the header
  };

  const titleStyle = {
    fontSize: '16px', // Font size for the title
    fontWeight: '600', // Semi-bold title
    color: '#333' // Darker text for readability
  };

  const expandButtonStyle = {
    background: 'none', // No background for the button
    border: 'none', // No border
    cursor: 'pointer', // Indicate it's clickable
    color: '#999', // Grey icon color
    fontSize: '18px', // Icon size
    padding: '5px', // Padding around the icon
    display: 'flex', // Center icon
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold' // Make text bold (for the 'H')
  };

  const contentStyle = {
    flexGrow: 1, // Make content area fill remaining space
    width: '100%',
    height: '100%' // Ensure chart fills this area
  };

  return (
    <div style={containerBaseStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {/* Container for both icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 'H' Icon Button */}
          <button style={expandButtonStyle}>H</button>
          {/* Maximize Icon Button */}
          <button style={expandButtonStyle}>
            <FiMaximize2 />
          </button>
        </div>
      </div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

export default WidgetContainer;
