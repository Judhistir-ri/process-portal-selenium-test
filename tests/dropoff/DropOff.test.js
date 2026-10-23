const { until, By } = require("selenium-webdriver");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const os = require("os");

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const DropOffDetail = require("../../pages/DropOffDetail");

require("dotenv").config({ override: true });

describe("DropOff Page - Queue and Courier Functional Tests", function () {
  this.timeout(300000);

  let driver;
  let loginPage;
  let newPage;
  let dropOffDetail;

  const downloadsDirectory = path.join(os.homedir(), "Downloads");

  function getExistingFiles() {
    const snapshot = new Map();

    if (!fs.existsSync(downloadsDirectory)) {
      fs.mkdirSync(downloadsDirectory, { recursive: true });
    }

    for (const file of fs.readdirSync(downloadsDirectory)) {
      const fullPath = path.join(downloadsDirectory, file);

      try {
        const stat = fs.statSync(fullPath);

        snapshot.set(file, {
          size: stat.size,
          mtimeMs: stat.mtimeMs,
        });
      } catch (error) {
        // Ignore files that are being changed or removed.
      }
    }

    return snapshot;
  }

  // ==================== Login and navigation ====================

  async function waitForExcelDownload(existingFiles, timeout = 90000) {
    const startTime = Date.now();
    const stableCounts = new Map();

    while (Date.now() - startTime < timeout) {
      const files = fs.existsSync(downloadsDirectory)
        ? fs.readdirSync(downloadsDirectory)
        : [];

      for (const file of files) {
        const extension = path.extname(file).toLowerCase();

        if (![".xls", ".xlsx"].includes(extension)) {
          continue;
        }

        const fullPath = path.join(downloadsDirectory, file);

        try {
          const stat = fs.statSync(fullPath);
          const previous = existingFiles.get(file);

          const isNewOrUpdated =
            !previous ||
            previous.size !== stat.size ||
            previous.mtimeMs !== stat.mtimeMs;

          if (!isNewOrUpdated || stat.size === 0) {
            stableCounts.delete(file);
            continue;
          }

          const last = stableCounts.get(file);

          if (
            last &&
            last.size === stat.size &&
            last.mtimeMs === stat.mtimeMs
          ) {
            last.count++;

            if (last.count >= 2) {
              return fullPath;
            }
          } else {
            stableCounts.set(file, {
              size: stat.size,
              mtimeMs: stat.mtimeMs,
              count: 0,
            });
          }
        } catch (error) {
          // The file may still be downloading.
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(
      `No new or updated Excel file was detected in ${downloadsDirectory} within ${timeout / 1000} seconds.`,
    );
  }
//   before(async function () {
//     driver = await getDriver();

//     loginPage = new LoginPage(driver);
//     newPage = new NewPage(driver);
//     dropOffDetail = new DropOffDetail(driver);

//     await loginPage.open();

//     await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

//     await newPage.waitForPage();

//     // Navigate to DropOff and wait for its loading to finish
//     await dropOffDetail.open();

//     console.log("✓ DropOff page loaded successfully. Starting test cases.");
//   });

    before(async function () {
    driver = await getDriver();

    loginPage = new LoginPage(driver);
    newPage = new NewPage(driver);
    dropOffDetail = new DropOffDetail(driver);

    await loginPage.open();
    await loginPage.login(
        process.env.EMAIL,
        process.env.PASSWORD
    );

    await newPage.waitForPage();

    // open() now waits for DropOff to finish loading.
    await dropOffDetail.open();

    console.log(
        "✓ DropOff page loaded and ready. Starting test cases."
    );
    });
    
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  // =========================================================
  // TC_DROPOFF_001 - Export DropOff Queue to Excel
  // =========================================================

  it("TC_DROPOFF_001 - Verify Export downloads the DropOff Queue Excel file", async function () {
    // Ensure the Queue Export button is ready before taking the snapshot.
    const exportButton = await driver.wait(
      until.elementLocated(dropOffDetail.exportDropOffQueueButton),
      60000,
    );

    await driver.wait(until.elementIsVisible(exportButton), 30000);
    await driver.wait(until.elementIsEnabled(exportButton), 30000);

    const existingFiles = getExistingFiles();

    console.log("Clicking DropOff Queue Export button...");

    await dropOffDetail.clickExportDropOffQueue();

    const filePath = await waitForExcelDownload(existingFiles, 90000);

    expect(fs.existsSync(filePath)).to.equal(true);
    expect(fs.statSync(filePath).size).to.be.greaterThan(0);

    expect([".xls", ".xlsx"]).to.include(path.extname(filePath).toLowerCase());

    console.log(`✓ DropOff Queue Excel downloaded: ${filePath}`);
  });
  // =========================================================
  // TC_DROPOFF_002 - Print Docs for DropOff Queue
  // =========================================================

  it("TC_DROPOFF_002 - Verify Print Docs opens the DropOff Queue print view", async function () {
    await verifyPrintOpensNewTab(
      driver,
      async () => {
        await dropOffDetail.clickPrintDropOffQueueDocs();
      },
      "DropOff Queue Print Docs",
    );
  });

  // =========================================================
  // TC_DROPOFF_003 - Export Courier to Excel
  // =========================================================

  it("TC_DROPOFF_003 - Verify Export downloads the Courier Excel file", async function () {
    const existingFiles = getExistingFiles();

    await dropOffDetail.clickExportCourier();

    const filePath = await waitForExcelDownload(existingFiles, 90000);

    expect(fs.existsSync(filePath)).to.equal(true);
    expect(fs.statSync(filePath).size).to.be.greaterThan(0);

    expect([".xls", ".xlsx"]).to.include(path.extname(filePath).toLowerCase());

    console.log(`✓ Courier Excel downloaded: ${filePath}`);
  });

  // =========================================================
  // Helper - Verify a print option opens a new tab
  // =========================================================

  async function verifyPrintOpensNewTab(driver, triggerPrint, description) {
    const handlesBefore = await driver.getAllWindowHandles();
    const originalHandle = await driver.getWindowHandle();

    try {
      await triggerPrint();

      await driver.wait(
        async () => {
          const handlesNow = await driver.getAllWindowHandles();

          return handlesNow.some((handle) => !handlesBefore.includes(handle));
        },
        60000,
        `${description} did not open a new tab/window.`,
      );

      const handlesAfter = await driver.getAllWindowHandles();

      const newHandle = handlesAfter.find(
        (handle) => !handlesBefore.includes(handle),
      );

      expect(newHandle, "A new print tab should open").to.exist;

      await driver.switchTo().window(newHandle);

      await driver.wait(
        async () => {
          const handlesNow = await driver.getAllWindowHandles();

          if (!handlesNow.includes(newHandle)) return false;

          const url = await driver.getCurrentUrl().catch(() => "");
          const title = await driver.getTitle().catch(() => "");

          // Blob URLs are common for generated PDF print views.
          return Boolean(url || title);
        },
        30000,
        `${description} tab did not load.`,
      );

      const printUrl = await driver.getCurrentUrl();
      const printTitle = await driver.getTitle().catch(() => "");

      expect(printUrl).to.be.a("string").that.is.not.empty;

      console.log(`✓ ${description} opened.`);
      console.log(`  URL: ${printUrl}`);
      console.log(`  Title: ${printTitle}`);
    } finally {
      const handlesNow = await driver.getAllWindowHandles();

      // Close only the new tab created by this test.
      for (const handle of handlesNow) {
        if (!handlesBefore.includes(handle)) {
          await driver.switchTo().window(handle);
          await driver.close();
        }
      }

      const remainingHandles = await driver.getAllWindowHandles();

      if (remainingHandles.includes(originalHandle)) {
        await driver.switchTo().window(originalHandle);
      }
    }
  }

  // =========================================================
  // Courier print dropdown tests
  // =========================================================

  it("TC_DROPOFF_004 - Verify Courier print dropdown opens Cheques print tab", async function () {
    await verifyPrintOpensNewTab(
      driver,
      async () => {
        await dropOffDetail.selectCourierPrintOption("Cheques");
      },
      "Courier - Cheques",
    );
  });

  it("TC_DROPOFF_005 - Verify Courier print dropdown opens Shipping print tab", async function () {
    await verifyPrintOpensNewTab(
      driver,
      async () => {
        await dropOffDetail.selectCourierPrintOption("Shipping");
      },
      "Courier - Shipping",
    );
  });

  it("TC_DROPOFF_006 - Verify Courier print dropdown opens Docs print tab", async function () {
    await verifyPrintOpensNewTab(
      driver,
      async () => {
        await dropOffDetail.selectCourierPrintOption("Docs");
      },
      "Courier - Docs",
    );
  });

 
it("TC_DROPOFF_007 - Verify Completed Export based on document availability", async function () {
  const completedCount = await dropOffDetail.getCompletedDocumentCount();

  console.log(`Completed document count: ${completedCount}`);

  if (completedCount === 0) {
    await dropOffDetail.clickExportCompleted();

    await driver.wait(async () => {
      const message =
        await dropOffDetail.getNoDocumentsMessageIfPresent();
      return message === "No documents found.";
    }, 15000, "No documents found notification was not displayed.");

    expect(
      await dropOffDetail.getNoDocumentsMessageIfPresent()
    ).to.equal("No documents found.");

    console.log("✓ No documents found message displayed for Export.");
    return;
  }

  const existingFiles = getExistingFiles();

  await dropOffDetail.clickExportCompleted();

  const filePath = await waitForExcelDownload(existingFiles, 90000);

  expect(fs.existsSync(filePath)).to.equal(true);
  expect(fs.statSync(filePath).size).to.be.greaterThan(0);

  console.log(`✓ Completed Export downloaded: ${filePath}`);
});


it("TC_DROPOFF_008 - Verify Completed Print Docs based on document availability", async function () {
  const completedCount = await dropOffDetail.getCompletedDocumentCount();

  console.log(`Completed document count: ${completedCount}`);

  const handlesBefore = await driver.getAllWindowHandles();

  if (completedCount === 0) {
    await dropOffDetail.clickPrintCompletedDocs();

    await driver.wait(async () => {
      const message =
        await dropOffDetail.getNoDocumentsMessageIfPresent();
      return message === "No documents found.";
    }, 15000, "No documents found notification was not displayed.");

    expect(
      await dropOffDetail.getNoDocumentsMessageIfPresent()
    ).to.equal("No documents found.");

    expect(await driver.getAllWindowHandles()).to.deep.equal(handlesBefore);

    console.log("✓ No documents found message displayed for Print Docs.");
    return;
  }

  await dropOffDetail.clickPrintCompletedDocs();

  await driver.wait(async () => {
    const handlesNow = await driver.getAllWindowHandles();
    return handlesNow.some(handle => !handlesBefore.includes(handle));
  }, 30000, "Completed Print Docs did not open a new window.");

  const handlesAfter = await driver.getAllWindowHandles();
  const newHandle = handlesAfter.find(
    handle => !handlesBefore.includes(handle)
  );

  expect(newHandle).to.exist;

  await driver.switchTo().window(newHandle);

  await driver.wait(async () => {
    const url = await driver.getCurrentUrl().catch(() => "");
    return url.startsWith("blob:") || url.startsWith("http");
  }, 30000, "Completed print window did not load.");

  console.log("✓ Completed Print Docs opened a new window.");

  // Close the print window and return to DropOff.
  await driver.close();
  await driver.switchTo().window(handlesBefore[0]);
});

    

it(
    "TC_DROPOFF_009 - Verify DropOff Queue, Courier and Completed totals for each document type",
    async function () {
        this.timeout(300000);

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
                `\n========== Testing: ${documentType} ==========`
            );

            // Select the filter using the page object.
            await dropOffDetail.selectDocumentFilter(documentType);

            // Read the totals from all three panels.
            const queueTotal =
                await dropOffDetail.getSectionTotal("DropOff Queue");

            const courierTotal =
                await dropOffDetail.getSectionTotal("Courier");

            const completedTotal =
                await dropOffDetail.getSectionTotal("Completed");

            console.log(
                `${documentType} | ` +
                `DropOff Queue: ${queueTotal} | ` +
                `Courier: ${courierTotal} | ` +
                `Completed: ${completedTotal}`
            );

            // Verify that all displayed totals are valid non-negative numbers.
            expect(queueTotal).to.be.a("number");
            expect(queueTotal).to.be.at.least(0);

            expect(courierTotal).to.be.a("number");
            expect(courierTotal).to.be.at.least(0);

            expect(completedTotal).to.be.a("number");
            expect(completedTotal).to.be.at.least(0);
        }

        console.log(
            "\n✓ Verified all document filters and the three section totals."
        );
    }
);

    // ============================================================
// TC_DROPOFF_010 - Verify totals for each Document Category
// ============================================================

// it(
//   "TC_DROPOFF_010 - Verify DropOff Queue, Courier and Completed totals for each document category",
//   async function () {
//     this.timeout(300000);

//     const documentCategories = [
//       "All Categories",
//       "Shipping",
//       "Federal Government",
//       "General",
//       "International",
//       "Visa",
//       "Translation",
//       "Dispatch",
//       "Notary"
//     ];

//     for (const category of documentCategories) {
//       console.log(
//         `\n========== Document Category: ${category} ==========`
//       );

//       // 1. Select one category from the Document Category dropdown.
//       await dropOffDetail.selectDocumentCategory(category);

//       // 2. Read the totals from all three panels.
//       const queueTotal =
//         await dropOffDetail.getDocumentCategoryPanelTotal(
//           "DropOff Queue"
//         );

//       const courierTotal =
//         await dropOffDetail.getDocumentCategoryPanelTotal(
//           "Courier"
//         );

//       const completedTotal =
//         await dropOffDetail.getDocumentCategoryPanelTotal(
//           "Completed"
//         );

//       // 3. Print the counts for this category.
//       console.log(`Category: ${category}`);
//       console.log(`DropOff Queue Total: ${queueTotal}`);
//       console.log(`Courier Total: ${courierTotal}`);
//       console.log(`Completed Total: ${completedTotal}`);

//       // 4. Validate that all three totals were read successfully.
//       expect(queueTotal, `${category}: invalid DropOff Queue total`)
//         .to.be.a("number")
//         .and.to.be.at.least(0);

//       expect(courierTotal, `${category}: invalid Courier total`)
//         .to.be.a("number")
//         .and.to.be.at.least(0);

//       expect(completedTotal, `${category}: invalid Completed total`)
//         .to.be.a("number")
//         .and.to.be.at.least(0);
//     }

//     console.log(
//       "\n✓ Verified totals for every Document Category."
//     );
//   }
// );

    
it(
    "TC_DROPOFF_010 - Verify DropOff Queue, Courier and Completed totals for each document category",
    async function () {
        this.timeout(300000);

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

        for (const category of categories) {
            console.log(
                `\n========== Document Category: ${category} ==========`
            );

            // Select the category and wait for the page to update.
            await dropOffDetail.selectDocumentCategory(category);

            // Read totals only after the category is selected.
            const queueTotal =
                await dropOffDetail.getSectionTotal("DropOff Queue");

            const courierTotal =
                await dropOffDetail.getSectionTotal("Courier");

            const completedTotal =
                await dropOffDetail.getSectionTotal("Completed");

            console.log(
                `${category} | ` +
                `DropOff Queue: ${queueTotal} | ` +
                `Courier: ${courierTotal} | ` +
                `Completed: ${completedTotal}`
            );

            expect(queueTotal).to.be.a("number");
            expect(queueTotal).to.be.at.least(0);

            expect(courierTotal).to.be.a("number");
            expect(courierTotal).to.be.at.least(0);

            expect(completedTotal).to.be.a("number");
            expect(completedTotal).to.be.at.least(0);
        }
    }
);

// ============================================================
// TC_DROPOFF_011 - Verify totals for each Stop filter
// ============================================================

it(
    "TC_DROPOFF_011 - Verify DropOff Queue, Courier and Completed totals for each Stop",
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
                `\n========== Testing Stop: ${stopName} ==========`
            );

            // Select the Stop dropdown option and wait for refresh.
            await dropOffDetail.selectStopFilter(stopName);

            // Read the updated totals from all three panels.
            const queueTotal =
                await dropOffDetail.getSectionTotal("DropOff Queue");

            const courierTotal =
                await dropOffDetail.getSectionTotal("Courier");

            const completedTotal =
                await dropOffDetail.getSectionTotal("Completed");

            console.log(
                `${stopName} | ` +
                `DropOff Queue: ${queueTotal} | ` +
                `Courier: ${courierTotal} | ` +
                `Completed: ${completedTotal}`
            );

            // Verify all three totals are valid non-negative numbers.
            expect(queueTotal).to.be.a("number");
            expect(queueTotal).to.be.at.least(0);

            expect(courierTotal).to.be.a("number");
            expect(courierTotal).to.be.at.least(0);

            expect(completedTotal).to.be.a("number");
            expect(completedTotal).to.be.at.least(0);
        }

        console.log("\n✓ All Stop filters were tested.");
    }
);

    // ============================================================
