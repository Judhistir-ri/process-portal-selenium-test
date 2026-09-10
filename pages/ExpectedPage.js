const { By, until } = require("selenium-webdriver");

class ExpectedPage {
    constructor(driver) {
        this.driver = driver;

        // Expected page URL
        this.expectedUrl =
            "https://wcsstestclient.azurewebsites.net/p/expected";

        // Main process table
        this.processTable = By.css(
            "table.process-table"
        );

        // Order ID cells
        this.orderIdCells = By.css(
            "table.process-table tbody tr td[data-toggle='tab']"
        );

        // Save & Process button
        this.saveAndProcessButton = By.xpath(
            "//button[contains(normalize-space(), 'Save & Process')]"
        );

        // WCS loading spinner
        this.loadingSpinner = By.css(
            ".loading-spiner-holder.theme-loading-spiner-holder"
        );

        // Processing tracker
        this.processingTracker = By.css(
            "ul.trackerWrapper-exp"
        );

        // Visible processing step names
        this.processingStepNames = By.xpath(
            "//ul[contains(@class,'trackerWrapper-exp')]" +
            "//li[contains(@id,'docStop')]" +
            "//div[contains(@class,'stopNames') " +
            "and not(contains(@class,'ng-hide'))]"
        );
    }

    // ==========================================
    // OPEN EXPECTED PAGE
    // ==========================================

    async open() {
        await this.driver.get(this.expectedUrl);
        await this.waitForPage();
    }

    // ==========================================
    // WAIT FOR WCS LOADING TO FINISH
    // ==========================================

    async waitForLoadingToFinish() {
        await this.driver.wait(
            async () => {
                try {
                    const spinners =
                        await this.driver.findElements(
                            this.loadingSpinner
                        );

                    if (spinners.length === 0) {
                        return true;
                    }

                    for (const spinner of spinners) {
                        try {
                            if (await spinner.isDisplayed()) {
                                return false;
                            }
                        } catch (error) {
                            continue;
                        }
                    }

                    return true;
                } catch (error) {
                    return false;
                }
            },
            120000
        );
    }

    // ==========================================
    // WAIT FOR EXPECTED PAGE
    // ==========================================

    async waitForPage() {
        await this.driver.wait(
            until.urlContains("/p/expected"),
            120000
        );

        await this.driver.wait(
            until.elementLocated(this.processTable),
            120000
        );

        await this.waitForLoadingToFinish();

        // Wait until an actual numeric Order ID is available
        await this.driver.wait(
            async () => {
                try {
                    const cells =
                        await this.driver.findElements(
                            this.orderIdCells
                        );

                    for (const cell of cells) {
                        try {
                            const text =
                                (await cell.getText()).trim();

                            if (/^\d+$/.test(text)) {
                                return true;
                            }
                        } catch (error) {
                            continue;
                        }
                    }

                    return false;
                } catch (error) {
                    return false;
                }
            },
            120000
        );

        await this.driver.sleep(2000);
    }

    // ==========================================
    // GET TOP ORDER ID
    // ==========================================

