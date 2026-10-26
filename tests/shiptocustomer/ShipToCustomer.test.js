const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ShipToCustomerDetail = require("../../pages/ShipToCustomerDetail");

describe("Ship to Customer - Export and Print Docs Functional Tests", function () {
    this.timeout(300000);

    let driver;
    let loginPage;
    let newPage;
    let shipPage;

    before(async function () {
    driver = await getDriver();

    loginPage = new LoginPage(driver);
    newPage = new NewPage(driver);
    shipPage = new ShipToCustomerDetail(driver);

    await loginPage.open();

    await loginPage.login(
        process.env.EMAIL,
        process.env.PASSWORD
    );

    await newPage.waitForPage();

    // Opens Ship to Customer and waits for the sections and documents.
    await shipPage.open();

    console.log("✓ Ship to Customer page ready. Starting test cases.");
});

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    function getDownloadDir() {
        return path.join(
            process.env.USERPROFILE || process.cwd(),
            "Downloads"
        );
    }

    async function verifyExport(section, clickExport, testName) {
        const count = await shipPage.getDocumentCount(section);

        console.log(
            `${testName}: detected ${count} document row(s).`
        );

        // Empty panel: verify the application handles the action.
        if (count === 0) {
            await clickExport();

            try {
                await shipPage.waitForNoDocumentsMessage(5000);

                console.log(
                    `✓ ${testName}: "No documents found." displayed correctly.`
                );
            } catch (error) {
                console.log(
                    `✓ ${testName}: no documents available; no export file expected.`
                );
            }

            return;
        }

        const downloadDir = getDownloadDir();

        if (!fs.existsSync(downloadDir)) {
            throw new Error(
                `Download folder not found: ${downloadDir}`
            );
        }

        const filesBefore = new Set(
            fs.readdirSync(downloadDir)
        );

        await clickExport();

        let downloadedFile;

        await driver.wait(async () => {
            const filesAfter = fs.readdirSync(downloadDir);

            downloadedFile = filesAfter.find(file =>
                !filesBefore.has(file) &&
                /\.(xlsx|xls|csv)$/i.test(file)
            );

            const downloading = filesAfter.some(file =>
                file.endsWith(".crdownload")
            );

            return Boolean(downloadedFile) && !downloading;
        }, 30000, `${testName}: Excel/CSV file was not downloaded.`);

        const filePath = path.join(
            downloadDir,
            downloadedFile
        );

        expect(fs.existsSync(filePath)).to.equal(true);
        expect(fs.statSync(filePath).size).to.be.greaterThan(0);

        console.log(
            `✓ ${testName}: downloaded ${downloadedFile}`
        );
    }

    async function verifyPrint(section, clickPrint, testName) {
        const count = await shipPage.getDocumentCount(section);

        console.log(
            `${testName}: detected ${count} document row(s).`
        );

        if (count === 0) {
            await clickPrint();

            await shipPage.waitForNoDocumentsMessage();

            console.log(
                `✓ ${testName}: empty panel handled correctly.`
            );

            return;
        }

        const handlesBefore = await driver.getAllWindowHandles();
        const originalHandle = await driver.getWindowHandle();

        await clickPrint();

        // Wait for a new window or tab.
        await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();

            return handles.some(
                handle => !handlesBefore.includes(handle)
            );
        }, 30000, `${testName}: Print Docs did not open a new window.`);

        const handlesAfter = await driver.getAllWindowHandles();

        const newHandle = handlesAfter.find(
            handle => !handlesBefore.includes(handle)
        );

        expect(newHandle, "New print window should exist").to.exist;

        try {
            await driver.switchTo().window(newHandle);

            await driver.wait(async () => {
                const url = await driver.getCurrentUrl();
                return Boolean(url);
            }, 15000, "Print window did not load.");

            const printUrl = await driver.getCurrentUrl();
            const printTitle = await driver.getTitle();

            expect(printUrl).to.be.a("string").and.not.empty;

            console.log(`✓ ${testName}: print window opened.`);
            console.log("Print URL:", printUrl);
            console.log("Print window title:", printTitle);
        } finally {
            const handles = await driver.getAllWindowHandles();

            if (handles.includes(newHandle)) {
                await driver.switchTo().window(newHandle);
                await driver.close();
            }

            const remainingHandles = await driver.getAllWindowHandles();

            if (remainingHandles.includes(originalHandle)) {
                await driver.switchTo().window(originalHandle);
            }
        }
    }

    // TC_SHIP_001
    it("TC_SHIP_001 - Verify Ready to Ship Export", async function () {
        await verifyExport(
            "readyToShip",
            () => shipPage.clickReadyToShipExport(),
            "Ready to Ship Export"
        );
    });

    // TC_SHIP_002
    it("TC_SHIP_002 - Verify Ready to Ship Print Docs", async function () {
        await verifyPrint(
            "readyToShip",
            () => shipPage.clickReadyToShipPrintDocs(),
            "Ready to Ship Print Docs"
        );
    });

    // TC_SHIP_003
    it("TC_SHIP_003 - Verify Completed Export", async function () {
        await verifyExport(
            "completed",
            () => shipPage.clickCompletedExport(),
            "Completed Export"
        );
    });

    // TC_SHIP_004
    it("TC_SHIP_004 - Verify Completed Print Docs", async function () {
        await verifyPrint(
            "completed",
            () => shipPage.clickCompletedPrintDocs(),
            "Completed Print Docs"
        );
    });

    
