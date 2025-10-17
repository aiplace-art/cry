// FAQ Component

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is HYPE Token?',
    answer:
      'HYPE Token is an AI-powered DeFi project combining artificial intelligence with decentralized finance. Our platform uses advanced AI agents to optimize trading, staking, and yield farming strategies.',
  },
  {
    question: 'How does the presale work?',
    answer:
      'The presale consists of 3 rounds with increasing prices. Early investors receive the best pricing and highest bonus percentages. You can purchase tokens using ETH, USDT, USDC, BNB, or SOL.',
  },
  {
    question: 'What are the bonus percentages?',
    answer:
      'Round 1 offers 25% bonus, Round 2 offers 15% bonus, and Round 3 offers 10% bonus. The earlier you invest, the more bonus tokens you receive.',
  },
  {
    question: 'When will I receive my tokens?',
    answer:
      'Tokens are subject to a 6-month vesting schedule to ensure long-term project stability. You can view your vesting schedule in your dashboard and claim tokens as they unlock.',
  },
  {
    question: 'What is the minimum and maximum purchase?',
    answer:
      'The minimum purchase is 0.01 tokens worth (~$0.50), and the maximum purchase is 100 tokens worth per transaction to ensure fair distribution.',
  },
  {
    question: 'How does the referral program work?',
    answer:
      'Share your unique referral link with others. When they purchase tokens using your link, you receive a 5% bonus in additional tokens. There is no limit to referral earnings.',
  },
  {
    question: 'Which wallets are supported?',
    answer:
      'We support MetaMask, WalletConnect, Phantom (for Solana), and all major Web3 wallets. Make sure your wallet is connected to the correct network before purchasing.',
  },
  {
    question: 'Is the smart contract audited?',
    answer:
      'Yes, our smart contracts have been audited by leading security firms. The audit reports are available in our documentation. We prioritize security and transparency.',
  },
  {
    question: 'What happens after the presale ends?',
    answer:
      'After the presale, HYPE tokens will be listed on major DEXs and CEXs. The initial listing price will be higher than the presale price, providing immediate value to early investors.',
  },
  {
    question: 'Can I sell my tokens during vesting?',
    answer:
      'No, tokens are locked during the vesting period. However, once vested tokens are claimed, they can be freely traded on supported exchanges.',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
      <h3 className="text-3xl font-bold text-white mb-2 text-center">
        Frequently Asked Questions
      </h3>
      <p className="text-gray-400 text-center mb-8">
        Everything you need to know about the HYPE presale
      </p>

      <div className="space-y-3">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/30 transition-all"
            >
              <span className="font-semibold text-white pr-4">{item.question}</span>
              <span
                className={`text-purple-400 text-2xl flex-shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-45' : ''
                }`}
              >
                +
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-4 text-gray-300 leading-relaxed">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
        <h4 className="text-lg font-bold text-white mb-2 text-center">Still have questions?</h4>
        <p className="text-gray-300 text-center mb-4">
          Join our community or contact our support team
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://t.me/hype_community"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all text-center"
          >
            Join Telegram
          </a>
          <a
            href="mailto:support@hypetoken.io"
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all text-center"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};
