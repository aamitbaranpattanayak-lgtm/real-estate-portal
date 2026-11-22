import API from './api';

export const inquiryService = {
  // Public or user submission of property inquiry
  createInquiry: async (inquiryData) => {
    const response = await API.post('/inquiries', inquiryData);
    return response.data;
  },

  // Admin: Get all inquiries
  getInquiries: async () => {
    const response = await API.get('/inquiries');
    return response.data;
  },

  // Admin: Update status
  updateStatus: async (id, status) => {
    const response = await API.put(`/inquiries/${id}`, { status });
    return response.data;
  },

  // Admin: Delete inquiry
  deleteInquiry: async (id) => {
    const response = await API.delete(`/inquiries/${id}`);
    return response.data;
  },
};
