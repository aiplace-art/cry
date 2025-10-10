/**
 * Complete Integration Example: Intelligent Presale Component
 * Demonstrates all intelligent features working together
 */

import React, { useState, useEffect } from 'react';
import {
  useCalculator,
  useAnalytics,
  useRecommendations,
  useLiveUpdates
} from '../hooks';
import type { Recommendation } from '../types/presale';

export function IntelligentPresale() {
  // State
  const [amount, setAmount] = useState<number>(1000);
  const [inputType, setInputType] = useState<'USD' | 'BNB'>('USD');
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Smart Calculator
  const {
    calculateFromUSD,
    calculateFromBNB,
    result,
    priceData,
    loading: calcLoading
  } = useCalculator();

  // Analytics
  const {
    trackWalletConnection,
    visitorStats,
    funnelData
  } = useAnalytics();

  // Recommendations
  const {
    recommendations,
    fomo,
    loading: recLoading,
    getSuggestedAmounts
  } = useRecommendations({
    currentInvestment: 0,
    walletConnected: false,
    previousVisits: 1,
    timeOnPage: 60,
    calculatorUsage: 1
  });

  // Live Updates
  const {
    updates,
    progress,
    stats,
    connected
  } = useLiveUpdates();

  // Calculate on amount change
  useEffect(() => {
    if (inputType === 'USD') {
      calculateFromUSD(amount);
    } else {
      calculateFromBNB(amount);
    }
  }, [amount, inputType, calculateFromUSD, calculateFromBNB]);

  // Suggested amounts
  const suggestedAmounts = getSuggestedAmounts();

  // Handle quick select
  const handleQuickSelect = (value: number) => {
    setAmount(value);
    setInputType('USD');
  };

  return (
    <div className="intelligent-presale">
      {/* Header with Live Stats */}
      <header className="presale-header">
        <div className="live-indicator">
          <span className={`dot ${connected ? 'connected' : 'disconnected'}`} />
          {connected ? 'Live' : 'Offline'}
        </div>

        <div className="stats-bar">
          <div className="stat">
            <span className="label">Online Now</span>
            <span className="value">{stats?.online || 0}</span>
          </div>
          <div className="stat">
            <span className="label">24h Purchases</span>
            <span className="value">{stats?.purchases24h || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Avg Investment</span>
            <span className="value">${stats?.avgInvestment.toLocaleString() || 0}</span>
          </div>
        </div>
      </header>

      {/* FOMO Trigger */}
      {fomo && (
        <div className={`fomo-banner urgency-${fomo.urgency}`}>
          <span className="icon">⚡</span>
          <span className="message">{fomo.message}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column: Calculator */}
        <div className="calculator-section">
          <h2>Calculate Your Investment</h2>

          {/* Price Display */}
          {priceData && (
            <div className="price-display">
              <div className="price-item">
                <span>BNB Price</span>
                <strong>${priceData.bnbPriceUSD.toFixed(2)}</strong>
              </div>
              <div className="price-item">
                <span>HYPEAI Price</span>
                <strong>${priceData.hypeaiPriceUSD.toFixed(6)}</strong>
              </div>
            </div>
          )}

          {/* Quick Select Buttons */}
          <div className="quick-select">
            {suggestedAmounts.map(({ amount: value, label, highlight }) => (
              <button
                key={value}
                className={`quick-btn ${highlight ? 'highlighted' : ''}`}
                onClick={() => handleQuickSelect(value)}
              >
                ${value.toLocaleString()}
                <small>{label}</small>
              </button>
            ))}
          </div>

          {/* Input Section */}
          <div className="input-section">
            <div className="input-type-toggle">
              <button
                className={inputType === 'USD' ? 'active' : ''}
                onClick={() => setInputType('USD')}
              >
                USD
              </button>
              <button
                className={inputType === 'BNB' ? 'active' : ''}
                onClick={() => setInputType('BNB')}
              >
                BNB
              </button>
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={`Enter ${inputType} amount`}
              className="amount-input"
            />
          </div>

          {/* Results Display */}
          {result && !calcLoading && (
            <div className="results">
              <div className="result-card primary">
                <h3>You'll Receive</h3>
                <div className="value">
                  {result.totalTokens.toLocaleString()}
                  <span className="unit">HYPEAI</span>
                </div>
              </div>

              <div className="result-details">
                <div className="detail">
                  <span>Base Tokens</span>
                  <span>{result.hypeaiTokens.toLocaleString()}</span>
                </div>
                <div className="detail bonus">
                  <span>Bonus Tokens</span>
                  <span>+{result.bonusTokens.toLocaleString()}</span>
                </div>
              </div>

              {/* VIP Tier Badge */}
              {result.vipTier && (
                <div className={`vip-badge tier-${result.vipTier.priority}`}>
                  <span className="crown">👑</span>
                  <span className="tier-name">{result.vipTier.name}</span>
                  <span className="bonus">{result.vipTier.bonusPercentage}% Bonus</span>

                  <ul className="benefits">
                    {result.vipTier.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ROI Projections */}
              <div className="roi-projections">
                <h4>Projected ROI</h4>
                <div className="projections-grid">
                  <div className="projection">
                    <span className="period">Week 1</span>
                    <span className="roi positive">
                      +{result.roi.week1.toFixed(0)}%
                    </span>
                  </div>
                  <div className="projection">
                    <span className="period">Month 1</span>
                    <span className="roi positive">
                      +{result.roi.month1.toFixed(0)}%
                    </span>
                  </div>
                  <div className="projection">
                    <span className="period">Month 6</span>
                    <span className="roi positive">
                      +{result.roi.month6.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buy Button */}
          <button className="buy-button">
            Buy HYPEAI Now
          </button>
        </div>

        {/* Right Column: Live Feed & Recommendations */}
        <div className="sidebar">
          {/* Progress Bar */}
          {progress && (
            <div className="progress-section">
              <h3>Presale Progress</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="progress-stats">
                <span>{progress.percentage.toFixed(2)}% Complete</span>
                <span>{progress.remaining.toLocaleString()} remaining</span>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {showRecommendations && recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>
                Smart Recommendations
                <button
                  className="toggle-btn"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                >
                  {showRecommendations ? '−' : '+'}
                </button>
              </h3>

              <div className="recommendations-list">
                {recommendations.map((rec: Recommendation) => (
                  <div key={rec.type} className={`recommendation ${rec.type}`}>
                    <div className="rec-header">
                      <span className="icon">{getRecommendationIcon(rec.type)}</span>
                      <h4>{rec.title}</h4>
                      <span className="confidence">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <p className="description">{rec.description}</p>
                    <div className="rec-footer">
                      <span className="value">{rec.value}</span>
                      <span className="reason">{rec.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Activity Feed */}
          <div className="live-feed-section">
            <h3>Live Activity</h3>
            <div className="feed-list">
              {updates.slice(0, 8).map((update, i) => (
                <div key={i} className={`feed-item ${update.type}`}>
                  <span className="icon">{getUpdateIcon(update.type)}</span>
                  <div className="content">
                    {update.type === 'purchase' && (
                      <>
                        <span className="amount">${update.data.amount}</span>
                        <span className="detail">from {update.data.country}</span>
                      </>
                    )}
                    {update.type === 'visitor' && (
                      <>
                        <span className="action">{update.data.action}</span>
                        <span className="count">{update.data.count} users</span>
                      </>
                    )}
                    {update.type === 'milestone' && (
                      <span className="milestone">{update.data.message}</span>
                    )}
                  </div>
                  <span className="time">{formatTime(update.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          {funnelData.length > 0 && (
            <div className="funnel-section">
              <h3>Conversion Funnel</h3>
              <div className="funnel-stages">
                {funnelData.map((stage) => (
                  <div key={stage.name} className="funnel-stage">
                    <div className="stage-bar">
                      <div
                        className="stage-fill"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                    <div className="stage-info">
                      <span className="name">{stage.name}</span>
                      <span className="stats">
                        {stage.count} ({stage.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRecommendationIcon(type: string): string {
  const icons: Record<string, string> = {
    investment: '💡',
    tier: '⬆️',
    payment: '💳',
    timing: '⏰'
  };
  return icons[type] || '📌';
}

function getUpdateIcon(type: string): string {
  const icons: Record<string, string> = {
    purchase: '💰',
    visitor: '👥',
    milestone: '🎯',
    progress: '📊'
  };
  return icons[type] || '📢';
}

function formatTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default IntelligentPresale;
