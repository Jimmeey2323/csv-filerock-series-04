
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesAdded,
  accept = '.csv',
  maxFiles = 10,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const csvFiles = droppedFiles.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
        
        if (csvFiles.length === 0) {
          toast.error('Please upload CSV files only');
          return;
        }
        
        if (csvFiles.length > maxFiles) {
          toast.error(`You can only upload up to ${maxFiles} files at once`);
          return;
        }
        
        onFilesAdded(csvFiles);
      }
    },
    [maxFiles, onFilesAdded]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles.length > maxFiles) {
          toast.error(`You can only upload up to ${maxFiles} files at once`);
          return;
        }
        
        onFilesAdded(selectedFiles);
      }
    },
    [maxFiles, onFilesAdded]
  );

  const openFileSelector = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div 
      className={cn(
        "w-full p-8 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out",
        "bg-white/40 backdrop-blur-sm hover:bg-white/60",
        "flex flex-col items-center justify-center text-center",
        "animate-fade-in",
        dragActive && "drag-active"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        className="hidden"
      />
      
      <div className="mb-6 p-4 rounded-full bg-primary/10 text-primary">
        {dragActive ? (
          <FilePlus size={36} className="animate-float" />
        ) : (
          <Upload size={36} className="animate-pulse-soft" />
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {dragActive ? "Drop files here" : "Drag & Drop CSV Files"}
      </h3>
      
      <p className="text-muted-foreground mb-4 max-w-md">
        Upload your CSV files by dragging & dropping them here, or click the button below
      </p>
      
      <div className="flex gap-3">
        <Button 
          onClick={openFileSelector}
          className="button-hover group"
          size="lg"
        >
          <File className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
          Select Files
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
