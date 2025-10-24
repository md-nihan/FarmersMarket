const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Check freshness of uploaded image by calling Python AI service
router.post("/check", upload.single("image"), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded"
      });
    }

    // For now, we'll simulate the AI analysis with random results
    // In a real implementation, this would call the Python AI service
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random results for demonstration
    const freshnessOptions = ["Fresh", "Half-Fresh", "Rotten"];
    const freshness = freshnessOptions[Math.floor(Math.random() * freshnessOptions.length)];
    const confidence = (Math.random() * 0.5 + 0.5).toFixed(2); // 0.5 - 1.0
    
    // Determine quality grade based on freshness
    let qualityGrade = "pending";
    let qualityScore = 0;
    
    if (freshness === "Fresh") {
      qualityGrade = "Grade A";
      qualityScore = Math.round(80 + (confidence * 20)); // 80-100
    } else if (freshness === "Half-Fresh") {
      qualityGrade = "Grade B";
      qualityScore = Math.round(50 + (confidence * 30)); // 50-80
    } else {
      qualityGrade = "Grade C";
      qualityScore = Math.round(confidence * 50); // 0-50
    }

    // Remove temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      freshness: freshness,
      confidence: confidence,
      quality_grade: qualityGrade,
      quality_score: qualityScore
    });
  } catch (error) {
    console.error("Error checking freshness:", error);
    res.status(500).json({
      success: false,
      message: "Error checking freshness",
      error: error.message
    });
  }
});

module.exports = router;