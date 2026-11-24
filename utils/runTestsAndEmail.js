
require("dotenv").config();

const Mocha = require("mocha");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

// Read test file and report settings from command-line arguments.
const testFile = process.argv[2];
const reportDir = process.argv[3] || "reports/processor-portal";
const reportFilename = process.argv[4] || "ProcessorPortalReport";

if (!testFile) {
  console.error("Please provide a test file path.");
  process.exit(1);
}

const absoluteReportDir = path.resolve(reportDir);

const htmlReportPath = path.join(
  absoluteReportDir,
  `${reportFilename}.html`
);

const pdfReportPath = path.join(
  absoluteReportDir,
  `${reportFilename}.pdf`
);

// Convert Mochawesome HTML report into PDF.
async function generatePDF() {
  if (!fs.existsSync(htmlReportPath)) {
    throw new Error(
      `Mochawesome HTML report not found: ${htmlReportPath}`
    );
  }

  console.log("\nGenerating PDF report...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 1000
    });

    await page.goto(pathToFileURL(htmlReportPath).href, {
      waitUntil: "networkidle0",
      timeout: 120000
    });

    await page.emulateMediaType("screen");

    await page.pdf({
      path: pdfReportPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:8px; width:100%; text-align:center;">
          WCS Automation Test Report
        </div>
      `,
      footerTemplate: `
        <div style="font-size:8px; width:100%; text-align:center;">
          Page <span class="pageNumber"></span>
          of <span class="totalPages"></span>
        </div>
      `,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "10mm",
        right: "10mm"
      }
    });

    console.log("✓ PDF report generated:", pdfReportPath);

  } finally {
    await browser.close();
  }
}

// Send HTML and PDF reports through email.
async function sendReportEmail(stats) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const status = stats.failures === 0 ? "PASSED" : "FAILED";

  const attachments = [];

  // Attach PDF report.
  if (fs.existsSync(pdfReportPath)) {
    attachments.push({
      filename: `${reportFilename}.pdf`,
      path: pdfReportPath,
      contentType: "application/pdf"
    });
  }

  // Attach original HTML report.
  if (fs.existsSync(htmlReportPath)) {
    attachments.push({
      filename: `${reportFilename}.html`,
      path: htmlReportPath,
      contentType: "text/html"
    });
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: `Selenium Automation Report - ${status}`,

    html: `
      <div style="font-family:Arial,sans-serif; line-height:1.6;">
        <h2>WCS Automation Test Report</h2>

        <p>
          <b>Status:</b>
          <span style="color:${stats.failures === 0 ? "green" : "red"};">
            ${status}
          </span>
        </p>

        <table cellpadding="8" cellspacing="0" border="1"
          style="border-collapse:collapse;">
          <tr>
            <td><b>Total Tests</b></td>
            <td>${stats.tests}</td>
          </tr>
          <tr>
            <td><b>Passed</b></td>
            <td>${stats.passes}</td>
          </tr>
          <tr>
            <td><b>Failed</b></td>
            <td>${stats.failures}</td>
          </tr>
          <tr>
            <td><b>Pending</b></td>
            <td>${stats.pending}</td>
          </tr>
          <tr>
            <td><b>Duration</b></td>
            <td>${(stats.duration / 1000).toFixed(2)} seconds</td>
          </tr>
        </table>

        <p>
          Please find the PDF and HTML automation reports attached.
        </p>

        <p>
          The PDF is recommended for reading and sharing.
          The HTML report contains the interactive test details.
        </p>

        <br>
        <p>Regards,<br>QA Automation Team</p>
      </div>
    `,

    attachments
  });

  console.log("✓ Test report email sent successfully.");
}

// Execute Mocha tests.
async function runTests() {
  // Ensure report directory exists.
  fs.mkdirSync(absoluteReportDir, { recursive: true });

  const mocha = new Mocha({
    timeout: 120000,
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: absoluteReportDir,
      reportFilename,
      html: true,
      json: true,
      overwrite: true
    }
  });

  mocha.addFile(path.resolve(testFile));

  const runner = mocha.run(async (failures) => {
    try {
      console.log("\n========== TEST SUMMARY ==========");
      console.log("Total:", runner.stats.tests);
      console.log("Passed:", runner.stats.passes);
      console.log("Failed:", runner.stats.failures);
      console.log("Pending:", runner.stats.pending);
      console.log(
        "Duration:",
        (runner.stats.duration / 1000).toFixed(2),
        "seconds"
      );

      // First generate PDF from the HTML report.
      await generatePDF();

      // Then send both attachments.
      await sendReportEmail(runner.stats);

    } catch (error) {
      console.error("Report generation/email failed:", error);
      process.exitCode = 2;
      return;
    }

    // Preserve test result as command exit code.
    process.exitCode = failures > 0 ? 1 : 0;
  });
}

runTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exitCode = 1;
});
