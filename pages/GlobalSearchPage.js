
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

        // this.originCountryInput = By.css(
        //     "input[placeholder='Select Origin Country']"
        // );

        // this.originCountryInput = By.xpath(
        //     "//input[@placeholder='Select Origin Country']"
        // );

        // this.destinationCountryInput = By.css(
        //     "input[placeholder='Select Destination Country'], " +
        //     "input[placeholder*='Select Destination Count']"
        // );

        this.originCountryInput = By.css(
            "input[placeholder='Select Origin Country']"
        );
        
        this.destinationCountryInput = By.css(
            "input[placeholder='Select Destination Country'], " +
            "input[placeholder*='Select Destination Count']"
        );

        // this.descriptionInput = By.css(
        //     "input[placeholder='Description']"
        // );

        this.descriptionInput = By.xpath(
            "//input[@ng-model='newDocument.Description']"
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
            "input[ng-model='newDocument.invoiceReference']"
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

    // async searchByCustomerReference(reference) {
    //     await this.enterText(
    //         this.customerReferenceInput,
    //         reference
    //     );

    //     await this.clickElement(this.searchButton);
    //     await this.waitForSearchToFinish();

    //     return await this.getResults();
    // }

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

// async getTotalDocumentsFound() {
//     const countLocator = By.xpath(
//         "//div[contains(normalize-space(.), 'Documents found')]"
//     );

//     const countElement = await this.waitForVisible(
//         countLocator,
//         30000
//     );

//     const countText = await countElement.getText();

//     const match = countText.match(/(\d+)\s+Documents found/i);

//     if (!match) {
//         throw new Error(
//             `Unable to extract document count from: ${countText}`
//         );
//     }

//     return Number(match[1]);
// }

async getTotalDocumentsFound() {
    try {
        // Target the specific text node containing 'Documents found'
        const countLocator = By.xpath(
            "//*[contains(normalize-space(text()), 'Documents found')]"
        );

        // Wait up to 10s for the counter element to be visible
        const countElement = await this.waitForVisible(
            countLocator,
            10000
        );

        const countText = await countElement.getText();

        // Match patterns like "0 Documents found" or "250 Documents found"
        const match = countText.match(/(\d+)\s+Documents\s+found/i);

        if (match) {
            return Number(match[1]);
        }

        // Fallback: search for any standalone digit before the phrase in raw text
        const fallbackMatch = countText.match(/(\d+)/);
        return fallbackMatch ? Number(fallbackMatch[1]) : 0;
    } catch (error) {
        console.warn(`Could not read total documents count (defaulting to 0): ${error.message}`);
        return 0;
    }
}


// --------------------------------------------------
// GET CURRENT PAGE ROW COUNT
// --------------------------------------------------

// async getCurrentPageRowCount() {
//     const rows = await this.driver.findElements(
//         this.resultsRows
//     );

//     let visibleRows = 0;

//     for (const row of rows) {
//         if (await row.isDisplayed()) {
//             visibleRows++;
//         }
//     }

//     return visibleRows;
// }


async getCurrentPageRowCount() {
    const rows = await this.driver.findElements(
        this.resultsRows
    );

    let dataRowCount = 0;

    for (const row of rows) {
        try {
            if (!(await row.isDisplayed())) {
                continue;
            }

            // Get only the table data cells.
            const cells = await row.findElements(
                By.css("td")
            );

            // Ignore header rows.
            if (cells.length === 0) {
                continue;
            }

            const rowText = (await row.getText())
                .replace(/\s+/g, " ")
                .trim();

            // Ignore empty and no-data rows.
            if (
                !rowText ||
                /data not exist|no records found|no documents found/i.test(rowText)
            ) {
                continue;
            }

            dataRowCount++;

        } catch (error) {
            // Ignore rows refreshed by AngularJS.
        }
    }

    return dataRowCount;
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

// --------------------------------------------------
// GET GLOBAL SEARCH TABLE DATA
// --------------------------------------------------


// async selectOriginCountry(countryName) {
//     console.log(`Selecting Origin Country: ${countryName}`);

//     // Step 1: Find and click the Origin Country input.
//     const originInput = await this.waitForVisible(
//         this.originCountryInput,
//         30000
//     );

//     await originInput.click();

//     // Step 2: Type the country name.
//     await originInput.clear();
//     await originInput.sendKeys(countryName);

//     console.log(`Typed Origin Country: ${countryName}`);

//     // Step 3: Global XPath targeting the rendered dropdown suggestion across the entire DOM
//     const countryOption = By.xpath(
//         `//ul[contains(@class,'md-autocomplete-suggestions')]//li[//*[normalize-space(.)='${countryName}']] | ` +
//         `//md-virtual-repeat-container//li[//*[normalize-space(.)='${countryName}']]`
//     );

//     // Step 4: Wait until the matching suggestion is visible.
//     const option = await this.waitForVisible(
//         countryOption,
//         30000
//     );

//     // Step 5: Click the suggestion to select the country.
//     await option.click();

//     console.log(`Selected Origin Country: ${countryName}`);

//     // Track the field for cleanup.
//     if (typeof this.trackSearchField === "function") {
//         this.trackSearchField(this.originCountryInput);
//     }
// }

async getGlobalSearchTableData() {
    const rows = await this.driver.findElements(
        this.resultsRows
    );

    const documents = [];

    for (const row of rows) {
        if (!(await row.isDisplayed())) {
            continue;
        }

        // Support both standard HTML tables and UI-Grid layouts
        const cells = await row.findElements(
            By.css("td, div.ui-grid-cell")
        );

        const values = [];

        for (const cell of cells) {
            const text = await cell.getText();
            values.push(text.replace(/\s+/g, " ").trim());
        }

        // Skip rows that do not contain the required columns.
        if (values.length < 5) {
            continue;
        }

        documents.push({
            orderId: values[0],
            docId: values[1],
            country: values[2],
            originCountry: values[3],
            customerName: values[4]
        });
    }

    return documents;
}

// --------------------------------------------------
// DESTINATION COUNTRY SEARCH
// --------------------------------------------------

// async selectDestinationCountry(countryName) {
//     console.log(`Selecting Destination Country: ${countryName}`);

//     // Step 1: Find and click the Destination Country input field
//     const destInput = await this.waitForVisible(
//         By.css("md-autocomplete[placeholder='Select Destination Country'] input"),
//         30000
//     );

//     await destInput.click();
//     await destInput.clear();
//     await destInput.sendKeys(countryName);

//     console.log(`Typed Destination Country: ${countryName}`);

//     // Step 2: Global XPath targeting the rendered autocomplete suggestion
//     const countryOption = By.xpath(
//         `//ul[contains(@class,'md-autocomplete-suggestions')]//li[//*[normalize-space(.)='${countryName}']] | ` +
//         `//md-virtual-repeat-container//li[//*[normalize-space(.)='${countryName}']]`
//     );

//     // Step 3: Wait until the matching suggestion is visible and click
//     const option = await this.waitForVisible(countryOption, 30000);
//     await option.click();

//     console.log(`Selected Destination Country: ${countryName}`);

//     if (typeof this.trackSearchField === "function") {
//         this.trackSearchField(
//             By.css("md-autocomplete[placeholder='Select Destination Country'] input")
//         );
//     }
// }


async selectOriginCountry(countryName) {
    await this.selectCountryFromAutocomplete(
        this.originCountryInput,
        countryName,
        "Origin Country"
    );

    this.trackSearchField(this.originCountryInput);

    return true;
}

async selectDestinationCountry(countryName) {
    await this.selectCountryFromAutocomplete(
        this.destinationCountryInput,
        countryName,
        "Destination Country"
    );

    this.trackSearchField(this.destinationCountryInput);

    return true;
}


// Search by Description
async searchByDescription(description) {
    const descriptionField = await this.waitForVisible(
        this.descriptionInput
    );

    await descriptionField.clear();
    await descriptionField.sendKeys(description);

    await this.driver.wait(
        until.elementIsVisible(descriptionField),
        10000
    );

    await this.clickElement(this.searchButton);

    await this.waitForLoadingToFinish();
}

// Clear only Description
async clearDescriptionSearch() {
    const descriptionField = await this.waitForVisible(
        this.descriptionInput
    );

    await descriptionField.clear();
}

/**
 * Types a Doc Id into the input field.
 */
async enterDocId(docId) {
    console.log(`Entering Doc Id: ${docId}`);

    // Target the Doc Id text input by id or ng-model attribute from screenshot
    const docInput = await this.waitForVisible(
        By.css("input#input_7, input[ng-model='newDocument.doc']"),
        30000
    );

    await docInput.click();
    await docInput.clear();
    await docInput.sendKeys(docId);

    console.log(`Doc Id entered: ${docId}`);

    if (typeof this.trackSearchField === "function") {
        this.trackSearchField(
            By.css("input#input_7, input[ng-model='newDocument.doc']")
        );
    }
}

/**
 * Extracts table data including OrderId, DocId, Country, OriginCountry, 
 * Customer Name, Contact Person, and Document Type.
 */
async getDocIdSearchResults() {
    const rows = await this.driver.findElements(this.resultsRows);
    const documents = [];

    for (const row of rows) {
        if (!(await row.isDisplayed())) {
            continue;
        }

        const cells = await row.findElements(By.css("td, div.ui-grid-cell"));
        const values = [];

        for (const cell of cells) {
            const text = await cell.getText();
            values.push(text.replace(/\s+/g, " ").trim());
        }

        // Must contain at least 7 columns based on table header layout
        if (values.length < 7) {
            continue;
        }

        documents.push({
            orderId: values[0],
            docId: values[1],
            country: values[2],
            originCountry: values[3],
            customerName: values[4],
            contactPerson: values[5],
            documentType: values[6]
        });
    }

    return documents;
}

/**
 * Types an Order Id into the input field.
 */
async enterOrderId(orderId) {
    console.log(`Entering Order Id: ${orderId}`);

    // Target the Order Id input field using the DOM attributes from the screenshot (id="input_8", ng-model="newDocument.order")
    const orderInput = await this.waitForVisible(
        By.css("input#input_8, input[ng-model='newDocument.order']"),
        30000
    );

    await orderInput.click();
    await orderInput.clear();
    await orderInput.sendKeys(orderId);

    console.log(`Order Id entered: ${orderId}`);

    if (typeof this.trackSearchField === "function") {
        this.trackSearchField(
            By.css("input#input_8, input[ng-model='newDocument.order']")
        );
    }
}

/**
 * Extracts table data including OrderId, DocId, Country, OriginCountry, 
 * Customer Name, Contact Person, and Document Type.
 */
async getOrderIdSearchResults() {
    const rows = await this.driver.findElements(this.resultsRows);
    const documents = [];

    for (const row of rows) {
        if (!(await row.isDisplayed())) {
            continue;
        }

        const cells = await row.findElements(By.css("td, div.ui-grid-cell"));
        const values = [];

        for (const cell of cells) {
            const text = await cell.getText();
            values.push(text.replace(/\s+/g, " ").trim());
        }

        // Must contain at least 7 columns based on table layout shown in screenshot
        if (values.length < 7) {
            continue;
        }

        documents.push({
            orderId: values[0],
            docId: values[1],
            country: values[2],
            originCountry: values[3],
            customerName: values[4],
            contactPerson: values[5],
            documentType: values[6]
        });
    }

    return documents;
}

/**
 * Types a Customer Reference into the input field.
 */
async enterCustomerReference(referenceText) {
    console.log(`Entering Customer Reference: ${referenceText}`);

    // Target the Customer Reference input field using attributes from screenshot (id="input_9", ng-model="newDocument.internalReference")
    const customerRefInput = await this.waitForVisible(
        By.css("input#input_9, input[ng-model='newDocument.internalReference']"),
        30000
    );

    await customerRefInput.click();
    await customerRefInput.clear();
    await customerRefInput.sendKeys(referenceText);

    console.log(`Customer Reference entered: ${referenceText}`);

    if (typeof this.trackSearchField === "function") {
        this.trackSearchField(
            By.css("input#input_9, input[ng-model='newDocument.internalReference']")
        );
    }
}

/**
 * Extracts table data including OrderId, DocId, Country, OriginCountry, 
 * Customer Name, Contact Person, Document Type, and Customer Reference.
 */
/**
 * Extracts table data safely without throwing index alignment errors.
 */
async getCustomerReferenceSearchResults() {
    const rows = await this.driver.findElements(this.resultsRows);
    const documents = [];

    for (const row of rows) {
        if (!(await row.isDisplayed())) {
            continue;
        }

        const cells = await row.findElements(By.css("td, div.ui-grid-cell"));
        const values = [];

        for (const cell of cells) {
            const text = await cell.getText();
            values.push(text.replace(/\s+/g, " ").trim());
        }

        if (values.length < 5) {
            continue;
        }

        // Extract fixed core columns
        const orderId = values[0] || "";
        const docId = values[1] || "";
        const country = values[2] || "";
        const originCountry = values[3] || "";
        const customerName = values[4] || "";
        const contactPerson = values[5] || "";
        const documentType = values[6] || "";

        // Dynamically locate non-empty Customer Reference value from remaining cells
        let customerReference = "";
        for (let i = 7; i < values.length; i++) {
            if (values[i] && values[i].length > 0 && values[i] !== "Waiting" && values[i] !== "Shipped") {
                customerReference = values[i];
                break;
            }
        }

        documents.push({
            orderId,
            docId,
            country,
            originCountry,
            customerName,
            contactPerson,
            documentType,
            customerReference
        });
    }

    return documents;
}

/**
 * Types an Invoice Reference into the input field.
 */
async enterInvoiceReference(referenceText) {
    console.log(`Entering Invoice Reference: ${referenceText}`);

    // Target the Invoice Reference input field using DOM attributes from screenshot (id="input_10", ng-model="newDocument.invoiceReference")
    const invoiceRefInput = await this.waitForVisible(
        By.css("input#input_10, input[ng-model='newDocument.invoiceReference']"),
        30000
    );

    await invoiceRefInput.click();
    await invoiceRefInput.clear();
    await invoiceRefInput.sendKeys(referenceText);

    console.log(`Invoice Reference entered: ${referenceText}`);

    if (typeof this.trackSearchField === "function") {
        this.trackSearchField(
            By.css("input#input_10, input[ng-model='newDocument.invoiceReference']")
        );
    }
}

async getInvoiceReferenceSearchResults() {
    try {
        const rows = await this.driver.findElements(this.resultsRows);
        const documents = [];

        for (const row of rows) {
            if (!(await row.isDisplayed())) {
                continue;
            }

            const cells = await row.findElements(By.css("td, div.ui-grid-cell"));
            const values = [];

            for (const cell of cells) {
                const text = await cell.getText();
                values.push(text.replace(/\s+/g, " ").trim());
            }

            if (values.length < 5) {
                continue;
            }

            documents.push({
                orderId: values[0] || "",
                docId: values[1] || "",
                country: values[2] || "",
                originCountry: values[3] || "",
                customerName: values[4] || "",
                contactPerson: values[5] || "",
                documentType: values[6] || "",
                invoiceReference: values[7] || ""
            });
        }

        return documents;
    } catch (e) {
        return [];
    }
}

async getToastErrorMessage() {
    try {
        const toastLocator = By.css("#toast-container .toast-message, div.toast-message");
        const toastElements = await this.driver.findElements(toastLocator);
        
        if (toastElements.length > 0 && await toastElements[0].isDisplayed()) {
            const errorText = await toastElements[0].getText();
            return errorText.trim();
        }
    } catch (e) {
        return null;
    }
    return null;
}

// --------------------------------------------------
// SELECT CATEGORY FROM GLOBAL SEARCH DROPDOWN
// --------------------------------------------------

async selectCategory(categoryName) {
    console.log(`Selecting Category: ${categoryName}`);

    // Step 1: Wait for any active loading spinner to disappear first
    await this.waitForSpinnerToDisappear(30000);

    const categoryInputLocator = By.css(
        "md-autocomplete[placeholder='Select Category'] input, input#input-11"
    );

    // Step 2: Locate and scroll into view if necessary
    const categoryInput = await this.waitForVisible(categoryInputLocator, 30000);
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", categoryInput);

    // Step 3: Click and enter text safely
    await categoryInput.click();
    await categoryInput.clear();
    await categoryInput.sendKeys(categoryName);

    console.log(`Typed Category: ${categoryName}`);

    // Step 4: Global XPath targeting the rendered dropdown suggestion at <body> level
    const categoryOption = By.xpath(
        `//ul[contains(@class,'md-autocomplete-suggestions')]//li[//*[normalize-space(.)='${categoryName}']] | ` +
        `//md-virtual-repeat-container//li[//*[normalize-space(.)='${categoryName}']]`
    );

    // Step 5: Wait for option to be visible and click
    const option = await this.waitForVisible(categoryOption, 30000);
    await option.click();

    console.log(`Selected Category: ${categoryName}`);

    if (typeof this.trackSearchField === "function") {
        this.trackSearchField(categoryInputLocator);
    }
}

/**
 * Calculates total page count based on total documents (defaulting to 10 rows per page grid).
 */
// async getTotalPageCount(totalDocuments, rowsPerPage = 10) {
//     if (!totalDocuments || totalDocuments <= 0) {
//         return 0;
//     }
//     return Math.ceil(totalDocuments / rowsPerPage);
// }

async waitForSpinnerToDisappear(timeout = 30000) {
    const spinnerLocator = By.css("div.loading-spiner-holder, div.data-loading");
    try {
        await this.driver.wait(async () => {
            const spinners = await this.driver.findElements(spinnerLocator);
            if (spinners.length === 0) return true;
            const isVisible = await spinners[0].isDisplayed();
            return !isVisible;
        }, timeout, "Loading spinner did not disappear in time.");
    } catch (e) {
        // Continue if spinner is already removed or hidden
    }
}

// --------------------------------------------------
// SELECT FROM DATE
// Expected format: YYYY-MM-DD
// Example: 2026-11-05
// --------------------------------------------------

async selectFromDate(dateValue) {
    console.log(`Selecting From Date: ${dateValue}`);

    const dateInput = await this.waitForVisible(
        this.fromDateInput,
        30000
    );

    await this.driver.executeScript(
        (element, value) => {
            const setter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                "value"
            ).set;

            setter.call(element, value);

            // Trigger AngularJS input and change events.
            element.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            element.dispatchEvent(
                new Event("change", { bubbles: true })
            );

            element.blur();
        },
        dateInput,
        dateValue
    );

    // Verify that the date was actually selected.
    await this.driver.wait(
        async () => {
            const currentValue = await dateInput.getAttribute("value");
            return currentValue === dateValue;
        },
        10000,
        `From Date was not set to ${dateValue}`
    );

    console.log(`From Date selected successfully: ${dateValue}`);

    return true;
}


async setDateRange(fromDate, toDate) {
    console.log("Setting Global Search date range...");

    const setDateInput = async (locator, date, fieldName) => {
        const element = await this.waitForVisible(locator, 30000);

        // Set the native HTML date input value.
        // This avoids Selenium sendKeys() date-format issues.
        await this.driver.executeScript(
            function (input, dateValue) {
                const setter = Object.getOwnPropertyDescriptor(
                    HTMLInputElement.prototype,
                    "value"
                ).set;

                setter.call(input, dateValue);

                // Notify AngularJS about the changed value.
                input.dispatchEvent(
                    new Event("input", { bubbles: true })
                );

                input.dispatchEvent(
                    new Event("change", { bubbles: true })
                );

                input.dispatchEvent(
                    new Event("blur", { bubbles: true })
                );
            },
            element,
            date
        );

        const actualValue = await element.getAttribute("value");

        console.log(`${fieldName}: ${actualValue}`);

        if (actualValue !== date) {
            throw new Error(
                `${fieldName} was not set correctly. ` +
                `Expected: ${date}, Actual: ${actualValue}`
            );
        }
    };

    // Set From Date.
    await setDateInput(
        this.fromDateInput,
        fromDate,
        "From Date"
    );

    // Set To Date.
    await setDateInput(
        this.toDateInput,
        toDate,
        "To Date"
    );

    console.log("Both date fields were set successfully.");

    return true;
}


async searchByDateRange(fromDate, toDate) {
    // Step 1: Set both dates.
    await this.setDateRange(fromDate, toDate);

    // Step 2: Click Search.
    await this.clickSearch();

    // Step 3: Wait for the search to finish.
    await this.waitForSearchToFinish(60000);

    // Step 4: Return the search results.
    return await this.getResults();
}


async selectCountryFromAutocomplete(inputLocator, countryName, fieldName) {
    console.log(`Selecting ${fieldName}: ${countryName}`);

    const input = await this.waitForVisible(inputLocator, 30000);

    await input.click();
    await input.clear();
    await input.sendKeys(countryName);

    console.log(`Typed ${fieldName}: ${countryName}`);

    // Wait for autocomplete suggestions to appear.
    const suggestionLocator = By.css(
        "ul.md-autocomplete-suggestions li, " +
        "md-autocomplete-suggestions li, " +
        "md-virtual-repeat-container li, " +
        "[role='option']"
    );

    await this.driver.wait(async () => {
        const suggestions = await this.driver.findElements(
            suggestionLocator
        );

        for (const suggestion of suggestions) {
            try {
                if (await suggestion.isDisplayed()) {
                    const text = (await suggestion.getText())
                        .replace(/\s+/g, " ")
                        .trim();

                    if (text.length > 0) {
                        return true;
                    }
                }
            } catch (error) {
                // Ignore elements refreshed by AngularJS.
            }
        }

        return false;
    }, 15000, `${fieldName} suggestions did not appear for ${countryName}`);

    // Find the exact matching country.
    const suggestions = await this.driver.findElements(
        suggestionLocator
    );

    let matchingOption = null;

    for (const suggestion of suggestions) {
        try {
            if (!(await suggestion.isDisplayed())) {
                continue;
            }

            const text = (await suggestion.getText())
                .replace(/\s+/g, " ")
                .trim();

            if (
                text.toLowerCase() === countryName.toLowerCase()
            ) {
                matchingOption = suggestion;
                break;
            }
        } catch (error) {
            // Ignore stale suggestion elements.
        }
    }

    if (matchingOption) {
        await matchingOption.click();
    } else {
        // Fallback: use Angular Material autocomplete keyboard selection.
        console.log(
            `Exact option not located. Trying keyboard selection for ${countryName}.`
        );

        await input.sendKeys(Key.ARROW_DOWN);
        await input.sendKeys(Key.ENTER);
    }

    // Verify that the country was actually selected.
    await this.driver.wait(async () => {
        try {
            const currentValue = (
                await input.getAttribute("value") || ""
            ).trim();

            return currentValue.toLowerCase() ===
                countryName.toLowerCase();
        } catch (error) {
            return false;
        }
    }, 15000, `${fieldName} was not selected: ${countryName}`);

    console.log(`${fieldName} selected successfully: ${countryName}`);

    return true;
}





}

module.exports = GlobalSearchPage;
