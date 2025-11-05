import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  startAfter,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';
const PROFESSIONAL_TYPES_COLLECTION = 'professional_types';

const CATEGORY_TO_TYPE_ID_MAP = {
  'mbbs': '3',
  'mental': '1',
  'legal': '2',
  'placement': '4',
  'pathology': '5',
  'pharmacy': '6',
};

// ===== PROFESSIONAL SERVICES =====

export const searchProfessionals = async (filters = {}) => {
  try {
    let q = collection(db, PROFESSIONALS_COLLECTION);
    const constraints = [];

    // Apply filters based on search criteria
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters.verified !== undefined) {
      constraints.push(where('verification_status', '==', filters.verified ? 'verified' : 'pending'));
    }

    if (filters.minRating) {
      constraints.push(where('rating', '>=', filters.minRating));
    }

    if (filters.maxPrice) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }

    if (filters.minExperience) {
      constraints.push(where('years_of_experience', '>=', filters.minExperience));
    }

    // Default sorting by rating (highest first)
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          constraints.push(orderBy('rating', 'desc'));
          break;
        case 'price_low':
          constraints.push(orderBy('price', 'asc'));
          break;
        case 'price_high':
          constraints.push(orderBy('price', 'desc'));
          break;
        case 'experience':
          constraints.push(orderBy('years_of_experience', 'desc'));
          break;
        case 'newest':
          constraints.push(orderBy('createdAt', 'desc'));
          break;
        default:
          constraints.push(orderBy('rating', 'desc'));
      }
    } else {
      constraints.push(orderBy('rating', 'desc'));
    }

    // Limit results   
    if (filters.limit && filters.limit > 0) {
      constraints.push(limit(filters.limit));
    } else {

    }

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching professionals:', error);
    throw error;
  }
};

