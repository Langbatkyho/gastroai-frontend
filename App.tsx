import React, { useState, useEffect } from 'react';
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
import { MenuIcon, CloseIcon, HomeIcon, FoodCheckIcon, SymptomIcon, ReportIcon, RecipeIcon, ReminderIcon, LogoutIcon, LoadingSpinner } from './components/icons';

type View = 'mealPlan' | 'foodChecker' | 'symptomLogger' | 'healthReport' | 'recipeLibrary' | 'reminders';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  
  const [activeView, setActiveView] = useState<View>('symptomLogger');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showConfirmLogoutModal, setShowConfirmLogoutModal] = useState(false);
  const [showLogoutSuccessMessage, setShowLogoutSuccessMessage] = useState(false);

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.login(email);
      setUserEmail(data.email);
      setUserProfile(data.userProfile);
      setSymptoms(data.symptoms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi đăng nhập.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurveyComplete = async (profile: UserProfile) => {
    if (!userEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedProfile = await apiService.saveUserProfile(userEmail, profile);
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu thông tin.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const addSymptom = async (symptom: SymptomLog) => {
    if (!userEmail) return;
    try {
      const updatedSymptoms = await apiService.addSymptom(userEmail, symptom);
      setSymptoms(updatedSymptoms);
    } catch (err) {
      console.error(err);
      alert("Không thể lưu triệu chứng. Vui lòng thử lại.");
    }
  }

  const handleLogoutClick = () => {
    setShowConfirmLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowConfirmLogoutModal(false);
    setShowLogoutSuccessMessage(true);
    
    setTimeout(() => {
      // Reset all state to return to login screen
      setShowLogoutSuccessMessage(false);
      setUserEmail(null);
      setUserProfile(null);
      setSymptoms([]);
      setActiveView('symptomLogger');
    }, 2000);
  };

  const cancelLogout = () => {
    setShowConfirmLogoutModal(false);
  };

  const renderView = () => {
    if (!userProfile) return null;

    switch (activeView) {
      case 'mealPlan':
        return <MealPlan userProfile={userProfile} symptoms={symptoms} />;
      case 'foodChecker':
        return <FoodChecker userProfile={userProfile} />;
      case 'symptomLogger':
        return <SymptomLogger onAddSymptom={addSymptom} symptoms={symptoms} />;
      case 'healthReport':
        return <HealthReport userProfile={userProfile} symptoms={symptoms} />;
      case 'recipeLibrary':
        return <RecipeLibrary userProfile={userProfile} />;
      case 'reminders':
        return <Reminders />;
      default:
        return <SymptomLogger onAddSymptom={addSymptom} symptoms={symptoms} />;
    }
  };

  const NavItem = ({ view, label, icon, currentView, setView }: { view: View, label: string, icon: React.ReactElement, currentView: View, setView: (v: View) => void }) => (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setView(view);
          setSidebarOpen(false);
        }}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
          currentView === view
            ? 'bg-indigo-100 text-indigo-700 font-bold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {icon}
        <span className="text-md">{label}</span>
      </a>
    </li>
  );
  
  if (isLoading) {
    return (
        <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
            <div className="text-center p-8">
                <LoadingSpinner size="12" />
                <h2 className="text-xl font-semibold text-gray-700 mt-6">Đang tải dữ liệu...</h2>
                <p className="text-gray-500 mt-2">
                    Lần truy cập đầu tiên trong ngày có thể mất một chút thời gian để khởi động máy chủ. <br/>
                    Vui lòng đợi trong giây lát.
                </p>
            </div>
        </div>
    );
  }

  if (showLogoutSuccessMessage) {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 text-white animate-fade-in">
            <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-3xl font-bold mt-4">Đăng xuất thành công!</h2>
                <p className="mt-2 text-lg text-gray-300">Đang quay về màn hình đăng nhập...</p>
            </div>
        </div>
    );
  }

  if (!userEmail) {
    return <Login onLogin={handleLogin} />;
  }

  if (!userProfile) {
    return <OnboardingSurvey onComplete={handleSurveyComplete} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-600">GastroHealth AI</h1>
           <button onClick={() => setSidebarOpen(false)} className="text-gray-500 focus:outline-none md:hidden">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <NavItem view="symptomLogger" label="Theo dõi Triệu chứng" icon={<SymptomIcon />} currentView={activeView} setView={setActiveView} />
                <NavItem view="mealPlan" label="Thực đơn Cá nhân hóa" icon={<HomeIcon />} currentView={activeView} setView={setActiveView} />
                <NavItem view="foodChecker" label="Kiểm tra Thực phẩm" icon={<FoodCheckIcon />} currentView={activeView} setView={setActiveView} />
                <NavItem view="healthReport" label="Báo cáo Sức khỏe" icon={<ReportIcon />} currentView={activeView} setView={setActiveView} />
                 <div className="pt-2 mt-2 border-t">
                    <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Công cụ</p>
                    <NavItem view="recipeLibrary" label="Thư viện Công thức" icon={<RecipeIcon />} currentView={activeView} setView={setActiveView} />
                    <NavItem view="reminders" label="Nhắc nhở" icon={<ReminderIcon />} currentView={activeView} setView={setActiveView} />
                </div>
              </ul>
            </nav>
            <div className="p-4 mt-auto border-t">
                <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full p-3 rounded-lg text-left text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                >
                    <LogoutIcon />
                    <span className="text-md">Đăng xuất</span>
                </button>
            </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between md:justify-end items-center p-4 bg-white border-b md:border-none">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 focus:outline-none md:hidden">
            <MenuIcon />
          </button>
          <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{userProfile.condition}</p>
              <p className="text-xs text-gray-500">Mục tiêu: {userProfile.dietaryGoal}</p>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {renderView()}
        </main>
      </div>
      
      {showConfirmLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Xác nhận Đăng xuất</h2>
                <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất không? Dữ liệu của bạn sẽ được lưu lại cho lần đăng nhập sau.</p>
                <div className="flex justify-end gap-4">
                    <button onClick={cancelLogout} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">
                        Hủy
                    </button>
                    <button onClick={confirmLogout} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;