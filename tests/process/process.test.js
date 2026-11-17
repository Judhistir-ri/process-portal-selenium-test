
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

describe("Processor Portal - Complete Order Processing Flow", function () {
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

    // =====================================================
    // SETUP
    // =====================================================

    before(async function () {
        this.timeout(300000);

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
            (title.match(/TC_[A-Z]+_?\d+/i) || [])[0] ||
            "Not specified";

        activeReporter.addTestInfo({
            testCaseId,
            testCase: title,
            module: "Processor Portal - Complete Order Processing",
            feature: "Complete order processing from Login to Ship To Customer",
            objective: title.replace(
                /^TC_[A-Z]+_?\d+\s*-\s*/i,
                ""
            ),
            testData: "Order and document IDs are selected dynamically from the Expected page.",
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

    it(
        "TC_PROCESS_FULL_001 - Complete order processing from Login to Ship To Customer",
        async function () {

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
            // STEP 2: OPEN EXPECTED
            // =================================================

            await expectedPage.open();

            const orderId = await expectedPage.getTopOrderId();

            expect(
                orderId,
                "A valid numeric Order ID should be available."
            ).to.match(/^\d+$/);

            addReportStep(
                "Open Expected page and get Order ID",
                "Expected page should display a valid numeric Order ID.",
                `Expected page opened. Selected Order ID: ${orderId}.`
            );

            // =================================================
            // STEP 3: OPEN ORDER DETAILS
            // =================================================

            await expectedPage.clickOrderId(orderId);

            await expectedPage.waitForOrderDetails();

            const docId = await expectedPage.getDocId();

            expect(
                docId,
                "A valid numeric Doc ID should be available."
            ).to.match(/^\d+$/);

            const country =
                process.env.PROCESS_COUNTRY || "Afghanistan";

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