// TC_DROPOFF_012 - Verify Order ID search using Filter Anything
// ============================================================

// it(
//   "TC_DROPOFF_012 - Verify Order IDs 263059 and 263061 in DropOff sections",
//   async function () {
//     this.timeout(180000);

//     const orderIds = ["263059", "263061"];

//     // Filter Anything search box.
//     const searchBoxLocator = By.css(
//       "input[placeholder='Filter Anything']"
//     );

//     // Wait until the DropOff page is ready.
//     await driver.wait(
//       until.elementLocated(searchBoxLocator),
//       30000,
//       "Filter Anything search box was not found."
//     );

//     const searchBox = await driver.findElement(searchBoxLocator);

//     await driver.wait(
//       until.elementIsVisible(searchBox),
//       15000,
//       "Filter Anything search box is not visible."
//     );

//     // Search both Order IDs in the same test case.
//     for (const orderId of orderIds) {
//       console.log(`\n========== Searching Order ID: ${orderId} ==========`);

//       // Clear the previous search and enter the current Order ID.
//       await searchBox.clear();
//       await searchBox.sendKeys(orderId);

//       // Wait until the UI updates and the Order ID is visible
//       // in one of the three sections.
//       const matchingSection = await driver.wait(
//         async () => {
//           const sections = [
//             {
//               name: "DropOff Queue",
//               selector: "div.col-md-4.dropoff"
//             },
//             {
//               name: "Courier",
//               selector: "div.col-md-4.courier"
//             },
//             {
//               name: "Completed",
//               selector: "div.col-md-4.completed-docs"
//             }
//           ];

