import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReferrals } from '../../hooks/useReferralAPI';
import type { FilterOptions } from '../../types/referral';
import {
  formatCurrency,
  formatDate,
  shortenAddress,
  getStatusColor,
  getStatusIcon,
  debounce,
} from '../../utils/helpers';

interface MobileReferralListProps {
  userId: string;
}

export const MobileReferralList: React.FC<MobileReferralListProps> = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const { referrals, paginationData, loading, error, refetch } = useReferrals(
    userId,
    filters,
    { page, pageSize }
  );

  const observerTarget = useRef(null);

  const handleFilterChange = debounce((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('searchQuery', e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? undefined : (status as any),
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const loadMore = useCallback(() => {
    if (paginationData && page < paginationData.totalPages && !loading) {
      setPage((p) => p + 1);
    }
  }, [paginationData, page, loading]);

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Referrals</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              onChange={handleSearch}
              placeholder="Search by wallet or email..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bnb-secondary500 focus:border-transparent outline-none"
              style={{ minHeight: '44px' }}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">Status</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusFilter('pending')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                        filters.status === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusFilter('paid')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                        filters.status === 'paid'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      Paid
                    </button>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-all"
                    style={{ minHeight: '44px' }}
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Referral Cards */}
      <div className="p-4 space-y-3">
        {loading && page === 1 ? (
          <div className="py-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-4"
            >
              <svg className="h-12 w-12 text-bnb-secondary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </motion.div>
            <p className="text-gray-600">Loading referrals...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="text-red-500 mb-4 text-5xl">⚠️</div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-red-600 text-white rounded-lg active:bg-red-700"
              style={{ minHeight: '44px' }}
            >
              Try Again
            </button>
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-gray-400 mb-4 text-5xl">👥</div>
            <p className="text-gray-600 font-medium mb-2">No referrals yet</p>
            <p className="text-gray-500 text-sm px-8">
              Start sharing your referral link to earn rewards!
            </p>
          </div>
        ) : (
          <>
            {referrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedReferral(referral)}
                className="bg-white rounded-xl shadow-sm p-4 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-bnb-secondary400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {referral.referredUser.name
                        ? referral.referredUser.name.charAt(0).toUpperCase()
                        : referral.referredUser.email
                        ? referral.referredUser.email.charAt(0).toUpperCase()
                        : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {referral.referredUser.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 font-mono truncate">
                        {referral.referredUser.wallet
                          ? shortenAddress(referral.referredUser.wallet)
                          : referral.referredUser.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      referral.status
                    )}`}
                  >
                    {getStatusIcon(referral.status)} {referral.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Purchase</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(referral.purchaseAmount)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Your Earnings</p>
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(referral.commissionAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{referral.commissionPercentage}% commission</span>
                  <span>{formatDate(referral.createdAt)}</span>
                </div>
              </motion.div>
            ))}

            {/* Infinite Scroll Trigger */}
            {paginationData && page < paginationData.totalPages && (
              <div ref={observerTarget} className="py-4 text-center">
                {loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mx-auto"
                  >
                    <svg className="h-8 w-8 text-bnb-secondary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Referral Detail Modal */}
      <AnimatePresence>
        {selectedReferral && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReferral(null)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl md:rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Referral Details</h3>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="p-2 bg-gray-100 rounded-full active:bg-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-12 w-12 bg-gradient-to-br from-bnb-secondary400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedReferral.referredUser.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedReferral.referredUser.name || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                      {selectedReferral.referredUser.wallet
                        ? shortenAddress(selectedReferral.referredUser.wallet)
                        : selectedReferral.referredUser.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Purchase Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedReferral.purchaseAmount)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Your Commission</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedReferral.commissionAmount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Commission Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedReferral.commissionPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedReferral.status
                      )}`}
                    >
                      {getStatusIcon(selectedReferral.status)} {selectedReferral.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(selectedReferral.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
