'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { formatTimeRemaining, formatTokenAmount } from '@/lib/utils';
import { Vote, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import type { GovernanceProposal } from '@/types';

export const GovernanceVoting: React.FC = () => {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [votingPower, setVotingPower] = useState('1000000');

  useEffect(() => {
    // Generate mock proposals
    const mockProposals: GovernanceProposal[] = [
      {
        id: '1',
        title: 'Increase Staking Rewards by 2%',
        description: 'Proposal to increase the base staking APY from 12% to 14% to incentivize more long-term holders and strengthen network security.',
        proposer: '0x1234...5678',
        status: 'active',
        votesFor: '5250000',
        votesAgainst: '2100000',
        startTime: Math.floor(Date.now() / 1000) - 86400,
        endTime: Math.floor(Date.now() / 1000) + 86400 * 6,
        executed: false,
      },
      {
        id: '2',
        title: 'Add Liquidity Mining Program',
        description: 'Launch a 3-month liquidity mining program with 500,000 tokens to bootstrap liquidity on major DEXs.',
        proposer: '0xabcd...efgh',
        status: 'active',
        votesFor: '3800000',
        votesAgainst: '4200000',
        startTime: Math.floor(Date.now() / 1000) - 172800,
        endTime: Math.floor(Date.now() / 1000) + 86400 * 5,
        executed: false,
      },
      {
        id: '3',
        title: 'Treasury Allocation for Marketing',
        description: 'Allocate 200,000 USDC from treasury for Q1 marketing campaigns and partnerships.',
        proposer: '0x9876...4321',
        status: 'passed',
        votesFor: '8500000',
        votesAgainst: '1200000',
        startTime: Math.floor(Date.now() / 1000) - 604800,
        endTime: Math.floor(Date.now() / 1000) - 86400,
        executed: true,
      },
    ];

    setProposals(mockProposals);
  }, []);

  const handleVote = (proposalId: string, support: boolean) => {
    console.log(`Voting ${support ? 'for' : 'against'} proposal ${proposalId}`);
    // Implement voting logic
  };

  const getStatusBadge = (status: GovernanceProposal['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="info">Active</Badge>;
      case 'passed':
        return <Badge variant="success">Passed</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  const calculateVotePercentage = (votesFor: string, votesAgainst: string) => {
    const totalVotes = Number(votesFor) + Number(votesAgainst);
    if (totalVotes === 0) return 50;
    return (Number(votesFor) / totalVotes) * 100;
  };

  return (
    <div className="space-y-6">
      <Card gradient>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-bnb-primary/10 dark:bg-bnb-darker/30 rounded-lg">
              <Vote className="h-5 w-5 text-bnb-primary dark:text-bnb-primary" />
            </div>
            Governance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Voting Power</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatTokenAmount(votingPower, 18)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Proposals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {proposals.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Proposals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {proposals.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {proposals.map((proposal) => {
          const votePercentage = calculateVotePercentage(proposal.votesFor, proposal.votesAgainst);
          const isActive = proposal.status === 'active';

          return (
            <Card key={proposal.id} hover>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {proposal.title}
                      </h3>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {proposal.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Proposed by {proposal.proposer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {isActive ? `Ends in ${formatTimeRemaining(proposal.endTime)}` : 'Ended'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600 dark:text-gray-400">For</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatTokenAmount(proposal.votesFor, 18)} ({votePercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div className="flex h-full">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${votePercentage}%` }}
                      />
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600"
                        style={{ width: `${100 - votePercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-gray-600 dark:text-gray-400">Against</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatTokenAmount(proposal.votesAgainst, 18)} ({(100 - votePercentage).toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleVote(proposal.id, true)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Vote For
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleVote(proposal.id, false)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Vote Against
                    </Button>
                  </div>
                )}

                {proposal.executed && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      This proposal has been executed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
