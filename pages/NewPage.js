const { By, until } = require("selenium-webdriver");

class NewPage {

    constructor(driver) {

        this.driver = driver;

        // New page URL
        this.newUrl =
            "https://wcsstestclient.azurewebsites.net/p/new";

        // New page tab/header
        this.pageMarker = By.xpath(
            "//*[normalize-space()='New']"
        );
    }

    // ==========================================
    // Wait until New page is fully loaded
    // ==========================================

    async waitForPage() {

        console.log("Waiting for New page to load...");

        // 1. Wait for New page URL
        await this.driver.wait(
            until.urlContains("/p/new"),
            120000
        );

        console.log("New page URL detected.");

        // 2. Wait for browser document to complete
        await this.driver.wait(
            async () => {

                try {

                    return await this.driver.executeScript(
                        "return document.readyState === 'complete';"
                    );

                } catch (error) {

                    return false;
                }

            },
            120000
        );

        console.log("Browser document loaded.");

        // 3. Wait for New page tab/header
        await this.driver.wait(
            until.elementLocated(this.pageMarker),
            60000
        );

        console.log("New page UI detected.");

        // 4. IMPORTANT:
        // Wait until WCS loading spinner disappears
        await this.waitForLoadingToFinish();

        // 5. Small synchronization buffer
        await this.driver.sleep(3000);

        console.log("New page fully loaded.");
    }

    // ==========================================
    // Wait until WCS loading spinner disappears
    // ==========================================

    async waitForLoadingToFinish() {

        console.log(
            "Waiting for WCS loading spinner to disappear..."
        );

        await this.driver.wait(
            async () => {

                try {

                    return await this.driver.executeScript(() => {

                        // WCS application loading indicators
                        const selectors = [

                            ".loading",
                            ".loader",
                            ".spinner",
                            ".loading-spinner",
                            ".preloader",
                            ".progress",
                            "[aria-busy='true']",

                            // Actual WCS spinner from the page
                            "i.fa.fa-spin.fa-spinner"
                        ];

                        for (const selector of selectors) {

                            const elements =
                                document.querySelectorAll(selector);

                            for (const element of elements) {

                                const style =
                                    window.getComputedStyle(element);

                                const visible =
                                    style.display !== "none" &&
                                    style.visibility !== "hidden" &&
                                    style.opacity !== "0" &&
                                    element.offsetWidth > 0 &&
                                    element.offsetHeight > 0;

                                if (visible) {

                                    return false;
                                }
                            }
                        }

                        return true;

                    });

                } catch (error) {

                    return false;
                }

            },
            120000
        );

        console.log(
            "WCS loading spinner disappeared."
        );
    }

    // ==========================================
    // Open New page
    // ==========================================

    async open() {

        console.log("Opening New page...");

        await this.driver.get(this.newUrl);

        await this.waitForPage();
    }
}

module.exports = NewPage;