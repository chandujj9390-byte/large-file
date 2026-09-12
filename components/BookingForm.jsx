'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjgbzipdvhgdftxdlccx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9fjwQtl2NjYC7OYLmy1pVw_oyc4ru2C';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Arne Stories Curated Production Services
const ARNE_SERVICES = [
  'Video Editing (4K / Cinematic)',
  'Photo Retouching & Color Grading',
  'Reels & Shorts Viral Editing',
  'Poster & Title Card Designing',
  'Cinematic Photo Album Layout',
  'DaVinci Resolve Color Grading',
// Comprehensive Country to States / Provinces Dictionary
const COUNTRY_STATES_MAP = {
  'India': [
    'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra',
    'Kerala', 'Gujarat', 'Delhi (NCT)', 'Uttar Pradesh', 'West Bengal',
    'Rajasthan', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar', 'Odisha',
    'Assam', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh', 'Uttarakhand',
    'Goa', 'Jammu and Kashmir', 'Chandigarh', 'Puducherry', 'Arunachal Pradesh',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura',
    'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
    'Ladakh', 'Lakshadweep', 'Other State / UT'
  ],
  'United States': [
    'California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania',
    'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
    'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
    'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama',
    'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah', 'Iowa',
    'Nevada', 'Arkansas', 'Mississippi', 'Kansas', 'New Mexico', 'Nebraska',
    'Idaho', 'West Virginia', 'Hawaii', 'New Hampshire', 'Maine', 'Montana',
    'Rhode Island', 'Delaware', 'South Dakota', 'North Dakota', 'Alaska',
    'District of Columbia (DC)', 'Vermont', 'Wyoming', 'Other Territory'
  ],
  'United Kingdom': [
    'Greater London', 'South East England', 'North West England', 'West Midlands',
    'Yorkshire and the Humber', 'East of England', 'South West England',
    'East Midlands', 'North East England', 'Scotland (Edinburgh/Glasgow)',
    'Wales (Cardiff/Swansea)', 'Northern Ireland (Belfast)', 'Other Region'
  ],
  'United Arab Emirates': [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ],
  'Canada': [
    'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
    'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
    'Prince Edward Island', 'Northwest Territories', 'Nunavut', 'Yukon', 'Other Province'
  ],
  'Australia': [
    'New South Wales (Sydney)', 'Victoria (Melbourne)', 'Queensland (Brisbane)',
    'Western Australia (Perth)', 'South Australia (Adelaide)', 'Tasmania (Hobart)',
    'Australian Capital Territory (Canberra)', 'Northern Territory (Darwin)', 'Other Territory'
  ],
  'Singapore': [
    'Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region',
    'Downtown Core', 'Jurong', 'Tampines', 'Woodlands', 'Bedok', 'Orchard / Marina Bay'
  ],
  'Germany': [
    'Bavaria (Bayern)', 'Berlin', 'Baden-Württemberg', 'North Rhine-Westphalia',
    'Hesse (Hessen)', 'Hamburg', 'Lower Saxony (Niedersachsen)', 'Saxony (Sachsen)',
    'Rhineland-Palatinate', 'Schleswig-Holstein', 'Brandenburg', 'Saxony-Anhalt',
    'Thuringia', 'Mecklenburg-Vorpommern', 'Saarland', 'Bremen', 'Other State'
  ],
  'Saudi Arabia': [
    'Riyadh Region', 'Makkah Region (Jeddah/Mecca)', 'Eastern Province (Dammam/Khobar)',
    'Madinah Region', 'Al Qassim', 'Asir', 'Tabuk', 'Hail', 'Jazan', 'Najran',
    'Al Bahah', 'Al Jawf', 'Northern Borders', 'Other Province'
  ],
  'Qatar': [
    'Doha (Ad Dawhah)', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Daayen', 'Umm Salal', 'Al Shamal', 'Al Shahaniya'
  ],
  'Kuwait': [
    'Al Asimah (Capital)', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Jahra', 'Mubarak Al-Kabeer'
  ],
  'Malaysia': [
    'Selangor', 'Kuala Lumpur', 'Johor', 'Penang (Pulau Pinang)', 'Perak', 'Sabah',
    'Sarawak', 'Kedah', 'Pahang', 'Melaka', 'Negeri Sembilan', 'Terengganu', 'Kelantan', 'Perlis', 'Putrajaya', 'Other State'
  ],
  'New Zealand': [
    'Auckland', 'Wellington', 'Canterbury (Christchurch)', 'Waikato (Hamilton)',
    'Bay of Plenty (Tauranga)', 'Otago (Dunedin/Queenstown)', 'Other Region'
  ],
  'France': [
    'Île-de-France (Paris)', 'Auvergne-Rhône-Alpes (Lyon)', 'Provence-Alpes-Côte d\'Azur',
    'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Grand Est', 'Pays de la Loire', 'Brittany', 'Other Region'
  ],
  'Netherlands': [
    'North Holland (Amsterdam)', 'South Holland (Rotterdam/The Hague)', 'Utrecht',
    'North Brabant (Eindhoven)', 'Gelderland', 'Overijssel', 'Limburg', 'Other Province'
  ],
  'Ireland': [
    'Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kildare', 'Meath', 'Wicklow', 'Other County'
  ],
  'South Africa': [
    'Gauteng (Johannesburg/Pretoria)', 'Western Cape (Cape Town)', 'KwaZulu-Natal (Durban)',
    'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'Other Province'
  ],
  'Other': [
    'Capital / Main City', 'Northern Region', 'Southern Region', 'Eastern Region', 'Western Region', 'Central Region', 'Other Province / State'
  ]
};

/**
 * Ambient Glow Subcomponent (Memoized to prevent repaints)
 */
const AmbientGlow = memo(function AmbientGlow() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/10 blur-[150px] rounded-full pointer-events-none" />
  );
});

