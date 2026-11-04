
const { By, until, Key } = require("selenium-webdriver");

class GlobalSearchPage {
    constructor(driver) {
        this.driver = driver;

        // Page URL
        this.url =
            "https://wcsstestclient.azurewebsites.net/p/completed";

        // Global Search panel
        this.globalSearchHeading = By.xpath(
            "//*[self::h3 or self::h4 or self::div or self::span]" +
            "[normalize-space(.)='Global Search']"
        );

        // Search filters
        this.customerNameInput = By.css(
            "input[placeholder*='Customer'], input[ng-model*='customerName']"
        );

        // this.userInput = By.css(
        //     "input[placeholder='Select User']"
        // );
        this.userInput = By.css(
            "md-autocomplete input[placeholder='Select User']"
        );

        this.originCountryInput = By.css(
            "input[placeholder='Select Origin Country']"
        );

        this.destinationCountryInput = By.css(
            "input[placeholder='Select Destination Country'], " +
            "input[placeholder*='Select Destination Count']"
        );

        this.descriptionInput = By.css(
            "input[placeholder='Description']"
        );

        this.docIdInput = By.css(
            "input[placeholder='Doc Id']"
        );

        this.orderIdInput = By.css(
            "input[placeholder='Order Id']"
        );

        this.customerReferenceInput = By.css(
            "input[placeholder='Customer Reference']"
        );

        this.invoiceReferenceInput = By.css(
            "input[placeholder='Invoice Reference']"
        );

        this.categoryInput = By.css(
            "input[placeholder='Select Category']"
        );

        this.fromDateInput = By.css(
            "input[type='date'][ng-model*='dateFilterFrom'], " +
            "input[type='date'][ng-model*='selectedStartDate']"
        );

        this.toDateInput = By.css(
            "input[type='date'][ng-model*='dateFilterTo'], " +
            "input[type='date'][ng-model*='selectedEndDate']"
        );

        this.trackingIdInput = By.css(
            "input[placeholder='Tracking Id']"
        );

        // Buttons: confirmed from the page's Angular markup
        this.searchButton = By.css(
            "button[ng-click='searchAllDocuments()']"
        );

        this.exportToExcelButton = By.css(
            "button[ng-click='exportToExcel()']"
        );

        this.activeSearchFields = [];

        this.documentsFoundText = By.xpath(
            "//*[contains(normalize-space(.),'Documents found')]"
        );

        this.loadingSpinner = By.css(
            ".loading-spiner-holder"
        );

        this.customerDropdown = By.xpath(
            "//input[@placeholder='Select Customer']"
        );

        this.globalSearchIcon = By.xpath(
            "//*[contains(@class,'fa-search')]/ancestor::*[self::a or self::button][1]"
        );

        // Total documents found text
        this.totalDocumentsText = By.xpath(
            "//div[contains(., 'Documents found') and not(.//div[contains(., 'Documents found')])]"
        );

        // Results table rows
        this.resultsRows = By.css(
            "table.table-fixed tbody tr"
        );

        // Results table
        this.resultsTable = By.css(
            "table.table-fixed"
        );
    }

    // --------------------------------------------------
    // COMMON HELPERS
    // --------------------------------------------------

    async waitForVisible(locator, timeout = 30000) {
        await this.driver.wait(
            until.elementLocated(locator),
            timeout
        );
    
        const element = await this.driver.findElement(locator);
    
        await this.driver.wait(
            until.elementIsVisible(element),
            timeout
        );
    
        return element;
    }

    async isVisible(locator) {
        const elements = await this.driver.findElements(locator);

        for (const element of elements) {
            try {
                if (await element.isDisplayed()) {
                    return true;
                }
            } catch (error) {
                // Element may have been refreshed.
            }
        }

        return false;
    }

