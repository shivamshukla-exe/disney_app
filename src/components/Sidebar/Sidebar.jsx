import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react'; // Install lucide-react for icons

const Sidebar = ({ onElementSelect }) => {
  const [openMenus, setOpenMenus] = useState({
    shapes: false,
    text: false,
    images: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const shapes = [
    { name: 'Circle', type: 'circle' },
    { name: 'Rectangle', type: 'rectangle' },
    { name: 'Triangle', type: 'triangle' }
  ];

  return (
    <div className="w-64 h-full bg-[#252526] text-white border-r border-[#3C3C3C]">
      <div className="p-2">
        {/* Shapes Dropdown */}
        <div className="mb-1">
          <button 
            onClick={() => toggleMenu('shapes')}
            className="w-full p-2 hover:bg-[#37373D] flex items-center justify-between rounded"
          >
            <span className="flex items-center gap-2">
              {openMenus.shapes ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Shapes
            </span>
          </button>
          
          <div className={`overflow-hidden transition-all duration-200 ease-in-out
            ${openMenus.shapes ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            {shapes.map((shape) => (
              <button
                key={shape.type}
                onClick={() => onElementSelect(shape.type)}
                className="w-full p-2 pl-8 hover:bg-[#37373D] text-left text-sm"
              >
                {shape.name}
              </button>
            ))}
          </div>
        </div>

        {/* Add similar dropdowns for Text and Images */}
      </div>
    </div>
  );
};

export default Sidebar;