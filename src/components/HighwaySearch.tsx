import React, { useState } from 'react';

export const HighwaySearch: React.FC<{ onSearch: (highway: string) => void }> = ({ onSearch }) => {
  const [input, setInput] = useState('');
  return (
    <div className="mb-4 flex items-center">
      <input
        type="text"
        placeholder="Enter highway name (e.g., NH 48)"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border p-2 rounded w-2/3"
      />
      <button
        onClick={() => onSearch(input)}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Show
      </button>
    </div>
  );
}; 