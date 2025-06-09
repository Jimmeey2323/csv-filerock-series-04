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
import { deduplicateClientsByEmail } from '@/utils/deduplication';
import Logo from '@/components/Logo';
import AIInsights from '@/components/AIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Table, BarChart, Sparkles, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Local storage keys
const STORAGE_KEYS = {
  PROCESSED_DATA: 'studio-stats-processed-data',
  FILTERED_DATA: 'studio-stats-filtered-data',
  LOCATIONS: 'studio-stats-locations',
  TEACHERS: 'studio-stats-teachers',
  PERIODS: 'studio-stats-periods',
  HAS_RAW_DATA: 'studio-stats-has-raw-data'
};

// Storage utilities
const storageUtils = {
  saveToStorage: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving to storage for key ${key}:`, error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Some data might not be saved between sessions.');
      }
      return false;
    }
  },
  loadFromStorage: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading from storage for key ${key}:`, error);
      return null;
    }
  },
  clearStorage: (keys: string[]) => {
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing storage for key ${key}:`, error);
      }
    });
  }
};

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
  const [isAutoLoading, setIsAutoLoading] = useState(false);
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
    search: ''
  });

  // Function to load default CSV files
  const loadDefaultFiles = useCallback(async () => {
    try {
      setIsAutoLoading(true);
      console.log('Loading default CSV files...');
      
      const filePromises = [
        fetch('/new-visitors (6).csv').then(res => res.blob()).then(blob => new File([blob], 'new-visitors (6).csv', { type: 'text/csv' })),
        fetch('/momence-total-bookings-report (6).csv').then(res => res.blob()).then(blob => new File([blob], 'momence-total-bookings-report (6).csv', { type: 'text/csv' })),
        fetch('/momence-latest-payments-report (3).csv').then(res => res.blob()).then(blob => new File([blob], 'momence-latest-payments-report (3).csv', { type: 'text/csv' }))
      ];

      const defaultFiles = await Promise.all(filePromises);
      console.log('Default files loaded:', defaultFiles.map(f => f.name));
      
      setFiles(defaultFiles);
      
      // Auto-process the files
      await processDefaultFiles(defaultFiles);
      
    } catch (error) {
      console.error('Error loading default files:', error);
      toast.error('Could not load default data files');
    } finally {
      setIsAutoLoading(false);
    }
  }, []);

  // Process default files
  const processDefaultFiles = useCallback(async (filesToProcess: File[]) => {
    const categorized = categorizeFiles(filesToProcess);
    if (!categorized.new || !categorized.bookings) {
      console.error('Missing required files for processing');
      return;
    }

    setIsProcessing(true);
    updateProgress({ progress: 0, currentStep: 'Processing default data...' });
    
    try {
      // Parse CSV files
      updateProgress({ progress: 10, currentStep: 'Parsing CSV files...' });
      const newFileResult = await parseCSV(categorized.new);
      const bookingsFileResult = await parseCSV(categorized.bookings);
      
      let salesFileResult = { data: [] };
      if (categorized.payments) {
        salesFileResult = await parseCSV(categorized.payments);
      }

      // Save raw data
      const initialRawData = {
        newClientData: newFileResult.data || [],
        bookingsData: bookingsFileResult.data || [],
        paymentsData: salesFileResult.data || [],
        processingResults: {
          included: [],
          excluded: [],
          newClients: [],
          convertedClients: [],
          retainedClients: []
        }
      };
      setRawData(initialRawData);

      // Process data
      updateProgress({ progress: 30, currentStep: 'Processing data...' });
      const result = await processData(
        newFileResult.data || [], 
        bookingsFileResult.data || [], 
        salesFileResult.data || [], 
        updateProgress
      );

      // Update state
      setProcessedData(result.processedData || []);
      setFilteredData(result.processedData || []);
      setLocations(result.locations || []);
      setTeachers(result.teachers || []);
      setPeriods(result.periods || []);

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

      setTimeout(() => {
        setIsProcessing(false);
        setResultsVisible(true);
        toast.success('Default data loaded successfully');
      }, 1000);
      
    } catch (error) {
      console.error('Error processing default files:', error);
      setIsProcessing(false);
      toast.error('Error processing default data');
    }
  }, []);

  // Load saved data or default files on component mount
  useEffect(() => {
    const savedProcessedData = storageUtils.loadFromStorage(STORAGE_KEYS.PROCESSED_DATA);
    
    if (savedProcessedData && savedProcessedData.length > 0) {
      // Load from storage
      const savedFilteredData = storageUtils.loadFromStorage(STORAGE_KEYS.FILTERED_DATA);
      const savedLocations = storageUtils.loadFromStorage(STORAGE_KEYS.LOCATIONS);
      const savedTeachers = storageUtils.loadFromStorage(STORAGE_KEYS.TEACHERS);
      const savedPeriods = storageUtils.loadFromStorage(STORAGE_KEYS.PERIODS);
      
      setProcessedData(savedProcessedData);
      setFilteredData(savedFilteredData || savedProcessedData);
      setLocations(savedLocations || []);
      setTeachers(savedTeachers || []);
      setPeriods(savedPeriods || []);
      setResultsVisible(true);
      
      console.log('Loaded data from storage');
    } else {
      // Load default files
      loadDefaultFiles();
    }
  }, [loadDefaultFiles]);

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

    const categorized = categorizeFiles(files);
    if (!categorized.new) {
      toast.error('Missing New client file. Please upload a file with "new" in the name');
      return;
    }
    if (!categorized.bookings) {
      toast.error('Missing Bookings file. Please upload a file with "bookings" in the name');
      return;
    }

    // Clear previous data
    setProcessedData([]);
    setFilteredData([]);
    setLocations([]);
    setTeachers([]);
    setPeriods([]);
    setRawData({
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

    storageUtils.clearStorage(Object.values(STORAGE_KEYS));
    await processDefaultFiles(files);
  }, [files, processDefaultFiles]);

  // Handle filter changes with proper period mapping
  const handleFilterChange = useCallback((filters: {
    location?: string;
    teacher?: string;
    period?: string;
    search?: string;
  }) => {
    const newFilters = {
      location: filters.location || '',
      teacher: filters.teacher || '',
      period: filters.period || '',
      search: filters.search || ''
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

    // Filter by period with proper mapping for quick filters
    if (newFilters.period && newFilters.period !== 'all-periods') {
      // Map quick filter values to actual period names if needed
      const periodMapping: { [key: string]: string } = {
        'this-week': 'Week',
        'this-month': 'Month',
        'last-month': 'Last Month',
        'q2-2023': 'Q2 2023',
        'all-time': ''
      };
      
      const mappedPeriod = periodMapping[newFilters.period] || newFilters.period;
      
      if (mappedPeriod && mappedPeriod !== 'all-time') {
        filtered = filtered.filter(item => 
          item.period && item.period.toLowerCase().includes(mappedPeriod.toLowerCase())
        );
      }
    }

    // Filter by search
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.teacherName && item.teacherName.toLowerCase().includes(searchLower)) || 
        (item.location && item.location.toLowerCase().includes(searchLower))
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

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  // Clear saved data and reset
  const handleResetApp = useCallback(() => {
    storageUtils.clearStorage(Object.values(STORAGE_KEYS));
    setResultsVisible(false);
    setProcessedData([]);
    setFilteredData([]);
    setLocations([]);
    setTeachers([]);
    setPeriods([]);
    setFiles([]);
    setRawData({
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
    toast.success('Application reset');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Glassmorphic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '4s' }} />
      </div>

      <header className="border-b border-white/20 bg-white/10 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <Logo size="md" />
          </div>
          
          {resultsVisible && (
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setResultsVisible(false)}
                className="text-slate-600 hover:text-slate-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
              >
                <Database className="w-4 h-4 mr-2" />
                Load New Data
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResetApp}
                className="text-red-600 hover:text-red-700 hover:bg-red-50/50 backdrop-blur-sm transition-all duration-300"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main id="container" className="container py-8 transition-opacity duration-1000 opacity-0 relative z-10">
        {!resultsVisible ? (
          <div className="space-y-8 animate-fade-in">
            {(isProcessing || isAutoLoading) && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/20 mb-4 animate-pulse-soft">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 animate-pulse-soft" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {isAutoLoading ? 'Loading Default Data...' : 'Processing Files...'}
                </h2>
                <p className="text-slate-600">
                  {isAutoLoading ? 'Setting up your dashboard with sample data' : 'Please wait while we process your files'}
                </p>
              </div>
            )}
            
            {!isProcessing && !isAutoLoading && (
              <>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/20 mb-4 animate-scale-in">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 animate-pulse-soft shadow-lg" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                      Studio Stats
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
                      Advanced analytics platform for studio performance insights, teacher effectiveness metrics, and comprehensive client trend analysis.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
                  <FileUploader onFilesAdded={handleFilesAdded} accept=".csv" maxFiles={10} />
                  
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
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <Collapsible open={isInsightsOpen} onOpenChange={setIsInsightsOpen} className="w-full">
              <div className="bg-gradient-to-r from-white/70 to-blue-50/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">AI Insights & Recommendations</h3>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/50 transition-all duration-300">
                      {isInsightsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-4">
                  <AIInsights data={filteredData} isFiltered={hasActiveFilters} />
                </CollapsibleContent>
              </div>
            </Collapsible>
            
            <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-1">
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl transition-all duration-300"
                >
                  <BarChart className="h-4 w-4" />
                  <span className="font-medium">Analytics Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="raw-data" 
                  className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl transition-all duration-300"
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Raw Data & Processing</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="mt-6 space-y-6">
                <FilterBar 
                  locations={locations} 
                  teachers={teachers} 
                  periods={periods} 
                  activeViewMode={viewMode} 
                  activeDataMode={dataMode} 
                  onViewModeChange={setViewMode} 
                  onDataModeChange={setDataMode} 
                  onFilterChange={handleFilterChange} 
                  initialSearch={activeFilters.search} 
                />
                
                <ResultsTable 
                  data={filteredData} 
                  locations={locations} 
                  isLoading={false} 
                  viewMode={viewMode} 
                  dataMode={dataMode} 
                  onFilterChange={handleFilterChange} 
                />
              </TabsContent>
              
              <TabsContent value="raw-data" className="mt-6">
                <RawDataView 
                  newClientData={rawData.newClientData || []} 
                  bookingsData={rawData.bookingsData || []} 
                  paymentsData={rawData.paymentsData || []} 
                  processingResults={rawData.processingResults || {
                    included: [],
                    excluded: [],
                    newClients: [],
                    convertedClients: [],
                    retainedClients: []
                  }} 
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <ProcessingLoader isProcessing={isProcessing || isAutoLoading} progress={progress} currentStep={currentStep} />
      
      <footer className="border-t border-white/20 bg-white/5 backdrop-blur-xl py-6 mt-12">
        <div className="container text-center">
          <p className="text-sm text-slate-500">
            Studio Stats Analytics Dashboard • {new Date().getFullYear()} • Built with precision and care
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
