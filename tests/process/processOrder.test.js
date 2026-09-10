const { expect } = require("chai");
const { until } = require("selenium-webdriver");

const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ExpectedPage = require("../../pages/ExpectedPage");
const DropOffPage = require("../../pages/DropOffPage");

require("dotenv").config();

describe(
    "Processor Portal - Expected to Drop Off Order Flow",
    function () {

        this.timeout(600000);

        let driver;
        let loginPage;
        let newPage;
        let expectedPage;
        let dropOffPage;

        let orderId = null;

        // ==========================================
        // BEFORE ALL TESTS
        // ==========================================
        before(async function () {

            this.timeout(300000);

            driver = await getDriver();

            loginPage = new LoginPage(driver);
            newPage = new NewPage(driver);
            expectedPage = new ExpectedPage(driver);
            dropOffPage = new DropOffPage(driver);

            console.log(
                "\n=========================================="
            );

            console.log(
                "Browser started."
            );

            console.log(
                "==========================================\n"
            );
        });

        // ==========================================
        // TEST CASE 1
        // ==========================================
        it(
            "TC_PROCESS_001 - Login and verify New page",
            async function () {

                this.timeout(300000);

                console.log(
                    "\nTC_PROCESS_001 STARTED"
                );

                // Open login page
                await loginPage.open();

                // Login
                await loginPage.login(
                    process.env.EMAIL,
                    process.env.PASSWORD
                );

                // Wait for New page URL
                await driver.wait(
                    until.urlContains("/p/new"),
                    120000
                );

                const currentUrl =
                    await driver.getCurrentUrl();

                console.log(
                    "Current URL:",
                    currentUrl
                );

                expect(currentUrl)
                    .to.include("/p/new");

                // Wait for complete New page
                await newPage.waitForPage();

                console.log(
                    "TC_PROCESS_001 PASSED"
                );
            }
        );

        // ==========================================
        // TEST CASE 2
        // ==========================================
        it(
            "TC_PROCESS_002 - Get top Order ID from Expected",
            async function () {

                this.timeout(300000);

                console.log(
                    "\nTC_PROCESS_002 STARTED"
                );

                // Open Expected page
                await expectedPage.open();

                // Get top Order ID
                orderId =
                    await expectedPage.getTopOrderId();

                expect(orderId)
                    .to.be.a("string");

                expect(orderId)
                    .to.match(/^\d+$/);

                console.log(
                    `Order ID selected for test: ${orderId}`
                );

                console.log(
                    "TC_PROCESS_002 PASSED"
                );
            }
        );

        // ==========================================
        // TEST CASE 3
        // ==========================================
        it(
            "TC_PROCESS_003 - Open Order Details",
            async function () {

                this.timeout(300000);

                console.log(
                    "\nTC_PROCESS_003 STARTED"
                );

                // Do not continue if TC002 failed
                if (!orderId) {
                    throw new Error(
                        "TC_PROCESS_003 cannot continue because TC_PROCESS_002 did not return an Order ID."
                    );
                }

                await expectedPage.clickOrderId(
                    orderId
                );

                await expectedPage.waitForOrderDetails();

                console.log(
                    `Order ${orderId} details opened.`
                );

                console.log(
                    "TC_PROCESS_003 PASSED"
                );
            }
        );

        // ==========================================
        // TEST CASE 4
        // ==========================================
        it(
            "TC_PROCESS_004 - Save & Process Order",
            async function () {

                this.timeout(300000);

                console.log(
                    "\nTC_PROCESS_004 STARTED"
                );

                if (!orderId) {
                    throw new Error(
                        "TC_PROCESS_004 cannot continue because no Order ID is available."
                    );
                }

                await expectedPage.clickSaveAndProcess();

                // Wait for backend processing
                console.log(
                    "Waiting for Save & Process operation to complete..."
                );

                await driver.sleep(10000);

                console.log(
                    `Save & Process completed for Order ${orderId}`
                );

                console.log(
                    "TC_PROCESS_004 PASSED"
                );
            }
        );

        // ==========================================
        // TEST CASE 5
        // ==========================================
        it(
            "TC_PROCESS_005 - Verify Order ID moved to Drop Off",
            async function () {

                this.timeout(300000);

                console.log(
                    "\nTC_PROCESS_005 STARTED"
                );

                if (!orderId) {
                    throw new Error(
                        "TC_PROCESS_005 cannot continue because no Order ID is available."
                    );
                }

                // Open Drop Off page
                await dropOffPage.open();

                // Verify order
                const result =
                    await dropOffPage.searchAndVerify(
                        orderId
                    );

                expect(result)
                    .to.equal(true);

                console.log(
                    `Order ${orderId} successfully verified in Drop Off.`
                );

                console.log(
                    "TC_PROCESS_005 PASSED"
                );
            }
        );

        // ==========================================
        // AFTER ALL TESTS
        // ==========================================
        after(async function () {

            console.log(
                "\n=========================================="
            );

            console.log(
                "Test execution completed."
            );

            console.log(
                "=========================================="
            );

            if (driver) {

                try {
                    await driver.quit();

                    console.log(
                        "Browser closed."
                    );

                } catch (error) {

                    console.log(
                        "Browser was already closed."
                    );
                }
            }
        });
    }
);