//           for (const sectionInfo of sections) {
//             const section = await driver.findElements(
//               By.css(sectionInfo.selector)
//             );

//             if (section.length === 0) continue;

//             const rows = await section[0].findElements(
//               By.css("table.process-table tbody tr")
//             );

//             for (const row of rows) {
//               try {
//                 if (!(await row.isDisplayed())) continue;

//                 const cells = await row.findElements(By.css("td"));

//                 for (const cell of cells) {
//                   const cellText = (await cell.getText()).trim();

//                   if (cellText === orderId) {
//                     return sectionInfo.name;
//                   }
//                 }
//               } catch (error) {
//                 // Ignore rows refreshed by Angular.
//               }
//             }
//           }

//           return false;
//         },
//         30000,
//         `Order ID ${orderId} was not found in DropOff Queue, Courier, or Completed.`
//       );

//       console.log(
//         `✓ Order ID ${orderId} found in section: ${matchingSection}`
//       );

//       expect(
//         ["DropOff Queue", "Courier", "Completed"]
//       ).to.include(matchingSection);
//     }

//     // Clear the search field after both searches.
//     await searchBox.clear();

//     console.log(
//       "\n✓ Both Order IDs were searched and verified successfully."
//     );
//   }
    // );
    
    // ============================================================
// TC_DROPOFF_012 - Verify Order IDs using Filter Anything
// ============================================================

