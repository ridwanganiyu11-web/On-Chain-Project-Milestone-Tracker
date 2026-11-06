// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProjectMilestoneTracker (MilestoneChain)
 * @notice Track Progress. Prove Completion. Build Trust.
 * @dev Lightweight on-chain project milestone tracker for Botchain Testnet (Chain ID 968).
 *      Anyone can create a public project; only the project creator (owner) can add or complete milestones.
 *      Milestone descriptions and project descriptions are capped to keep gas/storage costs low.
 */
contract ProjectMilestoneTracker {
    uint256 public constant MAX_PROJECT_NAME_LENGTH = 100;
    uint256 public constant MAX_PROJECT_DESC_LENGTH = 280;
    uint256 public constant MAX_MILESTONE_NAME_LENGTH = 140;
    uint256 public constant MAX_MILESTONES_PER_PROJECT = 50;

    struct Milestone {
        uint256 index;
        string name;
        bool completed;
        uint256 completedAt;
        uint256 createdAt;
    }

    struct Project {
        uint256 id;
        string name;
        string description;
        address owner;
        uint256 createdAt;
        uint256 milestoneCount;
        uint256 completedCount;
        bool exists;
    }

    uint256 private _projectCount;
    uint256 public totalMilestonesCreated;
    uint256 public totalMilestonesCompleted;

    // projectId (1-indexed: 1 .. _projectCount) => Project
    mapping(uint256 => Project) private _projects;

    // projectId => array of Milestones
    mapping(uint256 => Milestone[]) private _projectMilestones;

    // owner address => list of projectIds created by owner
    mapping(address => uint256[]) private _ownerProjects;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        string name,
        string description,
        uint256 timestamp
    );

    event MilestoneAdded(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed owner,
        string name,
        uint256 timestamp
    );

    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed owner,
        string name,
        uint256 completedAt
    );

    error ProjectNotFound(uint256 projectId);
    error NotProjectOwner(uint256 projectId, address caller, address owner);
    error InvalidProjectName();
    error InvalidProjectDescription();
    error InvalidMilestoneName();
    error MaxMilestonesReached(uint256 projectId);
    error MilestoneNotFound(uint256 projectId, uint256 milestoneIndex);
    error MilestoneAlreadyCompleted(uint256 projectId, uint256 milestoneIndex);

    modifier onlyExistingProject(uint256 projectId) {
        if (!_projects[projectId].exists) {
            revert ProjectNotFound(projectId);
        }
        _;
    }

    modifier onlyProjectOwner(uint256 projectId) {
        Project storage proj = _projects[projectId];
        if (!proj.exists) {
            revert ProjectNotFound(projectId);
        }
        if (proj.owner != msg.sender) {
            revert NotProjectOwner(projectId, msg.sender, proj.owner);
        }
        _;
    }

    /**
     * @notice Create a new project on MilestoneChain.
     * @param name Short name of the project (1-100 bytes).
     * @param description Short description of the project (0-280 bytes).
     * @return projectId The 1-indexed ID of the newly created project.
     */
    function createProject(
        string calldata name,
        string calldata description
    ) external returns (uint256 projectId) {
        return _createProjectInternal(name, description);
    }

    /**
     * @notice Create a new project and populate its initial milestones in a single transaction.
     * @param name Short name of the project (1-100 bytes).
     * @param description Short description of the project (0-280 bytes).
     * @param milestoneNames Array of short milestone titles to add immediately.
     * @return projectId The 1-indexed ID of the newly created project.
     */
    function createProjectWithMilestones(
        string calldata name,
        string calldata description,
        string[] calldata milestoneNames
    ) external returns (uint256 projectId) {
        if (milestoneNames.length > MAX_MILESTONES_PER_PROJECT) {
            revert MaxMilestonesReached(0);
        }
        projectId = _createProjectInternal(name, description);
        for (uint256 i = 0; i < milestoneNames.length; i++) {
            _addMilestoneInternal(projectId, milestoneNames[i]);
        }
    }

    /**
     * @notice Add a milestone to an existing project. Only callable by the project owner.
     * @param projectId The ID of the project.
     * @param name Short milestone name (1-140 bytes).
     * @return milestoneIndex The 0-indexed position of the newly added milestone.
     */
    function addMilestone(
        uint256 projectId,
        string calldata name
    ) external onlyProjectOwner(projectId) returns (uint256 milestoneIndex) {
        return _addMilestoneInternal(projectId, name);
    }

    /**
     * @notice Mark a milestone as completed and permanently record the completion timestamp on-chain.
     *         Only callable by the project owner.
     * @param projectId The ID of the project.
     * @param milestoneIndex The 0-indexed milestone index within the project.
     */
    function completeMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external onlyProjectOwner(projectId) {
        Milestone[] storage milestones = _projectMilestones[projectId];
        if (milestoneIndex >= milestones.length) {
            revert MilestoneNotFound(projectId, milestoneIndex);
        }

        Milestone storage m = milestones[milestoneIndex];
        if (m.completed) {
            revert MilestoneAlreadyCompleted(projectId, milestoneIndex);
        }

        m.completed = true;
        m.completedAt = block.timestamp;

        _projects[projectId].completedCount += 1;
        totalMilestonesCompleted += 1;

        emit MilestoneCompleted(
            projectId,
            milestoneIndex,
            msg.sender,
            m.name,
            block.timestamp
        );
    }

    /**
     * @notice Read project information by ID.
     */
    function getProject(
        uint256 projectId
    )
        external
        view
        onlyExistingProject(projectId)
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address owner,
            uint256 createdAt,
            uint256 milestoneCount,
            uint256 completedCount,
            bool exists
        )
    {
        Project storage p = _projects[projectId];
        return (
            p.id,
            p.name,
            p.description,
            p.owner,
            p.createdAt,
            p.milestoneCount,
            p.completedCount,
            p.exists
        );
    }

    /**
     * @notice Read a single milestone's details by project ID and milestone index.
     */
    function getMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    )
        external
        view
        onlyExistingProject(projectId)
        returns (
            uint256 index,
            string memory name,
            bool completed,
            uint256 completedAt,
            uint256 createdAt
        )
    {
        Milestone[] storage milestones = _projectMilestones[projectId];
        if (milestoneIndex >= milestones.length) {
            revert MilestoneNotFound(projectId, milestoneIndex);
        }
        Milestone storage m = milestones[milestoneIndex];
        return (m.index, m.name, m.completed, m.completedAt, m.createdAt);
    }

    /**
     * @notice Read all milestones for a given project in a single RPC call.
     */
    function getProjectMilestones(
        uint256 projectId
    ) external view onlyExistingProject(projectId) returns (Milestone[] memory) {
        return _projectMilestones[projectId];
    }

    /**
     * @notice Count total registered projects on MilestoneChain.
     */
    function getProjectCount() external view returns (uint256) {
        return _projectCount;
    }

    /**
     * @notice Get all project IDs created by a specific wallet address.
     */
    function getOwnerProjects(address owner) external view returns (uint256[] memory) {
        return _ownerProjects[owner];
    }

    function _createProjectInternal(
        string calldata name,
        string calldata description
    ) internal returns (uint256 projectId) {
        uint256 nameLen = bytes(name).length;
        if (nameLen == 0 || nameLen > MAX_PROJECT_NAME_LENGTH) {
            revert InvalidProjectName();
        }
        if (bytes(description).length > MAX_PROJECT_DESC_LENGTH) {
            revert InvalidProjectDescription();
        }

        _projectCount += 1;
        projectId = _projectCount;

        _projects[projectId] = Project({
            id: projectId,
            name: name,
            description: description,
            owner: msg.sender,
            createdAt: block.timestamp,
            milestoneCount: 0,
            completedCount: 0,
            exists: true
        });

        _ownerProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, name, description, block.timestamp);
    }

    function _addMilestoneInternal(
        uint256 projectId,
        string calldata name
    ) internal returns (uint256 milestoneIndex) {
        uint256 nameLen = bytes(name).length;
        if (nameLen == 0 || nameLen > MAX_MILESTONE_NAME_LENGTH) {
            revert InvalidMilestoneName();
        }

        Milestone[] storage milestones = _projectMilestones[projectId];
        if (milestones.length >= MAX_MILESTONES_PER_PROJECT) {
            revert MaxMilestonesReached(projectId);
        }

        milestoneIndex = milestones.length;
        milestones.push(
            Milestone({
                index: milestoneIndex,
                name: name,
                completed: false,
                completedAt: 0,
                createdAt: block.timestamp
            })
        );

        _projects[projectId].milestoneCount += 1;
        totalMilestonesCreated += 1;

        emit MilestoneAdded(
            projectId,
            milestoneIndex,
            msg.sender,
            name,
            block.timestamp
        );
    }
}

