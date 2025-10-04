import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, insertLeadershipValueSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { authenticateToken, loginUser, registerUser } from "./jwt-auth";
import { sendEmail } from './email';
import { extractFirstName } from "@/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Simple health check endpoint (for basic pings)
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  // Comprehensive health check endpoint to keep Render instance alive
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connectivity
      await storage.getAllLeadershipValues();
      
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected"
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Authentication endpoints
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const result = await loginUser(username, password);
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const result = await registerUser(username, password);
      if (!result) {
        return res.status(400).json({ message: "Username already exists" });
      }

      res.status(201).json({
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user", authenticateToken, (req, res) => {
    res.json(req.user);
  });

  app.post("/api/logout", (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: "Logged out successfully" });
  });
  
  // API routes
  app.post("/api/submissions", async (req, res) => {
    try {
      // Validate the request body
      const submissionData = insertSubmissionSchema.parse(req.body);
      
      // Store the submission data
      const submission = await storage.createSubmission(submissionData);
      
      res.status(201).json({
        message: "Submission recorded successfully",
        data: submission
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          message: "Invalid submission data",
          errors: validationError.message
        });
      } else {
        console.error("Error handling submission:", error);
        res.status(500).json({
          message: "An error occurred while processing your submission"
        });
      }
    }
  });

  // Get all leadership values
  app.get("/api/leadership-values", async (req, res) => {
    try {
      const values = await storage.getAllLeadershipValues();
      res.json(values);
    } catch (error) {
      console.error("Error fetching leadership values:", error);
      res.status(500).json({
        message: "An error occurred while fetching leadership values"
      });
    }
  });
  
  // Create a new leadership value
  app.post("/api/leadership-values", authenticateToken, async (req, res) => {
    try {
      // Validate the request body
      const valueData = insertLeadershipValueSchema.parse(req.body);
      
      // Store the leadership value
      const value = await storage.createLeadershipValue(valueData);
      
      res.status(201).json({
        message: "Leadership value created successfully",
        data: value
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          message: "Invalid leadership value data",
          errors: validationError.message
        });
      } else {
        console.error("Error creating leadership value:", error);
        res.status(500).json({
          message: "An error occurred while creating the leadership value"
        });
      }
    }
  });
  
  // Get a specific leadership value by ID
  app.get("/api/leadership-values/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const value = await storage.getLeadershipValueById(id);
      if (!value) {
        return res.status(404).json({ message: "Leadership value not found" });
      }
      
      res.json(value);
    } catch (error) {
      console.error("Error fetching leadership value:", error);
      res.status(500).json({
        message: "An error occurred while fetching the leadership value"
      });
    }
  });
  
  // Update a leadership value
  app.put("/api/leadership-values/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check if the value exists
      const existingValue = await storage.getLeadershipValueById(id);
      if (!existingValue) {
        return res.status(404).json({ message: "Leadership value not found" });
      }
      
      // Validate and update the value
      const valueData = insertLeadershipValueSchema.parse(req.body);
      
      const updatedValue = await storage.updateLeadershipValue(id, valueData);
      
      res.json({
        message: "Leadership value updated successfully",
        data: updatedValue
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          message: "Invalid leadership value data",
          errors: validationError.message
        });
      } else {
        console.error("Error updating leadership value:", error);
        res.status(500).json({
          message: "An error occurred while updating the leadership value"
        });
      }
    }
  });
  
  // Delete a leadership value
  app.delete("/api/leadership-values/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Check if the value exists
      const existingValue = await storage.getLeadershipValueById(id);
      if (!existingValue) {
        return res.status(404).json({ message: "Leadership value not found" });
      }
      
      await storage.deleteLeadershipValue(id);
      
      res.json({
        message: "Leadership value deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting leadership value:", error);
      res.status(500).json({
        message: "An error occurred while deleting the leadership value"
      });
    }
  });

  app.post('/api/send-pdf-email', async (req, res) => {
    try {
      const { pdfBase64, userInfo, coreValues } = req.body;

      
      if (!pdfBase64 || !userInfo || !userInfo.email || !userInfo.name || !coreValues) {
        return res.status(400).json({ error: 'Missing required data' });
      }
      
      const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
      
      // Create HTML content
      const valuesList = coreValues.map((value: any, index: number) => 
        `<li>${index + 1}. <strong>${value.value}</strong>: ${value.description}</li>`
      ).join('');

      const firstName = extractFirstName(userInfo.name);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Your Leadership Values</h1>
          <p>Hello ${firstName},</p>
          <p>Thank you for completing the Leadership Values Assessment. Your PDF is attached to this email.</p>
          <h2 style="color: #3b82f6;">Your Core Leadership Values:</h2>
          <ul>
            ${valuesList}
          </ul>
          <p>Use these values to guide your leadership journey and decision-making.</p>
          <p>Best regards,<br>The Leadership Values Team</p>
        </div>
      `;
      
      const result = await sendEmail({
        to: userInfo.email,
        subject: 'Your Leadership Values Results',
        html,
        attachments: [
          {
            filename: `${firstName}_Leadership_Values.pdf`,
            content: pdfBuffer
          }
        ]
      });
      
      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to send email', details: result.error });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Get all submissions
  app.get("/api/submissions", authenticateToken, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({
        message: "An error occurred while fetching submissions"
      });
    }
  });

  // Get submissions by company code
  app.get("/api/submissions/company/:companyCode", authenticateToken, async (req, res) => {
    try {
      const { companyCode } = req.params;
      const submissions = await storage.getSubmissionsByCompanyCode(companyCode);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions by company code:", error);
      res.status(500).json({
        message: "An error occurred while fetching submissions"
      });
    }
  });

  // Get unique company codes
  app.get("/api/submissions/company-codes", authenticateToken, async (req, res) => {
    try {
      const companyCodes = await storage.getUniqueCompanyCodes();
      res.json(companyCodes);
    } catch (error) {
      console.error("Error fetching company codes:", error);
      res.status(500).json({
        message: "An error occurred while fetching company codes"
      });
    }
  });

  // Export submissions as CSV
  app.get("/api/submissions/export", authenticateToken, async (req, res) => {
    try {
      const { companyCode } = req.query;
      
      let submissions;
      if (companyCode && companyCode !== 'all') {
        submissions = await storage.getSubmissionsByCompanyCode(companyCode as string);
      } else {
        submissions = await storage.getAllSubmissions();
      }

      // Create CSV content
      const csvHeader = 'Name,Email,Company Code,Core Values,Date Submitted\n';
      const csvRows = submissions.map(submission => {
        const coreValuesList = Array.isArray(submission.coreValues) 
          ? submission.coreValues.join(', ')
          : 'No values';
        
        return [
          `"${submission.name}"`,
          `"${submission.email}"`,
          `"${submission.companyCode || ''}"`,
          `"${coreValuesList}"`,
          `"${new Date(submission.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}"`
        ].join(',');
      });

      const csvContent = csvHeader + csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="submissions${companyCode ? `_${companyCode}` : ''}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting submissions:", error);
      res.status(500).json({
        message: "An error occurred while exporting submissions"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
