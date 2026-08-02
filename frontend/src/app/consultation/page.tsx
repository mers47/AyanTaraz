'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar, FiClock, FiDollarSign, FiUser, FiPhone, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { consultationApi } from '@/lib/api';
import { ConsultationService, ConsultationSlot } from '@/types';

export default function ConsultationPage() {
  const [services, setServices] = useState<ConsultationService[]>([]);
  const [selectedService, setSelectedService] = useState<ConsultationService | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<ConsultationSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlot | null>(null);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'service' | 'date' | 'slot' | 'details' | 'confirmation'>('service');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await consultationApi.getServices(true);
        setServices(response.data);
        if (response.data.length > 0) {
          setSelectedService(response.data[0]);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (!selectedService) return;

    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await consultationApi.getAvailability(
          selectedService.id,
          dateStr
        );
        setAvailableSlots(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load available slots');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedDate]);

  const handleServiceSelect = (service: ConsultationService) => {
    setSelectedService(service);
    setStep('date');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('slot');
  };

  const handleSlotSelect = (slot: ConsultationSlot) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedSlot || !phone || !otpCode) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await consultationApi.createBooking({
        serviceId: selectedService.id,
        slotId: selectedSlot.id,
        phone,
        otpCode,
        notes,
      });

      setSuccess('Booking confirmed successfully!');
      setStep('confirmation');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  if (isLoading && step === 'service') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-gray-400 mb-6">{success}</p>

              <div className="space-y-4 text-left">
                <div className="flex items-center p-4 bg-gray-800 rounded-lg">
                  <FiCalendar className="w-5 h-5 text-gold-400 mr-3" />
                  <div>
                    <p className="font-medium">{selectedService?.name}</p>
                    <p className="text-gray-400 text-sm">{formatDate(selectedDate)}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-800 rounded-lg">
                  <FiClock className="w-5 h-5 text-gold-400 mr-3" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-400 text-sm">
                      {selectedSlot?.startTime && formatTime(selectedSlot.startTime)} - 
                      {selectedSlot?.endTime && formatTime(selectedSlot.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-800 rounded-lg">
                  <FiPhone className="w-5 h-5 text-gold-400 mr-3" />
                  <div>
                    <p className="font-medium">Contact</p>
                    <p className="text-gray-400 text-sm">{phone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/" className="btn btn-primary">
                  Back to Home
                </Link>
                <Link href="/my-bookings" className="btn btn-outline">
                  View My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="flex items-center text-gold-400 hover:text-gold-300 transition-colors">
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {['Service', 'Date', 'Time', 'Details'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      step === 'service' && index === 0 ? 'bg-gold-500 text-black' :
                      step === 'date' && index === 1 ? 'bg-gold-500 text-black' :
                      step === 'slot' && index === 2 ? 'bg-gold-500 text-black' :
                      step === 'details' && index === 3 ? 'bg-gold-500 text-black' :
                      'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-sm mt-2 hidden sm:block ${
                    step === 'service' && index === 0 ? 'text-gold-400' :
                    step === 'date' && index === 1 ? 'text-gold-400' :
                    step === 'slot' && index === 2 ? 'text-gold-400' :
                    step === 'details' && index === 3 ? 'text-gold-400' :
                    'text-gray-400'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-full h-1 mx-2 rounded transition-all duration-300 ${
                    step === 'service' && index === 0 ? 'bg-gold-500' :
                    step === 'date' && index === 1 ? 'bg-gold-500' :
                    step === 'slot' && index === 2 ? 'bg-gold-500' :
                    'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Service Selection */}
          {step === 'service' && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Select a Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`p-6 rounded-lg border-2 text-left transition-all duration-200 ${
                      selectedService?.id === service.id
                        ? 'border-gold-500 bg-gold-500 bg-opacity-10'
                        : 'border-gray-700 hover:border-gold-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{service.name}</h3>
                      <span className="text-gold-400 font-bold">
                        {service.price ? `${(service.price / 1000000).toFixed(0)}M IRR` : 'Free'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiClock className="w-4 h-4 mr-2" />
                      <span>{service.duration} minutes</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          {step === 'date' && selectedService && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Select a Date</h2>
                <button
                  onClick={() => setStep('service')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Change Service
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Available dates for {selectedService.name}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getNext7Days().map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                      selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]
                        ? 'border-gold-500 bg-gold-500 bg-opacity-10'
                        : 'border-gray-700 hover:border-gold-500'
                    }`}
                  >
                    <p className="font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-2xl font-bold">{date.getDate()}</p>
                    <p className="text-gray-400 text-xs">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Slot Selection */}
          {step === 'slot' && selectedService && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Select a Time Slot</h2>
                <button
                  onClick={() => setStep('date')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Change Date
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Available slots for {selectedService.name} on {formatDate(selectedDate)}
              </p>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" />
                  <p className="text-gray-400">Loading available slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                        selectedSlot?.id === slot.id
                          ? 'border-gold-500 bg-gold-500 bg-opacity-10'
                          : 'border-gray-700 hover:border-gold-500'
                      }`}
                    >
                      <p className="font-bold">
                        {slot.startTime && formatTime(slot.startTime)} - 
                        {slot.endTime && formatTime(slot.endTime)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {slot.maxBookings - (availableSlots.filter(s => s.id === slot.id).length || 0)} slots available
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiAlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No available slots for this date</p>
                  <button
                    onClick={() => setStep('date')}
                    className="btn btn-outline mt-4"
                  >
                    Choose Different Date
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Details Form */}
          {step === 'details' && selectedService && selectedSlot && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Details</h2>
                <button
                  onClick={() => setStep('slot')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Change Time
                </button>
              </div>

              {/* Booking Summary */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span>
                      {selectedSlot.startTime && formatTime(selectedSlot.startTime)} - 
                      {selectedSlot.endTime && formatTime(selectedSlot.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span>{selectedService.duration} minutes</span>
                  </div>
                  {selectedService.price && (
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-gold-400">
                        {(selectedService.price / 1000000).toFixed(0)}M IRR
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="label">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+989123456789"
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="otp" className="label">
                      OTP Code (sent to your phone)
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="otp"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="input pl-12"
                        required
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      We&apos;ll send you an OTP code to verify your booking
                    </p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="label">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or questions..."
                      rows={3}
                      className="input resize-none"
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      <FiAlertCircle className="w-5 h-5 inline mr-2" />
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                  >
                    {isLoading ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black border-r-transparent" />
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
