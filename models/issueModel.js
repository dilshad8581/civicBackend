const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueTitle: {
      type: String,
      required: true,
    },
    issueType: {
      type: String,
      required: true,
      enum: [
        "Garbage",
        "Road Damage",
        "Water Leakage",
        "Streetlight Issue",
        "Drainage Problem",
        "Other",
      ],
    },
    priorityLevel: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    address: {
      type: String,
      default: "",
    },
    landmark: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [
      {
        type: String, // ImageKit URLs
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
