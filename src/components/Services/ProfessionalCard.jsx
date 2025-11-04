import React from 'react';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';
import { HeartIcon, LanguageIcon } from '@heroicons/react/24/outline';

const ProfessionalCard = ({ professional, serviceType }) => {
  const isJobListing = serviceType === 'job_search';
  const isPharmacy = serviceType === 'pharmacy';

  const handleBooking = () => {
    // This would open a booking modal or navigate to booking page
    console.log('Book appointment with:', professional);
  };

  const handleContact = () => {
    // This would show contact information
    console.log('Contact:', professional);
  };

  if (isJobListing) {
    // Handle job data from Firebase
    const jobTitle = professional.jobTitle || professional.job_title || professional.title || professional.position || 'Job Position';
    const company = professional.company || professional.company_name || professional.employer || professional.name || 'Company';
    const location = professional.location || professional.city || professional.workplace_location || 'Location not specified';
    const salaryMin = professional.salaryMin || professional.salary_min || professional.min_salary || 0;
    const salaryMax = professional.salaryMax || professional.salary_max || professional.max_salary || 0;
    const workArrangement = professional.workArrangement || professional.work_arrangement || [];
    const requirements = professional.requirements || professional.skills || [];
    const jobType = professional.jobType || professional.job_type || professional.employment_type || '';

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 service-card hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{jobTitle}</h3>
            <p className="text-primary font-medium">{company}</p>
            {jobType && <p className="text-xs text-gray-500">{jobType}</p>}
          </div>
          <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">
            LGBTQAI+ Inclusive
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {location}
          </div>
          {(salaryMin > 0 || salaryMax > 0) && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-1">💰</span>
              {salaryMin > 0 && salaryMax > 0
                ? `₹${(salaryMin / 100000).toFixed(1)} - ${(salaryMax / 100000).toFixed(1)} LPA`
                : salaryMin > 0
                  ? `From ₹${(salaryMin / 100000).toFixed(1)} LPA`
                  : `Up to ₹${(salaryMax / 100000).toFixed(1)} LPA`
              }
            </div>
          )}
          {workArrangement && workArrangement.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-1">🏢</span>
              {Array.isArray(workArrangement) ? workArrangement.join(', ') : workArrangement}
            </div>
          )}
        </div>

        {requirements && Array.isArray(requirements) && requirements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Requirements:</p>
            <div className="flex flex-wrap gap-1">
              {requirements.slice(0, 5).map((req, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {req}
                </span>
              ))}
              {requirements.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{requirements.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleBooking}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Apply Now
          </button>
          <button
            onClick={handleContact}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            Details
          </button>
        </div>
      </div>
    );
  }

  if (isPharmacy) {
    const pharmacyServices = professional.services || [];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 service-card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{professional.name || 'Pharmacy'}</h3>
            <p className="text-sm text-gray-600">{professional.specialty || ''}</p>
          </div>
          {professional.discount && (
            <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">
              {professional.discount}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {professional.location || 'Location not specified'}
          </div>
        </div>

        {Array.isArray(pharmacyServices) && pharmacyServices.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Services:</p>
            <div className="flex flex-wrap gap-1">
              {pharmacyServices.map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleBooking}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Order Online
          </button>
          <button
            onClick={handleContact}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            Call
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${professional.first_name || ''} ${professional.last_name || ''}`.trim();
  const name = fullName || professional.username || professional.name || 'Professional';
  const specialty = professional.professional_type_label
    || professional.specialization
    || professional.category
    || '';
  const experience = professional.years_of_experience || professional.experience || 'N/A';
  const rating = professional.rating || professional.averageRating || 0;
  const fee = professional.hourly_rate || professional.fee || 'Contact for fee';
  const languages = professional.languages_spoken || professional.languages || ['English'];
  const isLGBTQFriendly = professional.sensitize || professional.isLGBTQFriendly || false;
  const availability = professional.availableSlots || professional.slots || [];
  const location = professional.address || professional.location || 'Location not specified';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 service-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{specialty}</p>
          <p className="text-xs text-gray-500">{experience} years experience</p>
        </div>

        <div className="flex items-center space-x-2">
          {isLGBTQFriendly && (
            <HeartIcon className="h-5 w-5 text-secondary" title="LGBTQAI+ Friendly" />
          )}
          {rating > 0 && (
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">{Number(rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-1">💰</span>
          Fee: {typeof fee === 'number' ? `₹${fee}` : fee}
        </div>

        {languages && languages.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <LanguageIcon className="h-4 w-4 mr-1" />
            {Array.isArray(languages) ? languages.slice(0, 2).join(', ') : languages}
          </div>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-4">
        <MapPinIcon className="h-4 w-4 mr-1" />
        {location}
      </div>

      {availability && Array.isArray(availability) && availability.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Available slots today:</p>
          <div className="flex flex-wrap gap-1">
            {availability.slice(0, 4).map((slot, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleBooking}
          className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Book Appointment
        </button>
        <button
          onClick={handleContact}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          Contact
        </button>
      </div>
    </div>
  );
};

export default ProfessionalCard;