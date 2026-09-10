const { expect } = require("chai");
const { until } = require("selenium-webdriver");

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");

require("dotenv").config();

describe("Processor Portal - Login Test Cases", function () {

    this.timeout(180000);

    let driver;
    let loginPage;

    // ==========================================
    // Before Test
    // ==========================================

    before(async function () {

        driver = await getDriver();

        loginPage = new LoginPage(driver);

        console.log("Browser started.");
    });

    // ==========================================
    // Test Case 1
    // Verify Login Page
    // ==========================================

    it("TC_LOGIN_001 - Verify login page is displayed", async function () {

        await loginPage.open();

        await loginPage.verifyLoginPage();

        const emailField =
            await driver.findElement(loginPage.emailInput);

        const passwordField =
            await driver.findElement(loginPage.passwordInput);

        expect(
            await emailField.isDisplayed()
        ).to.equal(true);

        expect(
            await passwordField.isDisplayed()
        ).to.equal(true);

        console.log("TC_LOGIN_001 PASSED");
    });

    // ==========================================
    // Test Case 2
    // Valid Login
    // ==========================================

    it("TC_LOGIN_002 - Login with valid credentials", async function () {

        // Make sure we are on login page
        await loginPage.open();

        await loginPage.login(
            process.env.EMAIL,
            process.env.PASSWORD
        );

        // Wait for successful login/navigation
            await driver.wait(
            until.urlContains("/p/new"),
            30000
        );
        

        const currentUrl =
            await driver.getCurrentUrl();

        console.log(
            "URL after login:",
            currentUrl
        );

        expect(currentUrl).to.include("/p/new");

        console.log("TC_LOGIN_002 PASSED");
    });

    // ==========================================
    // After Test
    // ==========================================

    after(async function () {

        if (driver) {
            await driver.quit();

            console.log("Browser closed.");
        }
    });

});