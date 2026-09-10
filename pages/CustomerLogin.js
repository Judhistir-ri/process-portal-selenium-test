const { By, until } = require("selenium-webdriver");

class LoginPage {

    constructor(driver) {

        this.driver = driver;

        // Login fields
        this.email =
            By.css("input[placeholder='Email Address']");

        this.password =
            By.css("input[placeholder='Password']");

        this.loginButton =
            By.xpath("//button[normalize-space()='Sign In']");

        // Other elements
      this.dashboardWelcome = By.xpath(
    "//*[normalize-space()='Welcome to WCS Express']"
        );
        

        this.forgotPassword =
            By.xpath("//p[contains(text(),'Forgot password')]");

        this.errorToast =
            By.xpath(
                "//*[contains(text(),'Invalid email or password')]"
            );
    }


    // ==========================================
    // OPEN LOGIN PAGE
    // ==========================================

    async open() {

        await this.driver.get(
            "https://wcscustomerportal.azurewebsites.net/login"
        );

        // Wait until page is completely loaded
        await this.driver.wait(
            async () => {

                const state =
                    await this.driver.executeScript(
                        "return document.readyState;"
                    );

                return state === "complete";

            },
            30000
        );

        // Give React time to finish rendering
        await this.driver.sleep(1000);
    }


    // ==========================================
    // FIND VISIBLE + ENABLED ELEMENT
    // ==========================================

    async findInteractable(locator, timeout = 20000) {

        return await this.driver.wait(
            async () => {

                const elements =
                    await this.driver.findElements(locator);

                for (const element of elements) {

                    try {

                        const displayed =
                            await element.isDisplayed();

                        const enabled =
                            await element.isEnabled();

                        if (displayed && enabled) {
                            return element;
                        }

                    } catch (e) {
                        // Element may have been replaced by React
                    }
                }

                return false;

            },
            timeout
        );
    }


    // ==========================================
    // ENTER EMAIL
    // ==========================================

    async enterEmail(email) {

        console.log("Entering Email...");

        const textbox =
            await this.findInteractable(
                this.email,
                20000
            );

        // Scroll input into view
        await this.driver.executeScript(
            `
            arguments[0].scrollIntoView({
                block: "center",
                inline: "center"
            });
            `,
            textbox
        );

        await this.driver.sleep(300);


        // Try normal Selenium interaction first
        try {

            await textbox.click();

            await textbox.clear();

            await textbox.sendKeys(email);

        } catch (error) {

            console.log(
                "Normal email interaction failed."
            );

            console.log(
                "Using React-compatible JavaScript input..."
            );


            // React-compatible native value setter
            await this.driver.executeScript(
                `
                const input = arguments[0];
                const value = arguments[1];

                const setter =
                    Object.getOwnPropertyDescriptor(
                        HTMLInputElement.prototype,
                        "value"
                    ).set;

                setter.call(input, value);

                input.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );

                input.focus();
                `,
                textbox,
                email
            );
        }


        // Verify email was entered
        await this.driver.wait(
            async () => {

                try {

                    const value =
                        await textbox.getAttribute("value");

                    return value === email;

                } catch (e) {

                    return false;

                }

            },
            10000
        );

        console.log("✓ Email entered");
    }


    // ==========================================
    // ENTER PASSWORD
    // ==========================================

    async enterPassword(password) {

        console.log("Entering Password...");

        const textbox =
            await this.findInteractable(
                this.password,
                20000
            );

        await this.driver.executeScript(
            `
            arguments[0].scrollIntoView({
                block: "center",
                inline: "center"
            });
            `,
            textbox
        );

        await this.driver.sleep(300);


        try {

            await textbox.click();

            await textbox.clear();

            await textbox.sendKeys(password);

        } catch (error) {

            console.log(
                "Normal password interaction failed."
            );

            console.log(
                "Using React-compatible JavaScript input..."
            );

            await this.driver.executeScript(
                `
                const input = arguments[0];
                const value = arguments[1];

                const setter =
                    Object.getOwnPropertyDescriptor(
                        HTMLInputElement.prototype,
                        "value"
                    ).set;

                setter.call(input, value);

                input.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );

                input.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );

                input.focus();
                `,
                textbox,
                password
            );
        }


        // Verify password was entered
        await this.driver.wait(
            async () => {

                try {

                    const value =
                        await textbox.getAttribute("value");

                    return value === password;

                } catch (e) {

                    return false;

                }

            },
            10000
        );

        console.log("✓ Password entered");
    }


    // ==========================================
    // CLICK SIGN IN
    // ==========================================

    async clickLogin() {

        console.log("Clicking Sign In...");

        const button =
            await this.findInteractable(
                this.loginButton,
                20000
            );

        await this.driver.executeScript(
            `
            arguments[0].scrollIntoView({
                block: "center",
                inline: "center"
            });
            `,
            button
        );

        await this.driver.sleep(300);

        try {

            await button.click();

        } catch (error) {

            console.log(
                "Normal Sign In click failed."
            );

            console.log(
                "Using JavaScript click..."
            );

            await this.driver.executeScript(
                "arguments[0].click();",
                button
            );
        }
    }


    // ==========================================
    // LOGIN
    // ==========================================

    async login(email, password) {

        await this.enterEmail(email);

        await this.enterPassword(password);

        console.log("--------------------------------");
        console.log("Solve CAPTCHA manually...");
        console.log(
            "Selenium will click Sign In after 15 seconds."
        );
        console.log("--------------------------------");


        // Allow manual CAPTCHA solving
        await this.driver.sleep(60000);


        // Click Sign In
        await this.clickLogin();


        // Wait until dashboard is loaded
        await this.driver.wait(
            async () => {

                const url =
                    await this.driver.getCurrentUrl();

                return (
                    url ===
                    "https://wcscustomerportal.azurewebsites.net/"
                );

            },
            30000
        );

        console.log("Login Successful");
    }

  // ==========================================
// VERIFY DASHBOARD
// ==========================================
async waitForDashboard(timeout = 30000) {

    console.log("Waiting for WCS Express dashboard...");

    // Wait for dashboard URL
    await this.driver.wait(
        until.urlIs(
            "https://wcscustomerportal.azurewebsites.net/"
        ),
        timeout
    );

    console.log("✓ Dashboard URL detected.");

    // Now verify dashboard text
    const dashboardElement =
        await this.driver.wait(
            until.elementLocated(
                this.dashboardWelcome
            ),
            timeout
        );

    await this.driver.wait(
        until.elementIsVisible(dashboardElement),
        timeout
    );

    console.log("✓ WCS Express dashboard is displayed.");

    return dashboardElement;
    }
    
    


    // ==========================================
    // ERROR MESSAGE
    // ==========================================

    async getErrorMessage() {

        const error =
            await this.driver.wait(
                until.elementLocated(
                    this.errorToast
                ),
                10000
            );

        return await error.getText();
    }
}

module.exports = LoginPage;