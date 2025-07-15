import { useMemo } from 'react';
import React from 'react';
import { 
  Plane, 
  GanttChart, 
  UserCheck, 
  Coffee, 
  ShoppingBag, 
  Wifi, 
  HelpCircle
} from 'lucide-react';

/**
 * Hook pour associer des icônes aux catégories
 * @param {Object} categories - Catégories obtenues depuis useLanguage
 * @returns {Array} Liste des catégories avec icônes et couleurs
 */
export const useCategoriesWithIcons = (categories) => {
  const categoriesWithIcons = useMemo(() => {
    if (!categories) return [];
    
    const icons = [
      { icon: <Plane className="w-6 h-6" />, color: 'bg-blue-100', iconColor: 'text-blue-600' },
      { icon: <GanttChart className="w-6 h-6" />, color: 'bg-purple-100', iconColor: 'text-purple-600' },
      { icon: <UserCheck className="w-6 h-6" />, color: 'bg-green-100', iconColor: 'text-green-600' },
      { icon: <Coffee className="w-6 h-6" />, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      { icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-pink-100', iconColor: 'text-pink-600' },
      { icon: <Wifi className="w-6 h-6" />, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      { icon: <HelpCircle className="w-6 h-6" />, color: 'bg-red-100', iconColor: 'text-red-600' },
    ];
    
    return Object.entries(categories).map(([id, title], index) => ({
      id,
      title,
      ...icons[index % icons.length]
    }));
  }, [categories]);
  
  return categoriesWithIcons;
};
