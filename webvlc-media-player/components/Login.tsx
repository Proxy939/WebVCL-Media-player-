import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_ROUTES } from '../constants';
import { ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate(APP_ROUTES.LIBRARY);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-vlc-dark p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-vlc-orange/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-vlc-panel p-8 rounded-2xl border border-vlc-border shadow-2xl relative z-10">
        <button 
          onClick={() => navigate(APP_ROUTES.HOME)}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-vlc-orange rounded mx-auto flex items-center justify-center text-black font-bold text-2xl shadow-lg mb-4">V</div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-2">Sign in to access your cloud library</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              defaultValue="user@example.com"
              className="w-full bg-black/50 border border-vlc-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vlc-orange focus:ring-1 focus:ring-vlc-orange transition-all"
              placeholder="name@company.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full bg-black/50 border border-vlc-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vlc-orange focus:ring-1 focus:ring-vlc-orange transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 my-4">
            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
              <input type="checkbox" className="rounded bg-black border-vlc-border text-vlc-orange focus:ring-0" />
              Remember me
            </label>
            <a href="#" className="hover:text-vlc-orange">Forgot password?</a>
          </div>

          <button 
            type="submit"
            className="w-full bg-vlc-orange hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-900/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account? <span className="text-vlc-orange cursor-pointer hover:underline">Create one</span>
        </div>
      </div>
    </div>
  );
};