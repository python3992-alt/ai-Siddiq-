import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🙏', '❤️', '🔥', '✨', '🎉', '💯'];

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-slate-700 bg-[#202c33] p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            disabled={disabled}
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-[#2a3942] rounded-lg shadow-lg p-3 grid grid-cols-7 gap-2 z-10">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan"
          disabled={disabled}
          className="flex-1 bg-[#2a3942] text-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00a884] disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-2 bg-[#00a884] text-white rounded-full hover:bg-[#00a884]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
