'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const contactInfo = {
  phone: '+98 (21) 1234 5678',
  email: 'info@ayantaraz.ir',
  address: 'No. 123, Vali Asr St, Tehran, Iran',
  hours: 'Saturday - Thursday: 9:00 AM - 6:00 PM',
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Failed to send your message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-300">
              We&apos;re here to help. Get in touch with our team today.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Contact Information</h2>
              <p className="text-gray-400 mb-8">
                Have questions or need assistance? Reach out to us using any of the methods below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mr-4 flex-shrink-0">
                    <FiPhone className="w-6 h-6 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Phone</h3>
                    <p className="text-gray-300">{contactInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mr-4 flex-shrink-0">
                    <FiMail className="w-6 h-6 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Email</h3>
                    <p className="text-gray-300">{contactInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mr-4 flex-shrink-0">
                    <FiMapPin className="w-6 h-6 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Address</h3>
                    <p className="text-gray-300">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-gold-500 bg-opacity-20 flex items-center justify-center mr-4 flex-shrink-0">
                    <FiClock className="w-6 h-6 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-300">{contactInfo.hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative h-96 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
                alt="Our Office Location"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Ayan Taraz Office</h3>
                  <p className="text-lg">{contactInfo.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">Send Us a Message</h2>
            <p className="text-gray-400 text-center mb-8">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg ${submitStatus.success ? 'bg-green-500 bg-opacity-20 border border-green-500 text-green-400' : 'bg-red-500 bg-opacity-20 border border-red-500 text-red-400'}`}>
                <div className="flex items-center">
                  {submitStatus.success ? (
                    <FiCheckCircle className="w-5 h-5 mr-3" />
                  ) : (
                    <FiAlertCircle className="w-5 h-5 mr-3" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+989123456789"
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="label">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Tax Consultation Inquiry"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows={5}
                  className="input resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black border-r-transparent" />
                ) : (
                  <>
                    <FiSend className="w-5 h-5 inline mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gray-900 bg-opacity-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: 'What services do you offer?',
                answer: 'We offer comprehensive accounting services, tax consultation, business advisory, and financial planning services tailored to your needs.',
              },
              {
                question: 'How can I book a consultation?',
                answer: 'You can book a consultation through our website by visiting the Consultation page, selecting a service and available time slot, and providing your contact information.',
              },
              {
                question: 'What are your fees?',
                answer: 'Our fees vary depending on the service and complexity of your needs. We offer transparent pricing and will provide a detailed quote before starting any work.',
              },
              {
                question: 'Do you offer tax planning services?',
                answer: 'Yes, tax planning is one of our core services. We help individuals and businesses develop strategies to minimize tax liabilities while ensuring compliance with all regulations.',
              },
              {
                question: 'How quickly can you respond to my inquiry?',
                answer: 'We strive to respond to all inquiries within 24 hours. For urgent matters, please call us directly during business hours.',
              },
            ].map((faq, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
