import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { inquiryService } from '../../services/inquiryService';
import { uploadService } from '../../services/uploadService';
import { formatPrice } from '../../utils/formatters';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Sparkles, 
  TrendingUp, 
  X, 
  AlertTriangle,
  Check,
  MessageSquare,
  Upload,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'inquiries'

  // Property states
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Inquiries states
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquirySearch, setInquirySearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const initialFormState = {
    title: '',
    description: '',
    purpose: 'sale',
    propertyType: 'flat',
    price: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    area: 1000,
    carpetArea: '',
    builtUpArea: '',
    superBuiltUpArea: '',
    bedrooms: 2,
    bathrooms: 2,
    floorNumber: '',
    totalFloors: '',
    furnishing: 'unfurnished',
    facing: '',
    balconies: '',
    parkingSpaces: '',
    reraNumber: '',
    reraAuthority: '',
    verificationStatus: 'unverified',
    verificationNotes: '',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
    images: '',
    floorPlan: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    featured: false,
    status: 'available',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAdminProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getProperties();
      if (res.success && Array.isArray(res.data)) {
        setProperties(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await inquiryService.getInquiries();
      if (res.success && Array.isArray(res.data)) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchAdminProperties();
    fetchAdminInquiries();
  }, []);

  // Keyboard navigation & modal dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteTarget) setDeleteTarget(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget, isModalOpen]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingProperty(null);
    setFormData(initialFormState);
    setFormError('');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prop) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title || '',
      description: prop.description || '',
      purpose: prop.purpose || 'sale',
      propertyType: prop.propertyType || 'flat',
      price: prop.price || '',
      address: prop.address || '',
      city: prop.city || '',
      state: prop.state || '',
      area: prop.area || 1000,
      carpetArea: prop.carpetArea !== undefined && prop.carpetArea !== null ? prop.carpetArea : '',
      builtUpArea: prop.builtUpArea !== undefined && prop.builtUpArea !== null ? prop.builtUpArea : '',
      superBuiltUpArea: prop.superBuiltUpArea !== undefined && prop.superBuiltUpArea !== null ? prop.superBuiltUpArea : '',
      bedrooms: prop.bedrooms !== undefined ? prop.bedrooms : 1,
      bathrooms: prop.bathrooms !== undefined ? prop.bathrooms : 1,
      floorNumber: prop.floorNumber !== undefined && prop.floorNumber !== null ? prop.floorNumber : '',
      totalFloors: prop.totalFloors !== undefined && prop.totalFloors !== null ? prop.totalFloors : '',
      furnishing: prop.furnishing || 'unfurnished',
      facing: prop.facing || '',
      balconies: prop.balconies !== undefined && prop.balconies !== null ? prop.balconies : '',
      parkingSpaces: prop.parkingSpaces !== undefined && prop.parkingSpaces !== null ? prop.parkingSpaces : '',
      reraNumber: prop.reraNumber || '',
      reraAuthority: prop.reraAuthority || '',
      verificationStatus: prop.verificationStatus || 'unverified',
      verificationNotes: prop.verificationNotes || '',
      image: prop.image || '',
      images: Array.isArray(prop.images) ? prop.images.join('\n') : '',
      floorPlan: prop.floorPlan || '',
      ownerName: prop.ownerName || '',
      ownerEmail: prop.ownerEmail || '',
      ownerPhone: prop.ownerPhone || '',
      featured: prop.featured || false,
      status: prop.status || 'available',
    });
    setFormError('');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      const res = await uploadService.uploadImage(file);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        showNotification('Image uploaded successfully');
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      area: Number(formData.area),
      bedrooms: formData.propertyType === 'commercial' ? 0 : Number(formData.bedrooms || 0),
      bathrooms: Number(formData.bathrooms || 1),
      carpetArea: formData.carpetArea !== '' ? Number(formData.carpetArea) : undefined,
      builtUpArea: formData.builtUpArea !== '' ? Number(formData.builtUpArea) : undefined,
      superBuiltUpArea: formData.superBuiltUpArea !== '' ? Number(formData.superBuiltUpArea) : undefined,
      floorNumber: formData.floorNumber !== '' ? Number(formData.floorNumber) : undefined,
      totalFloors: formData.totalFloors !== '' ? Number(formData.totalFloors) : undefined,
      balconies: formData.balconies !== '' ? Number(formData.balconies) : undefined,
      parkingSpaces: formData.parkingSpaces !== '' ? Number(formData.parkingSpaces) : undefined,
      furnishing: formData.furnishing || undefined,
      facing: formData.facing ? formData.facing.toLowerCase() : undefined,
      reraNumber: formData.reraNumber ? formData.reraNumber.trim() : null,
      reraAuthority: formData.reraAuthority ? formData.reraAuthority.trim() : null,
      verificationStatus: formData.verificationStatus || 'unverified',
      verificationNotes: formData.verificationNotes ? formData.verificationNotes.trim() : null,
      floorPlan: formData.floorPlan ? formData.floorPlan.trim() : null,
      images: typeof formData.images === 'string'
        ? formData.images.split('\n').map((s) => s.trim()).filter(Boolean)
        : Array.isArray(formData.images) ? formData.images : [],
    };

    try {
      if (editingProperty) {
        const res = await propertyService.updateProperty(editingProperty._id, payload);
        if (res.success) {
          showNotification('Property updated successfully');
          setIsModalOpen(false);
          fetchAdminProperties();
        }
      } else {
        const res = await propertyService.createProperty(payload);
        if (res.success) {
          showNotification('Property created successfully');
          setIsModalOpen(false);
          fetchAdminProperties();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await propertyService.deleteProperty(deleteTarget._id);
      if (res.success) {
        showNotification('Property and associated records deleted');
        setDeleteTarget(null);
        fetchAdminProperties();
        fetchAdminInquiries();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete property', 'error');
    }
  };

  const handleInquiryStatusChange = async (inquiryId, newStatus) => {
    try {
      const res = await inquiryService.updateStatus(inquiryId, newStatus);
      if (res.success) {
        showNotification('Inquiry status updated');
        fetchAdminInquiries();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    try {
      const res = await inquiryService.deleteInquiry(inquiryId);
      if (res.success) {
        showNotification('Inquiry removed');
        fetchAdminInquiries();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete inquiry', 'error');
    }
  };

  const totalProperties = properties.length;
  const featuredCount = properties.filter((p) => p.featured).length;
  const forSaleCount = properties.filter((p) => p.purpose === 'sale').length;
  const forRentCount = properties.filter((p) => p.purpose === 'rent').length;
  const totalValue = properties.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.property?.title || '').toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.phone.includes(inquirySearch)
  );

  return (
    <div className="min-h-screen bg-[#FBFBF9] pt-28 pb-20 text-[#111827]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-md border text-xs font-bold flex items-center justify-between shadow-xs ${
                notification.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-[#14532D]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="p-1" aria-label="Dismiss notification">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs font-bold text-[#14532D] uppercase tracking-[0.2em] block mb-1">
              Curator Management Console
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              HAVEN Residences Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#14532D]"
            >
              <Plus className="w-4 h-4" /> Add Residence
            </button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Total Listings</span>
              <Building2 className="w-4 h-4 text-[#14532D]" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{totalProperties}</p>
            <p className="text-xs text-stone-500">Active in database</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Featured Homes</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{featuredCount}</p>
            <p className="text-xs text-stone-500">Highlighted on homepage</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Customer Inquiries</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{inquiries.length}</p>
            <p className="text-xs text-stone-500">Direct buyer/renter leads</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Portfolio Valuation</span>
              <TrendingUp className="w-4 h-4 text-[#14532D]" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{formatPrice(totalValue)}</p>
            <p className="text-xs text-stone-500">Total catalog value</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Property Catalog ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Customer Leads & Inquiries ({inquiries.length})
          </button>
        </div>

        {/* TAB 1: PROPERTIES TABLE */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-stone-900">All Registered Properties</h2>
              <div className="relative max-w-xs w-full">
                <label htmlFor="admin-properties-search" className="sr-only">Filter properties by title, city, or type</label>
                <input
                  id="admin-properties-search"
                  type="text"
                  placeholder="Filter by title, city, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-100">
                  <tr>
                    <th className="py-4 px-6">Property</th>
                    <th className="py-4 px-6">Type & Status</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Owner</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">Loading catalog...</td>
                    </tr>
                  ) : filteredProperties.length > 0 ? (
                    filteredProperties.map((prop) => (
                      <tr key={prop._id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={prop.image}
                              alt={prop.title}
                              className="w-12 h-12 rounded-md object-cover border border-stone-200 bg-stone-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 text-xs truncate max-w-xs">{prop.title}</p>
                              {prop.featured && (
                                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm inline-block mt-0.5 uppercase tracking-wider">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="capitalize font-bold text-stone-900">{prop.propertyType}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-stone-500 uppercase font-semibold">
                              {prop.purpose === 'sale' ? 'Sale' : 'Rent'}
                            </span>
                            <span className="text-stone-300">•</span>
                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-sm ${
                              prop.status === 'sold'
                                ? 'bg-rose-50 text-rose-700'
                                : prop.status === 'rented'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-[#14532D]'
                            }`}>
                              {prop.status || 'available'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold text-[#14532D]">
                          {formatPrice(prop.price, prop.purpose)}
                        </td>

                        <td className="py-4 px-6 font-semibold">
                          {prop.city}
                        </td>

                        <td className="py-4 px-6 text-stone-600">
                          <p className="font-semibold text-stone-900">{prop.ownerName}</p>
                          <p className="text-xs text-stone-500 truncate">{prop.ownerEmail}</p>
                        </td>

                        <td className="py-4 px-6 text-right space-x-1.5">
                          <a
                            href={`/properties/${prop._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors inline-block"
                            title="View Property"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prop)}
                            className="p-2 rounded-md bg-emerald-50 text-[#14532D] hover:bg-emerald-100 transition-colors"
                            title="Edit Property"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(prop)}
                            className="p-2 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Property"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">No properties match search filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: INQUIRIES & LEADS TABLE */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Inbound Customer Inquiries</h2>
                <p className="text-xs text-stone-500">Live submissions captured from the Contact Owner modal</p>
              </div>
              <div className="relative max-w-xs w-full">
                <label htmlFor="admin-inquiries-search" className="sr-only">Filter inquiries by name, email, or phone</label>
                <input
                  id="admin-inquiries-search"
                  type="text"
                  placeholder="Filter inquiries by name, email, phone..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-100">
                  <tr>
                    <th className="py-4 px-6">Inquirer</th>
                    <th className="py-4 px-6">Property Referenced</th>
                    <th className="py-4 px-6">Inquiry Message</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {loadingInquiries ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">Loading inquiries...</td>
                    </tr>
                  ) : filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-stone-900 text-xs">{inq.name}</p>
                          <div className="space-y-0.5 mt-1 text-xs text-stone-600">
                            <p className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#14532D]" />
                              <a href={`mailto:${inq.email}`} className="hover:underline">{inq.email}</a>
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#14532D]" />
                              <a href={`tel:${inq.phone}`} className="hover:underline">{inq.phone}</a>
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {inq.property ? (
                            <div>
                              <a
                                href={`/properties/${inq.property._id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-stone-900 hover:text-[#14532D] transition-colors line-clamp-1"
                              >
                                {inq.property.title}
                              </a>
                              <p className="text-xs text-stone-500">{inq.property.city} • {formatPrice(inq.property.price)}</p>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">Property Deleted</span>
                          )}
                        </td>

                        <td className="py-4 px-6 max-w-sm">
                          <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-md border border-stone-100 whitespace-pre-wrap">
                            {inq.message}
                          </p>
                        </td>

                        <td className="py-4 px-6 text-stone-600 text-xs font-medium">
                          {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-4 px-6">
                          <select
                            value={inq.status}
                            aria-label={`Update inquiry status for ${inq.name}`}
                            onChange={(e) => handleInquiryStatusChange(inq._id, e.target.value)}
                            className={`p-1.5 rounded-md text-xs font-bold uppercase border cursor-pointer outline-none ${
                              inq.status === 'resolved'
                                ? 'bg-emerald-50 text-[#14532D] border-emerald-200'
                                : inq.status === 'contacted'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteInquiry(inq._id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        No customer inquiries found. Inquiries submitted via property pages appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT PROPERTY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="admin-property-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-2xl border border-stone-200 max-w-3xl w-full my-8 overflow-hidden"
            >
              <div className="bg-[#14532D] text-white p-6 flex items-center justify-between">
                <div>
                  <h3 id="admin-property-modal-title" className="text-lg font-bold font-serif">
                    {editingProperty ? 'Edit Property' : 'Register New Property'}
                  </h3>
                  <p className="text-xs text-emerald-200">Manage comprehensive domain intelligence, dimensions, and verified attributes</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close modal"
                  className="p-2 text-white/80 hover:text-white rounded-md bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
                {formError && (
                  <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. BASIC INFORMATION */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                    1. Basic Information
                  </span>

                  <div className="space-y-1">
                    <label htmlFor="admin-prop-title" className="text-xs font-bold uppercase tracking-wider text-stone-700">Property Title *</label>
                    <input
                      id="admin-prop-title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold focus:outline-none focus:border-[#14532D]"
                      placeholder="e.g. Spacious 3BHK Flat in Whitefield"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="admin-prop-description" className="text-xs font-bold uppercase tracking-wider text-stone-700">Description *</label>
                    <textarea
                      id="admin-prop-description"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold focus:outline-none focus:border-[#14532D]"
                      placeholder="Provide a detailed overview of the property, surroundings, and amenities..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-purpose" className="text-xs font-bold uppercase tracking-wider text-stone-700">Purpose *</label>
                      <select
                        id="admin-prop-purpose"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      >
                        <option value="sale">For Sale (Outright)</option>
                        <option value="rent">For Rent (Monthly Lease)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-type" className="text-xs font-bold uppercase tracking-wider text-stone-700">Typology *</label>
                      <select
                        id="admin-prop-type"
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      >
                        <option value="flat">Flat</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="bungalow">Bungalow</option>
                        <option value="house">House</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="commercial">Commercial Workspace</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-status" className="text-xs font-bold uppercase tracking-wider text-stone-700">Availability Status *</label>
                      <select
                        id="admin-prop-status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. PRICING INTELLIGENCE */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                    2. Pricing Intelligence
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-price" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        {formData.purpose === 'rent' ? 'Monthly Rental Price (INR) *' : 'Sale Price (INR) *'}
                      </label>
                      <input
                        id="admin-prop-price"
                        type="number"
                        required
                        min={0}
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder={formData.purpose === 'rent' ? "e.g. 45000" : "e.g. 6500000"}
                      />
                    </div>

                    <div className="p-3 bg-stone-50 rounded-md border border-stone-200/80 flex flex-col justify-center text-xs">
                      <span className="text-stone-500 font-bold uppercase tracking-wider text-[11px]">Formatted Valuation</span>
                      <span className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                        {formData.price ? formatPrice(Number(formData.price), formData.purpose) : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. AREA & SPATIAL DIMENSIONS */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                      3. Spatial Dimensions & Area Intelligence (sq.ft)
                    </span>
                    <span className="text-[11px] text-stone-500">RERA Carpet Area takes calculation precedence</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-carpet-area" className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
                        Carpet Area (sq.ft)
                      </label>
                      <input
                        id="admin-prop-carpet-area"
                        type="number"
                        min={0}
                        value={formData.carpetArea}
                        onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-emerald-300 bg-emerald-50/20 text-xs font-semibold"
                        placeholder="e.g. 860"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-builtup-area" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Built-Up Area (sq.ft)
                      </label>
                      <input
                        id="admin-prop-builtup-area"
                        type="number"
                        min={0}
                        value={formData.builtUpArea}
                        onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. 980"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-super-area" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Super Built-Up (sq.ft)
                      </label>
                      <input
                        id="admin-prop-super-area"
                        type="number"
                        min={0}
                        value={formData.superBuiltUpArea}
                        onChange={(e) => setFormData({ ...formData, superBuiltUpArea: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. 1100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-area" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Total Area (sq.ft) *
                      </label>
                      <input
                        id="admin-prop-area"
                        type="number"
                        required
                        min={10}
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. 1100"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. PROPERTY SPECIFICATIONS */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                    4. Property Specifications ({formData.propertyType === 'commercial' ? 'Commercial Workspace' : 'Residential'})
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.propertyType !== 'commercial' ? (
                      <div className="space-y-1">
                        <label htmlFor="admin-prop-bedrooms" className="text-xs font-bold uppercase tracking-wider text-stone-700">Bedrooms</label>
                        <input
                          id="admin-prop-bedrooms"
                          type="number"
                          min={0}
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                          className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">Work Typology</span>
                        <p className="p-2.5 bg-stone-50 rounded-md border border-stone-200 text-xs font-semibold text-stone-700">Office Suite</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-bathrooms" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        {formData.propertyType === 'commercial' ? 'Washrooms' : 'Bathrooms'}
                      </label>
                      <input
                        id="admin-prop-bathrooms"
                        type="number"
                        min={0}
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-floor-num" className="text-xs font-bold uppercase tracking-wider text-stone-700">Floor Level</label>
                      <input
                        id="admin-prop-floor-num"
                        type="number"
                        min={-2}
                        value={formData.floorNumber}
                        onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. 4 (0 = Ground)"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-total-floors" className="text-xs font-bold uppercase tracking-wider text-stone-700">Total Floors</label>
                      <input
                        id="admin-prop-total-floors"
                        type="number"
                        min={0}
                        value={formData.totalFloors}
                        onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. 12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-furnishing" className="text-xs font-bold uppercase tracking-wider text-stone-700">Furnishing</label>
                      <select
                        id="admin-prop-furnishing"
                        value={formData.furnishing}
                        onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      >
                        <option value="unfurnished">Unfurnished</option>
                        <option value="semi-furnished">Semi-Furnished</option>
                        <option value="fully-furnished">Fully Furnished</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-facing" className="text-xs font-bold uppercase tracking-wider text-stone-700">Facing / Orientation</label>
                      <select
                        id="admin-prop-facing"
                        value={formData.facing}
                        onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      >
                        <option value="">Unspecified</option>
                        <option value="east">East Facing</option>
                        <option value="north">North Facing</option>
                        <option value="north-east">North-East Facing</option>
                        <option value="west">West Facing</option>
                        <option value="south">South Facing</option>
                        <option value="south-east">South-East Facing</option>
                        <option value="north-west">North-West Facing</option>
                        <option value="south-west">South-West Facing</option>
                      </select>
                    </div>

                    {formData.propertyType !== 'commercial' && (
                      <div className="space-y-1">
                        <label htmlFor="admin-prop-balconies" className="text-xs font-bold uppercase tracking-wider text-stone-700">Balconies</label>
                        <input
                          id="admin-prop-balconies"
                          type="number"
                          min={0}
                          value={formData.balconies}
                          onChange={(e) => setFormData({ ...formData, balconies: e.target.value })}
                          className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                          placeholder="e.g. 2"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-parking" className="text-xs font-bold uppercase tracking-wider text-stone-700">Parking Bays</label>
                      <input
                        id="admin-prop-parking"
                        type="number"
                        min={0}
                        value={formData.parkingSpaces}
                        onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. LOCATION */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                    5. Location & Enclave
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-address" className="text-xs font-bold uppercase tracking-wider text-stone-700">Address *</label>
                      <input
                        id="admin-prop-address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="Street / Locality"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-city" className="text-xs font-bold uppercase tracking-wider text-stone-700">City *</label>
                      <input
                        id="admin-prop-city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-state" className="text-xs font-bold uppercase tracking-wider text-stone-700">State *</label>
                      <input
                        id="admin-prop-state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. Karnataka"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. RERA & VERIFICATION WORKFLOW */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                      6. RERA & Verification Details
                    </span>
                    <span className="text-[11px] text-stone-500">Only verified status grants the public Verified badge</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-rera-num" className="text-xs font-bold uppercase tracking-wider text-stone-700">RERA Registration Number</label>
                      <input
                        id="admin-prop-rera-num"
                        type="text"
                        value={formData.reraNumber}
                        onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. PRM/KA/RERA/1251/..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-rera-auth" className="text-xs font-bold uppercase tracking-wider text-stone-700">Registration Authority / State</label>
                      <input
                        id="admin-prop-rera-auth"
                        type="text"
                        value={formData.reraAuthority}
                        onChange={(e) => setFormData({ ...formData, reraAuthority: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="e.g. Karnataka RERA, MahaRERA"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-verif-status" className="text-xs font-bold uppercase tracking-wider text-stone-700">Verification Status</label>
                      <select
                        id="admin-prop-verif-status"
                        value={formData.verificationStatus}
                        onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      >
                        <option value="unverified">Unverified Listing</option>
                        <option value="self_reported">Self-Reported by Owner</option>
                        <option value="verified">Verified Official Registration</option>
                        <option value="rejected">Rejected / Invalid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 7. MEDIA GALLERY & FLOOR PLANS */}
                <div className="space-y-3 pb-4 border-b border-stone-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                    7. Photography Gallery & Floor Plans
                  </span>

                  <div className="space-y-2 p-4 bg-stone-50 rounded-lg border border-stone-200">
                    <label htmlFor="admin-prop-image" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Primary Property Image *</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <label htmlFor="admin-prop-file-upload" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-stone-300 text-xs font-bold text-stone-700 shadow-xs hover:bg-stone-50 cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-[#14532D]" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                          </label>
                          <input
                            id="admin-prop-file-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                            className="sr-only"
                          />
                          <span className="text-xs text-stone-500">Max 5MB</span>
                        </div>

                        <input
                          id="admin-prop-image"
                          type="text"
                          required
                          placeholder="Or enter image URL..."
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full p-2.5 rounded-md border border-stone-200 bg-white text-xs font-semibold"
                        />
                        {uploadError && (
                          <p className="text-xs text-rose-500 font-medium mt-1">{uploadError}</p>
                        )}
                      </div>

                      {/* Live Preview Thumbnail */}
                      <div className="flex items-center justify-center bg-stone-200 rounded-md overflow-hidden h-28 border border-stone-300">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-stone-400">No Image Preview</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-extra-images" className="text-xs font-bold uppercase tracking-wider text-stone-700">Additional Gallery Images (1 per line)</label>
                      <textarea
                        id="admin-prop-extra-images"
                        rows={3}
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="admin-prop-floor-plan" className="text-xs font-bold uppercase tracking-wider text-stone-700">Floor Plan Image URL</label>
                      <textarea
                        id="admin-prop-floor-plan"
                        rows={3}
                        value={formData.floorPlan}
                        onChange={(e) => setFormData({ ...formData, floorPlan: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                        placeholder="https://images.unsplash.com/photo-1600585154526... (Architectural layout schematic)"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. OWNER REPRESENTATION & FEATURED */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                    8. Direct Owner Representation
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-owner-name" className="text-xs font-bold uppercase tracking-wider text-stone-700">Owner Name *</label>
                      <input
                        id="admin-prop-owner-name"
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-owner-email" className="text-xs font-bold uppercase tracking-wider text-stone-700">Owner Email *</label>
                      <input
                        id="admin-prop-owner-email"
                        type="email"
                        required
                        value={formData.ownerEmail}
                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="admin-prop-owner-phone" className="text-xs font-bold uppercase tracking-wider text-stone-700">Owner Phone *</label>
                      <input
                        id="admin-prop-owner-phone"
                        type="tel"
                        required
                        value={formData.ownerPhone}
                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                        className="w-full p-2.5 rounded-md border border-stone-200 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="featuredToggle"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-[#14532D] rounded-sm cursor-pointer"
                    />
                    <label htmlFor="featuredToggle" className="text-xs font-bold text-stone-800 cursor-pointer">
                      Highlight as Featured Property on Homepage
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-md border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-6 py-2.5 rounded-md bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    {submitting ? 'Saving Property...' : editingProperty ? 'Save Changes' : 'Create Property'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="delete-property-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteTarget(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full border border-stone-200 shadow-xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 id="delete-property-modal-title" className="text-lg font-bold text-stone-900 font-serif">Delete Property?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to delete "<span className="font-bold text-stone-800">{deleteTarget.title}</span>"? This will also clean up associated customer inquiries and user favorites.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="py-2.5 rounded-md border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
