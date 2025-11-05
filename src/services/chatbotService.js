import { 
  searchProfessionals, 
  searchJobs, 
  getProfessionalById,
  getUserBookings,
  getActiveConsultations,
  getProfessionalsByCategory,
  searchAll,
  logUserInteraction,
  createBooking,
  getActiveSpecializations,
  getProfessionalTypes
} from './databaseService';

// Define service categories and their mappings
const SERVICE_CATEGORIES = {
  mbbs: ['doctor', 'physician', 'medical', 'health', 'clinic', 'hospital', 'medicine', 'treatment', 'diagnose', 'surgery', 'specialist', 'surgeon'],
  mental: ['therapist', 'counselor', 'psychologist', 'psychiatrist', 'therapy', 'counseling', 'mental health', 'depression', 'anxiety', 'stress', 'trauma'],
  placement: ['job', 'work', 'career', 'employment', 'hiring', 'interview', 'resume', 'cv', 'salary', 'company', 'position'],
  legal: ['lawyer', 'attorney', 'legal', 'law', 'court', 'case', 'rights', 'documentation', 'legal advice'],
  pathology: ['lab', 'test', 'blood test', 'pathology', 'diagnostic', 'xray', 'scan'],
  other: ['service', 'help', 'support', 'assistance']
};

const JOB_TYPES = {
  'full-time': ['full time', 'full-time', 'permanent', 'regular'],
  'part-time': ['part time', 'part-time', 'temporary', 'contract'],
  'remote': ['remote', 'work from home', 'wfh', 'online'],
  'freelance': ['freelance', 'freelancer', 'gig', 'project-based'],
  'internship': ['intern', 'internship', 'trainee', 'apprentice']
};

const WORK_ARRANGEMENTS = {
  'remote': ['remote', 'work from home', 'wfh', 'online', 'virtual'],
  'hybrid': ['hybrid', 'mixed', 'flexible'],
  'onsite': ['onsite', 'office', 'in-person', 'physical']
};

class ChatbotService {
  constructor() {
    this.conversationContext = new Map();
    this.userPreferences = new Map();
  }

  // Analyze user intent from message
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Booking and appointment intents
    if (this.containsAny(lowerMessage, ['book', 'appointment', 'schedule', 'meet', 'consult', 'reserve'])) {
      return { type: 'booking', confidence: 0.9 };
    }

    // Job search intents
    if (this.containsAny(lowerMessage, ['job', 'work', 'career', 'employment', 'hiring', 'position'])) {
      return { type: 'job_search', confidence: 0.8 };
    }

    // Service search intents
    for (const [category, keywords] of Object.entries(SERVICE_CATEGORIES)) {
      if (this.containsAny(lowerMessage, keywords)) {
        return { type: 'service_search', category, confidence: 0.85 };
      }
    }

    // Help and support intents
    if (this.containsAny(lowerMessage, ['help', 'support', 'assist', 'guide', 'how', 'what', 'where'])) {
      return { type: 'help', confidence: 0.7 };
    }

    // Profile and account intents
    if (this.containsAny(lowerMessage, ['profile', 'account', 'settings', 'update', 'change'])) {
      return { type: 'profile', confidence: 0.8 };
    }

    // Status inquiry intents
    if (this.containsAny(lowerMessage, ['status', 'booking', 'appointment', 'consultation', 'my'])) {
      return { type: 'status_inquiry', confidence: 0.7 };
    }

