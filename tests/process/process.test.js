const { expect } = require("chai");

const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ExpectedPage = require("../../pages/ExpectedPage");
const DropOffPage = require("../../pages/DropOffPage");
const PickupPage = require("../../pages/PickupPage");
const ShipToCustomerPage = require("../../pages/ShipToCustomerPage");

require("dotenv").config();

describe("Processor Portal - Complete Order Processing Flow", function () {
    this.timeout(2400000);

    let driver;

    let loginPage;
    let newPage;
    let expectedPage;
    let dropOffPage;
    let pickupPage;
    let shipToCustomerPage;

    before(async function () {
        this.timeout(300000);

        driver = await getDriver();

        loginPage = new LoginPage(driver);
        newPage = new NewPage(driver);
        expectedPage = new ExpectedPage(driver);
        dropOffPage = new DropOffPage(driver);
        pickupPage = new PickupPage(driver);
        shipToCustomerPage =
            new ShipToCustomerPage(driver);
    });

    it(
        "TC_PROCESS_FULL_001 - Complete order processing from Login to Ship To Customer",
        async function () {
            this.timeout(2400000);

            // =====================================================
            // LOGIN
            // =====================================================

            await loginPage.open();

            await loginPage.login(
                process.env.EMAIL,
                process.env.PASSWORD
            );

            // =====================================================
            // NEW
            // =====================================================

            await newPage.waitForPage();

            // =====================================================
            // EXPECTED
            // =====================================================

            await expectedPage.open();

            const orderId =
                await expectedPage.getTopOrderId();

            expect(orderId).to.match(/^\d+$/);

            await expectedPage.clickOrderId(
                orderId
            );

            await expectedPage.waitForOrderDetails();

            const docId =
                await expectedPage.getDocId();

            expect(docId).to.match(/^\d+$/);

            const country =
                process.env.PROCESS_COUNTRY ||
                "Afghanistan";

            await expectedPage.verifyOrderDetails({
                orderId,
                docId,
                country
            });

            // =====================================================
            // GET PROCESSING STEPS DYNAMICALLY
            // =====================================================

            const processingSteps =
                await expectedPage.getProcessingStepsFromOrder();

            expect(processingSteps.length)
                .to.be.greaterThan(0);

            console.log("");
            console.log(
                `Order ID: ${orderId}`
            );

            console.log(
                `Doc ID: ${docId}`
            );

            console.log(
                `Country: ${country}`
            );

            console.log(
                `Processing Step Count: ${processingSteps.length}`
            );

            console.log(
                `Processing Steps: ${processingSteps.join(", ")}`
            );

            // =====================================================
            // SAVE & PROCESS
            // =====================================================

            await expectedPage.clickSaveAndProcess();

            // =====================================================
            // PROCESS EVERY STEP
            // =====================================================

            for (
                let i = 0;
                i < processingSteps.length;
                i++
            ) {
                const currentStep =
                    processingSteps[i];

                console.log("");
                console.log(
                    `Processing Step ${i + 1}/${processingSteps.length}: ${currentStep}`
                );

                // =================================================
                // DROP OFF
                // =================================================

                await dropOffPage.open();

                await dropOffPage.searchOrder(
                    orderId
                );

                // Verify Order ID
                await dropOffPage.verifyOrderId(
                    orderId
                );

                // Verify Stop exists
                const dropOffStop =
                    await dropOffPage.verifyStop(
                        orderId
                    );

                console.log(
                    `Drop Off Stop: ${dropOffStop}`
                );

                // =================================================
                // CHECKBOX
                // =================================================

                await dropOffPage.selectOrder(
                    orderId
                );

                // =================================================
                // COURIER
                // =================================================

                // await dropOffPage.clickCourier();

                // await dropOffPage.verifyOrderInCourier(
                //     orderId
                // );

                // await dropOffPage.selectCourierOrder(
                //     orderId
                // );

                // await dropOffPage.clickCourier();

                // await dropOffPage.waitForOrderInCourierWithRefresh(
                //     orderId
                // );

                await dropOffPage.clickCourier();

                await dropOffPage.waitForCourierCheckbox(
                    orderId
                );

                // await dropOffPage.verifyOrderInCourier(
                //     orderId
                // );

                // =================================================
                // COMPLETE
                // =================================================

                // const incomingTrackingId =
                //     `IN${orderId}${String(Date.now()).slice(-6)}`;

                // const outgoingTrackingId =
                //     `OUT${orderId}${String(Date.now()).slice(-6)}`;

                // await dropOffPage.processCourier(
                //     orderId,
                //     docId,
                //     incomingTrackingId,
                //     outgoingTrackingId
                // );

                await dropOffPage.processCourier(
                orderId,
                docId
                );
                

                // =================================================
                // PICKUP
                // =================================================

                await pickupPage.open();

                await pickupPage.searchOrder(
                    orderId
                );

                // Verify Order ID
                await pickupPage.verifyOrderId(
                    orderId
                );

                // Verify Stop
                const pickupStop =
                    await pickupPage.verifyStop(
                        orderId
                    );

                console.log(
                    `Pickup Stop: ${pickupStop}`
                );

                // Checkbox
                await pickupPage.selectOrder(
                    orderId
                );

                // Complete
                await pickupPage.clickComplete();

                // Change Date -> Save
                await pickupPage.saveChangeDate();

                // =================================================
                // PICKUP COMPLETED
                // =================================================

                // await pickupPage.clickCompletedDocId(
                //     orderId
                // );

                // =================================================
                // VERIFY CURRENT STEP GREEN
                // =================================================

                // await pickupPage.verifyCompletedStep(
                //     currentStep
                // );

                console.log(
                    `${currentStep} completed successfully.`
                );

                // =================================================
                // CONTINUE TO NEXT STEP
                // =================================================
            }

            // =====================================================
            // ALL PROCESSING STEPS COMPLETED
            // =====================================================

            console.log("");
            console.log(
                "All processing steps completed."
            );

            // =====================================================
            // SHIP TO CUSTOMER
            // =====================================================

            await shipToCustomerPage.open();

            await shipToCustomerPage.searchOrder(
                orderId
            );

            await shipToCustomerPage.verifyReadyToShip(
                orderId
            );

            // Checkbox
            await shipToCustomerPage.selectOrder(
                orderId
            );

            // Complete
            await shipToCustomerPage.clickComplete();

            // Tracking ID + Courier
            await shipToCustomerPage.fillOutgoingTrackingAndCourier(
                orderId
            );

            // Save & Complete
            await shipToCustomerPage.saveAndComplete();

            // =====================================================
            // SHIP TO CUSTOMER COMPLETED
            // =====================================================

            await shipToCustomerPage.verifyCompleted(
                orderId
            );

            // =====================================================
            // FINAL PASS
            // =====================================================

            console.log("");
            console.log(
                "=========================================="
            );
            console.log(
                "FINAL PASS"
            );
            console.log(
                `Order ID: ${orderId}`
            );
            console.log(
                `Doc ID: ${docId}`
            );
            console.log(
                `Processing Steps Completed: ${processingSteps.join(", ")}`
            );
            console.log(
                "Ship To Customer: Completed"
            );
            console.log(
                "=========================================="
            );
        }
    );

    after(async function () {
        if (driver) {
            try {
                await driver.quit();
            } catch (error) {}
        }
    });
});