it(
  "TC_DROPOFF_012 - Verify Order IDs 263059 and 263061 in DropOff sections",
  async function () {
    this.timeout(180000);

    const orderIds = ["263059", "263061"];

    const searchBoxLocator = By.css(
      "input[placeholder='Filter Anything']"
    );

    const sections = [
      {
        name: "DropOff Queue",
        selector: ".col-md-4:has(#dropTable)"
      },
      {
        name: "Courier",
        selector: ".col-md-4.courier"
      },
      {
        name: "Completed",
        selector: ".col-md-4.completed-docs"
      }
    ];

    await driver.wait(
      until.elementLocated(searchBoxLocator),
      30000,
      "Filter Anything search box was not found."
    );

    // Verify that the DropOff Queue table exists.
    await driver.wait(
      until.elementLocated(By.css("#dropTable")),
      30000,
      "DropOff Queue table was not found."
    );

    for (const orderId of orderIds) {
      console.log(`\n========== Searching Order ID: ${orderId} ==========`);

      const searchBox = await driver.findElement(searchBoxLocator);

      await searchBox.clear();
      await searchBox.sendKeys(orderId);

      // Wait for the filtered results to update.
      await driver.sleep(1500);

      const matchingSections = await driver.wait(
        async () => {
          const matches = [];

          for (const section of sections) {
            const panels = await driver.findElements(
              By.css(section.selector)
            );

            for (const panel of panels) {
              if (!(await panel.isDisplayed())) continue;

              const orderCells = await panel.findElements(
                By.css("td.orderIdCol")
              );

              for (const cell of orderCells) {
                const cellText = (await cell.getText()).trim();
                const title = (await cell.getAttribute("title") || "").trim();

                if (cellText === orderId || title === orderId) {
                  matches.push(section.name);
                  break;
                }
              }

              if (matches.includes(section.name)) break;
            }
          }

          return matches.length > 0 ? matches : null;
        },
        30000,
        `Order ID ${orderId} was not found in DropOff Queue, Courier, or Completed.`
      );

      console.log(
        `✓ Order ID ${orderId} found in: ${matchingSections.join(", ")}`
      );

      // Pass when the Order ID appears in at least one section.
      expect(matchingSections.length).to.be.at.least(1);
    }

    // Clear the filter after both IDs have been tested.
    const searchBox = await driver.findElement(searchBoxLocator);
    await searchBox.clear();

    console.log("\n✓ Both Order IDs were found in at least one section.");
  }
    );
    
    // ============================================================
