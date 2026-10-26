
const { By, until, Select } = require("selenium-webdriver");

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

         this._documentFilterDropdown = By.css(
    "select[ng-model='searchOptions.quick1Filter']"
);

this._categoryFilterDropdown = By.css(
    "select[ng-model='searchOptions.quick2Filter']"
        );
        
        this.readyToShipHeading = By.xpath(
    "//a[normalize-space()='Ready to ship'] | //*[self::h3 or self::h4][normalize-space()='Ready to ship']"
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
    // async waitForLoadingToFinish(timeout = 60000) {
    //     await this.driver.wait(async () => {
    //         return await this.driver.executeScript(() => {
    //             const selectors = [
    //                 ".loading-spiner-holder",
    //                 ".loading",
    //                 ".loader",
    //                 ".spinner",
    //                 ".loading-spinner",
    //                 ".preloader"
    //             ];

    //             return selectors.every(selector => {
    //                 return Array.from(
    //                     document.querySelectorAll(selector)
    //                 ).every(element => {
    //                     const style = window.getComputedStyle(element);

    //                     return (
    //                         style.display === "none" ||
    //                         style.visibility === "hidden" ||
    //                         style.opacity === "0" ||
    //                         element.offsetWidth === 0 ||
    //                         element.offsetHeight === 0
    //                     );
    //                 });
    //             });
    //         });
    //     }, timeout, "Loading spinner did not disappear.");
    // }
    async waitForLoadingToFinish(timeout = 60000) {
    console.log("Waiting for Ship to Customer data to finish loading...");

    await this.driver.wait(async () => {
        try {
            return await this.driver.executeScript(() => {
                // Check the browser's initial document load.
                if (document.readyState !== "complete") {
                    return false;
                }

                // The screenshot shows these panels on the page.
                const readyPanel = document.querySelector(
                    "div.shipToCustomers-docs, div.shipToCustomer-docs"
                );

                const completedPanel = document.querySelector(
                    "div.completed-docs"
                );

                if (!readyPanel || !completedPanel) {
                    return false;
                }

                // Do not continue while a visible spinner is present.
                const spinnerSelectors = [
                    ".fa-spinner",
                    ".glyphicon-refresh",
                    ".loading-spiner-holder",
                    ".loading-spinner",
                    ".spinner",
                    ".loader",
                    ".preloader"
                ];

                const visibleSpinner = Array.from(
                    document.querySelectorAll(spinnerSelectors.join(","))
                ).some(element => {
                    const style = window.getComputedStyle(element);

                    return (
                        style.display !== "none" &&
                        style.visibility !== "hidden" &&
                        Number(style.opacity) !== 0 &&
                        element.getClientRects().length > 0
                    );
                });

                if (visibleSpinner) {
                    return false;
                }

                // Both panels must have rendered their table or empty state.
                const panelReady = panel => {
                    const text = (panel.innerText || "").trim();

                    return (
                        /no documents found/i.test(text) ||
                        panel.querySelector("table tbody") !== null
                    );
                };

                return panelReady(readyPanel) &&
                       panelReady(completedPanel);
            });
        } catch (error) {
            return false;
        }
    }, timeout, "Ship to Customer data did not finish loading.");

    console.log("✓ Ship to Customer data has finished loading.");
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

    // async waitForSectionContent(locator, description, timeout = 60000) {
    //     await this.driver.wait(async () => {
    //         try {
    //             const sections = await this.driver.findElements(locator);

    //             for (const section of sections) {
    //                 if (!(await section.isDisplayed())) {
    //                     continue;
    //                 }

    //                 const result = await this.driver.executeScript(
    //                     element => {
    //                         const text = (element.innerText || "").trim();

    //                         const hasNoDocumentsMessage =
    //                             /no documents found/i.test(text);

    //                         const rows = Array.from(
    //                             element.querySelectorAll("table tr")
    //                         );

    //                         const hasDocumentRows = rows.some(row => {
    //                             const cells = Array.from(
    //                                 row.querySelectorAll("td")
    //                             );

    //                             const rowText =
    //                                 (row.innerText || "").trim();

    //                             if (
    //                                 cells.length === 0 ||
    //                                 !rowText ||
    //                                 /no documents found/i.test(rowText)
    //                             ) {
    //                                 return false;
    //                             }

    //                             return cells.some(cell =>
    //                                 /^\d+$/.test(
    //                                     (cell.innerText || "").trim()
    //                                 )
    //                             );
    //                         });

    //                         return (
    //                             hasDocumentRows ||
    //                             hasNoDocumentsMessage
    //                         );
    //                     },
    //                     section
    //                 );

    //                 if (result) {
    //                     return true;
    //                 }
    //             }

    //             return false;
    //         } catch {
    //             return false;
    //         }
    //     }, timeout, `${description}: documents did not finish rendering.`);
    // }
    
async waitForSectionContent(locator, description, timeout = 60000) {
    await this.driver.wait(
        async () => {
            try {
                const sections = await this.driver.findElements(locator);

                for (const section of sections) {
                    if (!(await section.isDisplayed())) {
                        continue;
                    }

                    const state = await this.driver.executeScript(
                        (element) => {
                            const text = (element.innerText || "").trim();

                            const hasNoDocumentsMessage =
                                /no documents found/i.test(text);

                            // The table may exist before its rows finish loading.
                            const hasTable =
                                element.querySelector("table") !== null;

                            return hasNoDocumentsMessage || hasTable;
                        },
                        section
                    );

                    if (state) {
                        return true;
                    }
                }

                return false;
            } catch (error) {
                return false;
            }
        },
        timeout,
        `${description}: table or empty-state message did not render.`
    );
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



// async selectDocumentFilter(filterName = "All Documents") {
//     const driver = this.driver;

//     if (!driver) {
//         throw new Error("WebDriver is not initialized.");
//     }

//     console.log(
//         `\n========== Document Filter: ${filterName} ==========`
//     );

//     // Wait for the Ship to Customer page and loading process.
//     await driver.wait(
//         until.urlContains("/p/shiptocustomer"),
//         30000,
//         "Ship to Customer page was not loaded."
//     );

//     await this.waitForDocumentReady(60000);
//     await this.waitForLoadingToFinish(60000);

//     // Correct locator: quick1Filter, not quickFilter.
//     const filterLocator = By.css(
//         "select[ng-model='searchOptions.quick1Filter']"
//     );

//     const dropdown = await driver.wait(
//         until.elementLocated(filterLocator),
//         30000,
//         "Show Documents For dropdown was not found."
//     );

//     await driver.wait(
//         until.elementIsVisible(dropdown),
//         15000,
//         "Show Documents For dropdown is not visible."
//     );

//     await driver.wait(
//         until.elementIsEnabled(dropdown),
//         15000,
//         "Show Documents For dropdown is not enabled."
//     );

//     await driver.executeScript(
//         "arguments[0].scrollIntoView({block: 'center'});",
//         dropdown
//     );

//     // Read and verify the available filter options.
//     const select = new Select(dropdown);
//     const options = await select.getOptions();

//     const availableFilters = [];

//     for (const option of options) {
//         availableFilters.push((await option.getText()).trim());
//     }

//     console.log("Available document filters:", availableFilters);

//     if (!availableFilters.includes(filterName)) {
//         throw new Error(
//             `Filter "${filterName}" was not found. Available filters: ` +
//             availableFilters.join(", ")
//         );
//     }

//     // Select the requested filter.
//     await select.selectByVisibleText(filterName);

//     // Verify that the requested filter is selected.
//     await driver.wait(
//         async () => {
//             try {
//                 const selected = await new Select(
//                     await driver.findElement(filterLocator)
//                 ).getFirstSelectedOption();

//                 return (await selected.getText()).trim() === filterName;
//             } catch {
//                 return false;
//             }
//         },
//         10000,
//         `Filter "${filterName}" was not selected.`
//     );

//     console.log(`✓ Selected document filter: ${filterName}`);

//     // Wait for the application to refresh its document tables.
//     await this.waitForLoadingToFinish(60000);

//     await this.waitForSectionContent(
//         this._readyToShipSection,
//         "Ready to Ship",
//         60000
//     );

//     await this.waitForSectionContent(
//         this._completedSection,
//         "Completed",
//         60000
//     );

//     console.log(`✓ Both document sections updated for: ${filterName}`);
    // }
    
    
async selectDocumentFilter(filterName) {
    const { By, until } = require("selenium-webdriver");

    const filterDropdown = By.css(
        'select[ng-model="searchOptions.quick1Filter"]'
    );

    console.log(`\n========== Document Filter: ${filterName} ==========`);

    // Wait for Angular to populate the document-filter dropdown.
    await this.driver.wait(async () => {
        const dropdowns = await this.driver.findElements(filterDropdown);

        if (dropdowns.length === 0) {
            return false;
        }

        const options = await dropdowns[0].findElements(By.css("option"));

        const labels = await Promise.all(
            options.map(async option =>
                (await option.getText()).trim()
            )
        );

        return labels.some(label => label.length > 0);
    }, 30000, "Document filter options were not populated.");

    const dropdown = await this.driver.findElement(filterDropdown);

    const options = await dropdown.findElements(By.css("option"));

    const availableFilters = await Promise.all(
        options.map(async option => ({
            label: (await option.getText()).trim(),
            value: await option.getAttribute("value")
        }))
    );

    console.log(
        "Available document filters:",
        availableFilters.map(option => option.label)
    );

    const matchingOption = availableFilters.find(
        option => option.label.toLowerCase() === filterName.toLowerCase()
    );

    if (!matchingOption) {
        throw new Error(
            `Filter "${filterName}" was not found. Available filters: ${
                availableFilters.map(option => option.label).join(", ")
            }`
        );
    }

    // Select using the actual option value, not its displayed label.
    await dropdown.sendKeys(matchingOption.label);

    console.log(`✓ Selected document filter: ${filterName}`);
    await this.waitForFilterResults(60000);

    // Wait for Angular to finish applying the filter and rendering the sections.
    await this.waitForLoadingToFinish(60000);

    await this.waitForSectionContent(
        this.readyToShipSection,
        "Ready to Ship",
        60000
    );

    await this.waitForSectionContent(
        this.completedSection,
        "Completed",
        60000
    );
}



// async getSectionTotal(sectionName) {
//     const driver = this.driver;

//     const sectionSelectors = {
//         "Ready to ship": "div.shipToCustomers-docs",
//         "Ready to Ship": "div.shipToCustomers-docs",
//         "readyToShip": "div.shipToCustomers-docs",
//         "Completed": "div.completed-docs",
//         "completed": "div.completed-docs"
//     };

//     const selector = sectionSelectors[sectionName];

//     if (!selector) {
//         throw new Error(
//             `Unknown Ship to Customer section: ${sectionName}`
//         );
//     }

//     await this.waitForLoadingToFinish(60000);

//     const section = await driver.wait(
//         until.elementLocated(By.css(selector)),
//         30000,
//         `${sectionName} panel was not found.`
//     );

//     await driver.wait(
//         until.elementIsVisible(section),
//         15000,
//         `${sectionName} panel is not visible.`
//     );

//     const total = await driver.wait(
//         async () => {
//             try {
//                 const panel = await driver.findElement(By.css(selector));

//                 return await driver.executeScript(element => {
//                     const text = element.innerText || "";
//                     const match = text.match(/Total:\s*([\d,]+)/i);

//                     if (!match) return null;

//                     const value = Number(match[1].replace(/,/g, ""));

//                     return Number.isFinite(value) ? value : null;
//                 }, panel);
//             } catch (error) {
//                 return null;
//             }
//         },
//         30000,
//         `Could not read the total for ${sectionName}.`
//     );

//     console.log(`✓ ${sectionName} total: ${total}`);

//     return total;
// }

    
// async getSectionTotal(sectionName) {
//     const { By, until } = require("selenium-webdriver");

//     const sectionSelectors = {
//         "Ready to ship": "div.shipToCustomer-docs",
//         "Ready to Ship": "div.shipToCustomer-docs",
//         "readyToShip": "div.shipToCustomer-docs",
//         "Completed": "div.completed-docs",
//         "completed": "div.completed-docs"
//     };

//     const selector = sectionSelectors[sectionName];

//     if (!selector) {
//         throw new Error(`Unknown Ship to Customer section: ${sectionName}`);
//     }

//     const panel = await this.driver.wait(
//         until.elementLocated(By.css(selector)),
//         30000,
//         `${sectionName} panel was not found.`
//     );

//     await this.driver.wait(
//         until.elementIsVisible(panel),
//         15000,
//         `${sectionName} panel is not visible.`
//     );

//     // Wait until the panel's own loading spinner disappears.
//     await this.driver.wait(async () => {
//         const spinners = await panel.findElements(
//             By.css("i.fa-spinner, .fa-spin")
//         );

//         for (const spinner of spinners) {
//             if (await spinner.isDisplayed()) {
//                 return false;
//             }
//         }

//         return true;
//     }, 60000, `${sectionName} panel is still loading.`);

//     // Read the summary Total, not the number of rendered rows.
//     const total = await this.driver.wait(async () => {
//         const text = await panel.getText();
//         const match = text.match(/\bTotal:\s*([\d,]+)/i);

//         if (!match) {
//             return null;
//         }

//         return Number(match[1].replace(/,/g, ""));
//     }, 15000, `${sectionName} summary total was not found.`);

//     console.log(`${sectionName} total: ${total}`);

//     return total;
// }


async getSectionTotal(sectionName) {
    const { By, until } = require("selenium-webdriver");

    const sectionSelectors = {
        "Ready to ship": "div.shipToCustomer-docs",
        "Ready to Ship": "div.shipToCustomer-docs",
        "readyToShip": "div.shipToCustomer-docs",
        "Completed": "div.completed-docs",
        "completed": "div.completed-docs"
    };

    const selector = sectionSelectors[sectionName];

    if (!selector) {
        throw new Error(`Unknown section: ${sectionName}`);
    }

    const panel = await this.driver.wait(
        until.elementLocated(By.css(selector)),
        30000
    );

    await this.driver.wait(until.elementIsVisible(panel), 15000);

    await this.waitForFilterResults(60000);

    const total = await this.driver.executeScript(element => {
        const rows = Array.from(element.querySelectorAll("table tbody tr"));

        return rows.filter(row => {
            const text = (row.innerText || "").trim();

            // Ignore empty-state rows and loading rows.
            if (
                !text ||
                /no documents found/i.test(text) ||
                row.querySelector(".fa-spinner, .fa-spin")
            ) {
                return false;
            }

            // A document row must have a document ID link or cell content.
            const cells = row.querySelectorAll("td");
            if (cells.length < 3) return false;

            // Exclude rows whose document checkbox is disabled.
            const checkboxes = Array.from(
                row.querySelectorAll('input[type="checkbox"]')
            );

            if (checkboxes.length > 0) {
                return checkboxes.some(checkbox =>
                    !checkbox.disabled &&
                    checkbox.getAttribute("aria-disabled") !== "true"
                );
            }

            // If no checkbox exists, don't count the row automatically.
            return false;
        }).length;
    }, panel);

    console.log(`${sectionName} enabled document count: ${total}`);

    return total;
}

    
async waitForFilterResults(timeout = 60000) {
    const { By, until } = require("selenium-webdriver");

    const sections = [
        {
            name: "Ready to Ship",
            locator: this.readyToShipSection
        },
        {
            name: "Completed",
            locator: this.completedSection
        }
    ];

    await this.driver.wait(async () => {
        try {
            for (const sectionInfo of sections) {
                const sectionElements = await this.driver.findElements(
                    sectionInfo.locator
                );

                if (sectionElements.length === 0) {
                    return false;
                }

                const section = sectionElements[0];

                if (!(await section.isDisplayed())) {
                    return false;
                }

                // Wait while this section displays its loading spinner.
                const spinners = await section.findElements(
                    By.css("i.fa-spinner, .fa-spin")
                );

                for (const spinner of spinners) {
                    if (await spinner.isDisplayed()) {
                        return false;
                    }
                }

                // The table must contain data rows or an empty-state row.
                const state = await this.driver.executeScript(element => {
                    const rows = Array.from(
                        element.querySelectorAll("table tbody tr")
                    );

                    const visibleRows = rows.filter(row => {
                        const style = window.getComputedStyle(row);

                        return style.display !== "none" &&
                            style.visibility !== "hidden" &&
                            !row.classList.contains("ng-hide");
                    });

                    const hasDocumentRows = visibleRows.some(row => {
                        const text = (row.innerText || "").trim();

                        return text.length > 0 &&
                            !/no documents found/i.test(text) &&
                            !row.querySelector(".fa-spinner, .fa-spin");
                    });

                    const hasEmptyMessage = visibleRows.some(row =>
                        /no documents found/i.test(row.innerText || "")
                    );

                    return hasDocumentRows || hasEmptyMessage;
                }, section);

                if (!state) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            return false;
        }
    }, timeout, "Filtered document results did not finish loading.");

    console.log("✓ Filtered document results finished loading.");
}

 async selectCategory(categoryName) {
    const driver = this.driver;

    console.log(
        `\n========== Ship to Customer Category: ${categoryName} ==========`
    );

    await driver.wait(
        until.urlContains("/p/shiptocustomer"),
        30000,
        "Ship to Customer page was not loaded."
    );

    await this.waitForDocumentReady(60000);
    await this.waitForLoadingToFinish(60000);

    const categoryLocator = By.css(
        "select[ng-model='searchOptions.quick2Filter']"
    );

    const dropdown = await driver.wait(
        until.elementLocated(categoryLocator),
        30000,
        "Category dropdown was not found."
    );

    await driver.wait(
        until.elementIsVisible(dropdown),
        15000,
        "Category dropdown is not visible."
    );

    // Wait until Angular has populated the dropdown options.
    await driver.wait(
        async () => {
            try {
                const currentDropdown =
                    await driver.findElement(categoryLocator);

                const options = await currentDropdown.findElements(
                    By.css("option")
                );

                const optionTexts = [];

                for (const option of options) {
                    optionTexts.push(
                        (await option.getText()).trim()
                    );
                }

                return optionTexts.includes(categoryName);
            } catch {
                return false;
            }
        },
        30000,
        `Category "${categoryName}" did not appear in the dropdown.`
    );

    // Re-fetch the dropdown after Angular has finished rendering.
    const currentDropdown = await driver.findElement(categoryLocator);
    const select = new Select(currentDropdown);
    const options = await select.getOptions();

    const availableCategories = [];

    for (const option of options) {
        availableCategories.push(
            (await option.getText()).trim()
        );
    }

    console.log("Available categories:", availableCategories);

    if (!availableCategories.includes(categoryName)) {
        throw new Error(
            `Category "${categoryName}" not found. Available categories: ` +
            availableCategories.join(", ")
        );
    }

    await select.selectByVisibleText(categoryName);

    // Verify Angular has applied the selection.
    await driver.wait(
        async () => {
            try {
                const current = new Select(
                    await driver.findElement(categoryLocator)
                );

                const selectedOption =
                    await current.getFirstSelectedOption();

                return (
                    (await selectedOption.getText()).trim() === categoryName
                );
            } catch {
                return false;
            }
        },
        10000,
        `Category "${categoryName}" was not selected.`
    );

    // Wait for the filter request and document panels to finish updating.
    await this.waitForLoadingToFinish(60000);

    await this.waitForSectionContent(
        this.readyToShipSection,
        "Ready to Ship",
        60000
    );

    await this.waitForSectionContent(
        this.completedSection,
        "Completed",
        60000
    );

    console.log(`✓ Category selected and results loaded: ${categoryName}`);
    }
    
    async waitForReadyToShipSection() {
    const { By, until } = require("selenium-webdriver");

    const readyToShipHeading = By.xpath(
        "//*[self::a or self::h3 or self::h4 or self::strong or self::u]" +
        "[normalize-space(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))='ready to ship']"
    );

    await this.driver.wait(
        until.elementLocated(readyToShipHeading),
        15000,
        "Ready to Ship heading was not found."
    );

    const heading = await this.driver.findElement(readyToShipHeading);

    await this.driver.wait(
        until.elementIsVisible(heading),
        10000,
        "Ready to Ship heading is not visible."
    );

    return heading;
}
    

}

module.exports = ShipToCustomerDetail;
