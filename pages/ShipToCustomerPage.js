const { By, until } = require("selenium-webdriver");

class ShipToCustomerPage {
    constructor(driver) {
        this.driver = driver;

        this.shipToCustomerUrl =
            "https://wcsstestclient.azurewebsites.net/p/shiptocustomer";

        this.filterAnything = By.css(
            "input[placeholder='Filter Anything']"
        );

        this.loadingSpinner = By.css(
            ".loading-spiner-holder.theme-loading-spiner-holder"
        );

        this.readyToShipTable = By.xpath(
            "//div[contains(@class,'shipToCustomer-docs')]//table"
        );
    }

    async open() {
        await this.driver.get(
            this.shipToCustomerUrl
        );

        await this.waitForPage();
    }

    async waitForLoadingToFinish() {
        await this.driver.wait(
            async () => {
                try {
                    const elements =
                        await this.driver.findElements(
                            this.loadingSpinner
                        );

                    for (const element of elements) {
                        try {
                            if (await element.isDisplayed()) {
                                return false;
                            }
                        } catch (error) {}
                    }

                    return true;
                } catch (error) {
                    return false;
                }
            },
            120000
        );
    }

    // async waitForPage() {
    //     await this.driver.wait(
    //         until.urlContains(
    //             "/p/shiptocustomer"
    //         ),
    //         60000
    //     );

    //     await this.waitForLoadingToFinish();

    //     const searchBox =
    //         await this.driver.wait(
    //             until.elementLocated(
    //                 this.filterAnything
    //             ),
    //             60000
    //         );

    //     await this.driver.wait(
    //         until.elementIsVisible(searchBox),
    //         30000
    //     );

    //     await this.driver.wait(
    //         until.elementLocated(
    //             this.readyToShipTable
    //         ),
    //         60000
    //     );

    //     await this.waitForLoadingToFinish();

    //     await this.driver.sleep(3000);
    // }

    async waitForPage() {
    await this.driver.wait(
        until.urlContains("/p/shiptocustomer"),
        60000
    );

    await this.waitForLoadingToFinish();

    const searchBox =
        await this.driver.wait(
            until.elementLocated(this.filterAnything),
            60000
        );

    await this.driver.wait(
        until.elementIsVisible(searchBox),
        30000
    );

    await this.driver.wait(
        until.elementLocated(this.readyToShipTable),
        60000
    );

    // Wait until Ready To Ship table is fully populated
    await this.waitForReadyToShipData();

    await this.driver.sleep(3000);
    }
    

    getOrderRow(orderId) {
        return By.xpath(
            `//div[contains(@class,'shipToCustomer-docs')]` +
            `//table//tbody//tr[` +
            `.//td[contains(@class,'orderIdCol') and @title='${orderId}'] or ` +
            `.//td[normalize-space()='${orderId}']]`
        );
    }

    async searchOrder(orderId) {
        // await this.waitForLoadingToFinish();
        await this.waitForReadyToShipData();

        const searchBox =
            await this.driver.wait(
                until.elementLocated(
                    this.filterAnything
                ),
                30000
            );

        await this.driver.wait(
            until.elementIsVisible(searchBox),
            15000
        );

        await searchBox.clear();

        await searchBox.sendKeys(
            String(orderId)
        );

        await this.driver.sleep(1500);

        await this.waitForLoadingToFinish();

        await this.driver.wait(
            until.elementLocated(
                this.getOrderRow(orderId)
            ),
            60000
        );
    }

    async waitForReadyToShipData() {
    await this.waitForLoadingToFinish();

    await this.driver.wait(
        async () => {
            try {
                const rows =
                    await this.driver.findElements(
                        By.xpath(
                            "//div[contains(@class,'shipToCustomer-docs')]" +
                            "//table//tbody//tr"
                        )
                    );

                for (const row of rows) {
                    if (!(await row.isDisplayed())) {
                        continue;
                    }

                    const orderCells =
                        await row.findElements(
                            By.xpath(
                                ".//td[contains(@class,'orderIdCol')][@title] | " +
                                ".//td[contains(@class,'orderIdCol')]"
                            )
                        );

                    for (const cell of orderCells) {
                        const text =
                            (await cell.getText()).trim();

                        const title =
                            await cell.getAttribute("title");

                        if (
                            /^\d+$/.test(text) ||
                            /^\d+$/.test(title || "")
                        ) {
                            return true;
                        }
                    }
                }

                return false;
            } catch (error) {
                return false;
            }
        },
        120000
    );

    await this.waitForLoadingToFinish();

    await this.driver.sleep(3000);
    }
    

    async verifyReadyToShip(orderId) {
        const row =
            await this.driver.wait(
                until.elementLocated(
                    this.getOrderRow(orderId)
                ),
                60000
            );

        await this.driver.wait(
            until.elementIsVisible(row),
            30000
        );

        const text =
            (await row.getText()).trim();

        if (!text.includes(String(orderId))) {
            throw new Error(
                `Order ID ${orderId} was not found in Ready to Ship.`
            );
        }

        return true;
    }

