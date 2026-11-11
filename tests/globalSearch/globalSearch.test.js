
const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");

require("dotenv").config({ override: true });

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const GlobalSearchPage = require("../../pages/GlobalSearchPage");

describe("Processor Portal - Global Search Functional Test Cases", function () {
    this.timeout(120000);

    let driver;
    let loginPage;
    let newPage;
    let globalSearchPage;

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
        "Angola",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Australia",
        "Austria"
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


// it("TC_GS_005 - Iterate top 4 Destination Countries, search documents, and extract results table", async function () {
//     this.timeout(300000);

//     // Top 4 destination countries as shown in the dropdown list
//     const destinationCountries = [
//         "Afghanistan",
//         "Albania",
//         "Algeria",
//         "Andorra"
//     ];

//     const allResults = [];

//     // Step 1: Ensure clean search form state before starting
//     if (typeof globalSearchPage.clearSearchFilters === "function") {
//         await globalSearchPage.clearSearchFilters();
//     }

//     for (const countryName of destinationCountries) {
//         console.log("\n==========================================");
//         console.log(`DESTINATION COUNTRY: ${countryName}`);
//         console.log("==========================================");

//         // Step 2: Select Destination Country
//         await globalSearchPage.selectDestinationCountry(countryName);

//         // Step 3: Click Search button
//         await globalSearchPage.clickSearch();

//         // Step 4: Wait for results to finish loading
//         await globalSearchPage.waitForSearchToFinish(60000);

//         // Step 5: Read total document count
//         const totalDocuments = await globalSearchPage.getTotalDocumentsFound();
//         console.log(`Total Documents Found for ${countryName}: ${totalDocuments}`);

//         // Step 6: Extract visible result table rows
//         const results = await globalSearchPage.getGlobalSearchTableData();
//         console.log(`Current Page Rows Extracted: ${results.length}`);

//         // Step 7: Store test execution result
//         allResults.push({
//             searchedDestinationCountry: countryName,
//             totalDocuments: totalDocuments,
//             documents: results
//         });

//         // Step 8: Validate document count type and value
//         expect(
//             totalDocuments,
//             `Document count should be available for ${countryName}`
//         ).to.be.a("number");

//         expect(totalDocuments).to.be.at.least(0);

//         console.log(`Destination Country search completed: ${countryName}`);

//         // Step 9: Clear search filters before processing the next country
//         if (typeof globalSearchPage.clearSearchFilters === "function") {
//             await globalSearchPage.clearSearchFilters();
//         }
//     }

//     // --------------------------------------------------
//     // FINAL SUMMARY REPORT
//     // --------------------------------------------------

//     console.log("\n========== DESTINATION COUNTRY SEARCH SUMMARY ==========");
//     for (const result of allResults) {
//         console.log(
//             `${result.searchedDestinationCountry}: ${result.totalDocuments} documents`
//         );
//     }
//     console.log("=======================================================");

//     // --------------------------------------------------
//     // DOCUMENT DETAILS TABLE
//     // --------------------------------------------------

//     const tableData = [];

//     for (const result of allResults) {
//         for (const document of result.documents) {
//             tableData.push({
//                 "Order Id": document.orderId,
//                 "Doc Id": document.docId,
//                 "Country": document.country,
//                 "Origin Country": document.originCountry,
//                 "Customer Name": document.customerName
//             });
//         }
//     }

//     console.log("\n========== DOCUMENT DETAILS TABLE ==========");
//     if (tableData.length > 0) {
//         console.table(tableData);
//     } else {
//         console.log("No document rows returned across searched Destination Countries.");
//     }
//     console.log("============================================");
// });

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

it("TC_GS_006 - Verify Description Search", async function () {
    this.timeout(180000);

    const descriptions = ["testing", "Automation"];

    for (const description of descriptions) {
        console.log("\n========== SEARCHING DESCRIPTION ==========");
        console.log(`Description: ${description}`);

        // Step 1: Enter the description and click Search.
        await globalSearchPage.searchByDescription(description);

        // Step 2: Wait for the search to complete.
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 3: Get total documents found.
        const totalDocuments =
            await globalSearchPage.getTotalDocumentsFound();

        console.log(`Total Documents Found: ${totalDocuments}`);

        // Step 4: Handle the no-data scenario.
        if (totalDocuments === 0) {
            const noDataMessage =
                await globalSearchPage.getNoDataMessage();

            console.log(`No Data Message: ${noDataMessage}`);

            expect(noDataMessage.toLowerCase()).to.include(
                "data not exist"
            );

            console.log(
                `No documents found for Description: ${description}`
            );

            continue;
        }

        // Step 5: Verify the results table is displayed.
        const resultsTable = await globalSearchPage.waitForVisible(
            globalSearchPage.resultsTable,
            60000
        );

        expect(await resultsTable.isDisplayed()).to.equal(true);

        // Step 6: Get current page row count.
        const currentPageRows =
            await globalSearchPage.getCurrentPageRowCount();

        // Step 7: Get total page count.
        const totalPages =
            await globalSearchPage.getTotalPageCount();

        // Step 8: Display summary like TC_GS_002.
        console.log("\n========== GLOBAL SEARCH RESULTS ==========");
        console.log(`Description       : ${description}`);
        console.log(`Total Documents    : ${totalDocuments}`);
        console.log(`Current Page Rows  : ${currentPageRows}`);
        console.log(`Total Pages        : ${totalPages}`);
        console.log("===========================================\n");

        // Step 9: Validate result counts.
        expect(totalDocuments).to.be.greaterThan(0);
        expect(currentPageRows).to.be.greaterThan(0);
        // expect(currentPageRows).to.be.at.most(totalDocuments);
        // expect(totalDocuments).to.be.greaterThan(0);
        expect(currentPageRows).to.be.at.most(15);
        expect(totalPages).to.be.greaterThan(0);

        console.log(
            `Description search completed successfully: ${description}`
        );

        // Step 10: Clear only the Description field.
        await globalSearchPage.clearDescriptionSearch();
    }
});

// --------------------------------------------------
// TC_GS_008 - SEARCH BY MULTIPLE DOC IDs
// --------------------------------------------------


// it("TC_GS_007 - Search by Doc IDs and verify matching results", async function () {
//     this.timeout(300000);

//     const docIds = ["99974", "99977", "99980"];
//     const allResults = [];

//     for (const docId of docIds) {
//         console.log(`\n========== SEARCHING DOC ID: ${docId} ==========`);

//         // Clear the previous search before starting the next one.
//         await globalSearchPage.clearSearchFilters();

//         // searchByDocId() should enter the Doc ID and click Search.
//         await globalSearchPage.searchByDocId(docId);

//         // Wait until the search results finish loading.
//         await globalSearchPage.waitForSearchToFinish(60000);

//         // Read the total number of matching documents.
//         const totalDocuments =
//             await globalSearchPage.getTotalDocumentsFound();

//         console.log(`Total Documents Found: ${totalDocuments}`);

//         // Read the currently displayed result rows.
//         const results =
//             await globalSearchPage.getGlobalSearchTableData();

//         console.log(`Current Page Rows: ${results.length}`);

//         // Validate the count.
//         expect(totalDocuments).to.be.a("number");
//         expect(totalDocuments).to.be.at.least(0);

//         // If results exist, verify that each row has the searched Doc ID.
//         if (totalDocuments > 0) {
//             expect(results.length).to.be.greaterThan(0);

//             for (const document of results) {
//                 expect(
//                     String(document.docId).trim(),
//                     `Doc ID mismatch for searched Doc ID ${docId}`
//                 ).to.equal(docId);
//             }
//         }

//         // Store results for the final table.
//         allResults.push({
//             searchedDocId: docId,
//             totalDocuments,
//             documents: results
//         });

//         console.log(`Doc ID ${docId} search completed.`);
//     }

//     // --------------------------------------------------
//     // FINAL SUMMARY
//     // --------------------------------------------------

//     console.log("\n========== DOC ID SEARCH SUMMARY ==========");

//     for (const result of allResults) {
//         console.log(
//             `Doc ID ${result.searchedDocId}: ` +
//             `${result.totalDocuments} documents`
//         );
//     }

//     console.log("============================================");

//     // --------------------------------------------------
//     // PRINT DOCUMENT DETAILS TABLE
//     // --------------------------------------------------

//     const tableData = [];

//     for (const result of allResults) {
//         for (const document of result.documents) {
//             tableData.push({
//                 "Order ID": document.orderId,
//                 "Doc ID": document.docId,
//                 "Country": document.country,
//                 "Origin Country": document.originCountry,
//                 "Customer Name": document.customerName,
//                 "Contact Person": document.contactPerson,
//                 "Document Type": document.documentType
//             });
//         }
//     }

//     console.log("\n========== DOC ID SEARCH RESULTS TABLE ==========");

//     if (tableData.length > 0) {
//         console.table(tableData);
//     } else {
//         console.log("No matching document rows were extracted.");
//     }

//     console.log("=================================================");
// });

it("TC_GS_007 - Verify user can search documents by Doc Id", async function () {
    this.timeout(300000);

    const docIdsToSearch = ["99974", "99977", "99980"];
    const allResults = [];

    // Step 1: Ensure clean form state before starting
    if (typeof globalSearchPage.clearSearchFilters === "function") {
        await globalSearchPage.clearSearchFilters();
    }

    for (const docId of docIdsToSearch) {
        console.log("\n==========================================");
        console.log(`SEARCHING DOC ID: ${docId}`);
        console.log("==========================================");

        // Step 2: Enter Doc Id in input field
        await globalSearchPage.enterDocId(docId);

        // Step 3: Click Search button
        await globalSearchPage.clickSearch();

        // Step 4: Wait for loading spinner to clear
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 5: Read total document count
        const totalDocuments = await globalSearchPage.getTotalDocumentsFound();
        console.log(`Total Documents Found for Doc Id (${docId}): ${totalDocuments}`);

        // Step 6: Extract visible result table rows
        const results = await globalSearchPage.getDocIdSearchResults();
        console.log(`Current Page Rows Extracted: ${results.length}`);

        // Step 7: Record search results
        allResults.push({
            searchedDocId: docId,
            totalDocuments: totalDocuments,
            documents: results
        });

        // Step 8: Assertions
        expect(
            totalDocuments,
            `Document count should be a valid number for Doc Id: ${docId}`
        ).to.be.a("number");

        expect(totalDocuments).to.be.at.least(0);

        // If records were found, verify the Doc Id in table rows
        if (totalDocuments > 0 && results.length > 0) {
            for (const docRow of results) {
                expect(
                    docRow.docId,
                    `Doc Id mismatch for Order ID ${docRow.orderId}`
                ).to.equal(docId);
            }
        }

        console.log(`Doc Id search completed for: ${docId}`);

        // Step 9: Clear form filters before next search
        if (typeof globalSearchPage.clearSearchFilters === "function") {
            await globalSearchPage.clearSearchFilters();
        }
    }

    // --------------------------------------------------
    // FINAL SUMMARY REPORT
    // --------------------------------------------------

    console.log("\n========== DOC ID SEARCH SUMMARY ==========");
    for (const result of allResults) {
        console.log(
            `Doc Id ${result.searchedDocId}: ${result.totalDocuments} documents`
        );
    }
    console.log("===========================================");

    // --------------------------------------------------
    // DOCUMENT DETAILS TABLE OUTPUT
    // --------------------------------------------------

    const tableData = [];

    for (const result of allResults) {
        for (const document of result.documents) {
            tableData.push({
                "Order Id": document.orderId,
                "Doc Id": document.docId,
                "Country": document.country,
                "Origin Country": document.originCountry,
                "Customer Name": document.customerName,
                "Contact Person": document.contactPerson,
                "Document Type": document.documentType
            });
        }
    }

    console.log("\n========== DOCUMENT DETAILS TABLE ==========");
    if (tableData.length > 0) {
        console.table(tableData);
    } else {
        console.log("No document rows returned across searched Doc Ids.");
    }
    console.log("============================================");
});

it("TC_GS_008 - Verify user can search documents by Order Id", async function () {
    this.timeout(300000);

    const orderIdsToSearch = ["263199", "263185", "263160"];
    const allResults = [];

    // Step 1: Ensure clean form state before starting
    if (typeof globalSearchPage.clearSearchFilters === "function") {
        await globalSearchPage.clearSearchFilters();
    }

    for (const orderId of orderIdsToSearch) {
        console.log("\n==========================================");
        console.log(`SEARCHING ORDER ID: ${orderId}`);
        console.log("==========================================");

        // Step 2: Enter Order Id in input field
        await globalSearchPage.enterOrderId(orderId);

        // Step 3: Click Search button
        await globalSearchPage.clickSearch();

        // Step 4: Wait for search execution to complete
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 5: Get total document count
        const totalDocuments = await globalSearchPage.getTotalDocumentsFound();
        console.log(`Total Documents Found for Order Id (${orderId}): ${totalDocuments}`);

        // Step 6: Extract result rows from table grid
        const results = await globalSearchPage.getOrderIdSearchResults();
        console.log(`Current Page Rows Extracted: ${results.length}`);

        // Step 7: Store test results
        allResults.push({
            searchedOrderId: orderId,
            totalDocuments: totalDocuments,
            documents: results
        });

        // Step 8: Assertions
        expect(
            totalDocuments,
            `Document count should be a valid number for Order Id: ${orderId}`
        ).to.be.a("number");

        expect(totalDocuments).to.be.at.least(0);

        // Verify Order Id in result table if records are returned
        if (totalDocuments > 0 && results.length > 0) {
            for (const docRow of results) {
                expect(
                    docRow.orderId,
                    `Order Id mismatch for searched Order ID ${orderId}`
                ).to.equal(orderId);
            }
        }

        console.log(`Order Id search completed for: ${orderId}`);

        // Step 9: Clear search filters before next iteration
        if (typeof globalSearchPage.clearSearchFilters === "function") {
            await globalSearchPage.clearSearchFilters();
        }
    }

    // --------------------------------------------------
    // FINAL SUMMARY REPORT
    // --------------------------------------------------

    console.log("\n========== ORDER ID SEARCH SUMMARY ==========");
    for (const result of allResults) {
        console.log(
            `Order Id ${result.searchedOrderId}: ${result.totalDocuments} documents`
        );
    }
    console.log("=============================================");

    // --------------------------------------------------
    // DOCUMENT DETAILS TABLE OUTPUT
    // --------------------------------------------------

    const tableData = [];

    for (const result of allResults) {
        for (const document of result.documents) {
            tableData.push({
                "Order Id": document.orderId,
                "Doc Id": document.docId,
                "Country": document.country,
                "Origin Country": document.originCountry,
                "Customer Name": document.customerName,
                "Contact Person": document.contactPerson,
                "Document Type": document.documentType
            });
        }
    }

    console.log("\n========== DOCUMENT DETAILS TABLE ==========");
    if (tableData.length > 0) {
        console.table(tableData);
    } else {
        console.log("No document rows returned across searched Order Ids.");
    }
    console.log("============================================");
});

it("TC_GS_009 - Verify user can search documents by Customer Reference", async function () {
    this.timeout(300000);

    const customerReferencesToSearch = [
        "Customer Reference Testing",
        "Customer ZReferencen AFG",
        "Reference 2"
    ];
    const allResults = [];

    // Step 1: Ensure clean form state before starting
    if (typeof globalSearchPage.clearSearchFilters === "function") {
        await globalSearchPage.clearSearchFilters();
    }

    for (const referenceText of customerReferencesToSearch) {
        console.log("\n==========================================");
        console.log(`SEARCHING CUSTOMER REFERENCE: ${referenceText}`);
        console.log("==========================================");

        // Step 2: Enter Customer Reference in input field
        await globalSearchPage.enterCustomerReference(referenceText);

        // Step 3: Click Search button
        await globalSearchPage.clickSearch();

        // Step 4: Wait for search execution to complete
        await globalSearchPage.waitForSearchToFinish(60000);

        // Step 5: Read total document count
        const totalDocuments = await globalSearchPage.getTotalDocumentsFound();
        console.log(`Total Documents Found for Customer Reference (${referenceText}): ${totalDocuments}`);

        // Step 6: Extract result rows from table grid
        const results = await globalSearchPage.getCustomerReferenceSearchResults();
        console.log(`Current Page Rows Extracted: ${results.length}`);

        // Step 7: Store test results
        allResults.push({
            searchedReference: referenceText,
            totalDocuments: totalDocuments,
            documents: results
        });

        // Step 8: Assertions
expect(
    totalDocuments,
    `Document count should be a valid number for Customer Reference: ${referenceText}`
).to.be.a("number");

expect(totalDocuments).to.be.at.least(0);

// Verify results when documents are found
if (totalDocuments > 0 && results.length > 0) {
    for (const docRow of results) {
        // Assert orderId exists for returned record
        expect(docRow.orderId, "Order ID should be present").to.not.be.empty;

        // Verify Customer Reference if rendered in the visible row cell
        if (docRow.customerReference) {
            expect(
                docRow.customerReference.toLowerCase(),
                `Customer Reference mismatch for Order ID ${docRow.orderId}`
            ).to.include(referenceText.toLowerCase());
        }
    }
}

        console.log(`Customer Reference search completed for: ${referenceText}`);

        // Step 9: Clear search filters before next iteration
        if (typeof globalSearchPage.clearSearchFilters === "function") {
            await globalSearchPage.clearSearchFilters();
        }
    }

    // --------------------------------------------------
    // FINAL SUMMARY REPORT
    // --------------------------------------------------

    console.log("\n========== CUSTOMER REFERENCE SEARCH SUMMARY ==========");
    for (const result of allResults) {
        console.log(
            `Customer Reference "${result.searchedReference}": ${result.totalDocuments} documents`
        );
    }
    console.log("=======================================================");

    // --------------------------------------------------
    // DOCUMENT DETAILS TABLE OUTPUT
    // --------------------------------------------------

    const tableData = [];

    for (const result of allResults) {
        for (const document of result.documents) {
            tableData.push({
                "Order Id": document.orderId,
                "Doc Id": document.docId,
                "Country": document.country,
                "Origin Country": document.originCountry,
                "Customer Name": document.customerName,
                "Contact Person": document.contactPerson,
                "Document Type": document.documentType,
                "Customer Reference": document.customerReference
            });
        }
    }

    console.log("\n========== DOCUMENT DETAILS TABLE ==========");
    if (tableData.length > 0) {
        console.table(tableData);
    } else {
        console.log("No document rows returned across searched Customer References.");
    }
    console.log("============================================");
});

it("TC_GS_010 - Verify user can search documents by Invoice Reference", async function () {
    this.timeout(300000);

    const invoiceReferencesToSearch = ["Sample Doc", "ABC123", "jhasdjavsjdasd"];
    const allResults = [];

    // Step 1: Ensure clean form state before starting
    if (typeof globalSearchPage.clearSearchFilters === "function") {
        await globalSearchPage.clearSearchFilters();
    }

    for (const referenceText of invoiceReferencesToSearch) {
        console.log("\n==========================================");
        console.log(`SEARCHING INVOICE REFERENCE: ${referenceText}`);
        console.log("==========================================");

        // Step 2: Enter Invoice Reference in input field
        await globalSearchPage.enterInvoiceReference(referenceText);

        // Step 3: Click Search button
        await globalSearchPage.clickSearch();

        // Step 4: Allow brief moment for Angular network call/toast trigger
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 5: Check if warning toast ("Data Not Exist") appeared
        const errorMessage = await globalSearchPage.getToastErrorMessage();

        let totalDocuments = 0;
        let results = [];

        if (errorMessage) {
            // SCENARIO A: Invalid Search (Toast appears)
            console.log(`Invalid reference search detected. Toast message: "${errorMessage}"`);
        } else {
            // SCENARIO B: Valid Search (Wait for grid to finish loading)
            if (typeof globalSearchPage.waitForSearchToFinish === "function") {
                await globalSearchPage.waitForSearchToFinish(30000);
            }
            
            totalDocuments = await globalSearchPage.getTotalDocumentsFound();
            console.log(`Total Documents Found for "${referenceText}": ${totalDocuments}`);

            if (totalDocuments > 0) {
                results = await globalSearchPage.getInvoiceReferenceSearchResults();
                console.log(`Table Data Extracted: ${results.length} rows`);
            }
        }

        // Step 6: Store execution summary
        allResults.push({
            searchedReference: referenceText,
            totalDocuments: totalDocuments,
            errorMessage: errorMessage,
            documents: results
        });

        // Step 7: Dynamic Assertions
        if (errorMessage) {
            // Assert invalid search criteria
            expect(errorMessage.toLowerCase(), `Toast should indicate missing data for ${referenceText}`)
                .to.include("data not exist");
        } else {
            // Assert valid search criteria
            expect(totalDocuments, `Document count should be > 0 for valid reference: ${referenceText}`)
                .to.be.greaterThan(0);
            expect(results.length, `Table rows should be extracted for ${referenceText}`)
                .to.be.greaterThan(0);
        }

        console.log(`Invoice Reference search completed for: ${referenceText}`);

        // Step 8: Clear search filters before next iteration
        if (typeof globalSearchPage.clearSearchFilters === "function") {
            await globalSearchPage.clearSearchFilters();
        }
    }

    // --------------------------------------------------
    // FINAL SUMMARY REPORT
    // --------------------------------------------------

    console.log("\n========== INVOICE REFERENCE SEARCH SUMMARY ==========");
    for (const result of allResults) {
        const status = result.errorMessage 
            ? `Warning: "${result.errorMessage}"` 
            : `${result.totalDocuments} documents found`;
        console.log(`Invoice Reference "${result.searchedReference}": ${status}`);
    }
    console.log("======================================================");

    // --------------------------------------------------
    // DOCUMENT DETAILS TABLE OUTPUT
    // --------------------------------------------------

    const tableData = [];

    for (const result of allResults) {
        if (result.documents.length > 0) {
            // Populate extracted table records for valid searches
            for (const document of result.documents) {
                tableData.push({
                    "Searched Ref": result.searchedReference,
                    "Order Id": document.orderId,
                    "Doc Id": document.docId,
                    "Country": document.country,
                    "Origin Country": document.originCountry,
                    "Customer Name": document.customerName,
                    "Contact Person": document.contactPerson,
                    "Document Type": document.documentType,
                    "Invoice Reference": document.invoiceReference || result.searchedReference,
                    "Status / Error": "Data Available"
                });
            }
        } else {
            // Populate "No Found / 0" and toast error when no data exists
            tableData.push({
                "Searched Ref": result.searchedReference,
                "Order Id": "No Found / 0",
                "Doc Id": "No Found / 0",
                "Country": "No Found / 0",
                "Origin Country": "No Found / 0",
                "Customer Name": "No Found / 0",
                "Contact Person": "No Found / 0",
                "Document Type": "No Found / 0",
                "Invoice Reference": "No Found / 0",
                "Status / Error": result.errorMessage || "Data Not Exist"
            });
        }
    }

    console.log("\n========== DOCUMENT DETAILS TABLE ==========");
    console.table(tableData);
    console.log("============================================");
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
// TC_GS_DATE_001 - SEARCH BY FROM DATE
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




});