export const getProfessionalById = async (professionalId) => {
  try {
    const docRef = doc(db, 'professionals', professionalId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting professional:', error);
    throw error;
  }
};

export const getProfessionalsByCategory = async (category) => {
  try {
    console.log(`Fetching professionals for category: ${category}`);
    let professionalTypeId = CATEGORY_TO_TYPE_ID_MAP[category.toLowerCase()];

    if (!professionalTypeId) {

      const typeLookupQuery = query(
        collection(db, PROFESSIONAL_TYPES_COLLECTION),
        where('name', '==', category.toLowerCase())
      );

      const typeSnapshot = await getDocs(typeLookupQuery);

      if (typeSnapshot.empty) {

        console.warn(`Category "${category}" not found in professional types (dynamic and map lookup failed). Returning all professionals.`);
        const allProfessionalsSnapshot = await getDocs(query(collection(db, PROFESSIONALS_COLLECTION)));
        return allProfessionalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      professionalTypeId = typeSnapshot.docs[0].data().type_id;
    }
    const stringId = String(professionalTypeId);
    const numberId = parseInt(professionalTypeId, 10);

    const professionalsQuery = query(
      collection(db, PROFESSIONALS_COLLECTION),
      where('professional_type_id', 'in', [stringId, numberId]),
      // orderBy('rating', 'desc'),      
      // limit(limitCount)
    );

    const snapshot = await getDocs(professionalsQuery);

    const professionals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${professionals.length} professionals with type_id: ${professionalTypeId} for category: ${category}`);
    if (professionals.length > 0) {
      console.log('Sample professional:', professionals[0]);
    }

    return professionals;
  } catch (error) {
    console.error('Error getting professionals by category:', error);
    throw error;
  }
};

// Get all healthcare professionals (doctors)
export const getAllDoctors = async () => {
  try {
    console.log('Fetching all doctors...');
    const professionalTypeId = '3';
    // Query by professional_type_id = "3" (MBBS/Surgeons)
    const q = query(
      collection(db, PROFESSIONALS_COLLECTION),
      where('professional_type_id', '==', professionalTypeId),
      // limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${doctors.length} doctors`);
    return doctors;
  } catch (error) {
    console.error('Error getting all doctors:', error);
    throw error;
  }
};

// ===== JOB PLACEMENT SERVICES =====

export const searchJobs = async (filters = {}) => {
  try {
    let q = collection(db, 'placements');
    const constraints = [where('isActive', '==', true)];

    if (filters.jobType) {
      constraints.push(where('jobType', '==', filters.jobType));
    }

    if (filters.location) {
      constraints.push(where('location', '==', filters.location));
    }

    if (filters.experience) {
      constraints.push(where('experience', '==', filters.experience));
    }

    if (filters.minSalary) {
      constraints.push(where('salaryMin', '>=', filters.minSalary));
    }

    if (filters.maxSalary) {
      constraints.push(where('salaryMax', '<=', filters.maxSalary));
    }

    if (filters.company) {
      constraints.push(where('company', '==', filters.company));
    }

    if (filters.workArrangement) {
      constraints.push(where('workArrangement', 'array-contains', filters.workArrangement));
    }

    // Default sorting by creation date (newest first)
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'salary_high':
          constraints.push(orderBy('salaryMax', 'desc'));
          break;
        case 'salary_low':
          constraints.push(orderBy('salaryMin', 'asc'));
          break;
        case 'newest':
          constraints.push(orderBy('createdAt', 'desc'));
          break;
        default:
          constraints.push(orderBy('createdAt', 'desc'));
      }
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    constraints.push(limit(filters.limit || 10));

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

export const getJobById = async (jobId) => {
  try {
    const docRef = doc(db, 'placements', jobId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting job:', error);
    throw error;
  }
};

// ===== BOOKING SERVICES =====

export const createBooking = async (bookingData) => {
  try {
    const booking = {
      ...bookingData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'bookings'), booking);
    return { id: docRef.id, ...booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId, status = null) => {
  try {
    let q = collection(db, 'bookings');
    const constraints = [where('clientId', '==', userId)];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    constraints.push(orderBy('appointmentDate', 'desc'));
    constraints.push(limit(20));

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// ===== CONSULTATION SERVICES =====

export const getActiveConsultations = async (userId) => {
  try {
    const q = query(
      collection(db, 'consultations'),
      where('client_id', '==', userId),
      where('status', 'in', ['scheduled', 'ongoing']),
      orderBy('scheduled_time', 'asc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting active consultations:', error);
    throw error;
  }
};

// ===== USER SERVICES =====

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ===== AVAILABILITY SERVICES =====

export const getProfessionalAvailability = async (professionalId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'availabilitySlots'),
      where('professional_id', '==', professionalId),
      where('start_date', '>=', startDate),
      where('start_date', '<=', endDate),
      orderBy('start_date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting professional availability:', error);
    throw error;
  }
};

// ===== SPECIALIZATION SERVICES =====

export const getActiveSpecializations = async () => {
  try {
    const q = query(
      collection(db, 'specializations'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting specializations:', error);
    throw error;
  }
};

// ===== PROFESSIONAL TYPES SERVICES =====

export const getProfessionalTypes = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'professional_types'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting professional types:', error);
    throw error;
  }
};

// ===== SEARCH HELPERS =====

export const searchAll = async (searchTerm, filters = {}) => {
  try {
    const results = {
      professionals: [],
      jobs: [],
      specializations: []
    };

    // Search professionals
    if (!filters.excludeProfessionals) {
      const professionalsQuery = await searchProfessionals({
        ...filters,
        limit: 5
      });
      results.professionals = professionalsQuery;
    }

    // Search jobs
    if (!filters.excludeJobs) {
      const jobsQuery = await searchJobs({
        ...filters,
        limit: 5
      });
      results.jobs = jobsQuery;
    }

    // Search specializations
    if (!filters.excludeSpecializations) {
      const specializationsQuery = await getActiveSpecializations();
      results.specializations = specializationsQuery.filter(spec =>
        spec.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
    }

    return results;
  } catch (error) {
    console.error('Error in search all:', error);
    throw error;
  }
};

// ===== ANALYTICS SERVICES =====

export const logUserInteraction = async (userId, action, data = {}) => {
  try {
    await addDoc(collection(db, 'views'), {
      userId,
      action,
      data,
      timestamp: Timestamp.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  } catch (error) {
    console.error('Error logging user interaction:', error);
  }
};

// ===== NOTIFICATION SERVICES =====

export const createNotification = async (userId, notification) => {
  try {
    const notificationData = {
      userId,
      ...notification,
      read: false,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, limit = 10) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// ===== REAL-TIME LISTENERS =====

export const subscribeToBookingUpdates = (userId, callback) => {
  const q = query(
    collection(db, 'bookings'),
    where('clientId', '==', userId),
    orderBy('appointmentDate', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  });
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  });
};