// TC_DROPOFF_013 - Verify section totals after selecting a date
// ============================================================

it(
    "TC_DROPOFF_013 - Verify document counts for 14-10-2026",
    async function () {
        this.timeout(180000);

        const selectedDate = "14-10-2026";

        console.log(
            `\n========== Date Filter: ${selectedDate} ==========`
        );

        // Select the date and apply the filter.
        await dropOffDetail.selectDateFilter(selectedDate);

        // Read the count from each of the three panels.
        const queueTotal =
            await dropOffDetail.getSectionTotal("DropOff Queue");

        const courierTotal =
            await dropOffDetail.getSectionTotal("Courier");

        const completedTotal =
            await dropOffDetail.getSectionTotal("Completed");

        // Display the results.
        console.log("\n========== Date Filter Results ==========");
        console.log(`Selected Date: ${selectedDate}`);
        console.log(`DropOff Queue Total: ${queueTotal}`);
        console.log(`Courier Total: ${courierTotal}`);
        console.log(`Completed Total: ${completedTotal}`);

        // Validate all three totals.
        expect(queueTotal).to.be.a("number").and.at.least(0);
        expect(courierTotal).to.be.a("number").and.at.least(0);
        expect(completedTotal).to.be.a("number").and.at.least(0);

        console.log(
            "\n✓ Successfully read all three section totals for the selected date."
        );
    }
    );
    
    //  it(
    //     "TC_DROPOFF_014 - Verify order moves from DropOff Queue to Courier and back",
    //     async function () {
    //         const orderId = "263071";
    //         const dropOffPanel = dropOffDetail.getDropOffPanel();
    //         const courierPanel = dropOffDetail.getCourierPanel();

    //         // Step 1: Search for the order.
    //         await dropOffDetail.searchOrderId(orderId);
    //         await dropOffDetail.waitForLoadingToFinish();

    //          // Step 2: Check the current location of the order.
    //     let inDropOff = await dropOffDetail.isOrderInPanel(
    //         dropOffPanel,
    //         orderId
    //     );

    //     let inCourier = await dropOffDetail.isOrderInPanel(
    //         courierPanel,
    //         orderId
    //     );

    //     console.log(
    //         `Order ${orderId} | DropOff Queue: ${inDropOff} | Courier: ${inCourier}`
    //     );


    //         // Step 2: Verify that the order appears in DropOff Queue.
    //         // expect(
    //         //     await dropOffDetail.isOrderInPanel(dropOffPanel, orderId),
    //         //     `Order ${orderId} should appear in DropOff Queue after searching`
    //         // ).to.equal(true);
    //         expect(
    //         inDropOff,
    //         `Order ${orderId} is not in DropOff Queue. ` +
    //         `Currently visible in Courier: ${inCourier}. ` +
    //         `Check the search filter and current order status.`
    //     ).to.equal(true);

    //         // Step 3: Select the order and click Courier.
    //         await dropOffDetail.selectOrderCheckbox(dropOffPanel, orderId);
    //         await dropOffDetail.clickPanelButton(dropOffPanel, "Courier");

    //         // Step 4: Wait 5 seconds; refresh once if the order hasn't moved.
    //         const movedToCourier =
    //             await dropOffDetail.waitForOrderInPanelWithRefresh(
    //                 courierPanel,
    //                 orderId,
    //                 5
    //             );

    //         expect(
    //             movedToCourier,
    //             `Order ${orderId} should move to Courier`
    //         ).to.equal(true);

    //         console.log(`✓ Order ${orderId} is visible in Courier.`);

    //         // Step 5: Select the order in Courier and click Queue.
    //         await dropOffDetail.selectOrderCheckbox(courierPanel, orderId);
    //         await dropOffDetail.clickPanelButton(courierPanel, "Queue");

    //         // Step 6: Wait 5 seconds; refresh once if necessary.
    //         const returnedToDropOff =
    //             await dropOffDetail.waitForOrderInPanelWithRefresh(
    //                 dropOffPanel,
    //                 orderId,
    //                 5
    //             );

    //         expect(
    //             returnedToDropOff,
    //             `Order ${orderId} should return to DropOff Queue`
    //         ).to.equal(true);

    //         console.log(`✓ Order ${orderId} returned to DropOff Queue.`);
    //     }
    // );

    
