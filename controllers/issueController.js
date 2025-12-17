const Issue = require("../models/issueModel");

// CREATE ISSUE
exports.createIssue = async (req, res) => {
  try {
    const {
      issueTitle,
      issueType,
      priorityLevel,
      address,
      landmark,
      description,
      location,
      images, // Array of ImageKit URLs from client-side upload
    } = req.body;

    // Parse location if it's a string
    let parsedLocation = location;
    if (typeof location === "string" && location) {
      parsedLocation = JSON.parse(location);
    }

    const newIssue = new Issue({
      issueTitle,
      issueType,
      priorityLevel,
      address,
      landmark,
      description,
      location: parsedLocation,
      images: images || [],
      reportedBy: req.user.userId,
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue reported successfully",
      issue: newIssue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL ISSUES (with filters)
exports.getAllIssues = async (req, res) => {
  try {
    const { status, issueType, priorityLevel, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;
    if (priorityLevel) filter.priorityLevel = priorityLevel;

    const issues = await Issue.find(filter)
      .populate("reportedBy", "name username email")
      .populate("assignedTo", "name username email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Issue.countDocuments(filter);

    res.json({
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalIssues: total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE ISSUE
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name username email")
      .populate("assignedTo", "name username email");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET USER'S ISSUES
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ISSUE (by reporter)
exports.updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Only allow the reporter to update their own issue
    if (issue.reportedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this issue" });
    }

    // Only allow updates if status is still Pending
    if (issue.status !== "Pending") {
      return res.status(400).json({ message: "Cannot update issue once it's being processed" });
    }

    const {
      issueTitle,
      issueType,
      priorityLevel,
      address,
      landmark,
      description,
      location,
      images, // Array of ImageKit URLs from client-side upload
    } = req.body;

    // Parse location if it's a string
    let parsedLocation = location;
    if (typeof location === "string" && location) {
      parsedLocation = JSON.parse(location);
    }

    if (issueTitle) issue.issueTitle = issueTitle;
    if (issueType) issue.issueType = issueType;
    if (priorityLevel) issue.priorityLevel = priorityLevel;
    if (address !== undefined) issue.address = address;
    if (landmark !== undefined) issue.landmark = landmark;
    if (description !== undefined) issue.description = description;
    if (parsedLocation) issue.location = parsedLocation;
    if (images) issue.images = images;

    await issue.save();

    res.json({ message: "Issue updated successfully", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ISSUE STATUS (Admin/Volunteer)
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (status) issue.status = status;
    if (assignedTo) issue.assignedTo = assignedTo;

    await issue.save();

    const updatedIssue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name username email")
      .populate("assignedTo", "name username email");

    res.json({ message: "Issue status updated", issue: updatedIssue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ISSUE
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Only allow the reporter or admin to delete
    if (issue.reportedBy.toString() !== req.user.userId && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to delete this issue" });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ISSUE STATS (for dashboard)
exports.getIssueStats = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: "Pending" });
    const inProgressIssues = await Issue.countDocuments({ status: "In Progress" });
    const resolvedIssues = await Issue.countDocuments({ status: "Resolved" });

    const issuesByType = await Issue.aggregate([
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
    ]);

    const issuesByPriority = await Issue.aggregate([
      { $group: { _id: "$priorityLevel", count: { $sum: 1 } } },
    ]);

    res.json({
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      issuesByType,
      issuesByPriority,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
