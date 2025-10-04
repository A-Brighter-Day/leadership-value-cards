import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import Stepper from '@/components/layout/Stepper';
import CardSortingStep from '@/components/steps/CardSortingStep';
import Top10SelectionStep from '@/components/steps/Top10SelectionStep';
import CoreValuesStep from '@/components/steps/CoreValuesStep';
import SubmissionStep from '@/components/steps/SubmissionStep';
import CompletionStep from '@/components/steps/CompletionStep';
import { LeadershipValue, SelectedValues, SortedValues, UserInfo } from '@/types';

const steps = ['Card Sorting', 'Top 10 Selection', 'Core Values', 'Complete'];

// Helper functions for localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T | null): T | null => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const STORAGE_KEYS = {
  STEP: 'currentStep',
  SORTED_VALUES: 'sortedValues',
  SELECTED_VALUES: 'selectedValues',
  CORE_VALUES: 'coreValues'
};

const Home = () => {
  // Initialize state from localStorage if available
  const [currentStep, setCurrentStep] = useState(() => 
    getFromLocalStorage(STORAGE_KEYS.STEP, 0)
  );
  const [sortedValues, setSortedValues] = useState<SortedValues | null>(() =>
    getFromLocalStorage(STORAGE_KEYS.SORTED_VALUES, null)
  );
  const [selectedValues, setSelectedValues] = useState<SelectedValues | null>(() =>
    getFromLocalStorage(STORAGE_KEYS.SELECTED_VALUES, null)
  );
  const [coreValues, setCoreValues] = useState<SelectedValues | null>(() =>
    getFromLocalStorage(STORAGE_KEYS.CORE_VALUES, null)
  );
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Save state changes to localStorage
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.STEP, currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (sortedValues) saveToLocalStorage(STORAGE_KEYS.SORTED_VALUES, sortedValues);
  }, [sortedValues]);

  useEffect(() => {
    if (selectedValues) saveToLocalStorage(STORAGE_KEYS.SELECTED_VALUES, selectedValues);
  }, [selectedValues]);

  useEffect(() => {
    if (coreValues) saveToLocalStorage(STORAGE_KEYS.CORE_VALUES, coreValues);
  }, [coreValues]);

  useEffect(() => {
    if (userInfo) saveToLocalStorage('userInfo', userInfo);
  }, [userInfo]);

  // Fetch leadership values from the API
  const { data: leadershipValues = [], isLoading, error } = useQuery<LeadershipValue[]>({
    queryKey: ['/api/leadership-values'],
    staleTime: 60 * 1000 // 1 minute
  });

  if (error) {
    console.error('Error fetching leadership values:', error);
  }

  const handleCardSortingComplete = (values: SortedValues) => {
    setSortedValues(values);
    setCurrentStep(1);
  };

  const handleTop10SelectionComplete = (values: SelectedValues) => {
    setSelectedValues(values);
    setCurrentStep(2);
  };

  const handleCoreValuesComplete = (values: SelectedValues) => {
    setCoreValues(values);
    setCurrentStep(3);
  };

  const handleSubmissionComplete = (info: UserInfo) => {
    setUserInfo(info);
    setCurrentStep(4);
  };

  const moveBackToStep = (step: number) => {
    setCurrentStep(step);
  };
  
  const handleStepClick = (step: string) => {
    setCurrentStep(steps.indexOf(step));
  };

  return (
    <AppLayout>
      <Stepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

      {isLoading && (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-primary mb-2">Sort Your Leadership Value Cards</h2>
            <p className="text-muted-foreground">Drag each card into one of the three categories based on how well it describes you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Card Pile Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <h3 className="font-medium text-primary mb-4 text-center">
                  <span className="animate-pulse inline-block h-6 w-32 bg-slate-200 rounded"></span>
                </h3>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-2">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse bg-slate-200 p-4 h-24 rounded-md shadow"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buckets Skeleton */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-100 p-4 h-[500px] rounded-lg border-2 border-dashed border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-5 bg-slate-200 rounded w-24"></div>
                      <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-32 mb-6"></div>
                    <div className="flex-grow flex items-center justify-center">
                      <div className="text-slate-300 text-center">
                        <div className="h-8 w-8 mx-auto rounded-full bg-slate-200 mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded w-36 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md shadow-lg max-w-xl w-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
                <div className="mt-2 text-red-700">
                  <p>We couldn't load the leadership values from the database.</p>
                  <p className="mt-1">This could be due to a network issue or a problem with the database connection.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <polyline points="23 20 23 14 17 14" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 0 && !isLoading && !error && leadershipValues.length > 0 && (
        <CardSortingStep 
          leadershipValues={leadershipValues} 
          onComplete={handleCardSortingComplete} 
        />
      )}

      {currentStep === 1 && sortedValues && (
        <Top10SelectionStep 
          sortedValues={sortedValues} 
          onComplete={handleTop10SelectionComplete}
          onBack={() => moveBackToStep(0)}
        />
      )}

      {currentStep === 2 && selectedValues && (
        <CoreValuesStep 
          selectedValues={selectedValues} 
          onComplete={handleCoreValuesComplete}
          onBack={() => moveBackToStep(1)}
        />
      )}

      {currentStep === 3 && coreValues && (
        <SubmissionStep 
          coreValues={coreValues.core}
          onComplete={handleSubmissionComplete}
          onBack={() => moveBackToStep(2)}
        />
      )}

      {currentStep === 4 && coreValues && userInfo && (
        <CompletionStep 
          coreValues={coreValues.core}
          userInfo={userInfo}
        />
      )}
    </AppLayout>
  );
};

export default Home;