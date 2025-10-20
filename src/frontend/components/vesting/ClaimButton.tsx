import React, { useState } from 'react';
import { formatTokenAmount, type VestingInfo } from '../../lib/vesting/vesting-config';

interface ClaimButtonProps {
  vestingInfo: VestingInfo;
  onClaim: () => Promise<void>;
  className?: string;
}

/**
 * ClaimButton Component
 * Button to claim unlocked tokens from vesting schedule
 *
 * Features:
 * - Shows claimable amount
 * - Disabled when nothing to claim
 * - Loading state during transaction
 * - Error handling
 * - Success feedback
 */
export const ClaimButton: React.FC<ClaimButtonProps> = ({
  vestingInfo,
  onClaim,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canClaim = vestingInfo.claimableTokens > 0;

  const handleClaim = async () => {
    if (!canClaim || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onClaim();
      setSuccess(true);

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
      console.error('Claim error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`claim-button-container ${className}`}>
      <div className="claim-info">
        <div className="claimable-amount">
          <span className="amount-label">Available to Claim:</span>
          <span className="amount-value">
            {formatTokenAmount(vestingInfo.claimableTokens)} HYPE
          </span>
        </div>

        {vestingInfo.claimedTokens > 0 && (
          <div className="claimed-info">
            <span className="claimed-label">Already Claimed:</span>
            <span className="claimed-value">
              {formatTokenAmount(vestingInfo.claimedTokens)} HYPE
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleClaim}
        disabled={!canClaim || isLoading}
        className={`claim-button ${isLoading ? 'loading' : ''} ${
          success ? 'success' : ''
        } ${!canClaim ? 'disabled' : ''}`}
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            Processing...
          </>
        ) : success ? (
          <>
            <span className="checkmark">✓</span>
            Claimed Successfully!
          </>
        ) : canClaim ? (
          <>
            Claim {formatTokenAmount(vestingInfo.claimableTokens, 0)} HYPE
          </>
        ) : (
          'No Tokens Available'
        )}
      </button>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          Tokens claimed successfully! Check your wallet.
        </div>
      )}

      <style jsx>{`
        .claim-button-container {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
        }

        .claim-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .claimable-amount,
        .claimed-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #2a2a2a;
          border-radius: 8px;
        }

        .amount-label,
        .claimed-label {
          font-size: 14px;
          color: #999;
        }

        .amount-value {
          font-size: 20px;
          font-weight: 700;
          color: #00e5ff;
        }

        .claimed-value {
          font-size: 16px;
          font-weight: 600;
          color: #666;
        }

        .claim-button {
          width: 100%;
          padding: 16px 32px;
          background: linear-gradient(90deg, #00e5ff 0%, #00aaff 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .claim-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 229, 255, 0.3);
        }

        .claim-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .claim-button.disabled,
        .claim-button:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
          transform: none;
        }

        .claim-button.loading {
          background: #555;
          cursor: wait;
        }

        .claim-button.success {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .checkmark {
          font-size: 24px;
          font-weight: bold;
        }

        .error-message,
        .success-message {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .error-icon,
        .success-icon {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .claim-button-container {
            padding: 16px;
          }

          .claim-button {
            font-size: 16px;
            padding: 14px 24px;
          }

          .amount-value {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};
