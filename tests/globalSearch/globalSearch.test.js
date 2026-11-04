
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

});
