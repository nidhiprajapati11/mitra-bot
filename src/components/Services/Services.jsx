import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ServiceSelector from './ServiceSelector';
import ProfessionalCard from './ProfessionalCard';
import { searchJobs, searchProfessionals, getProfessionalsByCategory } from '../../services/databaseService';
import toast from 'react-hot-toast';

const Services = () => {
  const [showServiceSelector, setShowServiceSelector] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleServiceSelection = async (service) => {
    setSelectedService(service);
    setShowServiceSelector(false);
    setSearchResults([]);
    setLoading(true);
    
    try {
      let results = [];
      
      // Map service IDs to correct database category labels
      const categoryMap = {
        'job_search': 'placement',
        'general_doctor': 'mbbs',
        'mental_health': 'mental',
        'specialist_care': 'mbbs',
        'legal_aid': 'legal',
        'lab_tests': 'pathology',
        'pharmacy': 'pharmacy',
      };
      
      const category = categoryMap[service.id] || service.id;
      
      // Fetch real data from Firebase based on service type
      switch (service.id) {
        case 'job_search':
          results = await searchJobs({ limit: 20 });
          console.log('Job search results:', results);
          break;
          
        case 'general_doctor':
        case 'specialist_care':
          results = await getProfessionalsByCategory('mbbs', 100);
          console.log('Healthcare professionals:', results);
          break;
          
        case 'mental_health':
          results = await getProfessionalsByCategory('mental', 100);
          console.log('Mental health professionals:', results);
          break;
          
        case 'legal_aid':
          results = await getProfessionalsByCategory('legal', 100);
          console.log('Legal professionals:', results);
          break;
          
        case 'lab_tests':
          results = await getProfessionalsByCategory('pathology', 100);
          console.log('Pathology labs:', results);
          break;
          
        case 'pharmacy':
          results = await getProfessionalsByCategory('pharmacy', 100);
          console.log('Pharmacies:', results);
          break;
          
        default:
          results = await searchProfessionals({ limit: 100 });
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.error('No results found. Try a different service.');
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
      toast.error('Failed to load services. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('search')}
        </h1>
        <p className="text-gray-600">
          Find the services and support you need
        </p>
      </div>

      {selectedService && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{selectedService.icon}</span>
            <h2 className="text-lg font-semibold">{selectedService.name}</h2>
          </div>
          <p className="text-sm text-gray-600">{selectedService.description}</p>
          
          <button
            onClick={() => setShowServiceSelector(true)}
            className="mt-3 text-primary text-sm font-medium hover:underline"
          >
            Change service
          </button>
        </div>
      )}

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Options ({searchResults.length})
          </h3>
          
          {searchResults.map((result) => (
            <ProfessionalCard 
              key={result.id}
              professional={result}
              serviceType={selectedService?.id}
            />
          ))}
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for {selectedService?.name}...</p>
        </div>
      ) : selectedService ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 mb-2">No results found</p>
          <button
            onClick={() => handleServiceSelection(selectedService)}
            className="text-primary text-sm font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      <ServiceSelector
        isOpen={showServiceSelector}
        onClose={() => setShowServiceSelector(false)}
        onServiceSelect={handleServiceSelection}
      />
    </div>
  );
};

export default Services;