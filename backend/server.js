const express = require("express");
const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isBetween = require("dayjs/plugin/isBetween");
require("dotenv").config();


dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
const app = express();
const port = 5000;

// Enable CORS for React frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://qualitydashboard.netlify.app"); // React app URL
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// Path to your service account key file
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

// Set up Google Sheets API client
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

// Replace this with your actual Google Sheet ID
const SPREADSHEET_ID = "1fNa6yh3XZRP5Vg36QqkeR9wTwiONsXPHvqyb0l9mPKE"; // Find this in your Google Sheet URL

app.use(express.json());

// Route to fetch data from Google Sheets and calculate the average of Column A
app.post("/getAuditCount", async (req, res) => {
  const { selectedCategory, startDate, endDate } = req.body;

  const start = startDate
    ? dayjs(startDate).tz("Asia/Kolkata").startOf("day")
    : null;
  const end = endDate
    ? dayjs(endDate).tz("Asia/Kolkata").endOf("day")
    : null;

  if (!start || !end) {
    return res.status(400).json({ error: "Invalid date range" });
  }

  const sheetName = selectedCategory === "BEPC" ? "Sheet1" : "Sheet2";

  try {
    const range = `${sheetName}!A2:D`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const values = response.data.values || [];

    const filteredNumbers = values
      .map((row) => {
        const rawDate = row[3] && dayjs(row[3], "YYYY-MM-DD");
        const date =
          rawDate &&
          (dayjs(rawDate, "MM/DD/YYYY", true).isValid()
            ? dayjs(rawDate, "MM/DD/YYYY").tz("Asia/Kolkata")
            : dayjs(rawDate, "YYYY-MM-DD", true).tz("Asia/Kolkata")); // Assuming column D (index 3) contains dates
        const value = parseFloat(row[0]); // Assuming column A (index 0) contains the value

        if (date && value && date.isBetween(start, end, null, "[]")) {
          return value;
        }
        return null;
      })
      .filter((value) => value !== null);

    if (filteredNumbers.length > 0) {
      const average =
        filteredNumbers.reduce((acc, curr) => acc + curr, 0) /
        filteredNumbers.length;
      const roundedAverage = average.toFixed(0);
      res.json({ auditcount: roundedAverage });
    } else {
      console.log("No valid numbers found in the date range.");
      res
        .status(400)
        .json({ error: "No valid numbers found in the date range" });
    }
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


// Route to fetch week and corresponding count data from Columns B and C
app.post("/getTrendData", async (req, res) => {
  const { selectedCategory, startDate, endDate } = req.body;

  const start = startDate
    ? dayjs(startDate, "YYYY-MM-DD").startOf("day")
    : null;
  const end = endDate ? dayjs(endDate, "YYYY-MM-DD").endOf("day") : null;

  if (!start || !end) {
    return res.status(400).json({ error: "Invalid date range" });
  }

  const sheetName = selectedCategory === "BEPC" ? "Sheet1" : "Sheet2";
  try {
    const range = `${sheetName}!B2:D`;
    const response_1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const values = response_1.data.values || [];

    const filteredNumbers = values
      .map((row) => {
        const rawDate = row[2] && dayjs(row[2], "YYYY-MM-DD");
        const date =
          rawDate &&
          (dayjs(rawDate, "MM/DD/YYYY", true).isValid()
            ? dayjs(rawDate, "MM/DD/YYYY")
            : dayjs(rawDate, "YYYY-MM-DD", true)); // Assuming column D (index 3) contains dates

        if (date && date.isBetween(start, end, null, "[]")) {
          return row;
        }
        return null;
      })
      .filter((row) => row !== null);

    if (!filteredNumbers || filteredNumbers.length === 0) {
      console.error("No data found in the specified range.");
      return res.status(500).json({ error: "No data found" });
    }

    const trendData = {};

    filteredNumbers.forEach((row) => {
      const week = row[0]; // Week value (e.g., "week 1")

      if (trendData[week]) {
        trendData[week] += 1;
      } else {
        trendData[week] = 1;
      }
    });

    const trendDataArray = Object.keys(trendData)
      .sort((a, b) => {
        const weekA = parseInt(a.split(" ")[1], 10);
        const weekB = parseInt(b.split(" ")[1], 10);
        return weekA - weekB;
      })
      .map((week) => ({
        week,
        count: trendData[week],
      }));

    console.log("Trend Data Array:", trendDataArray);

    res.json({ trendData: trendDataArray });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/getFunnelData", async (req, res) => {
  console.log("Received request to /getFunnelData");

  const { selectedCategory, startDate, endDate } = req.body;
  console.log("Request Body:", req.body);

  // Select the sheet based on the selectedCategory (not comparing with the category in data)
  const sheetName = selectedCategory === "BEPC" ? "Sheet1" : "Sheet2";
  console.log("Fetching data from sheet:", sheetName);

  try {
    const range = `${sheetName}!C2:D`; // Assuming columns A to D include date, category, funnel stage, etc.
    const response_2 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const values = response_2.data.values;

    // Parse the startDate and endDate using dayjs
    const start = startDate
      ? dayjs(startDate, "YYYY-MM-DD").startOf("day")
      : null;
    const end = endDate ? dayjs(endDate, "YYYY-MM-DD").endOf("day") : null;

    if (!start || !end) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    // Filter values based on date range using dayjs
    const filteredValues = values.filter((row) => {
      const dateStr = row[1]; // Assuming the date is in column B (adjust accordingly)
      const funnelStage = row[0]; // Assuming the funnel stage is in column A (adjust accordingly)

      // Parse the date using dayjs
      const date = dayjs(dateStr, "YYYY-MM-DD", true); // Assuming date is in YYYY-MM-DD format

      // Check if the date is valid and falls within the specified range
      const isInRange =
        date.isValid() && date.isBetween(start, end, null, "[]"); // '[]' includes start and end dates

      return isInRange;
    });

    if (filteredValues.length === 0) {
      console.log("No data after filtering. Please check date range.");
    }

    const funnelData = {};
    console.log("Starting to populate funnelData...");

    // Count occurrences of each funnel stage in the filtered data
    filteredValues.forEach((row) => {
      const funnelStage = row[0]; // The funnel stage (like "Stage 1", "Stage 2") is in column A

      // Count the occurrences of each funnel stage
      if (funnelData[funnelStage]) {
        funnelData[funnelStage] += 1;
      } else {
        funnelData[funnelStage] = 1;
      }
    });

    const funnelDataArray = Object.keys(funnelData).map((funnelStage) => ({
      category: funnelStage, // The "funnel stage" is the category for the chart
      count: funnelData[funnelStage],
    }));

    // Send the response with the filtered and counted funnel data
    res.json({ funnelData: funnelDataArray });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/getAuditSplit", async (req, res) => {
  const { selectedCategory, startDate, endDate } = req.body;
  const sheetName = selectedCategory === "BEPC" ? "Sheet1" : "Sheet2";
  console.log("Fetching split_data from sheet:", sheetName);
  try {
    const range = `${sheetName}!B2:D`; // Week in column B, category in column C
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    console.log("Fetching data from", range);

    const values = response.data.values;

    // Parse the startDate and endDate using dayjs
    const start = startDate
      ? dayjs(startDate, "YYYY-MM-DD").startOf("day")
      : null;
    const end = endDate ? dayjs(endDate, "YYYY-MM-DD").endOf("day") : null;

    if (!start || !end) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    // Filter values based on date range using dayjs
    const filteredValues = values.filter((row) => {
      const dateStr = row[2]; // Assuming the date is in column B (adjust accordingly)
      const funnelStage = row[1];
      const week_1 = row[0]; // Assuming the funnel stage is in column A (adjust accordingly)

      // Parse the date using dayjs
      const date = dayjs(dateStr, "YYYY-MM-DD", true); // Assuming date is in YYYY-MM-DD format

      // Check if the date is valid and falls within the specified range
      const isInRange =
        date.isValid() && date.isBetween(start, end, null, "[]"); // '[]' includes start and end dates

      return isInRange;
    });

    console.log("filteredValues_Split", filteredValues);

    if (filteredValues.length === 0) {
      console.log("No data after filtering. Please check date range.");
    }

    // Initialize an object to store counts
    const splitData = {};

    // Iterate over rows and calculate counts
    filteredValues.forEach((row) => {
      const week = row[0]; // Week value (e.g., "Week 1")
      const category = row[1]; // Category value (e.g., "ORM", "BAU", etc.)

      if (!splitData[week]) {
        splitData[week] = {}; // Create an object for each week
      }

      if (splitData[week][category]) {
        splitData[week][category] += 1; // Increment the count for the category
      } else {
        splitData[week][category] = 1; // Initialize the count for the category
      }
    });

    // Convert splitData to an array format suitable for the frontend
    const splitDataArray = Object.keys(splitData)
      .sort((a, b) => {
        // Extract the numeric part of the week (e.g., 'week 1' => 1)
        const weekA = parseInt(a.split(" ")[1], 10);
        const weekB = parseInt(b.split(" ")[1], 10);
        return weekA - weekB; // Sort numerically
      })
      .map((week) => ({
        week,
        categories: Object.keys(splitData[week]).map((category) => ({
          category,
          count: splitData[week][category],
        })),
      }));

    res.json({ splitData: splitDataArray });
    console.log("splitData", splitData);
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/getAuditData", async (req, res) => {
  const { selectedCategory, startDate, endDate } = req.body;
  const sheetName = selectedCategory === "BEPC" ? "Sheet1" : "Sheet2";
  try {
    const range = `${sheetName}!D2:H`; // AgentName, TeamLeader, FatalCount, QualityScore are in columns E to H
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const values = response.data.values;

    const start = startDate
      ? dayjs(startDate, "YYYY-MM-DD").startOf("day")
      : null;
    const end = endDate ? dayjs(endDate, "YYYY-MM-DD").endOf("day") : null;

    if (!start || !end) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const filteredValue = values.filter((row) => {
      const dateStr = row[0];
      const agent = row[1];
      const lead = row[2];
      const fatal = row[3];
      const quality = row[4];

      const date = dayjs(dateStr, "YYYY-MM-DD", true);

      const isInRange = date.isValid() && date.isBetween(start, end, null, []);

      return isInRange;
    });

    console.log("filteredValue", filteredValue);

    if (filteredValue.length === 0) {
      console.log("No data after filtering. Please check date range.");
    }

    // Create an object to track the count of appearances (TotalAudit) for each agent
    const agentData = {};

    filteredValue.forEach((row) => {
      const agentName = row[1]; // AgentName
      const teamLeader = row[2]; // TeamLeader
      const fatalCount = parseInt(row[3], 10); // FatalCount
      const qualityScore = row[4]; // QualityScore

      if (!agentData[agentName]) {
        // Initialize the agent data if not already present
        agentData[agentName] = {
          TeamLeader: teamLeader,
          FatalCount: fatalCount,
          QualityScore: qualityScore,
          TotalAudit: 0, // Initialize TotalAudit
        };
      }

      // Increment TotalAudit count for each appearance of the agent
      agentData[agentName].TotalAudit += 1;
    });

    // Convert the aggregated data to an array for sending to the frontend
    const finalData = Object.keys(agentData).map((agentName) => ({
      AgentName: agentName,
      TeamLeader: agentData[agentName].TeamLeader,
      FatalCount: agentData[agentName].FatalCount,
      QualityScore: agentData[agentName].QualityScore,
      TotalAudit: agentData[agentName].TotalAudit,
    }));

    // Send the aggregated data as response
    res.json({ rowData: finalData });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