it(
    "TC_DROPOFF_014 - Verify order moves from DropOff Queue to Courier and back",
    async function () {
        this.timeout(120000);

        const orderId = "263071";

        const dropOffPanel = dropOffDetail.getDropOffPanel();
        const courierPanel = dropOffDetail.getCourierPanel();

        // Step 1: Search the order using Filter Anything.
        await dropOffDetail.searchOrderId(orderId);
        await dropOffDetail.waitForLoadingToFinish();

        // Step 2: Verify the initial location.
        let inDropOff = await dropOffDetail.isOrderInPanel(
            dropOffPanel,
            orderId
        );

        let inCourier = await dropOffDetail.isOrderInPanel(
            courierPanel,
            orderId
        );

        console.log(
            `Order ${orderId} | DropOff Queue: ${inDropOff} | Courier: ${inCourier}`
        );

        expect(
            inDropOff,
            `Order ${orderId} must initially appear in DropOff Queue.`
        ).to.equal(true);

        expect(
            inCourier,
            `Order ${orderId} should not initially appear in Courier.`
        ).to.equal(false);

        // Step 3: Select the order in DropOff Queue.
        await dropOffDetail.selectOrderCheckbox(
            dropOffPanel,
            orderId
        );

        // Step 4: Click Courier in the DropOff Queue panel.
        await dropOffDetail.clickPanelButton(
            dropOffPanel,
            "Courier"
        );

        // Step 5: Wait 5 seconds; refresh if necessary.
        const movedToCourier =
            await dropOffDetail.waitForOrderInPanelWithRefresh(
                courierPanel,
                orderId,
                5
            );

        expect(
            movedToCourier,
            `Order ${orderId} should move to Courier.`
        ).to.equal(true);

        // Verify that the order has left DropOff Queue.
        const leftDropOff = await dropOffDetail.waitForOrderToLeavePanel(
            dropOffPanel,
            orderId,
            15000
        );

        expect(
            leftDropOff,
            `Order ${orderId} should disappear from DropOff Queue.`
        ).to.equal(true);

        console.log(`✓ Order ${orderId} moved to Courier.`);

        // Step 6: Select the order in Courier.
        await dropOffDetail.selectOrderCheckbox(
            courierPanel,
            orderId
        );

        // Step 7: Click Queue in the Courier panel.
        await dropOffDetail.clickPanelButton(
            courierPanel,
            "Queue"
        );

        // Step 8: Wait 5 seconds; refresh if necessary.
        const returnedToDropOff =
            await dropOffDetail.waitForOrderInPanelWithRefresh(
                dropOffPanel,
                orderId,
                5
            );

        expect(
            returnedToDropOff,
            `Order ${orderId} should return to DropOff Queue.`
        ).to.equal(true);

        // Verify that the order has left Courier.
        const leftCourier = await dropOffDetail.waitForOrderToLeavePanel(
            courierPanel,
            orderId,
            15000
        );

        expect(
            leftCourier,
            `Order ${orderId} should disappear from Courier.`
        ).to.equal(true);

        console.log(
            `✓ Order ${orderId} returned to DropOff Queue successfully.`
        );
    }
);

    
});
