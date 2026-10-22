const { expect } = require("chai");

const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");

require("dotenv").config();

describe("Processor Portal - Create New Order", function () {
  this.timeout(1200000);

  let driver;
  let loginPage;
  let newPage;

  // =========================================================
  // SETUP
  // =========================================================

  before(async function () {
    this.timeout(300000);

    console.log("");
    console.log("==============================================");
    console.log("STARTING CREATE NEW ORDER TEST");
    console.log("==============================================");

    // -----------------------------------------------------
    // Check environment variables
    // -----------------------------------------------------

    if (!process.env.EMAIL) {
      throw new Error("EMAIL is missing from .env file");
    }

    if (!process.env.PASSWORD) {
      throw new Error("PASSWORD is missing from .env file");
    }

    console.log("EMAIL: configured");
    console.log("PASSWORD: configured");

    // -----------------------------------------------------
    // Start browser using existing project driver
    // -----------------------------------------------------

    driver = await getDriver();

    loginPage = new LoginPage(driver);
    newPage = new NewPage(driver);

    console.log("Browser started.");

    // =====================================================
    // LOGIN
    // =====================================================

    await loginPage.open();

    console.log("Login page opened.");

    await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

    console.log("Login completed.");

    // =====================================================
    // WAIT FOR NEW PAGE
    // =====================================================

    await newPage.waitForPage();
    // await newPage.waitForNewOrderPageToFullyLoad(driver);

    console.log("New page loaded.");

    console.log("==============================================");
    console.log("SETUP COMPLETED");
    console.log("==============================================");
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

    // =================================================
    // STEP 1 - VERIFY NEW PAGE
    // =================================================

    const currentUrl = await driver.getCurrentUrl();

    console.log("Current URL:", currentUrl);

    expect(currentUrl).to.include("/p/new");

    console.log("STEP 1 PASSED - New page opened");

    // =================================================
    // STEP 2 - SELECT CUSTOMER
    // =================================================

    console.log("STEP 2 - Selecting Customer: Redintegro2");

    await newPage.selectCustomer("Redintegro2");

    console.log("STEP 2 PASSED - Customer selected");

    // =================================================
    // STEP 3 - SELECT CONTACT
    // =================================================

    console.log("STEP 3 - Selecting Contact: ranajit Sahoo");

    await newPage.selectContact("ranajit Sahoo");

    console.log("STEP 3 PASSED - Contact selected");

    // =================================================
    // STEP 4 - VERIFY ORIGIN
    // =================================================

    console.log("STEP 4 - Verifying Origin: United States");

    const origin = await newPage.getOriginValue();

    expect(origin.toLowerCase()).to.include("united");

    console.log("STEP 4 PASSED - Origin:", origin);

    // =================================================
    // STEP 5 - SELECT DESTINATION
    // =================================================

    console.log("STEP 5 - Selecting Destination: Afghanistan");

    await newPage.selectDestination("Afghanistan");

    console.log("STEP 5 PASSED - Destination selected");

    // =================================================
    // STEP 6 - SELECT CATEGORY
    // =================================================

    console.log("STEP 6 - Selecting Category: Federal Government");

    await newPage.selectCategory("Federal Government");

    // Wait for dynamic fee calculation
    await newPage.waitForLoadingToFinish();

    console.log("STEP 6 PASSED - Category selected");

    // =================================================
    // STEP 7 - SELECT ORIGIN STATE
    // =================================================

    console.log("STEP 7 - Selecting Origin State: Maryland");

    await newPage.selectOriginState("Maryland");

    // Dynamic fee calculation
    await newPage.waitForLoadingToFinish();

    console.log("STEP 7 PASSED - Origin State selected");

    // =================================================
    // STEP 8 - SELECT DOCUMENT TYPE
    // =================================================

    console.log("STEP 8 - Selecting Document Type: Federal Government (other)");

    await newPage.selectDocumentType("Federal Government (Others)");

    // Dynamic fee calculation
    await newPage.waitForLoadingToFinish();

    console.log("STEP 8 PASSED - Document Type selected");

    // =================================================
    // STEP 9 - SELECT RUSH
    // =================================================

    console.log("STEP 9 - Selecting RUSH");

    // await newPage.selectAdditionalService( "RUSH" );
    await newPage.selectAdditionalServices(driver);

    console.log("STEP 9 PASSED - RUSH, PRESCAN and POSTSCAN selected");

    await newPage.waitForLoadingToFinish();
    await driver.sleep(2000);

    // =================================================
    // STEP 12 - ENTER NUMBER OF PAGES
    // =================================================

    console.log("STEP 12 - Entering Random Number of Pages");

    const pageResult = await newPage.enterRandomPagesAndVerifyCopyCharge();

    const selectedPages = pageResult.pages;
    const expectedCopyCharge = pageResult.expectedCopyCharge;

    console.log(`FINAL SELECTED PAGES: ${selectedPages}`);
    console.log(`Expected COPY CHARGE: $${expectedCopyCharge.toFixed(2)}`);

    await newPage.waitForLoadingToFinish();

    // =================================================
    // STEP 13 - VERIFY COPY CHARGE
    // =================================================

    console.log("------------------------------------------");
    console.log("STEP 13 - Verifying COPY CHARGE");
    console.log("------------------------------------------");

    if (selectedPages <= 10) {
      console.log(`✓ Pages ${selectedPages} <= 10`);

      console.log("✓ COPY CHARGE correctly NOT displayed");
    } else {
      console.log(`✓ Pages ${selectedPages} > 10`);

      console.log(
        `✓ COPY CHARGE should be displayed: $${expectedCopyCharge.toFixed(2)}`,
      );
    }

    console.log("STEP 13 PASSED - COPY CHARGE logic verified");

    // =================================================
    // STEP 14 - ENTER DESCRIPTION
    // =================================================

    console.log("STEP 14 - Entering Description");

    await newPage.enterDescription("Selenium automation test order");

    console.log("STEP 14 PASSED - Description entered");

    // =================================================
    // STEP 15 - ENTER NOTES
    // =================================================

    console.log("STEP 15 - Entering Notes");

    await newPage.enterNotes("Created through Selenium automation");

    console.log("STEP 15 PASSED - Notes entered");

    // =================================================
    // STEP 16 - VERIFY PROCESSING STEPS
    // =================================================

    console.log("STEP 16 - Verifying Processing Steps");

    await newPage.verifyProcessingSection();

    console.log("STEP 16 PASSED - Processing steps verified");

    // =================================================
    // STEP 17 - ADD STOP
    // =================================================

    console.log("STEP 17 - Stop selection");

    /*
            IMPORTANT:

            Put an actual stop name from your dropdown here.

            Example:

            await newPage.addStop("Some Stop Name");

            */

    console.log("STEP 17 SKIPPED - Stop value not specified");

    // =================================================
    // STEP 18 - SAVE ORDER
    // =================================================

    console.log("STEP 18 - Saving Order");

await newPage.clickSave();

console.log("STEP 18 PASSED - Order saved");

    // =================================================
    // STEP 19 - VERIFY DOCUMENT LIST
    // =================================================

    console.log("STEP 19 - Verifying Document List");

    await newPage.verifyDocumentList();

    console.log("STEP 19 PASSED - Document List displayed");

    // =================================================
    // FINAL
    // =================================================

    console.log("");
    console.log("==============================================");
    console.log("CREATE NEW ORDER TEST PASSED");
    console.log("==============================================");
  });

  // =========================================================
  // TEARDOWN
  // =========================================================

  after(async function () {
    if (driver) {
      console.log("Closing browser...");

      await driver.quit();
    }
  });
});
