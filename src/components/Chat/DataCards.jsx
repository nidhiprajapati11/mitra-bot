import React, { useState } from 'react';
import { StarIcon, MapPinIcon, CurrencyRupeeIcon, ClockIcon, BuildingOfficeIcon, CalendarIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { CheckBadgeIcon, EyeIcon, ClockIcon as ClockOutline, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ProfessionalCard = ({ professional, onBook, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Map fields from your actual database structure
  const firstName = professional.first_name || '';
  const lastName = professional.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || professional.username || 'Professional';
  
  const biography = professional.biography || '';
  const education = professional.educational_qualification || '';
  const experience = professional.years_of_experience || 0;
  const address = professional.address || 'Location not specified';
  const hourlyRate = professional.hourly_rate || 0;
  const sessionDuration = professional.session_duration || 60;
  
  // Verification status
  const verified = professional.verification_status === 'VERIFIED' || 
                   professional.professionalStatus === 'verified';
  
  // Contact information
  const phone = professional.phone || '';
  const email = professional.email || '';
  
  // Availability
  const isAvailableOnline = professional.is_available_online || false;
  const isAvailableInPerson = professional.is_available_in_person || false;
  const hasAvailableSlots = isAvailableOnline || isAvailableInPerson;
  
  // Languages
  const languages = professional.languages_spoken || '';
  
  // Additional fields for expanded view
  const specialization = professional.specialization || '';
  const professionalTypeLabel = professional.professional_type_label || professional.professional_type_id || '';
  const clinicName = professional.clinic_name || '';
  const consultationMode = professional.consultation_mode || '';
  const availableSlots = professional.available_slots || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 hover:border-primary-300 hover:shadow-md transition-all duration-200">
      {/* Collapsed View - Essential Info */}
      {!isExpanded ? (
        <>
          {/* Header - Compact */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Avatar - Smaller */}
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              
              {/* Name & Education - Compact */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-semibold text-base text-gray-900 truncate">{name}</h3>
                  {verified && (
                    <CheckBadgeIcon className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />
                  )}
                </div>
                {education && (
                  <p className="text-xs text-gray-600 truncate text-wrap">{education}</p>
                )}
                {specialization || professionalTypeLabel && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                    {specialization || professionalTypeLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info - One Line */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
            {experience > 0 && (
              <div className="flex items-center gap-1">
                <BriefcaseIcon className="h-3.5 w-3.5" />
                <span>{experience}y</span>
              </div>
            )}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </div>
            {languages && (
              <div className="flex items-center gap-1">
                <GlobeAltIcon className="h-3.5 w-3.5" />
                <span className="truncate">{languages.split(',')[0]}</span>
              </div>
            )}
          </div>

          {/* Availability & Price - Compact Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Availability Pills - Smaller */}
            <div className="flex gap-1.5 flex-wrap">
              {isAvailableOnline && (
                <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-medium">
                  💻 Online
                </span>
              )}
              {isAvailableInPerson && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">
                  🏥 In-Person
                </span>
              )}
              {!hasAvailableSlots && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs">
                  Unavailable
                </span>
              )}
            </div>

            {/* Price - Compact */}
            {hourlyRate > 0 && (
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">{hourlyRate.toLocaleString()}</span>
                <span className="text-xs text-gray-500">/{sessionDuration}m</span>
              </div>
            )}
          </div>

          {/* Bio - One Line Preview */}
          {biography && (
            <p className="text-xs text-gray-600 line-clamp-1 mb-3">{biography}</p>
          )}
        </>
      ) : (
        /* Expanded View - Clean Sections */
        <div className="space-y-3">{/* Header in Expanded */}
          <div className="flex items-start justify-between pb-3 border-b border-gray-200">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{name}</h3>
                  {verified && (
                    <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="Verified" />
                  )}
                </div>
                {education && (
                  <p className="text-sm text-gray-600 font-medium mb-1">{education}</p>
                )}
                {specialization || professionalTypeLabel && (
                  <span className="inline-block px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-semibold">
                    {specialization || professionalTypeLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {biography && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">About</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{biography}</p>
            </div>
          )}

          {/* Info Grid - Clean */}
          <div className="grid grid-cols-2 gap-2">
            {experience > 0 && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <BriefcaseIcon className="h-4 w-4 text-primary-500" />
                  <span className="text-xs font-medium text-gray-600">Experience</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{experience} years</p>
              </div>
            )}
            
            {sessionDuration && (
              <div className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <ClockIcon className="h-4 w-4 text-primary-500" />
                  <span className="text-xs font-medium text-gray-600">Session</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{sessionDuration} min</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPinIcon className="h-4 w-4 text-primary-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Location</span>
            </div>
            {clinicName && (
              <p className="text-sm font-medium text-gray-800 mb-0.5">{clinicName}</p>
            )}
            <p className="text-sm text-gray-600">{address}</p>
          </div>

          {/* Languages */}
          {languages && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <GlobeAltIcon className="h-4 w-4 text-primary-500" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Languages</span>
              </div>
              <p className="text-sm text-gray-700">{languages}</p>
            </div>
          )}

          {/* Pricing */}
          {hourlyRate > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-900 uppercase tracking-wide">Fee</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-green-700">₹{hourlyRate.toLocaleString()}</span>
                <span className="text-sm text-green-600">per {sessionDuration} min session</span>
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-primary-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Availability</span>
            </div>
            <div className="flex gap-2">
              {isAvailableOnline && (
                <div className="flex-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-lg mb-0.5">💻</div>
                  <p className="text-xs font-medium text-green-700">Online</p>
                </div>
              )}
              {isAvailableInPerson && (
                <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="text-lg mb-0.5">🏥</div>
                  <p className="text-xs font-medium text-blue-700">In-Person</p>
                </div>
              )}
              {!hasAvailableSlots && (
                <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center">
                  <div className="text-lg mb-0.5">⚠️</div>
                  <p className="text-xs font-medium text-gray-700">Not Available</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          {(phone || email) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <PhoneIcon className="h-4 w-4 text-primary-500" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Contact</span>
              </div>
              <div className="space-y-2">
                {phone && (
                  <a 
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">{phone}</span>
                  </a>
                )}
                {email && (
                  <a 
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    <EnvelopeIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">{email}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Always at Bottom */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
        {!isExpanded ? (
          <>
            {/* Show Book Now button only if slots available */}
            {hasAvailableSlots ? (
              <>
                <button
                  onClick={() => onBook(professional)}
                  className="flex-1 bg-primary-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm"
                >
                  Book Now
                </button>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </>
            ) : (
              /* Show contact details if no slots available */
              <>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center gap-1 justify-center"
                >
                  <span>View Details</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                {phone && (
                  <a 
                    href={`tel:${phone}`}
                    className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all flex items-center gap-1.5"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    <span className="text-sm">Call</span>
                  </a>
                )}
                {email && (
                  <a 
                    href={`mailto:${email}`}
                    className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all flex items-center gap-1.5"
                  >
                    <EnvelopeIcon className="h-3.5 w-3.5" />
                    <span className="text-sm">Email</span>
                  </a>
                )}
              </>
            )}
          </>
        ) : (
          /* Expanded view actions */
          <>
            {hasAvailableSlots ? (
              <>
                <button
                  onClick={() => onBook(professional)}
                  className="flex-1 bg-primary-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm"
                >
                  📅 Book Appointment
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <span>Show Less</span>
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
              </>
            ) : (
              /* No slots available - show only Show Less button */
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span>Show Less</span>
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const JobDetailsCard = ({ job, onApply, onClose }) => {
  const jobTitle = job.jobTitle || job.job_title || job.title || job.position || 'Job Position';
  const company = job.company || job.company_name || job.employer || 'Company';
  const location = job.location || job.city || job.workplace_location || 'Location not specified';
  const department = job.department || job.dept || '';
  const workArrangement = job.workArrangement || job.work_arrangement || job.remote_option || 'Not specified';
  const benefits = job.benefits || '';
  const contactEmail = job.contactEmail || job.contact_email || job.email || '';
  const companyLogoUrl = job.companyLogoUrl || job.company_logo || '';
  const views = job.views || 0;
  const createdAt = job.createdAt || null;
  const applicationDeadline = job.applicationDeadline || null;
  const jobDescription = job.description || job.job_description || 'No description available';
  const requirements = job.requirements || job.qualifications || '';
  const salaryMin = job.salaryMin || job.salary_min || job.min_salary || 0;
  const salaryMax = job.salaryMax || job.salary_max || job.max_salary || 0;

  return (
    <div className="bg-white rounded-lg border border-primary-200 p-6 shadow-elegant">
      {/* Header with company logo and basic info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          {companyLogoUrl ? (
            <img src={companyLogoUrl} alt={company} className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-primary-900 mb-1">{jobTitle}</h2>
          <p className="text-lg text-primary-700 font-medium mb-1">{company}</p>
          {department && <p className="text-sm text-primary-600 mb-2">{department}</p>}
          
          <div className="flex items-center gap-4 text-sm text-primary-600">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{location}</span>
            </div>
            {views > 0 && (
              <div className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4" />
                <span>{views} views</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work Arrangement & Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-medium text-primary-900 mb-2">Work Arrangement</h4>
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
            {workArrangement}
          </span>
        </div>
        {(salaryMin > 0 || salaryMax > 0) && (
          <div>
            <h4 className="font-medium text-primary-900 mb-2">Salary Range</h4>
            <div className="flex items-center gap-1 text-primary-700">
              <CurrencyRupeeIcon className="h-4 w-4" />
              <span>
                {salaryMin > 0 && salaryMax > 0 
                  ? `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`
                  : salaryMin > 0 
                    ? `From ${salaryMin.toLocaleString()}`
                    : `Up to ${salaryMax.toLocaleString()}`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Job Description */}
      {jobDescription !== 'No description available' && (
        <div className="mb-6">
          <h4 className="font-medium text-primary-900 mb-3">Job Description</h4>
          <p className="text-primary-700 leading-relaxed">{jobDescription}</p>
        </div>
      )}

      {/* Requirements */}
      {requirements && (
        <div className="mb-6">
          <h4 className="font-medium text-primary-900 mb-3">Requirements</h4>
          <p className="text-primary-700 leading-relaxed">{requirements}</p>
        </div>
      )}

      {/* Benefits */}
      {benefits && (
        <div className="mb-6">
          <h4 className="font-medium text-primary-900 mb-3">Benefits</h4>
          <p className="text-primary-700 leading-relaxed">{benefits}</p>
        </div>
      )}

      {/* Contact & Application Info */}
      <div className="border-t border-primary-200 pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            {contactEmail && (
              <div className="flex items-center gap-2 text-primary-600 mb-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span className="text-sm">{contactEmail}</span>
              </div>
            )}
            {applicationDeadline && (
              <div className="flex items-center gap-2 text-primary-600">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm">
                  Apply by: {new Date(applicationDeadline.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => onClose && onClose()}
              className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Back to List
            </button>
            <button
              onClick={() => onApply && onApply(job)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job, onApply, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handle the actual database field names based on your data structure
  const jobTitle = job.jobTitle || job.job_title || job.title || job.position || 'Job Position';
  const company = job.company || job.company_name || job.employer || 'Company';
  const location = job.location || job.city || job.workplace_location || 'Location not specified';
  const jobType = job.jobType || job.job_type || job.employment_type || job.type || 'full-time';
  const experience = job.experience || job.experience_level || job.required_experience || 'Not specified';
  const department = job.department || job.dept || '';
  const salaryMin = job.salaryMin || job.salary_min || job.min_salary || 0;
  const salaryMax = job.salaryMax || job.salary_max || job.max_salary || 0;
  const currency = job.currency || 'INR';
  const workArrangement = job.workArrangement || job.work_arrangement || job.remote_option || [];
  const benefits = job.benefits || '';
  const contactEmail = job.contactEmail || job.contact_email || job.email || '';
  const companyLogoUrl = job.companyLogoUrl || job.company_logo || '';
  const views = job.views || [];
  const createdAt = job.createdAt || null;
  const applicationDeadline = job.applicationDeadline || null;
  const jobDescription = job.description || job.job_description || '';
  const requirements = job.requirements || job.qualifications || '';

  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl border-2 border-green-200 p-5 mb-4 shadow-royal hover:shadow-royal-lg transition-all duration-300">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          {companyLogoUrl ? (
            <img src={companyLogoUrl} alt={company} className="w-14 h-14 rounded-xl object-cover shadow-md" />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl text-primary-900 mb-1">{jobTitle}</h3>
          <p className="text-base text-primary-700 font-semibold">{company}</p>
          {department && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              {department}
            </span>
          )}
        </div>
      </div>
      
      {/* Collapsed View - Essential Info */}
      {!isExpanded && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm">
              <MapPinIcon className="h-4 w-4 text-primary-500" />
              <span className="font-medium">{location}</span>
            </div>
            
            <span className="bg-primary-100 text-primary-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              {jobType}
            </span>
            
            <span className="bg-secondary-100 text-secondary-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              {experience}
            </span>

            {Array.isArray(workArrangement) && workArrangement.map((arrangement, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                {arrangement}
              </span>
            ))}
          </div>
          
          {(salaryMin > 0 || salaryMax > 0) && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 mb-4">
              <div className="flex items-center gap-2">
                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    {salaryMin > 0 && salaryMax > 0 
                      ? `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`
                      : salaryMin > 0 ? `${salaryMin.toLocaleString()}+` : `Up to ${salaryMax.toLocaleString()}`
                    }
                  </span>
                  <span className="text-sm font-medium text-primary-600 ml-2">per month</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Expanded View - Full Details */}
      {isExpanded && (
        <div className="space-y-4 animate-slideDown">
          {/* Job Description */}
          {jobDescription && (
            <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm">
              <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <span className="text-lg">📋</span> Job Description
              </h4>
              <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-line">{jobDescription}</p>
            </div>
          )}
          
          {/* Requirements */}
          {requirements && (
            <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm">
              <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <span className="text-lg">✓</span> Requirements
              </h4>
              <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-line">{requirements}</p>
            </div>
          )}
          
          {/* Work Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-green-200 shadow-sm">
              <p className="text-xs text-primary-600 font-medium mb-1">Job Type</p>
              <p className="text-base font-bold text-primary-900">{jobType}</p>
            </div>
            
            <div className="p-3 bg-white rounded-xl border border-green-200 shadow-sm">
              <p className="text-xs text-primary-600 font-medium mb-1">Experience</p>
              <p className="text-base font-bold text-primary-900">{experience}</p>
            </div>
          </div>
          
          {/* Location Details */}
          <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm">
            <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-primary-500" />
              Location
            </h4>
            <p className="text-sm text-primary-700">{location}</p>
            {Array.isArray(workArrangement) && workArrangement.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {workArrangement.map((arrangement, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                    {arrangement}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Salary Details */}
          {(salaryMin > 0 || salaryMax > 0) && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                Salary Range
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  ₹{salaryMin > 0 && salaryMax > 0 
                    ? `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`
                    : salaryMin > 0 
                      ? `${salaryMin.toLocaleString()}+`
                      : `Up to ${salaryMax.toLocaleString()}`
                  }
                </span>
                <span className="text-sm text-green-700 font-medium">per month</span>
              </div>
            </div>
          )}
          
          {/* Benefits */}
          {benefits && (
            <div className="p-4 bg-white rounded-xl border border-green-200 shadow-sm">
              <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <span className="text-lg">🎁</span> Benefits
              </h4>
              <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-line">{benefits}</p>
            </div>
          )}
          
          {/* Application Details */}
          {(contactEmail || applicationDeadline) && (
            <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-300 shadow-sm">
              <h4 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary-500" />
                Application Details
              </h4>
              <div className="space-y-2">
                {contactEmail && (
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-primary-100 transition-colors group"
                  >
                    <EnvelopeIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-700" />
                    <span className="text-sm font-semibold text-primary-800">{contactEmail}</span>
                  </a>
                )}
                {applicationDeadline && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-primary-600 font-medium">Apply Before</p>
                      <p className="text-sm font-bold text-primary-900">
                        {new Date(applicationDeadline.seconds * 1000).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        {/* <button
          onClick={() => onApply(job)}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all shadow-lg hover:shadow-xl"
        >
          ✓ Apply Now
        </button> */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center px-4 py-3 border-2 border-green-400 text-green-700 font-bold rounded-xl hover:bg-green-50 active:scale-95 transition-all flex items-center gap-2 shadow-md"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="h-5 w-5" />
              <span>Less</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-5 w-5" />
              <span>Details</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const DataCards = ({ data, type, onAction }) => {
  const [visibleCount, setVisibleCount] = React.useState(20);
  
  if (!data || data.length === 0) return null;

  const handleBook = (professional) => {
    onAction('book', professional);
  };

  const handleApply = (job) => {
    onAction('apply', job);
  };

  const handleViewDetails = (item) => {
    onAction('view_details', item);
  };
  
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, data.length));
  };

  const getTitle = () => {
    if (type === 'professionals') return `${data.length} Professional${data.length > 1 ? 's' : ''} Found`;
    if (type === 'jobs') {
      if (data.length === 1) return 'Job Details';
      return `${data.length} Job${data.length > 1 ? 's' : ''} Found`;
    }
    return 'Results';
  };

  const visibleData = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  return (
    <div className="mt-3">
      {/* Header - Subtle and Clean */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-base">
              {type === 'professionals' ? '👨‍⚕️' : '💼'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-base text-gray-900">{getTitle()}</h3>
            <p className="text-xs text-gray-600">
              {type === 'professionals' 
                ? `Showing ${visibleCount} of ${data.length} verified ${data.length === 1 ? 'professional' : 'professionals'}`
                : `Showing ${visibleCount} of ${data.length} ${data.length === 1 ? 'opportunity' : 'opportunities'}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md font-medium border border-gray-200">
            ✓ Verified
          </span>
          <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md font-medium border border-gray-200">
            {type === 'professionals' ? '🏆 Top Rated' : '🚀 Latest'}
          </span>
          <span className="px-2 py-0.5 bg-white text-gray-700 rounded-md font-medium border border-gray-200">
            🏳️‍🌈 Friendly
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {type === 'professionals' && visibleData.map((professional, index) => (
          <ProfessionalCard
            key={professional.id || professional.professional_id || index}
            professional={professional}
            onBook={handleBook}
            onViewDetails={handleViewDetails}
          />
        ))}
        
        {type === 'jobs' && visibleData.map((job, index) => (
          <JobCard
            key={job.id || index}
            job={job}
            onApply={handleApply}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
      
      {/* Load More Button - Subtle */}
      {hasMore && (
        <div className="mt-3 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 mx-auto"
          >
            <span>Load More</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-sm font-semibold">
              +{data.length - visibleCount}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DataCards;