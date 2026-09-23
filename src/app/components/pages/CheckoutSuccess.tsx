import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle, ArrowRight, Calendar, CreditCard } from 'lucide-react';

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'solo'; // Get plan from URL params

  useEffect(() => {
    // Plan activation is NOT done from the browser. Entitlements are granted
    // only by the verified Stripe webhook once payment actually succeeds.

    // Fire confetti on mount - simple inline version to avoid import issues
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Create simple confetti effect with DOM elements
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = ['#4a7c6f', '#6b9d8f', '#8fb5a9'][Math.floor(Math.random() * 3)];
        particle.style.left = randomInRange(0, window.innerWidth) + 'px';
        particle.style.top = '-20px';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.transition = 'all 3s ease-out';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
          particle.style.top = window.innerHeight + 'px';
          particle.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
          particle.remove();
        }, 3000);
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [plan]);

  return (
    <div className="min-h-screen bg-[var(--warm)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--border)] p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[var(--sage-pale)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[var(--sage)]" />
          </div>

          {/* Heading */}
          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--ink)] mb-4">
            Welcome to MentalPath! 🎉
          </h1>
          
          <p className="text-lg text-[var(--ink-soft)] mb-8 max-w-md mx-auto">
            Your subscription is active. Your 7-day free trial starts now.
          </p>

          {/* What's Next Section */}
          <div className="bg-[var(--warm)] rounded-xl p-6 mb-8 text-left">
            <h2 className="font-medium text-[var(--ink)] mb-4 text-center">What's next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-sm font-medium text-[var(--sage)]">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--ink)] text-sm mb-1">Complete your profile</h3>
                  <p className="text-sm text-[var(--ink-muted)]">Add your practice details, licensing info, and availability</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-sm font-medium text-[var(--sage)]">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--ink)] text-sm mb-1">Add your first client</h3>
                  <p className="text-sm text-[var(--ink-muted)]">Start tracking sessions, notes, and billing</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-sm font-medium text-[var(--sage)]">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--ink)] text-sm mb-1">Share your client portal</h3>
                  <p className="text-sm text-[var(--ink-muted)]">Let clients book sessions and complete intake forms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-[var(--sage)] text-white px-4 py-3 rounded-lg hover:bg-[var(--sage-deep)] transition-colors text-sm font-medium"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/dashboard/settings"
              className="flex items-center justify-center gap-2 bg-white border border-[var(--border)] text-[var(--ink)] px-4 py-3 rounded-lg hover:bg-[var(--warm)] transition-colors text-sm font-medium"
            >
              <CreditCard className="w-4 h-4" />
              View Receipt
            </Link>
            
            <Link
              to="/dashboard/calendar"
              className="flex items-center justify-center gap-2 bg-white border border-[var(--border)] text-[var(--ink)] px-4 py-3 rounded-lg hover:bg-[var(--warm)] transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              Book Session
            </Link>
          </div>

          {/* Support */}
          <div className="text-sm text-[var(--ink-muted)]">
            Need help getting started?{' '}
            <Link to="/support" className="text-[var(--sage)] hover:underline">
              Contact our support team
            </Link>{' '}
            or{' '}
            <a href="https://help.mentalpath.ca" target="_blank" rel="noopener noreferrer" className="text-[var(--sage)] hover:underline">
              view the knowledge base
            </a>
          </div>
        </div>

        {/* Trial Info */}
        <div className="mt-6 text-center text-sm text-[var(--ink-muted)]">
          <p>
            Your free trial ends on{' '}
            <strong className="text-[var(--ink)]">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </strong>
            . You can cancel anytime from Settings.
          </p>
        </div>
      </div>
    </div>
  );
}