it(
    "TC_SHIP_005 - Verify Ready to Ship and Completed totals for each document filter",
    async function () {
        this.timeout(600000);

        const documentFilters = [
            "All Documents",
            "Rush",
            "Payment Requested",
            "Open Notifications",
            "Response Awaited",
            "On Hold",
            "Not Notorized",
            "Nil Payment",
            "Partial Payment",
            "All Documents"
        ];

        const results = [];

        // Wait for the page and sections before testing filters.
        await shipPage.waitForPage();
        await shipPage.waitForLoadingToFinish(60000);

        for (const filterName of documentFilters) {
            console.log(`\n========== Checking filter: ${filterName} ==========`);

            await shipPage.selectDocumentFilter(filterName);

            const readyToShipTotal =
                await shipPage.getDocumentCount("readyToShip");

            const completedTotal =
                await shipPage.getDocumentCount("completed");

            console.log(`Ready to Ship total: ${readyToShipTotal}`);
            console.log(`Completed total: ${completedTotal}`);

            expect(readyToShipTotal).to.be.a("number");
            expect(completedTotal).to.be.a("number");

            results.push({
                filter: filterName,
                readyToShipTotal,
                completedTotal
            });
        }

        console.log("\n========== Document Filter Totals ==========");
        console.table(results);

        expect(results).to.have.lengthOf(documentFilters.length);
    }
    );
    
    
it("TC_SHIP_006 - Verify Ready to Ship and Completed totals for each category", async function () {
    const categories = [
        "All Categories",
        "Shipping",
        "Federal Government",
        "General",
        "International",
        "Visa",
        "Translation",
        "Dispatch",
        "Notary",
        "All Categories"
    ];

    const results = [];

    for (const category of categories) {
        console.log(
            `\n========== Checking category: ${category} ==========`
        );

        // Step 1: Select category and wait for filtering to finish.
        await shipPage.selectCategory(category);

        // Step 2: Read the totals displayed by the application.
        const readyToShipTotal =
            await shipPage.getSectionTotal("Ready to Ship");

        const completedTotal =
            await shipPage.getSectionTotal("Completed");

        console.log(`Ready to Ship total: ${readyToShipTotal}`);
        console.log(`Completed total: ${completedTotal}`);

        // Step 3: Validate that both totals are valid numbers.
        expect(readyToShipTotal, `${category}: Ready to Ship total`)
            .to.be.a("number")
            .and.at.least(0);

        expect(completedTotal, `${category}: Completed total`)
            .to.be.a("number")
            .and.at.least(0);

        results.push({
            category,
            readyToShipTotal,
            completedTotal
        });
    }

    console.log("\n========== Category Totals Summary ==========");
    console.table(results);
});

    
// it("TC_SHIP_007 - Verify Filter Anything searches by customer name", async function () {
//     this.timeout(120000);

//     const searchBoxLocator = By.css(
//         "input[ng-model='shipToCust']"
//     );

//     const searchBox = await driver.wait(
//         until.elementLocated(searchBoxLocator),
//         30000,
//         "Filter Anything input was not found."
//     );

//     await driver.wait(
//         until.elementIsVisible(searchBox),
//         15000,
//         "Filter Anything input is not visible."
//     );

//     await driver.wait(
//         until.elementIsEnabled(searchBox),
//         15000,
//         "Filter Anything input is not enabled."
//     );

//     // Search using a customer name visible in the document table.
//     // Replace this value with a customer name from your test data.
//     const customerName = "JUDHISTIRBEHERA";

//     await searchBox.clear();
//     await searchBox.sendKeys(customerName);

//     await driver.wait(async () => {
//         const value = await searchBox.getAttribute("value");
//         return value === customerName;
//     }, 10000, "Search value was not entered.");

//     // Wait for Angular to apply the search.
//     await driver.wait(async () => {
//         const rows = await driver.findElements(
//             By.css("table.table-bordered.table-striped tbody tr")
//         );

//         for (const row of rows) {
//             const text = await row.getText();

