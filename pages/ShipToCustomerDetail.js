
const { By, until } = require("selenium-webdriver");

class ShipToCustomerDetail {
    constructor(driver) {
        this.driver = driver;

        this.url =
            "https://wcsstestclient.azurewebsites.net/p/shiptocustomer";

        // IMPORTANT: The screenshot shows "shipToCustomer-docs"
        // (singular Customer), not "shipToCustomers-docs".
        this.readyToShipSection = By.css("div.shipToCustomer-docs");
        this.completedSection = By.css("div.completed-docs");

        this.readyToShipExport = By.css(
            "div.shipToCustomer-docs button[ng-click*='exportDetails']"
        );

        this.completedExport = By.css(
            "div.completed-docs button[ng-click*='exportDetails']"
        );

        this.readyToShipPrintDocs = By.css(
            "div.shipToCustomer-docs a[ng-click*=\"print('SHIP')\"]"
        );

        this.completedPrintDocs = By.css(
            "div.completed-docs a[ng-click*=\"print('COMP')\"]"
        );
    }

    getSectionLocator(section) {
        if (section === "readyToShip") {
            return this.readyToShipSection;
        }

        if (section === "completed") {
            return this.completedSection;
        }

        throw new Error(`Invalid section: ${section}`);
    }

    // Wait for the browser document to be ready.
    async waitForDocumentReady(timeout = 60000) {
        await this.driver.wait(async () => {
            try {
                return await this.driver.executeScript(
                    "return document.readyState === 'complete';"
                );
            } catch {
                return false;
            }
        }, timeout, "Browser document did not finish loading.");
    }

    // Wait until visible loading overlays/spinners disappear.
    async waitForLoadingToFinish(timeout = 60000) {
        await this.driver.wait(async () => {
            return await this.driver.executeScript(() => {
                const selectors = [
                    ".loading-spiner-holder",
                    ".loading",
                    ".loader",
                    ".spinner",
                    ".loading-spinner",
                    ".preloader"
                ];

                return selectors.every(selector => {
                    return Array.from(
                        document.querySelectorAll(selector)
                    ).every(element => {
                        const style = window.getComputedStyle(element);

                        return (
                            style.display === "none" ||
                            style.visibility === "hidden" ||
                            style.opacity === "0" ||
                            element.offsetWidth === 0 ||
                            element.offsetHeight === 0
                        );
                    });
                });
            });
        }, timeout, "Loading spinner did not disappear.");
    }

    // Wait until a section exists and is visible.
    async waitForVisibleSection(locator, description, timeout = 60000) {
        await this.driver.wait(async () => {
            try {
                const elements = await this.driver.findElements(locator);

                for (const element of elements) {
                    if (await element.isDisplayed()) {
                        return true;
                    }
                }

                return false;
            } catch {
                return false;
            }
        }, timeout, `${description} section was not found or visible.`);
    }

    // Wait until the section's documents have rendered.
    // A section is ready when it contains document rows or
    // the application displays "No documents found."
    async waitForSectionContent(locator, description, timeout = 60000) {
        await this.driver.wait(async () => {
            try {
                const sections = await this.driver.findElements(locator);

                for (const section of sections) {
                    if (!(await section.isDisplayed())) {
                        continue;
                    }

                    const result = await this.driver.executeScript(
                        element => {
                            const text = (element.innerText || "").trim();

                            const hasNoDocumentsMessage =
                                /no documents found/i.test(text);

                            const rows = Array.from(
                                element.querySelectorAll("table tr")
                            );

                            const hasDocumentRows = rows.some(row => {
                                const cells = Array.from(
                                    row.querySelectorAll("td")
                                );

                                const rowText =
                                    (row.innerText || "").trim();

                                if (
                                    cells.length === 0 ||
                                    !rowText ||
                                    /no documents found/i.test(rowText)
                                ) {
                                    return false;
                                }

                                return cells.some(cell =>
                                    /^\d+$/.test(
                                        (cell.innerText || "").trim()
                                    )
                                );
                            });

                            return (
                                hasDocumentRows ||
                                hasNoDocumentsMessage
                            );
                        },
                        section
                    );

                    if (result) {
                        return true;
                    }
                }

                return false;
            } catch {
                return false;
            }
        }, timeout, `${description}: documents did not finish rendering.`);
    }

