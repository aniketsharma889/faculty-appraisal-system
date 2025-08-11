import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/profile/${userId}`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Appraisal API functions
export const submitAppraisal = async (appraisalData) => {
  try {
    const formData = new FormData();
    
    // Add all non-file fields
    Object.keys(appraisalData).forEach(key => {
      if (key !== 'uploadedFiles') {
        if (typeof appraisalData[key] === 'object' && appraisalData[key] !== null) {
          formData.append(key, JSON.stringify(appraisalData[key]));
        } else {
          formData.append(key, appraisalData[key] || '');
        }
      }
    });

    // Add files
    if (appraisalData.uploadedFiles) {
      appraisalData.uploadedFiles.forEach((fileObj, index) => {
        if (fileObj.file) {
          formData.append('files', fileObj.file);
        }
      });
    }

    const response = await api.post('/appraisal-form/submit-appraisal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Appraisal submission failed' };
  }
};

export const getMyAppraisals = async () => {
  try {
    const response = await api.get('/appraisal-form/my-appraisals');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch appraisals' };
  }
};

export const getAppraisalById = async (id) => {
  try {
    console.log('Fetching appraisal with ID:', id); // Debug log
    const response = await api.get(`/appraisal-form/appraisal/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error); // Debug log
    throw error.response?.data || { message: 'Failed to fetch appraisal' };
  }
};

export const updateAppraisal = async (id, appraisalData) => {
  try {
    const formData = new FormData();
    
    // Add all non-file fields
    Object.keys(appraisalData).forEach(key => {
      if (key !== 'uploadedFiles') {
        if (typeof appraisalData[key] === 'object' && appraisalData[key] !== null) {
          formData.append(key, JSON.stringify(appraisalData[key]));
        } else {
          formData.append(key, appraisalData[key] || '');
        }
      }
    });

    // Handle existing and new files
    const existingFiles = appraisalData.uploadedFiles?.filter(f => !f.file) || [];
    formData.append('uploadedFiles', JSON.stringify(existingFiles));

    // Add new files
    if (appraisalData.uploadedFiles) {
      appraisalData.uploadedFiles.forEach((fileObj) => {
        if (fileObj.file) {
          formData.append('files', fileObj.file);
        }
      });
    }

    const response = await api.put(`/appraisal-form/update-appraisal/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update appraisal' };
  }
};

export const getAppraisalStats = async () => {
  const response = await api.get('/appraisals/my-stats');
  return response.data;
};

// HOD API functions
export const getHODAppraisals = async () => {
  try {
    const response = await api.get('/hod/appraisals');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch HOD appraisals' };
  }
};

export const getHODAppraisalById = async (id) => {
  try {
    const response = await api.get(`/hod/appraisals/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch appraisal details' };
  }
};

export default api;
