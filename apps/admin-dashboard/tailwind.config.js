/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#1e40af',
        'admin-secondary': '#3b82f6',
        'admin-accent': '#06b6d4',
        'admin-success': '#10b981',
        'admin-warning': '#f59e0b',
        'admin-error': '#ef4444',
      },
      fontFamily: {
        'admin': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'admin': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'admin-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
