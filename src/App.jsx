import { useState, useRef, useEffect } from 'react';

function App() {
  // All state declarations
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  
  const [selectedShapeProps, setSelectedShapeProps] = useState({
    color: '#3B82F6',
    size: 100,
    rotation: 0,
    opacity: 1
  });

  // Refs for drag functionality
  const shapeRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const gridSize = 20;

  // History management functions
  const addToHistory = (newShapes) => {
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(JSON.parse(JSON.stringify(newShapes)));
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShapes(JSON.parse(JSON.stringify(history[currentStep - 1])));
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setShapes(JSON.parse(JSON.stringify(history[currentStep + 1])));
    }
  };

  // Shape management functions
  const addShape = (type) => {
    const newShape = {
      id: Date.now(),
      type,
      position: { x: 400 - selectedShapeProps.size/2, y: 300 - selectedShapeProps.size/2 }, // Center of canvas
      props: { ...selectedShapeProps }
    };
    const newShapes = [...shapes, newShape];
    setShapes(newShapes);
    addToHistory(newShapes);
    setSelectedShapeId(newShape.id);
  };

  const updateShape = (shapeId, newProps) => {
    const newShapes = shapes.map(shape => 
      shape.id === shapeId 
        ? { ...shape, props: { ...shape.props, ...newProps } }
        : shape
    );
    setShapes(newShapes);
  };

  // Mouse event handlers
  const handleMouseDown = (e, shapeId) => {
    e.stopPropagation();
    setSelectedShapeId(shapeId);
    isDragging.current = true;
    const shape = shapes.find(s => s.id === shapeId);
    if (shape) {
      offset.current = {
        x: e.clientX - shape.position.x,
        y: e.clientY - shape.position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && selectedShapeId) {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      
      let newX = e.clientX - rect.left - offset.current.x;
      let newY = e.clientY - rect.top - offset.current.y;
  
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
  
      const selectedShape = shapes.find(s => s.id === selectedShapeId);
      const shapeSize = selectedShape?.props?.size || 100;
  
      // Constrain to canvas boundaries
      newX = Math.max(0, Math.min(newX, 800 - shapeSize));
      newY = Math.max(0, Math.min(newY, 600 - shapeSize));
  
      setShapes(shapes.map(shape =>
        shape.id === selectedShapeId
          ? { ...shape, position: { x: newX, y: newY } }
          : shape
      ));
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      addToHistory(shapes);
    }
    isDragging.current = false;
  };
  // Export functionality
  const exportCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#2D2D2D';
    ctx.fillRect(0, 0, 800, 600);

    // Draw grid if visible
    if (showGrid) {
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x < 800; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      
      for (let y = 0; y < 600; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }
    }

    // Draw shapes
    shapes.forEach(shape => {
      ctx.save();
      ctx.translate(shape.position.x + shape.props.size / 2, shape.position.y + shape.props.size / 2);
      ctx.rotate((shape.props.rotation || 0) * Math.PI / 180);
      ctx.globalAlpha = shape.props.opacity || 1;
      ctx.fillStyle = shape.props.color;

      const size = shape.props.size;
      const halfSize = size / 2;

      switch (shape.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rectangle':
          ctx.fillRect(-halfSize, -halfSize, size, size);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -halfSize);
          ctx.lineTo(-halfSize, halfSize);
          ctx.lineTo(halfSize, halfSize);
          ctx.closePath();
          ctx.fill();
          break;
        case 'star':
          const spikes = 5;
          const outerRadius = halfSize;
          const innerRadius = halfSize / 2;
          
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
      ctx.restore();
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = dataUrl;
    link.click();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            exportCanvas();
            break;
          case 'c':
            e.preventDefault();
            if (selectedShapeId) {
              const shape = shapes.find(s => s.id === selectedShapeId);
              if (shape) {
                const newShape = {
                  ...shape,
                  id: Date.now(),
                  position: {
                    x: shape.position.x + 20,
                    y: shape.position.y + 20
                  }
                };
                const newShapes = [...shapes, newShape];
                setShapes(newShapes);
                addToHistory(newShapes);
                setSelectedShapeId(newShape.id);
              }
            }
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            if (selectedShapeId) {
              const newShapes = shapes.filter(s => s.id !== selectedShapeId);
              setShapes(newShapes);
              addToHistory(newShapes);
              setSelectedShapeId(null);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [shapes, selectedShapeId, history, currentStep]);
  // Main render
  return (
    <div className="h-screen w-screen flex bg-[#18191B]">
      {/* Left Sidebar */}
      <div className="w-[240px] min-h-screen bg-[#18191B] border-r border-[#2D2D2D] flex flex-col">
        {/* Logo and top buttons section */}
        <div className="p-4 space-y-3">
          <img src="/canva-logo.svg" alt="Canva" className="h-8 mb-2" />
          
          {/* Create design button with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#18191B] text-white rounded-md py-2 px-4 flex items-center gap-2 text-sm font-medium border border-[#2D2D2D] hover:bg-[#2D2D2D] transition-colors duration-200"
            >
              + Create a design
            </button>

            {/* Shapes Dropdown */}
            <div 
              className={`absolute left-0 w-48 mt-2 bg-[#2D2D2D] rounded-md shadow-lg z-50 transform transition-all duration-200 ease-in-out ${
                isDropdownOpen 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              {[
                { name: 'Circle', type: 'circle', icon: '⭕' },
                { name: 'Rectangle', type: 'rectangle', icon: '⬜' },
                { name: 'Triangle', type: 'triangle', icon: '▲' },
                { name: 'Star', type: 'star', icon: '⭐' }
              ].map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => {
                    addShape(shape.type);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#3D3D3D] transition-colors duration-150 first:rounded-t-md last:rounded-b-md flex items-center gap-2"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {shape.icon}
                  </span>
                  {shape.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-2">
            <button 
              onClick={undo} 
              className="p-2 text-white bg-[#2D2D2D] rounded-md hover:bg-[#3D3D3D] disabled:opacity-50"
              disabled={currentStep === 0}
              title="Undo (Ctrl+Z)"
            >
              ↩
            </button>
            <button 
              onClick={redo} 
              className="p-2 text-white bg-[#2D2D2D] rounded-md hover:bg-[#3D3D3D] disabled:opacity-50"
              disabled={currentStep === history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              ↪
            </button>
            <button 
              onClick={() => setShowGrid(!showGrid)} 
              className={`p-2 text-white rounded-md hover:bg-[#3D3D3D] ${showGrid ? 'bg-[#3D3D3D]' : 'bg-[#2D2D2D]'}`}
              title="Toggle Grid"
            >
              #
            </button>
            <button 
              onClick={() => setSnapToGrid(!snapToGrid)} 
              className={`p-2 text-white rounded-md hover:bg-[#3D3D3D] ${snapToGrid ? 'bg-[#3D3D3D]' : 'bg-[#2D2D2D]'}`}
              title="Toggle Snap to Grid"
            >
              🔲
            </button>
            <button 
              onClick={exportCanvas} 
              className="p-2 text-white bg-[#2D2D2D] rounded-md hover:bg-[#3D3D3D]"
              title="Export (Ctrl+S)"
            >
              💾
            </button>
          </div>

          {/* Upgrade button */}
          <button className="w-full text-left py-2 px-3 flex items-center gap-2 text-sm text-white bg-[#18191B] border border-[#2D2D2D] rounded-md">
            ⭐ Upgrade to Canva Pro
          </button>
        </div>

        {/* Main navigation */}
        <nav className="mt-2 border-b border-[#2D2D2D]">
          <div className="flex">
            <a href="#" className="px-4 py-2 text-sm text-[#8B3DFF] border-b-2 border-[#8B3DFF]">
              🏠 Home
            </a>
            <a href="#" className="px-4 py-2 text-sm text-gray-400">
              📁 Projects
            </a>
            <a href="#" className="px-4 py-2 text-sm text-gray-400">
              📄 Templates
            </a>
          </div>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Search Bar */}
        <div className="h-14 bg-[#18191B] border-b border-[#2D2D2D] flex items-center px-4 justify-between">
          <div className="w-[480px]">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search your content and Canva's"
                className="w-full h-9 pl-9 pr-4 bg-[#2D2D2D] rounded-md text-sm text-white focus:outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#2D2D2D] rounded-md text-white">⚙️</button>
            <button className="p-2 hover:bg-[#2D2D2D] rounded-md text-white">🔔</button>
            <div className="w-8 h-8 rounded-full bg-gray-600 ml-2"></div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="flex-1 bg-[#18191B] p-6 overflow-auto relative"
          onClick={() => setSelectedShapeId(null)}
        >
          {/* Document Types */}
          <div className="flex gap-4 justify-start mb-8">
            {[
              { name: 'Doc', icon: '📄', color: '#00C4CC' },
              { name: 'Whiteboard', icon: '🖊️', color: '#00C4CC' },
              { name: 'Presentation', icon: '📊', color: '#00C4CC' },
              { name: 'Social media', icon: '📱', color: '#00C4CC' },
              { name: 'Video', icon: '🎥', color: '#00C4CC' },
              { name: 'Printables', icon: '🖨️', color: '#00C4CC' },
              { name: 'Website', icon: '🌐', color: '#00C4CC' }
            ].map((item) => (
              <button 
                key={item.name} 
                className="flex flex-col items-center gap-2 p-2 hover:bg-[#2D2D2D] rounded-md group"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white">{item.name}</span>
              </button>
            ))}
          </div>

          {/* AI Features */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Make me an image', icon: '🎨' },
              { name: 'Write my first draft', icon: '✍️' },
              { name: 'Resize any design', icon: '📐' },
              { name: 'Remove backgrounds', icon: '✨' }
            ].map((feature) => (
              <div 
                key={feature.name}
                className="bg-[#2D2D2D] p-4 rounded-lg hover:bg-[#3D3D3D] transition-colors cursor-pointer flex items-center gap-3"
              >
                <span>{feature.icon}</span>
                <span className="text-sm text-white">{feature.name}</span>
              </div>
            ))}
          </div>

          {/* Canvas Area */}
          
          <div 
          className="relative w-[800px] h-[600px] bg-[#2D2D2D] rounded-lg shadow-lg mx-auto overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setSelectedShapeId(null);
    }
  }}
>
            {/* Grid */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: Math.floor(800/gridSize) }).map((_, i) => (
                  <div
                    key={`vertical-${i}`}
                    className="absolute top-0 bottom-0 border-l border-gray-600 opacity-20"
                    style={{ left: `${i * gridSize}px` }}
                  />
                ))}
                {Array.from({ length: Math.floor(600/gridSize) }).map((_, i) => (
                  <div
                    key={`horizontal-${i}`}
                    className="absolute left-0 right-0 border-t border-gray-600 opacity-20"
                    style={{ top: `${i * gridSize}px` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    
            {/* Shapes */}
            {shapes.map((shape) => (
              <div 
                key={shape.id}
                className={`absolute cursor-move ${getShapeStyles(shape.type)}`}
                style={{
                  left: `${shape.position.x}px`,
                  top: `${shape.position.y}px`,
                  backgroundColor: shape.props.color,
                  transform: `rotate(${shape.props.rotation}deg)`,
                  opacity: shape.props.opacity,
                  width: `${shape.props.size}px`,
                  height: `${shape.props.size}px`
                }}
                // In the shape div's onMouseDown handler
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, shape.id);
                }}
              />
            ))}

            {/* Properties Panel */}
            {selectedShapeId && (
              <div className="absolute right-6 top-6 w-64 bg-[#2D2D2D] p-4 rounded-lg border border-[#3D3D3D]">
                <h3 className="text-white mb-4">Properties</h3>
                
                {/* Color Picker */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">Color</label>
                  <input 
                    type="color" 
                    value={selectedShapeProps.color}
                    onChange={(e) => {
                      const newProps = { ...selectedShapeProps, color: e.target.value };
                      setSelectedShapeProps(newProps);
                      updateShape(selectedShapeId, newProps);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Size Slider */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">Size</label>
                  <input 
                    type="range"
                    min="20"
                    max="200"
                    value={selectedShapeProps.size}
                    onChange={(e) => {
                      const newProps = { ...selectedShapeProps, size: parseInt(e.target.value) };
                      setSelectedShapeProps(newProps);
                      updateShape(selectedShapeId, newProps);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Rotation Slider */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">Rotation</label>
                  <input 
                    type="range"
                    min="0"
                    max="360"
                    value={selectedShapeProps.rotation}
                    onChange={(e) => {
                      const newProps = { ...selectedShapeProps, rotation: parseInt(e.target.value) };
                      setSelectedShapeProps(newProps);
                      updateShape(selectedShapeId, newProps);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">Opacity</label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={selectedShapeProps.opacity * 100}
                    onChange={(e) => {
                      const newProps = { ...selectedShapeProps, opacity: parseInt(e.target.value) / 100 };
                      setSelectedShapeProps(newProps);
                      updateShape(selectedShapeId, newProps);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Layers Panel */}
            <div className="absolute left-6 bottom-6 w-64 bg-[#2D2D2D] p-4 rounded-lg border border-[#3D3D3D]">
              <h3 className="text-white mb-4">Layers</h3>
              <div className="space-y-2">
                {shapes.map((shape) => (
                  <div 
                    key={shape.id}
                    className={`flex items-center p-2 rounded cursor-pointer ${
                      selectedShapeId === shape.id ? 'bg-[#3D3D3D]' : ''
                    }`}
                    onClick={() => setSelectedShapeId(shape.id)}
                  >
                    <span className="text-white capitalize">{shape.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        
      );
}

function getShapeStyles(shape) {
  const styles = {
    circle: "rounded-full",
    rectangle: "",
    triangle: "clip-path-triangle",
    star: "clip-path-star"
  };
  return styles[shape] || '';
}

export default App;