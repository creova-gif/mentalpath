import { useState, useEffect } from 'react';
import { SERVER_URL, SUPABASE_ANON_KEY } from '../../utils/supabase/config';

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  startDate: Date | null;
  endDate: Date | null;
  hasActivePlan: boolean;
  planType?: 'solo' | 'group';
}

const TRIAL_DURATION_DAYS = 7;

// Get userId from localStorage (in production, this would come from auth)
function getUserId(): string {
  let userId = localStorage.getItem('mentalpath_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mentalpath_user_id', userId);
  }
  return userId;
}

export function useTrialStatus(): TrialStatus {
  const [status, setStatus] = useState<TrialStatus>({
    isActive: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    isExpired: false,
    startDate: null,
    endDate: null,
    hasActivePlan: false,
  });

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const userId = getUserId();
        
        const response = await fetch(`${SERVER_URL}/trial/${userId}`, {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch trial status:', response.statusText);
          return;
        }

        const data = await response.json();

        if (data.hasActivePlan && data.subscription) {
          // User has active subscription
          setStatus({
            isActive: false,
            daysRemaining: 0,
            hoursRemaining: 0,
            isExpired: false,
            startDate: null,
            endDate: null,
            hasActivePlan: true,
            planType: data.subscription.planType,
          });
        } else if (data.trial) {
          // User has trial
          setStatus({
            isActive: data.trial.isActive,
            daysRemaining: data.trial.daysRemaining,
            hoursRemaining: data.trial.hoursRemaining,
            isExpired: data.trial.isExpired,
            startDate: data.trial.startDate ? new Date(data.trial.startDate) : null,
            endDate: data.trial.endDate ? new Date(data.trial.endDate) : null,
            hasActivePlan: false,
          });
        } else {
          // No trial or subscription
          setStatus({
            isActive: false,
            daysRemaining: TRIAL_DURATION_DAYS,
            hoursRemaining: TRIAL_DURATION_DAYS * 24,
            isExpired: false,
            startDate: null,
            endDate: null,
            hasActivePlan: false,
          });
        }
      } catch (error) {
        console.error('Error fetching trial status:', error);
      }
    };

    fetchTrialStatus();

    // Update every minute to keep countdown accurate
    const interval = setInterval(fetchTrialStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

// Start a new trial
export async function startTrial(email: string): Promise<void> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${SERVER_URL}/trial/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ userId, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to start trial:', data.error);
      return;
    }

    console.log('Trial started successfully:', data);
  } catch (error) {
    console.error('Error starting trial:', error);
  }
}

// Activate a paid plan (ends trial)
export async function activatePlan(
  planType: 'solo' | 'group',
  email: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${SERVER_URL}/trial/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userId,
        email,
        planType,
        stripeCustomerId,
        stripeSubscriptionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to activate plan:', data.error);
      return;
    }

    console.log('Plan activated successfully:', data);
  } catch (error) {
    console.error('Error activating plan:', error);
  }
}

// Reset trial (for testing purposes)
export function resetTrial(): void {
  try {
    localStorage.removeItem('mentalpath_user_id');
    console.log('Trial reset - user ID cleared');
    window.location.reload();
  } catch (error) {
    console.error('Error resetting trial:', error);
  }
}

// Get trial info
export async function getTrialInfo(): Promise<any> {
  try {
    const userId = getUserId();
    
    const response = await fetch(`${SERVER_URL}/trial/${userId}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get trial info:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting trial info:', error);
    return null;
  }
}