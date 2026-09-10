const { By, until } = require("selenium-webdriver");

/**
 * ================================================================
 * CartCheckoutPage
 * ================================================================
 *
 * Common reusable page object for:
 *
 * 1. Shipping
 * 2. Return Label
 * 3. Courier Address
 * 4. Refund Policy
 * 5. Payment Method
 * 6. Credit/Debit Card
 * 7. Checkout
 * 8. Pay Later Confirmation
 *
 * ------------------------------------------------
 * SERVICES
 * ------------------------------------------------
 *
 * Card details required:
 *
 * - Dispatch Service
 * - U.S Authentication
 *
 * Card details NOT required:
 *
 * - Translation Service
 * - Global Authentication
 * - Visa Service
 * - Notary Service
 */

class CartCheckoutPage {

    constructor(driver) {

        this.driver = driver;

        // ==========================================================
        // SHIPPING OPTIONS
        // ==========================================================

        this.pickup = By.xpath( "//span[contains(normalize-space(.),'Pickup')]" );
        this.ecopy = By.xpath( "//span[contains(normalize-space(.),'E-Copy Only')]" );
        this.encloseLabel = By.xpath( "//span[contains(normalize-space(.),'Enclose Label')]" );
        this.uploadReturn = By.xpath( "//span[contains(normalize-space(.),'Upload Return Label')]" );
        this.returnLabel = By.xpath( "//span[contains(normalize-space(.),'Create Return Label')]" );

        // ==========================================================
        // REFUND POLICY
        // ==========================================================

        this.refundPolicy = By.xpath( "//*[contains(text(),'I have read and accept')]" );

        // ==========================================================
        // PAYMENT
        // ==========================================================

        this.paymentRadio = (payment) => {
            return By.xpath( `//label[contains(., "${payment}")]//input[@type='radio']` );
        };

        // ==========================================================
        // CARD DETAILS
        // ==========================================================

        this.cardholderName = By.xpath( "//label[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'cardholder')]/following::input[1]" );
        this.cardNumber = By.xpath( "//label[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'card number')]/following::input[1]" );
        this.cardExpiry = By.xpath( "//label[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'expiry')]/following::input[1]" );
        this.cardCvv = By.xpath( "//label[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'cvv')]/following::input[1]" );

        // ==========================================================
        // CHECKOUT BUTTONS
        // ==========================================================

        this.checkoutAndPayButton = By.xpath( "//button[contains(normalize-space(.),'Checkout & Pay')]" );
        this.checkoutPayLaterButton = By.xpath( "//button[contains(normalize-space(.),'Checkout & Confirm to Pay Later')]" );
        this.checkoutButton = By.xpath( "//button[contains(normalize-space(.),'Checkout')]" );

        // ==========================================================
        // CONFIRM PAY LATER
        // ==========================================================

        this.confirmPayLaterButton = By.xpath(
            "//button[contains(normalize-space(.),'Confirm') or contains(normalize-space(.),'Pay Later')]"
        );
    }

    // ==============================================================
    // GENERIC FIND
    // ==============================================================

    async find(locator, timeout = 30000) {

        return await this.driver.wait(
            until.elementLocated(locator),
            timeout
        );

    }

    // ==============================================================
    // GENERIC CLICK
    // ==============================================================

    async click(locator, timeout = 30000) {

        const element =
            await this.find(locator, timeout);

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        );

        await this.driver.sleep(300);

        try {

            await this.driver.wait(
                until.elementIsVisible(element),
                10000
            );

        } catch (error) {

            console.log(
                "Element visibility wait skipped."
            );

        }

        await this.driver.executeScript(
            "arguments[0].click();",
            element
        );