/**
 * Step Progress Indicator Subcomponent (Memoized)
 */
const StepProgressBar = memo(function StepProgressBar({ step }) {
  if (step >= 3) return null;
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
      <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
    </div>
  );
});

/**
 * Summary Review Card (Step 2 - Memoized)
 */
const ReviewCard = memo(function ReviewCard({ data }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3 text-xs divide-y divide-white/5">
      <div className="flex justify-between items-center pt-1 first:pt-0">
        <span className="text-gray-400 font-medium">Name:</span>
        <span className="font-bold text-white text-right">{data.fullName}</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Location:</span>
        <span className="font-bold text-gray-200 text-right">{data.state ? `${data.state}, ` : ''}{data.country || 'India'}</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Phone:</span>
        <span className="font-mono font-bold text-[#00ff88] text-right">
          {data.countryCode || '+91'} {data.mobile || ''}
        </span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Email:</span>
        <span className="font-medium text-gray-200 text-right">{data.email}</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Service:</span>
        <span className="font-bold text-white text-right">{data.service}</span>
      </div>
      <div className="pt-3">
        <span className="block text-gray-400 font-medium mb-1">Notes:</span>
        <p className="text-gray-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
          {data.requirements?.trim() || 'No additional requirements specified.'}
        </p>
      </div>
    </div>
  );
});

/**
 * Success Screen (Step 3 - Memoized)
 */
