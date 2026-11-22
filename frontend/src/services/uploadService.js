import API from './api';

export const uploadService = {
  // Admin: Upload property image file
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