    // Wait until the loading spinner disappears.
// async waitForLoadingToFinish(timeout = 60000) {
//     console.log("Waiting for Global Search loading to finish...");

//     await this.driver.wait(async () => {
//         const spinners = await this.driver.findElements(
//             this.loadingSpinner
//         );

//         for (const spinner of spinners) {
//             if (await spinner.isDisplayed()) {
//                 return false;
//             }
//         }

//         return true;
//     }, timeout, "Loading spinner did not disappear.");

//     console.log("Global Search loading finished.");
// }

async waitForLoadingToFinish(timeout = 60000) {
    const spinner = this.loadingSpinner;

    console.log("Waiting for loading spinner to disappear...");

    await this.driver.wait(async () => {
        const spinners = await this.driver.findElements(spinner);

        if (spinners.length === 0) {
            return true;
        }

        for (const element of spinners) {
            if (await element.isDisplayed()) {
                return false;
            }
        }

        return true;
    }, timeout, "Loading spinner is still visible.");

    console.log("Loading spinner disappeared.");
}

// Wait until an element is visible and enabled.
async waitForVisibleAndEnabled(locator, timeout = 60000) {
    return await this.driver.wait(async () => {
        const elements = await this.driver.findElements(locator);

        if (elements.length === 0) {
            return false;
        }

        const element = elements[0];

        if (
            await element.isDisplayed() &&
            await element.isEnabled()
        ) {
            return element;
        }

        return false;
    }, timeout, `Element is not visible or enabled: ${locator}`);
}

    async clickElement(locator) {
        const element = await this.waitForVisible(locator);

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        );

        try {
            await element.click();
        } catch (error) {
            await this.driver.executeScript(
                "arguments[0].click();",
                element
            );
        }