    async getTopOrderId() {
        await this.waitForPage();

        const cells =
            await this.driver.findElements(
                this.orderIdCells
            );

        for (const cell of cells) {
            try {
                const text =
                    (await cell.getText()).trim();

                if (/^\d+$/.test(text)) {
                    return text;
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error(
            "Expected page loaded, but no numeric Order ID was found."
        );
    }

    // ==========================================
    // CLICK ORDER ID
    // ==========================================

    async clickOrderId(orderId) {
        const orderIdLocator = By.xpath(
            `//table[contains(@class,'process-table')]` +
            `//tbody//tr//td[@data-toggle='tab' and normalize-space()='${orderId}']`
        );

        await this.waitForLoadingToFinish();

        const orderIdElement =
            await this.driver.wait(
                until.elementLocated(orderIdLocator),
                120000
            );

        await this.driver.wait(
            until.elementIsVisible(orderIdElement),
            30000
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            orderIdElement
        );

        await this.waitForLoadingToFinish();

        await this.driver.sleep(1000);

        try {
            await orderIdElement.click();
        } catch (error) {
            await this.driver.sleep(2000);

            const freshElement =
                await this.driver.wait(
                    until.elementLocated(orderIdLocator),
                    60000
                );

            await this.driver.wait(
                until.elementIsVisible(freshElement),
                30000
            );

            await this.driver.executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                freshElement
            );

            await this.waitForLoadingToFinish();

            await this.driver.sleep(1000);

            try {
                await freshElement.click();
            } catch (secondError) {
                await this.driver.executeScript(
                    "arguments[0].click();",
                    freshElement
                );
            }
        }

        await this.driver.sleep(3000);
    }

    // ==========================================
    // WAIT FOR ORDER DETAILS
    // ==========================================

    async waitForOrderDetails() {
        await this.driver.wait(
            until.elementLocated(
                this.saveAndProcessButton
            ),
            120000
        );

        await this.driver.wait(
            until.elementIsVisible(
                await this.driver.findElement(
                    this.saveAndProcessButton
                )
            ),
            30000
        );

        await this.waitForLoadingToFinish();

        await this.driver.sleep(2000);
    }

    // ==========================================
    // GET DOC ID
    // ==========================================

    async getDocId() {
        await this.waitForOrderDetails();

        return await this.driver.wait(
            async () => {
                try {
                    const pageText =
                        String(
                            await this.driver.executeScript(
                                "return document.body.innerText || '';"
                            )
                        ).replace(/\s+/g, " ");

                    const match =
                        pageText.match(
                            /Doc\s*#\s*:\s*(\d+)/i
                        );

                    if (match) {
                        return match[1];
                    }

                    return false;
                } catch (error) {
                    return false;
                }
            },
            120000
        );
    }

    // ==========================================
    // VERIFY ORDER DETAILS
    //
    // Only:
    // Order ID
    // Doc ID
    // Country
    // ==========================================

    async verifyOrderDetails({
        orderId,
        docId,
        country
    }) {
        await this.waitForOrderDetails();

        await this.driver.wait(
            async () => {
                try {
                    const pageText =
                        String(
                            await this.driver.executeScript(
                                "return document.body.innerText || '';"
                            )
                        ).replace(/\s+/g, " ");

                    const text =
                        pageText.toLowerCase();

                    return (
                        text.includes(
                            String(orderId).toLowerCase()
                        ) &&
                        text.includes(
                            String(docId).toLowerCase()
                        ) &&
                        text.includes(
                            String(country).toLowerCase()
                        )
                    );
                } catch (error) {
                    return false;
                }
            },
            120000
        );

        return true;
    }

    // ==========================================
    // GET PROCESSING STEPS FROM EXPECTED TRACKER
    //
    // IMPORTANT:
    // Steps are read from the actual Expected page.
    // Nothing is hard-coded.
    // ==========================================

    async getProcessingStepsFromOrder() {
        await this.waitForOrderDetails();

        // Wait until tracker is displayed
        await this.driver.wait(
            until.elementLocated(
                this.processingTracker
            ),
            120000
        );

        // Wait until at least one visible step exists
        await this.driver.wait(
            async () => {
                try {
                    const elements =
                        await this.driver.findElements(
                            this.processingStepNames
                        );

                    for (const element of elements) {
                        try {
                            if (
                                await element.isDisplayed()
                            ) {
                                const text =
                                    (
                                        await element.getText()
                                    )
                                        .replace(/\s+/g, " ")
                                        .trim();

                                if (text) {
                                    return true;
                                }
                            }
                        } catch (error) {
                            continue;
                        }
                    }

                    return false;
                } catch (error) {
                    return false;
                }
            },
            120000
        );

        const elements =
            await this.driver.findElements(
                this.processingStepNames
            );

        const steps = [];

        for (const element of elements) {
            try {
                if (!(await element.isDisplayed())) {
                    continue;
                }

                const text =
                    (await element.getText())
                        .replace(/\s+/g, " ")
                        .trim();

                if (!text) {
                    continue;
                }

                if (!steps.includes(text)) {
                    steps.push(text);
                }
            } catch (error) {
                continue;
            }
        }

        if (steps.length === 0) {
            throw new Error(
                "No processing steps were found in the Expected page tracker."
            );
        }

        return steps;
    }

    // ==========================================
    // GET PROCESSING STEP COUNT
    // ==========================================

    async getProcessingStepCount() {
        const steps =
            await this.getProcessingStepsFromOrder();

        return steps.length;
    }

    // ==========================================
    // CLICK SAVE & PROCESS
    // ==========================================

    async clickSaveAndProcess() {
        const button =
            await this.driver.wait(
                until.elementLocated(
                    this.saveAndProcessButton
                ),
                120000
            );

        await this.driver.wait(
            until.elementIsVisible(button),
            30000
        );

        await this.driver.wait(
            until.elementIsEnabled(button),
            30000
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            button
        );

        await this.waitForLoadingToFinish();

        await this.driver.sleep(1000);

        try {
            await button.click();
        } catch (error) {
            const freshButton =
                await this.driver.wait(
                    until.elementLocated(
                        this.saveAndProcessButton
                    ),
                    60000
                );

            await this.driver.wait(
                until.elementIsVisible(freshButton),
                30000
            );

            await this.driver.wait(
                until.elementIsEnabled(freshButton),
                30000
            );

            await this.driver.executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                freshButton
            );

            await this.driver.sleep(1000);

            try {
                await freshButton.click();
            } catch (secondError) {
                await this.driver.executeScript(
                    "arguments[0].click();",
                    freshButton
                );
            }
        }

        // Wait for Angular/backend to move document
        await this.driver.sleep(10000);

        await this.waitForLoadingToFinish();
    }
}

module.exports = ExpectedPage;