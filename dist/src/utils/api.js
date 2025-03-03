"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGameWeekPicks = exports.fetchTeamInfoById = exports.fetchManagerHistoryById = exports.getMockManagerById = exports.testFplApiConnection = exports.fetchManagerById = void 0;
const axios_1 = __importDefault(require("axios"));
const mockData_1 = require("./mockData");
// Create an axios instance with default config
const apiClient = axios_1.default.create({
    baseURL: '/api/fpl',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Add response interceptor for better error handling
apiClient.interceptors.response.use(response => response, error => {
    var _a;
    console.error('API Error:', (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status, error === null || error === void 0 ? void 0 : error.message);
    return Promise.reject(error);
});
// Function to fetch manager data by ID
const fetchManagerById = async (id) => {
    var _a;
    try {
        const response = await apiClient.get(`/entry/${id}/`);
        return { success: true, data: response.data };
    }
    catch (error) {
        console.error('Error fetching manager data:', error.message);
        // Return a standardized error object
        return {
            success: false,
            error: error.message,
            status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500,
            data: null
        };
    }
};
exports.fetchManagerById = fetchManagerById;
// Function to test the connection to the FPL API
const testFplApiConnection = async () => {
    var _a;
    try {
        const response = await apiClient.get('/test');
        return { success: true, data: response.data };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500,
            data: null
        };
    }
};
exports.testFplApiConnection = testFplApiConnection;
// Get mock data based on the ID provided
const getMockManagerById = (id) => {
    if (id === '598864' || id === 598864) {
        // Return custom data for the specific user
        return {
            ...mockData_1.mockManagerData,
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
        ...mockData_1.mockManagerData,
        id: Number(id)
    };
};
exports.getMockManagerById = getMockManagerById;
// Function to fetch manager history by ID
const fetchManagerHistoryById = async (id) => {
    var _a;
    try {
        // Note: We'll need to create this endpoint in our Next.js API routes
        const response = await apiClient.get(`/entry/${id}/history/`);
        return { success: true, data: response.data };
    }
    catch (error) {
        console.error('Error fetching manager history:', error.message);
        return {
            success: false,
            error: error.message,
            status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500,
            data: null
        };
    }
};
exports.fetchManagerHistoryById = fetchManagerHistoryById;
// Function to fetch team info by ID
const fetchTeamInfoById = async (id) => {
    var _a;
    try {
        // Note: We'll need to create this endpoint in our Next.js API routes
        const response = await apiClient.get(`/my-team/${id}/`);
        return { success: true, data: response.data };
    }
    catch (error) {
        console.error('Error fetching team info:', error.message);
        return {
            success: false,
            error: error.message,
            status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500,
            data: null
        };
    }
};
exports.fetchTeamInfoById = fetchTeamInfoById;
// Function to fetch game week picks by manager ID and event ID
const fetchGameWeekPicks = async (managerId, eventId) => {
    var _a;
    try {
        // Note: We'll need to create this endpoint in our Next.js API routes
        const response = await apiClient.get(`/entry/${managerId}/event/${eventId}/picks/`);
        return { success: true, data: response.data };
    }
    catch (error) {
        console.error('Error fetching game week picks:', error.message);
        return {
            success: false,
            error: error.message,
            status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500,
            data: null
        };
    }
};
exports.fetchGameWeekPicks = fetchGameWeekPicks;
