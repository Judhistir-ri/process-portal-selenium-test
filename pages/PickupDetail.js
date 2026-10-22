
const { By, until } = require("selenium-webdriver");

class PickupDetail {
    constructor(driver) {
        this.driver = driver;
        this.url =
            "https://wcsstestclient.azurewebsites.net/p/pickup";

        this.pickupPanel = By.css("div.pickup");
        this.completedPanel = By.css("div.completed-docs");

        this.pickupExport = By.css(
            "div.pickup button[ng-click*='exportDetails']"
        );
        this.completedExport = By.css(
            "div.completed-docs button[ng-click*='exportDetails']"
        );

        this.pickupPrintDocs = By.css(
            "div.pickup a[ng-click*=\"print('PICK')\"]"
        );
        this.completedPrintDocs = By.css(
            "div.completed-docs a[ng-click*=\"print('COMP')\"]"
        );

        this.errorToast = By.css(
            "#toast-container .toast-message, .toast-message"
        );
    }

    async waitForLoadingToFinish(timeout = 60000) {
        await this.driver.wait(async () => {
            return this.driver.executeScript(() => {
                const selectors = [
                    ".loading-spiner-holder",
                    ".loading",
                    ".loader",
                    ".spinner",
                    ".loading-spinner",
                    ".preloader"
                ];

                return selectors.every(selector =>
                    Array.from(
                        document.querySelectorAll(selector)
                    ).every(el => {
                        const style = getComputedStyle(el);

                        return (
                            style.display === "none" ||
                            style.visibility === "hidden" ||
                            style.opacity === "0" ||
                            el.offsetWidth === 0 ||
                            el.offsetHeight === 0
                        );
                    })
                );
            });
        }, timeout, "Loading spinner did not disappear.");
    }

    async open() {
        await this.driver.get(this.url);

        await this.driver.wait(
            until.urlContains("/p/pickup"),
            60000
        );

        await this.driver.wait(
            until.elementLocated(this.pickupPanel),
            30000,
            "Pickup Queue panel did not load."
        );

        await this.driver.wait(
            until.elementLocated(this.completedPanel),
            30000,
            "Completed panel did not load."
        );

        await this.waitForLoadingToFinish();

        console.log("✓ Pickup page loaded successfully.");
    }

    async getDocumentCount(panelLocator) {
        const panel = await this.driver.findElement(panelLocator);

        return this.driver.executeScript(element => {
            const text = element.innerText || "";

            if (/no documents found/i.test(text)) {
                return 0;
            }

            const rows = Array.from(
                element.querySelectorAll("tr")
            );

            return rows.filter(row => {
                const cells = row.querySelectorAll("td");
                const rowText = (row.innerText || "").trim();

                return (
                    cells.length > 0 &&
                    rowText.length > 0 &&
                    !/no documents found/i.test(rowText)
                );
            }).length;
        }, panel);
    }

    async getPanelText(panelLocator) {
        const panel = await this.driver.findElement(panelLocator);
        return (await panel.getText()).trim();
    }

    async clickVisible(locator, description) {
        await this.waitForLoadingToFinish();

        const element = await this.driver.wait(
            until.elementLocated(locator),
            30000,
            `${description} button was not found.`
        );

        await this.driver.wait(
            until.elementIsVisible(element),
            15000,
            `${description} button is not visible.`
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        );

        await this.driver.wait(
            until.elementIsEnabled(element),
            10000
        );

        try {
            await element.click();
        } catch (error) {
            await this.driver.executeScript(
                "arguments[0].click();",
                element
            );
        }
    }

    async waitForNoDocumentsMessage(timeout = 10000) {
        await this.driver.wait(async () => {
            const messages = await this.driver.findElements(
                this.errorToast
            );

            for (const message of messages) {
                if (
                    await message.isDisplayed().catch(() => false)
                ) {
                    const text = (await message.getText()).trim();

                    if (/no documents found/i.test(text)) {
                        return true;
                    }
                }
            }

            return false;
        }, timeout, 'Expected error "No documents found." was not displayed.');

        console.log('✓ Application displayed: "No documents found."');
    }

    async clickPickupExport() {
        await this.clickVisible(
            this.pickupExport,
            "Pickup Queue Export"
        );
    }

    async clickCompletedExport() {
        await this.clickVisible(
            this.completedExport,
            "Completed Export"
        );
    }

    async clickPickupPrintDocs() {
        await this.clickVisible(
            this.pickupPrintDocs,
            "Pickup Queue Print Docs"
        );
    }

    async clickCompletedPrintDocs() {
        await this.clickVisible(
            this.completedPrintDocs,
            "Completed Print Docs"
        );
    }
}

module.exports = PickupDetail;
