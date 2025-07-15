import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import PropTypes from 'prop-types';
import './LiveFlights.css';

/**
 * Composant affichant les vols en temps réel pour l'aéroport de Nador
 * Combine une carte FlightRadar24 et un tableau de vols en cours
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant LiveFlights
 */
const LiveFlights = ({ t, isRTL }) => {
  // Position de l'aéroport de Nador
  const NADOR_AIRPORT = {
    lat: 34.9888,
    lng: -3.0280,
    zoom: 11
  };

  // État pour stocker les vols
  const [flights, setFlights] = useState({
    arrivals: [],
    departures: []
  });
  
  // État pour indiquer si les données sont en cours de chargement
  const [loading, setLoading] = useState(true);
  
  // État pour suivre les erreurs
  const [error, setError] = useState(null);
  
  // État pour suivre l'onglet actif (arrivées ou départs)
  const [activeTab, setActiveTab] = useState('arrivals');

  // Fonction pour récupérer les données de vols
  const fetchFlightData = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: Dans une version réelle, utilisez un backend pour cacher la clé API
      // L'URL ci-dessous est à titre d'exemple et nécessiterait une clé API réelle
      const response = await fetch('https://api.flightradar24.com/common/v1/airport.json?code=ndr&plugin[]=schedule');
      
      // Si l'API nécessite une clé, il faudrait l'ajouter aux headers
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les données de vols');
      }
      
      const data = await response.json();
      
      // Traitement des données pour extraire les vols
      // Dans une application réelle, adaptez cette partie selon la structure de réponse de l'API
      setFlights({
        arrivals: data.result?.response?.airport?.pluginData?.schedule?.arrivals?.data || [],
        departures: data.result?.response?.airport?.pluginData?.schedule?.departures?.data || []
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des vols:', err);
      setError(err.message);
      setLoading(false);
      
      // En cas d'erreur de l'API, utilisez des données fictives pour la démonstration
      setFlights({
        arrivals: generateMockFlights(6, 'arrival'),
        departures: generateMockFlights(6, 'departure')
      });
    }
  }, []);  // Les dépendances sont vides car la fonction n'utilise que des setState qui sont stables
  
  // Fonction pour générer des données fictives de vols (pour la démonstration)
  const generateMockFlights = (count, type) => {
    const airlines = ['Royal Air Maroc', 'Air Arabia', 'Ryanair', 'TUI fly', 'Transavia'];
    const cities = ['Casablanca', 'Paris', 'Amsterdam', 'Brussels', 'Madrid', 'Barcelona', 'Frankfurt', 'Marseille'];
    const flightNumbers = ['AT123', 'FR456', 'TB789', 'AR234', 'HV567', 'LH901'];
    const statuses = type === 'arrival' 
      ? ['Landed', 'On Time', 'Delayed', 'En Route', 'Expected'] 
      : ['Departed', 'On Time', 'Delayed', 'Boarding', 'Check-in'];
    
    return Array(count).fill().map((_, i) => ({
      flight: {
        airline: airlines[Math.floor(Math.random() * airlines.length)],
        number: flightNumbers[Math.floor(Math.random() * flightNumbers.length)]
      },
      airport: {
        origin: type === 'arrival' ? cities[Math.floor(Math.random() * cities.length)] : 'Nador',
        destination: type === 'arrival' ? 'Nador' : cities[Math.floor(Math.random() * cities.length)]
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      time: {
        scheduled: new Date(Date.now() + (Math.random() * 6 - 3) * 3600000).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    }));
  };

  // Effet pour charger les données au chargement du composant et toutes les minutes
  useEffect(() => {
    // Charger les données immédiatement
    fetchFlightData();
    
    // Puis les recharger toutes les 60 secondes
    const intervalId = setInterval(fetchFlightData, 60000);
    
    // Nettoyer l'intervalle à la suppression du composant
    return () => clearInterval(intervalId);
  }, [fetchFlightData]);  // Ajout de fetchFlightData comme dépendance

  // Fonction pour formater le status du vol selon la langue
  const formatStatus = (status) => {
    // Ici, vous pourriez implémenter une traduction selon la langue sélectionnée
    return status;
  };

  // Fonction pour rendre le tableau des vols
  const renderFlightsTable = () => {
    const currentFlights = activeTab === 'arrivals' ? flights.arrivals : flights.departures;
    
    if (loading && currentFlights.length === 0) {
      return (
        <div className="flex justify-center items-center p-6">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      );
    }

    if (error && currentFlights.length === 0) {
      return (
        <div className="p-4 text-center text-red-500">
          {t?.flightDataError || "Impossible de récupérer les données de vols"}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                {activeTab === 'arrivals' ? t?.from || 'From' : t?.to || 'To'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                {t?.flight || 'Flight'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                {t?.time || 'Time'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                {t?.status || 'Status'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFlights.slice(0, 6).map((flight, index) => (
              <tr 
                key={index} 
                className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {activeTab === 'arrivals' ? flight.airport.origin : flight.airport.destination}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <Plane className="h-4 w-4 text-blue-600 mr-1" />
                    {flight.flight.number}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                    {flight.time.scheduled}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${flight.status === 'On Time' ? 'bg-green-100 text-green-800' : 
                    flight.status === 'Delayed' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'}`}
                  >
                    {formatStatus(flight.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 animate-fade-in">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center">
          <Plane className="h-5 w-5 mr-2" /> 
          {t?.liveFlights || "Live Flights"} - {t?.nadorAirport || "Nador Airport"}
        </h3>
        <div className="text-sm text-blue-200">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Carte FlightRadar24 */}
        <div className="p-4">
          <div className="relative h-[300px] rounded-lg overflow-hidden border border-gray-200">
            <iframe
              title="Nador Airport Live"
              className="absolute inset-0 w-full h-full"
              src={`https://www.flightradar24.com/simple?lat=${NADOR_AIRPORT.lat}&lon=${NADOR_AIRPORT.lng}&z=${NADOR_AIRPORT.zoom}`}
              frameBorder="0"
              scrolling="no"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>
          </div>
        </div>
        
        {/* Tableau des vols */}
        <div className="p-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Onglets pour basculer entre arrivées et départs */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 px-4 text-center ${
                  activeTab === 'arrivals' ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('arrivals')}
              >
                <div className="flex justify-center items-center">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {t?.arrivals || "Arrivals"}
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center ${
                  activeTab === 'departures' ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('departures')}
              >
                <div className="flex justify-center items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {t?.departures || "Departures"}
                </div>
              </button>
            </div>
            
            {/* Tableau des vols */}
            {renderFlightsTable()}
            
            <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
              {t?.updatedEveryMinute || "Updated every minute"} • 
              {t?.poweredBy || "Powered by"} <a href="https://www.flightradar24.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FlightRadar24</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LiveFlights.propTypes = {
  t: PropTypes.object,
  isRTL: PropTypes.bool
};

export default LiveFlights;
