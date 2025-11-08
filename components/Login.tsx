import React, { useState } from 'react';
import * as apiService from '../services/apiService';
import { LoadingSpinner } from './icons';

interface LoginProps {
  onLoginSuccess: (data: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLoginView) {
        const data = await apiService.login(email, password);
        onLoginSuccess(data);
      } else {
        await apiService.register(email, password);
        setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLoginView(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{isLoginView ? 'Đăng nhập' : 'Đăng ký'}</h2>
        <p className="text-gray-600 mb-6">
          {isLoginView ? 'Chào mừng bạn trở lại GastroHealth AI.' : 'Tạo tài khoản mới để bắt đầu.'}
        </p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
        {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-100 text-black placeholder-gray-500"
              placeholder="you@example.com" required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-100 text-black placeholder-gray-500"
              placeholder="••••••••" required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="5" /> : (isLoginView ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isLoginView ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-medium text-indigo-600 hover:underline ml-1">
            {isLoginView ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
