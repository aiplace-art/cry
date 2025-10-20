import React, { useState, useEffect } from 'react';
import { BNBCard, BNBInput, BNBButton, BNBBadge } from '../ui/bnb';

interface BuyTokensPanelProps {
  bnbPrice?: number;
  usdtPrice?: number;
  tokenPrice?: number;
  onPurchase?: (amount: number, paymentMethod: 'BNB' | 'USDT') => void;
}

export const BuyTokensPanel: React.FC<BuyTokensPanelProps> = ({
  bnbPrice = 580,
  usdtPrice = 1,
  tokenPrice = 0.025,
  onPurchase,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'BNB' | 'USDT'>('BNB');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('0');
  const [bonusPercentage, setBonusPercentage] = useState(20);
  const [bonusTokens, setBonusTokens] = useState('0');
  const [totalTokens, setTotalTokens] = useState('0');
  const [usdValue, setUsdValue] = useState('0');

  // Calculate bonus tier based on USD amount
  const calculateBonusTier = (usdAmount: number) => {
    if (usdAmount >= 50000) return 30;
    if (usdAmount >= 25000) return 27;
    if (usdAmount >= 10000) return 25;
    if (usdAmount >= 5000) return 23;
    if (usdAmount >= 1000) return 20;
    return 0;
  };

  useEffect(() => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      setTokenAmount('0');
      setBonusTokens('0');
      setTotalTokens('0');
      setUsdValue('0');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const usdAmount = paymentMethod === 'BNB' ? amount * bnbPrice : amount * usdtPrice;
    const baseTokens = usdAmount / tokenPrice;
    const bonus = calculateBonusTier(usdAmount);
    const bonusAmount = (baseTokens * bonus) / 100;
    const total = baseTokens + bonusAmount;

    setUsdValue(usdAmount.toFixed(2));
    setTokenAmount(baseTokens.toFixed(0));
    setBonusPercentage(bonus);
    setBonusTokens(bonusAmount.toFixed(0));
    setTotalTokens(total.toFixed(0));
  }, [paymentAmount, paymentMethod, bnbPrice, usdtPrice, tokenPrice]);

  const bonusTiers = [
    { min: 1000, max: 4999, bonus: 20 },
    { min: 5000, max: 9999, bonus: 23 },
    { min: 10000, max: 24999, bonus: 25 },
    { min: 25000, max: 49999, bonus: 27 },
    { min: 50000, max: Infinity, bonus: 30 },
  ];

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <BNBCard variant="gradient" padding="lg">
        <div>
          <h1 className="text-3xl font-bold text-[#EAECEF] mb-2">
            Buy HYPE Tokens
          </h1>
          <p className="text-[#848E9C]">
            Purchase tokens during private sale with up to 30% bonus
          </p>
        </div>
      </BNBCard>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Calculator */}
        <div className="lg:col-span-2">
          <BNBCard title="Token Calculator" subtitle="Calculate your purchase" padding="lg">
            {/* Payment Method Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#EAECEF] mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Payment method selection">
                <button
                  onClick={() => setPaymentMethod('BNB')}
                  role="radio"
                  aria-checked={paymentMethod === 'BNB'}
                  aria-label="Pay with BNB"
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    ${paymentMethod === 'BNB'
                      ? 'border-[#F3BA2F] bg-[#F3BA2F]/10'
                      : 'border-[#848E9C]/20 hover:border-[#848E9C]/40'
                    }
                  `}
                >
                  <div className="text-3xl mb-2" aria-hidden="true">🔶</div>
                  <div className="font-bold text-[#EAECEF]">BNB</div>
                  <div className="text-xs text-[#848E9C]">${bnbPrice.toFixed(2)}</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('USDT')}
                  role="radio"
                  aria-checked={paymentMethod === 'USDT'}
                  aria-label="Pay with USDT stablecoin"
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    ${paymentMethod === 'USDT'
                      ? 'border-[#F3BA2F] bg-[#F3BA2F]/10'
                      : 'border-[#848E9C]/20 hover:border-[#848E9C]/40'
                    }
                  `}
                >
                  <div className="text-3xl mb-2" aria-hidden="true">💵</div>
                  <div className="font-bold text-[#EAECEF]">USDT</div>
                  <div className="text-xs text-[#848E9C]">Stablecoin</div>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label htmlFor="payment-amount" className="sr-only">Payment amount in {paymentMethod}</label>
              <BNBInput
                label={`You Pay (${paymentMethod})`}
                value={paymentAmount}
                onChange={setPaymentAmount}
                type="number"
                placeholder="0.00"
                suffix={paymentMethod}
                aria-label={`Payment amount in ${paymentMethod}`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Conversion Arrow */}
            <div className="flex justify-center my-4">
              <div className="w-10 h-10 rounded-full bg-[#14151A] border border-[#F3BA2F]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#F3BA2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4 bg-[#14151A] p-6 rounded-xl border border-[#F3BA2F]/20">
              <div className="flex justify-between items-center">
                <span className="text-[#848E9C]">USD Value:</span>
                <span className="text-xl font-bold text-[#EAECEF]">${usdValue}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848E9C]">Base Tokens:</span>
                <span className="text-xl font-bold text-[#EAECEF]">{formatNumber(tokenAmount)} HYPE</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#848E9C]">Bonus ({bonusPercentage}%):</span>
                <span className="text-xl font-bold text-[#0ECB81]">+{formatNumber(bonusTokens)} HYPE</span>
              </div>

              <div className="pt-4 border-t border-[#848E9C]/20">
                <div className="flex justify-between items-center">
                  <span className="text-[#EAECEF] font-medium">Total Tokens:</span>
                  <span className="text-2xl font-bold text-[#F3BA2F]">{formatNumber(totalTokens)} HYPE</span>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="mt-6">
              <BNBButton
                onClick={() => onPurchase?.(parseFloat(paymentAmount), paymentMethod)}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                fullWidth
                size="lg"
                aria-label="Purchase HYPE tokens with selected payment method"
                aria-disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Purchase Tokens
              </BNBButton>
            </div>

            {/* Info */}
            <div className="mt-4 p-4 bg-[#F0B90B]/10 rounded-lg border border-[#F0B90B]/20">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-[#EAECEF]">
                  20% tokens unlocked immediately. After 3-month cliff, remaining 80% vest linearly over 18 months (21 months total). Claim anytime after cliff ends.
                </p>
              </div>
            </div>
          </BNBCard>
        </div>

        {/* Bonus Tiers */}
        <div className="space-y-6">
          <BNBCard title="Bonus Tiers" subtitle="Invest more, earn more" padding="md">
            <div className="space-y-3">
              {bonusTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${bonusPercentage === tier.bonus
                      ? 'border-[#F3BA2F] bg-[#F3BA2F]/10'
                      : 'border-[#848E9C]/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#EAECEF]">
                      ${tier.min.toLocaleString()}
                      {tier.max !== Infinity && `+ `}
                    </span>
                    <BNBBadge variant="gold" size="sm">
                      +{tier.bonus}%
                    </BNBBadge>
                  </div>
                  <div className="text-xs text-[#848E9C]">
                    Get {tier.bonus}% bonus tokens
                  </div>
                </div>
              ))}
            </div>
          </BNBCard>

          <BNBCard title="Sale Info" padding="md">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#848E9C]">Token Price</span>
                  <span className="font-bold text-[#EAECEF]">${tokenPrice}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#848E9C]">Min. Purchase</span>
                  <span className="font-bold text-[#EAECEF]">$1,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#848E9C]">Vesting Period</span>
                  <span className="font-bold text-[#EAECEF]">21 Months</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#848E9C]/20">
                <div className="text-xs text-[#848E9C] mb-2">Sale Progress</div>
                <div className="w-full bg-[#14151A] rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-[#F3BA2F] to-[#FCD535] h-2 rounded-full" style={{ width: '48%' }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#848E9C]">$2.4M</span>
                  <span className="text-[#F3BA2F] font-bold">48%</span>
                  <span className="text-[#848E9C]">$5M</span>
                </div>
              </div>
            </div>
          </BNBCard>
        </div>
      </div>
    </div>
  );
};
