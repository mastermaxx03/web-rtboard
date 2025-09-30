import React, { useState, useEffect } from 'react';

/**
 * A component that renders a dynamic list of text inputs.
 * @param {object} props - The component props.
 * @param {object} props.field - The configuration object for this field.
 * @param {string[]} props.value - The current array of values for the list.
 * @param {function} props.onChange - The callback function to update the form's state.
 * @param {string} props.error - An optional error message.
 */
function DynamicListField({ field, value, onChange, error }) {
  const [items, setItems] = useState(value || ['']);

  // --- THIS IS THE FIX ---
  // This effect now directly and reliably updates the internal state 
  // whenever the 'value' prop from the parent form changes.
  useEffect(() => {
    setItems(value || ['']);
  }, [value]);
  // --- END OF FIX ---

  const triggerOnChange = (newItems) => {
    // Ensure field is defined before accessing its properties
    if (field && field.id) {
      onChange(field.id, newItems);
    }
  };

  const handleAddItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    triggerOnChange(newItems);
  };

  const handleRemoveItem = (indexToRemove) => {
    if (items.length <= 1) {
        return;
    }
    const newItems = items.filter((_, index) => index !== indexToRemove);
    setItems(newItems);
    triggerOnChange(newItems);
  };

  const handleItemChange = (indexToChange, text) => {
    const newItems = items.map((item, index) =>
      index === indexToChange ? text : item
    );
    setItems(newItems);
    triggerOnChange(newItems);
  };

  // Render nothing if the field configuration is not provided
  if (!field) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        {field.label}{field.required ? '*' : ''}
      </label>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <input
            type="text"
            value={item}
            placeholder={`${field.placeholder || 'Enter value'} #${index + 1}`}
            onChange={(e) => handleItemChange(index, e.target.value)}
            style={{ 
                flexGrow: 1, 
                marginRight: '8px', 
                padding: '8px', 
                borderRadius: '4px', 
                border: error ? '1px solid red' : '1px solid #ccc'
            }}
          />
          {/* The "Remove" button is now always available if there's more than one item */}
          {items.length > 1 && (
             <button 
                type="button" 
                onClick={() => handleRemoveItem(index)}
                style={{ padding: '8px 12px', border: 'none', backgroundColor: '#f44336', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
             >
                Remove
             </button>
          )}
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={handleAddItem}
        style={{ padding: '8px 12px', border: 'none', backgroundColor: '#4CAF50', color: 'white', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }}
      >
        + Add Rating
      </button> 
     

      {error && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0 0' }}>{error}</p>}
      {!error && field.helperText && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>{field.helperText}</p>}
    </div>
  );
}

export default DynamicListField;
