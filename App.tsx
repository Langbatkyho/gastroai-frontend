  import React, { useState, useEffect, useCallback } from 'react';
  import { UserProfile, SymptomLog } from './types';
  import * as apiService from './services/apiService';
  import Login from './components/Login';
  import OnboardingSurvey from './components/OnboardingSurvey';
  import MealPlan from './components/MealPlan';
  import FoodChecker from './components/FoodChecker';
  import SymptomLogger from './components/SymptomLogger';
  import HealthReport from './components/HealthReport';
  import RecipeLibrary from './components/RecipeLibrary';
  import Reminders from './components/Reminders';
  import ApiKeyModal from './components/ApiKeyModal';
  import { MenuIcon, CloseIcon, HomeIcon, FoodCheckIcon, SymptomIcon, ReportIcon, RecipeIcon, ReminderIcon, LogoutIcon, LoadingSpinner } from './components/icons';

  type View = 'mealPlan' | 'foodChecker' | 'symptomLogger' | 'healthReport' | 'recipeLibrary' | 'reminders';

  interface UserData {
      email: string;
      profile: UserProfile | null;
      hasApiKey: boolean;
  }

  const App: React.FC = () => {
    const [authToken, setAuthToken] = useState<string | null>(apiService.getAuthToken());
    const [user, setUser] = useState<UserData | null>(null);
    const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>('mealPlan');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);

    const handleLoginSuccess = useCallback((data: { user: UserData; symptoms: SymptomLog[]; token: string }) => {
      apiService.setAuthToken(data.token); // Save token using the service
      setAuthToken(data.token);
      setUser(data.user);
      setSymptoms(data.symptoms);
      if (!data.user.hasApiKey) {
          setShowApiKeyModal(true);
      }
      setIsLoading(false);
    }, []);
    
    const handleLogout = () => {
      apiService.setAuthToken(null);
      setAuthToken(null);
      setUser(null);
      setSymptoms([]);
    };

    const handleSurveyComplete = async (profile: UserProfile) => {
      if (!user) return;
      try {
          const updatedProfile = await apiService.saveUserProfile(profile);
          setUser({ ...user, profile: updatedProfile });
      } catch (error) {
          console.error("Failed to save profile:", error);
          alert("Không thể lưu thông tin khảo sát. Vui lòng thử lại.");
      }
    };

    const handleAddSymptom = async (symptom: SymptomLog) => {
      try {
          const updatedSymptoms = await apiService.addSymptom(symptom);
          setSymptoms(updatedSymptoms);
      } catch (error) {
          console.error("Failed to add symptom:", error);
          alert("Không thể lưu triệu chứng. Vui lòng thử lại.");
      }
    };
    
    const handleApiKeySaved = () => {
      if (user) {
          setUser({ ...user, hasApiKey: true });
      }
      setShowApiKeyModal(false);
    };
    
    // Effect to check token on initial load
    useEffect(() => {
      const token = apiService.getAuthToken();
      if (token) {
        apiService.fetchMe()
          .then(data => {
            setUser(data.user);
            setSymptoms(data.symptoms);
            if (!data.user.hasApiKey) {
              setShowApiKeyModal(true);
            }
          })
          .catch(() => {
            // Token is invalid or expired, log the user out
            handleLogout();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }, []);


    const renderView = () => {
      if (!user || !user.profile) return null;
      switch (view) {
        case 'mealPlan':
          return <MealPlan userProfile={user.profile} symptoms={symptoms} />;
        case 'foodChecker':
          return <FoodChecker userProfile={user.profile} />;
        case 'symptomLogger':
          return <SymptomLogger onAddSymptom={handleAddSymptom} symptoms={symptoms} />;
        case 'healthReport':
          return <HealthReport userProfile={user.profile} symptoms={symptoms} />;
        case 'recipeLibrary':
          return <RecipeLibrary userProfile={user.profile} />;
        case 'reminders':
          return <Reminders />;
        default:
          return <MealPlan userProfile={user.profile} symptoms={symptoms} />;
      }
    };

    const NavLink: React.FC<{
      targetView: View;
      icon: React.ReactNode;
      label: string;
    }> = ({ targetView, icon, label }) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setView(targetView);
          setIsSidebarOpen(false);
        }}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          view === targetView
            ? 'bg-indigo-700 text-white'
            : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
        }`}
      >
        {icon}
        <span className="font-medium">{label}</span>
      </a>
    );
    
    if (isLoading) {
      return (
          <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                  <LoadingSpinner size="12" />
                  <p className="mt-4 text-lg text-gray-600">Đang tải ứng dụng...</p>
              </div>
          </div>
      );
    }

    if (!authToken || !user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (!user.profile) {
      return <OnboardingSurvey onComplete={handleSurveyComplete} />;
    }
    
    if (showApiKeyModal) {
      return <ApiKeyModal onSave={handleApiKeySaved} />;
    }

    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 bg-indigo-600 text-white w-64 space-y-4 p-4 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform z-30 shadow-lg`}>
          <h1 className="text-2xl font-bold text-center py-4 border-b border-indigo-500">GastroHealth AI</h1>
          <nav className="flex-grow">
            <NavLink targetView="mealPlan" icon={<HomeIcon />} label="Thực đơn của tôi" />
            <NavLink targetView="foodChecker" icon={<FoodCheckIcon />} label="Kiểm tra Thực phẩm" />
            <NavLink targetView="symptomLogger" icon={<SymptomIcon />} label="Theo dõi Triệu chứng" />
            <NavLink targetView="healthReport" icon={<ReportIcon />} label="Báo cáo Sức khỏe" />
            <NavLink targetView="recipeLibrary" icon={<RecipeIcon />} label="Thư viện Công thức" />
            <NavLink targetView="reminders" icon={<ReminderIcon />} label="Nhắc nhở" />
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
              <div className="text-sm text-indigo-200 mb-4 px-2">Đăng nhập với: <strong>{user.email}</strong></div>
              <a href="#" onClick={handleLogout} className="flex items-center px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-500 hover:text-white transition-colors">
                  <LogoutIcon />
                  <span className="font-medium">Đăng xuất</span>
              </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex justify-between items-center p-4 bg-white border-b md:hidden">
            <h1 className="text-xl font-bold text-indigo-600">GastroHealth AI</h1>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600">
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {renderView()}
          </main>
        </div>
      </div>
    );
  };

  export default App;