    async selectOrder(orderId) {
        const row =
            await this.driver.wait(
                until.elementLocated(
                    this.getOrderRow(orderId)
                ),
                60000
            );

        const checkbox =
            await row.findElement(
                By.css("input[type='checkbox']")
            );

        if (!(await checkbox.isSelected())) {
            await checkbox.click();
        }

        await this.driver.sleep(1500);
        await this.waitForLoadingToFinish();
    }

    async clickComplete() {
        const button =
            await this.driver.wait(
                until.elementLocated(
                    By.xpath(
                        "//div[contains(@class,'shipToCustomer-docs')]" +
                        "//button[contains(normalize-space(),'Complete')]"
                    )
                ),
                30000
            );

        await this.driver.wait(
            until.elementIsVisible(button),
            15000
        );

        await this.driver.wait(
            until.elementIsEnabled(button),
            15000
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            button
        );

        await this.driver.sleep(1000);

        await button.click();

        await this.driver.sleep(3000);
    }

    // async waitForShippingLabelPopup() {
    //     await this.driver.wait(
    //         until.elementLocated(
    //             By.xpath(
    //                 "//*[contains(normalize-space(),'Generate Shipping Label')]"
    //             )
    //         ),
    //         30000
    //     );

    //     await this.driver.sleep(2000);
    // }

  
    

    // async fillOutgoingTrackingAndCourier(orderId) {
    //     await this.waitForShippingLabelPopup();

    //     const row =
    //         await this.driver.wait(
    //             until.elementLocated(
    //                 By.xpath(
    //                     "//form//tr[.//label[normalize-space()='Outgoing']]"
    //                 )
    //             ),
    //             30000
    //         );

    //     const input =
    //         await row.findElement(
    //             By.css(
    //                 "input[type='text'], input[type='number']"
    //             )
    //         );

    //     await input.clear();

    //     await input.sendKeys(
    //         `OUT${orderId}${String(Date.now()).slice(-6)}`
    //     );

    //     const select =
    //         await row.findElement(
    //             By.css("select")
    //         );

    //     const options =
    //         await select.findElements(
    //             By.css("option")
    //         );

    //     if (options.length > 1) {
    //         await options[1].click();
    //     }

    //     await this.driver.sleep(1000);
    // }

   async waitForShippingLabelPopup() {
    const popup =
        By.xpath(
            "//div[contains(@class,'modal-dialog') and " +
            ".//h3[contains(@class,'modal-title') and " +
            "translate(normalize-space(.), " +
            "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', " +
            "'abcdefghijklmnopqrstuvwxyz') = " +
            "'generate shipping label']]"
        );

    await this.driver.wait(
        until.elementLocated(popup),
        60000
    );

    await this.driver.wait(
        async () => {
            try {
                const element =
                    await this.driver.findElement(popup);

                return await element.isDisplayed();
            } catch (error) {
                return false;
            }
        },
        30000
    );

    // IMPORTANT:
    // Wait for the loading spinner that appears after
    // the Generate Shipping Label popup opens.
    await this.waitForLoadingToFinish();

    await this.driver.sleep(2000);
}
    

    async fillOutgoingTrackingAndCourier(orderId) {
    await this.waitForShippingLabelPopup();

    const popup = By.xpath(
        "//div[contains(@class,'modal-dialog') and " +
        ".//h3[contains(@class,'modal-title') and " +
        "normalize-space()='Generate Shipping Label']]"
    );

    const trackingInput = await this.driver.wait(
        until.elementLocated(
            By.xpath(
                "//div[contains(@class,'modal-dialog') and " +
                ".//h3[contains(@class,'modal-title') and " +
                "normalize-space()='Generate Shipping Label']]" +
                "//input[@id='trackCardNumber' and " +
                "contains(@ng-model,'outSideGeneratedLabel.trackCardNumber')]"
            )
        ),
        30000
    );

    await this.driver.wait(
        until.elementIsVisible(trackingInput),
        15000
    );

    const trackingId =
        `OUT${orderId}${String(Date.now()).slice(-6)}`;

    await trackingInput.clear();
    await trackingInput.sendKeys(trackingId);

    const courierSelect = await this.driver.wait(
        until.elementLocated(
            By.xpath(
                "//div[contains(@class,'modal-dialog') and " +
                ".//h3[contains(@class,'modal-title') and " +
                "normalize-space()='Generate Shipping Label']]" +
                "//select[contains(@ng-model,'outSideGeneratedLabel.courier')]"
            )
        ),
        30000
    );

    await this.driver.executeScript(
        `
        const select = arguments[0];
        const options = Array.from(select.options)
            .filter(option => option.value !== "?" && option.value !== "");

        if (options.length === 0) {
            throw new Error("No courier options available.");
        }

        const option =
            options[Math.floor(Math.random() * options.length)];

        select.value = option.value;

        select.dispatchEvent(
            new Event('input', { bubbles: true })
        );

        select.dispatchEvent(
            new Event('change', { bubbles: true })
        );

        return {
            value: option.value,
            text: option.textContent.trim()
        };
        `,
        courierSelect
    );

    await this.driver.sleep(1000);

    const enteredTracking =
        await trackingInput.getAttribute("value");

    const selectedCourier =
        await courierSelect.findElement(
            By.css("option:checked")
        );

    const courierText =
        (await selectedCourier.getText()).trim();

    if (enteredTracking !== trackingId) {
        throw new Error(
            `Outgoing Tracking ID verification failed. Expected: ${trackingId}, Actual: ${enteredTracking}`
        );
    }

    if (!courierText) {
        throw new Error(
            "Outgoing Courier verification failed. No courier was selected."
        );
    }

    console.log(
        `Outgoing Tracking ID: ${enteredTracking}`
    );

    console.log(
        `Outgoing Courier: ${courierText}`
    );
    }
    

