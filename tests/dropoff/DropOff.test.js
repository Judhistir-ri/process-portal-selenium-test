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
            "Partial Payment"
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
            "Notary"
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


    
});
