const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuration de l'API AviationStack
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY || '45b1e92380464c2e681f6df224729e76';
const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1';

// Fonction pour mapper les codes IATA vers nos clés de traduction
const getAirportKey = (airport) => {
  if (!airport || !airport.iata) return 'unknown';
  const iata = airport.iata.toLowerCase();
  
  const airportMap = {
    'ndr': 'nador', 'gmmw': 'nador',
    'cmn': 'casablanca', 'cdg': 'paris', 'ory': 'paris',
    'ams': 'amsterdam', 'bru': 'brussels', 'mad': 'madrid',
    'bcn': 'barcelona', 'fra': 'frankfurt', 'mrs': 'marseille',
    'lhr': 'london', 'fco': 'rome', 'dub': 'dublin',
    'vie': 'vienna', 'muc': 'munich', 'zur': 'zurich'
  };
  
  return airportMap[iata] || iata;
};

// Fonction pour mapper les statuts AviationStack vers nos clés
const mapFlightStatus = (aviationStatus) => {
  if (!aviationStatus) return 'scheduled';
  const status = aviationStatus.toLowerCase();
  
  if (status.includes('scheduled')) return 'scheduled';
  if (status.includes('active') || status.includes('en-route')) return 'enRoute';
  if (status.includes('landed')) return 'landed';
  if (status.includes('cancelled')) return 'cancelled';
  if (status.includes('delayed')) return 'delayed';
  return 'onTime';
};

// Route principale pour récupérer les vols via AviationStack
router.get('/', async (req, res) => {
  try {
    console.log('🛩️ Récupération des données AviationStack pour NDR...');

    // Appels simultanés pour arrivées et départs
    const [arrivalsResponse, departuresResponse] = await Promise.all([
      axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          arr_iata: 'NDR',
          limit: 20,
          offset: 0
        },
        timeout: 10000
      }),
      axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          dep_iata: 'NDR',
          limit: 20,
          offset: 0
        },
        timeout: 10000
      })
    ]);

    // Traitement des arrivées
    const arrivals = (arrivalsResponse.data.data || [])
      .filter(flight => {
        if (!flight.departure || !flight.departure.scheduled) return false;
        const flightTime = new Date(flight.departure.scheduled);
        const now = new Date();
        return flightTime > (now - 2 * 3600000);
      })
      .map((flight, index) => ({
        id: `aviationstack-arrival-${index}`,
        flight: {
          airline: flight.airline?.name || 'Compagnie inconnue',
          number: flight.flight?.iata || flight.flight?.icao || 'N/A'
        },
        airport: {
          originKey: getAirportKey(flight.departure),
          destinationKey: 'nador'
        },
        statusKey: mapFlightStatus(flight.flight_status),
        time: {
          scheduled: flight.arrival?.scheduled ? 
            new Date(flight.arrival.scheduled).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'N/A'
        }
      }));

    // Traitement des départs
    const departures = (departuresResponse.data.data || [])
      .filter(flight => {
        if (!flight.departure || !flight.departure.scheduled) return false;
        const flightTime = new Date(flight.departure.scheduled);
        const now = new Date();
        return flightTime > (now - 3600000);
      })
      .map((flight, index) => ({
        id: `aviationstack-departure-${index}`,
        flight: {
          airline: flight.airline?.name || 'Compagnie inconnue',
          number: flight.flight?.iata || flight.flight?.icao || 'N/A'
        },
        airport: {
          originKey: 'nador',
          destinationKey: getAirportKey(flight.arrival)
        },
        statusKey: mapFlightStatus(flight.flight_status),
        time: {
          scheduled: flight.departure?.scheduled ? 
            new Date(flight.departure.scheduled).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'N/A'
        }
      }));

    console.log(`✈️ Données récupérées: ${arrivals.length} arrivées, ${departures.length} départs`);

    res.json({
      success: true,
      data: {
        arrivals,
        departures
      },
      timestamp: new Date().toISOString(),
      source: 'aviationstack_api'
    });

  } catch (error) {
    console.error('❌ Erreur AviationStack API:', error.message);
    
    // Fallback avec données réalistes basées sur FlightRadar24
    const fallbackFlights = {
      arrivals: [
        {
          id: 'fallback-arr-1',
          flight: { airline: 'Ryanair', number: 'FR5009' },
          airport: { originKey: 'frankfurt', destinationKey: 'nador' },
          statusKey: 'expected',
          time: { scheduled: '19:50' }
        },
        {
          id: 'fallback-arr-2',
          flight: { airline: 'Ryanair', number: 'FR6011' },
          airport: { originKey: 'marseille', destinationKey: 'nador' },
          statusKey: 'onTime',
          time: { scheduled: '20:15' }
        },
        {
          id: 'fallback-arr-3',
          flight: { airline: 'TUI fly', number: 'TB625' },
          airport: { originKey: 'brussels', destinationKey: 'nador' },
          statusKey: 'onTime',
          time: { scheduled: '21:29' }
        }
      ],
      departures: [
        {
          id: 'fallback-dep-1',
          flight: { airline: 'AirArabia', number: '3O377' },
          airport: { originKey: 'nador', destinationKey: 'barcelona' },
          statusKey: 'boarding',
          time: { scheduled: '19:05' }
        }
      ]
    };

    res.json({
      success: true,
      data: fallbackFlights,
      timestamp: new Date().toISOString(),
      source: 'fallback_realistic',
      error: 'API temporairement indisponible - données de démonstration basées sur FlightRadar24'
    });
  }
});

module.exports = router;