    // async saveAndComplete() {
    //     const button =
    //         await this.driver.wait(
    //             until.elementLocated(
    //                 By.xpath(
    //                     "//button[contains(normalize-space(),'Save & Complete')]"
    //                 )
    //             ),
    //             30000
    //         );

    //     await this.driver.wait(
    //         until.elementIsVisible(button),
    //         15000
    //     );

    //     await this.driver.wait(
    //         until.elementIsEnabled(button),
    //         30000
    //     );

    //     await this.driver.executeScript(
    //         "arguments[0].scrollIntoView({block:'center'});",
    //         button
    //     );

    //     await this.driver.sleep(1000);

    //     await button.click();

    //     await this.driver.sleep(10000);

    //     await this.waitForLoadingToFinish();
    // }
    async saveAndComplete() {
    // Make sure any loading operation is finished
    await this.waitForLoadingToFinish();

    const button =
        await this.driver.wait(
            until.elementLocated(
                By.xpath(
                    "//button[contains(normalize-space(),'Save & Complete')]"
                )
            ),
            30000
        );

    await this.driver.wait(
        until.elementIsVisible(button),
        15000
    );

    await this.driver.wait(
        until.elementIsEnabled(button),
        30000
    );

    // Make sure spinner is not covering the button
    await this.waitForLoadingToFinish();

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        button
    );

    await this.driver.sleep(1000);

    // One final check before clicking
    await this.waitForLoadingToFinish();

    await button.click();

    await this.driver.sleep(10000);

    await this.waitForLoadingToFinish();
    }
    

    async completeShipping(orderId) {
        await this.searchOrder(orderId);

        await this.verifyReadyToShip(orderId);

        await this.selectOrder(orderId);

        await this.clickComplete();

        await this.fillOutgoingTrackingAndCourier(
            orderId
        );

        await this.saveAndComplete();
    }

    async refreshAndWaitForCompleted() {
    const refreshButton = By.xpath(
        "//button[@ng-click='refresh()' and " +
        ".//i[contains(@class,'fa-refresh')]]"
    );

    const button = await this.driver.wait(
        until.elementLocated(refreshButton),
        30000
    );

    await this.driver.wait(
        until.elementIsVisible(button),
        15000
    );

    await this.driver.wait(
        until.elementIsEnabled(button),
        15000
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        button
    );

    await button.click();

    // Wait exactly 5 seconds after Refresh
    await this.driver.sleep(5000);
    }
    

    // async verifyCompleted(orderId) {
    //     await this.searchOrder(orderId);

    //     const rows =
    //         await this.driver.findElements(
    //             this.getOrderRow(orderId)
    //         );

    //     for (const row of rows) {
    //         if (!(await row.isDisplayed())) {
    //             continue;
    //         }

    //         const text =
    //             (await row.getText()).trim();

    //         if (/completed/i.test(text)) {
    //             return true;
    //         }
    //     }

    //     throw new Error(
    //         `Order ID ${orderId} was not found in Ship to Customer Completed.`
    //     );
    // }

  async verifyCompleted(orderId) {
    // Refresh the Ship to Customer page first
    await this.refreshAndWaitForCompleted();

    const completedOrderRow = By.xpath(
        `//div[contains(@class,'shipToCustomer-docs')]` +
        `//table//tbody//tr[` +
        `.//td[contains(@class,'orderIdCol') and @title='${orderId}']` +
        ` and .//td[contains(@class,'docIdColPickup')]` +
        `]`
    );

    const row = await this.driver.wait(
        until.elementLocated(completedOrderRow),
        60000
    );

    await this.driver.wait(
        until.elementIsVisible(row),
        30000
    );

    const text = (await row.getText()).trim();

    if (!text.includes(String(orderId))) {
        throw new Error(
            `Order ID ${orderId} was not found in Ship to Customer Completed.`
        );
    }

    return true;
}
    
}

module.exports = ShipToCustomerPage;