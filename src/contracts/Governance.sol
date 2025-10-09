// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Governance DAO Contract for HYPE Token
 * @notice Token-weighted voting system for community governance
 * @dev Simple DAO implementation with proposal creation and voting
 */
contract Governance is Ownable, ReentrancyGuard {
    IERC20 public governanceToken;

    enum ProposalStatus { Pending, Active, Succeeded, Defeated, Executed, Cancelled }
    enum VoteType { Against, For, Abstain }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        ProposalStatus status;
        mapping(address => bool) hasVoted;
        mapping(address => VoteType) votes;
    }

    // Governance parameters
    uint256 public proposalThreshold;  // Minimum tokens needed to create proposal
    uint256 public votingPeriod;       // Voting period in seconds
    uint256 public quorumPercentage;   // Quorum percentage (basis points)

    // Proposals
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(address indexed voter, uint256 indexed proposalId, VoteType voteType, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event ParametersUpdated(uint256 proposalThreshold, uint256 votingPeriod, uint256 quorumPercentage);

    /**
     * @notice Initialize the governance contract
     * @param _governanceToken Address of the governance token
     * @param _proposalThreshold Minimum tokens to create proposal
     * @param _votingPeriod Voting period in seconds
     * @param _quorumPercentage Quorum percentage in basis points
     */
    constructor(
        address _governanceToken,
        uint256 _proposalThreshold,
        uint256 _votingPeriod,
        uint256 _quorumPercentage
    ) {
        require(_governanceToken != address(0), "Invalid token address");
        require(_quorumPercentage <= 10000, "Quorum too high");

        governanceToken = IERC20(_governanceToken);
        proposalThreshold = _proposalThreshold;
        votingPeriod = _votingPeriod;
        quorumPercentage = _quorumPercentage;
    }

    /**
     * @notice Create a new proposal
     * @param _description Proposal description
     * @return proposalId The ID of the created proposal
     */
    function createProposal(string memory _description) external returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient tokens to propose"
        );
        require(bytes(_description).length > 0, "Empty description");

        uint256 proposalId = proposalCount++;
        Proposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriod;
        newProposal.status = ProposalStatus.Active;

        emit ProposalCreated(proposalId, msg.sender, _description);

        return proposalId;
    }

    /**
     * @notice Cast a vote on a proposal
     * @param _proposalId Proposal ID
     * @param _voteType Vote type (Against, For, Abstain)
     */
    function castVote(uint256 _proposalId, VoteType _voteType) external nonReentrant {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        // Record vote
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = _voteType;

        // Update vote counts
        if (_voteType == VoteType.For) {
            proposal.forVotes += weight;
        } else if (_voteType == VoteType.Against) {
            proposal.againstVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(msg.sender, _proposalId, _voteType, weight);
    }

    /**
     * @notice Get proposal state
     * @param _proposalId Proposal ID
     * @return Current proposal status
     */
    function getProposalState(uint256 _proposalId) public view returns (ProposalStatus) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        if (proposal.executed) {
            return ProposalStatus.Executed;
        }

        if (proposal.status == ProposalStatus.Cancelled) {
            return ProposalStatus.Cancelled;
        }

        if (block.timestamp <= proposal.endTime) {
            return ProposalStatus.Active;
        }

        // Check quorum
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = governanceToken.totalSupply();
        uint256 quorum = (totalSupply * quorumPercentage) / 10000;

        if (totalVotes < quorum) {
            return ProposalStatus.Defeated;
        }

        // Check if passed
        if (proposal.forVotes > proposal.againstVotes) {
            return ProposalStatus.Succeeded;
        } else {
            return ProposalStatus.Defeated;
        }
    }

    /**
     * @notice Execute a successful proposal
     * @param _proposalId Proposal ID
     */
    function executeProposal(uint256 _proposalId) external {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        ProposalStatus state = getProposalState(_proposalId);
        require(state == ProposalStatus.Succeeded, "Proposal not succeeded");
        require(!proposal.executed, "Already executed");

        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;

        emit ProposalExecuted(_proposalId);
    }

    /**
     * @notice Cancel a proposal (proposer or owner only)
     * @param _proposalId Proposal ID
     */
    function cancelProposal(uint256 _proposalId) external {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(proposal.status == ProposalStatus.Active, "Proposal not active");

        proposal.status = ProposalStatus.Cancelled;

        emit ProposalCancelled(_proposalId);
    }

    /**
     * @notice Get proposal details
     * @param _proposalId Proposal ID
     * @return Proposal details
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        ProposalStatus status
    ) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            getProposalState(_proposalId)
        );
    }

    /**
     * @notice Check if an address has voted on a proposal
     * @param _proposalId Proposal ID
     * @param _voter Voter address
     * @return Whether the address has voted
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        return proposals[_proposalId].hasVoted[_voter];
    }

    /**
     * @notice Update governance parameters (owner only)
     * @param _proposalThreshold New proposal threshold
     * @param _votingPeriod New voting period
     * @param _quorumPercentage New quorum percentage
     */
    function updateParameters(
        uint256 _proposalThreshold,
        uint256 _votingPeriod,
        uint256 _quorumPercentage
    ) external onlyOwner {
        require(_quorumPercentage <= 10000, "Quorum too high");

        proposalThreshold = _proposalThreshold;
        votingPeriod = _votingPeriod;
        quorumPercentage = _quorumPercentage;

        emit ParametersUpdated(_proposalThreshold, _votingPeriod, _quorumPercentage);
    }

    /**
     * @notice Get governance parameters
     * @return Current governance parameters
     */
    function getParameters() external view returns (
        uint256,
        uint256,
        uint256
    ) {
        return (proposalThreshold, votingPeriod, quorumPercentage);
    }
}
