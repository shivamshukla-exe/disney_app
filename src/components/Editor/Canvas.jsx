

import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable'; // Install react-draggable

const Canvas = () => {
  const [currentElement, setCurrentElement] = useState(null);
  const canvasRef = useRef(null);

  const renderShape = () => {
    if (!currentElement) return null;

    const shapeStyles = {
      circle: "w-20 h-20 rounded-full bg-blue-500",
      rectangle: "w-24 h-16 bg-green-500",
      triangle: "w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[52px] border-b-red-500"
    };

    return (
      <Draggable bounds="parent">
        <div className={`absolute cursor-move ${shapeStyles[currentElement]}`} />
      </Draggable>
    );
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-[800px] h-[600px] bg-white shadow-lg mx-auto"
    >
      {renderShape()}
    </div>
  );
};

export default Canvas;