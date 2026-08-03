import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { formatPrice } from '../../utils/formatters';
import { 
  LayoutDashboard, 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  X, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const initialFormState = {
    title: '',
    description: '',
    purpose: 'sale',
    propertyType: 'flat',
    price: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    bedrooms: 2,
    bathrooms: 2,
    area: 1000,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
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

  useEffect(() => {
    fetchAdminProperties();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingProperty(null);
    setFormData(initialFormState);
    setFormError('');
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
      bedrooms: prop.bedrooms || 1,
      bathrooms: prop.bathrooms || 1,
      area: prop.area || 1000,
      image: prop.image || '',
      ownerName: prop.ownerName || '',
      ownerEmail: prop.ownerEmail || '',
      ownerPhone: prop.ownerPhone || '',
      featured: prop.featured || false,
      status: prop.status || 'available',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
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
        showNotification('Property removed');
        setDeleteTarget(null);
        fetchAdminProperties();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete', 'error');
    }
  };

  const totalProperties = properties.length;
  const featuredCount = properties.filter((p) => p.featured).length;
  const forSaleCount = properties.filter((p) => p.purpose === 'sale').length;
  const forRentCount = properties.filter((p) => p.purpose === 'rent').length;
  const totalValue = properties.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const filteredTableProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20 text-[#111827]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs ${
                notification.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-[#14532D]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#14532D] uppercase tracking-widest block mb-1">
              Admin Console
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              HAVEN Property Management
            </h1>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Listings</span>
              <Building2 className="w-4 h-4 text-[#14532D]" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{totalProperties}</p>
            <p className="text-xs text-stone-400">Active in database</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Featured Homes</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{featuredCount}</p>
            <p className="text-xs text-stone-400">Highlighted on Hero</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sale / Rent</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{forSaleCount} / {forRentCount}</p>
            <p className="text-xs text-stone-400">For Sale vs Rent</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Portfolio Valuation</span>
              <DollarSign className="w-4 h-4 text-[#14532D]" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{formatPrice(totalValue)}</p>
            <p className="text-xs text-stone-400">Total catalog value</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-stone-900">All Registered Properties</h2>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search by title, city, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold focus:outline-none focus:border-[#14532D]"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-100">
                <tr>
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Type</th>
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
                ) : filteredTableProperties.length > 0 ? (
                  filteredTableProperties.map((prop) => (
                    <tr key={prop._id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.image}
                            alt={prop.title}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                          />
                          <div>
                            <p className="font-bold text-stone-900 text-xs line-clamp-1">{prop.title}</p>
                            {prop.featured && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5 uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="capitalize font-bold text-stone-900">{prop.propertyType}</span>
                        <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                          {prop.purpose === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-[#14532D]">
                        {formatPrice(prop.price, prop.purpose)}
                      </td>

                      <td className="py-4 px-6 font-semibold">
                        {prop.city}
                      </td>

                      <td className="py-4 px-6 text-stone-600">
                        {prop.ownerName}
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5">
                        <a
                          href={`/properties/${prop._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors inline-block"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEditModal(prop)}
                          className="p-2 rounded-lg bg-emerald-50 text-[#14532D] hover:bg-emerald-100 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(prop)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">No properties match search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full my-8 overflow-hidden"
            >
              <div className="bg-[#111827] text-white p-6 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {editingProperty ? 'Edit Listing' : 'Add Property'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-600">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:border-[#14532D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-600">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:border-[#14532D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-600">Purpose *</label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-600">Type *</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                    >
                      <option value="flat">Flat</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="bungalow">Bungalow</option>
                      <option value="house">House</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-600">Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Beds"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="Baths"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="Area sq.ft"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-600">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Owner Name"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="email"
                    placeholder="Owner Email"
                    required
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="tel"
                    placeholder="Owner Phone"
                    required
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className="p-3 rounded-xl border border-stone-200 text-xs font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featuredToggle"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-[#14532D] rounded"
                  />
                  <label htmlFor="featuredToggle" className="text-xs font-bold text-stone-800 cursor-pointer">
                    Highlight as Featured Property on Homepage
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#14532D] text-white font-bold text-xs shadow-xs"
                  >
                    {submitting ? 'Saving...' : editingProperty ? 'Save Changes' : 'Create Property'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Delete Property?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to delete "<span className="font-bold text-stone-800">{deleteTarget.title}</span>"?
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs"
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
