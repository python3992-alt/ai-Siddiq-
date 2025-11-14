import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Note } from './types';
import { INITIAL_NOTES } from './constants';
import { summarizeTextStream, getAiResponseStream, generateImage } from './services/geminiService';
import Editor from './components/Editor';
import { PlusIcon, FileTextIcon, CloudIcon, BrainCircuitIcon, XIcon, MenuIcon } from './components/icons';
import NoteItem from './components/NoteItem';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(INITIAL_NOTES[0]?.id || null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Siap');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Jika tidak ada catatan saat aplikasi dimuat, buat yang baru untuk langsung menampilkan editor.
    // Jika ada catatan tapi tidak ada yang dipilih, pilih yang pertama.
    if (notes.length === 0) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'Siddiq Pintar',
        content: '',
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote]);
      setActiveNoteId(newNote.id);
    } else if (!activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId) || null, [notes, activeNoteId]);

  const showStatus = (message: string, duration: number = 3000) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage('Siap'), duration);
  };
  
  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    setSidebarOpen(false); // Close sidebar on note selection on mobile
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Siddiq Pintar',
      content: '',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    setSidebarOpen(false); // Close sidebar after creating a new note on mobile
  };

  const handleUpdateNote = useCallback((updatedNote: Partial<Note>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === activeNoteId ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
      )
    );
    showStatus('Catetan kesimpen!', 2000);
  }, [activeNoteId]);

  const handleSummarize = async (content: string) => {
    if (!content) {
      showStatus('Catetan kosong gabisa diringkas.', 3000);
      return;
    }
    if (!activeNoteId) return;

    setIsLoading(true);
    setStatusMessage('Siddiq Pintar lagi mikir...');
    
    // Clear content first for streaming
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === activeNoteId ? { ...note, content: '', updatedAt: new Date().toISOString() } : note
      )
    );

    try {
      await summarizeTextStream(content, (chunk) => {
          setNotes(prevNotes =>
              prevNotes.map(note =>
                  note.id === activeNoteId 
                      ? { ...note, content: note.content + chunk, updatedAt: new Date().toISOString() } 
                      : note
              )
          );
      });
      showStatus('Diringkas sama Siddiq Pintar!', 3000);
    } catch (error) {
      console.error(error);
      showStatus('Error pas ngeringkas.', 3000);
      // Restore original content on error
      handleUpdateNote({ content });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAskAi = async (question: string) => {
    if (!activeNoteId) return;
    setIsLoading(true);
    setStatusMessage('Siddiq Pintar lagi mikir...');

    // Add prefix for the answer
    setNotes(prevNotes =>
        prevNotes.map(note =>
            note.id === activeNoteId ? { ...note, content: note.content + '\n\n', updatedAt: new Date().toISOString() } : note
        )
    );

    try {
        await getAiResponseStream(question, (chunk) => {
            setNotes(prevNotes =>
              prevNotes.map(note =>
                note.id === activeNoteId ? { ...note, content: note.content + chunk, updatedAt: new Date().toISOString() } : note
              )
            );
        });
        showStatus('Jawaban udah masuk!', 3000);

    } catch (error) {
        console.error(error);
        showStatus("Maaf, gak dapet jawaban.", 3000);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (!activeNoteId) return;
    setIsLoading(true);
    setStatusMessage('Siddiq AI lagi bikin gambar...');

    try {
      const base64Image = await generateImage(prompt);
      
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === activeNoteId 
            ? { 
                ...note, 
                images: [...(note.images || []), base64Image],
                updatedAt: new Date().toISOString() 
              } 
            : note
        )
      );
      showStatus('Gambar udah jadi!', 3000);
    } catch (error) {
      console.error(error);
      showStatus('Gagal bikin gambar.', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-transparent text-slate-200 font-sans flex h-screen overflow-hidden">
       {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex flex-col w-80 max-w-[calc(100%-2rem)] transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <header className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
           <div className="flex items-center space-x-2">
            <BrainCircuitIcon className="h-7 w-7 text-brand-primary" />
            <h1 className="text-xl font-bold text-white">Siddiq Pintar</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white md:hidden" title="Close sidebar">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-2 flex-shrink-0">
          <button
            onClick={handleNewNote}
            className="w-full flex items-center justify-center space-x-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Siddiq Pintar</span>
          </button>
        </div>
        <nav className="flex-grow overflow-y-auto p-2 space-y-1">
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onClick={() => handleSelectNote(note.id)}
            />
          ))}
        </nav>
        <footer className="p-4 border-t border-slate-800 flex items-center space-x-2 text-sm text-slate-400 flex-shrink-0">
          <CloudIcon className="w-5 h-5 text-green-400" />
          <span>Nyambung</span>
          <div className="flex-grow" />
          <span>{notes.length} catetan</span>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <Editor
            key={activeNote.id}
            note={activeNote}
            onUpdate={handleUpdateNote}
            onSummarize={handleSummarize}
            onAskAi={handleAskAi}
            onGenerateImage={handleGenerateImage}
            isLoading={isLoading}
            statusMessage={statusMessage}
            showStatus={showStatus}
            onToggleSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-4">
             <header className="absolute top-0 left-0 p-4 md:hidden">
                <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white" title="Open sidebar">
                    <MenuIcon className="w-6 h-6"/>
                </button>
            </header>
            <FileTextIcon className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-semibold">Pilih catetan atau bikin baru</h2>
            <p>Asisten pinter lo udah siap.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;