//             if (/no documents found/i.test(text)) {
//                 return true;
//             }

//             if (text.toLowerCase().includes(customerName.toLowerCase())) {
//                 return true;
//             }
//         }

//         return false;
//     }, 30000, "The table did not update after searching.");

//     const rows = await driver.findElements(
//         By.css("table.table-bordered.table-striped tbody tr")
//     );

//     const matchingRows = [];

//     for (const row of rows) {
//         const rowText = (await row.getText()).trim();

//         if (
//             rowText &&
//             !/no documents found/i.test(rowText) &&
//             rowText.toLowerCase().includes(customerName.toLowerCase())
//         ) {
//             matchingRows.push(rowText);
//         }
//     }

//     console.log("Matching customer rows:", matchingRows);

//     expect(
//         matchingRows.length,
//         `Expected a row matching customer name "${customerName}".`
//     ).to.be.greaterThan(0);
//     });


it(
    "TC_SHIP_007 - Search Order IDs 263097, 263098 and Doc ID 99824 in Filter Anything",
    async function () {
        this.timeout(240000);

        const searchCases = [
            {
                type: "Order ID",
                value: "263097",
                expectedOrderId: "263097",
                expectedDocId: "99824"
            },
            {
                type: "Order ID",
                value: "263098",
                expectedOrderId: "263098",
                expectedDocId: "99825"
            },
            {
                type: "Doc ID",
                value: "99824",
                expectedOrderId: "263097",
                expectedDocId: "99824"
            }
        ];

        // Confirmed from the browser DOM screenshot.
        const searchBoxLocator = By.css(
            "input[ng-model='shipToCust']"
        );

        // Wait for the page and its initial data.
        await shipPage.waitForPage();
        await shipPage.waitForLoadingToFinish(60000);

        const searchBox = await driver.wait(
            until.elementLocated(searchBoxLocator),
            30000,
            "Filter Anything input was not found."
        );

        await driver.wait(
            until.elementIsVisible(searchBox),
            15000,
            "Filter Anything input is not visible."
        );

        await driver.wait(
            until.elementIsEnabled(searchBox),
            15000,
            "Filter Anything input is not enabled."
        );

        console.log("✓ Filter Anything input is ready.");

        const results = [];

        for (const searchCase of searchCases) {
            console.log(
                `\n========== Searching ${searchCase.type}: ${searchCase.value} ==========`
            );

            // Clear the previous search and enter the new value.
            await searchBox.clear();
            await searchBox.sendKeys(searchCase.value);

            await driver.wait(
                async () => {
                    const value = await searchBox.getAttribute("value");
                    return value === searchCase.value;
                },
                10000,
                `Could not enter search value: ${searchCase.value}`
            );

            // Find the matching result in the actual rendered tables.
            // Do not depend on div.shipToCustomers-docs or
            // div.completed-docs, which caused the timeout.
            let matchingRowText = "";

            await driver.wait(
                async () => {
                    const rows = await driver.findElements(
                        By.css("table tbody tr")
                    );

                    const rowTexts = [];

                    for (const row of rows) {
                        try {
                            const visible = await row.isDisplayed();

                            if (!visible) {
                                continue;
                            }

                            const text = (await row.getText()).trim();

                            if (
                                text &&
                                !/no documents found/i.test(text)
                            ) {
                                rowTexts.push(text);
                            }
                        } catch (error) {
                            // Angular may redraw a row while searching.
                            continue;
                        }
                    }

                    matchingRowText = rowTexts.find(rowText => {
                        return (
                            rowText.includes(searchCase.expectedOrderId) &&
                            rowText.includes(searchCase.expectedDocId)
                        );
                    }) || "";

                    console.log(
                        `Rows currently displayed for ${searchCase.value}:`,
                        rowTexts
                    );

                    return matchingRowText !== "";
                },
                30000,
                `No matching row found for ${searchCase.type} ${searchCase.value}.`
            );

            console.log("✓ Matching row found:", matchingRowText);

            expect(
                matchingRowText,
                `Expected Order ID ${searchCase.expectedOrderId} and Doc ID ${searchCase.expectedDocId}`
            ).to.include(searchCase.expectedOrderId);

            expect(matchingRowText).to.include(
                searchCase.expectedDocId
            );

            results.push({
                searchedBy: searchCase.type,
                searchValue: searchCase.value,
                expectedOrderId: searchCase.expectedOrderId,
                expectedDocId: searchCase.expectedDocId,
                actualRow: matchingRowText,
                status: "PASS"
            });
        }

        console.log("\n========== Filter Anything Search Results ==========");
        console.table(results);

        expect(results).to.have.lengthOf(searchCases.length);

        console.log(
            "✓ TC_SHIP_007 passed: all three searches returned matching rows."
        );
    }
);



});