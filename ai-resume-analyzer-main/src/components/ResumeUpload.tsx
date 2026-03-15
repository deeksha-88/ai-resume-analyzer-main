import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.entry"
pdfjsLib.GlobalWorkerOptions.workerPort=new pdfWorker();

interface ResumeUploadProps {
  resumeText: string;
  onResumeTextChange: (text: string) => void;
  onFileNameChange: (name: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ resumeText, onResumeTextChange, onFileNameChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractText = useCallback(async (file: File) => {
    const name = file.name.toLowerCase();
    
    if (name.endsWith('.txt')) {
      const text = await file.text();
      onResumeTextChange(text);
      setFileName(file.name);
      onFileNameChange(file.name);
      return;
    }

    if (name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      onResumeTextChange(result.value);
      setFileName(file.name);
      onFileNameChange(file.name);
      return;
    }

if (name.endsWith('.pdf')) {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf'); // legacy build
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }

    // pass text only if length is reasonable
    if (fullText.trim().length > 50) { 
      onResumeTextChange(fullText);
      setFileName(file.name);
      onFileNameChange(file.name);
    } else {
      alert('This PDF does not appear to be a valid resume. Please upload a proper resume.');
    }

  } catch (err) {
    console.error('PDF parsing error:', err);
    alert('Failed to read PDF. Please try another file.');
  }
  return;
}
  }, [onResumeTextChange, onFileNameChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) extractText(file);
  }, [extractText]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) extractText(file);
  }, [extractText]);

  const clearFile = () => {
    setFileName('');
    onResumeTextChange('');
    onFileNameChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="section-label">Step 1: Your Resume</label>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-700" />
        <div
          className={`glass-card p-8 min-h-[320px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging ? 'border-primary/50 bg-primary/5' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !fileName && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {fileName ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="text-primary" size={32} />
              </div>
              <p className="text-foreground font-semibold">{fileName}</p>
              <p className="text-muted-foreground text-sm">File loaded successfully</p>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="mt-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-sm flex items-center gap-2 transition-colors"
              >
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <>
              <Upload className="text-accent mb-4" size={40} />
              <p className="text-foreground font-medium mb-2">Drop your resume here or click to browse</p>
              <p className="text-muted-foreground text-sm mb-6">Supports PDF, DOCX, and Plain Text</p>
            </>
          )}
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-widest">Or paste text</span></div>
      </div>
      
      <textarea
        className="w-full bg-secondary/50 border border-border rounded-xl p-4 text-sm font-mono focus:ring-1 ring-accent outline-none h-32 resize-none text-foreground placeholder:text-muted-foreground"
        placeholder="Paste your resume text here..."
        value={resumeText}
        onChange={(e) => { onResumeTextChange(e.target.value); setFileName(''); onFileNameChange(''); }}
      />
    </div>
  );
};

export default ResumeUpload;
