import React, { useState } from 'react';
import { Lock, User, Key, Globe } from 'lucide-react';

const LoginModal = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await onLogin(credentials);
      
      if (!result.success) {
        setError(result.message || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-primary to-admin-secondary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-admin-primary font-bold text-2xl">NA</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard Administrateur
          </h1>
          <p className="text-blue-100">
            Aéroport Nador Al Aroui
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-lg shadow-admin-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Connexion Administrateur
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-colors"
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-admin-primary text-white py-3 px-4 rounded-lg hover:bg-admin-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Informations de développement */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Mode Développement
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex items-center space-x-2">
                <User size={16} />
                <span>Utilisateur : <code className="bg-gray-200 px-1 rounded">admin</code></span>
              </p>
              <p className="flex items-center space-x-2">
                <Key size={16} />
                <span>Mot de passe : <code className="bg-gray-200 px-1 rounded">admin123</code></span>
              </p>
              <p className="flex items-center space-x-2">
                <Globe size={16} />
                <span>Port : <code className="bg-gray-200 px-1 rounded">3001</code></span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            Plateforme de satisfaction des passagers - Version Admin
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
