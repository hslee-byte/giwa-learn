// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

interface IDojangScroll {
    function isVerified(address learner, bytes32 attesterId) external view returns (bool);
}

contract GiwaLearnRewards is AccessControl, EIP712, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant CLAIM_TYPEHASH = keccak256(
        "Claim(bytes32 campaignId,address learner,bytes32 completionId,bytes32 nonce,uint256 deadline)"
    );

    struct Campaign {
        IERC20 token;
        uint256 rewardPerClaim;
        uint256 remaining;
        uint64 startsAt;
        uint64 endsAt;
        bool paused;
        bool closed;
        bytes32 contentHash;
        uint256 claimCount;
    }

    IDojangScroll public immutable dojangScroll;
    bytes32 public immutable attesterId;
    address public claimSigner;

    mapping(bytes32 campaignId => Campaign campaign) public campaigns;
    mapping(bytes32 campaignId => mapping(address learner => bool claimed)) public hasClaimed;
    mapping(bytes32 authorizationKey => bool used) private _usedAuthorizations;

    error ZeroAddress();
    error InvalidCampaign();
    error CampaignExists();
    error CampaignNotFound();
    error CampaignUnavailable();
    error CampaignStillActive();
    error NotVerified();
    error AlreadyClaimed();
    error AuthorizationUsed();
    error ClaimExpired();
    error InvalidClaimSignature();
    error InsufficientBudget();
    error UnsupportedToken();

    event CampaignCreated(
        bytes32 indexed campaignId,
        address indexed token,
        uint256 rewardPerClaim,
        uint64 startsAt,
        uint64 endsAt,
        bytes32 contentHash
    );
    event CampaignFunded(bytes32 indexed campaignId, uint256 amount, uint256 remaining);
    event CampaignPauseChanged(bytes32 indexed campaignId, bool paused);
    event CampaignClosed(bytes32 indexed campaignId);
    event CampaignRemainderWithdrawn(bytes32 indexed campaignId, address indexed recipient, uint256 amount);
    event ClaimSignerChanged(address indexed previousSigner, address indexed newSigner);
    event LearningRewardClaimed(
        bytes32 indexed campaignId,
        address indexed learner,
        bytes32 indexed completionId,
        address token,
        uint256 amount
    );

    constructor(
        address admin,
        address operator,
        address signer,
        address dojangScrollAddress,
        bytes32 dojangAttesterId
    ) EIP712("GIWA Learn", "1") {
        if (
            admin == address(0) ||
            operator == address(0) ||
            signer == address(0) ||
            dojangScrollAddress == address(0) ||
            dojangAttesterId == bytes32(0)
        ) {
            revert ZeroAddress();
        }

        dojangScroll = IDojangScroll(dojangScrollAddress);
        attesterId = dojangAttesterId;
        claimSigner = signer;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, operator);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createCampaign(
        bytes32 campaignId,
        address token,
        uint256 rewardPerClaim,
        uint64 startsAt,
        uint64 endsAt,
        bytes32 contentHash
    ) external onlyRole(OPERATOR_ROLE) {
        if (
            campaignId == bytes32(0) ||
            token == address(0) ||
            rewardPerClaim == 0 ||
            startsAt >= endsAt ||
            contentHash == bytes32(0)
        ) {
            revert InvalidCampaign();
        }
        if (address(campaigns[campaignId].token) != address(0)) revert CampaignExists();

        campaigns[campaignId] = Campaign({
            token: IERC20(token),
            rewardPerClaim: rewardPerClaim,
            remaining: 0,
            startsAt: startsAt,
            endsAt: endsAt,
            paused: false,
            closed: false,
            contentHash: contentHash,
            claimCount: 0
        });

        emit CampaignCreated(campaignId, token, rewardPerClaim, startsAt, endsAt, contentHash);
    }

    function fundCampaign(bytes32 campaignId, uint256 amount)
        external
        onlyRole(OPERATOR_ROLE)
        nonReentrant
    {
        Campaign storage campaign = _campaign(campaignId);
        if (campaign.closed || amount == 0) revert CampaignUnavailable();

        uint256 balanceBefore = campaign.token.balanceOf(address(this));
        campaign.token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = campaign.token.balanceOf(address(this)) - balanceBefore;
        if (received != amount) revert UnsupportedToken();

        campaign.remaining += amount;
        emit CampaignFunded(campaignId, amount, campaign.remaining);
    }

    function setCampaignPaused(bytes32 campaignId, bool campaignPaused)
        external
        onlyRole(OPERATOR_ROLE)
    {
        Campaign storage campaign = _campaign(campaignId);
        if (campaign.closed) revert CampaignUnavailable();
        campaign.paused = campaignPaused;
        emit CampaignPauseChanged(campaignId, campaignPaused);
    }

    function closeCampaign(bytes32 campaignId) external onlyRole(OPERATOR_ROLE) {
        Campaign storage campaign = _campaign(campaignId);
        if (campaign.closed) revert CampaignUnavailable();
        campaign.closed = true;
        campaign.paused = true;
        emit CampaignClosed(campaignId);
    }

    function withdrawRemainder(bytes32 campaignId, address recipient)
        external
        onlyRole(OPERATOR_ROLE)
        nonReentrant
    {
        if (recipient == address(0)) revert ZeroAddress();
        Campaign storage campaign = _campaign(campaignId);
        if (!campaign.closed && block.timestamp <= campaign.endsAt) revert CampaignStillActive();

        uint256 amount = campaign.remaining;
        campaign.remaining = 0;
        campaign.token.safeTransfer(recipient, amount);
        emit CampaignRemainderWithdrawn(campaignId, recipient, amount);
    }

    function setClaimSigner(address signer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (signer == address(0)) revert ZeroAddress();
        address previousSigner = claimSigner;
        claimSigner = signer;
        emit ClaimSignerChanged(previousSigner, signer);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function claim(
        bytes32 campaignId,
        bytes32 completionId,
        bytes32 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        Campaign storage campaign = _campaign(campaignId);
        if (
            campaign.paused ||
            campaign.closed ||
            block.timestamp < campaign.startsAt ||
            block.timestamp > campaign.endsAt
        ) {
            revert CampaignUnavailable();
        }
        if (deadline < block.timestamp) revert ClaimExpired();
        if (!dojangScroll.isVerified(msg.sender, attesterId)) revert NotVerified();
        if (hasClaimed[campaignId][msg.sender]) revert AlreadyClaimed();
        if (campaign.remaining < campaign.rewardPerClaim) revert InsufficientBudget();

        bytes32 authorizationKey = authorizationKeyFor(campaignId, msg.sender, nonce);
        if (_usedAuthorizations[authorizationKey]) revert AuthorizationUsed();

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, campaignId, msg.sender, completionId, nonce, deadline)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        if (!SignatureChecker.isValidSignatureNow(claimSigner, digest, signature)) {
            revert InvalidClaimSignature();
        }

        _usedAuthorizations[authorizationKey] = true;
        hasClaimed[campaignId][msg.sender] = true;
        campaign.remaining -= campaign.rewardPerClaim;
        campaign.claimCount += 1;
        campaign.token.safeTransfer(msg.sender, campaign.rewardPerClaim);

        emit LearningRewardClaimed(
            campaignId,
            msg.sender,
            completionId,
            address(campaign.token),
            campaign.rewardPerClaim
        );
    }

    function authorizationUsed(bytes32 campaignId, address learner, bytes32 nonce)
        external
        view
        returns (bool)
    {
        return _usedAuthorizations[authorizationKeyFor(campaignId, learner, nonce)];
    }

    function authorizationKeyFor(bytes32 campaignId, address learner, bytes32 nonce)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(campaignId, learner, nonce));
    }

    function _campaign(bytes32 campaignId) private view returns (Campaign storage campaign) {
        campaign = campaigns[campaignId];
        if (address(campaign.token) == address(0)) revert CampaignNotFound();
    }
}
