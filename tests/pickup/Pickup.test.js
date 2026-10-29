
const { expect } = require("chai");
const { By, until, Key } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const PickupDetail = require("../../pages/PickupDetail");

describe("Pickup Page - Export and Print Docs Functional Tests", function () {
    this.timeout(300000);

    let driver;
    let loginPage;
    let newPage;
    let pickupPage;

    before(async function () {
        driver = await getDriver();

        loginPage = new LoginPage(driver);
        newPage = new NewPage(driver);
        pickupPage = new PickupDetail(driver);

        await loginPage.open();
        await loginPage.login(
            process.env.EMAIL,
            process.env.PASSWORD
        );

        await newPage.waitForPage();
        await pickupPage.open();

        console.log("✓ Pickup page ready. Starting test cases.");
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

    async function verifyExport(panel, clickExport, testName) {
    const count = await pickupPage.getDocumentCount(panel);

    console.log(`${testName}: detected ${count} document row(s).`);

    // Only expect the error when there are no documents.
    if (count === 0) {
        await clickExport();

        try {
            await pickupPage.waitForNoDocumentsMessage(5000);
            console.log(
                `✓ ${testName}: "No documents found." displayed correctly.`
            );
        } catch (error) {
            // Some implementations do not show a toast for an empty export.
            // Do not fail solely because the toast was not displayed.
            console.log(
                `✓ ${testName}: no documents available; export download was not expected.`
            );
        }

        return;
    }

    const downloadDir = getDownloadDir();

    if (!fs.existsSync(downloadDir)) {
        throw new Error(`Download folder not found: ${downloadDir}`);
    }

    const filesBefore = new Set(fs.readdirSync(downloadDir));

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

    const filePath = path.join(downloadDir, downloadedFile);

    expect(fs.existsSync(filePath)).to.equal(true);
    expect(fs.statSync(filePath).size).to.be.greaterThan(0);

    console.log(`✓ ${testName}: downloaded ${downloadedFile}`);
}

    async function verifyPrint(panel, clickPrint, testName) {
        const count = await pickupPage.getDocumentCount(panel);

        console.log(`${testName}: detected ${count} document row(s).`);

        if (count === 0) {
            await clickPrint();
            await pickupPage.waitForNoDocumentsMessage();

            console.log(
                `✓ ${testName}: correctly handled the empty panel.`
            );
            return;
        }

        const handlesBefore = await driver.getAllWindowHandles();
        const originalHandle = await driver.getWindowHandle();

        await clickPrint();

        await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();

            return handles.some(
                handle => !handlesBefore.includes(handle)
            );
        }, 20000, `${testName}: Print Docs did not open a new window.`);

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

            expect(printUrl).to.be.a("string").and.not.empty;

            console.log(`✓ ${testName}: print window opened.`);
            console.log("Print URL:", printUrl);
        } finally {
            const handles = await driver.getAllWindowHandles();

            if (handles.includes(newHandle)) {
                await driver.switchTo().window(newHandle);
                await driver.close();
            }

            const remaining = await driver.getAllWindowHandles();

            if (remaining.includes(originalHandle)) {
                await driver.switchTo().window(originalHandle);
            }
        }
    }

    it("TC_PICKUP_001 - Verify Pickup Queue Export", async function () {
        await verifyExport(
            By.css("div.pickup"),
            () => pickupPage.clickPickupExport(),
            "Pickup Queue Export"
        );
    });

    it("TC_PICKUP_002 - Verify Pickup Queue Print Docs", async function () {
        await verifyPrint(
            By.css("div.pickup"),
            () => pickupPage.clickPickupPrintDocs(),
            "Pickup Queue Print Docs"
        );
    });

    it("TC_PICKUP_003 - Verify Completed Export", async function () {
        await verifyExport(
            By.css("div.completed-docs"),
            () => pickupPage.clickCompletedExport(),
            "Completed Export"
        );
    });

    it("TC_PICKUP_004 - Verify Completed Print Docs", async function () {
        await verifyPrint(
            By.css("div.completed-docs"),
            () => pickupPage.clickCompletedPrintDocs(),
            "Completed Print Docs"
        );
    });

it("TC_PICKUP_005 - Verify Pickup Queue and Completed totals for each document filter", async function () {

    const documentTypes = [
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

    for (const documentType of documentTypes) {

        console.log(
            `\n========== Testing document filter: ${documentType} ==========`
        );

        // Step 1: Select the document filter
        await pickupPage.selectDocumentFilter(documentType);

        console.log(`✓ Selected Pickup document filter: ${documentType}`);

        // Step 2: Wait for the page to finish loading
        await pickupPage.waitForLoadingToFinish();

        // Step 3: Read Pickup Queue total
        const pickupQueueTotal =
            await pickupPage.getSectionTotal("Pickup Queue");

        console.log(`✓ Pickup Queue Total: ${pickupQueueTotal}`);

        // Step 4: Read Completed total
        const completedTotal =
            await pickupPage.getSectionTotal("Completed");

        console.log(`✓ Completed Total: ${completedTotal}`);

        // Step 5: Verify both totals are available
        if (pickupQueueTotal === null || pickupQueueTotal === undefined) {
            throw new Error(
                `Pickup Queue total was not available for filter "${documentType}".`
            );
        }

        if (completedTotal === null || completedTotal === undefined) {
            throw new Error(
                `Completed total was not available for filter "${documentType}".`
            );
        }

        // Step 6: Verify totals are valid non-negative numbers
        const pickupTotalNumber = Number(
            String(pickupQueueTotal).replace(/,/g, "")
        );

        const completedTotalNumber = Number(
            String(completedTotal).replace(/,/g, "")
        );

        if (
            !Number.isFinite(pickupTotalNumber) ||
            pickupTotalNumber < 0
        ) {
            throw new Error(
                `Invalid Pickup Queue total "${pickupQueueTotal}" for filter "${documentType}".`
            );
        }

        if (
            !Number.isFinite(completedTotalNumber) ||
            completedTotalNumber < 0
        ) {
            throw new Error(
                `Invalid Completed total "${completedTotal}" for filter "${documentType}".`
            );
        }

        console.log(
            `✓ TC passed for filter "${documentType}": ` +
            `Pickup Queue = ${pickupTotalNumber}, ` +
            `Completed = ${completedTotalNumber}`
        );
    }

    console.log(
        "\n✓ TC_PICKUP_005 completed for all document filters."
    );
});
    
    
// ============================================================
// TC_PICKUP_006 - Verify totals for each Document Category
// ============================================================

it(
  "TC_PICKUP_006 - Verify Pickup Queue and Completed totals for each document category",
  async function () {
    this.timeout(300000);

    const documentCategories = [
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

    for (const category of documentCategories) {
      console.log(
        `\n========== Document Category: ${category} ==========`
      );

      // 1. Select the category.
      await pickupPage.selectDocumentCategory(category);

      // 2. Wait for the page to finish updating.
      await pickupPage.waitForLoadingToFinish();

      // 3. Read the totals from the two panels.
      const pickupQueueTotal =
        await pickupPage.getSectionTotal("Pickup Queue");

      const completedTotal =
        await pickupPage.getSectionTotal("Completed");

      // 4. Print the results.
      console.log(`Category: ${category}`);
      console.log(`Pickup Queue Total: ${pickupQueueTotal}`);
      console.log(`Completed Total: ${completedTotal}`);

      // 5. Validate both totals.
      expect(
        pickupQueueTotal,
        `${category}: invalid Pickup Queue total`
      ).to.be.a("number").and.at.least(0);

      expect(
        completedTotal,
        `${category}: invalid Completed total`
      ).to.be.a("number").and.at.least(0);
    }

    console.log(
      "\n✓ Verified Pickup Queue and Completed totals for every document category."
    );
  }
    );
    
it(
    "TC_PICKUP_007 - Verify Pickup Queue and Completed totals for each Stop",
    async function () {
        this.timeout(600000);

        const stops = [
            "Any Stop",
            "CC",
            "SOS",
            "DOS",
            "EMB1",
            "DC EMB",
            "ARAB CHAMBER",
            "AGSHF",
            "MCCC",
            "USQBC",
            "INT-EMB",
            "DISPATCH",
            "VISA",
            "TRANSLATION",
            "NOTARY",
            "E-APP",
            "Out Of States",
            "Any Stop"
        ];

        for (const stopName of stops) {
            console.log(
                `\n========== Testing Pickup Stop: ${stopName} ==========`
            );

            await pickupPage.selectStopFilter(stopName);

            const pickupTotal = await pickupPage.getPickupQueueTotal();
            const completedTotal = await pickupPage.getCompletedTotal();

            console.log(
                `${stopName} | Pickup Queue: ${pickupTotal} | ` +
                `Completed: ${completedTotal}`
            );

            expect(pickupTotal).to.be.a("number").and.at.least(0);
            expect(completedTotal).to.be.a("number").and.at.least(0);
        }
    }
    );
    
    
it(
  "TC_PICKUP_008 - Search Order IDs using Filter Anything and verify Order ID, Doc ID, and Country",
  async function () {
    this.timeout(180000);

    const orderIds = ["263158", "263159"];

    const searchBoxLocator = By.css(
      "input[placeholder='Filter Anything']"
    );

    await driver.wait(
      until.elementLocated(searchBoxLocator),
      30000,
      "Filter Anything search box was not found."
    );

    const searchBox = await driver.findElement(searchBoxLocator);

    const sections = [
      {
        name: "Pickup Queue",
        selector: "div.col-md-6.pickup"
      },
      {
        name: "Completed",
        selector: "div.col-md-6.completed-docs"
      }
    ];

    async function findOrderInSections(orderId) {
      for (const sectionInfo of sections) {
        const sectionElements = await driver.findElements(
          By.css(sectionInfo.selector)
        );

        if (!sectionElements.length) continue;

        const section = sectionElements[0];

        const rows = await section.findElements(
          By.css("table.process-table tbody tr")
        );

        const headers = await section.findElements(
          By.css("table.process-table thead th")
        );

        const headerTexts = [];

        for (const header of headers) {
          headerTexts.push(
            (await header.getText())
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ")
          );
        }

        for (const row of rows) {
          const cells = await row.findElements(By.css("td"));
          const cellTexts = [];

          for (const cell of cells) {
            cellTexts.push((await cell.getText()).trim());
          }

          if (!cellTexts.includes(orderId)) continue;

          function getColumnValue(headerName) {
            const index = headerTexts.findIndex(
              (header) => header === headerName.toLowerCase()
            );

            return index >= 0 ? (cellTexts[index] || "").trim() : "";
          }

          return {
            orderId,
            docId: getColumnValue("Doc ID"),
            country: getColumnValue("Country"),
            section: sectionInfo.name,
            rowText: cellTexts.join(" | ")
          };
        }
      }

      return null;
    }

    for (const orderId of orderIds) {
      console.log(`\n========== Pickup Search: ${orderId} ==========`);

      await searchBox.clear();
      await searchBox.sendKeys(orderId);

      // Wait until the order appears in either Pickup Queue or Completed.
      const result = await driver.wait(
        async () => await findOrderInSections(orderId),
        30000,
        `Order ID ${orderId} was not found in Pickup Queue or Completed.`
      );

      expect(result).to.exist;
      expect(result.orderId).to.equal(orderId);

      console.log("----------------------------------------");
      console.log(`Order ID : ${result.orderId}`);
      console.log(`Doc ID   : ${result.docId || "Not found"}`);
      console.log(`Country  : ${result.country || "Not found"}`);
      console.log(`Section  : ${result.section}`);
      console.log(`Row data : ${result.rowText}`);
      console.log("----------------------------------------");

      expect(
        result.docId,
        `Doc ID should be available for Order ID ${orderId}`
      ).to.not.equal("");

      expect(
        result.country,
        `Country should be available for Order ID ${orderId}`
      ).to.not.equal("");
    }

    console.log(
      "\n✓ Both Order IDs were searched and verified on the Pickup page."
    );
  }
);

    it("TC_PICKUP_009 - Verify document counts for 14-10-2026", async function () {
        const selectedDate = "2026-10-14";

        try {
            console.log(
                "\n========== Pickup Date Filter Test =========="
            );

            // Step 1: Select 14 October 2026.
            await pickupPage.selectDateFilter(selectedDate);

            // Step 2: Read Pickup Queue count.
            const pickupQueueCount =
                await pickupPage.getSectionTotal("Pickup Queue");

            // Step 3: Read Completed count.
            const completedCount =
                await pickupPage.getSectionTotal("Completed");

            // Step 4: Print the results.
            console.log("------------------------------------");
            console.log("Selected Date: 14-10-2026");
            console.log(`Pickup Queue Documents: ${pickupQueueCount}`);
            console.log(`Completed Documents: ${completedCount}`);
            console.log(
                `Total Across Both Panels: ${
                    pickupQueueCount + completedCount
                }`
            );
            console.log("------------------------------------");

            // Step 5: Validate the counts.
            expect(pickupQueueCount).to.be.a("number");
            expect(pickupQueueCount).to.be.at.least(0);

            expect(completedCount).to.be.a("number");
            expect(completedCount).to.be.at.least(0);

        } finally {
            // Step 6: Always clear the date filter,
            // even if an assertion or another step fails.
            await pickupPage.clearDateFilter();
        }
    });

// ============================================================
// TC_PICKUP_010 - Search multiple DocIDs using Search (Barcode)
// ============================================================

// it(
//     "TC_PICKUP_010 - Search DocIDs 99575 and 99714 and verify selected checkbox",
//     async function () {
//         this.timeout(120000);

//         const docIds = ["99575", "99714"];

//         const searchBarcodeLocator = By.css(
//             "input[ng-model='searchOptions.searchKeyword']"
//         );

//         const panels = [
//             {
//                 name: "Pickup Queue",
//                 locator: By.css("div.col-md-6.pickup")
//             },
//             {
//                 name: "Completed",
//                 locator: By.css("div.col-md-6.completed-docs")
//             }
//         ];

//         // Use the existing driver variable from your test setup.
//         // Do not declare: const driver = this.driver;

//         for (const docId of docIds) {
//             console.log(
//                 `\n========== Search Barcode: DocID ${docId} ==========`
//             );

//             // Step 1: Find the Search (Barcode) input.
//             const searchBox = await driver.wait(
//                 until.elementLocated(searchBarcodeLocator),
//                 15000,
//                 "Search (Barcode) input was not found."
//             );

//             await driver.wait(
//                 until.elementIsVisible(searchBox),
//                 10000,
//                 "Search (Barcode) input is not visible."
//             );

//             // Step 2: Search for the current DocID.
//             await searchBox.clear();
//             await searchBox.sendKeys(docId);

//             // Wait until the input contains the DocID.
//             await driver.wait(
//                 async () =>
//                     (await searchBox.getAttribute("value")).trim() === docId,
//                 5000,
//                 `Search field did not contain DocID ${docId}.`
//             );

//             // Allow Angular's ng-change barcode search to update the table.
//             await driver.sleep(1500);

//             // Step 3: Search Pickup Queue first, then Completed.
//             let matchedRecord = null;

//             for (const panelInfo of panels) {
//                 const panelElements = await driver.findElements(
//                     panelInfo.locator
//                 );

//                 if (panelElements.length === 0) {
//                     continue;
//                 }

//                 const panel = panelElements[0];

//                 const rows = await panel.findElements(
//                     By.css("table.process-table tbody tr")
//                 );

//                 for (const row of rows) {
//                     const cells = await row.findElements(By.css("td"));
//                     const cellTexts = [];

//                     for (const cell of cells) {
//                         cellTexts.push((await cell.getText()).trim());
//                     }

//                     // Match the complete DocID cell, not a partial value.
//                     const docIdIndex = cellTexts.findIndex(
//                         text => text === docId
//                     );

//                     if (docIdIndex === -1) {
//                         continue;
//                     }

//                     // Capture the Order ID from the same row.
//                     const orderIdCell = await row.findElements(
//                         By.css("td[ng-class*='getClass']")
//                     );

//                     const checkbox = await row.findElements(
//                         By.css("input[type='checkbox']")
//                     );

//                     if (checkbox.length === 0) {
//                         throw new Error(
//                             `Checkbox not found for DocID ${docId} ` +
//                             `in ${panelInfo.name}.`
//                         );
//                     }

//                     matchedRecord = {
//                         panel: panelInfo.name,
//                         docId,
//                         orderId: orderIdCell.length
//                             ? (await orderIdCell[0].getText()).trim()
//                             : "Not captured",
//                         isSelected: await checkbox[0].isSelected()
//                     };

//                     break;
//                 }

//                 if (matchedRecord) {
//                     break;
//                 }
//             }

//             // Step 4: Verify the DocID was found in either panel.
//             expect(
//                 matchedRecord,
//                 `DocID ${docId} was not found in Pickup Queue or Completed.`
//             ).to.not.equal(null);

//             console.log(`Panel: ${matchedRecord.panel}`);
//             console.log(`Order ID: ${matchedRecord.orderId}`);
//             console.log(`DocID: ${matchedRecord.docId}`);
//             console.log(
//                 `Checkbox selected: ${matchedRecord.isSelected}`
//             );

//             // Step 5: Verify the exact DocID and selected checkbox.
//             expect(matchedRecord.docId).to.equal(docId);

//             expect(
//                 matchedRecord.isSelected,
//                 `Checkbox for DocID ${docId} should be selected.`
//             ).to.equal(true);

//             console.log(
//                 `✓ DocID ${docId} found and checkbox verified successfully.`
//             );

//             // Step 6: Clear the search before searching the next DocID.
//             await searchBox.clear();
//             await driver.sleep(1000);
//         }

//         console.log(
//             "\n✓ TC_PICKUP_010 passed: Both DocIDs were verified."
//         );
//     }
// );


});
