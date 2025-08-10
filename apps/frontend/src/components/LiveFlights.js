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

  // Fonction pour récupérer les données de vols via le proxy backend (résout le problème CORS)
  // CARTE: FlightRadar24 (iframe) - TABLEAU: Backend proxy → AviationStack API (données réelles)
  const fetchFlightData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🛩️ Récupération des données via proxy backend...');
      
      // Appel au proxy backend (pas de problème CORS)
      const response = await fetch('http://localhost:5000/api/flights', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des données');
      }
      
      console.log('✈️ Données reçues du backend:', {
        arrivals: data.data.arrivals.length,
        departures: data.data.departures.length,
        source: data.source
      });
      
      // Les données sont déjà traitées par le backend
      setFlights({
        arrivals: data.data.arrivals,
        departures: data.data.departures
      });
      
      // Afficher la source des données
      if (data.source === 'aviationstack_api') {
        console.log('✅ Données en temps réel AviationStack');
      } else if (data.source === 'fallback_realistic') {
        console.log('🔄 Données de démonstration (API temporairement indisponible)');
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des données:', err.message);
      
      // Afficher message d'erreur
      setError(`Impossible de récupérer les données de vol: ${err.message}`);
      setFlights({
        arrivals: [],
        departures: []
      });
      
      setLoading(false);
    }
  }, []);



  // Effet pour charger les données au chargement du composant et toutes les minutes
  useEffect(() => {
    // Charger les données immédiatement
    fetchFlightData();
    
    // Puis les recharger toutes les 60 secondes
    const intervalId = setInterval(fetchFlightData, 60000);
    
    // Nettoyer l'intervalle à la suppression du composant
    return () => clearInterval(intervalId);
  }, [fetchFlightData]);  // Ajout de fetchFlightData comme dépendance

  // Fonction pour formater le status du vol selon la langue avec vérifications de sécurité
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convertir les anciens statuts vers les nouvelles clés
    const statusMap = {
      'Landed': 'landed',
      'On Time': 'onTime', 
      'Delayed': 'delayed',
      'En Route': 'enRoute',
      'Expected': 'expected',
      'Departed': 'departed',
      'Boarding': 'boarding',
      'Check-in': 'checkIn'
    };
    
    const statusKey = statusMap[status] || status.toLowerCase();
    const translatedStatus = t?.flightStatuses?.[statusKey];
    
    // Vérification stricte que c'est une chaîne
    if (typeof translatedStatus === 'string') {
      return translatedStatus;
    }
    
    // Fallback sécurisé
    return typeof status === 'string' ? status : 'Unknown';
  };

  // Fonction pour formater le nom de ville selon la langue avec vérifications de sécurité
  const formatCity = (city) => {
    if (!city) return 'Unknown';
    
    // Convertir les noms de ville vers les clés
    const cityMap = {
      'Casablanca': 'casablanca',
      'Paris': 'paris',
      'Amsterdam': 'amsterdam', 
      'Brussels': 'brussels',
      'Madrid': 'madrid',
      'Barcelona': 'barcelona',
      'Frankfurt': 'frankfurt',
      'Marseille': 'marseille',
      'Nador': 'nador'
    };
    
    const cityKey = cityMap[city] || city.toLowerCase();
    const translatedCity = t?.cities?.[cityKey];
    
    // Vérification stricte que c'est une chaîne
    if (typeof translatedCity === 'string') {
      return translatedCity;
    }
    
    // Fallback sécurisé
    return typeof city === 'string' ? city : 'Unknown';
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
      <table className={`w-full text-xs sm:text-sm ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className={`px-2 py-2 ${isRTL ? 'text-right' : 'text-left'} font-medium`}>{typeof t?.from === 'string' ? t.from : "FROM"}</th>
            <th className={`px-2 py-2 ${isRTL ? 'text-right' : 'text-left'} font-medium`}>{typeof t?.flight === 'string' ? t.flight : "FLIGHT"}</th>
            <th className={`px-2 py-2 ${isRTL ? 'text-right' : 'text-left'} font-medium`}>{typeof t?.time === 'string' ? t.time : "TIME"}</th>
            <th className={`px-2 py-2 ${isRTL ? 'text-right' : 'text-left'} font-medium`}>{typeof t?.status === 'string' ? t.status : "STATUS"}</th>
          </tr>
        </thead>
        <tbody>
          {currentFlights.map((flight, index) => {
            // Support pour l'ancienne et nouvelle structure
            const originCity = flight?.airport?.originKey || flight?.airport?.origin || 'nador';
            const destinationCity = flight?.airport?.destinationKey || flight?.airport?.destination || 'nador';
            const flightStatus = flight?.statusKey || flight?.status || 'unknown';
            const flightNumber = flight?.flight?.number || 'N/A';
            const airline = flight?.flight?.airline || 'Unknown';
            const scheduledTime = flight?.time?.scheduled || '--:--';
            
            return (
              <tr key={flight?.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className={`px-2 py-2 font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {activeTab === 'arrivals' 
                    ? formatCity(originCity) 
                    : formatCity(destinationCity)
                  }
                </td>
                <td className={`px-2 py-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-medium text-blue-600">{flightNumber}</div>
                  <div className="text-gray-500 text-xs truncate">{airline}</div>
                </td>
                <td className={`px-2 py-2 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>{scheduledTime}</td>
                <td className={`px-2 py-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    flightStatus === 'onTime' || flightStatus === 'departed' || flightStatus === 'On Time' || flightStatus === 'Departed' ? 'bg-green-100 text-green-800' :
                    flightStatus === 'delayed' || flightStatus === 'Delayed' ? 'bg-red-100 text-red-800' :
                    flightStatus === 'boarding' || flightStatus === 'expected' || flightStatus === 'Boarding' || flightStatus === 'Expected' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatStatus(flightStatus)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 animate-fade-in">
      <div className={`p-3 sm:p-4 bg-blue-600 text-white flex flex-col sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''} sm:justify-between sm:items-center space-y-2 sm:space-y-0`} dir={isRTL ? 'rtl' : 'ltr'}>
        <h3 className={`font-bold flex items-center text-sm sm:text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Plane className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? 'ml-2' : 'mr-2'} flex-shrink-0`} /> 
          <span className="truncate">
            {typeof t?.liveFlights === 'string' ? t.liveFlights : "Live Flights"} - {typeof t?.nadorAirport === 'string' ? t.nadorAirport : "Nador Airport"}
          </span>
        </h3>
        <div className={`text-xs sm:text-sm text-blue-200 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        {/* Carte FlightRadar24 */}
        <div className="p-3 sm:p-4 order-2 xl:order-1">
          <div className="relative h-[250px] sm:h-[300px] lg:h-[350px] rounded-lg overflow-hidden border border-gray-200">
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
        <div className="p-3 sm:p-4 order-1 xl:order-2">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Onglets pour basculer entre arrivées et départs */}
            <div className={`flex border-b ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <button
                className={`flex-1 py-2 px-2 sm:px-4 text-center text-sm sm:text-base ${
                  activeTab === 'arrivals' ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('arrivals')}
              >
                <div className={`flex justify-center items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ArrowDown className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  <span className="hidden sm:inline">{typeof t?.arrivals === 'string' ? t.arrivals : "Arrivals"}</span>
                  <span className="sm:hidden">{typeof t?.arrivalsShort === 'string' ? t.arrivalsShort : "Arr."}</span>
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-2 sm:px-4 text-center text-sm sm:text-base ${
                  activeTab === 'departures' ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('departures')}
              >
                <div className={`flex justify-center items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ArrowUp className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  <span className="hidden sm:inline">{typeof t?.departures === 'string' ? t.departures : "Departures"}</span>
                  <span className="sm:hidden">{typeof t?.departuresShort === 'string' ? t.departuresShort : "Dep."}</span>
                </div>
              </button>
            </div>
            
            {/* Tableau des vols */}
            {renderFlightsTable()}
            
            <div className="p-2 text-center text-xs text-gray-500 bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className={`flex flex-col sm:flex-row sm:justify-center sm:items-center space-y-1 sm:space-y-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <span>{typeof t?.updatedEveryMinute === 'string' ? t.updatedEveryMinute : "Updated every minute"}</span>
                <span className="hidden sm:inline mx-2">•</span>
                <span>
                  {typeof t?.poweredBy === 'string' ? t.poweredBy : "Powered by"} 
                  <a href="https://www.aviationstack.com" target="_blank" rel="noopener noreferrer" className={`text-blue-600 hover:underline ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  AviationStack
                  </a>
                </span>
              </div>
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
