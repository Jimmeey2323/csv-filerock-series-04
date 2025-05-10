
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';
import FileList from '@/components/FileList';
import ProcessingLoader from '@/components/ProcessingLoader';
import FilterBar from '@/components/FilterBar';
import ResultsTable from '@/components/ResultsTable';
import RawDataView from '@/components/RawDataView';
import { parseCSV, categorizeFiles, getFileTypes } from '@/utils/csvParser';
import { processData, ProcessedTeacherData, ProcessingProgress } from '@/utils/dataProcessor';
import Logo from '@/components/Logo';
import AIInsights from '@/components/AIInsights';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Table, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [dataMode, setDataMode] = useState<'teacher' | 'studio'>('teacher');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [rawData, setRawData] = useState({
    newClientData: [],
    bookingsData: [],
    paymentsData: [],
    processingResults: {
      included: [],
      excluded: [],
      newClients: [],
      convertedClients: [],
      retainedClients: []
    }
  });
  
  const [activeFilters, setActiveFilters] = useState({
    location: '',
    teacher: '',
    period: '',
    search: '',
  });

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
      
      // Save raw data for the Raw Data View
      setRawData({
        newClientData: newFileResult.data,
        bookingsData: bookingsFileResult.data,
        paymentsData: salesFileResult.data,
        processingResults: {
          included: [],
          excluded: [],
          newClients: [],
          convertedClients: [],
          retainedClients: []
        }
      });
      
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
      
      // Update raw data processing results
      setRawData(prev => ({
        ...prev,
        processingResults: {
          included: result.includedRecords || [],
          excluded: result.excludedRecords || [],
          newClients: result.newClientRecords || [],
          convertedClients: result.convertedClientRecords || [],
          retainedClients: result.retainedClientRecords || []
        }
      }));
      
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
    const newFilters = {
      location: filters.location || '',
      teacher: filters.teacher || '',
      period: filters.period || '',
      search: filters.search || '',
    };
    
    setActiveFilters(newFilters);
    
    let filtered = [...processedData];
    
    // Filter by location
    if (newFilters.location && newFilters.location !== 'all-locations') {
      filtered = filtered.filter(item => item.location === newFilters.location);
    }
    
    // Filter by teacher
    if (newFilters.teacher && newFilters.teacher !== 'all-teachers') {
      filtered = filtered.filter(item => item.teacherName === newFilters.teacher);
    }
    
    // Filter by period
    if (newFilters.period && newFilters.period !== 'all-periods') {
      filtered = filtered.filter(item => item.period === newFilters.period);
    }
    
    // Filter by search (teacher name)
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.teacherName.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredData(filtered);
  }, [processedData]);

  // Apply fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('container')?.classList.remove('opacity-0');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex justify-between items-center py-3">
          <Logo size="md" />
          <div className="text-xl font-semibold">Studio Stats</div>
        </div>
      </header>
      
      <main id="container" className="container py-8 transition-opacity duration-500 opacity-0">
        {!resultsVisible ? (
          <>
            <div className="space-y-6 mb-10">
              <div className="flex flex-col items-center text-center space-y-4 animate-fade-in">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary animate-pulse-soft" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Studio Stats</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Upload, process, and analyze your CSV files to gain insights into studio performance, teacher effectiveness, and client trends.
                </p>
              </div>
            </div>

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
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Performance Analytics</h2>
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
            
            <Collapsible
              open={isInsightsOpen}
              onOpenChange={setIsInsightsOpen}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Insights & Recommendations</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isInsightsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />  
                    )}
                    <span className="sr-only">Toggle insights</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                <AIInsights data={filteredData} isFiltered={hasActiveFilters} />
              </CollapsibleContent>
            </Collapsible>
            
            <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span>Analytics Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="raw-data" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Raw Data & Processing</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-6">
                  <FilterBar
                    locations={locations}
                    teachers={teachers}
                    periods={periods}
                    activeViewMode={viewMode}
                    activeDataMode={dataMode}
                    onViewModeChange={setViewMode}
                    onDataModeChange={setDataMode}
                    onFilterChange={handleFilterChange}
                  />
                  
                  <ResultsTable
                    data={filteredData}
                    locations={locations}
                    isLoading={false}
                    viewMode={viewMode} 
                    dataMode={dataMode}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="raw-data" className="mt-0">
                <RawDataView
                  newClientData={rawData.newClientData}
                  bookingsData={rawData.bookingsData}
                  paymentsData={rawData.paymentsData}
                  processingResults={rawData.processingResults}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Processing Loader */}
      <ProcessingLoader 
        isProcessing={isProcessing} 
        progress={progress} 
        currentStep={currentStep} 
      />
      
      <footer className="border-t bg-white/80 backdrop-blur-sm py-4 mt-8">
        <div className="container text-center text-xs text-muted-foreground">
          Studio Stats Analytics Dashboard • {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
