import React from 'react';
import { Navigation } from 'lucide-react';

const FlightRadar = ({ showFlightRadar, toggleFlightRadar, t, selectedLanguage }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Navigation className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">FlightRadar24 - {t.title} (NDR/GMMW)</h2>
        </div>
        <button
          onClick={toggleFlightRadar}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showFlightRadar ? t.hide : t.show} {t.radar}
        </button>
      </div>

      {showFlightRadar && (
        <div className="space-y-6">
          {/* FlightRadar24 en temps réel intégré */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                {t.flightRadarTitle}
              </h3>
              <p className="text-sm text-gray-600" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                {t.flightRadarDesc}
                <br />
                {t.coordinates}
              </p>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ height: '500px' }}>
              <iframe
                src="https://www.flightradar24.com/simple_index.php?lat=34.9888&lon=-3.0282&z=10&label1=callsign&label2=altspeed&label3=tofrom&size=auto"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="FlightRadar24 - Aéroport Al Aroui Nador"
                className="border-0"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
              <span>{selectedLanguage === 'fr' ? 'Données fournies par FlightRadar24.com' : 
                     selectedLanguage === 'ar' ? 'البيانات مقدمة من FlightRadar24.com' : 
                     'Data provided by FlightRadar24.com'}</span>
              <a 
                href="https://www.flightradar24.com/data/airports/ndr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {selectedLanguage === 'fr' ? 'Voir sur FlightRadar24 →' : 
                 selectedLanguage === 'ar' ? 'عرض على FlightRadar24 ←' : 
                 'View on FlightRadar24 →'}
              </a>
            </div>
          </div>

          {/* Liens vers les données d'aéroport */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                {t.airportInfo}
              </h4>
              <ul className="text-sm text-blue-700 space-y-1" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                <li>• {selectedLanguage === 'fr' ? 'Code IATA : NDR' : 
                      selectedLanguage === 'ar' ? 'كود إياتا: NDR' : 
                      'IATA Code: NDR'}</li>
                <li>• {selectedLanguage === 'fr' ? 'Code ICAO : GMMW' : 
                      selectedLanguage === 'ar' ? 'كود إيكاو: GMMW' : 
                      'ICAO Code: GMMW'}</li>
                <li>• {selectedLanguage === 'fr' ? 'Nom complet : Nador International Airport' : 
                      selectedLanguage === 'ar' ? 'الاسم الكامل: مطار الناظور الدولي' : 
                      'Full name: Nador International Airport'}</li>
                <li>• {selectedLanguage === 'fr' ? 'Localisation : Al Aroui, Maroc' : 
                      selectedLanguage === 'ar' ? 'الموقع: العروي، المغرب' : 
                      'Location: Al Aroui, Morocco'}</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                {t.usefulLinks}
              </h4>
              <div className="space-y-2 text-sm">
                <a 
                  href="https://www.flightradar24.com/data/airports/ndr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 block"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {selectedLanguage === 'ar' ? '← ' : '→ '}{selectedLanguage === 'fr' ? 'Détails aéroport FlightRadar24' : 
                      selectedLanguage === 'ar' ? 'تفاصيل المطار FlightRadar24' : 
                      'FlightRadar24 airport details'}
                </a>
                <a 
                  href="https://fr.flightaware.com/live/airport/GMMW" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 block"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {selectedLanguage === 'ar' ? '← ' : '→ '}{selectedLanguage === 'fr' ? 'Suivi vols FlightAware' : 
                      selectedLanguage === 'ar' ? 'تتبع الرحلات FlightAware' : 
                      'FlightAware flight tracking'}
                </a>
                <a 
                  href="https://www.airports-worldwide.info/airport/NDR/departures" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 block"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {selectedLanguage === 'ar' ? '← ' : '→ '}{selectedLanguage === 'fr' ? 'Départs en temps réel' : 
                      selectedLanguage === 'ar' ? 'مغادرات في الوقت الفعلي' : 
                      'Real-time departures'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightRadar;
