import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

export function AdminLoginPage() {
  const { t, toggleLanguage, getLanguageDisplay } = useLanguage();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.adminLogin(credentials.email, credentials.password);

      if (response && response.token) {
        localStorage.setItem('adminToken', response.token);
        window.location.href = '/admin/dashboard';
      } else {
        setError(t('invalidCredentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-orange-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        {/* Language toggle (top-right) */}
        <div className="absolute top-3 right-3">
          <button
            onClick={toggleLanguage}
            title="Toggle language"
            className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-xs sm:text-sm"
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700 uppercase">{getLanguageDisplay()}</span>
          </button>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Admin {t('login')}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('accessDashboard')}</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                placeholder={t('emailPlaceholder')}
                aria-label={t('email')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                placeholder={t('passwordPlaceholder')}
                aria-label={t('password')}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
          >
            {loading ? t('signingIn') : t('login')}
          </motion.button>
        </form>

        <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          <p className="truncate">
            {t('adminHelpText') || ''}
          </p>
        </div>
      </motion.div>
    </div>
  );
}