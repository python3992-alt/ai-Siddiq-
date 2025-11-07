

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '../types';
import { WandSparklesIcon, MicIcon, StopCircleIcon, SaveIcon, CameraIcon, SendIcon, MenuIcon, SwitchCameraIcon, ImageIcon, DownloadIcon, SquareIcon, RectangleHorizontalIcon, RectangleVerticalIcon } from './icons';
import Spinner from './Spinner';
import { summarizeAudioStream, describeImageStream, generateImage } from '../services/geminiService';

interface EditorProps {
  note: Note;
  onUpdate: (updatedNote: Partial<Note>) => void;
  onSummarize: (content: string) => Promise<void>;
  onAskAi: (question: string) => Promise<void>;
  isLoading: boolean;
  statusMessage: string;
  showStatus: (message: string, duration?: number) => void;
  onToggleSidebar: () => void;
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, onSummarize, onAskAi, isLoading, statusMessage, showStatus, onToggleSidebar }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('Ini gambar apaan sih?');
  const [aiImageResponse, setAiImageResponse] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Image Generation State
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);


  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
  }, [note]);
  
  // Effect to handle camera stream connection
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleSave = () => {
    onUpdate({ title, content });
  };
  
  const handleSummarizeClick = () => {
    onSummarize(content);
  };

  const handleAskAiClick = async () => {
    if (!aiPrompt.trim()) {
        showStatus('Isi dulu pertanyaannya, bos.', 2000);
        return;
    }
    await onAskAi(aiPrompt);
    setAiPrompt('');
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAskAiClick();
    }
  };


  // --- Voice Recording Logic (Refactored) ---
  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }
  }, [isRecording]);
  
  const startRecording = async () => {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        setIsRecording(true);
        showStatus('Lagi ngerekam... Siddiq Pintar nyimak nih.');
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            showStatus('Proses voice note bentar...', 5000);
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            if (audioBlob.size === 0) {
                showStatus('Gak ada suaranya bro.', 3000);
                return;
            }

            try {
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    setContent(prev => (prev ? prev + '\n\n' : '') + `Ringkasan Voice Note:\n`);
                    await summarizeAudioStream(base64Audio, audioBlob.type, (chunk) => {
                       setContent(prev => prev + chunk);
                    });
                    showStatus('Voice note beres diringkas!', 3000);
                };
            } catch (error) {
                console.error(error);
                showStatus('Gagal ngeringkas voice note.', 3000);
            }
        };
        
        mediaRecorder.start();
    } catch (err) {
        console.error("Failed to get media devices.", err);
        showStatus('Waduh, mikrofonnya gak diizinin.', 3000);
    }
  };

  // --- Camera Logic (Refactored with Flip) ---
  const handleOpenCamera = async () => {
    if (isCameraOpen) return;
    try {
        setFacingMode('user'); // Always start with front camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setCameraStream(stream);
        setIsCameraOpen(true);
    } catch (err) {
        console.error("Error accessing camera:", err);
        showStatus('Waduh, kameranya gak diizinin.', 3000);
    }
  };

  const handleFlipCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacingMode } });
        setCameraStream(stream);
        setFacingMode(newFacingMode);
    } catch (err) {
        console.error("Error flipping camera:", err);
        showStatus('Gagal ganti kamera.', 3000);
        // Try to restart with the previous mode if flipping fails
        try {
            const originalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
            setCameraStream(originalStream);
        } catch (restartErr) {
            console.error("Failed to restart original camera stream", restartErr);
            handleCloseCamera();
        }
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
    setCapturedImage(null);
    setAiImageResponse(null);
    setIsProcessingImage(false);
    setImagePrompt('Ini gambar apaan sih?');
    setFacingMode('user'); // Reset to default
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
    }
  };
  
  const handleRetakePhoto = () => {
      setCapturedImage(null);
      setAiImageResponse(null);
      handleOpenCamera();
  };
  
  const handleDescribeImage = async () => {
      if (!capturedImage) return;
      setIsProcessingImage(true);
      setAiImageResponse('');
      try {
          const base64Data = capturedImage.split(',')[1];
          await describeImageStream(base64Data, imagePrompt, (chunk) => {
            setAiImageResponse(prev => (prev || '') + chunk);
          });
      } catch (error) {
          console.error(error);
          setAiImageResponse("Sori, gak bisa analisa gambarnya.");
      } finally {
          setIsProcessingImage(false);
      }
  };
  
  const handleInsertIntoNote = () => {
      if (!capturedImage) return;
      let textToInsert = `![Gambar dari Siddiq Pintar](${capturedImage})`;
      if (aiImageResponse) {
          textToInsert += `\n\nJawaban Siddiq Pintar:\n${aiImageResponse}`;
      }
      setContent(prev => (prev ? prev + '\n\n' : '') + textToInsert);
      handleCloseCamera();
  };

  // --- Image Generation Logic ---
  const handleOpenImageGenerator = () => {
    setIsImageGeneratorOpen(true);
  };
  
  const handleCloseImageGenerator = () => {
    setIsImageGeneratorOpen(false);
    setImageGenerationPrompt('');
    setGeneratedImageUrl(null);
    setIsGeneratingImage(false);
  };
  
  const handleGenerateImage = async () => {
    if (!imageGenerationPrompt.trim()) {
        showStatus('Mau gambar apa? Tulis dulu.', 2000);
        return;
    }
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    try {
        const base64Data = await generateImage(imageGenerationPrompt);
        setGeneratedImageUrl(`data:image/png;base64,${base64Data}`);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("only accessible to billed users")) {
            showStatus('Gagal: Fitur ini memerlukan akun dengan billing aktif.', 5000);
        } else {
            showStatus('Gagal buat gambar, coba lagi nanti.', 3000);
        }
    } finally {
        setIsGeneratingImage(false);
    }
  };
  
  const handleInsertGeneratedImage = () => {
    if (!generatedImageUrl) return;
    const textToInsert = `![Gambar AI: ${imageGenerationPrompt}](${generatedImageUrl})`;
    setContent(prev => (prev ? prev + '\n\n' : '') + textToInsert);
    handleCloseImageGenerator();
  };

  const handleDownloadGeneratedImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    const sanitizedPrompt = imageGenerationPrompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50);
    link.download = `siddiq-pintar-${sanitizedPrompt || 'gambar'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Gambar lagi diunduh!', 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-sm rounded-lg">
      {/* Header */}
      <header className="flex-shrink-0 p-4 border-b border-slate-800 flex items-center">
        <button onClick={onToggleSidebar} className="p-2 -ml-2 mr-2 text-slate-400 hover:text-white md:hidden" title="Open sidebar">
            <MenuIcon className="w-6 h-6"/>
        </button>
        <div className="flex items-center space-x-2 flex-grow min-w-0">
            <input 
                type="text" 
                value={title}
                onChange={handleTitleChange}
                className="bg-transparent text-xl font-bold text-white focus:outline-none w-full truncate"
                placeholder="Judul Catetan"
            />
        </div>
        <div className="flex items-center space-x-2 pl-4">
           <span className="text-sm text-slate-400 hidden sm:inline">{statusMessage}</span>
            <button onClick={handleSave} className="p-2 rounded-md hover:bg-slate-800 transition-colors" title="Simpen Catetan">
                <SaveIcon className="w-5 h-5 text-slate-400" />
            </button>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-grow p-6 overflow-y-auto">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Mulai nulis di sini..."
          className="w-full h-full bg-transparent text-slate-200 resize-none focus:outline-none text-lg leading-relaxed"
        />
      </div>

      {/* Footer / Toolbar */}
      <footer className="flex-shrink-0 p-4 border-t border-slate-800">
        <div>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    placeholder="Tanya apa aja ke Siddiq Pintar..."
                    className="flex-grow bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-md p-2 text-slate-200"
                    disabled={isLoading || isRecording || isCameraOpen || isImageGeneratorOpen}
                />
                <button
                    onClick={handleAskAiClick}
                    disabled={isLoading || isRecording || isCameraOpen || isImageGeneratorOpen || !aiPrompt.trim()}
                    className="flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 flex-shrink-0"
                    title="Tanya Siddiq Pintar"
                >
                    {isLoading ? <Spinner /> : <SendIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-start md:justify-end gap-2">
            <button
                onClick={handleSummarizeClick}
                disabled={isLoading || isRecording || isCameraOpen || isImageGeneratorOpen}
                className="flex items-center space-x-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Spinner/> : <WandSparklesIcon className="w-5 h-5" />}
                <span>Ringkasin</span>
            </button>
             <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isCameraOpen || isImageGeneratorOpen}
                className={`flex items-center space-x-2 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
            >
                {isRecording ? <StopCircleIcon className="w-5 h-5"/> : <MicIcon className="w-5 h-5" />}
                <span>{isRecording ? 'Stop' : 'Voice Note'}</span>
            </button>
            <button
                onClick={handleOpenCamera}
                disabled={isLoading || isRecording || isImageGeneratorOpen}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CameraIcon className="w-5 h-5" />
                <span>Tanya Foto</span>
            </button>
            <button
                onClick={handleOpenImageGenerator}
                disabled={isLoading || isRecording || isCameraOpen}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ImageIcon className="w-5 h-5" />
                <span>Buat Gambar</span>
            </button>
        </div>
      </footer>
      
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg shadow-2xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">Tanya Siddiq Pintar Soal Foto</h2>
                <div className="relative mb-4 flex-grow flex items-center justify-center bg-slate-800 rounded-md overflow-hidden min-h-[200px]">
                    {!capturedImage ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
                    ) : (
                        <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain"/>
                    )}
                     <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                 
                {!capturedImage ? (
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={handleCloseCamera} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">Batal</button>
                        <button onClick={handleCapturePhoto} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg">Ambil Foto</button>
                        <button onClick={handleFlipCamera} className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-3 rounded-full transition-colors" title="Balik Kamera">
                            <SwitchCameraIcon className="w-6 h-6"/>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 overflow-y-auto">
                        <input
                            type="text"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="Tanya apa soal gambar ini..."
                            className="w-full bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                         {isProcessingImage && (
                            <div className="flex items-center space-x-2 text-slate-400">
                                <Spinner />
                                <span>Siddiq Pintar lagi ngecek gambar...</span>
                            </div>
                        )}
                        {aiImageResponse && (
                            <div className="bg-slate-800/50 p-3 rounded-md max-h-40 overflow-y-auto">
                                <p className="text-slate-300 whitespace-pre-wrap">{aiImageResponse}</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                             <button onClick={handleDescribeImage} disabled={isProcessingImage} className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                                {isProcessingImage ? 'Menganalisa...' : 'Tanya'}
                            </button>
                            <button onClick={handleInsertIntoNote} disabled={!aiImageResponse && !capturedImage} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">Masukin ke Catetan</button>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                             <button onClick={handleRetakePhoto} className="flex-1 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg">Ulang</button>
                             <button onClick={handleCloseCamera} className="flex-1 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg">Tutup</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Image Generator Modal */}
      {isImageGeneratorOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg shadow-2xl p-6 w-full max-w-2xl flex flex-col max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4 flex-shrink-0">Buat Gambar dengan AI</h2>
                
                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto mb-4 pr-2">
                    <div className="mb-4">
                        <textarea
                            value={imageGenerationPrompt}
                            onChange={(e) => setImageGenerationPrompt(e.target.value)}
                            placeholder="Contoh: Kucing astronot naik skateboard di bulan..."
                            className="w-full bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            rows={3}
                            disabled={isGeneratingImage}
                        />
                    </div>

                    <div className="relative flex items-center justify-center bg-slate-800 rounded-md overflow-hidden min-h-[250px]">
                        {isGeneratingImage && (
                            <div className="flex flex-col items-center space-y-2 text-slate-400">
                                <Spinner />
                                <span>Siddiq Pintar lagi ngegambar...</span>
                            </div>
                        )}
                        {generatedImageUrl && !isGeneratingImage && (
                            <img src={generatedImageUrl} alt="Generated by AI" className="max-h-full max-w-full object-contain"/>
                        )}
                        {!generatedImageUrl && !isGeneratingImage && (
                            <div className="text-slate-500 text-center p-4">
                                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                                <p>Gambar buatan AI bakal muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 pt-4 border-t border-slate-800">
                    <button onClick={handleCloseImageGenerator} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Tutup</button>
                    <button onClick={handleGenerateImage} disabled={isGeneratingImage || !imageGenerationPrompt.trim()} className="flex-1 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        {generatedImageUrl ? 'Buat Lagi' : 'Buat Gambar'}
                    </button>
                    <button onClick={handleDownloadGeneratedImage} disabled={!generatedImageUrl || isGeneratingImage} className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Unduh</span>
                    </button>
                    <button onClick={handleInsertGeneratedImage} disabled={!generatedImageUrl || isGeneratingImage} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        Masukin ke Catetan
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Editor;