const SuccessConfirmation = memo(function SuccessConfirmation({ successData, onReset }) {
  return (
    <div className="text-center py-2 space-y-4 animate-in fade-in">
      <div className="w-14 h-14 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/40 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_25px_rgba(0,255,136,0.3)]">
        ✓
      </div>
      
      <div className="space-y-1">
        <span className="inline-block px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold tracking-widest uppercase">
          Booking Reference #{successData.bookingId}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Booking Submitted!
        </h2>
        <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
          We have received your request and our team will contact you shortly.
        </p>
      </div>

      {/* Direct WhatsApp Quick Action */}
      <div className="text-left my-2">
        <a
          href={`https://wa.me/919390662637?text=${encodeURIComponent(
            `Hi ARNE Works, I have submitted my creative project booking on your website.\n\n📌 *Booking Reference ID:* ${successData.bookingId}\n👤 *Client Name:* ${successData.fullName}\n🎬 *Selected Service:* ${successData.service}\n🌍 *Location:* ${successData.state ? successData.state + ', ' : ''}${successData.country || 'India'}\n📱 *Mobile / WhatsApp:* ${successData.mobile}\n✉️ *Gmail / Email:* ${successData.email}\n📝 *Requirements / Notes:* ${successData.requirements || 'None'}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] transition-all text-decoration-none"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <span className="block text-[9px] font-extrabold text-[#25D366] uppercase">Business WhatsApp</span>
              <span className="block text-sm font-bold text-white">Official Direct Support</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#25D366] text-right">Chat on WhatsApp ↗</span>
        </a>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer"
      >
        Submit Another Booking
      </button>
    </div>
  );
});

/**
 * Arne Stories — Highly Optimized 2-Step Booking Form
 * Uses react-hook-form to isolate input state and eliminate keystroke re-rendering lag.
 */
function BookingForm({ onSlotRequested, className = '' }) {
  // 1 = Form, 2 = Review, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('India');

  // Uncontrolled form state via react-hook-form
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      country: 'India',
      state: '',
      countryCode: '+91',
      service: '',
      requirements: ''
    }
  });

  // Dynamic States for currently selected country
  const availableStates = useMemo(() => {
    return COUNTRY_STATES_MAP[selectedCountry] || COUNTRY_STATES_MAP['Other'] || [];
  }, [selectedCountry]);

  // Services memo
  const servicesList = useMemo(() => ARNE_SERVICES, []);

  // Step 1 -> Step 2: Validate via react-hook-form and advance
  const handleProceedToReview = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(2);
  }, []);

  // Step 2 -> Step 1: Return to edit without losing form values
  const handleBackToEdit = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(1);
  }, []);

  // Step 2 -> Step 3: Confirm & Submit Verified Payload to Backend
  const handleFinalConfirmBooking = useCallback(async () => {
    setSubmissionError('');
    setLoading(true);

    const formValues = getValues();
    const rawDigits = (formValues.mobile || '').replace(/\D/g, '');
    const dialCode = (formValues.countryCode || '+91').replace(/[^0-9]/g, '');
    const formattedPhoneNumber = (formValues.mobile || '').startsWith('+') 
      ? `+${rawDigits}` 
      : (dialCode ? `+${dialCode}${rawDigits}` : `+${rawDigits}`);
    
    const countryVal = formValues.country || 'India';
    const stateVal = formValues.state || '';
    const cleanEmail = (formValues.email || '').trim().toLowerCase();
    const cleanNotes = (formValues.requirements || '').trim() || 'No additional requirements specified.';

    try {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const bookingId = `ARNE-2026-${randomCode}`;

      const bookingPayload = {
        bookingId: bookingId,
        id: bookingId,
        fullName: formValues.fullName.trim(),
        client_name: formValues.fullName.trim(),
        email: cleanEmail,
        client_email: cleanEmail,
        mobile: formattedPhoneNumber,
        client_phone: formattedPhoneNumber,
        country: countryVal,
        state: stateVal,
        client_country: countryVal,
        client_state: stateVal,
        service: formValues.service,
        service_type: formValues.service,
        requirements: cleanNotes,
        status: 'New Booking',
        booking_status: 'New Booking'
      };

      // 1. Direct Supabase Upsert
      try {
        await supabase.from('bookings').upsert([{
          id: bookingId,
          client_name: formValues.fullName.trim(),
          customer_name: formValues.fullName.trim(),
          client_email: cleanEmail,
          customer_email: cleanEmail,
          client_phone: formattedPhoneNumber,
          customer_phone: formattedPhoneNumber,
          customer_whatsapp: formattedPhoneNumber,
          country: countryVal,
          state: stateVal,
          client_country: countryVal,
          client_state: stateVal,
          service_type: formValues.service,
          service_name: formValues.service,
          project_desc: cleanNotes,
          status: 'New Booking',
          booking_status: 'New Booking',
          payment_status: 'Review Pending',
          created_at: new Date().toISOString()
        }]);
      } catch (sbErr) {
        console.warn('[Supabase Direct Notice]:', sbErr.message);
      }

      // 2. Dispatch to Backend API
      const response = await fetch('/api/complete-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking request.');
      }

      setBookingSuccessData({
        bookingId: data.bookingId || bookingId,
        fullName: formValues.fullName.trim(),
        service: formValues.service,
        email: cleanEmail,
        mobile: formattedPhoneNumber,
        requirements: cleanNotes
      });

      setCurrentStep(3);

      if (typeof onSlotRequested === 'function') {
        onSlotRequested(bookingPayload);
      }
    } catch (err) {
      console.error('[Booking Error]:', err);
      setSubmissionError(err.message || 'An unexpected error occurred while saving your request. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getValues, onSlotRequested]);

  const handleReset = useCallback(() => {
    reset();
    setBookingSuccessData(null);
    setCurrentStep(1);
  }, [reset]);

  const activeReviewData = useMemo(() => {
    return currentStep === 2 ? getValues() : null;
  }, [currentStep, getValues]);

  // First field error helper
  const firstError = errors.fullName?.message || errors.mobile?.message || errors.email?.message || errors.service?.message || submissionError;

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Background Ambient Glow */}
      <AmbientGlow />

      {/* Main Container */}
      <div className="relative rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(0,255,136,0.1)] transition-all">
        
        {/* Step Progress Indicator */}
        <StepProgressBar step={currentStep} />

        {/* Validation Alert Box */}
        {firstError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{firstError}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CLIENT DETAILS FORM (react-hook-form Uncontrolled Inputs)          */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[11px] font-bold tracking-widest uppercase mb-2">
                <span>⚡</span> Step 1 of 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                BOOK YOUR SLOT
              </h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Fill in your details below, then review them before final confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleProceedToReview)} className="space-y-4">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  {...register('fullName', {
                    required: 'Please enter your full name.',
                    minLength: { value: 2, message: 'Full name must be at least 2 characters.' }
                  })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all"
                />
              </div>

              {/* Field 2 & 3: Country & State / Province (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Country <span className="text-[#00ff88]">*</span>
                  </label>
                  <select
                    {...register('country', { required: 'Please select your country.' })}
                    defaultValue="India"
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setValue('country', e.target.value);
                      setValue('state', '');
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c100e] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all cursor-pointer"
                  >
                    <option value="India">🇮🇳 India (+91)</option>
                    <option value="United States">🇺🇸 United States (+1)</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom (+44)</option>
                    <option value="United Arab Emirates">🇦🇪 United Arab Emirates (+971)</option>
                    <option value="Canada">🇨🇦 Canada (+1)</option>
                    <option value="Australia">🇦🇺 Australia (+61)</option>
                    <option value="Singapore">🇸🇬 Singapore (+65)</option>
                    <option value="Germany">🇩🇪 Germany (+49)</option>
                    <option value="Saudi Arabia">🇸🇦 Saudi Arabia (+966)</option>
                    <option value="Qatar">🇶🇦 Qatar (+974)</option>
                    <option value="Kuwait">🇰🇼 Kuwait (+965)</option>
                    <option value="Malaysia">🇲🇾 Malaysia (+60)</option>
                    <option value="New Zealand">🇳🇿 New Zealand (+64)</option>
                    <option value="France">🇫🇷 France (+33)</option>
                    <option value="Netherlands">🇳🇱 Netherlands (+31)</option>
                    <option value="Ireland">🇮🇪 Ireland (+353)</option>
                    <option value="South Africa">🇿🇦 South Africa (+27)</option>
                    <option value="Other">🌐 Other Country</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    State / Province <span className="text-[#00ff88]">*</span>
                  </label>
                  <select
                    {...register('state', { required: 'Please select your State / Province.' })}
                    defaultValue=""
                    className="w-full px-4 py-3 rounded-xl bg-[#0c100e] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Choose State / Province --</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 4 & 5: Mobile Number (International) & Client Gmail (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Mobile Number (WhatsApp) <span className="text-[#00ff88]">*</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88] transition-all overflow-hidden">
                    <select
                      {...register('countryCode')}
                      defaultValue="+91"
                      className="px-2.5 py-3 text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border-r border-white/10 outline-none cursor-pointer"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+64">🇳🇿 +64</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+31">🇳🇱 +31</option>
                      <option value="+353">🇮🇪 +353</option>
                      <option value="+27">🇿🇦 +27</option>
                      <option value="+">🌐 +</option>
                    </select>
                    <input
                      type="tel"
                      placeholder=""
                      maxLength={15}
                      inputMode="tel"
                      {...register('mobile', {
                        required: 'Please enter your mobile number.',
                        minLength: { value: 6, message: 'Enter a valid mobile number.' }
                      })}
                      className="w-full px-3 py-3 bg-transparent text-white text-sm outline-none placeholder-gray-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Client Gmail <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder=""
                    {...register('email', {
                      required: 'Please enter your email address.',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Please enter a valid Gmail / email address.'
                      }
                    })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Field 4: Select Service */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Select Service <span className="text-[#00ff88]">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('service', { required: 'Please select a creative service.' })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c100e] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-500">-- Select a Creative Service --</option>
                    {servicesList.map((srv, idx) => (
                      <option key={idx} value={srv} className="text-white bg-[#0c100e]">
                        {srv}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Field 5: Project Requirements */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Requirements / Project Notes <span className="text-[#00ff88]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder=""
                  {...register('requirements', { required: 'Please enter your project requirements / notes.' })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all resize-none"
                />
                {errors.requirements && (
                  <span className="text-[11px] text-red-400 mt-1 block">
                    {errors.requirements.message}
                  </span>
                )}
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 py-1 px-0.5 cursor-pointer select-none text-left">
                  <input
                    type="checkbox"
                    {...register('agreeTerms', { required: 'You must agree to the Terms & Conditions and Privacy Policy.' })}
                    className="w-4 h-4 rounded border-gray-600 text-[#00ff88] focus:ring-[#00ff88] bg-black/40 cursor-pointer accent-[#00ff88] flex-shrink-0"
                  />
                  <span className="text-xs text-gray-300 font-medium">
                    I agree to the{' '}
                    <a href="/terms.html" target="_blank" className="text-[#00ff88] underline underline-offset-2 font-semibold hover:text-white transition-colors">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy.html" target="_blank" className="text-[#00ff88] underline underline-offset-2 font-semibold hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                    .<span className="text-[#00ff88] font-bold"> *</span>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <span className="text-[11px] text-red-400 mt-1 block">
                    {errors.agreeTerms.message}
                  </span>
                )}
              </div>

              {/* Step 1 CTA: Review Booking Details */}
              <button
                type="submit"
                className="w-full mt-2 py-4 px-6 rounded-xl font-extrabold text-xs uppercase tracking-widest bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black hover:opacity-95 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Review Booking Details</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: "CHECK AT ONCE" REVIEW SCREEN                                     */}
        {/* ========================================================================= */}
        {currentStep === 2 && activeReviewData && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-extrabold tracking-widest uppercase mb-2">
                <span>🔍</span> Step 2 of 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Please Review Your Details
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Please check your information once before confirming.
              </p>
            </div>

            {/* Summary Review Card */}
            <ReviewCard data={activeReviewData} />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToEdit}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                ← Edit Details
              </button>

              <button
                type="button"
                onClick={handleFinalConfirmBooking}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Sending Confirmation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Book Now</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINAL SUCCESS CONFIRMATION SCREEN                                 */}
        {/* ========================================================================= */}
        {currentStep === 3 && bookingSuccessData && (
          <SuccessConfirmation successData={bookingSuccessData} onReset={handleReset} />
        )}

      </div>
    </div>
  );
}

export default memo(BookingForm);
