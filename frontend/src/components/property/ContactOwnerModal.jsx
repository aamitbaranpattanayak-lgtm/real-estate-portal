import React, { useState } from 'react';
import { X, Phone, Mail, User, ShieldCheck, Check, Copy, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ContactOwnerModal = ({ isOpen, onClose, ownerData, propertyTitle }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [inquiryText, setInquiryText] = useState(
    `Hi ${ownerData?.ownerName || 'Owner'}, I am interested in your property "${propertyTitle || 'listing'}". Please contact me.`
  );

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden"
        >
          {/* Modal Header */}
          <div className="bg-slate-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Verified Owner Details
            </div>
            <h3 className="text-xl font-extrabold text-white">Contact Property Owner</h3>
            <p className="text-xs text-slate-300 line-clamp-1 mt-1">{propertyTitle}</p>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            
            {/* Owner Info Card */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                {ownerData?.ownerName ? ownerData.ownerName.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{ownerData?.ownerName || 'Property Owner'}</h4>
                <p className="text-xs text-emerald-600 font-semibold">Direct Owner / Listing Representative</p>
              </div>
            </div>

            {/* Quick Contact Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Phone Button */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Phone className="w-4 h-4 text-emerald-600" /> Phone
                  </div>
                  <button
                    onClick={handleCopyPhone}
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <a
                  href={`tel:${ownerData?.ownerPhone}`}
                  className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors"
                >
                  {ownerData?.ownerPhone || 'N/A'}
                </a>
              </div>

              {/* Email Button */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Mail className="w-4 h-4 text-emerald-600" /> Email
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <a
                  href={`mailto:${ownerData?.ownerEmail}`}
                  className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors truncate block"
                >
                  {ownerData?.ownerEmail || 'N/A'}
                </a>
              </div>

            </div>

            {/* Direct Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Send Direct Message
              </label>
              <textarea
                rows={3}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                required
              />
              <button
                type="submit"
                disabled={messageSent}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                  messageSent ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg'
                }`}
              >
                {messageSent ? (
                  <>
                    <Check className="w-4 h-4" /> Message Sent Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
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
