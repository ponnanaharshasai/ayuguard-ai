import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AdherenceContext = createContext();

export const useAdherence = () => useContext(AdherenceContext);

export function AdherenceProvider({ children }) {
  const { user, apiFetch } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [missedCount, setMissedCount] = useState(0);
  const [adherenceScore, setAdherenceScore] = useState(null);
  const [allAlerts, setAllAlerts] = useState([]);

  const fetchMissedAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const missed = await apiFetch('/api/alerts/missed');
      setAlerts(missed);
      setMissedCount(missed.length);
    } catch (e) {
      console.error('Failed to fetch missed alerts', e);
      setAlerts([]);
      setMissedCount(0);
    }
  }, [user, apiFetch]);

  const fetchAdherenceScore = useCallback(async () => {
    if (!user) return;
    try {
      const score = await apiFetch('/api/adherence/score?days=7');
      setAdherenceScore(score);
    } catch (e) {
      console.error('Failed to fetch adherence score', e);
    }
  }, [user, apiFetch]);

  const fetchAllAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch('/api/alerts?unread_only=true&limit=20');
      setAllAlerts(data);
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    }
  }, [user, apiFetch]);

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchMissedAlerts(),
      fetchAdherenceScore(),
      fetchAllAlerts()
    ]);
  }, [fetchMissedAlerts, fetchAdherenceScore, fetchAllAlerts]);

  useEffect(() => {
    if (user) {
      refresh();
      const interval = setInterval(refresh, 60000); // Refresh every minute
      return () => clearInterval(interval);
    } else {
      setAlerts([]);
      setMissedCount(0);
      setAdherenceScore(null);
      setAllAlerts([]);
    }
  }, [user, refresh]);

  return (
    <AdherenceContext.Provider value={{ 
      alerts, missedCount, adherenceScore, allAlerts, refresh 
    }}>
      {children}
    </AdherenceContext.Provider>
  );
}
