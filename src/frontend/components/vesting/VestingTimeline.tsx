import React, { useMemo } from 'react';
import {
  generateVestingSchedule,
  formatTokenAmount,
  type VestingInfo,
} from '../../lib/vesting/vesting-config';

interface VestingTimelineProps {
  vestingInfo: VestingInfo;
  className?: string;
}

/**
 * VestingTimeline Component
 * Displays visual timeline of token unlock schedule
 *
 * Shows:
 * - Current unlock progress
 * - Milestone dates (every 30 days)
 * - Unlocked amounts at each milestone
 * - Visual progress bar
 */
export const VestingTimeline: React.FC<VestingTimelineProps> = ({
  vestingInfo,
  className = '',
}) => {
  const schedule = useMemo(() => {
    return generateVestingSchedule(
      vestingInfo.purchaseTime,
      vestingInfo.totalTokens
    );
  }, [vestingInfo.purchaseTime, vestingInfo.totalTokens]);

  const currentProgress = vestingInfo.vestingProgress * 100;

  return (
    <div className={`vesting-timeline ${className}`}>
      <div className="timeline-header">
        <h3>Vesting Schedule</h3>
        <div className="progress-summary">
          <span className="unlocked">
            {formatTokenAmount(vestingInfo.unlockedTokens)} HYPE Unlocked
          </span>
          <span className="progress-percentage">
            {currentProgress.toFixed(2)}% Complete
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${currentProgress}%` }}
          >
            <span className="progress-label">
              {currentProgress.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="progress-markers">
          <span className="marker start">Day 0</span>
          <span className="marker mid">Day 90</span>
          <span className="marker end">Day 180</span>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="milestones">
        {schedule.map((milestone, index) => {
          const isUnlocked = milestone.timestamp <= Date.now() / 1000;
          const isImmediate = milestone.day === 0;

          return (
            <div
              key={milestone.day}
              className={`milestone ${isUnlocked ? 'unlocked' : 'locked'} ${
                isImmediate ? 'immediate' : ''
              }`}
            >
              <div className="milestone-marker">
                <div className="marker-dot" />
                {index < schedule.length - 1 && (
                  <div className="connector-line" />
                )}
              </div>

              <div className="milestone-content">
                <div className="milestone-date">
                  <strong>Day {milestone.day}</strong>
                  <span className="date-text">
                    {milestone.date.toLocaleDateString()}
                  </span>
                </div>

                <div className="milestone-amount">
                  <span className="tokens">
                    {formatTokenAmount(milestone.unlockedTokens)} HYPE
                  </span>
                  <span className="percentage">
                    {milestone.unlockedPercentage.toFixed(2)}%
                  </span>
                </div>

                {isImmediate && (
                  <span className="badge immediate-badge">
                    Immediate Unlock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="vesting-stats">
        <div className="stat">
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value">
            {formatTokenAmount(vestingInfo.totalTokens)} HYPE
          </span>
        </div>

        <div className="stat">
          <span className="stat-label">Immediate (40%)</span>
          <span className="stat-value">
            {formatTokenAmount(vestingInfo.immediateTokens)} HYPE
          </span>
        </div>

        <div className="stat">
          <span className="stat-label">Vested (60%)</span>
          <span className="stat-value">
            {formatTokenAmount(vestingInfo.vestedTokens)} HYPE
          </span>
        </div>

        <div className="stat highlighted">
          <span className="stat-label">Currently Claimable</span>
          <span className="stat-value">
            {formatTokenAmount(vestingInfo.claimableTokens)} HYPE
          </span>
        </div>
      </div>

      <style jsx>{`
        .vesting-timeline {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          color: #fff;
        }

        .timeline-header {
          margin-bottom: 24px;
        }

        .timeline-header h3 {
          font-size: 24px;
          margin: 0 0 12px 0;
          color: #00e5ff;
        }

        .progress-summary {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #999;
        }

        .progress-bar-container {
          margin-bottom: 32px;
        }

        .progress-bar {
          height: 40px;
          background: #2a2a2a;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00e5ff 0%, #00aaff 100%);
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 16px;
        }

        .progress-label {
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }

        .progress-markers {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        .milestones {
          margin-bottom: 24px;
        }

        .milestone {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          position: relative;
        }

        .milestone-marker {
          flex-shrink: 0;
          width: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .marker-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid #666;
          background: #2a2a2a;
          transition: all 0.3s ease;
        }

        .milestone.unlocked .marker-dot {
          border-color: #00e5ff;
          background: #00e5ff;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
        }

        .connector-line {
          width: 2px;
          flex: 1;
          background: #666;
          margin-top: 4px;
        }

        .milestone.unlocked .connector-line {
          background: #00e5ff;
        }

        .milestone-content {
          flex: 1;
        }

        .milestone-date {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .milestone-date strong {
          color: #00e5ff;
          font-size: 16px;
        }

        .date-text {
          color: #999;
          font-size: 14px;
        }

        .milestone-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tokens {
          font-size: 18px;
          font-weight: 600;
        }

        .percentage {
          color: #00e5ff;
          font-size: 14px;
          font-weight: 600;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }

        .immediate-badge {
          background: rgba(0, 229, 255, 0.2);
          color: #00e5ff;
        }

        .vesting-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid #333;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .stat.highlighted {
          background: rgba(0, 229, 255, 0.1);
          padding: 12px;
          border-radius: 8px;
        }

        .stat.highlighted .stat-label {
          color: #00e5ff;
        }

        .stat.highlighted .stat-value {
          color: #00e5ff;
          font-size: 20px;
        }

        @media (max-width: 768px) {
          .vesting-timeline {
            padding: 16px;
          }

          .timeline-header h3 {
            font-size: 20px;
          }

          .progress-bar {
            height: 32px;
          }

          .vesting-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
