import { useState, useEffect, useCallback } from 'react';
import type {
  ReferralStats,
  Referral,
  RewardClaim,
  UserSettings,
  ReferralLink,
  FilterOptions,
  PaginationData,
} from '../types/referral';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const useReferralStats = (userId: string) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/referrals/stats?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useReferrals = (
  userId: string,
  filters?: FilterOptions,
  pagination?: { page: number; pageSize: number }
) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        page: String(pagination?.page || 1),
        pageSize: String(pagination?.pageSize || 10),
        ...filters,
      });

      const response = await fetch(`${API_BASE}/referrals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch referrals');
      const data = await response.json();

      setReferrals(data.referrals);
      setPaginationData(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, filters, pagination]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return { referrals, paginationData, loading, error, refetch: fetchReferrals };
};

export const useReferralLink = (userId: string) => {
  const [link, setLink] = useState<ReferralLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLink = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/referrals/link?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch referral link');
      const data = await response.json();
      setLink(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLink();
  }, [fetchLink]);

  return { link, loading, error, refetch: fetchLink };
};

export const useRewardClaims = (userId: string) => {
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/referrals/claims?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setClaims(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const claimRewards = useCallback(async (amount: number, rewardType: 'USDT' | 'HYPE') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/referrals/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, rewardType }),
      });

      if (!response.ok) throw new Error('Failed to claim rewards');
      const data = await response.json();

      await fetchClaims();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchClaims]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return { claims, loading, error, claimRewards, refetch: fetchClaims };
};

export const useUserSettings = (userId: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/referrals/settings?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/referrals/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      const data = await response.json();
      setSettings(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, updateSettings, refetch: fetchSettings };
};
