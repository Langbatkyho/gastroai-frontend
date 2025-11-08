import React, { useState } from 'react';
import * as apiService from '../services/apiService';
import { LoadingSpinner } from './icons';

interface ApiKeyModalProps {
  onSave: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiService.saveApiKey(apiKey.trim());
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu API key thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cung cấp API Key của bạn</h2>
        <p className="text-gray-600 mb-6">
          Để sử dụng các tính năng AI, vui lòng nhập Google Gemini API Key của bạn. Thao tác này chỉ cần thực hiện một lần.
        </p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
        <div className="mb-6">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-100 text-black placeholder-gray-500"
            placeholder="***************************************"
          />
           <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Lấy API Key của bạn ở đây</a>
        </div>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim() || isLoading}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner size="5" /> : 'Lưu và Tiếp tục'}
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;
