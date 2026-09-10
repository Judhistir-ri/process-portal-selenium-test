const { By, until } = require("selenium-webdriver");

class LoginPage {
    constructor(driver) {
        this.driver = driver;

        // ==============================
        // Login Page Locators
        // ==============================

        this.emailInput = By.id("email");

        this.passwordInput = By.id("password");

        this.signInForm = By.id("signIn");

        this.signInButton = By.xpath(
            "//form[@id='signIn']//button[contains(normalize-space(), 'Sign In')]"
        );

        // reCAPTCHA container
        this.recaptcha = By.id("gRecaptcha");

        // Security Advisory close button
        this.securityAdvisoryClose = By.id("cacheAdvisoryOk");
    }

    // ==========================================
    // Open Login Page
    // ==========================================

    async open() {
        await this.driver.get(process.env.BASE_URL);

        await this.driver.wait(
            until.elementLocated(this.emailInput),
            15000
        );
    }

    // ==========================================
    // Close Security Advisory if displayed
    // ==========================================

    async closeSecurityAdvisoryIfDisplayed() {
        try {
            const closeButton = await this.driver.findElement(
                this.securityAdvisoryClose
            );

            if (await closeButton.isDisplayed()) {
                await closeButton.click();

                console.log("Security Advisory closed.");
            }
        } catch (error) {
            console.log("Security Advisory not displayed.");
        }
    }

    // ==========================================
    // Enter Email
    // ==========================================

    async enterEmail(email) {
        const emailField = await this.driver.wait(
            until.elementLocated(this.emailInput),
            10000
        );

        await this.driver.wait(
            until.elementIsVisible(emailField),
            10000
        );

        await emailField.clear();
        await emailField.sendKeys(email);
    }

    // ==========================================
    // Enter Password
    // ==========================================

    async enterPassword(password) {
        const passwordField = await this.driver.wait(
            until.elementLocated(this.passwordInput),
            10000
        );

        await this.driver.wait(
            until.elementIsVisible(passwordField),
            10000
        );

        await passwordField.clear();
        await passwordField.sendKeys(password);
    }

    // ==========================================
    // Check Login Page Elements
    // ==========================================

    async verifyLoginPage() {
        await this.driver.wait(
            until.elementLocated(this.emailInput),
            10000
        );

        await this.driver.wait(
            until.elementLocated(this.passwordInput),
            10000
        );

        await this.driver.wait(
            until.elementLocated(this.recaptcha),
            10000
        );

        await this.driver.wait(
            until.elementLocated(this.signInForm),
            10000
        );

        console.log("Login page elements are displayed.");
    }

    // ==========================================
    // Wait for Manual CAPTCHA Completion
    // ==========================================

    async waitForCaptchaCompletion(timeout = 120000) {

        console.log("------------------------------------------");
        console.log("Please complete the CAPTCHA manually.");
        console.log("Waiting for CAPTCHA verification...");
        console.log("------------------------------------------");

        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {

            try {

                const captchaCompleted =
                    await this.driver.executeScript(() => {

                        const response =
                            document.querySelector(
                                "#g-recaptcha-response"
                            );

                        return response &&
                               response.value &&
                               response.value.length > 0;
                    });

                if (captchaCompleted) {

                    console.log("CAPTCHA completed successfully.");

                    return;
                }

            } catch (error) {
                // Continue waiting
            }

            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );
        }

        throw new Error(
            "CAPTCHA was not completed within the timeout period."
        );
    }

    // ==========================================
    // Click Sign In
    // ==========================================

    async clickSignIn() {

        const button = await this.driver.wait(
            until.elementLocated(this.signInButton),
            10000
        );

        await this.driver.wait(
            until.elementIsVisible(button),
            10000
        );

        await this.driver.wait(
            until.elementIsEnabled(button),
            10000
        );

        await button.click();

        console.log("Sign In button clicked.");
    }

    // ==========================================
    // Complete Login
    // ==========================================

    async login(email, password) {

        await this.closeSecurityAdvisoryIfDisplayed();

        await this.enterEmail(email);

        await this.enterPassword(password);

        await this.waitForCaptchaCompletion();

        await this.clickSignIn();
    }
}

module.exports = LoginPage;