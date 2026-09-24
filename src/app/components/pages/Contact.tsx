import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const CONTACT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d1a502d/contact`;

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Public endpoint: the anon key only satisfies the Functions gateway; it
      // grants no data access (contact_messages is service-role only).
      const response = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...formData, website: honeypot }),
      });

      if (response.ok) {
        toast.success('Message sent! We\'ll reply by email.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'general',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please email us directly at support@mentalpath.ca');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--warm)]">
      {/* Header */}
      <div className="bg-[var(--sage-deep)] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-white/80">
            Have questions? We're here to help you succeed.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Methods */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 space-y-6">
              <div>
                <h3 className="font-medium text-[var(--ink)] mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <a 
                    href="mailto:support@mentalpath.ca"
                    className="flex items-start gap-3 text-[var(--ink-soft)] hover:text-[var(--sage)] transition-colors group"
                  >
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm font-medium text-[var(--ink)]">Email</div>
                      <div className="text-sm">support@mentalpath.ca</div>
                    </div>
                  </a>

                  <a 
                    href="tel:+14161234567"
                    className="flex items-start gap-3 text-[var(--ink-soft)] hover:text-[var(--sage)] transition-colors group"
                  >
                    <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm font-medium text-[var(--ink)]">Phone</div>
                      <div className="text-sm">+1 (416) 123-4567</div>
                      <div className="text-xs text-[var(--ink-muted)]">Mon-Fri, 9am-5pm ET</div>
                    </div>
                  </a>

                  <div className="flex items-start gap-3 text-[var(--ink-soft)]">
                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-[var(--ink)]">Address</div>
                      <div className="text-sm">
                        123 Queen Street West<br />
                        Toronto, ON M5H 2M9<br />
                        Canada
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)]">
                <button
                  onClick={() => alert('Live chat coming soon! For now, email support@mentalpath.ca')}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--sage)] text-white px-4 py-3 rounded-lg hover:bg-[var(--sage-deep)] transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Live Chat
                </button>
                <p className="text-xs text-[var(--ink-muted)] text-center mt-2">
                  Instant support during business hours
                </p>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-[var(--sage-pale)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[var(--sage-deep)]" />
                <h3 className="font-medium text-[var(--sage-deep)]">Response Times</h3>
              </div>
              <div className="space-y-2 text-sm text-[var(--sage-deep)]">
                <div className="flex justify-between">
                  <span>Email (Starter)</span>
                  <strong>24 hours</strong>
                </div>
                <div className="flex justify-between">
                  <span>Email (Solo/Group)</span>
                  <strong>4 hours</strong>
                </div>
                <div className="flex justify-between">
                  <span>Live Chat</span>
                  <strong>&lt; 5 minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Phone</span>
                  <strong>Immediate</strong>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <Link
              to="/faq"
              className="block bg-white rounded-xl border border-[var(--border)] p-4 hover:bg-[var(--warm)] transition-colors text-center"
            >
              <p className="text-sm text-[var(--ink-soft)] mb-1">Looking for quick answers?</p>
              <p className="text-[var(--sage)] font-medium">Browse our FAQ →</p>
            </Link>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[var(--border)] p-8">
              <h2 className="font-[var(--font-display)] text-2xl text-[var(--ink)] mb-2">
                Send us a message
              </h2>
              <p className="text-[var(--ink-soft)] mb-6">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Spam trap: hidden from people and assistive tech */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={honeypot} onChange={e => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }} />
                <p className="text-xs text-[var(--ink-muted)]">Please don't include client health information in this form.</p>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                    Your Name <span className="text-[var(--sage)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                      Email Address <span className="text-[var(--sage)]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (416) 000-0000"
                      className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                    Subject <span className="text-[var(--sage)]">*</span>
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)]"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                    Message <span className="text-[var(--sage)]">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] outline-none transition-all focus:border-[var(--sage)] focus:shadow-[0_0_0_3px_rgba(74,124,111,0.08)] resize-y"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 bg-[var(--sage)] text-white rounded-lg font-medium hover:bg-[var(--sage-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-[var(--ink-muted)]">
                  By submitting this form, you agree to our{' '}
                  <Link to="/privacy" className="text-[var(--sage)] hover:underline">
                    Privacy Policy
                  </Link>
                  . We'll only use your information to respond to your inquiry.
                </p>
              </form>
            </div>

            {/* Additional Help */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/faq"
                className="bg-white rounded-xl border border-[var(--border)] p-5 hover:bg-[var(--warm)] transition-colors"
              >
                <h3 className="font-medium text-[var(--ink)] mb-1">Browse FAQ</h3>
                <p className="text-sm text-[var(--ink-muted)]">
                  Find instant answers to common questions
                </p>
              </Link>

              <a
                href="https://help.mentalpath.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-[var(--border)] p-5 hover:bg-[var(--warm)] transition-colors"
              >
                <h3 className="font-medium text-[var(--ink)] mb-1">Knowledge Base</h3>
                <p className="text-sm text-[var(--ink-muted)]">
                  Step-by-step guides and video tutorials
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--sage)] hover:underline"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}