        return element;
    }

    // ==============================================================
    // GENERIC TYPE
    // ==============================================================

    async type(locator, value) {

        const element =
            await this.find(locator);

        await element.clear();

        await element.sendKeys(value);

    }

    // ==============================================================
    // WAIT LOADER
    // ==============================================================

    async waitLoader() {

        try {

            await this.driver.sleep(500);

        } catch (error) {

            console.log(
                "Loader wait skipped."
            );

        }

    }

    // ==============================================================
    // SHIPPING
    //
    // Randomly selects one of:
    //
    // 1. Pickup
    // 2. E-Copy Only
    // 3. Enclose Label
    // 4. Upload Return Label
    // 5. Create Return Label
    //
    // ==============================================================

    async selectShippingOption(pdfPath) {
        console.log("Shipping");

        const shippingOptions = [

            {
                name: "Pickup",
                locator: this.pickup
            },

            {
                name: "E-Copy Only",
                locator: this.ecopy
            },

            {
                name: "Enclose Label",
                locator: this.encloseLabel
            },

            {
                name: "Upload Return Label",
                locator: this.uploadReturn
            },

            {
                name: "Create Return Label",
                locator: this.returnLabel
            }

        ];

        // ==========================================================
        // RANDOM SHIPPING OPTION
        // ==========================================================

        const randomIndex =
            Math.floor(
                Math.random() *
                shippingOptions.length
            );

        const selectedOption =
            shippingOptions[randomIndex];

        console.log(
            "Shipping Option Selected:",
            selectedOption.name
        );

        // ==========================================================
        // CLICK SHIPPING OPTION
        // ==========================================================

        await this.click(
            selectedOption.locator
        );

        await this.driver.sleep(1000);

        // ==========================================================
        // UPLOAD RETURN LABEL
        // ==========================================================

        if (
            selectedOption.name ===
            "Upload Return Label"
        ) {

            console.log(
                "Upload Return Label selected."
            );

            if (!pdfPath) {

                throw new Error(
                    "PDF file path is required for Upload Return Label."
                );

            }

            // ------------------------------------------------------
            // Find file input
            // ------------------------------------------------------

            let fileInputs =
                await this.driver.findElements(
                    By.css(
                        "input[type='file']"
                    )
                );

            console.log(
                "File inputs found:",
                fileInputs.length
            );

            // ------------------------------------------------------
            // Wait for file input
            // ------------------------------------------------------

            if (
                fileInputs.length === 0
            ) {

                try {

                    await this.driver.wait(
                        async () => {

                            fileInputs =
                                await this.driver.findElements(
                                    By.css(
                                        "input[type='file']"
                                    )
                                );

                            return (
                                fileInputs.length > 0
                            );

                        },
                        30000
                    );

                } catch (error) {

                    throw new Error(
                        "Upload Return Label selected, but file input did not appear."
                    );

                }

            }

            // ------------------------------------------------------
            // Check again
            // ------------------------------------------------------

            if (
                fileInputs.length === 0
            ) {

                throw new Error(
                    "No file input found for Upload Return Label."
                );

            }

            // ------------------------------------------------------
            // Use last file input
            // ------------------------------------------------------

            const uploadInput =
                fileInputs[
                    fileInputs.length - 1
                ];

            console.log(
                "Uploading PDF:",
                pdfPath
            );

            await this.driver.executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                uploadInput
            );

            await uploadInput.sendKeys(
                pdfPath
            );

            await this.driver.sleep(2000);

            console.log(
                "Return label uploaded successfully."
            );

            return "UPLOAD_RETURN_LABEL";
        }

        // ==========================================================
        // NORMAL SHIPPING
        // ==========================================================

        if (
            selectedOption.name !==
            "Create Return Label"
        ) {

            console.log(
                `No additional action required for ${selectedOption.name}.`
            );

            return selectedOption.name;
        }

        // ==========================================================
        // CREATE RETURN LABEL
        // ==========================================================

        console.log(
            "Create Return Label selected."
        );

        // ==========================================================
        // WAIT FOR ADDRESS DIALOG
        // ==========================================================

        const addressDialog =
            By.xpath(
                "//div[@role='dialog']"
            );

        await this.driver.wait(
            until.elementLocated(
                addressDialog
            ),
            30000
        );

        await this.driver.sleep(1000);

        // ==========================================================
        // ADDRESS OPTIONS
        // ==========================================================

        const addNewAddress =
            By.xpath(
                "//div[@role='dialog']//label[" +
                "contains(translate(normalize-space(.)," +
                "'ABCDEFGHIJKLMNOPQRSTUVWXYZ'," +
                "'abcdefghijklmnopqrstuvwxyz')," +
                "'add a new address')" +
                "]"
            );

        const useSavedAddress =
            By.xpath(
                "//div[@role='dialog']//label[" +
                "contains(translate(normalize-space(.)," +
                "'ABCDEFGHIJKLMNOPQRSTUVWXYZ'," +
                "'abcdefghijklmnopqrstuvwxyz')," +
                "'use a saved address')" +
                "]"
            );

        const addressOptions = [

            {
                name: "Add a new address",
                locator: addNewAddress
            },

            {
                name: "Use a saved address",
                locator: useSavedAddress
            }

        ];

        // ==========================================================
        // RANDOM ADDRESS OPTION
        // ==========================================================

        const addressIndex =
            Math.floor(
                Math.random() *
                addressOptions.length
            );

        const selectedAddressOption =
            addressOptions[addressIndex];

        console.log(
            "Address Option Selected:",
            selectedAddressOption.name
        );

        await this.click(
            selectedAddressOption.locator
        );

        await this.driver.sleep(1000);

        // ==========================================================
        // ADD NEW ADDRESS
        // ==========================================================

        if (
            selectedAddressOption.name ===
            "Add a new address"
        ) {

            console.log(
                "Add a new address selected."
            );

            const dynamicAddress =
                this.generateDynamicAddress();

            console.log(
                "Dynamic Address:",
                dynamicAddress
            );

            await this.fillNewCourierAddress(
                dynamicAddress
            );

            console.log(
                "New address added successfully."
            );

            return "ADD_NEW_ADDRESS";
        }

        // ==========================================================
        // USE SAVED ADDRESS
        // ==========================================================

        console.log(
            "Use a saved address selected."
        );

        await this.driver.wait(
            until.elementLocated(
                By.xpath(
                    "//div[@role='dialog']"
                )
            ),
            10000
        );

        // ==========================================================
        // FIND SAVED ADDRESS RADIO LABELS
        // ==========================================================

        const allRadioLabels =
            await this.driver.findElements(
                By.xpath(
                    "//div[@role='dialog']//label[.//input[@type='radio']]"
                )
            );

        const savedAddresses = [];

        for (
            const label of allRadioLabels
        ) {

            try {

                const text =
                    (
                        await label.getText()
                    ).trim();

                const lowerText =
                    text.toLowerCase();

                // --------------------------------------------------
                // Ignore top-level address options
                // --------------------------------------------------

                if (
                    lowerText.includes(
                        "add a new address"
                    ) ||
                    lowerText.includes(
                        "use a saved address"
                    )
                ) {

                    continue;

                }

                const radio =
                    await label.findElements(
                        By.xpath(
                            ".//input[@type='radio']"
                        )
                    );

                if (
                    radio.length > 0
                ) {

                    savedAddresses.push({

                        label: label,

                        text: text

                    });

                }

            } catch (error) {

                console.log(
                    "Unable to read one saved address."
                );

            }

        }

        // ==========================================================
        // NO SAVED ADDRESS
        // ==========================================================

        if (
            savedAddresses.length === 0
        ) {

            throw new Error(
                "Use a saved address was selected, but no saved addresses were found."
            );

        }

        // ==========================================================
        // RANDOM SAVED ADDRESS
        // ==========================================================

        const savedIndex =
            Math.floor(
                Math.random() *
                savedAddresses.length
            );

        const selectedSavedAddress =
            savedAddresses[savedIndex];

        console.log(
            "Saved Address Selected:",
            selectedSavedAddress.text
                .replace(/\s+/g, " ")
                .substring(0, 150)
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            selectedSavedAddress.label
        );

        await this.driver.executeScript(
            "arguments[0].click();",
            selectedSavedAddress.label
        );

        await this.driver.sleep(1000);

        console.log(
            "Saved address selected successfully."
        );

        return "SAVED_ADDRESS";
    }

    // ==============================================================
    // FILL NEW COURIER ADDRESS
    // ==============================================================

    async fillNewCourierAddress(
        addressData = {}
    ) {

        // ==========================================================
        // DEFAULT ADDRESS
        // ==========================================================

        const defaultAddress = {

            name:
                "Test Courier",

            address:
                "123 Test Street",

            city:
                "Bangalore",

            state:
                "Karnataka",

            zip:
                "560001",

            country:
                "India",

            phone:
                "9876543210",

            email:
                "testcourier@gmail.com"

        };

        const address = {

            ...defaultAddress,

            ...addressData

        };

        console.log(
            "Address Data:",
            address
        );

        // ==========================================================
        // WAIT FOR DIALOG
        // ==========================================================

        const dialog =
            By.xpath(
                "//div[@role='dialog']"
            );

        await this.driver.wait(
            until.elementLocated(
                dialog
            ),
            10000
        );

        // ==========================================================
        // FIND FIELD BY LABEL
        // ==========================================================

        const findFieldByLabel =
            async (
                labelNames
            ) => {

                const labels =
                    await this.driver.findElements(
                        By.xpath(
                            "//div[@role='dialog']//label"
                        )
                    );

                for (
                    const label of labels
                ) {

                    const labelText =
                        (
                            await label.getText()
                        )
                            .trim()
                            .toLowerCase();

                    const matched =
                        labelNames.some(
                            name =>
                                labelText.includes(
                                    name.toLowerCase()
                                )
                        );

                    if (!matched) {

                        continue;

                    }

                    // ------------------------------------------------
                    // Label "for" attribute
                    // ------------------------------------------------

                    const forAttribute =
                        await label.getAttribute(
                            "for"
                        );

                    if (
                        forAttribute
                    ) {

                        const inputs =
                            await this.driver.findElements(
                                By.id(
                                    forAttribute
                                )
                            );

                        if (
                            inputs.length > 0
                        ) {

                            return inputs[0];

                        }

                    }

                    // ------------------------------------------------
                    // Input inside label
                    // ------------------------------------------------

                    const inputs =
                        await label.findElements(
                            By.xpath(
                                ".//input[" +
                                "not(@type='radio') and " +
                                "not(@type='file')" +
                                "]"
                            )
                        );

                    if (
                        inputs.length > 0
                    ) {

                        return inputs[0];

                    }

                }

                return null;
            };

        // ==========================================================
        // NAME
        // ==========================================================

        const nameInput =
            await findFieldByLabel([

                "Name",

                "Full Name",

                "Contact Name",

                "Courier Name"

            ]);

        if (
            nameInput
        ) {

            await nameInput.clear();

            await nameInput.sendKeys(
                address.name
            );

        }

        // ==========================================================
        // ADDRESS
        // ==========================================================

        const addressInput =
            await findFieldByLabel([

                "Address",

                "Address Line",

                "Street Address"

            ]);

        if (
            addressInput
        ) {

            await addressInput.clear();

            await addressInput.sendKeys(
                address.address
            );

        }

        // ==========================================================
        // CITY
        // ==========================================================

        const cityInput =
            await findFieldByLabel([

                "City"

            ]);

        if (
            cityInput
        ) {

            await cityInput.clear();

            await cityInput.sendKeys(
                address.city
            );

        }

        // ==========================================================
        // STATE
        // ==========================================================

        const stateInput =
            await findFieldByLabel([

                "State",

                "Province"

            ]);

        if (
            stateInput
        ) {

            await stateInput.clear();

            await stateInput.sendKeys(
                address.state
            );

        }

        // ==========================================================
        // ZIP
        // ==========================================================

        const zipInput =
            await findFieldByLabel([

                "Zip",

                "ZIP",

                "Zip Code",

                "Postal Code"

            ]);

        if (
            zipInput
        ) {

            await zipInput.clear();

            await zipInput.sendKeys(
                address.zip
            );

        }

        // ==========================================================
        // COUNTRY
        // ==========================================================

        const countryInput =
            await findFieldByLabel([

                "Country"

            ]);

        if (
            countryInput
        ) {

            await countryInput.click();

            await this.driver.sleep(
                500
            );

            try {

                await this.click(

                    By.xpath(
                        `//li[normalize-space()='${address.country}']`
                    )

                );

            } catch (error) {

                await countryInput.clear();

                await countryInput.sendKeys(
                    address.country
                );

                await this.driver.sleep(
                    500
                );

                await this.click(

                    By.xpath(
                        `//li[contains(normalize-space(.),'${address.country}')]`
                    )

                );

            }

        }

        // ==========================================================
        // PHONE
        // ==========================================================

        const phoneInput =
            await findFieldByLabel([

                "Phone",

                "Phone Number",

                "Telephone"

            ]);

        if (
            phoneInput
        ) {

            await phoneInput.clear();

            await phoneInput.sendKeys(
                address.phone
            );

        }

        // ==========================================================
        // EMAIL
        // ==========================================================

        const emailInput =
            await findFieldByLabel([

                "Email",

                "Email Address"

            ]);

        if (
            emailInput
        ) {

            await emailInput.clear();

            await emailInput.sendKeys(
                address.email
            );

        }

        // ==========================================================
        // ADD ADDRESS BUTTON
        // ==========================================================

        const addAddressButton =
            By.xpath(
                "//div[@role='dialog']//button[" +
                "contains(translate(normalize-space(.)," +
                "'ABCDEFGHIJKLMNOPQRSTUVWXYZ'," +
                "'abcdefghijklmnopqrstuvwxyz')," +
                "'add address')" +
                "]"
            );

        await this.click(
            addAddressButton
        );

        await this.driver.sleep(
            1500
        );

        console.log(
            "Clicked Add Address."
        );
    }

    // ==============================================================
    // GENERATE DYNAMIC ADDRESS
    // ==============================================================

    generateDynamicAddress() {

        const timestamp =
            Date.now();

        const random =
            Math.floor(
                1000 +
                Math.random() *
                9000
            );

        const uniqueId =
            `${timestamp}${random}`;

        return {

            name:
                `Automation User ${random}`,

            address:
                `${random} Test Street`,

            city:
                "Bangalore",

            state:
                "Karnataka",

            zip:
                "560001",

            country:
                "India",

            phone:
                `98765${String(random).padStart(5, "0")}`,

            email:
                `automation${uniqueId}@gmail.com`

        };

    }

    // ==============================================================
    // REFUND POLICY
    // ==============================================================

    async acceptRefundPolicy() {

        console.log(
            "Accepting Refund Policy..."
        );

        await this.click(
            this.refundPolicy
        );

        await this.driver.sleep(
            500
        );

        console.log(
            "Refund Policy Accepted."
        );

    }

    // ==============================================================
    // PAYMENT METHOD
    //
    // Randomly selects:
    //
    // 1. Credit/Debit Card
    // 2. Company's Check
    // 3. ACH/Wire Transfer
    // 4. Purchase Order (PO)
    //
    // ==============================================================

    async selectPaymentMethod() {
        console.log("Payment");

        const paymentMethods = [

            "Credit/Debit Card",

            "Company's Check",

            "ACH/Wire Transfer",

            "Purchase Order (PO)"

        ];

        // ==========================================================
        // RANDOM PAYMENT
        // ==========================================================

        const randomIndex =
            Math.floor(
                Math.random() *
                paymentMethods.length
            );

        const payment =
            paymentMethods[randomIndex];

        console.log(
            "Selecting Payment:",
            payment
        );

        // ==========================================================
        // FIND RADIO BUTTON
        // ==========================================================

        const radio =
            await this.driver.wait(

                until.elementLocated(

                    this.paymentRadio(
                        payment
                    )

                ),

                30000

            );

        // ==========================================================
        // SCROLL
        // ==========================================================

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            radio
        );

        await this.driver.sleep(
            300
        );

        // ==========================================================
        // CLICK
        // ==========================================================

        await this.driver.executeScript(
            "arguments[0].click();",
            radio
        );

        await this.driver.sleep(
            1500
        );

        console.log(
            "Payment selected:",
            payment
        );

        // VERY IMPORTANT
        // Return selected payment method.
        //
        // The caller needs this value to know
        // whether card details are required.

        return payment;
    }

    // ==============================================================
    // ENTER CREDIT / DEBIT CARD DETAILS
    // ==============================================================

    async enterCardDetails(

        cardholderName,

        cardNumber,

        expiry,

        cvv

    ) {

        console.log(
            "\nEntering Credit/Debit Card details..."
        );

        // ==========================================================
        // WAIT FOR CARD SECTION
        // ==========================================================

        await this.driver.wait(

            until.elementLocated(
                this.cardholderName
            ),

            30000

        );

        await this.driver.sleep(
            1000
        );

        // ==========================================================
        // CARDHOLDER NAME
        // ==========================================================

        console.log(
            "Entering Cardholder Name..."
        );

        await this.type(

            this.cardholderName,

            cardholderName

        );

        // ==========================================================
        // CARD NUMBER
        // ==========================================================

        console.log(
            "Entering Card Number..."
        );

        await this.type(

            this.cardNumber,

            cardNumber

        );

        // ==========================================================
        // EXPIRY
        // ==========================================================

        console.log(
            "Entering Expiry..."
        );

        await this.type(

            this.cardExpiry,

            expiry

        );

        // ==========================================================
        // CVV
        // ==========================================================

        console.log(
            "Entering CVV..."
        );

        await this.type(

            this.cardCvv,

            cvv

        );

        console.log(
            "Card details entered successfully."
        );

    }

    // ==============================================================
    // CHECKOUT & PAY
    //
    // Used when:
    //
    // Payment = Credit/Debit Card
    // AND
    // service requires card details
    //
    // ==============================================================

    async checkoutAndPay() {

        console.log(
            "Clicking Checkout & Pay..."
        );

        await this.click(
            this.checkoutAndPayButton
        );

        await this.waitLoader();

        await this.driver.sleep(
            2000
        );

        console.log(
            "Checkout & Pay clicked."
        );

    }

    // ==============================================================
    // CHECKOUT FROM CART
    //
    // Used for:
    //
    // - Company's Check
    // - ACH/Wire Transfer
    // - Purchase Order
    //
    // ==============================================================

    async checkoutFromCart() {

        console.log(
            "Clicking Checkout From Cart..."
        );

        try {

            // First try the specific
            // Pay Later checkout button.

            await this.click(
                this.checkoutPayLaterButton,
                15000
            );

        } catch (error) {

            console.log(
                "Specific Pay Later checkout button not found."
            );

            console.log(
                "Trying generic Checkout button..."
            );

            await this.click(
                this.checkoutButton,
                15000
            );

        }

        await this.waitLoader();

        await this.driver.sleep(
            2000
        );

        console.log(
            "Checkout From Cart completed."
        );

    }

    // ==============================================================
    // CONFIRM PAY LATER
    // ==============================================================

    async confirmPayLater() {

        console.log(
            "Checking Pay Later confirmation..."
        );

        try {

            const confirmButton =
                await this.driver.wait(

                    until.elementLocated(
                        this.confirmPayLaterButton
                    ),

                    5000

                );

            await this.driver.executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                confirmButton
            );

            await this.driver.sleep(
                300
            );

            await this.driver.executeScript(
                "arguments[0].click();",
                confirmButton
            );

            await this.driver.sleep(
                1000
            );

            console.log(
                "Pay Later confirmed."
            );

        } catch (error) {

            // Some services navigate directly
            // after checkout, therefore the
            // confirmation button may not exist.

            console.log(
                "Pay Later confirmation button not required."
            );

        }

    }

    // ==============================================================
    // COMPLETE PAYMENT FLOW
    //
    // ==============================================================
    //
    // requiresCardDetails = true
    //
    // Example:
    //
    // await cartCheckout.completePayment({
    //     requiresCardDetails: true
    // });
    //
    // --------------------------------------------------------------
    //
    // requiresCardDetails = false
    //
    // Example:
    //
    // await cartCheckout.completePayment({
    //     requiresCardDetails: false
    // });
    //
    // ==============================================================
    
    async completePayment({

        requiresCardDetails = true,

        cardholderName =
            "Test Automation User",

        cardNumber =
            "4111111111111111",

        expiry =
            "12/36",

        cvv =
            "123"

    } = {}) {

        // ==========================================================
        // SELECT PAYMENT
        // ==========================================================

        const paymentMethod =
            await this.selectPaymentMethod();

        console.log(
            "Returned Payment Method:",
            paymentMethod
        );

        // ==========================================================
        // CREDIT / DEBIT CARD
        // ==========================================================

        if (
            paymentMethod ===
            "Credit/Debit Card"
        ) {

            // ======================================================
            // SERVICE REQUIRES CARD DETAILS
            // ======================================================

            if (
                requiresCardDetails
            ) {

                console.log(
                    "This service requires Credit/Debit Card details."
                );

                await this.enterCardDetails(

                    cardholderName,

                    cardNumber,

                    expiry,

                    cvv

                );

                await this.checkoutAndPay();

            }

            // ======================================================
            // SERVICE DOES NOT REQUIRE CARD DETAILS
            // ======================================================

            else {

                console.log(
                    "This service does NOT require Credit/Debit Card details."
                );

                await this.checkoutFromCart();

                await this.confirmPayLater();

            }

        }

        // ==========================================================
        // NON-CARD PAYMENT
        //
        // Company's Check
        // ACH/Wire Transfer
        // Purchase Order
        // ==========================================================

        else {

            console.log(
                "Non-card payment selected:",
                paymentMethod
            );

            await this.checkoutFromCart();

            await this.confirmPayLater();

        }

        // ==========================================================
        // RETURN PAYMENT METHOD
        // ==========================================================

        return paymentMethod;
    }

}

// ================================================================
// EXPORT
// ================================================================

module.exports =
    CartCheckoutPage;