    async waitForPage() {
        await this.driver.wait(
            until.urlContains("/p/shiptocustomer"),
            60000,
            "Ship to Customer URL was not loaded."
        );

        await this.waitForDocumentReady();

        // Wait for both panel containers to render.
        await this.waitForVisibleSection(
            this.readyToShipSection,
            "Ready to ship"
        );

        await this.waitForVisibleSection(
            this.completedSection,
            "Completed"
        );

        // Wait for loading overlays to disappear.
        await this.waitForLoadingToFinish();

        // Wait until each panel has loaded its rows or empty message.
        await this.waitForSectionContent(
            this.readyToShipSection,
            "Ready to ship"
        );

        await this.waitForSectionContent(
            this.completedSection,
            "Completed"
        );

        console.log(
            "✓ Ship to Customer page and document sections fully loaded."
        );
    }

    async open() {
        await this.driver.get(this.url);
        await this.waitForPage();
    }

    async getDocumentCount(sectionName) {
        const locator = this.getSectionLocator(sectionName);

        await this.waitForVisibleSection(
            locator,
            sectionName
        );

        return await this.driver.executeScript(element => {
            const rows = Array.from(
                element.querySelectorAll("table tr")
            );

            return rows.filter(row => {
                const cells = Array.from(
                    row.querySelectorAll("td")
                );

                const rowText = (row.innerText || "").trim();

                if (
                    cells.length === 0 ||
                    !rowText ||
                    /no documents found/i.test(rowText)
                ) {
                    return false;
                }

                return cells.some(cell =>
                    /^\d+$/.test(
                        (cell.innerText || "").trim()
                    )
                );
            }).length;
        }, await this.driver.findElement(locator));
    }

    async getPanelText(sectionName) {
        const locator = this.getSectionLocator(sectionName);
        const panel = await this.driver.findElement(locator);

        return (await panel.getText()).trim();
    }

    async hasNoDocumentsMessage(sectionName) {
        const text = await this.getPanelText(sectionName);
        return /no documents found/i.test(text);
    }

    async waitForNoDocumentsMessage(timeout = 10000) {
        await this.driver.wait(async () => {
            const elements = await this.driver.findElements(
                By.css("#toast-container .toast-message, .toast-message")
            );

            for (const element of elements) {
                try {
                    if (
                        await element.isDisplayed() &&
                        /no documents found/i.test(await element.getText())
                    ) {
                        return true;
                    }
                } catch {
                    // The toast may disappear while polling.
                }
            }

            return false;
        }, timeout, 'Expected "No documents found." message was not displayed.');

        console.log('✓ Application displayed: "No documents found."');
    }

    async clickVisible(locator, description) {
        await this.waitForLoadingToFinish();

        const element = await this.driver.wait(
            until.elementLocated(locator),
            30000,
            `${description} was not found.`
        );

        await this.driver.wait(
            until.elementIsVisible(element),
            15000,
            `${description} is not visible.`
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({ block: 'center' });",
            element
        );

        await this.driver.wait(
            until.elementIsEnabled(element),
            10000,
            `${description} is not enabled.`
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

    async clickReadyToShipExport() {
        await this.clickVisible(
            this.readyToShipExport,
            "Ready to Ship Export"
        );
    }

    async clickCompletedExport() {
        await this.clickVisible(
            this.completedExport,
            "Completed Export"
        );
    }

    async clickReadyToShipPrintDocs() {
        await this.clickVisible(
            this.readyToShipPrintDocs,
            "Ready to Ship Print Docs"
        );
    }

    async clickCompletedPrintDocs() {
        await this.clickVisible(
            this.completedPrintDocs,
            "Completed Print Docs"
        );
    }
}

module.exports = ShipToCustomerDetail;
