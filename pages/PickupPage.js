const { By, until } = require("selenium-webdriver");

class PickupPage {
    constructor(driver) {
        this.driver = driver;

        this.filterAnything = By.css(
            "input[placeholder='Filter Anything']"
        );

        this.loadingSpinner = By.css(
            ".loading-spiner-holder.theme-loading-spiner-holder"
        );
    }

    // async open() {
    //     const pickupLink =
    //         await this.driver.wait(
    //             until.elementLocated(
    //                 By.xpath(
    //                     "//a[contains(@href,'pickup') or " +
    //                     ".//*[contains(normalize-space(),'Pick up') or " +
    //                     "contains(normalize-space(),'Pickup')]]"
    //                 )
    //             ),
    //             60000
    //         );

    //     await this.driver.executeScript(
    //         "arguments[0].scrollIntoView({block:'center'});",
    //         pickupLink
    //     );

    //     await this.driver.sleep(1000);

    //     await pickupLink.click();

    //     await this.driver.wait(
    //         until.urlContains("pickup"),
    //         60000
    //     );

    //     await this.waitForPage();
    // }

    async open() {

    const pickupLink =
        await this.driver.wait(
            until.elementLocated(
                By.xpath(
                    "//a[contains(@href,'pickup') and " +
                    "(contains(normalize-space(.),'Pick up') or " +
                    "contains(normalize-space(.),'Pickup'))]"
                )
            ),
            60000
        );

    await this.driver.wait(
        until.elementIsVisible(pickupLink),
        30000
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        pickupLink
    );

    await this.driver.sleep(1000);

    try {
        await this.driver.wait(
            until.elementIsEnabled(pickupLink),
            15000
        );

        await pickupLink.click();

    } catch (error) {

        await this.driver.executeScript(
            "arguments[0].click();",
            pickupLink
        );
    }

    await this.driver.wait(
        until.urlContains("pickup"),
        60000
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

    async waitForPage() {
        await this.driver.wait(
            until.urlContains("pickup"),
            60000
        );

        await this.waitForLoadingToFinish();

        const searchBox =
            await this.driver.wait(
                until.elementLocated(
                    this.filterAnything
                ),
                60000
            );

        await this.driver.wait(
            until.elementIsVisible(searchBox),
            30000
        );

        await this.waitForLoadingToFinish();

        await this.driver.sleep(3000);
    }

    getOrderRows(orderId) {
        return By.xpath(
            `//table//tbody//tr[` +
            `.//td[contains(@class,'orderIdCol') and @title='${orderId}'] or ` +
            `.//td[normalize-space()='${orderId}']]`
        );
    }

    async searchOrder(orderId) {
        await this.waitForLoadingToFinish();

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

        await this.driver.sleep(1000);

        await this.waitForLoadingToFinish();

        await this.waitForOrder(orderId);
    }

    async waitForOrder(orderId) {
        await this.driver.wait(
            async () => {
                try {
                    const rows =
                        await this.driver.findElements(
                            this.getOrderRows(orderId)
                        );

                    for (const row of rows) {
                        if (await row.isDisplayed()) {
                            return true;
                        }
                    }

                    return false;
                } catch (error) {
                    return false;
                }
            },
            60000
        );
    }

    async getQueueRow(orderId) {
        const rows =
            await this.driver.findElements(
                this.getOrderRows(orderId)
            );

        for (const row of rows) {
            if (!(await row.isDisplayed())) {
                continue;
            }

            const text =
                (await row.getText()).trim();

            if (!/completed/i.test(text)) {
                return row;
            }
        }

        if (rows.length) {
            return rows[0];
        }

        throw new Error(
            `Order ID ${orderId} was not found on Pickup page.`
        );
    }

    async verifyOrderId(orderId) {
        const row =
            await this.getQueueRow(orderId);

        const text =
            (await row.getText()).trim();

        if (!text.includes(String(orderId))) {
            throw new Error(
                `Order ID ${orderId} was not found in Pickup Queue.`
            );
        }

        return true;
    }

    async verifyStop(orderId) {
        const row =
            await this.getQueueRow(orderId);

        const cells =
            await row.findElements(
                By.css("td")
            );

        if (!cells.length) {
            throw new Error(
                `No cells found for Order ID ${orderId}.`
            );
        }

        const stop =
            (await cells[cells.length - 1].getText())
                .trim();

        if (!stop) {
            throw new Error(
                `Stop is empty for Order ID ${orderId}.`
            );
        }

        return stop;
    }

    async selectOrder(orderId) {
        const row =
            await this.getQueueRow(orderId);

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

    async saveChangeDate() {
        await this.driver.wait(
            until.elementLocated(
                By.xpath(
                    "//*[contains(normalize-space(),'Change Date')]"
                )
            ),
            30000
        );

        const saveButton =
            await this.driver.wait(
                until.elementLocated(
                    By.xpath(
                        "//button[normalize-space()='Save' or contains(normalize-space(),'Save')]"
                    )
                ),
                30000
            );

        await this.driver.wait(
            until.elementIsVisible(saveButton),
            15000
        );

        await this.driver.wait(
            until.elementIsEnabled(saveButton),
            15000
        );

        await saveButton.click();

        await this.driver.sleep(5000);

        await this.waitForLoadingToFinish();
    }

    async completeCurrentStep(orderId) {
        await this.searchOrder(orderId);

        await this.verifyOrderId(orderId);

        await this.verifyStop(orderId);

        await this.selectOrder(orderId);

        await this.clickComplete();

        await this.saveChangeDate();
    }

    async clickCompletedDocId(orderId) {
        await this.searchOrder(orderId);

        const rows =
            await this.driver.findElements(
                this.getOrderRows(orderId)
            );

        let completedRow = null;

        for (const row of rows) {
            if (!(await row.isDisplayed())) {
                continue;
            }

            const text =
                (await row.getText()).trim();

            if (/completed/i.test(text)) {
                completedRow = row;
                break;
            }
        }

        if (!completedRow) {
            throw new Error(
                `Completed row for Order ID ${orderId} was not found.`
            );
        }

        await this.driver.executeScript(
            `
            const row = arguments[0];
            const orderId = String(arguments[1]);

            const cells =
                Array.from(row.querySelectorAll("td"));

            const candidates =
                cells.filter(td => {
                    const text =
                        (td.innerText || "").trim();

                    return /^\\d+$/.test(text) &&
                           text !== orderId;
                });

            if (!candidates.length) {
                throw new Error(
                    "Completed Doc ID cell was not found."
                );
            }

            const cell = candidates[0];

            const clickable =
                cell.querySelector("a, button") || cell;

            clickable.click();
            `,
            completedRow,
            String(orderId)
        );

        await this.driver.sleep(3000);

        await this.driver.wait(
            until.elementLocated(
                By.xpath(
                    "//*[contains(normalize-space(),'Completed') or " +
                    "contains(normalize-space(),'Process')]"
                )
            ),
            30000
        );

        await this.driver.sleep(2000);
    }

    // async clickCompletedDocId(orderId) {

    // await this.searchOrder(orderId);

    // const completedRow =
    //     await this.driver.wait(
    //         async () => {

    //             const rows =
    //                 await this.driver.findElements(
    //                     this.getOrderRows(orderId)
    //                 );

    //             for (const row of rows) {

    //                 if (!(await row.isDisplayed())) {
    //                     continue;
    //                 }

    //                 const orderCell =
    //                     await row.findElements(
    //                         By.xpath(
    //                             ".//td[" +
    //                             `@title='${orderId}' or ` +
    //                             `normalize-space()='${orderId}'` +
    //                             "]"
    //                         )
    //                     );

    //                 if (orderCell.length > 0) {
    //                     return row;
    //                 }
    //             }

    //             return false;
    //         },
    //         60000
    //     );

    // // ==========================================
    // // FIND COMPLETED DOC ID
    // // ==========================================

    // const docIdCell =
    //     await this.driver.wait(
    //         async () => {

    //             const cells =
    //                 await completedRow.findElements(
    //                     By.css("td.docIdColPickup")
    //                 );

    //             for (const cell of cells) {

    //                 if (await cell.isDisplayed()) {
    //                     return cell;
    //                 }
    //             }

    //             return false;
    //         },
    //         30000
    //     );

    // await this.driver.executeScript(
    //     "arguments[0].scrollIntoView({block:'center'});",
    //     docIdCell
    // );

    // await this.driver.sleep(1000);

    // // ==========================================
    // // CLICK DOC ID
    // // ==========================================

    // const docLink =
    //     await docIdCell.findElements(
    //         By.css("a")
    //     );

    // if (docLink.length > 0) {

    //     try {
    //         await docLink[0].click();
    //     } catch (error) {
    //         await this.driver.executeScript(
    //             "arguments[0].click();",
    //             docLink[0]
    //         );
    //     }

    // } else {

    //     await this.driver.executeScript(
    //         "arguments[0].click();",
    //         docIdCell
    //     );
    // }

    // await this.driver.sleep(3000);

    // await this.driver.wait(
    //     until.elementLocated(
    //         By.xpath(
    //             "//*[contains(normalize-space(),'Completed') or " +
    //             "contains(normalize-space(),'Process')]"
    //         )
    //     ),
    //     30000
    // );

    // await this.driver.sleep(2000);
    // }
    

    async verifyCompletedStep(step) {
        const aliases = {
            SOS: [
                "SOS",
                "Secretary of State"
            ],

            DOS: [
                "DOS",
                "U.S Department of State",
                "U.S. Department of State",
                "Department of State"
            ],

            "DC EMB": [
                "DC EMB",
                "Embassy"
            ]
        };

        const names =
            aliases[step] || [step];

        const result =
            await this.driver.executeScript(
                `
                const names =
                    arguments[0].map(
                        value => value.toLowerCase()
                    );

                function isGreen(element) {
                    let node = element;

                    for (
                        let i = 0;
                        i < 4 && node;
                        i++,
                        node = node.parentElement
                    ) {
                        const style =
                            window.getComputedStyle(node);

                        const color =
                            style.color || "";

                        const cls =
                            String(
                                node.className || ""
                            ).toLowerCase();

                        if (
                            cls.includes("green") ||
                            cls.includes("success") ||
                            cls.includes("complete") ||
                            /rgb\\(0,\\s*1\\d{2},\\s*0\\)/.test(color)
                        ) {
                            return true;
                        }
                    }

                    return false;
                }

                const elements =
                    Array.from(
                        document.querySelectorAll("body *")
                    );

                for (const element of elements) {
                    const text =
                        (element.innerText || "")
                            .trim()
                            .toLowerCase();

                    if (!text || text.length > 120) {
                        continue;
                    }

                    if (
                        names.some(
                            name =>
                                text === name ||
                                text.includes(name)
                        )
                    ) {
                        if (isGreen(element)) {
                            return true;
                        }
                    }
                }

                return false;
                `,
                names
            );

        if (!result) {
            throw new Error(
                `Completed processing step "${step}" was not verified as green.`
            );
        }

        const closeButton =
    By.xpath(
        "//div[contains(@class,'modal-dialog')]" +
        "//div[contains(@class,'modal-header')]" +
        "//i[contains(@class,'fa-times')]"
    );

const closeButtons =
    await this.driver.findElements(closeButton);

for (const button of closeButtons) {
    try {
        if (await button.isDisplayed()) {
            await this.driver.executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                button
            );

            await this.driver.sleep(500);

            await button.click();

            await this.driver.sleep(1000);

            break;
        }
    } catch (error) {}
}


        await this.driver.sleep(2000);
        await this.waitForLoadingToFinish();

        return true;
    }
}

module.exports = PickupPage;