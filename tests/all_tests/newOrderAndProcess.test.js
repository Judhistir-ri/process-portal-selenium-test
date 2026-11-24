
const { expect } = require("chai");
const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ExpectedPage = require("../../pages/ExpectedPage");
const DropOffPage = require("../../pages/DropOffPage");
const PickupPage = require("../../pages/PickupPage");
const ShipToCustomerPage = require("../../pages/ShipToCustomerPage");

const TestReporter = require("../../utils/testReporter");

require("dotenv").config({ override: true });

describe("Processor Portal - Create Order and Process Order", function () {
    this.timeout(2400000);

    let driver;

    let loginPage;
    let newPage;
    let expectedPage;
    let dropOffPage;
    let pickupPage;
    let shipToCustomerPage;

    let activeReporter = null;
    let reportStepNumber = 0;

    // Shared between the two test cases. The first test creates the order;
    // the second test processes that same order in the same browser session.
    let createdOrderId = null;
    let createdDocId = null;
    let createdCountry = process.env.PROCESS_COUNTRY || "Afghanistan";

    // =====================================================
    // SETUP
    // =====================================================

    before(async function () {
        this.timeout(300000);

        if (!process.env.EMAIL) {
            throw new Error("EMAIL is missing from .env file");
        }

        if (!process.env.PASSWORD) {
            throw new Error("PASSWORD is missing from .env file");
        }

        driver = await getDriver();

        loginPage = new LoginPage(driver);
        newPage = new NewPage(driver);
        expectedPage = new ExpectedPage(driver);
        dropOffPage = new DropOffPage(driver);
        pickupPage = new PickupPage(driver);
        shipToCustomerPage = new ShipToCustomerPage(driver);

        // Automatically capture page-object actions in the report.
        TestReporter.instrumentPageObject(
            loginPage,
            () => activeReporter
        );

        TestReporter.instrumentPageObject(
            newPage,
            () => activeReporter
        );

        TestReporter.instrumentPageObject(
            expectedPage,
            () => activeReporter
        );

        TestReporter.instrumentPageObject(
            dropOffPage,
            () => activeReporter
        );

        TestReporter.instrumentPageObject(
            pickupPage,
            () => activeReporter
        );

        TestReporter.instrumentPageObject(
            shipToCustomerPage,
            () => activeReporter
        );

        console.log("WebDriver and Page Objects initialized.");
    });

    // =====================================================
    // PER-TEST REPORT INITIALIZATION
    // =====================================================

    beforeEach(function () {
        reportStepNumber = 0;

        activeReporter = new TestReporter(driver, this);

        const title = this.currentTest?.title || "Unnamed test";

        const testCaseId =
            (title.match(/\bTC_[A-Z0-9_]+\b/i) || [])[0] ||
            "Not specified";

        activeReporter.addTestInfo({
            testCaseId,
            testCase: title,
            module: "Processor Portal",
            feature: "Create New Order and Order Processing",
            objective: title.replace(
                /^TC_[A-Z0-9_]+\s*-\s*/i,
                ""
            ),
            testData: "The Create Order test creates the order; the Process Order test reuses its Order ID and Doc ID.",
            reportingNote:
                "Page-object actions are automatically instrumented. Workflow milestones, dynamic processing steps, assertions, screenshots and failures are recorded."
        });
    });

    // =====================================================
    // REPORT STEP HELPER
    // =====================================================

    function addReportStep(title, expected, actual, status = "PASS") {
        reportStepNumber++;

        if (activeReporter) {
            activeReporter.addStep(
                reportStepNumber,
                title,
                expected,
                actual,
                status
            );
        }

        console.log(
            `REPORT STEP ${reportStepNumber}: ${title} - ${status}`
        );
    }

    // =====================================================
    // AUTOMATIC REPORT DETAILS, FAILURE AND SCREENSHOT
    // =====================================================

    afterEach(async function () {
        const currentTest = this.currentTest;

        if (currentTest && activeReporter) {
            try {
                const pageUrl = driver
                    ? await driver.getCurrentUrl().catch(
                        () => "URL unavailable"
                    )
                    : "Browser unavailable";

                activeReporter.addDetail(
                    "FINAL TEST STATUS",
                    String(currentTest.state || "unknown").toUpperCase()
                );

                activeReporter.addDetail(
                    "EXECUTION DURATION",
                    `${currentTest.duration || 0} ms`
                );

                activeReporter.addDetail(
                    "FINAL BROWSER URL",
                    pageUrl
                );

                if (currentTest.state === "passed") {
                    activeReporter.addDetail(
                        "FINAL ACTUAL RESULT",
                        "All assertions and order-processing workflow steps completed successfully."
                    );
                }

                if (currentTest.state === "failed" && currentTest.err) {
                    activeReporter.addFailure(currentTest.err);
                }

                // Capture screenshot before closing the browser.
                await activeReporter.attachScreenshot(
                    `${currentTest.title} - ${currentTest.state || "completed"}`
                );

            } catch (reportError) {
                console.error(
                    "Could not attach report details:",
                    reportError.message
                );
            }
        }

        activeReporter = null;
    });

    // =====================================================
    // MAIN TEST
    // =====================================================

    // =====================================================
    // TEST CASE 1 - CREATE NEW ORDER
    // =====================================================

    it(
        "TC_CREATE_001 - Create New Order",
        async function () {
            this.timeout(900000);


            this.timeout(2400000);

            // =================================================
            // STEP 1: LOGIN
            // =================================================

            await loginPage.open();

            addReportStep(
                "Open Processor Portal login page",
                "Processor Portal login page should open successfully.",
                "Login page opened successfully."
            );

            await loginPage.login(
                process.env.EMAIL,
                process.env.PASSWORD
            );

            await newPage.waitForPage();

            addReportStep(
                "Login to Processor Portal",
                "Valid credentials should log in and navigate to the New Order page.",
                "Login completed and New Order page loaded."
            );

            // =================================================
            // =====================================================
            // CREATE NEW ORDER BEFORE PROCESSING
            // =====================================================

            console.log("\nSTARTING CREATE NEW ORDER BEFORE PROCESSING");

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

                        await newPage.waitForLoadingToFinish();
                        await driver.sleep(1500);

                        addReportStep(
                            "Wait for new order save to finish",
                            "The order save operation should finish before opening Expected.",
                            "Document List is displayed and the New Order loading wait completed."
                        );


            // Capture the newly created order identifiers for Test Case 2.
            await expectedPage.open();

            createdOrderId = await expectedPage.getTopOrderId();
            expect(createdOrderId, "Created Order ID should be numeric.").to.match(/^\d+$/);

            await expectedPage.clickOrderId(createdOrderId);
            await expectedPage.waitForOrderDetails();

            createdDocId = await expectedPage.getDocId();
            expect(createdDocId, "Created Doc ID should be numeric.").to.match(/^\d+$/);

            addReportStep(
                "Capture created Order ID and Doc ID",
                "The newly created order should be available on Expected with valid Order ID and Doc ID.",
                `Created Order ID: ${createdOrderId}; Doc ID: ${createdDocId}.`
            );

            if (activeReporter) {
                activeReporter.addDetail("CREATED ORDER ID", createdOrderId);
                activeReporter.addDetail("CREATED DOC ID", createdDocId);
            }

            console.log(`CREATE ORDER TEST COMPLETED. Order ID: ${createdOrderId}; Doc ID: ${createdDocId}`);

        }
    );

    // =====================================================
    // TEST CASE 2 - PROCESS THE ORDER CREATED IN TEST CASE 1
    // =====================================================

    it(
        "TC_PROCESS_002 - Process Order from Expected to Ship To Customer",
        async function () {
            this.timeout(2400000);

            if (!createdOrderId || !createdDocId) {
                throw new Error(
                    "Cannot process the order because Test Case 1 did not create and capture an Order ID and Doc ID. Run TC_CREATE_001 first."
                );
            }

            // Reuse the exact order created by Test Case 1.
            expect(createdOrderId, "Run the Create New Order test first; no Order ID was saved.").to.match(/^\d+$/);
            expect(createdDocId, "Run the Create New Order test first; no Doc ID was saved.").to.match(/^\d+$/);

            const orderId = createdOrderId;
            const docId = createdDocId;
            const country = createdCountry;

            await expectedPage.open();
            await expectedPage.clickOrderId(orderId);
            await expectedPage.waitForOrderDetails();

            addReportStep(
                "Open the newly created order",
                "The Order ID created in Test Case 1 should open successfully.",
                `Opened Order ID: ${orderId}; Doc ID: ${docId}.`
            );

            await expectedPage.verifyOrderDetails({
                orderId,
                docId,
                country
            });

            addReportStep(
                "Verify Order Details",
                "Order ID, Doc ID and Country should match the selected order.",
                `Order ID: ${orderId}; Doc ID: ${docId}; Country: ${country}. All details verified.`
            );

            if (activeReporter) {
                activeReporter.addDetail("ORDER ID", orderId);
                activeReporter.addDetail("DOC ID", docId);
                activeReporter.addDetail("COUNTRY", country);
            }

            // =================================================
            // STEP 4: GET PROCESSING STEPS DYNAMICALLY
            // =================================================

            const processingSteps =
                await expectedPage.getProcessingStepsFromOrder();

            expect(
                processingSteps.length,
                "At least one processing step should be available."
            ).to.be.greaterThan(0);

            console.log("");
            console.log(`Order ID: ${orderId}`);
            console.log(`Doc ID: ${docId}`);
            console.log(`Country: ${country}`);
            console.log(`Processing Step Count: ${processingSteps.length}`);
            console.log(
                `Processing Steps: ${processingSteps.join(", ")}`
            );

            if (activeReporter) {
                activeReporter.addDetail(
                    "TOTAL PROCESSING STEPS",
                    processingSteps.length
                );

                activeReporter.addDetail(
                    "PROCESSING STEPS",
                    processingSteps.join(", ")
                );
            }

            addReportStep(
                "Read processing steps dynamically",
                "All visible processing steps should be extracted from the Expected page tracker.",
                `Found ${processingSteps.length} processing steps: ${processingSteps.join(", ")}.`
            );

            // =================================================
            // STEP 5: SAVE & PROCESS
            // =================================================

            await expectedPage.clickSaveAndProcess();

            addReportStep(
                "Click Save & Process",
                "The selected order should be saved and moved into processing.",
                `Save & Process completed for Order ID ${orderId}.`
            );

            // =================================================
            // STEP 6: PROCESS EVERY STEP
            // =================================================

            for (let i = 0; i < processingSteps.length; i++) {

                const currentStep = processingSteps[i];

                console.log("");
                console.log(
                    `Processing Step ${i + 1}/${processingSteps.length}: ${currentStep}`
                );

                if (activeReporter) {
                    activeReporter.addDetail(
                        `PROCESSING STEP ${i + 1}`,
                        currentStep
                    );
                }

                // ---------------------------------------------
                // DROP OFF
                // ---------------------------------------------

                await dropOffPage.open();

                addReportStep(
                    `Processing ${currentStep} - Open DropOff`,
                    "DropOff page should open successfully.",
                    `DropOff page opened for processing step: ${currentStep}.`
                );

                await dropOffPage.searchOrder(orderId);

                await dropOffPage.verifyOrderId(orderId);

                const dropOffStop =
                    await dropOffPage.verifyStop(orderId);

                console.log(`Drop Off Stop: ${dropOffStop}`);

                addReportStep(
                    `Processing ${currentStep} - Verify DropOff order`,
                    "The selected Order ID and its Stop should be displayed in DropOff.",
                    `Order ID: ${orderId}; DropOff Stop: ${dropOffStop}.`
                );

                // ---------------------------------------------
                // SELECT ORDER
                // ---------------------------------------------

                await dropOffPage.selectOrder(orderId);

                addReportStep(
                    `Processing ${currentStep} - Select DropOff order`,
                    "The selected order checkbox should be selected.",
                    `Order ${orderId} selected in DropOff.`
                );

                // ---------------------------------------------
                // MOVE TO COURIER
                // ---------------------------------------------

                await dropOffPage.clickCourier();

                await dropOffPage.waitForCourierCheckbox(orderId);

                addReportStep(
                    `Processing ${currentStep} - Move to Courier`,
                    "The order should move from DropOff Queue to Courier.",
                    `Order ${orderId} is available in Courier.`
                );

                // ---------------------------------------------
                // COMPLETE COURIER
                // ---------------------------------------------

                await dropOffPage.processCourier(orderId, docId);

                addReportStep(
                    `Processing ${currentStep} - Complete Courier`,
                    "Courier processing should complete successfully.",
                    `Courier processing completed for Order ID ${orderId}, Doc ID ${docId}.`
                );

                // ---------------------------------------------
                // PICKUP
                // ---------------------------------------------

                await pickupPage.open();

                await pickupPage.searchOrder(orderId);

                await pickupPage.verifyOrderId(orderId);

                const pickupStop =
                    await pickupPage.verifyStop(orderId);

                console.log(`Pickup Stop: ${pickupStop}`);

                addReportStep(
                    `Processing ${currentStep} - Verify Pickup order`,
                    "The order and its Stop should be displayed in Pickup.",
                    `Order ID: ${orderId}; Pickup Stop: ${pickupStop}.`
                );

                // ---------------------------------------------
                // SELECT PICKUP ORDER
                // ---------------------------------------------

                await pickupPage.selectOrder(orderId);

                addReportStep(
                    `Processing ${currentStep} - Select Pickup order`,
                    "The order checkbox should be selected in Pickup.",
                    `Order ${orderId} selected in Pickup.`
                );

                // ---------------------------------------------
                // COMPLETE PICKUP
                // ---------------------------------------------

                await pickupPage.clickComplete();

                addReportStep(
                    `Processing ${currentStep} - Complete Pickup`,
                    "The selected Pickup order should be completed.",
                    `Complete action executed for Order ID ${orderId}.`
                );

                // ---------------------------------------------
                // CHANGE DATE AND SAVE
                // ---------------------------------------------

                await pickupPage.saveChangeDate();

                addReportStep(
                    `Processing ${currentStep} - Save Pickup date`,
                    "The changed Pickup date should be saved successfully.",
                    `Pickup date saved for Order ID ${orderId}.`
                );

                console.log(
                    `${currentStep} completed successfully.`
                );
            }

            // =================================================
            // STEP 7: ALL PROCESSING STEPS COMPLETED
            // =================================================

            console.log("");
            console.log("All processing steps completed.");

            addReportStep(
                "Verify all processing steps completed",
                "Every processing step extracted from Expected should complete through DropOff, Courier and Pickup.",
                `Completed ${processingSteps.length} processing steps: ${processingSteps.join(", ")}.`
            );

            // =================================================
            // STEP 8: SHIP TO CUSTOMER
            // =================================================

            await shipToCustomerPage.open();

            await shipToCustomerPage.searchOrder(orderId);

            await shipToCustomerPage.verifyReadyToShip(orderId);

            addReportStep(
                "Open Ship To Customer and verify Ready to Ship",
                "The processed order should be available in Ready to Ship.",
                `Order ${orderId} is available in Ready to Ship.`
            );

            // ---------------------------------------------
            // SELECT ORDER
            // ---------------------------------------------

            await shipToCustomerPage.selectOrder(orderId);

            addReportStep(
                "Select Ready to Ship order",
                "The order checkbox should be selected.",
                `Order ${orderId} selected in Ready to Ship.`
            );

            // ---------------------------------------------
            // COMPLETE
            // ---------------------------------------------

            await shipToCustomerPage.clickComplete();

            addReportStep(
                "Click Complete",
                "The application should open the shipping completion details.",
                `Complete action executed for Order ID ${orderId}.`
            );

            // ---------------------------------------------
            // TRACKING ID AND COURIER
            // ---------------------------------------------

            await shipToCustomerPage.fillOutgoingTrackingAndCourier(
                orderId
            );

            addReportStep(
                "Enter outgoing Tracking ID and Courier",
                "Outgoing Tracking ID and Courier should be entered successfully.",
                `Outgoing tracking and courier details entered for Order ID ${orderId}.`
            );

            // ---------------------------------------------
            // SAVE & COMPLETE
            // ---------------------------------------------

            await shipToCustomerPage.saveAndComplete();

            addReportStep(
                "Save & Complete Ship To Customer",
                "Shipping details should be saved and the order should complete.",
                `Save & Complete action executed for Order ID ${orderId}.`
            );

            // =================================================
            // FINAL PASS
            // =================================================

            console.log("");
            console.log("==========================================");
            console.log("FINAL PASS");
            console.log(`Order ID: ${orderId}`);
            console.log(`Doc ID: ${docId}`);
            console.log(
                `Processing Steps Completed: ${processingSteps.join(", ")}`
            );
            console.log("Ship To Customer: Completed");
            console.log("==========================================");

            addReportStep(
                "Final order processing result",
                "The complete order workflow should finish successfully through Ship To Customer.",
                `Order ID: ${orderId}; Doc ID: ${docId}; Processing Steps: ${processingSteps.length}; Ship To Customer: Completed.`
            );

        }
    );


    // =====================================================
    // BROWSER CLEANUP
    // =====================================================

    after(async function () {
        if (driver) {
            try {
                await driver.quit();
                console.log("Browser closed successfully.");
            } catch (error) {
                console.error(
                    "Error while closing browser:",
                    error.message
                );
            }
        }
    });
});