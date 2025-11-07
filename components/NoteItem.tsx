
import React from 'react';
import { Note } from '../types';
import { FileTextIcon } from './icons';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, isActive, onClick }) => {
  const contentSnippet = note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '');

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-brand-primary/20' : 'hover:bg-slate-800'
      }`}
    >
      <div className="flex items-start space-x-3">
        <FileTextIcon className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <h3 className="font-semibold text-slate-200 truncate">{note.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{contentSnippet}</p>
        </div>
      </div>
    </button>
  );
};

export default NoteItem;
