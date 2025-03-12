
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';
import FileList from '@/components/FileList';
import ProcessingLoader from '@/components/ProcessingLoader';
import FilterBar from '@/components/FilterBar';
import ResultsTable from '@/components/ResultsTable';
import { parseCSV, categorizeFiles, getFileTypes } from '@/utils/csvParser';
import { processData, ProcessedTeacherData, ProcessingProgress } from '@/utils/dataProcessor';

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [processedData, setProcessedData] = useState<ProcessedTeacherData[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<ProcessedTeacherData[]>([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detailed'>('table');

  // Update progress
  const updateProgress = useCallback((progressData: ProcessingProgress) => {
    setProgress(progressData.progress);
    setCurrentStep(progressData.currentStep);
  }, []);

  // Handle file upload
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  // Remove a file
  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  // Process files
  const handleProcessFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload files first');
      return;
    }

    // Categorize files
    const categorized = categorizeFiles(files);
    
    if (!categorized.new) {
      toast.error('Missing New client file. Please upload a file with "new" in the name');
      return;
    }
    
    if (!categorized.bookings) {
      toast.error('Missing Bookings file. Please upload a file with "bookings" in the name');
      return;
    }
    
    setIsProcessing(true);
    updateProgress({ progress: 0, currentStep: 'Starting processing...' });

    try {
      // Parse CSV files
      updateProgress({ progress: 10, currentStep: 'Parsing CSV files...' });
      const newFileResult = await parseCSV(categorized.new);
      const bookingsFileResult = await parseCSV(categorized.bookings);
      
      // Check if payments file exists
      let salesFileResult = { data: [] };
      if (categorized.payments) {
        salesFileResult = await parseCSV(categorized.payments);
      }
      
      // Process data
      const result = await processData(
        newFileResult.data,
        bookingsFileResult.data,
        salesFileResult.data,
        updateProgress
      );
      
      // Update state with processed data
      setProcessedData(result.processedData);
      setFilteredData(result.processedData);
      setLocations(result.locations);
      setTeachers(result.teachers);
      setPeriods(result.periods);
      
      // Show success and finish processing
      setTimeout(() => {
        setIsProcessing(false);
        setResultsVisible(true);
        toast.success('Files processed successfully');
      }, 1000);
    } catch (error) {
      console.error('Error processing files:', error);
      setIsProcessing(false);
      toast.error('Error processing files. Please check your file format and try again');
    }
  }, [files, updateProgress]);

  // Handle filter changes
  const handleFilterChange = useCallback((filters: { location?: string; teacher?: string; period?: string; search?: string }) => {
    let filtered = [...processedData];
    
    // Filter by location
    if (filters.location && filters.location !== 'all-locations') {
      filtered = filtered.filter(item => item.location === filters.location);
    }
    
    // Filter by teacher
    if (filters.teacher && filters.teacher !== 'all-teachers') {
      filtered = filtered.filter(item => item.teacherName === filters.teacher);
    }
    
    // Filter by period
    if (filters.period && filters.period !== 'all-periods') {
      filtered = filtered.filter(item => item.period === filters.period);
    }
    
    // Filter by search (teacher name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.teacherName.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredData(filtered);
  }, [processedData]);

  // Handle view mode change
  const handleViewModeChange = (mode: 'table' | 'cards' | 'detailed') => {
    setViewMode(mode);
  };

  // Apply fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('container')?.classList.remove('opacity-0');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main id="container" className="container py-8 transition-opacity duration-500 opacity-0">
        <div className="space-y-6 mb-10">
          <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-2">
              <div className="h-8 w-8 rounded-full bg-primary animate-pulse-soft" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">CSV Data Processor</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Upload, process, and analyze your CSV files with ease. Generate comprehensive reports and insights.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* File Upload Section */}
          {!resultsVisible && (
            <div className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
              <FileUploader 
                onFilesAdded={handleFilesAdded} 
                accept=".csv" 
                maxFiles={10}
              />
              
              {files.length > 0 && (
                <FileList 
                  files={files} 
                  onRemove={handleRemoveFile} 
                  onProcessFiles={handleProcessFiles}
                  fileTypes={getFileTypes()}
                />
              )}
            </div>
          )}

          {/* Results Section */}
          {resultsVisible && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Results</h2>
                <button
                  onClick={() => {
                    setResultsVisible(false);
                    setProcessedData([]);
                    setFilteredData([]);
                    setFiles([]);
                  }}
                  className="text-sm text-primary hover-underline"
                >
                  Process new files
                </button>
              </div>
              
              <ResultsTable
                data={filteredData}
                locations={locations}
                isLoading={false}
              />
            </div>
          )}
        </div>
      </main>

      {/* Processing Loader */}
      <ProcessingLoader 
        isProcessing={isProcessing} 
        progress={progress} 
        currentStep={currentStep} 
      />
    </div>
  );
};

export default Index;
