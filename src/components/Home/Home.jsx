import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from '../Chat/MessageBubble';
import QuickReplies from '../Chat/QuickReplies';
import TypingIndicator from '../Chat/TypingIndicator';
import ServiceSelector from '../Services/ServiceSelector';
import ServiceOptionsCard from '../Services/ServiceOptionsCard';
import WeatherCard from '../Common/WeatherCard';
import NewsCard from '../Common/NewsCard';
import chatbotService from '../../services/chatbotService';
import { getProfessionalTypes } from '../../services/databaseService';

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showServiceOptions, setShowServiceOptions] = useState(true);
  const [showNewsCard, setShowNewsCard] = useState(true);
  const [professionalTypesMap, setProfessionalTypesMap] = useState({});
  const [inputText, setInputText] = useState('');
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize with empty messages - greeting is now in weather card
    setMessages([]);

    // --- START: PROFESSIONAL TYPES MAP LOADING ---
    const loadProfessionalTypes = async () => {
      try {
        const types = await getProfessionalTypes();
        const map = types.reduce((acc, type) => {
          acc[type.id] = type.title || type.label;
          return acc;
        }, {});
        setProfessionalTypesMap(map);
        console.log(' Professional Types Map loaded:', map);
      } catch (error) {
        console.error('Error loading professional types:', error);
      }
    };
    loadProfessionalTypes();
    // --- END: PROFESSIONAL TYPES MAP LOADING ---
  }, [t]); // Depend on 't' for language changes, effectively running once on mount

  const addMessage = (text, sender = 'user', quickReplies = null, data = null) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
      quickReplies,
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add user message
    addMessage(userMessage);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Process user message and generate intelligent bot response
      const botResponse = await generateBotResponse(userMessage);
      setIsTyping(false);

      // Add bot response with any additional data
      addMessage(botResponse.text, 'bot', botResponse.quickReplies, botResponse.data);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setIsTyping(false);

      // Add error fallback message
      addMessage(
        "I'm sorry, I encountered an issue. Please try asking again or contact support if the problem persists.",
        'bot',
        [
          { text: 'Try again', action: 'try_again' },
          { text: 'Main menu', action: 'main_menu' },
          { text: 'Contact support', action: 'contact_support' }
        ]
      );
    }
  };

  const generateBotResponse = async (userInput) => {
    try {
      // Use the intelligent chatbot service
      const response = await chatbotService.generateResponse(userInput, currentUser?.uid);

      // Convert the intelligent response format to our UI format
      return {
        text: response.text,
        quickReplies: response.quickReplies?.map(reply => ({
          text: reply,
          action: reply.toLowerCase().replace(/\s+/g, '_')
        })) || [],
        data: response.data // For any additional data like professional/job lists
      };
    } catch (error) {
      console.error('Error generating bot response:', error);

      // Fallback to simple responses if the intelligent service fails
      return {
        text: "I apologize, but I'm having trouble processing your request right now. How can I help you today?",
        quickReplies: [
          { text: t('jobSearch'), action: 'job_search' },
          { text: t('generalDoctor'), action: 'general_doctor' },
          { text: t('mentalHealthCounselor'), action: 'mental_health' },
          { text: 'Show all services', action: 'other_services' }
        ]
      };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDataAction = async (action, data) => {
    setIsTyping(true);

    try {
      switch (action) {
        case 'book':
          addMessage(`I'd like to book an appointment with ${data.name}`);
          const bookingResponse = await generateBotResponse(`Book appointment with ${data.name}`);
          setIsTyping(false);
          addMessage(bookingResponse.text, 'bot', bookingResponse.quickReplies, bookingResponse.data);
          break;

        case 'apply':
          addMessage(`I'd like to apply for ${data.title} at ${data.company}`);
          const applyResponse = await generateBotResponse(`Apply for ${data.title} position`);
          setIsTyping(false);
          addMessage(applyResponse.text, 'bot', applyResponse.quickReplies, applyResponse.data);
          break;

        case 'view_details':
          addMessage(`Show me more details about ${data.name || data.jobTitle || data.title}`);
          setIsTyping(false);
          // Create a detailed view message with just this single item
          const detailsText = data.jobTitle ?
            `Here are the complete details for the ${data.jobTitle} position:` :
            `Here are the complete details for ${data.name}:`;
          addMessage(detailsText, 'bot', [], [data]); // Pass single item in array
          break;

        default:
          setIsTyping(false);
          addMessage("I can help you with that. What would you like to know?", 'bot');
      }
    } catch (error) {
      console.error('Error handling data action:', error);
      setIsTyping(false);
      addMessage("I apologize, but I'm having trouble processing that request. Please try again.", 'bot');
    }
  };

  const handleServiceOptionSelect = (option) => {
    // Hide service options and news card after selection
    setShowServiceOptions(false);
    setShowNewsCard(false);
    addMessage(option.text, 'user');

    // Add user message first
    setTimeout(() => {
      handleServiceSelection(option.action);
    }, 500);
  };

  const handleQuickReply = async (reply) => {
    // Add user's selection as a message
    addMessage(reply.text);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Use the intelligent chatbot service for quick replies too
      const botResponse = await generateBotResponse(reply.text);
      setIsTyping(false);

      addMessage(botResponse.text, 'bot', botResponse.quickReplies, botResponse.data);
    } catch (error) {
      console.error('Error in handleQuickReply:', error);
      setIsTyping(false);

      // Fallback for specific actions that need custom handling
      switch (reply.action) {
        case 'other_services':
          setShowServiceSelector(true);
          break;
        case 'job_search':
          handleJobSearch();
          break;
        case 'general_doctor':
          handleDoctorSearch();
          break;
        case 'mental_health':
          handleMentalHealthSearch();
          break;
        case 'book_sharma':
        case 'book_patel':
        case 'book_singh':
        case 'book_mehta':
        case 'book_kumar':
          handleBookingSelection(reply);
          break;
        case 'book_slot_10':
        case 'book_slot_14':
        case 'book_slot_16':
          handleSlotConfirmation(reply);
          break;
        case 'apply_job_1':
          handleJobApplication();
          break;
        case 'filter_location':
          handleLocationFilter();
          break;
        case 'more_doctors':
          handleDoctorSearch();
          break;
        case 'back_to_services':
          handleBackToServices();
          break;
        case 'order_medplus':
        case 'visit_community':
          handlePharmacySelection(reply);
          break;
        case 'blood_tests':
        case 'health_package':
        case 'hormone_tests':
          handleTestSelection(reply);
          break;
        default:
          addMessage("I'll help you find the right service. Let me search for options...", 'bot');
      }
    }
  };

  const handleSlotConfirmation = async (reply) => {
    const timeSlot = reply.text;
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    addMessage(
      `✅ **Appointment Confirmed!**\n\n` +
      `📅 Date: Tomorrow (14 October 2025)\n` +
      `🕒 Time: ${timeSlot}\n` +
      `👨‍⚕️ Doctor: Dr. Sharma\n` +
      `📍 Location: Health Clinic, Vadodara\n` +
      `💰 Fee: ₹500\n\n` +
      `📱 You'll receive SMS and app notifications.\n` +
      `📋 Please bring your ID and any previous reports.\n\n` +
      `Is there anything else I can help you with?`,
      'bot',
      [
        { text: 'Add to calendar', action: 'add_calendar' },
        { text: 'Get directions', action: 'get_directions' },
        { text: 'Find another service', action: 'back_to_services' },
        { text: 'That\'s all, thanks!', action: 'end_conversation' }
      ]
    );
  };

  const handleJobApplication = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    addMessage(
      `🎉 **Application Started!**\n\n` +
      `I'm redirecting you to the job application portal...\n\n` +
      `📋 **What's needed:**\n` +
      `• Updated resume\n` +
      `• Portfolio (if applicable)\n` +
      `• Cover letter\n\n` +
      `💡 **Tip:** Mention your community involvement and unique perspective!\n\n` +
      `Would you like help with anything else?`,
      'bot',
      [
        { text: 'Help with resume', action: 'resume_help' },
        { text: 'Find more jobs', action: 'more_jobs' },
        { text: 'Career counseling', action: 'career_counseling' },
        // { text: 'Back to services', action: 'back_to_services' }
      ]
    );
  };

  const handleLocationFilter = () => {
    addMessage(
      `📍 **Choose your preferred location:**`,
      'bot',
      [
        { text: 'Remote only', action: 'location_remote' },
        { text: 'Ahmedabad', action: 'location_ahmedabad' },
        { text: 'Vadodara', action: 'location_vadodara' },
        { text: 'Surat', action: 'location_surat' },
        { text: 'Any location', action: 'location_any' }
      ]
    );
  };

  const handleBackToServices = () => {
    // Reset to initial homepage state
    setMessages([]);
    setShowServiceOptions(true);
    setShowNewsCard(true);
    setIsTyping(false);

    // Scroll to top to show the service options
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePharmacySelection = async (reply) => {
    const pharmacy = reply.action === 'order_medplus' ? 'MedPlus' : 'Community Pharmacy';
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    addMessage(
      `🎯 **${pharmacy} Selected**\n\n` +
      `What would you like to do?`,
      'bot',
      [
        { text: 'Order medicines', action: 'order_medicines' },
        { text: 'Upload prescription', action: 'upload_prescription' },
        { text: 'Check medicine prices', action: 'check_prices' },
        { text: 'Get directions', action: 'pharmacy_directions' }
      ]
    );
  };

  const handleTestSelection = async (reply) => {
    const testType = reply.text.toLowerCase();
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    addMessage(
      `🔬 **${reply.text} Information**\n\n` +
      `📋 Available packages and pricing:\n` +
      `• Basic ${testType}: ₹800-1200\n` +
      `• Comprehensive ${testType}: ₹1500-2500\n` +
      `• Premium ${testType}: ₹2500-4000\n\n` +
      `🏠 Home collection available\n` +
      `📱 Reports via WhatsApp\n\n` +
      `Would you like to book a test?`,
      'bot',
      [
        { text: 'Book basic package', action: 'book_basic_test' },
        { text: 'Book comprehensive', action: 'book_comprehensive_test' },
        { text: 'Schedule home collection', action: 'schedule_collection' },
        { text: 'Compare labs', action: 'compare_labs' }
      ]
    );
  };

  const handleJobSearch = async () => {
    addMessage(
      "Great! I'll help you find job opportunities. Let me search for available positions...",
      'bot'
    );

    setIsTyping(true);

    try {
      // Fetch all active jobs from database
      const { searchJobs } = await import('../../services/databaseService');
      const jobs = await searchJobs({ limit: 50 });

      console.log('Fetched jobs:', jobs);

      setIsTyping(false);

      if (jobs.length === 0) {
        addMessage(
          "I couldn't find any active job postings at the moment. Please try again later or contact support.",
          'bot',
          [
            { text: 'Try again', action: 'job_search' },
            // { text: '← Back to Services', action: 'back_to_services' }
          ]
        );
      } else {
        addMessage(
          `Found ${jobs.length} job opportunities. Click on any card below to view details or apply.`,
          'bot',
          [
            // { text: '← Back to Services', action: 'back_to_services' }
          ],
          jobs // Pass jobs as data
        );
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.message, error.stack);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching jobs right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'job_search' },
          // { text: '← Back to Services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleExperienceSelection = async (reply) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    const experienceLevel = reply.action.replace('experience_', '');
    const jobListings = getJobListingsByExperience(experienceLevel);

    addMessage(
      `Perfect! Here are job opportunities for ${reply.text.toLowerCase()} level:\n\n${jobListings}`,
      'bot',
      [
        { text: 'Apply to first job', action: 'apply_job_1' },
        { text: 'See more details', action: 'job_details' },
        { text: 'Filter by location', action: 'filter_location' },
        // { text: 'Back to services', action: 'back_to_services' }
      ]
    );
  };

  const getJobListingsByExperience = (level) => {
    const jobListings = {
      fresher: `💼 **Software Developer Trainee**
🏢 TechStart India
💰 ₹2.5-4 LPA
📍 Remote/Ahmedabad
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: Basic programming, willingness to learn

💼 **Content Writer**
🏢 Digital Marketing Agency
💰 ₹2-3.5 LPA  
📍 Vadodara
✨ Women-led Organization
📝 Requirements: Good English, creative writing

💼 **Customer Support Executive**
🏢 E-commerce Startup
💰 ₹2-3 LPA
📍 Work from home
✨ Diversity-focused company
📝 Requirements: Communication skills, Hindi/Gujarati`,

      junior: `💼 **Frontend Developer**
🏢 WebTech Solutions
💰 ₹4-6 LPA
📍 Remote/Surat
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: React, 1-3 years experience

💼 **Digital Marketing Specialist**
🏢 Creative Agency
💰 ₹3.5-5.5 LPA
📍 Ahmedabad
✨ Equal opportunity employer
📝 Requirements: SEO, Social media, 2+ years exp

💼 **HR Associate**
🏢 Consulting Firm
💰 ₹3-5 LPA
📍 Vadodara
✨ Diversity champion
📝 Requirements: HR degree, 1-2 years experience`,

      mid: `💼 **Senior Developer**
🏢 InnovateTech
💰 ₹8-12 LPA
📍 Remote/Pune
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: Full-stack, 3-7 years experience

💼 **Project Manager**
🏢 Global Solutions
💰 ₹7-11 LPA
📍 Ahmedabad
✨ Progressive workplace
📝 Requirements: PMP, 5+ years experience

💼 **UX Designer**
🏢 Design Studio
💰 ₹6-9 LPA
📍 Remote
✨ Creative inclusive environment
📝 Requirements: UI/UX portfolio, 4+ years exp`,

      senior: `💼 **Technical Lead**
🏢 Enterprise Corp
💰 ₹15-25 LPA
📍 Mumbai/Remote
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: Team leadership, 7+ years experience

💼 **Senior Consultant**
🏢 Strategy Consulting
💰 ₹12-20 LPA
📍 Ahmedabad
✨ Diversity & inclusion leader
📝 Requirements: MBA, 8+ years experience

💼 **Head of Marketing**
🏢 HealthTech Startup
💰 ₹18-30 LPA
📍 Vadodara/Hybrid
✨ Women leadership encouraged
📝 Requirements: Marketing strategy, 10+ years exp`
    };

    return jobListings[level] || "No jobs found for this experience level.";
  };

  const handleDoctorSearch = async () => {
    addMessage(
      "I'm searching for doctors in your area...",
      'bot'
    );

    setIsTyping(true);

    try {
      // Use 'mbbs' as the category label for doctors/surgeons
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const doctors = await getProfessionalsByCategory('mbbs', 100);

      console.log('Fetched doctors:', doctors);

      setIsTyping(false);

      if (doctors.length === 0) {
        addMessage(
          "I couldn't find any doctors at the moment. This might be a database issue. Please contact support.",
          'bot',
          [
            { text: 'Try again', action: 'general_doctor' },
            // { text: 'Back to services', action: 'back_to_services' }
          ]
        );
      } else {
        // ATTACH TITLE: professional_type_id ko title se map karein
        const doctorsWithTitles = doctors.map(doc => ({
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id] || 'Healthcare Professional'
        }));
        console.log('Doctors with titles:', doctorsWithTitles);
        addMessage(
          `Found ${doctorsWithTitles.length} healthcare professionals. Click on any card below to view details or book an appointment.`,
          'bot',
          [
            // { text: '← Back to Services', action: 'back_to_services' }
          ],
          doctorsWithTitles // Pass mapped data
        );
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.message, error.stack);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching doctors right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'general_doctor' },
          // { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleMentalHealthSearch = async () => {
    addMessage(
      "I understand you're looking for mental health support. Let me find qualified counselors...",
      'bot'
    );

    setIsTyping(true);

    try {
      // Use 'mental' as the category label for mental health professionals
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const counselors = await getProfessionalsByCategory('mental', 100);

      console.log('Fetched mental health professionals:', counselors);

      setIsTyping(false);

      if (counselors.length === 0) {
        addMessage(
          "I couldn't find any mental health professionals at the moment. Please try again later or contact support.",
          'bot',
          [
            { text: 'Try again', action: 'mental_health' },
            // { text: 'Back to services', action: 'back_to_services' }
          ]
        );
      } else {
        // ATTACH TITLE: professional_type_id ko title se map karein
        const counselorsWithTitles = counselors.map(doc => ({
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id] || 'Mental Health Professional'
        }));

        addMessage(
          `Found ${counselorsWithTitles.length} mental health professionals. Click on any card below to view details or book an appointment.`,
          'bot',
          [
            // { text: '← Back to Services', action: 'back_to_services' }
          ],
          counselorsWithTitles // Pass mapped data
        );
      }
    } catch (error) {
      console.error('Error fetching mental health professionals:', error);
      console.error('Error details:', error.message, error.stack);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching mental health professionals: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'mental_health' },
          // { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleBookingSelection = async (reply) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    const doctorName = reply.action.replace('book_', '').replace('_', ' ');
    addMessage(
      `Great choice! I'm checking available slots for Dr. ${doctorName}...\n\n` +
      `📅 **Available Slots Tomorrow (14 Oct):**\n` +
      `• 10:00 AM - Available\n` +
      `• 2:00 PM - Available\n` +
      `• 4:30 PM - Available\n\n` +
      `Which time works best for you?`,
      'bot',
      [
        { text: '10:00 AM', action: 'book_slot_10' },
        { text: '2:00 PM', action: 'book_slot_14' },
        { text: '4:30 PM', action: 'book_slot_16' },
        { text: 'See other days', action: 'other_days' }
      ]
    );
  };

  const handleServiceSelection = async (service) => {
    setShowServiceSelector(false);
    setShowServiceOptions(false);

    // Handle both object and string inputs
    const serviceName = typeof service === 'string' ? service : service.name || service.text;
    const serviceId = typeof service === 'string' ? service : service.id || service.action;

    if (serviceName) {
      addMessage(serviceName);
    }

    // Process the selected service
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    // Route to appropriate handler based on service type
    switch (serviceId) {
      case 'job_search':
        handleJobSearch();
        break;
      case 'general_doctor':
        handleDoctorSearch();
        break;
      case 'mental_health':
        handleMentalHealthSearch();
        break;
      case 'pharmacy':
        handlePharmacySearch();
        break;
      case 'pathology_lab':
        handlePathologySearch();
        break;
      default:
        addMessage(
          `I'm searching for ${service.name} providers in your area...\n\n` +
          `Found 3 providers near you. Would you like to see the list?`,
          'bot',
          [
            { text: 'Yes, show providers', action: 'show_providers' },
            { text: 'Filter by distance', action: 'filter_distance' },
            // { text: 'Back to services', action: 'back_to_services' }
          ]
        );
    }
  };

  const handlePharmacySearch = () => {
    addMessage(
      `🏥 **Nearby Pharmacies with Discounts:**\n\n` +
      `💊 **MedPlus Pharmacy**\n` +
      `📍 2.5 km away\n` +
      `💰 20% off on all medicines\n` +
      `🚚 Free home delivery\n` +
      `⭐ 4.8 rating\n\n` +
      `💊 **Apollo Pharmacy**\n` +
      `📍 1.8 km away\n` +
      `💰 15% off + cashback\n` +
      `🚚 Same day delivery\n` +
      `⭐ 4.6 rating\n\n` +
      `💊 **Local Community Pharmacy**\n` +
      `📍 0.8 km away\n` +
      `💰 25% off for community members\n` +
      `🏳️‍🌈 LGBTQAI+ friendly\n` +
      `⭐ 4.9 rating`,
      'bot',
      [
        { text: 'Order from MedPlus', action: 'order_medplus' },
        { text: 'Visit Community Pharmacy', action: 'visit_community' },
        { text: 'Compare prices', action: 'compare_prices' },
        { text: 'Need prescription help?', action: 'prescription_help' }
      ]
    );
  };

  const handlePathologySearch = () => {
    addMessage(
      `🔬 **Pathology Labs Near You:**\n\n` +
      `🏥 **DiagnosticPlus Lab**\n` +
      `📍 3.2 km away\n` +
      `💰 30% off on packages\n` +
      `🏠 Home collection available\n` +
      `⭐ 4.7 rating\n\n` +
      `🏥 **HealthCheck Labs**\n` +
      `📍 2.1 km away\n` +
      `💰 LGBTQAI+ friendly pricing\n` +
      `🚀 Reports in 24 hours\n` +
      `⭐ 4.8 rating\n\n` +
      `Which tests do you need?`,
      'bot',
      [
        { text: 'Blood tests', action: 'blood_tests' },
        { text: 'Health checkup package', action: 'health_package' },
        { text: 'Hormone tests', action: 'hormone_tests' },
        { text: 'Book home collection', action: 'home_collection' }
      ]
    );
  };

  // ... (rest of the file content like handleJobSearch, handleSlotConfirmation, etc.)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Weather Card - Show at the top */}
        <div className="mb-4">
          <WeatherCard />
        </div>

        {/* News Card - Show community updates only when no service selected */}
        {showNewsCard && messages.length === 0 && (
          <div className="mb-4">
            <NewsCard />
          </div>
        )}

        {/* Service Options Chips - Show when no conversation started */}
        {showServiceOptions && messages.length === 0 && (
          <div className="message-slide-in">
            <ServiceOptionsCard onOptionSelect={handleServiceOptionSelect} />
          </div>
        )}

        {/* Messages with reduced spacing when following weather card */}
        <div className={messages.length > 0 ? 'space-y-4' : ''}>
          {messages.map((message) => (
            <div key={message.id} className="message-slide-in">
              <MessageBubble message={message} onDataAction={handleDataAction} />
              {message.quickReplies && (
                <QuickReplies
                  replies={message.quickReplies}
                  onReplyClick={handleQuickReply}
                />
              )}
            </div>
          ))}
        </div>

        {isTyping && (
          <div className="mt-4">
            <TypingIndicator />
          </div>
        )}
        {messages.length > 0 && (
          <div className="mt-6 mb-4 flex ">
            <button
              onClick={handleBackToServices}
              className="flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-700 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-sm font-medium"
            >
              ← Back to Services
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="fixed bottom-20 left-0 right-0 max-w-mobile mx-auto bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeMessage') || 'Type a message...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Service Selector Modal */}
      <ServiceSelector
        isOpen={showServiceSelector}
        onClose={() => setShowServiceSelector(false)}
        onServiceSelect={handleServiceSelection}
      />
    </div>
  );
};

export default Home;