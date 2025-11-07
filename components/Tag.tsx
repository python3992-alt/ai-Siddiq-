
import React from 'react';

interface TagProps {
  label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => {
  return (
    <span className="inline-block bg-slate-700 text-slate-200 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full">
      {label}
    </span>
  );
};

export default Tag;
