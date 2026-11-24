
const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/CustomerLogin");
const USAuthentication = require("../../pages/USAuthentication");
const CartCheckoutPage = require("../../pages/CartCheckoutPage.js");

// ======================================================
// PDF FILES
// ======================================================

const samplePdf = path.resolve(
    __dirname,
    "../../assets/sample.pdf"
);

const returnLabelPdf = path.resolve(
    __dirname,
    "../../assets/coverletter.pdf"
);

// ======================================================
// TEST SUITE
// ======================================================

describe(
    "US Authentication - Process Documents and Upload Return Label",
    function () {

        this.timeout(300000);

        let driver;
        let loginPage;
        let usAuthentication;
        let cartCheckoutPage;

        // ==================================================
        // BEFORE
        // ==================================================

        before(async function () {

            driver = await getDriver();

            loginPage = new LoginPage(driver);
            usAuthentication = new USAuthentication(driver);
            cartCheckoutPage = new CartCheckoutPage(driver);

            // Validate PDF files before starting the test.
            if (!fs.existsSync(samplePdf)) {
                throw new Error(`Sample PDF not found: ${samplePdf}`);
            }

            if (!fs.existsSync(returnLabelPdf)) {
                throw new Error(
                    `Return Label PDF not found: ${returnLabelPdf}`
                );
            }

            console.log("----------------------------------------");
            console.log("US Authentication Test Started");
            console.log("Process Document PDF:", samplePdf);
            console.log("Return Label PDF:", returnLabelPdf);
            console.log("----------------------------------------");
        });

        // ==================================================
        // AFTER
        // ==================================================

        after(async function () {

            if (driver) {
                await driver.quit();
            }

            console.log("US Authentication Test Completed.");
        });

        // ==================================================
        // UPLOAD RETURN LABEL
        // ==================================================

        async function uploadReturnLabel() {

            console.log(
                "\n========== Upload Return Label =========="
            );

            // Select Upload Return Label only.
            await cartCheckoutPage.click(
                cartCheckoutPage.uploadReturn
            );

            await driver.sleep(1000);

            // Wait for file input.
            await driver.wait(
                async () => {
                    const inputs = await driver.findElements(
                        By.css("input[type='file']")
                    );

                    return inputs.length > 0;
                },
                30000,
                "Return Label file input was not found."
            );

            // Get the available file inputs.
            const fileInputs = await driver.findElements(
                By.css("input[type='file']")
            );

            if (fileInputs.length === 0) {
                throw new Error(
                    "No file input found for Return Label upload."
                );
            }

            // Use the last file input for Return Label.
            const returnLabelInput =
                fileInputs[fileInputs.length - 1];

            console.log(
                "Uploading Return Label:",
                returnLabelPdf
            );

            // Upload coverletter.pdf.
            await returnLabelInput.sendKeys(returnLabelPdf);

            await driver.sleep(2000);

            console.log(
                "✓ coverletter.pdf uploaded as Return Label."
            );
        }

        // ==================================================
        // RANDOM NON-CARD PAYMENT
        // ==================================================

       
async function selectRandomNonCardPayment() {

    console.log("\n========== Select Payment Method ==========");

    // Credit/Debit Card is intentionally excluded.
    const paymentOptions = [
        "Company's Check",
        "ACH/Wire Transfer",
        "Purchase Order (PO)"
    ];

    // Randomly select one non-card payment.
    const randomIndex = Math.floor(
        Math.random() * paymentOptions.length
    );

    const selectedPayment = paymentOptions[randomIndex];

    console.log("Selected Payment Method:", selectedPayment);

    // Locate the visible label instead of waiting for the
    // potentially hidden radio input to become visible.
    const paymentLabel = By.xpath(
        `//label[contains(normalize-space(.), "${selectedPayment}")]`
    );

    const label = await driver.wait(
        until.elementLocated(paymentLabel),
        30000,
        `Payment label "${selectedPayment}" was not found.`
    );

    // Wait for the label to become visible.
    await driver.wait(
        until.elementIsVisible(label),
        15000,
        `Payment label "${selectedPayment}" is not visible.`
    );

    // Locate the radio input inside the label.
    const radioElements = await label.findElements(
        By.css("input[type='radio']")
    );

    if (radioElements.length === 0) {
        throw new Error(
            `Radio input not found inside "${selectedPayment}" label.`
        );
    }

    const radio = radioElements[0];

    // Scroll to the visible label.
    await driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        label
    );

    await driver.sleep(500);

    // Click the visible label.
    await driver.executeScript(
        "arguments[0].click();",
        label
    );

    await driver.sleep(1000);

    // Verify that the radio input is selected.
    const isSelected = await driver.wait(
        async () => {
            try {
                return await radio.isSelected();
            } catch (error) {
                return false;
            }
        },
        10000,
        `Payment "${selectedPayment}" was not selected.`
    );

    if (!isSelected) {
        throw new Error(
            `Failed to select payment method: ${selectedPayment}`
        );
    }

    console.log(
        `✓ Payment successfully selected: ${selectedPayment}`
    );

    return selectedPayment;
}


        // ==================================================
        // MAIN TEST
        // ==================================================

        it(
            "TC_USAUTH_001 - Process Attached Documents, Upload Return Label and Random Non-Card Payment",
            async function () {

                this.timeout(300000);

                // ------------------------------------------
                // STEP 1: LOGIN
                // ------------------------------------------

                console.log(
                    "\nSTEP 1: Login to WCS Customer Portal"
                );

                await loginPage.open();

                await loginPage.login(
                    process.env.WCS_EMAIL,
                    process.env.WCS_PASSWORD
                );

                console.log("✓ Login successful.");

                // ------------------------------------------
                // STEP 2: OPEN US AUTHENTICATION
                // ------------------------------------------

                console.log(
                    "\nSTEP 2: Open US Authentication"
                );

                await usAuthentication.openUSAuthentication();

                console.log(
                    "✓ US Authentication page opened."
                );

                // ------------------------------------------
                // STEP 3: SELECT COUNTRY
                // ------------------------------------------

                console.log(
                    "\nSTEP 3: Select Country"
                );

                await usAuthentication.selectCountry(
                    "Afghanistan"
                );

                // ------------------------------------------
                // STEP 4: SELECT DOCUMENT
                // ------------------------------------------

                console.log(
                    "\nSTEP 4: Select Document"
                );

                await usAuthentication.selectDocument(
                    "General (Others)"
                );

                // ------------------------------------------
                // STEP 5: ADDITIONAL SERVICES
                // ------------------------------------------

                console.log(
                    "\nSTEP 5: Select Additional Services"
                );

                await usAuthentication.selectAdditionalServices();

                // ------------------------------------------
                // STEP 6: PROCESS ATTACHED DOCUMENTS ONLY
                // ------------------------------------------

                console.log(
                    "\nSTEP 6: Select Process Attached Documents"
                );

                // Select Process Attached Documents.
                await usAuthentication.click(
                    usAuthentication.processDocuments
                );

                // Enter number of pages.
                await usAuthentication.enterNumberOfPages(12);

                // Locate the Process Attached Documents file input.
                const documentInput =
                    await usAuthentication.find(
                        usAuthentication.fileInput
                    );

                console.log(
                    "Uploading Attached Document:",
                    samplePdf
                );

                // Upload sample.pdf.
                await documentInput.sendKeys(samplePdf);

                await driver.sleep(2000);

                console.log(
                    "✓ sample.pdf uploaded as Process Attached Document."
                );

                console.log(
                    "✓ Process Attached Documents selected."
                );

                // ------------------------------------------
                // STEP 7: CUSTOMER REFERENCE
                // ------------------------------------------

                console.log(
                    "\nSTEP 7: Enter Customer Reference"
                );

                const customerReference =
                    "Automation-US-ReturnLabel-" + Date.now();

                await usAuthentication.enterCustomerReference(
                    customerReference
                );

                console.log(
                    "Customer Reference:",
                    customerReference
                );

                // ------------------------------------------
                // STEP 8: ADD TO CART
                // ------------------------------------------

                console.log(
                    "\nSTEP 8: Add Order to Cart"
                );

                await usAuthentication.addToCart();

                console.log(
                    "✓ Order added to cart."
                );

                // ------------------------------------------
                // STEP 9: OPEN CART
                // ------------------------------------------

                console.log(
                    "\nSTEP 9: Open Cart"
                );

                await usAuthentication.openCart();

                console.log(
                    "✓ Cart opened successfully."
                );

                // ------------------------------------------
                // STEP 10: UPLOAD RETURN LABEL ONLY
                // ------------------------------------------

                console.log(
                    "\nSTEP 10: Upload Return Label"
                );

                await uploadReturnLabel();

                // ------------------------------------------
                // STEP 11: ACCEPT REFUND POLICY
                // ------------------------------------------

                console.log(
                    "\nSTEP 11: Accept Refund Policy"
                );

                await cartCheckoutPage.acceptRefundPolicy();

                console.log(
                    "✓ Refund Policy accepted."
                );

                // ------------------------------------------
                // STEP 12: SELECT RANDOM NON-CARD PAYMENT
                // ------------------------------------------

                console.log(
                    "\nSTEP 12: Select Random Non-Card Payment"
                );

                const paymentMethod =
                    await selectRandomNonCardPayment();

                expect(paymentMethod).to.be.oneOf([
                    "Company's Check",
                    "ACH/Wire Transfer",
                    "Purchase Order (PO)"
                ]);

                // ------------------------------------------
                // STEP 13: CHECKOUT
                // ------------------------------------------

                console.log(
                    "\nSTEP 13: Checkout From Cart"
                );

                // Non-card payment: no card details required.
                await cartCheckoutPage.checkoutFromCart();

                await cartCheckoutPage.confirmPayLater();

                console.log(
                    "✓ Checkout completed."
                );

                // ------------------------------------------
                // STEP 14: VERIFY CONFIRMATION PAGE
                // ------------------------------------------

                console.log(
                    "\nSTEP 14: Verify Order Confirmation"
                );

                await driver.wait(
                    async () => {
                        const currentUrl =
                            await driver.getCurrentUrl();

                        return currentUrl.includes(
                            "/confirmation"
                        );
                    },
                    60000,
                    "Order confirmation page was not displayed."
                );

                const orderNumber =
                    await usAuthentication.getOrderNumber();

                // ------------------------------------------
                // FINAL EXECUTION SUMMARY
                // ------------------------------------------

                console.log("\n----------------------------------------");
                console.log("ORDER EXECUTION SUMMARY");
                console.log("----------------------------------------");

                console.log(
                    "Customer Reference:",
                    customerReference
                );

                console.log(
                    "Process Document: sample.pdf"
                );

                console.log(
                    "Upload Option: Process Attached Documents"
                );

                console.log(
                    "Return Label: coverletter.pdf"
                );

                console.log(
                    "Shipping Option: Upload Return Label"
                );

                console.log(
                    "Payment Method:",
                    paymentMethod
                );

                console.log(
                    "Order Number:",
                    orderNumber
                );

                console.log("----------------------------------------");

                expect(
                    orderNumber,
                    "Order number should be displayed."
                ).to.not.equal("");

                console.log(
                    "\n✓ TC_USAUTH_001 PASSED."
                );
            }
        );
    }
);
