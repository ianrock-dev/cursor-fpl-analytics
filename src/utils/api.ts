import axios from 'axios';
import { mockManagerData, mockLeagueData, mockTeamData } from './mockData';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: '/api/fpl',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error?.response?.status, error?.message);
    return Promise.reject(error);
  }
);

// Function to fetch manager data by ID
export const fetchManagerById = async (id: number) => {
  try {
    const response = await apiClient.get(`/entry/${id}/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error fetching manager data:', error.message);
    
    // Return a standardized error object
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status || 500,
      data: null
    };
  }
};

// Function to test the connection to the FPL API
export const testFplApiConnection = async () => {
  try {
    const response = await apiClient.get('/test');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status || 500,
      data: null
    };
  }
};

// Get mock data based on the ID provided
export const getMockManagerById = (id: string | number) => {
  if (id === '598864' || id === 598864) {
    // Return custom data for the specific user
    return {
      ...mockManagerData,
      id: 598864,
      name: "User's Team", 
      player_first_name: "FPL",
      player_last_name: "Manager",
      summary_overall_rank: 250000,
      summary_overall_points: 1420,
    };
  }
  
  // Return standard mock data with the given ID
  return {
    ...mockManagerData,
    id: Number(id)
  };
};

// Function to fetch manager history by ID
export const fetchManagerHistoryById = async (id: number) => {
  try {
    // Note: We'll need to create this endpoint in our Next.js API routes
    const response = await apiClient.get(`/entry/${id}/history/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error fetching manager history:', error.message);
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status || 500,
      data: null
    };
  }
};

// Function to fetch team info by ID
export const fetchTeamInfoById = async (id: number) => {
  try {
    // Note: We'll need to create this endpoint in our Next.js API routes
    const response = await apiClient.get(`/my-team/${id}/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error fetching team info:', error.message);
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status || 500,
      data: null
    };
  }
};

// Function to fetch game week picks by manager ID and event ID
export const fetchGameWeekPicks = async (managerId: number, eventId: number) => {
  try {
    // Note: We'll need to create this endpoint in our Next.js API routes
    const response = await apiClient.get(`/entry/${managerId}/event/${eventId}/picks/`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error fetching game week picks:', error.message);
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status || 500,
      data: null
    };
  }
}; 