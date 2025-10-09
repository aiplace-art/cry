// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title GovernanceDAO
 * @dev Decentralized governance system for protocol management
 *
 * Features:
 * - Proposal creation and voting
 * - Quadratic voting mechanism
 * - Time-locked execution
 * - Vote delegation
 * - Quorum requirements
 * - Multi-signature emergency actions
 */
contract GovernanceDAO is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20 public governanceToken;

    // Proposal states
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    // Proposal types
    enum ProposalType {
        ParameterChange,
        TreasurySpend,
        ContractUpgrade,
        EmergencyAction,
        General
    }

    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        bytes callData;
        address target;
        uint256 value;
    }

    // Vote structure
    struct Vote {
        bool hasVoted;
        uint8 support; // 0 = Against, 1 = For, 2 = Abstain
        uint256 votes;
        string reason;
    }

    // Delegation structure
    struct Delegation {
        address delegate;
        uint256 amount;
        uint256 timestamp;
    }

    // Storage
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public proposalVotes;
    mapping(address => Delegation) public delegations;
    mapping(address => uint256) public votingPower;

    uint256 public proposalCount;
    uint256[] public activeProposalIds;

    // Governance parameters
    uint256 public votingDelay = 1 days;          // Delay before voting starts
    uint256 public votingPeriod = 7 days;         // Duration of voting
    uint256 public executionDelay = 2 days;       // Delay before execution
    uint256 public proposalThreshold = 100000 * 10**18; // Tokens needed to propose
    uint256 public quorumPercentage = 4;          // 4% of total supply
    uint256 public passingThreshold = 50;         // 50% of votes

    // Emergency multisig
    mapping(address => bool) public emergencyCouncil;
    mapping(uint256 => mapping(address => bool)) public emergencyApprovals;
    uint256 public emergencyThreshold = 3;
    uint256 public emergencyCouncilSize;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 votes,
        string reason
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event DelegationChanged(address indexed delegator, address indexed delegate, uint256 amount);
    event EmergencyCouncilUpdated(address indexed member, bool status);

    /**
     * @dev Constructor
     * @param _governanceToken Token used for voting
     */
    constructor(address _governanceToken) {
        require(_governanceToken != address(0), "Invalid token address");
        governanceToken = IERC20(_governanceToken);
    }

    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param proposalType Type of proposal
     * @param target Target contract address
     * @param value ETH value to send
     * @param callData Function call data
     */
    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType,
        address target,
        uint256 value,
        bytes memory callData
    ) external returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient tokens to propose"
        );
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");

        uint256 proposalId = proposalCount++;
        uint256 startTime = block.timestamp + votingDelay;
        uint256 endTime = startTime + votingPeriod;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            proposalType: proposalType,
            startTime: startTime,
            endTime: endTime,
            executionTime: 0,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            canceled: false,
            callData: callData,
            target: target,
            value: value
        });

        activeProposalIds.push(proposalId);

        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            proposalType,
            startTime,
            endTime
        );

        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     * @param proposalId Proposal identifier
     * @param support Vote direction (0=Against, 1=For, 2=Abstain)
     * @param reason Reason for vote
     */
    function castVote(
        uint256 proposalId,
        uint8 support,
        string memory reason
    ) external nonReentrant {
        require(support <= 2, "Invalid vote type");
        require(getProposalState(proposalId) == ProposalState.Active, "Voting not active");

        Proposal storage proposal = proposals[proposalId];
        Vote storage vote = proposalVotes[proposalId][msg.sender];

        require(!vote.hasVoted, "Already voted");

        uint256 votes = _getVotingPower(msg.sender);
        require(votes > 0, "No voting power");

        vote.hasVoted = true;
        vote.support = support;
        vote.votes = votes;
        vote.reason = reason;

        if (support == 0) {
            proposal.againstVotes = proposal.againstVotes.add(votes);
        } else if (support == 1) {
            proposal.forVotes = proposal.forVotes.add(votes);
        } else {
            proposal.abstainVotes = proposal.abstainVotes.add(votes);
        }

        emit VoteCast(msg.sender, proposalId, support, votes, reason);
    }

    /**
     * @dev Queue proposal for execution
     * @param proposalId Proposal identifier
     */
    function queueProposal(uint256 proposalId) external {
        require(
            getProposalState(proposalId) == ProposalState.Succeeded,
            "Proposal not succeeded"
        );

        Proposal storage proposal = proposals[proposalId];
        proposal.executionTime = block.timestamp + executionDelay;
    }

    /**
     * @dev Execute a successful proposal
     * @param proposalId Proposal identifier
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        require(
            getProposalState(proposalId) == ProposalState.Queued,
            "Proposal not queued"
        );

        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.executionTime, "Execution delay not met");

        proposal.executed = true;

        // Execute the proposal
        if (proposal.target != address(0)) {
            (bool success, ) = proposal.target.call{value: proposal.value}(proposal.callData);
            require(success, "Proposal execution failed");
        }

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal
     * @param proposalId Proposal identifier
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(!proposal.executed, "Already executed");
        require(getProposalState(proposalId) != ProposalState.Executed, "Already executed");

        proposal.canceled = true;

        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Delegate voting power
     * @param delegate Address to delegate to
     * @param amount Amount of tokens to delegate
     */
    function delegate(address delegate, uint256 amount) external {
        require(delegate != address(0), "Invalid delegate");
        require(delegate != msg.sender, "Cannot delegate to self");
        require(
            governanceToken.balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );

        // Update delegation
        Delegation storage currentDelegation = delegations[msg.sender];

        if (currentDelegation.delegate != address(0)) {
            votingPower[currentDelegation.delegate] = votingPower[currentDelegation.delegate].sub(
                currentDelegation.amount
            );
        }

        currentDelegation.delegate = delegate;
        currentDelegation.amount = amount;
        currentDelegation.timestamp = block.timestamp;

        votingPower[delegate] = votingPower[delegate].add(amount);

        emit DelegationChanged(msg.sender, delegate, amount);
    }

    /**
     * @dev Remove delegation
     */
    function removeDelegate() external {
        Delegation storage currentDelegation = delegations[msg.sender];
        require(currentDelegation.delegate != address(0), "No active delegation");

        address previousDelegate = currentDelegation.delegate;
        uint256 amount = currentDelegation.amount;

        votingPower[previousDelegate] = votingPower[previousDelegate].sub(amount);

        delete delegations[msg.sender];

        emit DelegationChanged(msg.sender, address(0), 0);
    }

    /**
     * @dev Get proposal state
     * @param proposalId Proposal identifier
     * @return Current state of proposal
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.canceled) {
            return ProposalState.Canceled;
        }

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }

        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }

        // Check if proposal succeeded
        uint256 totalVotes = proposal.forVotes.add(proposal.againstVotes).add(proposal.abstainVotes);
        uint256 quorum = governanceToken.totalSupply().mul(quorumPercentage).div(100);

        if (totalVotes < quorum) {
            return ProposalState.Defeated;
        }

        uint256 forPercentage = proposal.forVotes.mul(100).div(totalVotes);

        if (forPercentage < passingThreshold) {
            return ProposalState.Defeated;
        }

        if (proposal.executionTime == 0) {
            return ProposalState.Succeeded;
        }

        if (block.timestamp < proposal.executionTime) {
            return ProposalState.Queued;
        }

        if (block.timestamp > proposal.executionTime + 14 days) {
            return ProposalState.Expired;
        }

        return ProposalState.Queued;
    }

    /**
     * @dev Get voting power of an address
     * @param account Address to check
     * @return Voting power
     */
    function _getVotingPower(address account) private view returns (uint256) {
        uint256 balance = governanceToken.balanceOf(account);
        uint256 delegated = votingPower[account];
        return balance.add(delegated);
    }

    /**
     * @dev Get all active proposals
     * @return Array of active proposal IDs
     */
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 count = 0;

        // Count active proposals
        for (uint256 i = 0; i < activeProposalIds.length; i++) {
            if (getProposalState(activeProposalIds[i]) == ProposalState.Active) {
                count++;
            }
        }

        uint256[] memory active = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < activeProposalIds.length; i++) {
            if (getProposalState(activeProposalIds[i]) == ProposalState.Active) {
                active[index] = activeProposalIds[i];
                index++;
            }
        }

        return active;
    }

    /**
     * @dev Get proposal details
     * @param proposalId Proposal identifier
     * @return Proposal details
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Get vote details
     * @param proposalId Proposal identifier
     * @param voter Voter address
     * @return Vote details
     */
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory) {
        return proposalVotes[proposalId][voter];
    }

    // Admin functions

    /**
     * @dev Update governance parameters
     */
    function updateParameters(
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage,
        uint256 _passingThreshold
    ) external onlyOwner {
        require(_votingPeriod >= 1 days, "Voting period too short");
        require(_quorumPercentage > 0 && _quorumPercentage <= 100, "Invalid quorum");
        require(_passingThreshold > 0 && _passingThreshold <= 100, "Invalid threshold");

        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        executionDelay = _executionDelay;
        proposalThreshold = _proposalThreshold;
        quorumPercentage = _quorumPercentage;
        passingThreshold = _passingThreshold;
    }

    /**
     * @dev Update emergency council
     */
    function updateEmergencyCouncil(address member, bool status) external onlyOwner {
        require(member != address(0), "Invalid address");

        if (status && !emergencyCouncil[member]) {
            emergencyCouncilSize++;
        } else if (!status && emergencyCouncil[member]) {
            emergencyCouncilSize--;
        }

        emergencyCouncil[member] = status;

        emit EmergencyCouncilUpdated(member, status);
    }

    /**
     * @dev Set emergency threshold
     */
    function setEmergencyThreshold(uint256 threshold) external onlyOwner {
        require(threshold > 0 && threshold <= emergencyCouncilSize, "Invalid threshold");
        emergencyThreshold = threshold;
    }

    receive() external payable {}
}