        return true;
    }

    async enterText(locator, value) {
        const element = await this.waitForVisible(locator);

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        );

        await element.clear();
        await element.sendKeys(String(value));

        return true;
    }

    async clearField(locator) {
        const elements = await this.driver.findElements(locator);

        for (const element of elements) {
            try {
                if (await element.isDisplayed()) {
                    await element.clear();
                    return true;
                }
            } catch (error) {
                // Continue if the element has been re-rendered.
            }
        }

        return false;
    }

    async waitForSearchToFinish(timeout = 30000) {
        // Wait for a spinner to disappear if the application displays one.
        await this.driver.wait(async () => {
            const spinners = await this.driver.findElements(
                this.loadingSpinner
            );

            for (const spinner of spinners) {
                try {
                    if (await spinner.isDisplayed()) {
                        return false;
                    }
                } catch (error) {
                    // A removed spinner means loading has finished.
                }
            }

            return true;
        }, timeout, "Global Search loading did not finish.");

        await this.waitForVisible(this.resultsTable, timeout);

        return true;
    }

    // async open() {
    //     console.log("Waiting for Global Search icon...");
    
    //     const searchIcon = await this.waitForVisible(
    //         this.globalSearchIcon,
    //         60000
    //     );
    
    //     console.log("Clicking Global Search icon...");
    
    //     await this.driver.executeScript(
    //         "arguments[0].scrollIntoView({block:'center'});",
    //         searchIcon
    //     );
    
    //     await searchIcon.click();
    
    //     console.log("Waiting for Global Search page...");
    
    //     await this.driver.wait(
    //         until.urlContains("/p/completed"),
    //         60000
    //     );
    
    //     await this.waitForVisible(this.searchButton, 60000);
    //     await this.waitForVisible(this.exportToExcelButton, 60000);
    
    //     console.log("Global Search page opened successfully.");
    
    //     return true;
    // }

    async open() {
        console.log("Waiting for Global Search icon...");
    
        const searchIcon = await this.waitForVisible(
            this.globalSearchIcon,
            60000
        );
    
        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            searchIcon
        );
    
        await searchIcon.click();
    
        console.log("Waiting for Global Search page...");
    
        await this.driver.wait(
            until.urlContains("/p/completed"),
            60000
        );
    
        await this.waitForVisible(this.searchButton, 60000);
        await this.waitForVisible(this.exportToExcelButton, 60000);
    
        // Wait for the customer autocomplete's loading state too.
        await this.waitForCustomerAutocompleteReady(60000);
    
        console.log("Global Search page opened successfully.");
    
        return true;
    }

    async verifyPageLoaded() {
        const currentUrl = await this.driver.getCurrentUrl();
    
        if (!currentUrl.includes("/p/completed")) {
            throw new Error(
                `Expected Global Search page URL to contain "/p/completed", ` +
                `but received: ${currentUrl}`
            );
        }
    
        await this.waitForVisible(this.searchButton, 30000);
        await this.waitForVisible(this.exportToExcelButton, 30000);
    
        console.log("Global Search page controls verified.");
    
        return true;
    }


    // --------------------------------------------------
    // VERIFY FILTER VISIBILITY
    // --------------------------------------------------

    async verifySearchControls() {
        const controls = [
            ["Description", this.descriptionInput],
            ["Doc Id", this.docIdInput],
            ["Order Id", this.orderIdInput],
            ["Customer Reference", this.customerReferenceInput],
            ["Invoice Reference", this.invoiceReferenceInput],
            ["Tracking Id", this.trackingIdInput],
            ["Category", this.categoryInput],
            ["From Date", this.fromDateInput],
            ["To Date", this.toDateInput]
        ];

        const results = {};

        for (const [name, locator] of controls) {
            results[name] = await this.isVisible(locator);
        }

        results.Search = await this.isVisible(this.searchButton);
        results["Export to Excel"] =
            await this.isVisible(this.exportToExcelButton);

        return results;
    }

    // --------------------------------------------------
    // SEARCH FILTER ACTIONS
    // --------------------------------------------------

    async searchByOrderId(orderId) {
        await this.enterText(this.orderIdInput, orderId);
        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async searchByDocId(docId) {
        await this.enterText(this.docIdInput, docId);
        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async searchByDescription(description) {
        await this.enterText(this.descriptionInput, description);
        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async searchByCustomerReference(reference) {
        await this.enterText(
            this.customerReferenceInput,
            reference
        );

        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async searchByInvoiceReference(reference) {
        await this.enterText(
            this.invoiceReferenceInput,
            reference
        );

        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async searchByTrackingId(trackingId) {
        await this.enterText(this.trackingIdInput, trackingId);
        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async setDateRange(fromDate, toDate) {
        // Expected format: YYYY-MM-DD, e.g. 2026-10-01
        if (fromDate) {
            await this.enterText(this.fromDateInput, fromDate);
        }

        if (toDate) {
            await this.enterText(this.toDateInput, toDate);
        }

        return true;
    }

    async searchByDateRange(fromDate, toDate) {
        await this.setDateRange(fromDate, toDate);

        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async search() {
        await this.clickElement(this.searchButton);
        await this.waitForSearchToFinish();

        return await this.getResults();
    }

    async clearAllFilters() {
        const filters = [
            this.customerNameInput,
            this.userInput,
            this.originCountryInput,
            this.destinationCountryInput,
            this.descriptionInput,
            this.docIdInput,
            this.orderIdInput,
            this.customerReferenceInput,
            this.invoiceReferenceInput,
            this.categoryInput,
            this.fromDateInput,
            this.toDateInput,
            this.trackingIdInput
        ];

        for (const locator of filters) {
            await this.clearField(locator);
        }

        return true;
    }

    // --------------------------------------------------
    // RESULTS TABLE
    // --------------------------------------------------

    async getResults() {
        await this.waitForVisible(this.resultsTable);

        const rows = await this.driver.findElements(
            this.resultsRows
        );

        const results = [];

        for (const row of rows) {
            try {
                if (!(await row.isDisplayed())) {
                    continue;
                }

                const cells = await row.findElements(
                    By.css("td")
                );

                const values = [];

                for (const cell of cells) {
                    values.push(
                        (await cell.getText())
                            .replace(/\s+/g, " ")
                            .trim()
                    );
                }

                if (values.length > 0) {
                    results.push(values);
                }
            } catch (error) {
                // Ignore rows that were re-rendered during a search.
            }
        }

        return results;
    }



    async getFirstResultOrderId() {
        const firstRow = await this.getFirstResult();
        const orderId = String(firstRow[0] || "").trim();

        if (!/^\d+$/.test(orderId)) {
            throw new Error(
                `The first result did not contain a numeric Order ID. ` +
                `Received: "${orderId}"`
            );
        }

        return orderId;
    }

    async getFirstResultDocId() {
        const firstRow = await this.getFirstResult();
        const docId = String(firstRow[1] || "").trim();

        if (!/^\d+$/.test(docId)) {
            throw new Error(
                `The first result did not contain a numeric Doc ID. ` +
                `Received: "${docId}"`
            );
        }

        return docId;
    }

    async getDocumentsFoundCount() {
        const text = await this.driver.executeScript(() => {
            const elements = Array.from(document.querySelectorAll("*"));

            const element = elements.find(el =>
                el.children.length === 0 &&
                /Documents found/i.test(el.textContent || "")
            );

            return element ? element.textContent.trim() : "";
        });

        const match = String(text).match(/([\d,]+)\s+Documents found/i);

        if (!match) {
            return null;
        }

        return Number(match[1].replace(/,/g, ""));
    }

    async verifyResultsContainValue(columnIndex, expectedValue) {
        const results = await this.getResults();
        const expected = String(expectedValue).trim();

        return results.some(row =>
            String(row[columnIndex] || "").trim() === expected
        );
    }

    // --------------------------------------------------
    // OPEN A DOCUMENT FROM RESULTS
    // --------------------------------------------------

    async clickDocId(docId) {
        const locator = By.xpath(
            "//table[contains(@class,'table-fixed')]//tr[td]" +
            `/td[2]//a[normalize-space(.)='${String(docId)}']`
        );

        await this.clickElement(locator);

        return true;
    }

    async clickOrderId(orderId) {
        const locator = By.xpath(
            "//table[contains(@class,'table-fixed')]//tr[td]" +
            `/td[1]//*[self::a or self::span]` +
            `[normalize-space(.)='${String(orderId)}']`
        );

        await this.clickElement(locator);

        return true;
    }

    // --------------------------------------------------
    // EXPORT TO EXCEL
    // --------------------------------------------------

    async exportToExcel() {
        await this.clickElement(this.exportToExcelButton);
        return true;
    }

    // async selectCustomer(customerName) {
    //     console.log(`Selecting customer: ${customerName}`);
    
    //     // Use the locator that is actually defined in the constructor.
    //     const customerInput = await this.waitForVisible(
    //         this.customerNameInput,
    //         30000
    //     );
    
    //     // Wait until the customer autocomplete is enabled.
    //     await this.driver.wait(
    //         async () => {
    //             try {
    //                 return await customerInput.isEnabled();
    //             } catch (error) {
    //                 return false;
    //             }
    //         },
    //         30000,
    //         "Customer autocomplete input is not enabled."
    //     );
    
    //     // Wait for the customer-list loading spinner to disappear.
    //     // The screenshot shows this spinner beside the customer field.
    //     const customerSpinner = By.css(
    //         "i.fa-spinner"
    //     );
    
    //     await this.driver.wait(
    //         async () => {
    //             const spinners = await this.driver.findElements(
    //                 customerSpinner
    //             );
    
    //             for (const spinner of spinners) {
    //                 try {
    //                     if (await spinner.isDisplayed()) {
    //                         return false;
    //                     }
    //                 } catch (error) {
    //                     // Spinner may have been removed during loading.
    //                 }
    //             }
    
    //             return true;
    //         },
    //         60000,
    //         "Customer list is still loading."
    //     );
    
    //     // Check whether the requested customer is already selected.
    //     const currentValue = (
    //         await customerInput.getAttribute("value") || ""
    //     ).trim();
    
    //     if (currentValue.toLowerCase() === customerName.toLowerCase()) {
    //         console.log(`Customer already selected: ${customerName}`);
    //         return true;
    //     }
    
    //     // Enter the customer name.
    //     await customerInput.clear();
    //     await customerInput.sendKeys(customerName);
    
    //     // Wait for the matching Angular Material autocomplete suggestion.
    //     const customerOption = By.xpath(
    //         `//md-autocomplete//li[.//*[normalize-space(.)="${customerName}"]]`
    //     );
    
    //     const option = await this.waitForVisible(
    //         customerOption,
    //         30000
    //     );
    
    //     // Select the suggestion.
    //     await option.click();
    
    //     console.log(`Customer selected: ${customerName}`);
    
    //     return true;
    // }

    async selectCustomer(customerName) {
        console.log(`Selecting customer: ${customerName}`);
    
        // Locate the customer autocomplete input.
        const customerInput = await this.waitForVisible(
            this.customerNameInput,
            30000
        );
    
        // Wait until the input is enabled.
        await this.driver.wait(
            async () => {
                try {
                    return await customerInput.isEnabled();
                } catch (error) {
                    return false;
                }
            },
            30000,
            "Customer input is not enabled."
        );
    
        // Clear any previous customer text.
        await customerInput.click();
        await customerInput.clear();
    
        // Type the customer name.
        await customerInput.sendKeys(customerName);
        this.trackSearchField(this.customerNameInput);
    
        console.log("Customer name entered. Waiting for autocomplete...");
    
        // Wait for the autocomplete dropdown to appear.
        // The exact suggestion locator is intentionally avoided here.
        await this.driver.wait(
            async () => {
                try {
                    const inputValue = (
                        await customerInput.getAttribute("value") || ""
                    ).trim();
    
                    return inputValue.toLowerCase() ===
                        customerName.toLowerCase();
                } catch (error) {
                    return false;
                }
            },
            15000,
            "Customer name was not entered into the autocomplete."
        );
    
        // Allow the autocomplete suggestion list to become available.
        // Select the first suggestion with keyboard navigation.
        await customerInput.sendKeys(Key.ARROW_DOWN);
        await customerInput.sendKeys(Key.ENTER);
    
        console.log("Autocomplete selection submitted.");
    
        // Wait until the autocomplete dropdown is closed.
        const autocompleteDropdown = By.css(
            "md-autocomplete[md-expanded='true']"
        );
    
        await this.driver.wait(
            async () => {
                const dropdowns = await this.driver.findElements(
                    autocompleteDropdown
                );
    
                for (const dropdown of dropdowns) {
                    try {
                        if (await dropdown.isDisplayed()) {
                            return false;
                        }
                    } catch (error) {
                        // Dropdown was removed.
                    }
                }
    
                return true;
            },
            15000,
            "Autocomplete dropdown did not close after selecting the customer."
        );
    
        console.log(`Customer selected: ${customerName}`);
    
        return true;
    }
    
    async clickSearch() {
        const searchButton = await this.waitForVisible(
            this.searchButton,
            30000
        );
    
        await searchButton.click();
    
        console.log("Search button clicked.");
    
        return true;
    }
    
    async waitForSearchResults(timeout = 60000) {
        // Wait for the loading spinner to disappear.
        await this.driver.wait(async () => {
            const spinners = await this.driver.findElements(
                this.loadingSpinner
            );
    
            for (const spinner of spinners) {
                if (await spinner.isDisplayed()) {
                    return false;
                }
            }
    
            return true;
        }, timeout);
    
        // Results table is expected only after Search is clicked.
        await this.waitForVisible(this.resultsTable, timeout);
    
        console.log("Search results table is visible.");
    
        return true;
    }

    async waitForCustomerAutocompleteReady(timeout = 60000) {
        console.log("Waiting for customer autocomplete to load...");
    
        const customerInput = await this.waitForVisible(
            this.customerNameInput,
            timeout
        );
    
        await this.driver.wait(
            async () => {
                try {
                    return await customerInput.isEnabled();
                } catch (error) {
                    return false;
                }
            },
            timeout,
            "Customer autocomplete input is not enabled."
        );
    
        const customerSpinner = By.css("i.fa-spinner");
    
        await this.driver.wait(
            async () => {
                const spinners = await this.driver.findElements(
                    customerSpinner
                );
    
                for (const spinner of spinners) {
                    try {
                        if (await spinner.isDisplayed()) {
                            return false;
                        }
                    } catch (error) {
                        // Spinner disappeared.
                    }
                }
    
                return true;
            },
            timeout,
            "Customer autocomplete spinner did not disappear."
        );
    
        console.log("Customer autocomplete is ready.");
    
        return true;
    }
// --------------------------------------------------
// GET TOTAL DOCUMENTS FOUND
// Example: "250 Documents found"
// --------------------------------------------------

async getTotalDocumentsFound() {
    const countLocator = By.xpath(
        "//div[contains(normalize-space(.), 'Documents found')]"
    );

    const countElement = await this.waitForVisible(
        countLocator,
        30000
    );

    const countText = await countElement.getText();

    const match = countText.match(/(\d+)\s+Documents found/i);

    if (!match) {
        throw new Error(
            `Unable to extract document count from: ${countText}`
        );
    }

    return Number(match[1]);
}


// --------------------------------------------------
// GET CURRENT PAGE ROW COUNT
// --------------------------------------------------

async getCurrentPageRowCount() {
    const rows = await this.driver.findElements(
        this.resultsRows
    );

    let visibleRows = 0;

    for (const row of rows) {
        if (await row.isDisplayed()) {
            visibleRows++;
        }
    }

    return visibleRows;
}


// --------------------------------------------------
// GET TOTAL PAGE COUNT
// --------------------------------------------------

async getTotalPageCount() {
    const pageNumbers = await this.driver.findElements(
        By.css("ul.pagination li a")
    );

    let maxPage = 1;

    for (const page of pageNumbers) {
        const pageText = (await page.getText()).trim();

        if (/^\d+$/.test(pageText)) {
            maxPage = Math.max(maxPage, Number(pageText));
        }
    }

    return maxPage;
}


// --------------------------------------------------
// GET NO-DATA MESSAGE
// Example: "Data Not Exist"
// --------------------------------------------------

async getNoDataMessage() {
    const messageLocator = By.xpath(
        "//*[contains(normalize-space(.), 'Data Not Exist')]"
    );

    const messageElement = await this.driver.wait(
        until.elementLocated(messageLocator),
        15000,
        "No-data message was not displayed."
    );

    await this.driver.wait(
        until.elementIsVisible(messageElement),
        15000,
        "No-data message is not visible."
    );

    return (await messageElement.getText()).trim();
}

async selectUserByEmail(userName, expectedEmail) {
    console.log(`Searching user: ${userName}`);
    console.log(`Expected email: ${expectedEmail}`);

    const userInput = await this.waitForVisible(
        this.userInput,
        30000
    );

    await userInput.click();
    await userInput.clear();
    await userInput.sendKeys(userName);
    this.trackSearchField(this.userInput);

    console.log("User name entered. Waiting for user suggestions...");

    // Target visible dropdown suggestion items across AngularJS Material dropdown containers
    const userSuggestions = By.css(
        "ul.md-autocomplete-suggestions li, md-virtual-repeat-container li"
    );

    // Wait until options are rendered and visible
    await this.driver.wait(async () => {
        const suggestions = await this.driver.findElements(userSuggestions);
        for (const suggestion of suggestions) {
            if (await suggestion.isDisplayed()) {
                return true;
            }
        }
        return false;
    }, 30000, "User autocomplete suggestions were not displayed.");

    const suggestions = await this.driver.findElements(userSuggestions);
    let matchedSuggestion = null;

    // Loop through suggestions to match the exact email
    for (const suggestion of suggestions) {
        if (await suggestion.isDisplayed()) {
            const text = await suggestion.getText();
            if (text.includes(expectedEmail)) {
                matchedSuggestion = suggestion;
                break;
            }
        }
    }

    if (!matchedSuggestion) {
        throw new Error(`No user suggestion found matching email: ${expectedEmail}`);
    }

    console.log(`Selecting user suggestion with email: ${expectedEmail}...`);
    await matchedSuggestion.click();

    console.log(`User selected successfully: ${userName} (${expectedEmail})`);
    return true;
}

trackSearchField(locator) {
    if (!this.activeSearchFields.includes(locator)) {
        this.activeSearchFields.push(locator);
    }
}

// async clearSearchFilters() {
//     console.time("clearSearchFilters");

//     const fields = [
//         this.customerNameInput,
//         this.userNameInput,
//         this.descriptionInput,
//         this.docIdInput,
//         this.orderIdInput,
//         this.customerReferenceInput,
//         this.invoiceReferenceInput,
//         this.trackingIdInput
//     ];

//     for (const locator of fields) {
//         if (!locator) continue;

//         console.time(`clear field: ${locator}`);

//         try {
//             const elements = await this.driver.findElements(locator);

//             if (elements.length > 0) {
//                 await elements[0].clear();
//             }
//         } catch (error) {
//             console.log(error.message);
//         }

//         console.timeEnd(`clear field: ${locator}`);
//     }

//     console.timeEnd("clearSearchFilters");
// }

async clearSearchFilters() {
    console.log("Clearing fields used in this test...");

    for (const locator of this.activeSearchFields) {
        try {
            const elements = await this.driver.findElements(locator);

            if (elements.length > 0) {
                await elements[0].clear();
                console.log(`Cleared: ${locator}`);
            }
        } catch (error) {
            console.log(`Unable to clear field: ${error.message}`);
        }
    }

    this.activeSearchFields = [];

    console.log("Search fields cleared.");
}


}

module.exports = GlobalSearchPage;
