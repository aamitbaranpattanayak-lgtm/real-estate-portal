import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inquiryService } from '../../services/inquiryService';
import { 
  X, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  Check, 
  Copy, 
  Send, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ContactOwnerModal = ({ isOpen, onClose, ownerData, propertyTitle, propertyId }) => {
  const { user } = useAuth();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize user profile into sender fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setPhone(user?.phone || '');
      setMessage(
        `Hi ${ownerData?.ownerName || 'Owner'}, I am interested in your property "${propertyTitle || 'listing'}". Please contact me with more information.`
      );
      setSubmitSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, user, ownerData, propertyTitle]);

  // Keyboard navigation / dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    if (ownerData?.ownerPhone) {
      navigator.clipboard.writeText(ownerData.ownerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleCopyEmail = () => {
    if (ownerData?.ownerEmail) {
      navigator.clipboard.writeText(ownerData.ownerEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, email, phone number, and message.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        propertyId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      };

      const res = await inquiryService.createInquiry(payload);
      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="bg-white rounded-lg shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-[#14532D] text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close contact modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Direct Owner Connection
            </div>
            <h3 id="contact-modal-title" className="text-xl font-bold text-white tracking-tight">Contact Property Representative</h3>
            <p className="text-xs text-emerald-100/90 line-clamp-1 mt-1 font-medium">{propertyTitle}</p>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Owner Info Bar */}
            <div className="flex items-center gap-4 p-4 bg-[#FBFBF9] rounded-md border border-stone-200">
              <div className="w-12 h-12 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {ownerData?.ownerName ? ownerData.ownerName.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">{ownerData?.ownerName || 'Property Representative'}</h4>
                <p className="text-xs text-[#14532D] font-semibold">Verified Owner / Direct Representative</p>
              </div>
            </div>

            {/* Quick Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-md border border-stone-200 bg-white flex flex-col justify-between space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-stone-600">
                    <Phone className="w-3.5 h-3.5 text-[#14532D]" /> Direct Phone
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="text-stone-500 hover:text-[#14532D] transition-colors p-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    aria-label="Copy phone number"
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-[#14532D]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <a
                  href={`tel:${ownerData?.ownerPhone}`}
                  className="font-bold text-stone-900 text-xs hover:text-[#14532D] transition-colors truncate"
                >
                  {ownerData?.ownerPhone || 'N/A'}
                </a>
              </div>

              <div className="p-3.5 rounded-md border border-stone-200 bg-white flex flex-col justify-between space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-stone-600">
                    <Mail className="w-3.5 h-3.5 text-[#14532D]" /> Direct Email
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-stone-500 hover:text-[#14532D] transition-colors p-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    aria-label="Copy email address"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#14532D]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <a
                  href={`mailto:${ownerData?.ownerEmail}`}
                  className="font-bold text-stone-900 text-xs hover:text-[#14532D] transition-colors truncate block"
                >
                  {ownerData?.ownerEmail || 'N/A'}
                </a>
              </div>
            </div>

            {/* Inquirer Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Send Formal Inquiry
                </span>
                {user && (
                  <span className="text-xs font-semibold text-[#14532D] bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Signed in as {user.name}
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-[#14532D] text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#14532D] flex-shrink-0" />
                  <span>Inquiry sent to owner! A representative will reach out soon.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="inquiry-sender-name" className="text-xs font-semibold uppercase text-stone-700 block">Your Full Name *</label>
                  <input
                    id="inquiry-sender-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="inquiry-sender-phone" className="text-xs font-semibold uppercase text-stone-700 block">Your Phone Number *</label>
                  <input
                    id="inquiry-sender-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="inquiry-sender-email" className="text-xs font-semibold uppercase text-stone-700 block">Your Email Address *</label>
                <input
                  id="inquiry-sender-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="inquiry-sender-message" className="text-xs font-semibold uppercase text-stone-700 block">Message to Owner *</label>
                <textarea
                  id="inquiry-sender-message"
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || submitSuccess}
                className={`w-full py-3 rounded-md font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                  submitSuccess
                    ? 'bg-emerald-700'
                    : 'bg-[#14532D] hover:bg-[#166534] cursor-pointer'
                }`}
              >
                {submitting ? (
                  <span>Submitting Inquiry...</span>
                ) : submitSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Message Sent Successfully
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Direct Inquiry
                  </>
                )}
              </button>

            </form>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
