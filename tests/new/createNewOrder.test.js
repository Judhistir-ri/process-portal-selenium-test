
const { expect } = require("chai");

const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");

const TestReporter = require("../../utils/testReporter");

require("dotenv").config();

describe("Processor Portal - Create New Order", function () {
  this.timeout(1200000);

  let driver;
  let loginPage;
  let newPage;

  let activeReporter = null;
  let reportStepNumber = 0;

  // =========================================================
  // REPORTING HELPER
  // =========================================================

  function addReportStep(stepName, expectedResult, actualResult, status = "PASS") {
    if (!activeReporter) return;

    reportStepNumber++;

    activeReporter.addStep(
      reportStepNumber,
      stepName,
      expectedResult,
      actualResult,
      status
    );
  }

  // =========================================================
  // SETUP
  // =========================================================

  before(async function () {
    this.timeout(300000);

    console.log("");
    console.log("==============================================");
    console.log("STARTING CREATE NEW ORDER TEST");
    console.log("==============================================");

    if (!process.env.EMAIL) {
      throw new Error("EMAIL is missing from .env file");
    }

    if (!process.env.PASSWORD) {
      throw new Error("PASSWORD is missing from .env file");
    }

    console.log("EMAIL: configured");
    console.log("PASSWORD: configured");

    driver = await getDriver();

    loginPage = new LoginPage(driver);
    newPage = new NewPage(driver);

    // Automatically capture page-object actions
    TestReporter.instrumentPageObject(loginPage, () => activeReporter);
    TestReporter.instrumentPageObject(newPage, () => activeReporter);

    console.log("Browser started.");
    console.log("Page objects initialized.");

    console.log("==============================================");
    console.log("SETUP COMPLETED");
    console.log("==============================================");
  });

  // =========================================================
  // REPORT INITIALIZATION
  // =========================================================

  beforeEach(function () {
    activeReporter = new TestReporter(driver, this);

    reportStepNumber = 0;

    const title = this.currentTest?.title || "Unnamed test";

    const testCaseId =
      (title.match(/\bTC_[A-Z0-9_]+\b/i) || [])[0] || "Not specified";

    activeReporter.addTestInfo({
      testCaseId,
      testCase: title,
      module: "Processor Portal - Create New Order",
      objective: title.replace(/^TC_[A-Z0-9_]+\s*-\s*/i, ""),
      reportingNote:
        "Steps are captured from actual page-object actions and explicit test assertions."
    });
  });

  // =========================================================
  // COMPLETE NEW ORDER FLOW
  // =========================================================

  it("TC_01 - Create New Order - Complete Flow", async function () {
    this.timeout(900000);

    console.log("");
    console.log("==============================================");
    console.log("TC_01 - CREATE NEW ORDER");
    console.log("==============================================");

    // =====================================================
    // STEP 1 - LOGIN
    // =====================================================

    console.log("STEP 1 - Login");

    await loginPage.open();

    await loginPage.login(
      process.env.EMAIL,
      process.env.PASSWORD
    );

    addReportStep(
      "Login to Processor Portal",
      "User should log in successfully with valid credentials.",
      "Login page opened and login method executed successfully."
    );

    console.log("STEP 1 PASSED - Login completed");

    // =====================================================
    // STEP 2 - WAIT FOR NEW PAGE
    // =====================================================

    console.log("STEP 2 - Wait for New Order page");

    await newPage.waitForPage();

    const currentUrl = await driver.getCurrentUrl();

    expect(currentUrl).to.include("/p/new");

    addReportStep(
      "Verify New Order page",
      "New Order page should load and URL should contain /p/new.",
      `New Order page loaded. Current URL: ${currentUrl}`
    );

    console.log("STEP 2 PASSED - New page opened");

    // =====================================================
    // STEP 3 - SELECT CUSTOMER
    // =====================================================

    console.log("STEP 3 - Selecting Customer: Redintegro2");

    await newPage.selectCustomer("Redintegro2");

    addReportStep(
      "Select Customer",
      "Customer should be selected as Redintegro2.",
      "Customer selection method executed for Redintegro2."
    );

    console.log("STEP 3 PASSED - Customer selected");

    // =====================================================
    // STEP 4 - SELECT CONTACT
    // =====================================================

    console.log("STEP 4 - Selecting Contact: ranajit Sahoo");

    await newPage.selectContact("ranajit Sahoo");

    addReportStep(
      "Select Contact",
      "Contact should be selected as ranajit Sahoo.",
      "Contact selection method executed for ranajit Sahoo."
    );

    console.log("STEP 4 PASSED - Contact selected");

    // =====================================================
    // STEP 5 - VERIFY ORIGIN
    // =====================================================

    console.log("STEP 5 - Verifying Origin: United States");

    const origin = await newPage.getOriginValue();

    expect(origin.toLowerCase()).to.include("united");

    addReportStep(
      "Verify Origin",
      "Origin should display United States.",
      `Actual Origin value: ${origin}`
    );

    console.log("STEP 5 PASSED - Origin:", origin);

    // =====================================================
    // STEP 6 - SELECT DESTINATION
    // =====================================================

    console.log("STEP 6 - Selecting Destination: Afghanistan");

    await newPage.selectDestination("Afghanistan");

    addReportStep(
      "Select Destination",
      "Destination should be selected as Afghanistan.",
      "Destination selection method executed for Afghanistan."
    );

    console.log("STEP 6 PASSED - Destination selected");

    // =====================================================
    // STEP 7 - SELECT CATEGORY
    // =====================================================

    console.log("STEP 7 - Selecting Category: Federal Government");

    await newPage.selectCategory("Federal Government");

    await newPage.waitForLoadingToFinish();

    addReportStep(
      "Select Category",
      "Category should be selected as Federal Government.",
      "Federal Government category selected and loading completed."
    );

    console.log("STEP 7 PASSED - Category selected");

    // =====================================================
    // STEP 8 - SELECT ORIGIN STATE
    // =====================================================

    console.log("STEP 8 - Selecting Origin State: Maryland");

    await newPage.selectOriginState("Maryland");

    await newPage.waitForLoadingToFinish();

    addReportStep(
      "Select Origin State",
      "Origin State should be selected as Maryland.",
      "Maryland selected and dynamic loading completed."
    );

    console.log("STEP 8 PASSED - Origin State selected");

    // =====================================================
    // STEP 9 - SELECT DOCUMENT TYPE
    // =====================================================

    console.log("STEP 9 - Selecting Document Type");

    await newPage.selectDocumentType("Federal Government (Others)");

    await newPage.waitForLoadingToFinish();

    addReportStep(
      "Select Document Type",
      "Document Type should be Federal Government (Others).",
      "Document Type selection method executed and loading completed."
    );

    console.log("STEP 9 PASSED - Document Type selected");

    // =====================================================
    // STEP 10 - SELECT ADDITIONAL SERVICES
    // =====================================================

    console.log("STEP 10 - Selecting Additional Services");

    await newPage.selectAdditionalServices(driver);

    await newPage.waitForLoadingToFinish();

    await driver.sleep(2000);

    addReportStep(
      "Select Additional Services",
      "RUSH, PRESCAN and POSTSCAN services should be selected.",
      "Additional services selection method executed."
    );

    console.log("STEP 10 PASSED - Additional services selected");

    // =====================================================
    // STEP 11 - ENTER NUMBER OF PAGES
    // =====================================================

    console.log("STEP 11 - Entering Random Number of Pages");

    const pageResult =
      await newPage.enterRandomPagesAndVerifyCopyCharge();

    const selectedPages = pageResult.pages;
    const expectedCopyCharge = pageResult.expectedCopyCharge;

    console.log(`FINAL SELECTED PAGES: ${selectedPages}`);
    console.log(`Expected COPY CHARGE: $${expectedCopyCharge.toFixed(2)}`);

    await newPage.waitForLoadingToFinish();

    addReportStep(
      "Enter Number of Pages",
      "Random page count should be entered and copy charge should be calculated correctly.",
      `Selected pages: ${selectedPages}. Expected copy charge: $${expectedCopyCharge.toFixed(2)}.`
    );

    console.log("STEP 11 PASSED - Page count entered");

    // =====================================================
    // STEP 12 - VERIFY COPY CHARGE
    // =====================================================

    console.log("STEP 12 - Verifying COPY CHARGE");

    if (selectedPages <= 10) {
      console.log(`Pages ${selectedPages} <= 10`);
      console.log("COPY CHARGE should not be displayed");

      addReportStep(
        "Verify Copy Charge",
        "Copy charge should not be displayed when page count is 10 or less.",
        `Selected pages: ${selectedPages}. Expected copy charge: $${expectedCopyCharge.toFixed(2)}.`
      );
    } else {
      console.log(`Pages ${selectedPages} > 10`);
      console.log(
        `COPY CHARGE should be displayed: $${expectedCopyCharge.toFixed(2)}`
      );

      addReportStep(
        "Verify Copy Charge",
        "Copy charge should be displayed when page count is greater than 10.",
        `Selected pages: ${selectedPages}. Expected copy charge: $${expectedCopyCharge.toFixed(2)}.`
      );
    }

    console.log("STEP 12 PASSED - COPY CHARGE logic verified");

    // =====================================================
    // STEP 13 - ENTER DESCRIPTION
    // =====================================================

    console.log("STEP 13 - Entering Description");

    await newPage.enterDescription(
      "Selenium automation test order"
    );

    addReportStep(
      "Enter Description",
      "Description should be entered successfully.",
      "Description entered: Selenium automation test order."
    );

    console.log("STEP 13 PASSED - Description entered");

    // =====================================================
    // STEP 14 - ENTER NOTES
    // =====================================================

    console.log("STEP 14 - Entering Notes");

    await newPage.enterNotes(
      "Created through Selenium automation"
    );

    addReportStep(
      "Enter Notes",
      "Notes should be entered successfully.",
      "Notes entered: Created through Selenium automation."
    );

    console.log("STEP 14 PASSED - Notes entered");

    // =====================================================
    // STEP 15 - VERIFY PROCESSING STEPS
    // =====================================================

    console.log("STEP 15 - Verifying Processing Steps");

    await newPage.verifyProcessingSection();

    addReportStep(
      "Verify Processing Steps",
      "Processing Steps section should display the expected processing steps.",
      "verifyProcessingSection() completed without throwing an error."
    );

    console.log("STEP 15 PASSED - Processing steps verified");

    // =====================================================
    // STEP 16 - ADD STOP
    // =====================================================

    console.log("STEP 16 - Stop selection");

    // Add an actual stop name from the dropdown when specified.
    // Example:
    // await newPage.addStop("Actual Stop Name");

    addReportStep(
      "Stop Selection",
      "A stop should be selected when a stop value is provided.",
      "Skipped because no stop value was specified.",
      "SKIP"
    );

    console.log("STEP 16 SKIPPED - Stop value not specified");

    // =====================================================
    // STEP 17 - SAVE ORDER
    // =====================================================

    console.log("STEP 17 - Saving Order");

    await newPage.clickSave();

    addReportStep(
      "Save New Order",
      "Order should be saved successfully.",
      "Save button action executed."
    );

    console.log("STEP 17 PASSED - Order saved");

    // =====================================================
    // STEP 18 - VERIFY DOCUMENT LIST
    // =====================================================

    console.log("STEP 18 - Verifying Document List");

    await newPage.verifyDocumentList();

    addReportStep(
      "Verify Document List",
      "Document List should be displayed after saving the order.",
      "verifyDocumentList() completed without throwing an error."
    );

    console.log("STEP 18 PASSED - Document List displayed");

    // =====================================================
    // FINAL
    // =====================================================

    console.log("");
    console.log("==============================================");
    console.log("CREATE NEW ORDER TEST PASSED");
    console.log("==============================================");
  });

  // =========================================================
  // AFTER EACH - FINAL REPORT DETAILS
  // =========================================================

  afterEach(async function () {
    if (!activeReporter) return;

    const currentTest = this.currentTest;

    try {
      const currentUrl = driver
        ? await driver.getCurrentUrl()
        : "Browser unavailable";

      const duration = currentTest?.duration || 0;

      activeReporter.addDetail(
        "FINAL TEST STATUS",
        currentTest?.state === "passed" ? "PASSED" : "FAILED"
      );

      activeReporter.addDetail(
        "EXECUTION DURATION",
        `${(duration / 1000).toFixed(2)} seconds`
      );

      activeReporter.addDetail(
        "FINAL BROWSER URL",
        currentUrl
      );

      if (currentTest?.state === "passed") {
        activeReporter.addDetail(
          "FINAL ACTUAL RESULT",
          "New Order creation flow completed successfully."
        );
      } else {
        activeReporter.addFailure(
          currentTest?.err || new Error("Test failed")
        );
      }

      await activeReporter.attachScreenshot(
        `${currentTest?.title || "Create New Order"} - ${
          currentTest?.state || "completed"
        }`
      );
    } catch (error) {
      console.error("Report finalization error:", error.message);
    } finally {
      activeReporter = null;
    }
  });

  // =========================================================
  // TEARDOWN
  // =========================================================

  after(async function () {
    if (driver) {
      console.log("Closing browser...");

      try {
        await driver.quit();
      } catch (error) {
        console.error("Browser close error:", error.message);
      }
    }
  });
});
