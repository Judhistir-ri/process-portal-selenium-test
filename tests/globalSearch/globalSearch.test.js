
const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ override: true });

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const GlobalSearchPage = require("../../pages/GlobalSearchPage");

// --------------------------------------------------
// WAIT FOR EXCEL DOWNLOAD
// --------------------------------------------------

async function waitForExcelDownload(
    downloadDir,
    existingFiles = [],
    timeout = 90000
) {
    console.log("Waiting for Excel file download...");

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {

        const files = await fs.promises.readdir(downloadDir);

        // Check for an Excel file.
        const excelFiles = files.filter(file =>
            /\.(xlsx|xls)$/i.test(file) &&
            !existingFiles.includes(file)
        );

        // Check whether Chrome is still downloading.
        const downloadingFiles = files.filter(file =>
            file.endsWith(".crdownload")
        );

        if (excelFiles.length > 0 && downloadingFiles.length === 0) {

            const downloadedFile = excelFiles
                .map(file => ({
                    name: file,
                    fullPath: path.join(downloadDir, file)
                }))
                .sort((a, b) => {
                    return fs.statSync(b.fullPath).mtimeMs -
                           fs.statSync(a.fullPath).mtimeMs;
                })[0];

            const stats = await fs.promises.stat(
                downloadedFile.fullPath
            );

            expect(stats.size).to.be.greaterThan(0);

            console.log("Excel file downloaded successfully.");
            console.log(`File Name: ${downloadedFile.name}`);
            console.log(`File Size: ${stats.size} bytes`);

            return downloadedFile;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(
        `Excel download failed. No completed Excel file found within ${timeout}ms.`
    );
}

describe("Processor Portal - Global Search Functional Test Cases", function () {
    this.timeout(120000);

    let driver;
    let loginPage;
    let newPage;
    let globalSearchPage;


async function runGlobalSearchScenarios({
    testCaseName,
    searchFieldName,
    searchValues,
    enterSearchValue,
    getSearchResults,
    verifyResult
}) {
    const allResults = [];

    for (const searchValue of searchValues) {
        console.log("\n==========================================");
        console.log(`${testCaseName}: ${searchFieldName}`);
        console.log(`Searching Value: ${searchValue}`);
        console.log("==========================================");

        // Clear previous search filters.
        await globalSearchPage.clearSearchFilters();

        // Enter the search value.
        await enterSearchValue(searchValue);

        // Click Search.
        await globalSearchPage.clickSearch();

        // Wait for results OR no-data response.
        const searchStatus =
            await globalSearchPage.waitForSearchToFinish(60000);

        // Read document count.
        const totalDocuments =
            await globalSearchPage.getTotalDocumentsFound();

        let results = [];
        let errorMessage = "";
        let status = "";

        console.log(`Search Value     : ${searchValue}`);
        console.log(`Total Documents  : ${totalDocuments}`);
        console.log(`Search Status    : ${searchStatus}`);

        expect(totalDocuments).to.be.a("number");
        expect(totalDocuments).to.be.at.least(0);

        // ------------------------------------------
        // SCENARIO 1: NO DOCUMENTS FOUND
        // ------------------------------------------

        if (totalDocuments === 0 || searchStatus === "NO_DATA") {
            status = "NO DATA";

            console.log("No matching documents found.");

            // The toast is temporary, so it may already have disappeared.
            errorMessage =
                await globalSearchPage.getToastErrorMessage() || "";

            if (errorMessage) {
                console.log(`Application Message: ${errorMessage}`);

                expect(errorMessage.toLowerCase()).to.include(
                    "data not exist"
                );
            } else {
                console.log(
                    "No-data scenario verified using 0 Documents found."
                );
            }

            results = [];

        } else {

            // ------------------------------------------
            // SCENARIO 2: DOCUMENTS FOUND
            // ------------------------------------------

            status = "PASS";

            expect(totalDocuments).to.be.greaterThan(0);

            // Extract result rows only when documents exist.
            results = await getSearchResults();

            console.log(`Current Page Rows: ${results.length}`);

            expect(
                results.length,
                `No table rows extracted for ${searchValue}`
            ).to.be.greaterThan(0);

            // Verify returned records against the search value.
            if (typeof verifyResult === "function") {
                for (const document of results) {
                    verifyResult(document, searchValue);
                }
            }

            expect(results.length).to.be.at.most(totalDocuments);
        }

        // Store each search result.
        allResults.push({
            searchedValue: searchValue,
            totalDocuments,
            status,
            errorMessage,
            documents: results
        });

        console.log(
            `${searchFieldName} search completed: ${searchValue} - ${status}`
        );
    }

    // ------------------------------------------
    // FINAL SUMMARY
    // ------------------------------------------

    console.log(`\n========== ${testCaseName} SUMMARY ==========`);

    for (const result of allResults) {
        console.log(
            `${result.searchedValue} | ` +
            `Documents: ${result.totalDocuments} | ` +
            `Status: ${result.status}`
        );
    }

    console.log("============================================");

    // ------------------------------------------
    // DOCUMENT DETAILS TABLE
    // ------------------------------------------

    const tableData = [];

    for (const result of allResults) {
        for (const document of result.documents) {
            tableData.push({
                "Searched Value": result.searchedValue,
                "Order Id": document.orderId || "",
                "Doc Id": document.docId || "",
                "Country": document.country || "",
                "Origin Country": document.originCountry || "",
                "Customer Name": document.customerName || "",
                "Contact Person": document.contactPerson || "",
                "Document Type": document.documentType || "",
                "Customer Reference": document.customerReference || "",
                "Invoice Reference": document.invoiceReference || ""
            });
        }
    }

    console.log("\n========== DOCUMENT DETAILS TABLE ==========");

    if (tableData.length > 0) {
        console.table(tableData);
    } else {
        console.log("No matching document rows found.");
    }

    console.log("============================================");
    await globalSearchPage.clearSearchFilters();

console.log(
    `${testCaseName}: Search fields cleared after test completion.`
);

    return allResults;
}


    // --------------------------------------------------
    // SETUP: LOGIN AND OPEN GLOBAL SEARCH
    // --------------------------------------------------

    before(async function () {
        this.timeout(150000);

        // Step 1: Initialize WebDriver.
        driver = await getDriver();

        // Step 2: Initialize Page Objects.
        loginPage = new LoginPage(driver);
        newPage = new NewPage(driver);
        globalSearchPage = new GlobalSearchPage(driver);

        // Step 3: Open login page.
        await loginPage.open();

        // Step 4: Login.
        await loginPage.login(
            process.env.EMAIL,
            process.env.PASSWORD
        );

        // Step 5: Wait for New page after login.
        await newPage.waitForPage();

        console.log("Login successful.");

        // Step 6: Click Global Search icon.
        await globalSearchPage.open();

        // Step 7: Verify Global Search page controls.
        await globalSearchPage.verifyPageLoaded();

        console.log("Global Search setup completed successfully.");
    });

    // --------------------------------------------------
    // TEARDOWN
    // --------------------------------------------------
    afterEach(async function () {
        if (globalSearchPage) {
            await globalSearchPage.clearSearchFilters();
        }
    })

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    // --------------------------------------------------
    // TC_GS_001 - VERIFY GLOBAL SEARCH PAGE
    // --------------------------------------------------

    it("TC_GS_001 - Verify Global Search page loads successfully", async function () {
        this.timeout(60000);

        const currentUrl = await driver.getCurrentUrl();

        expect(currentUrl).to.include("/p/completed");

        const searchButton = await globalSearchPage.waitForVisible(
            globalSearchPage.searchButton
        );

        expect(await searchButton.isDisplayed()).to.equal(true);

        const exportButton = await globalSearchPage.waitForVisible(
            globalSearchPage.exportToExcelButton
        );

        expect(await exportButton.isDisplayed()).to.equal(true);
    });

    // --------------------------------------------------
// TC_GS_002 - SEARCH BY CUSTOMER
// --------------------------------------------------

it("TC_GS_002 - Verify user can search documents by customer name", async function () {
    this.timeout(180000);

    // Test multiple customers dynamically.
    const customers = [
        "JudhistirBehera",
        "Subrat KumarDas"
    ];

    for (const customerName of customers) {
        console.log(`\n========== SEARCHING CUSTOMER ==========`);
        console.log(`Customer Name: ${customerName}`);

        // Step 1: Select customer.
        await globalSearchPage.selectCustomer(customerName);

        // Step 2: Click Search.
        await globalSearchPage.clickSearch();

        // Step 3: Wait for search to complete.
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 4: Read total documents found.
        const totalDocuments =
            await globalSearchPage.getTotalDocumentsFound();

        console.log(`Total Documents Found: ${totalDocuments}`);

        // Step 5: Handle both result scenarios.
        if (totalDocuments === 0) {
            console.log(
                `No documents found for customer: ${customerName}`
            );

            // Verify no-results message.
            const noDataMessage =
                await globalSearchPage.getNoDataMessage();

            console.log(`No Data Message: ${noDataMessage}`);

            expect(noDataMessage.toLowerCase()).to.include(
                "data not exist"
            );

            console.log(
                `No-data scenario verified successfully for ${customerName}.`
            );

            continue;
        }

        // Step 6: Verify results table is displayed.
        const resultsTable = await globalSearchPage.waitForVisible(
            globalSearchPage.resultsTable,
            60000
        );

        expect(await resultsTable.isDisplayed()).to.equal(true);

        // Step 7: Get current page row count.
        const currentPageRows =
            await globalSearchPage.getCurrentPageRowCount();

        // Step 8: Get total page count.
        const totalPages =
            await globalSearchPage.getTotalPageCount();

        console.log("\n========== GLOBAL SEARCH RESULTS ==========");
        console.log(`Customer Name       : ${customerName}`);
        console.log(`Total Documents     : ${totalDocuments}`);
        console.log(`Current Page Rows   : ${currentPageRows}`);
        console.log(`Total Pages         : ${totalPages}`);
        console.log("===========================================\n");

        // Step 9: Validate result counts.
        expect(totalDocuments).to.be.greaterThan(0);
        expect(currentPageRows).to.be.greaterThan(0);
        expect(currentPageRows).to.be.at.most(totalDocuments);
        expect(totalPages).to.be.greaterThan(0);

        console.log(
            `Customer search completed successfully for ${customerName}.`
        );
    }
});


it("TC_GS_003 - Verify user can search documents by customer email", async function () {
    this.timeout(180000);

    const userName = "Judhistir Behera";
    const userEmail = "judhistirbeheralaptop@gmail.com";

    console.log("========== SEARCHING CUSTOMER BY EMAIL ==========");
    console.log(`User Name  : ${userName}`);
    console.log(`User Email : ${userEmail}`);

    // Optional: Reset form filters if applicable
    if (typeof globalSearchPage.clearSearchFilters === 'function') {
        await globalSearchPage.clearSearchFilters();
    }

    // Step 1: Select User by Email
    await globalSearchPage.selectUserByEmail(userName, userEmail);

    // Step 2: Click Search
    await globalSearchPage.clickSearch();

    // Step 3: Wait for search execution
    await globalSearchPage.waitForSearchToFinish(60000);

    // Step 4: Read total document count
    const totalDocuments = await globalSearchPage.getTotalDocumentsFound();
    console.log(`Total Documents Found: ${totalDocuments}`);

    // Step 5: Assert documents were returned
    expect(totalDocuments, `No documents were found for user email: ${userEmail}`).to.be.greaterThan(0);

    // Step 6: Verify results table visibility
    const resultsTable = await globalSearchPage.waitForVisible(
        globalSearchPage.resultsTable,
        60000
    );
    expect(await resultsTable.isDisplayed()).to.equal(true);

    // Step 7: Retrieve pagination details
    const currentPageRows = await globalSearchPage.getCurrentPageRowCount();
    const totalPages = await globalSearchPage.getTotalPageCount();

    console.log("\n========== GLOBAL SEARCH RESULTS ==========");
    console.log(`User Name         : ${userName}`);
    console.log(`User Email        : ${userEmail}`);
    console.log(`Total Documents   : ${totalDocuments}`);
    console.log(`Current Page Rows : ${currentPageRows}`);
    console.log(`Total Pages       : ${totalPages}`);
    console.log("===========================================\n");

    // Step 8: Validate pagination consistency
    expect(currentPageRows).to.be.greaterThan(0);
    expect(currentPageRows).to.be.at.most(totalDocuments);
    expect(totalPages).to.be.greaterThan(0);

    console.log(`Customer email search completed successfully for ${userEmail}.`);
});

// --------------------------------------------------
// TC_GS_004 - SEARCH BY ORIGIN COUNTRY
// --------------------------------------------------

// it("TC_GS_004 - Verify documents can be searched by Origin Country",
//     async function () {
//         this.timeout(300000);

//         // First 10 countries shown in the dropdown alphabetically.
//         const originCountries = [
//             "Afghanistan",
//             "Albania",
//             "Algeria",
//             "Andorra",
//             "Angola",
//             "Antigua and Barbuda",
//             "Argentina",
//             "Armenia",
//             "Australia",
//             "Austria"
//         ];

//         const allResults = [];

//         for (const countryName of originCountries) {
//             console.log("\n==========================================");
//             console.log(`ORIGIN COUNTRY: ${countryName}`);
//             console.log("==========================================");

//             // Step 1: Select Origin Country.
//             await globalSearchPage.selectOriginCountry(countryName);

//             // Step 2: Click Search.
//             await globalSearchPage.clickSearch();

//             // Step 3: Wait for results to finish loading.
//             await globalSearchPage.waitForSearchToFinish(60000);

//             // Step 4: Get total document count.
//             const totalDocuments =
//                 await globalSearchPage.getTotalDocumentsFound();

//             console.log(
//                 `Total Documents Found for ${countryName}: ${totalDocuments}`
//             );

//             // Step 5: Read the visible result rows.
//             const results =
//                 await globalSearchPage.getGlobalSearchTableData();

//             // Step 6: Add country and count information.
//             allResults.push({
//                 searchedOriginCountry: countryName,
//                 totalDocuments,
//                 documents: results
//             });

//             console.log(
//                 `Current Page Rows: ${results.length}`
//             );

//             // Step 7: Validate document count.
//             expect(
//                 totalDocuments,
//                 `Document count should be available for ${countryName}`
//             ).to.be.a("number");

//             expect(totalDocuments).to.be.at.least(0);

//             // Step 8: Verify that displayed rows match the searched origin.
//             for (const document of results) {
//                 expect(
//                     document.originCountry.toLowerCase(),
//                     `Origin Country mismatch for Order ID ${document.orderId}`
//                 ).to.equal(countryName.toLowerCase());
//             }

//             console.log(
//                 `Origin Country search completed: ${countryName}`
//             );

//             // Step 9: Clear only the Origin Country filter
//             // before selecting the next country.
//             await globalSearchPage.clearSearchFilters();
//         }

//         // --------------------------------------------------
//         // FINAL SUMMARY
//         // --------------------------------------------------

//         console.log("\n========== ORIGIN COUNTRY SEARCH SUMMARY ==========");

//         for (const result of allResults) {
//             console.log(
//                 `${result.searchedOriginCountry}: ` +
//                 `${result.totalDocuments} documents`
//             );
//         }

//         console.log("==================================================");

//         // --------------------------------------------------
//         // PRINT DOCUMENT DETAILS TABLE
//         // --------------------------------------------------

//         const tableData = [];

//         for (const result of allResults) {
//             for (const document of result.documents) {
//                 tableData.push({
//                     OrderId: document.orderId,
//                     DocId: document.docId,
//                     Country: document.country,
//                     OriginCountry: document.originCountry,
//                     CustomerName: document.customerName
//                 });
//             }
//         }

//         console.log("\n========== DOCUMENT DETAILS ==========");
//         console.table(tableData);
//         console.log("=====================================");
//     }
// );

it("TC_GS_004 - Verify documents can be searched by Origin Country", async function () {
    this.timeout(300000);

    // Top 10 countries shown in the dropdown alphabetically
    const originCountries = [
        "Afghanistan",
        "Albania",
        "Algeria",
        "Andorra",
        // "Angola",
        // "Antigua and Barbuda",
        // "Argentina",
        // "Armenia",
        // "Australia",
        // "Austria"
    ];

    const allResults = [];

    // Ensure initial clean state before starting iteration
    if (typeof globalSearchPage.clearSearchFilters === "function") {
        await globalSearchPage.clearSearchFilters();
    }

    for (const countryName of originCountries) {
        console.log("\n==========================================");
        console.log(`ORIGIN COUNTRY: ${countryName}`);
        console.log("==========================================");

        // Step 1: Select Origin Country.
        await globalSearchPage.selectOriginCountry(countryName);

        // Step 2: Click Search.
        await globalSearchPage.clickSearch();

        // Step 3: Wait for results to finish loading.
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 4: Get total document count.
        const totalDocuments = await globalSearchPage.getTotalDocumentsFound();

        console.log(
            `Total Documents Found for ${countryName}: ${totalDocuments}`
        );

        // Step 5: Read the visible result rows.
        const results = await globalSearchPage.getGlobalSearchTableData();

        console.log(`Current Page Rows Extracted: ${results.length}`);

        // Step 6: Store country and table result information.
        allResults.push({
            searchedOriginCountry: countryName,
            totalDocuments,
            documents: results
        });

        // Step 7: Validate document count type and value.
        expect(
            totalDocuments,
            `Document count should be a valid number for ${countryName}`
        ).to.be.a("number");

        expect(totalDocuments).to.be.at.least(0);

        // Step 8: If documents are found, verify displayed rows match search criteria.
        if (totalDocuments > 0) {
            expect(
                results.length,
                `Table rows should be populated when totalDocuments > 0 for ${countryName}`
            ).to.be.greaterThan(0);

            for (const document of results) {
                expect(
                    document.originCountry.trim().toLowerCase(),
                    `Origin Country mismatch for Order ID ${document.orderId}`
                ).to.equal(countryName.trim().toLowerCase());
            }
        }

        console.log(`Origin Country search completed successfully: ${countryName}`);

        // Step 9: Clear search filters before selecting the next country.
        if (typeof globalSearchPage.clearSearchFilters === "function") {
            await globalSearchPage.clearSearchFilters();
        }
    }

    // --------------------------------------------------
    // FINAL SUMMARY
    // --------------------------------------------------

    console.log("\n========== ORIGIN COUNTRY SEARCH SUMMARY ==========");
    for (const result of allResults) {
        console.log(
            `${result.searchedOriginCountry}: ${result.totalDocuments} documents`
        );
    }
    console.log("==================================================");

    // --------------------------------------------------
    // PRINT DOCUMENT DETAILS TABLE
    // --------------------------------------------------

    const tableData = [];

    for (const result of allResults) {
        for (const document of result.documents) {
            tableData.push({
                "Order Id": document.orderId,
                "Doc Id": document.docId,
                "Country": document.country,
                "Origin Country": document.originCountry,
                "Customer Name": document.customerName
            });
        }
    }

    console.log("\n========== ALL EXTRACTED DOCUMENT DETAILS ==========");
    if (tableData.length > 0) {
        console.table(tableData);
    } else {
        console.log("No document rows extracted across all searched countries.");
    }
    console.log("====================================================");
});


// --------------------------------------------------
// TC_GS_005 - SEARCH BY DESTINATION COUNTRY
// --------------------------------------------------

it("TC_GS_005 - Verify user can search documents by destination country", async function () {
    this.timeout(180000);

    // Test the first 4 destination countries.
    const destinationCountries = [
        "Afghanistan",
        "Albania",
        "Algeria",
        "Andorra"
    ];

    for (const destinationCountry of destinationCountries) {
        console.log("\n========== SEARCHING DESTINATION COUNTRY ==========");
        console.log(`Destination Country: ${destinationCountry}`);

        // Step 1: Select Destination Country.
        await globalSearchPage.selectDestinationCountry(destinationCountry);

        // Step 2: Click Search.
        await globalSearchPage.clickSearch();

        // Step 3: Wait for search to complete.
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 4: Read total documents found.
        const totalDocuments =
            await globalSearchPage.getTotalDocumentsFound();

        console.log(`Total Documents Found: ${totalDocuments}`);

        // Step 5: Handle no-data scenario.
        if (totalDocuments === 0) {
            console.log(
                `No documents found for destination country: ${destinationCountry}`
            );

            const noDataMessage =
                await globalSearchPage.getNoDataMessage();

            console.log(`No Data Message: ${noDataMessage}`);

            expect(noDataMessage.toLowerCase()).to.include(
                "data not exist"
            );

            console.log(
                `No-data scenario verified for ${destinationCountry}.`
            );

            continue;
        }

        // Step 6: Verify results table is displayed.
        const resultsTable = await globalSearchPage.waitForVisible(
            globalSearchPage.resultsTable,
            60000
        );

        expect(await resultsTable.isDisplayed()).to.equal(true);

        // Step 7: Get current page row count.
        const currentPageRows =
            await globalSearchPage.getCurrentPageRowCount();

        // Step 8: Get total page count.
        const totalPages =
            await globalSearchPage.getTotalPageCount();

        // Step 9: Display results like TC_GS_002.
        console.log("\n========== GLOBAL SEARCH RESULTS ==========");
        console.log(`Destination Country : ${destinationCountry}`);
        console.log(`Total Documents     : ${totalDocuments}`);
        console.log(`Current Page Rows   : ${currentPageRows}`);
        console.log(`Total Pages         : ${totalPages}`);
        console.log("===========================================\n");

        // Step 10: Validate result counts.
        expect(totalDocuments).to.be.greaterThan(0);
        expect(currentPageRows).to.be.greaterThan(0);
        expect(currentPageRows).to.be.at.most(totalDocuments);
        expect(totalPages).to.be.greaterThan(0);

        console.log(
            `Destination country search completed successfully for ${destinationCountry}.`
        );
    }
});

// --------------------------------------------------
// TC_GS_006 - SEARCH BY DESCRIPTION
// --------------------------------------------------

it("TC_GS_006 - Verify user can search documents by Description", async function () {
    this.timeout(300000);

    await runGlobalSearchScenarios({
        testCaseName: "TC_GS_006",
        searchFieldName: "Description",

        searchValues: [
            "testing",
            "Automation",
            "InvalidDescription123"
        ],

        enterSearchValue: async (value) => {
            await globalSearchPage.enterText(
                globalSearchPage.descriptionInput,
                value
            );
        },

        getSearchResults: async () => {
            return await globalSearchPage.getGlobalSearchTableData();
        },

        verifyResult: (document, searchedValue) => {
            expect(document.orderId).to.not.be.empty;
            expect(document.docId).to.not.be.empty;
        }
    });
});


it("TC_GS_007 - Verify user can search documents by Doc Id", async function () {
    this.timeout(300000);

    await runGlobalSearchScenarios({
        testCaseName: "TC_GS_007",
        searchFieldName: "Doc Id",

        searchValues: [
            "99974",
            "99977",
            "99980",
            "999999999"
        ],

        enterSearchValue: async (value) => {
            await globalSearchPage.enterDocId(value);
        },

        getSearchResults: async () => {
            return await globalSearchPage.getDocIdSearchResults();
        },

        verifyResult: (document, searchedValue) => {
            expect(
                String(document.docId).trim(),
                `Doc Id mismatch for Order ID ${document.orderId}`
            ).to.equal(String(searchedValue));
        }
    });
});


it("TC_GS_008 - Verify user can search documents by Order Id", async function () {
    this.timeout(300000);

    await runGlobalSearchScenarios({
        testCaseName: "TC_GS_008",
        searchFieldName: "Order Id",

        searchValues: [
            "263199",
            "263185",
            "263160",
            "999999999"
        ],

        enterSearchValue: async (value) => {
            await globalSearchPage.enterOrderId(value);
        },

        getSearchResults: async () => {
            return await globalSearchPage.getOrderIdSearchResults();
        },

        verifyResult: (document, searchedValue) => {
            expect(
                String(document.orderId).trim(),
                `Order Id mismatch for ${searchedValue}`
            ).to.equal(String(searchedValue));
        }
    });
});

it("TC_GS_009 - Verify user can search documents by Customer Reference", async function () {
    this.timeout(300000);

    await runGlobalSearchScenarios({
        testCaseName: "TC_GS_009",
        searchFieldName: "Customer Reference",

        searchValues: [
            "Customer Reference Testing",
            "Customer ZReferencen AFG",
            "Reference 2",
            "InvalidReference123"
        ],

        enterSearchValue: async (value) => {
            await globalSearchPage.enterCustomerReference(value);
        },

        getSearchResults: async () => {
            return await globalSearchPage.getCustomerReferenceSearchResults();
        },

        verifyResult: (document, searchedValue) => {
            expect(document.orderId).to.not.be.empty;

            if (document.customerReference) {
                expect(
                    document.customerReference.toLowerCase(),
                    `Customer Reference mismatch for Order ID ${document.orderId}`
                ).to.include(searchedValue.toLowerCase());
            }
        }
    });
});

it("TC_GS_010 - Verify user can search documents by Invoice Reference", async function () {
    this.timeout(300000);

    const invoiceReferencesToSearch = [
        "Sample Doc",
        "ABC123",
        "jhasdjavsjdasd"
    ];

    const allResults = [];

    for (const referenceText of invoiceReferencesToSearch) {
        console.log("\n==========================================");
        console.log(`SEARCHING INVOICE REFERENCE: ${referenceText}`);
        console.log("==========================================");

        // Step 1: Clear previous search filters.
        await globalSearchPage.clearSearchFilters();

        // Step 2: Enter Invoice Reference.
        await globalSearchPage.enterInvoiceReference(referenceText);

        // Step 3: Click Search.
        await globalSearchPage.clickSearch();

        // Step 4: Wait for either results or no-data response.
        const searchStatus =
            await globalSearchPage.waitForSearchToFinish(60000);

        // Step 5: Get document count.
        const totalDocuments =
            await globalSearchPage.getTotalDocumentsFound();

        let results = [];
        let errorMessage = "";

        console.log(`Invoice Reference : ${referenceText}`);
        console.log(`Total Documents   : ${totalDocuments}`);
        console.log(`Search Status     : ${searchStatus}`);

        if (totalDocuments === 0 || searchStatus === "NO_DATA") {
            // Scenario A: No matching invoice reference.
            console.log("No matching documents found.");

            errorMessage =
                await globalSearchPage.getToastErrorMessage();

            if (errorMessage) {
                console.log(`Application Message: ${errorMessage}`);

                expect(errorMessage.toLowerCase()).to.include(
                    "data not exist"
                );
            } else {
                console.log(
                    "No-data response verified through the document count."
                );

                expect(totalDocuments).to.equal(0);
            }

            allResults.push({
                searchedReference: referenceText,
                totalDocuments: 0,
                status: "NO DATA",
                errorMessage,
                documents: []
            });

        } else {
            // Scenario B: Matching documents are available.
            expect(totalDocuments).to.be.greaterThan(0);

            results =
                await globalSearchPage.getInvoiceReferenceSearchResults();

            console.log(`Extracted Rows: ${results.length}`);

            expect(
                results.length,
                `Results should be available for ${referenceText}`
            ).to.be.greaterThan(0);

            allResults.push({
                searchedReference: referenceText,
                totalDocuments,
                status: "PASS",
                errorMessage: "",
                documents: results
            });
        }

        console.log(
            `Invoice Reference search completed: ${referenceText}`
        );
    }

    // Final Summary
    console.log("\n========== INVOICE REFERENCE SEARCH SUMMARY ==========");

    for (const result of allResults) {
        console.log(
            `Reference: ${result.searchedReference} | ` +
            `Documents: ${result.totalDocuments} | ` +
            `Status: ${result.status}`
        );
    }

    console.log("======================================================");

    // Display available document details.
    const tableData = [];

    for (const result of allResults) {
        for (const document of result.documents) {
            tableData.push({
                "Searched Reference": result.searchedReference,
                "Order Id": document.orderId,
                "Doc Id": document.docId,
                "Country": document.country,
                "Origin Country": document.originCountry,
                "Customer Name": document.customerName,
                "Invoice Reference":
                    document.invoiceReference || result.searchedReference
            });
        }
    }

    console.log("\n========== INVOICE REFERENCE DOCUMENT DETAILS ==========");

    if (tableData.length > 0) {
        console.table(tableData);
    } else {
        console.log("No matching invoice reference documents were found.");
    }

    console.log("========================================================");
});


// --------------------------------------------------
// TC_GS_011 - SEARCH BY CATEGORY
// --------------------------------------------------

// it("TC_GS_011 - Verify user can search documents by Select Category dropdown", async function () {
//     this.timeout(300000);

//     const categoriesToSearch = [
//         "Federal Government",
//         "General",
//         "Shipping/Commercial",
//         "International",
//         "Visa",
//         "Translation",
//         "Notary",
//         "Dispatch"
//     ];

//     const summaryReport = [];

//     // Step 1: Ensure clean form state & wait for any initial spinner to clear
//     if (typeof globalSearchPage.clearSearchFilters === "function") {
//         await globalSearchPage.clearSearchFilters();
//     }
//     await globalSearchPage.waitForSpinnerToDisappear(30000);

//     for (const categoryName of categoriesToSearch) {
//         console.log("\n==========================================");
//         console.log(`CATEGORY SEARCH: ${categoryName}`);
//         console.log("==========================================");

//         // Step 2: Select Category (includes built-in spinner wait)
//         await globalSearchPage.selectCategory(categoryName);

//         // Step 3: Click Search button
//         await globalSearchPage.clickSearch();

//         // Step 4: Wait explicitly for search loading spinner to finish
//         await globalSearchPage.waitForSpinnerToDisappear(45000);

//         // Step 5: Check if warning toast ("Data Not Exist") appears
//         const errorMessage = await globalSearchPage.getToastErrorMessage();

//         // Step 6: Read total document count
//         const totalDocuments = await globalSearchPage.getTotalDocumentsFound();
//         console.log(`Total Documents Found for "${categoryName}": ${totalDocuments}`);

//         // Step 7: Calculate total pages (10 rows per page)
//         const totalPages = await globalSearchPage.getTotalPageCount(totalDocuments, 10);
//         console.log(`Calculated Total Pages: ${totalPages}`);

//         let page1RowsCount = 0;

//         if (totalDocuments > 0 && !errorMessage) {
//             // Wait for grid rendering and read table rows
//             if (typeof globalSearchPage.waitForSearchToFinish === "function") {
//                 await globalSearchPage.waitForSearchToFinish(30000);
//             }
//             const tableRows = await globalSearchPage.getGlobalSearchTableData();
//             page1RowsCount = tableRows.length;
//             console.log(`Page 1 Rows Extracted: ${page1RowsCount}`);
//         } else {
//             console.log(`No table present. Warning Toast / State: "${errorMessage || 'Data Not Exist'}"`);
//         }

//         // Step 8: Store iteration metrics
//         summaryReport.push({
//             "Category Name": categoryName,
//             "Total Documents": totalDocuments,
//             "Total Pages": totalPages,
//             "Page 1 Rows": page1RowsCount,
//             "Status / Error": totalDocuments > 0 ? "Success" : (errorMessage || "Data Not Exist")
//         });

//         // Step 9: Assert document count format
//         expect(totalDocuments, `Document count should be valid for Category: ${categoryName}`).to.be.a("number");
//         expect(totalDocuments).to.be.at.least(0);

//         console.log(`Category search completed for: ${categoryName}`);

//         // Step 10: Clear search filters and wait for loader before next loop
//         if (typeof globalSearchPage.clearSearchFilters === "function") {
//             await globalSearchPage.clearSearchFilters();
//         }
//         await globalSearchPage.waitForSpinnerToDisappear(30000);
//     }

//     // --------------------------------------------------
//     // FINAL CATEGORY SEARCH SUMMARY TABLE
//     // --------------------------------------------------

//     console.log("\n=================== CATEGORY SEARCH SUMMARY REPORT ===================");
//     console.table(summaryReport);
//     console.log("======================================================================");

//     expect(summaryReport.length).to.equal(categoriesToSearch.length);
// });


// --------------------------------------------------
// TC_GS_DATE_012 - SEARCH BY FROM DATE
// --------------------------------------------------

it("TC_GS_012 - Verify user can search documents by From Date", async function () {
    this.timeout(180000);

    // 05/11/2026 = 5 November 2026
    const fromDate = "2026-11-05";

    console.log("\n========== SEARCH BY FROM DATE ==========");
    console.log(`From Date: 05/11/2026`);

    // Step 1: Select From Date.
    await globalSearchPage.selectFromDate(fromDate);

    // Step 2: Verify selected date.
    const selectedDate = await driver.findElement(
        globalSearchPage.fromDateInput
    );

    const actualDate = await selectedDate.getAttribute("value");

    expect(actualDate).to.equal(fromDate);

    console.log(`Selected From Date: ${actualDate}`);

    // Step 3: Click Search.
    await globalSearchPage.clickSearch();

    // Step 4: Wait for search results to load.
    await globalSearchPage.waitForSearchToFinish(60000);

    // Step 5: Get total documents found.
    const totalDocuments =
        await globalSearchPage.getTotalDocumentsFound();

    console.log(`Total Documents Found: ${totalDocuments}`);

    // Step 6: Get current page row count.
    const currentPageRows =
        await globalSearchPage.getCurrentPageRowCount();

    // Step 7: Get total page count.
    const totalPages =
        await globalSearchPage.getTotalPageCount();

    // Step 8: Display search summary.
    console.log("\n========== FROM DATE SEARCH RESULTS ==========");
    console.log(`From Date          : 05/11/2026`);
    console.log(`Total Documents    : ${totalDocuments}`);
    console.log(`Current Page Rows  : ${currentPageRows}`);
    console.log(`Total Pages        : ${totalPages}`);
    console.log("==============================================\n");

    // Step 9: Validate search results.
    expect(totalDocuments).to.be.at.least(0);
    expect(totalPages).to.be.greaterThan(0);

    if (totalDocuments > 0) {
        expect(currentPageRows).to.be.greaterThan(0);

        const resultsTable = await globalSearchPage.waitForVisible(
            globalSearchPage.resultsTable,
            60000
        );

        expect(await resultsTable.isDisplayed()).to.equal(true);

        console.log("Documents found successfully for the selected From Date.");
    } else {
        const noDataMessage =
            await globalSearchPage.getNoDataMessage();

        console.log(`No Data Message: ${noDataMessage}`);

        expect(noDataMessage.toLowerCase()).to.include(
            "data not exist"
        );

        console.log("No documents found for the selected From Date.");
    }
});

// --------------------------------------------------
// TC_GS_013 - SEARCH BY FROM DATE AND TO DATE
// --------------------------------------------------

it("TC_GS_013 - Verify user can search documents by From Date and To Date", async function () {
    this.timeout(180000);

    const fromDate = "2026-11-01";
    const toDate = "2026-11-11";

    console.log("\n========== SEARCH BY DATE RANGE ==========");
    console.log("From Date: 01/11/2026");
    console.log("To Date  : 11/11/2026");

    // Step 1: Register date fields for cleanup.
    globalSearchPage.trackSearchField(
        globalSearchPage.fromDateInput
    );

    globalSearchPage.trackSearchField(
        globalSearchPage.toDateInput
    );

    // Step 2: Set dates, click Search and wait for results.
    const results = await globalSearchPage.searchByDateRange(
        fromDate,
        toDate
    );

    // Step 3: Verify selected dates.
    const fromElement = await globalSearchPage.waitForVisible(
        globalSearchPage.fromDateInput
    );

    const toElement = await globalSearchPage.waitForVisible(
        globalSearchPage.toDateInput
    );

    const actualFromDate = await fromElement.getAttribute("value");
    const actualToDate = await toElement.getAttribute("value");

    console.log(`Actual From Date: ${actualFromDate}`);
    console.log(`Actual To Date  : ${actualToDate}`);

    expect(actualFromDate).to.equal(fromDate);
    expect(actualToDate).to.equal(toDate);

    // Step 4: Get total documents found.
    const totalDocuments =
        await globalSearchPage.getTotalDocumentsFound();

    console.log(`Total Documents Found: ${totalDocuments}`);

    // Step 5: Get current page row count.
    const currentPageRows =
        await globalSearchPage.getCurrentPageRowCount();

    // Step 6: Get total pages.
    const totalPages =
        await globalSearchPage.getTotalPageCount();

    // Step 7: Display document summary.
    console.log("\n========== DATE RANGE SEARCH RESULTS ==========");
    console.log("From Date          : 01/11/2026");
    console.log("To Date            : 11/11/2026");
    console.log(`Total Documents    : ${totalDocuments}`);
    console.log(`Current Page Rows  : ${currentPageRows}`);
    console.log(`Total Pages        : ${totalPages}`);
    console.log(`Extracted Rows     : ${results.length}`);
    console.log("================================================");

    // Step 8: Validate the search results.
    expect(totalDocuments).to.be.greaterThan(0);
    expect(currentPageRows).to.be.greaterThan(0);
    expect(totalPages).to.be.greaterThan(0);

    // expect(currentPageRows).to.be.at.most(totalDocuments);
    expect(currentPageRows).to.equal(results.length);

expect(
    currentPageRows,
    "Current page rows should not exceed total documents"
).to.be.at.most(totalDocuments);

    console.log(
        "TC_GS_013 passed: Date range search completed successfully."
    );
});



// --------------------------------------------------
// TC_GS_014 - SEARCH BY TRACKING ID
// --------------------------------------------------

it("TC_GS_014 - Verify user can search documents by Tracking Id",
    async function () {

        this.timeout(300000);

        const trackingIds = [
            "Test-track-out-1",
            "invalidTrackid"
        ];

        const allResults = [];

        // Ensure the search form is clean before starting.
        await globalSearchPage.clearSearchFilters();

        for (const trackingId of trackingIds) {

            console.log("\n==========================================");
            console.log(`SEARCHING TRACKING ID: ${trackingId}`);
            console.log("==========================================");

            // Step 1: Clear previous search filters.
            await globalSearchPage.clearSearchFilters();

            // Step 2: Enter Tracking ID.
            await globalSearchPage.enterTrackingId(trackingId);

            // Step 3: Click Search.
            await globalSearchPage.clickSearch();

            // Step 4: Wait for search to complete.
            const searchStatus =
                await globalSearchPage.waitForSearchToFinish(60000);

            // Step 5: Get total document count.
            const totalDocuments =
                await globalSearchPage.getTotalDocumentsFound();

            let currentPageRows = 0;
            let totalPages = 0;
            let errorMessage = "";
            let status = "";
            let documents = [];

            console.log(`Tracking ID       : ${trackingId}`);
            console.log(`Total Documents   : ${totalDocuments}`);
            console.log(`Search Status     : ${searchStatus}`);

            expect(totalDocuments).to.be.a("number");
            expect(totalDocuments).to.be.at.least(0);

            // ------------------------------------------
            // SCENARIO 1: NO DATA FOUND
            // ------------------------------------------

            if (totalDocuments === 0 || searchStatus === "NO_DATA") {

                status = "NO DATA";

                console.log("No matching documents found.");

                // Same error-message handling as TC_GS_010.
                errorMessage =
                    await globalSearchPage.getToastErrorMessage() || "";

                if (errorMessage) {

                    console.log(`Application Message: ${errorMessage}`);

                    expect(errorMessage.toLowerCase()).to.include(
                        "data not exist"
                    );

                } else {

                    console.log(
                        "No-data response verified through document count."
                    );

                    expect(totalDocuments).to.equal(0);
                }

                documents = [];

            } else {

                // ------------------------------------------
                // SCENARIO 2: DOCUMENTS FOUND
                // ------------------------------------------

                status = "PASS";

                expect(totalDocuments).to.be.greaterThan(0);

                // Step 6: Get current page row count.
                currentPageRows =
                    await globalSearchPage.getCurrentPageRowCount();

                // Step 7: Get total page count.
                totalPages =
                    await globalSearchPage.getTotalPageCount();

                // Step 8: Extract visible table rows.
                const rows = await driver.findElements(
                    globalSearchPage.resultsRows
                );

                for (const row of rows) {

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

                    // Tracking ID is column index 11
                    // based on the Global Search table headers.
                    const actualTrackingId = values[11] || "";

                    documents.push({
                        orderId: values[0] || "",
                        docId: values[1] || "",
                        trackingId: actualTrackingId
                    });

                    // Verify each displayed result matches
                    // the searched Tracking ID.
                    expect(
                        actualTrackingId.toLowerCase(),
                        `Tracking ID mismatch for Order ID ${values[0]}`
                    ).to.include(trackingId.toLowerCase());
                }

                // Step 9: Display result information.
                console.log("\n========== GLOBAL SEARCH RESULTS ==========");
                console.log(`Tracking ID       : ${trackingId}`);
                console.log(`Total Documents   : ${totalDocuments}`);
                console.log(`Current Page Rows : ${currentPageRows}`);
                console.log(`Total Pages       : ${totalPages}`);
                console.log("===========================================\n");

                // Step 10: Validate results and pagination.
                expect(currentPageRows).to.be.greaterThan(0);
                expect(currentPageRows).to.be.at.most(totalDocuments);
                expect(totalPages).to.be.greaterThan(0);

                expect(
                    documents.length,
                    "No result rows were extracted."
                ).to.be.greaterThan(0);
            }

            // Step 11: Store search results.
            allResults.push({
                trackingId,
                totalDocuments,
                currentPageRows,
                totalPages,
                status,
                errorMessage,
                documents
            });

            console.log(
                `Tracking ID search completed: ${trackingId} - ${status}`
            );
        }

        // ------------------------------------------
        // FINAL SUMMARY
        // ------------------------------------------

        console.log("\n========== TRACKING ID SEARCH SUMMARY ==========");

        for (const result of allResults) {

            console.log(
                `Tracking ID: ${result.trackingId} | ` +
                `Documents: ${result.totalDocuments} | ` +
                `Current Page Rows: ${result.currentPageRows} | ` +
                `Total Pages: ${result.totalPages} | ` +
                `Status: ${result.status}`
            );
        }

        console.log("================================================");

        // ------------------------------------------
        // DOCUMENT DETAILS TABLE
        // ------------------------------------------

        const tableData = [];

        for (const result of allResults) {

            for (const document of result.documents) {

                tableData.push({
                    "Searched Tracking ID": result.trackingId,
                    "Order ID": document.orderId,
                    "Doc ID": document.docId,
                    "Tracking ID": document.trackingId
                });
            }
        }

        console.log("\n========== TRACKING ID DOCUMENT DETAILS ==========");

        if (tableData.length > 0) {
            console.table(tableData);
        } else {
            console.log("No matching tracking ID documents found.");
        }

        console.log("==================================================");

        // Final cleanup.
        await globalSearchPage.clearSearchFilters();

        console.log("TC_GS_014: Search fields cleared successfully.");
    }
);


// --------------------------------------------------
// TC_GS_015 - EXPORT GLOBAL SEARCH RESULTS TO EXCEL
// --------------------------------------------------

it("TC_GS_015 - Verify user can export Global Search results to Excel",
    async function () {

        this.timeout(240000);

        const customerName = "JudhistirBehera";

        // Use the same download directory configured in driver.js.
        const downloadDir = path.resolve(
            process.cwd(),
            "Downloads"
        );

        // Create the directory if it does not exist.
        await fs.promises.mkdir(downloadDir, {
            recursive: true
        });

        console.log("\n==========================================");
        console.log("TC_GS_015 - EXPORT TO EXCEL");
        console.log("==========================================");

        // --------------------------------------------------
        // STEP 1: CLEAR PREVIOUS SEARCH FILTERS
        // --------------------------------------------------

        await globalSearchPage.clearSearchFilters();

        console.log("Previous search filters cleared.");

        // --------------------------------------------------
        // STEP 2: SELECT CUSTOMER
        // --------------------------------------------------

        console.log(`Selecting Customer: ${customerName}`);

        await globalSearchPage.selectCustomer(customerName);

        console.log("Customer selected successfully.");

        // --------------------------------------------------
        // STEP 3: CLICK SEARCH BUTTON
        // --------------------------------------------------

        await globalSearchPage.clickSearch();

        console.log("Search button clicked.");

        // --------------------------------------------------
        // STEP 4: WAIT FOR SEARCH LOADING TO COMPLETE
        // --------------------------------------------------

        const searchStatus =
            await globalSearchPage.waitForSearchToFinish(60000);

        expect(searchStatus).to.equal("RESULTS");

        console.log("Search loading completed.");

        // --------------------------------------------------
        // STEP 5: GET TOTAL DOCUMENTS FOUND
        // --------------------------------------------------

        const totalDocuments =
            await globalSearchPage.getTotalDocumentsFound();

        console.log(`Total Documents Found: ${totalDocuments}`);

        expect(
            totalDocuments,
            "Documents should be available before exporting."
        ).to.be.greaterThan(0);

        // --------------------------------------------------
        // STEP 6: VERIFY RESULTS TABLE
        // --------------------------------------------------

        const resultsTable =
            await globalSearchPage.waitForVisible(
                globalSearchPage.resultsTable,
                60000
            );

        expect(await resultsTable.isDisplayed()).to.equal(true);

        // --------------------------------------------------
        // STEP 7: GET PAGINATION DETAILS
        // --------------------------------------------------

        const currentPageRows =
            await globalSearchPage.getCurrentPageRowCount();

        const totalPages =
            await globalSearchPage.getTotalPageCount();

        console.log("\n========== SEARCH RESULTS ==========");
        console.log(`Customer Name       : ${customerName}`);
        console.log(`Total Documents     : ${totalDocuments}`);
        console.log(`Current Page Rows   : ${currentPageRows}`);
        console.log(`Total Pages         : ${totalPages}`);
        console.log("====================================");

        expect(currentPageRows).to.be.greaterThan(0);
        expect(currentPageRows).to.be.at.most(totalDocuments);
        expect(totalPages).to.be.greaterThan(0);

        // --------------------------------------------------
        // STEP 8: CAPTURE EXISTING DOWNLOAD FILES
        // --------------------------------------------------

        const existingFiles =
            await fs.promises.readdir(downloadDir);

        console.log(
            `Existing files in Downloads: ${existingFiles.length}`
        );

        // --------------------------------------------------
        // STEP 9: CLICK EXPORT TO EXCEL
        // --------------------------------------------------

        const exportButton =
            await globalSearchPage.waitForVisibleAndEnabled(
                globalSearchPage.exportToExcelButton,
                30000
            );

        expect(await exportButton.isDisplayed()).to.equal(true);

        console.log("Clicking Export to Excel button...");

        await globalSearchPage.exportToExcel();

        console.log("Export to Excel button clicked.");

        // --------------------------------------------------
        // STEP 10: WAIT FOR EXCEL DOWNLOAD
        // --------------------------------------------------

        const downloadedFile = await waitForExcelDownload(
            downloadDir,
            existingFiles,
            90000
        );

        // --------------------------------------------------
        // STEP 11: VERIFY DOWNLOADED FILE
        // --------------------------------------------------

        expect(downloadedFile.name).to.match(/\.(xlsx|xls)$/i);

        expect(
            fs.existsSync(downloadedFile.fullPath)
        ).to.equal(true);

        console.log("\n========== EXPORT SUMMARY ==========");
        console.log(`Customer Name       : ${customerName}`);
        console.log(`Total Documents     : ${totalDocuments}`);
        console.log(`Current Page Rows   : ${currentPageRows}`);
        console.log(`Total Pages         : ${totalPages}`);
        console.log(`Downloaded File     : ${downloadedFile.name}`);
        console.log(`File Location       : ${downloadedFile.fullPath}`);
        console.log("Export Status       : PASS");
        console.log("====================================");

        console.log(
            "TC_GS_015 passed: Excel export completed successfully."
        );
    }
);



});
