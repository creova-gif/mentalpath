import { useState, useEffect } from 'react';
import { projectId } from '/utils/supabase/info';
import { supabase, authHeaders } from '@/utils/supabase/client';

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
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d1a502d`;

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`${SERVER_URL}/trial/${session.user.id}`, {
          headers: await authHeaders(),
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
export async function startTrial(): Promise<void> {
  try {
    // The server derives user id + email from the verified access token.
    const response = await fetch(`${SERVER_URL}/trial/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      },
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

// Reset trial (for testing purposes)
export function resetTrial(): void {
  try {
    // Trials are keyed to the authenticated user server-side; the only local
    // state left to clear is the legacy anonymous id from older builds.
    localStorage.removeItem('mentalpath_user_id');
    window.location.reload();
  } catch (error) {
    console.error('Error resetting trial:', error);
  }
}

// Get trial info
export async function getTrialInfo(): Promise<any> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const response = await fetch(`${SERVER_URL}/trial/${session.user.id}`, {
      headers: await authHeaders(),
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