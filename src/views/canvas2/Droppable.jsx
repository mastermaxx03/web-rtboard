import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id
  });
  const style = {
    border: '2px dashed gray',
    height: '200px',
    width: '200px',
    backgroundColor: isOver ? 'lightgray' : 'white'
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
