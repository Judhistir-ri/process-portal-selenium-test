const { expect } = require("chai");

const getDriver =
    require("../../utils/driver");

const LoginPage =
    require("../../pages/Login");

const NewPage =
    require("../../pages/NewPage");

const ExpectedPage =
    require("../../pages/ExpectedPage");

const DropOffPage =
    require("../../pages/DropOffPage");

const PickupPage =
    require("../../pages/PickupPage");

const ShipToCustomerPage =
    require("../../pages/ShipToCustomerPage");

require("dotenv").config();

describe(
    "Processor Portal - Complete Order Flow",
    function () {

        this.timeout(1200000);

        let driver;
        let loginPage;
        let newPage;
        let expectedPage;
        let dropOffPage;
        let pickupPage;
        let shipToCustomerPage;

        before(async function () {

            this.timeout(300000);

            driver =
                await getDriver();

            loginPage =
                new LoginPage(driver);

            newPage =
                new NewPage(driver);

            expectedPage =
                new ExpectedPage(driver);

            dropOffPage =
                new DropOffPage(driver);

            pickupPage =
                new PickupPage(driver);

            shipToCustomerPage =
                new ShipToCustomerPage(driver);
        });

        after(async function () {

            if (driver) {

                try {
                    await driver.quit();
                } catch (_) {}
            }
        });

        it(
            "TC_PROCESS_001 - Complete order from Login to Ship to Customer",
            async function () {

                this.timeout(1200000);

                // ==========================================
                // LOGIN
                // ==========================================

                await loginPage.open();

                await loginPage.login(
                    process.env.EMAIL,
                    process.env.PASSWORD
                );

                // ==========================================
                // NEW PAGE
                // ==========================================

                await newPage.waitForPage();

                // ==========================================
                // EXPECTED PAGE
                // ==========================================

                await expectedPage.open();

                const orderId =
                    await expectedPage.getTopOrderId();

                expect(orderId)
                    .to.match(/^\d+$/);

                // ==========================================
                // OPEN ORDER
                // ==========================================

                await expectedPage.clickOrderId(
                    orderId
                );

                await expectedPage.waitForOrderDetails();

                // ==========================================
                // GET ACTUAL PROCESSING STEPS
                // FROM EXPECTED PAGE
                // ==========================================

                const processingSteps =
                    await expectedPage.getProcessingStepsFromOrder();

                expect(processingSteps.length)
                    .to.be.greaterThan(0);

                // ==========================================
                // SAVE & PROCESS
                // ==========================================

                await expectedPage.clickSaveAndProcess();

                await driver.sleep(10000);

                // ==========================================
                // PROCESS EACH ACTUAL STEP
                // ==========================================

                for (
                    let i = 0;
                    i < processingSteps.length;
                    i++
                ) {

                    const step =
                        processingSteps[i];

                    console.log(
                        `Processing Step ${i + 1}/${processingSteps.length}: ${step}`
                    );

                    // ==========================================
                    // DROP OFF
                    // ==========================================

                    await dropOffPage.open();

                    await dropOffPage.searchOrder(
                        orderId
                    );

                    await dropOffPage.verifyOrderId(
                        orderId
                    );

                    // IMPORTANT:
                    // DropOff Stop is NOT compared with
                    // the Expected processing step.
                    // We only verify that Stop exists.

                    await dropOffPage.verifyStop(
                        orderId
                    );

                    await dropOffPage.selectOrder(
                        orderId
                    );

                    await dropOffPage.clickCourier();

                    // ==========================================
                    // COURIER
                    // ==========================================

                    const incomingTrackingId =
                        `IN-${orderId}-${Date.now()}`;

                    const outgoingTrackingId =
                        `OUT-${orderId}-${Date.now()}`;

                    await dropOffPage.processCourier(
                        orderId,
                        incomingTrackingId,
                        outgoingTrackingId
                    );

                    // ==========================================
                    // PICKUP
                    // ==========================================

                    await pickupPage.open();

                    await pickupPage.completeCurrentStep(
                        orderId,
                        step
                    );

                    // ==========================================
                    // VERIFY COMPLETED STEP
                    // ==========================================

                    await pickupPage.clickCompletedDocId(
                        orderId
                    );

                    await pickupPage.verifyCompletedStep(
                        step
                    );
                }

                // ==========================================
                // SHIP TO CUSTOMER
                // ==========================================

                await shipToCustomerPage.open();

                await shipToCustomerPage.searchOrder(
                    orderId
                );

                await shipToCustomerPage.verifyReadyToShip(
                    orderId
                );

                await shipToCustomerPage.completeShipping(
                    orderId
                );

                await shipToCustomerPage.verifyCompleted(
                    orderId
                );
            }
        );
    }
);