const { expect } = require("chai");
const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/CustomerLogin");

describe("Customer Login Module", function () {

    this.timeout(180000);

    let driver;
    let login;

    before(async () => {
        driver = await getDriver();

        login = new LoginPage(driver);

        await login.open();
    });

    after(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it("Should login successfully after CAPTCHA verification", async () => {

        // ==========================================
        // STEP 1 - ENTER EMAIL
        // ==========================================

        await login.enterEmail(
            process.env.WCS_EMAIL
        );


        // ==========================================
        // STEP 2 - ENTER PASSWORD
        // ==========================================

        await login.enterPassword(
            process.env.WCS_PASSWORD
        );


        // ==========================================
        // STEP 3 - CAPTCHA
        // ==========================================

        console.log("");
        console.log("==========================================");
        console.log("PLEASE COMPLETE CAPTCHA MANUALLY");
        console.log("==========================================");
        console.log("Complete the CAPTCHA in the browser.");
        console.log("You have 60 seconds.");
        console.log("==========================================");
        console.log("");

        // Give user time to complete CAPTCHA
        await driver.sleep(60000);


        // ==========================================
        // STEP 4 - CLICK SIGN IN
        // ==========================================

        await login.clickLogin();

        console.log("Sign In clicked.");


        // ==========================================
        // STEP 5 - WAIT FOR DASHBOARD
        // ==========================================

        await login.waitForDashboard(30000);


        // ==========================================
        // STEP 6 - VERIFY URL
        // ==========================================

        const currentUrl = await driver.getCurrentUrl();

        console.log("Current URL:", currentUrl);

        expect(currentUrl)
            .to.equal(
                "https://wcscustomerportal.azurewebsites.net/"
            );


        // ==========================================
        // STEP 7 - VERIFY DASHBOARD
        // ==========================================

        const dashboardText =
            await driver.findElement(
                login.dashboardWelcome
            ).getText();

        expect(dashboardText)
            .to.equal("Welcome to WCS Express");


        console.log("");
        console.log("==========================================");
        console.log("✓ LOGIN SUCCESSFUL");
        console.log("✓ CAPTCHA PASSED");
        console.log("✓ DASHBOARD LOADED");
        console.log("✓ WELCOME TO WCS EXPRESS DISPLAYED");
        console.log("==========================================");
    });
});