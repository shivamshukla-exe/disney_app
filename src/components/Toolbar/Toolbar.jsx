const Toolbar = () => {
    return (
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="text-sm">Text</span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="text-sm">Shapes</span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <span className="text-sm">Images</span>
          </button>
        </div>
      </div>
    );
  };
  
  export default Toolbar;