    return { type: 'general', confidence: 0.5 };
  }

  // Extract filters from user message
  extractFilters(message) {
    const lowerMessage = message.toLowerCase();
    const filters = {};

    // Extract location
    const locationMatch = lowerMessage.match(/in\s+([a-zA-Z\s]+)(?:\s|$)/);
    if (locationMatch) {
      filters.location = locationMatch[1].trim();
    }

    // Extract experience level
    if (this.containsAny(lowerMessage, ['fresher', 'entry level', 'beginner'])) {
      filters.experience = 'entry';
    } else if (this.containsAny(lowerMessage, ['experienced', 'senior', 'expert'])) {
      filters.experience = 'senior';
    } else if (this.containsAny(lowerMessage, ['mid level', 'intermediate'])) {
      filters.experience = 'mid';
    }

    // Extract job type
    for (const [type, keywords] of Object.entries(JOB_TYPES)) {
      if (this.containsAny(lowerMessage, keywords)) {
        filters.jobType = type;
        break;
      }
    }

    // Extract work arrangement
    for (const [arrangement, keywords] of Object.entries(WORK_ARRANGEMENTS)) {
      if (this.containsAny(lowerMessage, keywords)) {
        filters.workArrangement = arrangement;
        break;
      }
    }

    // Extract price/salary preferences
    const priceMatch = lowerMessage.match(/under\s+(\d+)|below\s+(\d+)|less\s+than\s+(\d+)/);
    if (priceMatch) {
      const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
      filters.maxPrice = price;
      filters.maxSalary = price * 1000; // Assuming monthly salary
    }

    const minPriceMatch = lowerMessage.match(/above\s+(\d+)|over\s+(\d+)|more\s+than\s+(\d+)/);
    if (minPriceMatch) {
      const price = parseInt(minPriceMatch[1] || minPriceMatch[2] || minPriceMatch[3]);
      filters.minPrice = price;
      filters.minSalary = price * 1000;
    }

    // Extract rating preference
    if (this.containsAny(lowerMessage, ['top rated', 'best', 'highest rated', '5 star'])) {
      filters.minRating = 4.5;
      filters.sortBy = 'rating';
    }

    // Extract verification preference
    if (this.containsAny(lowerMessage, ['verified', 'certified', 'licensed'])) {
      filters.verified = true;
    }

    return filters;
  }

  // Generate intelligent response based on intent and data
  async generateResponse(message, userId = null) {
    try {
      const intent = this.analyzeIntent(message);
      const filters = this.extractFilters(message);

      // Log user interaction
      if (userId) {
        await logUserInteraction(userId, 'chat_message', { message, intent, filters });
      }

      switch (intent.type) {
        case 'service_search':
          return await this.handleServiceSearch(message, intent.category, filters, userId);
        
        case 'job_search':
          return await this.handleJobSearch(message, filters, userId);
        
        case 'booking':
          return await this.handleBookingIntent(message, filters, userId);
        
        case 'status_inquiry':
          return await this.handleStatusInquiry(message, userId);
        
        case 'help':
          return this.handleHelpRequest(message);
        
        case 'profile':
          return this.handleProfileRequest(message, userId);
        
        default:
          return await this.handleGeneralQuery(message, userId);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        type: 'error',
        quickReplies: ['Try again', 'Contact support', 'Main menu']
      };
    }
  }

  // Handle service search queries
  async handleServiceSearch(message, category, filters, userId) {
    try {
      const professionals = await getProfessionalsByCategory(category);
      
      if (professionals.length === 0) {
        return {
          text: `I couldn't find any ${category} professionals at the moment. Would you like me to search for related services or notify you when new professionals join?`,
          type: 'no_results',
          quickReplies: ['Search related services', 'Notify me', 'Browse all categories']
        };
      }

      const professionalsList = professionals.map(prof => {
        // Handle various possible field names
        const name = prof.name || prof.full_name || prof.displayName || 'Professional';
        const rating = prof.rating || prof.average_rating || 0;
        const price = prof.price || prof.consultation_fee || prof.rate || 'Contact for price';
        const specialization = prof.specialization || prof.specialty || prof.category || 'General practice';
        const experience = prof.years_of_experience || prof.experience || prof.experience_years || 0;
        
        return `• **${name}** - ⭐ ${rating > 0 ? rating.toFixed(1) : 'N/A'} (₹${price})\n  ${specialization} - ${experience > 0 ? experience : 'N/A'} years exp.`;
      }).join('\n\n');

      const responseText = `Found ${professionals.length} ${category} professionals. Here are some top-rated options:\n\nClick on any card below to view details or book an appointment.`;

      return {
        text: responseText,
        type: 'professional_list',
        data: professionals,
        quickReplies: ['Refine search', 'Browse other services']
      };
    } catch (error) {
      console.error('Error in service search:', error);
      return {
        text: "I'm having trouble searching for professionals right now. Please try again in a moment.",
        type: 'error',
        quickReplies: ['Try again', 'Browse categories', 'Contact support']
      };
    }
  }

  // Handle job search queries
  async handleJobSearch(message, filters, userId) {
    try {
      const jobs = await searchJobs({ ...filters, limit: 5 });
      
      if (jobs.length === 0) {
        return {
          text: "I couldn't find any jobs matching your criteria at the moment. Would you like me to broaden the search or set up job alerts?",
          type: 'no_results',
          quickReplies: ['Broaden search', 'Set job alerts', 'Browse all jobs', 'Career guidance']
        };
      }

      const jobsList = jobs.map(job => {
        // Handle various possible field names
        const title = job.title || job.job_title || job.position || 'Job Position';
        const company = job.company || job.company_name || job.employer || 'Company';
        const location = job.location || job.city || job.workplace_location || 'Location';
        const salaryMin = job.salaryMin || job.salary_min || job.min_salary || 0;
        const salaryMax = job.salaryMax || job.salary_max || job.max_salary || 0;
        const jobType = job.jobType || job.job_type || job.employment_type || 'full-time'; 
        const experience = job.experience || job.experience_level || job.required_experience || 'entry level';
        
        const salaryText = salaryMin > 0 && salaryMax > 0 
          ? `₹${salaryMin.toLocaleString()}-${salaryMax.toLocaleString()}`
          : salaryMin > 0 
            ? `₹${salaryMin.toLocaleString()}+`
            : salaryMax > 0
              ? `Up to ₹${salaryMax.toLocaleString()}`
              : 'Salary negotiable';
        
        return `• **${title}** at ${company}\n  📍 ${location} | 💰 ${salaryText}\n  ${jobType} - ${experience}`;
      }).join('\n\n');

      const responseText = `Here are some job opportunities I found:\n\n${jobsList}\n\nWould you like to apply to any of these positions?`;

      return {
        text: responseText,
        type: 'job_list',
        data: jobs,
        quickReplies: ['View details', 'Apply now', 'Save jobs', 'Refine search']
      };
    } catch (error) {
      console.error('Error in job search:', error);
      return {
        text: "I'm having trouble searching for jobs right now. Please try again in a moment.",
        type: 'error',
        quickReplies: ['Try again', 'Browse categories', 'Career guidance']
      };
    }
  }

  // Handle booking intents
  async handleBookingIntent(message, filters, userId) {
    if (!userId) {
      return {
        text: "To book an appointment, please log in to your account first.",
        type: 'auth_required',
        quickReplies: ['Login', 'Register', 'Learn more']
      };
    }

    try {
      // Check if user mentioned a specific professional
      const professionals = await searchProfessionals({ ...filters, limit: 10 });
      if (!filters.excludeProfessionals) {
      const professionalsQuery = await searchProfessionals({
        ...filters,
        limit: 10 // Increased default limit from 5 to 10
      });
      results.professionals = professionalsQuery;
    }

    // Search jobs
    if (!filters.excludeJobs) {
      const jobsQuery = await searchJobs({
        ...filters,
        limit: 10 // Increased default limit from 5 to 10
      });
      results.jobs = jobsQuery;
    }
      if (professionals.length === 0) {
        return {
          text: "I'd be happy to help you book an appointment! Let me first show you available professionals. What type of service are you looking for?",
          type: 'booking_start',
          quickReplies: ['Healthcare', 'Mental Health', 'Legal Services', 'Financial Advice']
        };
      }

      const professionalsList = professionals.map(prof => 
        `• **${prof.name}** - ${prof.specialization}\n  Available: ${prof.next_available || 'Contact for availability'}`
      ).join('\n\n');

      return {
        text: `Here are some available professionals:\n\n${professionalsList}\n\nWhich professional would you like to book with?`,
        type: 'booking_selection',
        data: professionals,
        quickReplies: professionals.map(prof => prof.name).slice(0, 3).concat(['View more options'])
      };
    } catch (error) {
      console.error('Error in booking intent:', error);
      return {
        text: "I'm having trouble accessing booking information. Please try again.",
        type: 'error',
        quickReplies: ['Try again', 'Contact support']
      };
    }
  }

  // Handle status inquiries
  async handleStatusInquiry(message, userId) {
    if (!userId) {
      return {
        text: "To check your bookings and consultations, please log in to your account.",
        type: 'auth_required',
        quickReplies: ['Login', 'Register']
      };
    }

    try {
      const [bookings, consultations] = await Promise.all([
        getUserBookings(userId, null),
        getActiveConsultations(userId)
      ]);

      if (bookings.length === 0 && consultations.length === 0) {
        return {
          text: "You don't have any active bookings or consultations at the moment. Would you like to book a service?",
          type: 'no_bookings',
          quickReplies: ['Book service', 'Browse professionals', 'Get help']
        };
      }

      let responseText = '';
      
      if (bookings.length > 0) {
        responseText += `**Your Recent Bookings:**\n`;
        bookings.slice(0, 3).forEach(booking => {
          responseText += `• ${booking.serviceType} - ${booking.status}\n  ${new Date(booking.appointmentDate?.toDate()).toLocaleDateString()}\n\n`;
        });
      }

      if (consultations.length > 0) {
        responseText += `**Active Consultations:**\n`;
        consultations.slice(0, 2).forEach(consultation => {
          responseText += `• ${consultation.type} - ${consultation.status}\n  Scheduled: ${new Date(consultation.scheduled_time?.toDate()).toLocaleDateString()}\n\n`;
        });
      }

      return {
        text: responseText,
        type: 'status_summary',
        data: { bookings, consultations },
        quickReplies: ['View all bookings', 'Book new service', 'Reschedule', 'Cancel booking']
      };
    } catch (error) {
      console.error('Error in status inquiry:', error);
      return {
        text: "I'm having trouble accessing your booking information. Please try again.",
        type: 'error',
        quickReplies: ['Try again', 'Contact support']
      };
    }
  }

  // Handle help requests
  handleHelpRequest(message) {
    const helpTopics = [
      "**How can I help you today?**",
      "",
      "🔍 **Find Services:** Search for healthcare, mental health, legal, and other professionals",
      "💼 **Find Jobs:** Browse employment opportunities and career guidance", 
      "📅 **Book Appointments:** Schedule consultations with verified professionals",
      "👤 **Manage Profile:** Update your account and preferences",
      "📱 **App Features:** Learn about our PWA capabilities and offline features",
      "",
      "Just tell me what you're looking for, and I'll help you find the right solution!"
    ].join('\n');

    return {
      text: helpTopics,
      type: 'help_menu',
      quickReplies: ['Find services', 'Find jobs', 'Book appointment', 'Account help']
    };
  }

  // Handle profile requests
  handleProfileRequest(message, userId) {
    if (!userId) {
      return {
        text: "To manage your profile, please log in to your account first.",
        type: 'auth_required',
        quickReplies: ['Login', 'Register']
      };
    }

    return {
      text: "I can help you with your profile settings. What would you like to do?",
      type: 'profile_menu',
      quickReplies: ['Update information', 'Preferences', 'Privacy settings', 'Account security']
    };
  }

  // Handle general queries
  async handleGeneralQuery(message, userId) {
    // Try to search across all services
    try {
      const searchResults = await searchAll(message, { limit: 20 });
      
      if (searchResults.professionals.length > 0 || searchResults.jobs.length > 0) {
        let responseText = "I found some relevant results for you:\n\n";
        
        if (searchResults.professionals.length > 0) {
          responseText += "**Professionals:**\n";
          searchResults.professionals.slice(0, 2).forEach(prof => {
            responseText += `• ${prof.name} - ${prof.category}\n`;
          });
          responseText += "\n";
        }
        
        if (searchResults.jobs.length > 0) {
          responseText += "**Jobs:**\n";
          searchResults.jobs.slice(0, 2).forEach(job => {
            responseText += `• ${job.title} at ${job.company}\n`;
          });
          responseText += "\n";
        }
        
        responseText += "Would you like to explore any of these options?";
        
        return {
          text: responseText,
          type: 'search_results',
          data: searchResults,
          quickReplies: ['View professionals', 'View jobs', 'Refine search']
        };
      }
    } catch (error) {
      console.error('Error in general search:', error);
    }

    // Fallback response
    const fallbackResponses = [
      "I understand you're looking for assistance. Could you please be more specific about what type of service or help you need?",
      "I'm here to help you find services, jobs, or book appointments. What specifically are you looking for?",
      "Let me help you find what you need. Are you looking for professional services, job opportunities, or something else?"
    ];

    return {
      text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      type: 'clarification_needed',
      quickReplies: ['Find services', 'Find jobs', 'Book appointment', 'Get help']
    };
  }

  // Utility methods
  containsAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Get contextual quick replies based on current conversation
  getContextualQuickReplies(messageType, userData = null) {
    const baseReplies = {
      'professional_list': ['Book appointment', 'View details', 'Compare options', 'Search again'],
      'job_list': ['Apply now', 'Save job', 'View company', 'Search similar'],
      'booking_start': ['Healthcare', 'Mental Health', 'Legal', 'Employment'],
      'no_results': ['Try different search', 'Browse all', 'Get recommendations'],
      'help_menu': ['Find services', 'Find jobs', 'My bookings', 'Contact support'],
      'error': ['Try again', 'Main menu', 'Contact support']
    };

    return baseReplies[messageType] || ['Main menu', 'Help', 'Search'];
  }

  // Save conversation context for better follow-up responses
  saveContext(userId, context) {
    if (userId) {
      this.conversationContext.set(userId, {
        ...context,
        timestamp: Date.now()
      });
    }
  }

  // Get conversation context
  getContext(userId) {
    if (!userId) return null;
    
    const context = this.conversationContext.get(userId);
    if (context && Date.now() - context.timestamp < 300000) { // 5 minutes
      return context;
    }
    
    this.conversationContext.delete(userId);
    return null;
  }
}

export default new ChatbotService();