
require("dotenv").config();

const Mocha = require("mocha");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Read test file and report settings from command-line arguments.
const testFile = process.argv[2];
const reportDir = process.argv[3] || "reports/processor-portal";
const reportFilename = process.argv[4] || "ProcessorPortalReport";

if (!testFile) {
  console.error("Please provide a test file path.");
  process.exit(1);
}

const reportPath = path.resolve(
  reportDir,
  `${reportFilename}.html`
);

async function sendReportEmail(stats) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const status = stats.failures === 0 ? "PASSED" : "FAILED";

  const attachments = [];

  if (fs.existsSync(reportPath)) {
    attachments.push({
      filename: `${reportFilename}.html`,
      path: reportPath,
    });
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: `Selenium Automation Report - ${status}`,
    html: `
      <h2>WCS Automation Test Report</h2>
      <p><b>Status:</b> ${status}</p>
      <p><b>Total Tests:</b> ${stats.tests}</p>
      <p><b>Passed:</b> ${stats.passes}</p>
      <p><b>Failed:</b> ${stats.failures}</p>
      <p><b>Pending:</b> ${stats.pending}</p>
      <p><b>Duration:</b> ${stats.duration} ms</p>
      <p>Please find the Mochawesome HTML report attached.</p>
    `,
    attachments,
  });

  console.log("✓ Test report email sent successfully.");
}

async function runTests() {
  const mocha = new Mocha({
    timeout: 120000,
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: path.resolve(reportDir),
      reportFilename,
      html: true,
      json: true,
      overwrite: true,
    },
  });

  mocha.addFile(path.resolve(testFile));

  const runner = mocha.run(async (failures) => {
    try {
      console.log("\n========== TEST SUMMARY ==========");
      console.log("Total:", runner.stats.tests);
      console.log("Passed:", runner.stats.passes);
      console.log("Failed:", runner.stats.failures);
      console.log("Pending:", runner.stats.pending);

      await sendReportEmail(runner.stats);

    } catch (error) {
      console.error("Email sending failed:", error.message);
      process.exitCode = 2;
      return;
    }

    // Preserve the test result as the command exit code.
    process.exitCode = failures > 0 ? 1 : 0;
  });
}

runTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exitCode = 1;
});
