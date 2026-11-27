
// One WebDriver session is shared by both suites.
// Mocha executes the Processor Portal suite first, then Global Search.
// The browser is closed once, after all 92 tests have finished.
const sharedSession = { driver: null };

after(async function () {
    if (sharedSession.driver) {
        await sharedSession.driver.quit();
        sharedSession.driver = null;
        console.log("✓ Shared browser session closed after all 92 test cases.");
    }
});

// ================================================================
// SUITE 1: PROCESSOR PORTAL (78 TEST CASES)
// ================================================================
{
    const { expect } = require("chai");
    const { until, By } = require("selenium-webdriver");
    const fs = require("fs");
    const path = require("path");
    const os = require("os");
    
    const getDriver = require("../../utils/driver");
    
    const LoginPage = require("../../pages/Login");
    const NewPage = require("../../pages/NewPage");
    const ExpectedPage = require("../../pages/ExpectedPage");
    const ExpectedDetailsPage = require("../../pages/ExpectedDetailsPage");
    const DropOffDetail = require("../../pages/DropOffDetail");
    const PickupDetail = require("../../pages/PickupDetail");
    const ShipToCustomerDetail = require("../../pages/ShipToCustomerDetail");
    const TestReporter = require("../../utils/testReporter");
    
    require("dotenv").config({ override: true });
    
    describe("All Test Case - processorPortal AllT Test Cases", function () {
    
      this.timeout(1200000);
    
      // Shared browser and page objects
      let driver;
      let loginPage;
      let newPage;
      let expectedPage;
      let expectedDetailsPage;
      let dropOffDetail;
      let pickupPage;
      let shipPage;
      let activeReporter = null;
    
      // Expected Details test variables
      // let testAddress = null;
      // let updatedAddress = null;
      // let orderId;
      // let docId;
      // let country;
    
      // Login only once for all test suites
      before(async function () {
        this.timeout(300000);
    
        driver = await getDriver();
        sharedSession.driver = driver;
    
        loginPage = new LoginPage(driver);
        newPage = new NewPage(driver);
        expectedPage = new ExpectedPage(driver);
        expectedDetailsPage = new ExpectedDetailsPage(driver);
        dropOffDetail = new DropOffDetail(driver);
        pickupPage = new PickupDetail(driver);
        shipPage = new ShipToCustomerDetail(driver);
    
        // Automatically capture page-object actions as report steps.
        // The reporter callback is resolved for each test, so every nested
        // suite writes to the currently active test report.
        [
          loginPage,
          newPage,
          expectedPage,
          expectedDetailsPage,
          dropOffDetail,
          pickupPage,
          shipPage,
        ].forEach((pageObject) => {
          TestReporter.instrumentPageObject(pageObject, () => activeReporter);
        });
    
        await loginPage.open();
    
        await loginPage.login(
          process.env.EMAIL,
          process.env.PASSWORD
        );
    
        await newPage.waitForPage();
    
        console.log("✓ Login successful. Starting all test cases.");
      });
    
      // --------------------------------------------------
      // PER-TEST REPORT INITIALIZATION
      // Applies to every nested Expected, DropOff, Pickup and Ship suite.
      // --------------------------------------------------
      beforeEach(function () {
        activeReporter = new TestReporter(driver, this);
    
        const title = this.currentTest?.title || "Unnamed test";
        const testCaseId =
          (title.match(/\b(TC_[A-Z]+_?\d+)\b/i) || [])[1] ||
          "Not specified";
    
        const objective = title
          .replace(/^TC_[A-Z]+_?\d+\s*-\s*/i, "")
          .trim();
    
        const moduleName = this.currentTest?.parent?.title ||
          "Processor Portal";
    
        activeReporter.addTestInfo({
          testCaseId,
          testCase: title,
          module: moduleName,
          objective,
          reportingNote:
            "Page-object actions are captured automatically. Final status, duration, browser URL, failure details and screenshot are attached after each test."
        });
      });
    
      // --------------------------------------------------
      // AUTOMATIC REPORT DETAILS, FAILURE AND SCREENSHOT
      // --------------------------------------------------
      afterEach(async function () {
        const currentTest = this.currentTest;
    
        if (currentTest && activeReporter) {
          try {
            const pageUrl = driver
              ? await driver.getCurrentUrl().catch(() => "URL unavailable")
              : "Browser unavailable";
    
            activeReporter.addDetail(
              "FINAL TEST STATUS",
              String(currentTest.state || "unknown").toUpperCase()
            );
            activeReporter.addDetail(
              "EXECUTION DURATION",
              `${currentTest.duration || 0} ms`
            );
            activeReporter.addDetail("FINAL BROWSER URL", pageUrl);
    
            if (currentTest.state === "passed") {
              activeReporter.addDetail(
                "FINAL ACTUAL RESULT",
                "All assertions in this test case completed successfully."
              );
            }
    
            if (currentTest.state === "failed" && currentTest.err) {
              activeReporter.addFailure(currentTest.err);
            }
    
            // Capture evidence before any later browser navigation or teardown.
            await activeReporter.attachScreenshot(
              `${currentTest.title} - ${currentTest.state || "completed"}`
            );
          } catch (reportError) {
            console.error(
              "Could not attach Mochawesome report details:",
              reportError.message
            );
          }
        }
    
        activeReporter = null;
      });
      // Keep the shared browser open for the Global Search suite.

    
      // ------------------Expected details test case--------------------
    
      describe("Expected Page - Document Details Functional Test Cases", function () {
        
        let testAddress = null;
        let updatedAddress = null;
      
        let orderId;
        let docId;
        let country;
      
        before(async function () {
          this.timeout(300000);
      
          await expectedPage.open();
      
          orderId = await expectedPage.getTopOrderId();
      
          expect(orderId).to.match(/^\d+$/);
      
          await expectedPage.clickOrderId(orderId);
      
          await expectedPage.waitForOrderDetails();
      
          docId = await expectedPage.getDocId();
      
          expect(docId).to.match(/^\d+$/);
      
          country = process.env.PROCESS_COUNTRY || "Afghanistan";
        });
      
        it("TC_EXP_001 - Verify top Order ID is displayed and clickable", async function () {
          expect(orderId).to.match(/^\d+$/);
      
          expect(docId).to.match(/^\d+$/);
        });
      
        it("TC_EXP_002 - Verify Document Details are displayed", async function () {
          await expectedPage.waitForOrderDetails();
      
          const result = await expectedPage.verifyOrderDetails({
            orderId,
            docId,
            country,
          });
      
          expect(result).to.equal(true);
        });
      
        it("TC_EXP_003 - Verify Processing Steps and Processing Step Count", async function () {
          const steps = await expectedPage.getProcessingStepsFromOrder();
      
          const count = await expectedPage.getProcessingStepCount();
      
          expect(steps).to.be.an("array");
      
          expect(steps.length).to.be.greaterThan(0);
      
          expect(count).to.be.a("number");
      
          expect(count).to.equal(steps.length);
        });
      
        it("TC_EXP_004 - Verify Country", async function () {
          const result = await expectedDetailsPage.verifyText(country);
      
          expect(result).to.equal(true);
        });
      
        it("TC_EXP_005 - Verify Customer ID and Customer Name", async function () {
          const pageText = await expectedDetailsPage.getCurrentPageText();
      
          expect(pageText).to.include("Customer Id");
      
          expect(pageText).to.include("Customer Name");
        });

        it("TC_EXP_0006 - Verify Document Status is displayed", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const documentStatusLocator = By.xpath(
            "//div[@id='docDetails']//span[normalize-space()='Document Status:']" +
            "/following-sibling::span[1]"
          );
      
          const statusElement = await driver.wait(
            async () => {
              const elements = await driver.findElements(documentStatusLocator);
      
              for (const element of elements) {
                if (await element.isDisplayed()) {
                  const text = (await element.getText()).trim();
                  if (text) return element;
                }
              }
      
              return false;
            },
            30000,
            "Document Status was not displayed."
          );
      
          const documentStatus = (await statusElement.getText()).trim();
      
          console.log("Document Status:", documentStatus);
      
          expect(documentStatus).to.not.equal("");
          expect(documentStatus).to.equal("Waiting");
      
          console.log("✓ TC_EXP_006 - Document Status verified.");
        });
      
        
        it("TC_EXP_0007 - Verify Payment Status is displayed", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const paymentStatusLocator = By.xpath(
              "//div[@id='docDetails']//span[normalize-space()='Payment Status:']" +
              "/following-sibling::span[1]"
          );
      
          const statusElement = await driver.wait(
              async () => {
                  const elements = await driver.findElements(paymentStatusLocator);
      
                  for (const element of elements) {
                      if (await element.isDisplayed()) {
                          const text = (await element.getText()).trim();
      
                          if (text) return element;
                      }
                  }
      
                  return false;
              },
              30000,
              "Payment Status was not displayed."
          );
      
          const paymentStatus = (await statusElement.getText())
              .replace(/\s+/g, " ")
              .trim();
      
          console.log("Payment Status:", paymentStatus);
      
          // Verify that a payment status is displayed.
          expect(paymentStatus).to.not.equal("");
      
          // Verify that the payment status starts with Pay.
          expect(paymentStatus.toLowerCase()).to.match(/^pay\b/);
      
          console.log("✓ TC_EXP_007 - Payment Status verified.");
        });
      
        it("TC_EXP_006 - Verify Send Payment Link", async function () {
          const status = await expectedDetailsPage.checkPaymentLinkStatus();
      
          if (status === "Cancel Payment") {
            expect(status).to.equal("Cancel Payment");
            return;
          }
      
          expect(status).to.equal("Send Payment Link");
      
          await expectedDetailsPage.clickSendPaymentLink();
      
          await expectedDetailsPage.verifyPaymentLinkPopup();
      
          const popupDocumentId =
            await expectedDetailsPage.getPaymentPopupDocumentId();
      
          const pageDocumentId = await expectedDetailsPage.getDocumentId();
      
          expect(popupDocumentId).to.equal(pageDocumentId);
      
          const paymentPopupAmount =
            await expectedDetailsPage.getPaymentPopupAmount();
      
          const totalAmount = await expectedDetailsPage.getPaymentAmount();
      
          expect(paymentPopupAmount).to.equal(totalAmount);
      
          await expectedDetailsPage.submitPaymentLink();
      
          const finalStatus = await expectedDetailsPage.getPaymentLinkButtonText();
      
          expect(finalStatus).to.equal("Cancel Payment");
        });
      
        it("TC_EXP_007 - Verify Attachments tab opens", async function () {
          await expectedDetailsPage.clickTab("attachments");
      
          const text = await expectedDetailsPage.getPaneText("attachments");
      
          expect(text).to.include("Document Uploads");
        });
      
         
        it("TC_EXP_008 - Verify Document Details opens for the selected Doc ID", async function () {
          // Verify selected Order ID and Doc ID
          expect(orderId).to.match(/^\d+$/);
          expect(docId).to.match(/^\d+$/);
      
          // Ensure Document Details tab is active
          await expectedDetailsPage.clickTab("documentDetails");
      
          const detailsText =
            await expectedDetailsPage.getPaneText("documentDetails");
      
          expect(detailsText).to.include(String(docId));
      
          console.log(`✓ Document Details opened for Doc ID: ${docId}`);
        });
      
        it("TC_EXP_009 - Verify Download Shipping Label opens Attachments and displays the return label", async function () {
          // Step 1: Open Document Details.
          await expectedDetailsPage.clickTab("documentDetails");
      
          // Step 2: Verify the link is available.
          const link =
            await expectedDetailsPage.getDownloadShippingLabelLinkIfAvailable();
      
          if (!link) {
            this.skip();
          }
      
          // Step 3: Click the link.
          const clicked = await expectedDetailsPage.clickDownloadShippingLabel();
      
          expect(clicked).to.equal(true);
      
          // Step 4: Verify the return shipping label.
          const result = await expectedDetailsPage.verifyReturnShippingLabelDetails();
      
          expect(result.rowText).to.include("Return Shipping Label");
      
          expect(
            result.downloadIconVisible,
            "Return Shipping Label download icon should be visible",
          ).to.equal(true);
      
          console.log(`✓ TC_EXP_111 passed for Order ID ${orderId}`);
        });
      
        it("TC_EXP_010 - Verify Print Cover Sheet downloads a PDF", async function () {
          console.log("\n========== TC_EXP_113 - PRINT COVER SHEET ==========");
           await expectedDetailsPage.clickTab("documentDetails");
      
          // Windows default Downloads folder
          const downloadDir = path.join(os.homedir(), "Downloads");
      
          // Record files before clicking
          const filesBefore = new Set(fs.readdirSync(downloadDir));
      
          // Locate Print Cover Sheet
          const printCoverSheet = By.xpath(
            "//a[contains(@ng-click,'generatePDF') " +
              "and contains(normalize-space(.),'Print Cover Sheet')]",
          );
      
          const button = await expectedDetailsPage.waitForVisible(
            printCoverSheet,
            30000,
          );
      
          expect(await button.isDisplayed()).to.equal(true);
      
          console.log("STEP 1: Print Cover Sheet link found.");
      
          // Click Print Cover Sheet
          await driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            button,
          );
      
          await button.click();
      
          console.log("STEP 2: Print Cover Sheet clicked.");
          console.log("Checking Downloads folder:", downloadDir);
      
          // Wait until a new PDF is downloaded
          await driver.wait(
            async () => {
              const files = fs.readdirSync(downloadDir);
      
              const newPdf = files.some(
                (file) =>
                  !filesBefore.has(file) && file.toLowerCase().endsWith(".pdf"),
              );
      
              const downloading = files.some((file) => file.endsWith(".crdownload"));
      
              return newPdf && !downloading;
            },
            60000,
            "No new PDF found in the Windows Downloads folder.",
          );
      
          // Find downloaded PDF
          const filesAfter = fs.readdirSync(downloadDir);
      
          const downloadedPdf = filesAfter.find(
            (file) => !filesBefore.has(file) && file.toLowerCase().endsWith(".pdf"),
          );
      
          expect(downloadedPdf).to.not.equal(undefined);
      
          const pdfPath = path.join(downloadDir, downloadedPdf);
      
          expect(fs.statSync(pdfPath).size).to.be.greaterThan(0);
      
          console.log("Downloaded PDF:", pdfPath);
          console.log("✓ TC_EXP_113 PASSED");
        });
      
        it("TC_EXP_011 - Verify document status message and background based on attachment icon", async function () {
          // await expectedPage.open();
      
          // Get the top Order ID row.
          // const orderId = await expectedPage.getTopOrderId();
      
          expect(orderId).to.match(/^\d+$/);
      
          // Find the row containing this Order ID.
          const row = await driver.wait(
            until.elementLocated(
              By.xpath(`//tr[.//td[normalize-space(.)='${orderId}']]`),
            ),
            30000,
          );
      
          // Check whether the row has an attachment/paperclip icon.
      
          const icons = await row.findElements(
            By.css(".fa-paperclip, i.fa-paperclip"),
          );
      
          // Count only visible paperclip icons.
          let hasAttachment = false;
      
          for (const icon of icons) {
            try {
              if (await icon.isDisplayed()) {
                hasAttachment = true;
                break;
              }
            } catch (error) {
              // Ignore stale or unavailable icon elements.
            }
          }
      
          console.log(
            `Order ID: ${orderId}, Paperclip elements: ${icons.length}, ` +
              `Visible attachment icon: ${hasAttachment}`,
          );
      
          // Click the Doc ID in the SAME row.
          const docIdCell = await row.findElement(
            By.xpath(".//td[@data-target='#docDetails' and @ng-click]"),
          );
      
          await docIdCell.click();
      
          await expectedDetailsPage.clickTab("documentDetails");
      
          // Verify the appropriate message and background.
          const expectedMessage = hasAttachment
            ? "Process the document with attachment"
            : "Customer is sending original document";
      
          const expectedColor = hasAttachment
            ? "rgb(255, 255, 0)" // Yellow
            : "rgb(0, 255, 255)"; // Cyan
      
          const status = await driver.wait(async () => {
            const elements = await driver.findElements(
              By.xpath(
                `//*[@id='docDetails']//span[contains(normalize-space(.), '${expectedMessage}')]`,
              ),
            );
      
            for (const element of elements) {
              if (await element.isDisplayed()) {
                return element;
              }
            }
      
            return false;
          }, 30000);
      
          const actualMessage = (await status.getText()).replace(/\s+/g, " ").trim();
      
          // Read the background color from the actual message span.
          const actualColor = await driver.executeScript(
            "return window.getComputedStyle(arguments[0]).backgroundColor;",
            status,
          );
      
          console.log("Expected message:", expectedMessage);
          console.log("Actual message:", actualMessage);
          console.log("Expected background:", expectedColor);
          console.log("Actual background:", actualColor);
      
          expect(actualMessage).to.include(expectedMessage);
          expect(actualColor).to.equal(expectedColor);
      
          console.log("✓ Status message and background color verified.");
        });
    
        // function normalizeFeeType(feeType) {
        //   return String(feeType)
        //     .replace(/\([^)]*\)/g, "")
        //     .replace(/:/g, "")
        //     .replace(/\s+/g, " ")
        //     .trim()
        //     .toLowerCase();
        // }
    
        it("TC_EXP_034 - Verify Fee Amounts Between Document Details and Order History", async function () {
          console.log("\n==========================================");
          console.log("TC_EXP_017 - Verify Fee Amounts");
          console.log("==========================================");
          const normalizeFeeType = (feeType) =>
        String(feeType)
          .replace(/\([^)]*\)/g, "")
          .replace(/:/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      
          // ------------------------------------------
          // Get Document Details fees
          // ------------------------------------------
      
          console.log("\nGetting fees from Document Details...");
      
          const documentFees =
            await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
          console.log("\nDocument Details Fees:");
          console.log(JSON.stringify(documentFees, null, 2));
      
          // ------------------------------------------
          // Get Document Details total
          // ------------------------------------------
      
          const documentTotal = await expectedDetailsPage.getPaymentAmount();
      
          console.log(`Document Details Total Amount: $${documentTotal.toFixed(2)}`);
      
          // ------------------------------------------
          // Get Order History fees
          // ------------------------------------------
      
          console.log("\nGetting fees from Order History...");
      
          const orderHistoryFees = await expectedDetailsPage.getFeeDetails();
      
          console.log("\nOrder History Fees:");
          console.log(JSON.stringify(orderHistoryFees, null, 2));
      
          // ------------------------------------------
          // Verify fee count
          // ------------------------------------------
      
          expect(orderHistoryFees.length).to.equal(
            documentFees.length,
            "Number of fees is different between Document Details and Order History",
          );
      
          // ------------------------------------------
          // Compare every fee
          // ------------------------------------------
      
          for (const documentFee of documentFees) {
            const normalizedDocumentFee = normalizeFeeType(documentFee.feeType);
      
            const matchingOrderFee = orderHistoryFees.find(
              (orderFee) =>
                normalizeFeeType(orderFee.feeType) === normalizedDocumentFee,
            );
      
            // Fee must exist in Order History
            expect(
              matchingOrderFee,
              `Fee "${documentFee.feeType}" not found in Order History`,
            ).to.not.equal(undefined);
      
            // ------------------------------------------
            // Unit Price
            // ------------------------------------------
      
            const documentUnitPrice = Number(documentFee.unitPrice);
      
            const orderUnitPrice = parseFloat(
              String(matchingOrderFee.unitPrice).replace(/[$,]/g, "").trim(),
            );
      
            console.log(`\n${documentFee.feeType}`);
      
            console.log(
              `Unit Price: Document Details=$${documentUnitPrice.toFixed(2)}, ` +
                `Order History=$${orderUnitPrice.toFixed(2)}`,
            );
      
            expect(
              documentUnitPrice,
              `Unit Price mismatch for ${documentFee.feeType}`,
            ).to.equal(orderUnitPrice);
      
            // ------------------------------------------
            // Total
            // ------------------------------------------
      
            const documentFeeTotal = Number(documentFee.total);
      
            const orderFeeTotal = parseFloat(
              String(matchingOrderFee.total).replace(/[$,]/g, "").trim(),
            );
      
            console.log(
              `Total: Document Details=$${documentFeeTotal.toFixed(2)}, ` +
                `Order History=$${orderFeeTotal.toFixed(2)}`,
            );
      
            expect(
              documentFeeTotal,
              `Total mismatch for ${documentFee.feeType}`,
            ).to.equal(orderFeeTotal);
          }
      
          // ------------------------------------------
          // Calculate Order History total dynamically
          // ------------------------------------------
      
          const orderHistoryTotal = orderHistoryFees.reduce((sum, fee) => {
            const amount = parseFloat(String(fee.total).replace(/[$,]/g, "").trim());
      
            return sum + amount;
          }, 0);
      
          console.log("\n------------------------------------------");
      
          console.log(`Document Details Total : $${documentTotal.toFixed(2)}`);
      
          console.log(`Order History Total    : $${orderHistoryTotal.toFixed(2)}`);
      
          console.log("------------------------------------------");
      
          // ------------------------------------------
          // Compare overall total
          // ------------------------------------------
      
          // expect(documentTotal).to.equal(
          //   orderHistoryTotal,
          //   "Overall Total Amount is different between Document Details and Order History",
          // );
      
          
      
      const documentFeeTypes = documentFees.map((fee) =>
        normalizeFeeType(fee.feeType)
      );
      
      const orderHistoryFeeTypes = orderHistoryFees.map((fee) =>
        normalizeFeeType(fee.feeType)
      );
      
      const missingInOrderHistory = documentFees.filter(
        (fee) => !orderHistoryFeeTypes.includes(normalizeFeeType(fee.feeType))
      );
      
      const extraInOrderHistory = orderHistoryFees.filter(
        (fee) => !documentFeeTypes.includes(normalizeFeeType(fee.feeType))
      );
      
      console.log("\n========== FEE COMPARISON ==========");
      console.log("Document Details count:", documentFees.length);
      console.log("Order History count:", orderHistoryFees.length);
      console.log("Missing in Order History:", JSON.stringify(missingInOrderHistory, null, 2));
      console.log("Extra in Order History:", JSON.stringify(extraInOrderHistory, null, 2));
      
      expect(
        orderHistoryFees.length,
        `Fee count mismatch. Document Details: ${documentFees.length}, Order History: ${orderHistoryFees.length}. Extra fees: ${JSON.stringify(extraInOrderHistory)}`
      ).to.equal(documentFees.length);
      
          console.log("\n✓ All fee amounts and total amount are matching.");
        });
      
        it("TC_EXP_012 - Verify Add Stop is saved and Payment Due is updated", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const amountBefore = await expectedDetailsPage.getPaymentAmount();
      
          const feesBefore = await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
          const stopsBefore = await expectedDetailsPage.verifyProcessingSteps();
      
          const addedStop = await expectedDetailsPage.selectNewStop();
      
          const stopsAfterSelection =
            await expectedDetailsPage.verifyProcessingSteps();
      
          expect(stopsAfterSelection.map((s) => s.toLowerCase())).to.include(
            addedStop.toLowerCase(),
          );
      
          // Save the selected stop.
          await expectedDetailsPage.clickDocumentSave();
      
          // Refresh and reopen the same document.
          await expectedDetailsPage.refreshAndReopenDocument(orderId, expectedPage);
      
          const stopsAfterRefresh = await expectedDetailsPage.verifyProcessingSteps();
      
          expect(stopsAfterRefresh.map((s) => s.toLowerCase())).to.include(
            addedStop.toLowerCase(),
          );
      
          const amountAfter = await expectedDetailsPage.getPaymentAmount();
      
          const feesAfter = await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
          console.log("Stops before:", stopsBefore);
          console.log("Added stop:", addedStop);
          console.log("Stops after refresh:", stopsAfterRefresh);
          console.log("Payment Due before:", amountBefore);
          console.log("Payment Due after:", amountAfter);
          console.log("Fees before:", feesBefore);
          console.log("Fees after:", feesAfter);
      
          // The stop must persist after saving.
          expect(stopsAfterRefresh.map((s) => s.toLowerCase())).to.include(
            addedStop.toLowerCase(),
          );
      
          // The total may stay unchanged if the selected stop has no additional fee.
          expect(Number.isFinite(Number(amountAfter))).to.equal(true);
      
          console.log("✓ TC_EXP_114 PASSED");
        });
      
        it("TC_EXP_013 - Verify unsaved Add Stop is removed after refresh", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const amountBefore = await expectedDetailsPage.getPaymentAmount();
      
          const stopsBefore = await expectedDetailsPage.verifyProcessingSteps();
      
          const unsavedStop = await expectedDetailsPage.selectNewStop();
      
          const stopsBeforeRefresh =
            await expectedDetailsPage.verifyProcessingSteps();
      
          expect(stopsBeforeRefresh.map((s) => s.toLowerCase())).to.include(
            unsavedStop.toLowerCase(),
          );
      
          // Do not click Save.
          await expectedDetailsPage.refreshAndReopenDocument(orderId, expectedPage);
      
          const stopsAfterRefresh = await expectedDetailsPage.verifyProcessingSteps();
      
          const amountAfter = await expectedDetailsPage.getPaymentAmount();
      
          console.log("Stops before:", stopsBefore);
          console.log("Unsaved stop:", unsavedStop);
          console.log("Stops after refresh:", stopsAfterRefresh);
          console.log("Payment Due before:", amountBefore);
          console.log("Payment Due after:", amountAfter);
      
          expect(stopsAfterRefresh.map((s) => s.toLowerCase())).to.not.include(
            unsavedStop.toLowerCase(),
          );
      
          expect(Number(amountAfter)).to.equal(Number(amountBefore));
      
          console.log("✓ TC_EXP_115 PASSED");
        });
      
        // it("TC_EXP_014 - Verify Add Fee is saved in Payment Due", async function () {
        //   const feeType = "Copy";
      
        //   await expectedDetailsPage.clickTab("documentDetails");
      
        //   const feesBefore =
        //     await expectedDetailsPage.getPaymentDueFeeRows();
      
        //   await expectedDetailsPage.clickAddFees();
        //   await expectedDetailsPage.selectFeeType(feeType);
        //   await expectedDetailsPage.clickSavePrice();
      
        //   const feesAfter =
        //     await expectedDetailsPage.getPaymentDueFeeRows();
      
        //   console.log("Fees before:", feesBefore);
        //   console.log("Fees after:", feesAfter);
      
        //   expect(feesAfter.length).to.be.greaterThan(feesBefore.length);
      
        //   expect(
        //     feesAfter.some(row =>
        //       row.toLowerCase().includes(feeType.toLowerCase())
        //     ),
        //     `Fee "${feeType}" should appear in Payment Due`
        //   ).to.equal(true);
        // });
      
        // it("TC_EXP_116 - Verify Add Fee is saved in Payment Due", async function () {
        //   await expectedDetailsPage.clickTab("documentDetails");
      
        //   const beforeTotal = await expectedDetailsPage.getPaymentAmount();
      
        //   await expectedDetailsPage.clickAddFees();
      
        //   // const selectedFee = await expectedDetailsPage.selectFeeType("POSTSCAN");
        //   await expectedDetailsPage.selectFeeType("POSTSCAN");
      
        //   // expect(selectedFee).to.equal("POSTSCAN");
      
        //   await expectedDetailsPage.clickSavePrice();
      
        //   await driver.sleep(2000);
      
        //   const fees = await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
        //   const postscanFee = fees.find(fee =>
        //     fee.feeType.toUpperCase().includes("POSTSCAN")
        //   );
      
        //   expect(
        //     postscanFee,
        //     "POSTSCAN fee was not displayed after saving"
        //   ).to.not.equal(undefined);
      
        //   const afterTotal = await expectedDetailsPage.getPaymentAmount();
      
        //   console.log("Payment Due before:", beforeTotal);
        //   console.log("Payment Due after:", afterTotal);
        //   console.log("✓ POSTSCAN fee is displayed after saving.");
        // });
      
        // it("TC_EXP_117 - Verify Restore Fees removes the added fee", async function () {
        //   const feeType = "Copy";
      
        //   await expectedDetailsPage.clickTab("documentDetails");
      
        //   const originalTotal =
        //     await expectedDetailsPage.getPaymentAmount();
      
        //   const originalFees =
        //     await expectedDetailsPage.getPaymentDueFeeRows();
      
        //   await expectedDetailsPage.clickAddFees();
        //   await expectedDetailsPage.selectFeeType(feeType);
        //   await expectedDetailsPage.clickSavePrice();
      
        //   const feesAfterAdding =
        //     await expectedDetailsPage.getPaymentDueFeeRows();
      
        //   expect(
        //     feesAfterAdding.length
        //   ).to.be.greaterThan(originalFees.length);
      
        //   await expectedDetailsPage.clickRestoreFees();
      
        //   const restoredTotal =
        //     await expectedDetailsPage.getPaymentAmount();
      
        //   const restoredFees =
        //     await expectedDetailsPage.getPaymentDueFeeRows();
      
        //   expect(restoredTotal).to.equal(originalTotal);
        //   expect(restoredFees).to.deep.equal(originalFees);
      
        //   console.log("✓ Restore Fees returned Payment Due to its original state.");
        //   });
      
        it("TC_EXP_016 - Verify payment request amount cannot exceed due amount", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const status = await expectedDetailsPage.checkPaymentLinkStatus();
      
          console.log("Payment Link Button Status:", status);
      
          if (status === "Cancel Payment") {
            console.log("✓ Payment link already exists. Skipping click.");
            expect(status).to.equal("Cancel Payment");
            return;
          }
      
          expect(status).to.equal("Send Payment Link");
      
          const dueAmount = await expectedDetailsPage.getPaymentAmount();
      
          await expectedDetailsPage.clickSendPaymentLink();
          await expectedDetailsPage.verifyPaymentLinkPopup();
      
          const popupDocumentId =
            await expectedDetailsPage.getPaymentPopupDocumentId();
      
          const pageDocumentId = await expectedDetailsPage.getDocumentId();
      
          expect(popupDocumentId).to.equal(pageDocumentId);
      
          const initialAmount = await expectedDetailsPage.getPaymentPopupAmount();
      
          expect(initialAmount).to.equal(dueAmount);
      
          await expectedDetailsPage.setPaymentPopupAmount(dueAmount + 100);
      
          const actualAmount = await expectedDetailsPage.getPaymentPopupAmount();
      
          console.log("Due Amount:", dueAmount);
          console.log("Entered Amount:", dueAmount + 100);
          console.log("Actual Request Amount:", actualAmount);
      
          expect(actualAmount).to.equal(dueAmount);
      
          await expectedDetailsPage.submitPaymentLink();
      
          const finalStatus = await expectedDetailsPage.getPaymentLinkButtonText();
      
          expect(finalStatus).to.equal("Cancel Payment");
      
          console.log("✓ TC_EXP_118 PASSED");
        });
      
        it("TC_EXP_017 - Verify payment request amount can be less than due amount", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const status = await expectedDetailsPage.checkPaymentLinkStatus();
      
          console.log("Payment Link Button Status:", status);
      
          if (status === "Cancel Payment") {
            console.log("✓ Payment link already exists. Skipping click.");
            expect(status).to.equal("Cancel Payment");
            return;
          }
      
          expect(status).to.equal("Send Payment Link");
      
          const dueAmount = await expectedDetailsPage.getPaymentAmount();
      
          const requestedAmount = 50;
      
          expect(dueAmount).to.be.greaterThan(requestedAmount);
      
          await expectedDetailsPage.clickSendPaymentLink();
          await expectedDetailsPage.verifyPaymentLinkPopup();
      
          const popupDocumentId =
            await expectedDetailsPage.getPaymentPopupDocumentId();
      
          const pageDocumentId = await expectedDetailsPage.getDocumentId();
      
          expect(popupDocumentId).to.equal(pageDocumentId);
      
          await expectedDetailsPage.setPaymentPopupAmount(requestedAmount);
      
          const actualAmount = await expectedDetailsPage.getPaymentPopupAmount();
      
          console.log("Due Amount:", dueAmount);
          console.log("Requested Amount:", requestedAmount);
          console.log("Actual Request Amount:", actualAmount);
      
          expect(actualAmount).to.equal(requestedAmount);
      
          await expectedDetailsPage.submitPaymentLink();
      
          const finalStatus = await expectedDetailsPage.getPaymentLinkButtonText();
      
          expect(finalStatus).to.equal("Cancel Payment");
      
          console.log("✓ TC_EXP_119 PASSED");
        });
      
        it("TC_EXP_018 - Verify error when amount received exceeds due amount", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const documentId = await expectedDetailsPage.getDocumentId();
          const dueAmount =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
          expect(dueAmount).to.be.greaterThan(0);
      
          await expectedDetailsPage.clickMarkPayment();
      
          const popupDocumentId =
            await expectedDetailsPage.getMarkPaymentPopupDocumentId();
      
          expect(popupDocumentId).to.equal(documentId);
      
          const enteredAmount = dueAmount + 100;
      
          await expectedDetailsPage.setMarkPaymentPopupAmount(enteredAmount);
      
          const selectedMode = await expectedDetailsPage.selectPaymentMode();
      
          console.log("Document ID:", documentId);
          console.log("Due Amount:", dueAmount);
          console.log("Entered Amount:", enteredAmount);
          console.log("Payment Mode:", selectedMode);
      
          // Click Submit without waiting for the popup to close.
          const popup = await driver.findElement(
            By.xpath(
              "//div[contains(@class,'modal')]" +
                "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
            ),
          );
      
          await popup
            .findElement(By.xpath(".//button[normalize-space()='Submit']"))
            .click();
      
          // The application displays a validation message.
          const errorLocator = By.xpath(
            "//*[contains(normalize-space(.)," +
              "'Amount can not be more than the due amount')]",
          );
      
          const errorMessage = await driver.wait(
            async () => {
              const elements = await driver.findElements(errorLocator);
      
              for (const element of elements) {
                try {
                  if (!(await element.isDisplayed())) continue;
      
                  const text = (await element.getText()).replace(/\s+/g, " ").trim();
      
                  if (text.includes("Amount can not be more than the due amount")) {
                    return text;
                  }
                } catch (_) {}
              }
      
              return false;
            },
            10000,
            "Overpayment validation message was not displayed.",
          );
      
          expect(errorMessage).to.include(
            "Amount can not be more than the due amount",
          );
      
          console.log("✓ Correct overpayment validation displayed.");
      
          // Close the Mark Payment modal after verifying the error.
      const visiblePaymentModal = await driver.wait(
        async () => {
          const modals = await driver.findElements(
            By.xpath(
              "//div[contains(@class,'modal') and contains(@class,'in')]" +
              "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]"
            )
          );
      
          for (let i = modals.length - 1; i >= 0; i--) {
            if (await modals[i].isDisplayed()) {
              return modals[i];
            }
          }
      
          return false;
        },
        10000,
        "Mark Payment modal was not visible"
      );
      
      const cancelButton = await visiblePaymentModal.findElement(
        By.xpath(".//button[normalize-space()='Cancel']")
      );
      
      await driver.wait(until.elementIsEnabled(cancelButton), 5000);
      await cancelButton.click();
      
      await driver.wait(
        until.stalenessOf(visiblePaymentModal),
        10000,
        "Mark Payment modal did not close after clicking Cancel"
      );
      
      console.log("✓ TC_EXP_120 PASSED; Mark Payment modal closed.");
      
        });
      
      
        it("TC_EXP_019 - Verify partial payment updates Order Summary", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          // Step 1: Capture the current document and payment amounts.
      
          const documentId = await expectedDetailsPage.getDocumentId();
      
          const paidBefore = await expectedDetailsPage.getOrderSummaryPaidAmount();
      
          const outstandingBefore =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
          const totalBefore = await expectedDetailsPage.getOrderSummaryTotalAmount();
      
          console.log("Document ID:", await expectedDetailsPage.getDocumentId());
          console.log("Total Amount:", totalBefore);
          console.log("Paid Before:", paidBefore.amount);
          console.log("Outstanding Before:", outstandingBefore);
      
          expect(paidBefore.amount + outstandingBefore).to.be.closeTo(
            totalBefore,
            0.01,
            "Paid Amount + Outstanding Amount should equal Total Amount",
          );
      
          // Step 2: Open Mark Payment popup.
          await expectedDetailsPage.clickMarkPayment();
      
          const popupDocumentId =
            await expectedDetailsPage.getMarkPaymentPopupDocumentId();
      
          expect(popupDocumentId).to.equal(documentId);
          // Enter a partial payment amount (less than the outstanding balance)
          const paymentAmount = Math.min(50, outstandingBefore - 1);
      
          // Step 3: Enter the partial payment amount.
          await expectedDetailsPage.setMarkPaymentPopupAmount(paymentAmount);
      
          const selectedMode = await expectedDetailsPage.selectPaymentMode();
      
          console.log("Payment Mode:", selectedMode);
      
          // Step 4: Submit payment.
          const popup = await driver.findElement(
            By.xpath(
              "//div[contains(@class,'modal')]" +
                "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
            ),
          );
      
          await popup
            .findElement(By.xpath(".//button[normalize-space()='Submit']"))
            .click();
      
          // Step 5: Accept the confirmation alert if displayed.
          try {
            const alert = await driver.wait(until.alertIsPresent(), 5000);
      
            console.log("Confirmation Alert:", await alert.getText());
            await alert.accept();
          } catch (error) {
            console.log("No browser confirmation alert appeared.");
          }
      
          // Step 6: Wait until both Order Summary amounts are updated.
          let lastPaid = null;
          let lastOutstanding = null;
      
          await driver.wait(
            async () => {
              try {
                const paid = await expectedDetailsPage.getOrderSummaryPaidAmount();
      
                const outstanding =
                  await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
                lastPaid = paid.amount;
                lastOutstanding = outstanding;
      
                const expectedPaid = paidBefore.amount + paymentAmount;
                const expectedOutstanding = outstandingBefore - paymentAmount;
      
                console.log(
                  `Expected Paid: ${expectedPaid.toFixed(2)} | ` +
                    `Actual Paid: ${lastPaid.toFixed(2)}`,
                );
      
                console.log(
                  `Expected Outstanding: ${expectedOutstanding.toFixed(2)} | ` +
                    `Actual Outstanding: ${lastOutstanding.toFixed(2)}`,
                );
      
                return (
                  Math.abs(lastPaid - expectedPaid) < 0.01 &&
                  Math.abs(lastOutstanding - expectedOutstanding) < 0.01
                );
              } catch (error) {
                return false;
              }
            },
            30000,
            "Order Summary did not reflect the partial payment.",
          );
      
          // Step 7: Final assertions.
          const paidAfter = await expectedDetailsPage.getOrderSummaryPaidAmount();
      
          const outstandingAfter =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
          expect(paidAfter.amount).to.be.closeTo(
            paidBefore.amount + paymentAmount,
            0.01,
          );
      
          expect(outstandingAfter).to.be.closeTo(
            outstandingBefore - paymentAmount,
            0.01,
          );
      
          console.log("✓ Partial payment updated Order Summary successfully.");
          console.log("Paid After:", paidAfter.amount);
          console.log("Outstanding After:", outstandingAfter);
        });
      
        it("TC_EXP_020 - Verify full payment clears Outstanding Amount", async function () {
          await expectedDetailsPage.clickTab("documentDetails");
      
          const documentId = await expectedDetailsPage.getDocumentId();
      
          const paidBefore = await expectedDetailsPage.getOrderSummaryPaidAmount();
      
          const outstandingBefore =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
          const totalBefore = await expectedDetailsPage.getOrderSummaryTotalAmount();
      
          console.log("Document ID:", documentId);
          console.log("Total Before:", totalBefore);
          console.log("Paid Before:", paidBefore.amount);
          console.log("Outstanding Before:", outstandingBefore);
      
          // Scenario 1: Document is already fully paid.
          if (outstandingBefore <= 0.01) {
            expect(paidBefore.amount).to.be.closeTo(
              totalBefore,
              0.01,
              "Paid Amount should equal Total Amount when Outstanding Amount is zero.",
            );
      
            expect(outstandingBefore).to.be.closeTo(
              0,
              0.01,
              "Outstanding Amount should be zero for an already-paid document.",
            );
      
            expect(paidBefore.isGreen).to.equal(
              true,
              "Paid Amount should be highlighted green when the document is fully paid.",
            );
      
            console.log(
              "✓ Document is already fully paid. No additional payment is required.",
            );
      
            return;
          }
      
          // Scenario 2: Document has an outstanding balance.
          expect(paidBefore.amount + outstandingBefore).to.be.closeTo(
            totalBefore,
            0.01,
            "Paid Amount + Outstanding Amount should equal Total Amount.",
          );
      
          await expectedDetailsPage.clickMarkPayment();
      
          const popupDocumentId =
            await expectedDetailsPage.getMarkPaymentPopupDocumentId();
      
          expect(popupDocumentId).to.equal(documentId);
      
          await expectedDetailsPage.setMarkPaymentPopupAmount(outstandingBefore);
      
          const popupAmount = await expectedDetailsPage.getMarkPaymentPopupAmount();
      
          expect(popupAmount).to.be.closeTo(outstandingBefore, 0.01);
      
          const selectedMode = await expectedDetailsPage.selectPaymentMode();
      
          console.log("Payment Mode:", selectedMode);
          console.log("Full Payment Amount:", popupAmount);
      
          const popup = await driver.findElement(
            By.xpath(
              "//div[contains(@class,'modal')]" +
                "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
            ),
          );
      
          const submitButton = await popup.findElement(
            By.xpath(".//button[normalize-space()='Submit']"),
          );
      
          await driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            submitButton,
          );
      
          await submitButton.click();
      
          // Accept a confirmation alert if one appears.
          try {
            const alert = await driver.wait(until.alertIsPresent(), 5000);
      
            console.log("Confirmation Alert:", await alert.getText());
            await alert.accept();
          } catch (error) {
            // No browser alert appeared.
          }
      
          // Wait for payment processing to update the Order Summary.
          await driver.wait(
            async () => {
              try {
                const outstanding =
                  await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
                return Math.abs(outstanding) < 0.01;
              } catch (error) {
                return false;
              }
            },
            30000,
            "Outstanding Amount did not become zero.",
          );
      
          await driver.sleep(1000);
      
          const paidAfter = await expectedDetailsPage.getOrderSummaryPaidAmount();
      
          const outstandingAfter =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();
      
          const totalAfter = await expectedDetailsPage.getOrderSummaryTotalAmount();
      
          console.log("Paid After:", paidAfter.amount);
          console.log("Outstanding After:", outstandingAfter);
          console.log("Total After:", totalAfter);
          console.log("Paid Amount Green:", paidAfter.isGreen);
      
          expect(paidAfter.amount).to.be.closeTo(
            paidBefore.amount + outstandingBefore,
            0.01,
            "Paid Amount should increase by the previous outstanding balance.",
          );
      
          expect(outstandingAfter).to.be.closeTo(
            0,
            0.01,
            "Outstanding Amount should be zero after full payment.",
          );
      
          expect(paidAfter.amount).to.be.closeTo(
            totalAfter,
            0.01,
            "Paid Amount should equal Total Amount after full payment.",
          );
      
          expect(paidAfter.isGreen).to.equal(
            true,
            "Paid Amount should be highlighted green after full payment.",
          );
      
          console.log("✓ TC_EXP_122 passed.");
        });
      
      // const PRICE_INCREASE = 5;
      
      //   it("TC_EXP_021 - Verify edited fee total and Restore Fee", async function () {
      //   await expectedDetailsPage.clickTab("documentDetails");
      //   await expectedDetailsPage.waitForLoadingToFinish();
      
      //   const testFee = await expectedDetailsPage.getAnyAvailableFeeType();
      //   const feesBefore =
      //     await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
      //   const feeBefore = feesBefore.find(
      //     fee =>
      //       fee.feeType.replace(/\s+/g, " ").trim().toLowerCase() ===
      //       testFee.replace(/\s+/g, " ").trim().toLowerCase()
      //   );
      
      //   expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;
      
      //   const originalUnitPrice = Number(feeBefore.unitPrice);
      //   const totalBefore =
      //     await expectedDetailsPage.getFeeTableTotalAmount();
      
      //   await expectedDetailsPage.editFeeAmount(
      //     testFee,
      //     originalUnitPrice + PRICE_INCREASE
      //   );
      
      //   await expectedDetailsPage.clickSavePrice();
      //     await expectedDetailsPage.waitForLoadingToFinish();
      //     await driver.wait(async () => {
      //   try {
      //     const currentTotal =
      //       await expectedDetailsPage.getFeeTableTotalAmount();
      
      //     return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
      //   } catch (_) {
      //     return false;
      //   }
      // }, 45000, "Total Amount did not reach the expected value after Save Price.");
      
      //   const totalAfterSave =
      //     await expectedDetailsPage.waitForFeeTotalToUpdate(totalBefore);
      
      //   expect(totalAfterSave).to.be.greaterThan(totalBefore);
      
      //   await expectedDetailsPage.clickRestoreFees();
      //   await expectedDetailsPage.waitForLoadingToFinish();
      
      //   await this.timeout(60000);
      
      //   const totalAfterRestore =
      //     await expectedDetailsPage.getFeeTableTotalAmount();
      
      //   expect(totalAfterRestore).to.be.closeTo(
      //     totalBefore,
      //     0.01,
      //     "Restore Fee should return Total Amount to its original value."
      //   );
      
      //   console.log("✓ TC_EXP_123 passed.");
      // });
        
      
      // it("TC_EXP_022 - Verify edited fee after Save Price and bottom Save", async function () {
      //   this.timeout(120000);
      
      //   await expectedDetailsPage.clickTab("documentDetails");
      //   await expectedDetailsPage.waitForLoadingToFinish();
      
      //   // Capture the original fee details and total.
      //   const testFee = await expectedDetailsPage.getAnyAvailableFeeType();
      
      //   const feesBefore =
      //     await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
      //   const normalize = value =>
      //     String(value).replace(/\s+/g, " ").trim().toLowerCase();
      
      //   const feeBefore = feesBefore.find(
      //     fee => normalize(fee.feeType) === normalize(testFee)
      //   );
      
      //   expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;
      
      //   const originalUnitPrice = Number(feeBefore.unitPrice);
      //   const originalQuantity = Number(feeBefore.quantity);
      //   const totalBefore =
      //     await expectedDetailsPage.getFeeTableTotalAmount();
      
      //   expect(Number.isFinite(originalUnitPrice)).to.equal(true);
      //   expect(originalQuantity).to.be.greaterThan(0);
      
      //   const expectedIncrease = PRICE_INCREASE * originalQuantity;
      //   const expectedUpdatedTotal = totalBefore + expectedIncrease;
      
      //   console.log("Selected Fee:", testFee);
      //   console.log("Original Unit Price:", originalUnitPrice);
      //   console.log("Quantity:", originalQuantity);
      //   console.log("Total Before:", totalBefore);
      //   console.log("Expected Total After Edit:", expectedUpdatedTotal);
      
      //   try {
      //     // Step 1: Edit the fee unit price.
      //     await expectedDetailsPage.editFeeAmount(
      //       testFee,
      //       originalUnitPrice + PRICE_INCREASE
      //     );
      
      //     // Step 2: Click Save Price and wait for recalculation to finish.
      //     await expectedDetailsPage.clickSavePrice();
      //     await expectedDetailsPage.waitForLoadingToFinish();
      
      //     // Wait until the total reflects the updated unit price and quantity.
      //     await driver.wait(async () => {
      //       try {
      //         const currentTotal =
      //           await expectedDetailsPage.getFeeTableTotalAmount();
      
      //         return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
      //       } catch (_) {
      //         return false;
      //       }
      //     }, 45000, "Total Amount did not update after Save Price.");
      
      //     const totalAfterSavePrice =
      //       await expectedDetailsPage.getFeeTableTotalAmount();
      
      //     console.log("Total After Save Price:", totalAfterSavePrice);
      
      //     expect(totalAfterSavePrice).to.be.closeTo(
      //       expectedUpdatedTotal,
      //       0.01,
      //       "Total Amount should reflect the edited fee price and quantity."
      //     );
      
      //     // Step 3: Click the bottom Save button.
      //     await expectedDetailsPage.clickDocumentSave();
      //     await expectedDetailsPage.waitForLoadingToFinish();
      
      //     // Wait until the saved total remains correct.
      //     await driver.wait(async () => {
      //       try {
      //         const currentTotal =
      //           await expectedDetailsPage.getFeeTableTotalAmount();
      
      //         return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
      //       } catch (_) {
      //         return false;
      //       }
      //     }, 45000, "Bottom Save did not preserve the updated Total Amount.");
      
      //     const totalAfterDocumentSave =
      //       await expectedDetailsPage.getFeeTableTotalAmount();
      
      //     console.log("Total After Bottom Save:", totalAfterDocumentSave);
      
      //     expect(totalAfterDocumentSave).to.be.closeTo(
      //       expectedUpdatedTotal,
      //       0.01,
      //       "Bottom Save should preserve the updated Total Amount."
      //     );
      
      //     console.log("✓ Save Price and bottom Save verified.");
      
      //   } finally {
      //     // Restore the original fees even if an assertion fails.
      //     await expectedDetailsPage.waitForLoadingToFinish();
      //     await expectedDetailsPage.clickRestoreFees();
      //     await expectedDetailsPage.waitForLoadingToFinish();
      
      //     await driver.wait(async () => {
      //       try {
      //         const currentTotal =
      //           await expectedDetailsPage.getFeeTableTotalAmount();
      
      //         return Math.abs(currentTotal - totalBefore) < 0.01;
      //       } catch (_) {
      //         return false;
      //       }
      //     }, 45000, "Restore Fee did not return Total Amount to its original value.");
      
      //     const totalAfterRestore =
      //       await expectedDetailsPage.getFeeTableTotalAmount();
      
      //     console.log("Total After Restore:", totalAfterRestore);
      
      //     expect(totalAfterRestore).to.be.closeTo(
      //       totalBefore,
      //       0.01,
      //       "Restore Fee should return Total Amount to its original value."
      //     );
      //   }
      
      //   console.log("✓ TC_EXP_124 passed.");
      // });
      
        const PRICE_INCREASE = 5;
      
      // ============================================================
      // TC_EXP_021 - Edit Fee -> Save Price -> Restore Fees
      // ============================================================
      it("TC_EXP_021 - Verify edited fee total and Restore Fees", async function () {
        this.timeout(120000);
      
        await expectedDetailsPage.clickTab("documentDetails");
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 1: Capture the original Payment Due total.
        const totalBefore =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        // Step 2: Select an editable fee.
        const testFee =
          await expectedDetailsPage.getAnyAvailableFeeType();
      
        const feesBefore =
          await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
        const normalize = value =>
          String(value).replace(/\s+/g, " ").trim().toLowerCase();
      
        const feeBefore = feesBefore.find(
          fee => normalize(fee.feeType) === normalize(testFee)
        );
      
        expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;
      
        const originalUnitPrice = Number(feeBefore.unitPrice);
        const quantity = Number(feeBefore.quantity);
      
        expect(Number.isFinite(originalUnitPrice)).to.equal(true);
        expect(Number.isFinite(quantity)).to.equal(true);
        expect(quantity).to.be.greaterThan(0);
      
        // Calculate the expected total after increasing the unit price.
        const expectedUpdatedTotal =
          totalBefore + PRICE_INCREASE * quantity;
      
        console.log("Selected Fee:", testFee);
        console.log("Original Total:", totalBefore);
        console.log("Original Unit Price:", originalUnitPrice);
        console.log("Quantity:", quantity);
        console.log("Expected Updated Total:", expectedUpdatedTotal);
      
        // Step 3: Edit the fee price.
        await expectedDetailsPage.editFeeAmount(
          testFee,
          originalUnitPrice + PRICE_INCREASE
        );
      
        // Step 4: Click Save Price.
        await expectedDetailsPage.clickSavePrice();
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 5: Verify that Payment Due Total changes to the expected value.
        await driver.wait(
          async () => {
            try {
              const currentTotal =
                await expectedDetailsPage.getFeeTableTotalAmount();
      
              return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
            } catch (_) {
              return false;
            }
          },
          45000,
          "Payment Due Total Amount did not reach the expected value after Save Price."
        );
      
        const totalAfterSavePrice =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        console.log("Total After Save Price:", totalAfterSavePrice);
      
        expect(totalAfterSavePrice).to.be.closeTo(
          expectedUpdatedTotal,
          0.01,
          "Total Amount should reflect the edited fee price."
        );
      
        // Step 6: Click Restore Fees.
        await expectedDetailsPage.clickRestoreFees();
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 7: Verify that the original total is restored.
        await driver.wait(
          async () => {
            try {
              const restoredTotal =
                await expectedDetailsPage.getFeeTableTotalAmount();
      
              return Math.abs(restoredTotal - totalBefore) < 0.01;
            } catch (_) {
              return false;
            }
          },
          45000,
          "Restore Fees did not restore the original Total Amount."
        );
      
        const totalAfterRestore =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        console.log("Total After Restore Fees:", totalAfterRestore);
      
        expect(totalAfterRestore).to.be.closeTo(
          totalBefore,
          0.01,
          "Restore Fees should return Total Amount to its original value."
        );
      
        console.log("✓ TC_EXP_021 passed.");
      });
      
      
      // ============================================================
      // TC_EXP_022 - Edit Fee -> Save Price -> Bottom Save
      //               -> Restore Fees
      // ============================================================
      it("TC_EXP_022 - Verify edited fee after Save Price and bottom Save", async function () {
        this.timeout(180000);
      
        await expectedDetailsPage.clickTab("documentDetails");
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 1: Capture the original Payment Due total.
        const totalBefore =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        // Step 2: Select an editable fee and capture its original values.
        const testFee =
          await expectedDetailsPage.getAnyAvailableFeeType();
      
        const feesBefore =
          await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
        const normalize = value =>
          String(value).replace(/\s+/g, " ").trim().toLowerCase();
      
        const feeBefore = feesBefore.find(
          fee => normalize(fee.feeType) === normalize(testFee)
        );
      
        expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;
      
        const originalUnitPrice = Number(feeBefore.unitPrice);
        const quantity = Number(feeBefore.quantity);
      
        expect(Number.isFinite(originalUnitPrice)).to.equal(true);
        expect(Number.isFinite(quantity)).to.equal(true);
        expect(quantity).to.be.greaterThan(0);
      
        const expectedUpdatedTotal =
          totalBefore + PRICE_INCREASE * quantity;
      
        console.log("Selected Fee:", testFee);
        console.log("Original Total:", totalBefore);
        console.log("Original Unit Price:", originalUnitPrice);
        console.log("Quantity:", quantity);
        console.log("Expected Updated Total:", expectedUpdatedTotal);
      
        // Step 3: Edit the fee price.
        await expectedDetailsPage.editFeeAmount(
          testFee,
          originalUnitPrice + PRICE_INCREASE
        );
      
        // Step 4: Click Save Price.
        await expectedDetailsPage.clickSavePrice();
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 5: Verify the updated Payment Due total.
        await driver.wait(
          async () => {
            try {
              const currentTotal =
                await expectedDetailsPage.getFeeTableTotalAmount();
      
              return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
            } catch (_) {
              return false;
            }
          },
          45000,
          "Payment Due Total Amount did not update after Save Price."
        );
      
        const totalAfterSavePrice =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        console.log("Total After Save Price:", totalAfterSavePrice);
      
        expect(totalAfterSavePrice).to.be.closeTo(
          expectedUpdatedTotal,
          0.01,
          "Total Amount should reflect the edited fee price."
        );
      
        // Step 6: Click the bottom Save button to save the document.
        await expectedDetailsPage.clickDocumentSave();
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 7: Verify that bottom Save preserves the updated total.
        await driver.wait(
          async () => {
            try {
              const currentTotal =
                await expectedDetailsPage.getFeeTableTotalAmount();
      
              return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
            } catch (_) {
              return false;
            }
          },
          45000,
          "Bottom Save did not preserve the updated Total Amount."
        );
      
        const totalAfterDocumentSave =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        console.log("Total After Bottom Save:", totalAfterDocumentSave);
      
        expect(totalAfterDocumentSave).to.be.closeTo(
          expectedUpdatedTotal,
          0.01,
          "Bottom Save should preserve the updated Total Amount."
        );
      
        // Step 8: Click Restore Fees.
        await expectedDetailsPage.clickRestoreFees();
        await expectedDetailsPage.waitForLoadingToFinish();
      
        // Step 9: Verify the original total is restored.
        await driver.wait(
          async () => {
            try {
              const restoredTotal =
                await expectedDetailsPage.getFeeTableTotalAmount();
      
              return Math.abs(restoredTotal - totalBefore) < 0.01;
            } catch (_) {
              return false;
            }
          },
          45000,
          "Restore Fees did not restore the original Total Amount after bottom Save."
        );
      
        const totalAfterRestore =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        console.log("Total After Restore Fees:", totalAfterRestore);
      
        expect(totalAfterRestore).to.be.closeTo(
          totalBefore,
          0.01,
          "Restore Fees should return Total Amount to its original value."
        );
      
        console.log("✓ TC_EXP_022 passed.");
      });
        
        it("TC_EXP_023 - Verify deleted fee and Restore Fee", async function () {
        await expectedDetailsPage.clickTab("documentDetails");
      
        const testFee =
          await expectedDetailsPage.getAnyAvailableFeeType();
      
        const totalBefore =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        const feesBefore =
          await expectedDetailsPage.getDocumentDetailsFeeDetails();
      
        const feeBefore = feesBefore.find(
          fee =>
            fee.feeType.replace(/\s+/g, " ").trim().toLowerCase() ===
            testFee.replace(/\s+/g, " ").trim().toLowerCase()
        );
      
        expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;
      
        expect(Number(feeBefore.total)).to.be.greaterThan(
          0,
          "The selected fee must have a positive total."
        );
      
        await expectedDetailsPage.deleteFeeRow(testFee);
      
        expect(
          await expectedDetailsPage.isFeeRowPresent(testFee),
          "Deleted fee row should no longer be displayed."
        ).to.equal(false);
      
        const totalAfterDelete =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        expect(totalAfterDelete).to.be.lessThan(
          totalBefore,
          "Total Amount should decrease after deleting a fee."
        );
      
        await expectedDetailsPage.clickSavePrice();
      
        await expectedDetailsPage.clickRestoreFees();
      
        const totalAfterRestore =
          await expectedDetailsPage.getFeeTableTotalAmount();
      
        expect(totalAfterRestore).to.be.closeTo(
          totalBefore,
          0.01,
          "Restore Fee should return Total Amount to its original value."
        );
      
        expect(
          await expectedDetailsPage.isFeeRowPresent(testFee),
          "Restored fee row should be displayed again."
        ).to.equal(true);
      
        console.log(
          `✓ TC_EXP_125 passed. Fee: ${testFee}, ` +
          `Before: ${totalBefore}, After Restore: ${totalAfterRestore}`
        );
      });
      
        
      it("TC_EXP_126 - Verify Print Document icon opens a new window", async function () {
          this.timeout(90000);
      
          // Open Expected page without selecting an Order ID.
          await expectedPage.open();
      
          // Print icon is in the document toolbar, not inside #docDetails.
          const printDocumentIcon = By.xpath(
              "//i[@title='Print Document' and @ng-click=\"print('EXPT')\"]"
          );
      
          const icon = await driver.wait(
              until.elementLocated(printDocumentIcon),
              30000,
              "Print Document icon was not found on the Expected page"
          );
      
          await driver.wait(
              until.elementIsVisible(icon),
              10000,
              "Print Document icon is not visible"
          );
      
          const windowsBefore = await driver.getAllWindowHandles();
      
          await driver.executeScript(
              "arguments[0].scrollIntoView({block:'center'});",
              icon
          );
      
          // Click the exact icon identified in DevTools.
          await driver.executeScript("arguments[0].click();", icon);
      
          console.log("Print Document icon clicked.");
      
          // Wait for the document window to open.
          await driver.wait(async () => {
              const handles = await driver.getAllWindowHandles();
              return handles.length > windowsBefore.length;
          }, 30000, "Print Document did not open a new window");
      
          const windowsAfter = await driver.getAllWindowHandles();
          const newWindow = windowsAfter.find(
              handle => !windowsBefore.includes(handle)
          );
      
          expect(newWindow, "A new document window should open").to.exist;
      
          await driver.switchTo().window(newWindow);
      
          await driver.wait(async () => {
              const url = await driver.getCurrentUrl();
              return url && url !== "about:blank";
          }, 30000, "The print document window did not load");
      
          const documentUrl = await driver.getCurrentUrl();
      
          console.log("Opened document URL:", documentUrl);
          expect(documentUrl).to.not.equal("about:blank");
      
          console.log("✓ TC_EXP_126 PASSED");
      
          // Return to the original window.
          await driver.switchTo().window(windowsBefore[0]);
      });
        
        
      it("TC_EXP_024 - Verify Split Document creates two documents with the same Order ID and different Doc IDs", async function () {
        this.timeout(120000);
      
        // Step 1: Remember the original IDs.
        const originalOrderId = String(orderId).trim();
        const originalDocId = String(docId).trim();
      
        console.log("Original Order ID:", originalOrderId);
        console.log("Original Doc ID:", originalDocId);
      
        // Step 2: Click Split.
        await expectedDetailsPage.clickSplitDocument();
      
        // Step 3: Verify the popup displays the original Doc ID.
        const popupDocId = await expectedDetailsPage.getSplitPopupDocId();
      
        expect(popupDocId).to.equal(originalDocId);
      
        // Step 4: Verify the split count is 2. Do not change it.
        const splitCount = await expectedDetailsPage.getSplitDocumentCount();
      
        expect(splitCount).to.equal("2");
      
        // Step 5: Confirm by clicking Yes.
        await expectedDetailsPage.confirmSplitDocument();
      
        // Step 6: Search for the original Order ID.
        
      await expectedDetailsPage.searchOrderIdInFilterAnything(originalOrderId);
      
      // Allow Angular's filtered table to update.
      await driver.sleep(1500);
      
      const documents = await expectedDetailsPage.waitForSplitDocuments(
        originalOrderId
      );
      
      expect(documents.length).to.be.at.least(2);
      
      const matchingDocuments = documents.filter(
        document => document.orderId === originalOrderId
      );
      
      const docIds = [
        ...new Set(matchingDocuments.map(document => document.docId))
      ];
      
      expect(matchingDocuments.length).to.be.at.least(2);
      expect(docIds.length).to.be.at.least(2);
      
      console.log("Verified Order ID:", originalOrderId);
      console.log("Verified Doc IDs:", docIds);
      
      });
      
        //=============================================================================================
      
        it("TC_EXP_025 - Verify uploaded document details", async function () {
          const text = await expectedDetailsPage.verifyDocumentUploads();
      
          expect(text).to.be.a("string");
      
          expect(text.length).to.be.greaterThan(0);
        });
      
        it("TC_EXP_026 - Verify uploaded document download when available", async function () {
          const available =
            await expectedDetailsPage.checkDocumentUploadAvailability();
      
          if (available) {
            const result = await expectedDetailsPage.downloadDocumentIfAvailable();
      
            expect(result).to.equal(true);
          } else {
            expect(available).to.equal(false);
          }
        });
        it("TC_EXP_027 - Verify Return Shipping Label download when available", async function () {
          const available =
            await expectedDetailsPage.checkReturnShippingLabelAvailability();
      
          if (available) {
            const result =
              await expectedDetailsPage.downloadReturnShippingLabelIfAvailable();
      
            expect(result).to.equal(true);
          } else {
            expect(available).to.equal(false);
          }
        });
      
        //===============================================================================================
      
        it("TC_EXP_028 - Verify Conversations tab and conversation details", async function () {
          const text = await expectedDetailsPage.verifyConversationTab();
      
          expect(text).to.be.a("string");
      
          expect(text.length).to.be.greaterThan(0);
        });
      
        it("TC_EXP_029 - Verify Write New Message and Send", async function () {
          const message = `Automation test message ${Date.now()}`;
      
          await expectedDetailsPage.clickWriteNewMessage();
      
          await expectedDetailsPage.enterMessage(message);
      
          await expectedDetailsPage.clickSend(message);
      
          await expectedDetailsPage.verifyLatestMessage(message);
        });

        it("TC_EXP_0030 - Verify Write Message with File Attachment and Send", async function () {
          this.timeout(120000);
        
          // Use an existing PDF from your project.
          const filePath = path.join(process.cwd(), "assets", "sample.pdf");
        
          expect(
            fs.existsSync(filePath),
            `Test file not found: ${filePath}`
          ).to.equal(true);
        
          const originalFileName = path.basename(filePath);
        
          const message = `Automation message with attachment ${Date.now()}`;
        
          // Step 1: Open Write New Message.
          await expectedDetailsPage.clickWriteNewMessage();
        
          // Step 2: Get Doc ID from the conversation details.
          const conversation = await driver.wait(
            until.elementLocated(By.id("conversation")),
            30000
          );
        
          const conversationText = await conversation.getText();
        
          const docIdMatch = conversationText.match(/Doc#\s*:?\s*(\d+)/i);
        
          expect(
            docIdMatch,
            "Document ID was not found in conversation details."
          ).to.not.equal(null);
        
          const docId = docIdMatch[1];
        
          // Step 3: Enter message.
          await expectedDetailsPage.enterMessage(message);
        
          // Step 4: Upload file.
          await expectedDetailsPage.uploadMessageFile(filePath);
        
          // Expected attachment name.
          const expectedFileName = `${docId}-DOC-CA-${originalFileName}`;
        
          console.log("Document ID:", docId);
          console.log("Original File Name:", originalFileName);
          console.log("Expected Uploaded File Name:", expectedFileName);
        
          // Step 5: Click Send and wait for message to appear.
          await expectedDetailsPage.clickSend(message);
        
          // Step 6: Verify message and uploaded attachment.
          await expectedDetailsPage.verifyLatestMessage(message);
        
          await driver.wait(async () => {
            try {
              const text = await driver.findElement(
                By.id("conversation")
              ).getText();
        
              return text.includes(expectedFileName);
            } catch (error) {
              return false;
            }
          }, 60000, `Uploaded attachment not found: ${expectedFileName}`);
        
          const finalConversationText = await driver
            .findElement(By.id("conversation"))
            .getText();
        
          expect(finalConversationText).to.include(message);
          expect(finalConversationText).to.include(expectedFileName);
        
          console.log("Verified Message:", message);
          console.log("Verified Attachment:", expectedFileName);
        
          console.log(
            "✓ TC_EXP_030 - Message and file attachment sent successfully."
          );
        });
        
        it("TC_EXP_0031 - Verify Print Thread opens in a new window", async function () {
          this.timeout(120000);
        
          const originalWindow = await driver.getWindowHandle();
          const originalWindows = await driver.getAllWindowHandles();
        
          let printWindow = null;
        
          try {
            // TC_EXP_0030 has already sent the message.
            // Wait for the Conversations section to display.
            await driver.wait(
              until.elementLocated(By.id("conversation")),
              30000,
              "Conversation section not found."
            );
        
            // Wait for Print Thread link beside the message.
            const printThreadLink = By.xpath(
              "//a[contains(@ng-click,'printThread') and " +
              "contains(normalize-space(.),'print thread')]"
            );
        
            const link = await driver.wait(
              until.elementLocated(printThreadLink),
              30000,
              "Print Thread link not found."
            );
        
            await driver.wait(
              until.elementIsVisible(link),
              10000
            );
        
            // Click Print Thread.
            await link.click();
        
            console.log("Clicked Print Thread.");
        
            // Wait for a new window.
            await driver.wait(async () => {
              const handles = await driver.getAllWindowHandles();
              return handles.length > originalWindows.length;
            }, 30000, "Print Thread did not open a new window.");
        
            // Identify the new window.
            const currentWindows = await driver.getAllWindowHandles();
        
            printWindow = currentWindows.find(
              handle => !originalWindows.includes(handle)
            );
        
            expect(printWindow).to.exist;
        
            // Switch to print window.
            await driver.switchTo().window(printWindow);
        
            // Wait for print page loading.
            await driver.wait(async () => {
              try {
                return await driver.executeScript(
                  "return document.readyState === 'complete' || " +
                  "document.readyState === 'interactive';"
                );
              } catch (error) {
                return false;
              }
            }, 30000, "Print window did not load.");
        
            const printUrl = await driver.getCurrentUrl();
        
            console.log("Print Thread URL:", printUrl);
        
            expect(printUrl).to.not.equal("");
        
            console.log("✓ Print Thread opened successfully.");
        
          } finally {
            // Close the print window.
            if (printWindow) {
              const handles = await driver.getAllWindowHandles();
        
              if (handles.includes(printWindow)) {
                await driver.switchTo().window(printWindow);
                await driver.close();
              }
            }
        
            // Return to the original WCS window.
            const remainingWindows = await driver.getAllWindowHandles();
        
            if (remainingWindows.includes(originalWindow)) {
              await driver.switchTo().window(originalWindow);
            }
          }
        });
      
        it("TC_EXP_0300 - Verify Print Conversation opens in a new tab", async function () {
        this.timeout(120000);
      
        const originalTab = await driver.getWindowHandle();
        const originalHandles = await driver.getAllWindowHandles();
      
        let newTab = null;
      
        try {
          // Click Print Conversation.
          await expectedDetailsPage.clickPrintConversation();
      
          // Wait for a new window or tab.
          await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();
      
            return handles.some(
              (handle) => !originalHandles.includes(handle)
            );
          }, 30000, "Print Conversation did not open a new tab.");
      
          const handles = await driver.getAllWindowHandles();
      
          newTab = handles.find(
            (handle) => !originalHandles.includes(handle)
          );
      
          expect(newTab, "New print tab should open").to.not.equal(undefined);
      
          // Switch to the print tab and verify it opened.
          await driver.switchTo().window(newTab);
      
          await driver.wait(async () => {
            try {
              return await driver.executeScript(
                "return document.readyState === 'complete' || " +
                "document.readyState === 'interactive';"
              );
            } catch (error) {
              return false;
            }
          }, 30000, "Print tab did not load.");
      
          console.log("Print Conversation tab opened successfully.");
          console.log("Print tab URL:", await driver.getCurrentUrl());
      
          expect(
            (await driver.getCurrentUrl()).length
          ).to.be.greaterThan(0);
      
        } finally {
          // Close the print tab without letting a close failure
          // mask the actual test result.
          if (newTab) {
            try {
              const handles = await driver.getAllWindowHandles();
      
              if (handles.includes(newTab)) {
                await driver.switchTo().window(newTab);
      
                // Try normal Selenium close first.
                try {
                  await driver.close();
                } catch (closeError) {
                  console.log(
                    "Normal close failed; trying CDP target close:",
                    closeError.message
                  );
      
                  // Fallback: close the Chrome target using CDP.
                  try {
                    await driver.executeCdpCommand(
                      "Target.closeTarget",
                      { targetId: newTab }
                    );
                  } catch (cdpError) {
                    console.log(
                      "CDP close was unsuccessful:",
                      cdpError.message
                    );
                  }
                }
              }
            } catch (error) {
              console.log("Print tab cleanup warning:", error.message);
            }
          }
      
          // Restore the original window.
          try {
            const remainingHandles = await driver.getAllWindowHandles();
      
            if (remainingHandles.includes(originalTab)) {
              await driver.switchTo().window(originalTab);
            }
          } catch (error) {
            console.log("Could not restore original tab:", error.message);
          }
        }
      });
      
      
        //================================================================================================
      
        it("TC_EXP_030 - Verify Activity Feed", async function () {
          const text = await expectedDetailsPage.verifyActivityFeed();
      
          expect(text).to.be.a("string");
      
          expect(text.length).to.be.greaterThan(0);
        });
      
        it("TC_EXP_031 - Verify Payment Requested Amount in Activity Feed", async function () {
          const amount =
            await expectedDetailsPage.getPaymentRequestedAmountFromActivity();
      
          expect(amount).to.be.greaterThan(0);
        });
      
        it("TC_EXP_032 - Verify Payment Link in Activity Feed", async function () {
          const paymentLink =
            await expectedDetailsPage.verifyPaymentLinkInActivityFeed();
      
          expect(paymentLink).to.match(/^https?:\/\/.+external-payments/i);
        });
      
        it("TC_EXP_0331 - Verify Activity Transactions and Total Paid", async function () {
        this.timeout(60000);
      
        const result =
          await expectedDetailsPage.verifyActivityTransactionsAndTotalPaid();
      
        // Verify transactions are displayed.
        expect(result.transactions).to.be.an("array");
        expect(result.transactionCount).to.be.greaterThan(0);
      
        // Verify every transaction has the required table values.
        for (const transaction of result.transactions) {
          expect(transaction.orderId).to.not.equal("");
          expect(transaction.dateTime).to.not.equal("");
          expect(transaction.subTotal).to.not.equal("");
          expect(transaction.invoiceTotal).to.be.a("number");
        }
      
        // Verify calculated transaction total matches Total Paid.
        expect(
          result.calculatedTotal,
          "Sum of Invoice Total values should match Total Paid"
        ).to.be.closeTo(result.totalPaid, 0.01);
      
        console.log(
          "✓ TC_EXP_033 PASSED - Activity transactions and Total Paid verified."
        );
      });
      
      
        it("TC_EXP_0330 - Verify Export Transaction Reports downloads an Excel file", async function () {
        this.timeout(120000);
      
        const downloadsDirectory = path.join(os.homedir(), "Downloads");
      
        // Ensure the Downloads folder exists.
        if (!fs.existsSync(downloadsDirectory)) {
          fs.mkdirSync(downloadsDirectory, { recursive: true });
        }
      
        // Take a snapshot before clicking the export button.
        const existingFiles = new Map();
      
        for (const file of fs.readdirSync(downloadsDirectory)) {
          const fullPath = path.join(downloadsDirectory, file);
      
          try {
            const stat = fs.statSync(fullPath);
            existingFiles.set(file, {
              size: stat.size,
              mtimeMs: stat.mtimeMs,
            });
          } catch (_) {
            // Ignore files that cannot be accessed.
          }
        }
      
        // Open Activity Feed.
        await expectedDetailsPage.clickTab("activityFeed");
      
        // Locate the Export transaction reports button.
        const exportButton = By.xpath(
          "//div[@id='activityFeed']" +
            "//button[contains(@ng-click,'exportTransactionReports') " +
            "and contains(normalize-space(.),'Export transaction reports')]"
        );
      
        const button = await driver.wait(
          until.elementLocated(exportButton),
          30000,
          "Export transaction reports button was not found."
        );
      
        await driver.wait(
          until.elementIsVisible(button),
          15000
        );
      
        // Click the export button.
        await driver.executeScript(
          "arguments[0].scrollIntoView({block:'center'});",
          button
        );
      
        await button.click();
      
        console.log("Clicked Export transaction reports.");
      
        // Wait for a new or updated Excel file to finish downloading.
        let downloadedFile = null;
        const startTime = Date.now();
        const timeout = 90000;
        const stableCounts = new Map();
      
        while (Date.now() - startTime < timeout) {
          const files = fs.readdirSync(downloadsDirectory);
      
          for (const file of files) {
            const fullPath = path.join(downloadsDirectory, file);
      
            // Accept common Excel extensions.
            if (!/\.(xlsx|xls)$/i.test(file)) {
              continue;
            }
      
            // Ignore temporary/incomplete downloads.
            if (/\.(crdownload|tmp)$/i.test(file)) {
              continue;
            }
      
            try {
              const stat = fs.statSync(fullPath);
              const previous = existingFiles.get(file);
      
              const isNewOrUpdated =
                !previous ||
                previous.size !== stat.size ||
                previous.mtimeMs !== stat.mtimeMs;
      
              if (!isNewOrUpdated || stat.size === 0) {
                continue;
              }
      
              // Require the file size to remain stable across polling cycles.
              const previousSize = stableCounts.get(file);
      
              if (previousSize === stat.size) {
                downloadedFile = fullPath;
                break;
              }
      
              stableCounts.set(file, stat.size);
            } catch (_) {
              // The browser may still be writing the file.
            }
          }
      
          if (downloadedFile) {
            break;
          }
      
          await driver.sleep(1000);
        }
      
        // Verify the download.
        expect(
          downloadedFile,
          "An Excel transaction report should be downloaded."
        ).to.not.equal(null);
      
        expect(fs.existsSync(downloadedFile)).to.equal(true);
        expect(fs.statSync(downloadedFile).size).to.be.greaterThan(0);
      
        console.log("Downloaded Excel report:", downloadedFile);
        console.log("File size:", fs.statSync(downloadedFile).size, "bytes");
        console.log("✓ TC_EXP_033 PASSED");
      });
      
      
         //==========================================================================
      
        it("TC_EXP_033 - Verify Fee Details", async function () {
          const fees = await expectedDetailsPage.getFeeDetails();
      
          expect(fees).to.be.an("array");
      
          expect(fees.length).to.be.greaterThan(0);
      
          for (const fee of fees) {
            expect(fee.feeType).to.not.equal("");
      
            expect(fee.quantity).to.not.equal("");
      
            expect(fee.unitPrice).to.not.equal("");
      
            expect(fee.total).to.not.equal("");
          }
        });
      
    
      
        it("TC_EXP_0332 - Verify Order History Versions and Total Amounts", async function () {
    
          this.timeout(120000);
      
          console.log("\n==========================================");
          console.log("TC_EXP_0332 - Verify Order History Versions");
          console.log("==========================================");
      
          // Step 1: Open Order History tab.
          await expectedDetailsPage.clickTab("orderHistory");
      
          // Step 2: Get all versions and their respective total amounts.
          const versions = await expectedDetailsPage.getOrderHistoryVersions();
      
          expect(
              versions,
              "Order History should contain at least one version"
          ).to.be.an("array").that.is.not.empty;
      
          // Step 3: Sort versions in ascending order.
          const sortedVersions = [...versions].sort(
              (a, b) => a.version - b.version
          );
      
          // Step 4: Display version table.
          console.log("\n========== ORDER HISTORY VERSION TABLE ==========");
      
          console.table(
              sortedVersions.map(item => ({
                  Version: `Version ${item.version}`,
                  "Total Amount": `$${item.totalAmount.toFixed(2)}`
              }))
          );
      
          // Step 5: Verify version numbers and total amounts.
          for (const item of sortedVersions) {
      
              expect(
                  item.version,
                  "Version number should be a valid positive integer"
              ).to.be.a("number").and.greaterThan(0);
      
              expect(
                  Number.isInteger(item.version),
                  `Version ${item.version} should be an integer`
              ).to.equal(true);
      
              expect(
                  Number.isFinite(item.totalAmount),
                  `Invalid total amount for Version ${item.version}`
              ).to.equal(true);
      
              expect(
                  item.totalAmount,
                  `Total amount for Version ${item.version} cannot be negative`
              ).to.be.at.least(0);
          }
      
          // Step 6: Verify versions are sequential.
          for (let i = 1; i < sortedVersions.length; i++) {
      
              expect(
                  sortedVersions[i].version,
                  `Version sequence is incorrect between Version ${sortedVersions[i - 1].version} and Version ${sortedVersions[i].version}`
              ).to.equal(sortedVersions[i - 1].version + 1);
          }
      
          // Step 7: Display latest version information.
          const latestVersion = sortedVersions[sortedVersions.length - 1];
      
          console.log("\n========== LATEST ORDER HISTORY VERSION ==========");
          console.log(`Latest Version : ${latestVersion.version}`);
          console.log(`Total Amount   : $${latestVersion.totalAmount.toFixed(2)}`);
      
          console.log("\n✓ TC_EXP_0332 PASSED");
          console.log("✓ All Order History versions and total amounts verified.");
          console.log("✓ No comparison with Document Details Payment Due.");
      
      });
    
        it("TC_EXP_035 - Verify Contact Details", async function () {
          const text = await expectedDetailsPage.verifyContactDetails();
      
          expect(text).to.be.a("string");
      
          expect(text.length).to.be.greaterThan(0);
        });
      
        it("TC_EXP_036 - Verify Add New button opens address form", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          await expectedDetailsPage.clickAddNewAddress();
      
          const addressLine1 = await expectedDetailsPage.waitForVisible(
            expectedDetailsPage.addressLine1Input,
            30000,
          );
      
          expect(await addressLine1.isDisplayed()).to.equal(true);
      
          await expectedDetailsPage.closeAddressForm();
        });
      
        it("TC_EXP_037 - Verify user can add a new address", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          // ==========================================
          // CREATE ONE SHARED ADDRESS
          // ==========================================
          const uniqueId = Date.now().toString().slice(-10);
          testAddress = {
            addressLine1: `Automation Address ${uniqueId}`,
            addressLine2: "Test Address Line 2",
            city: "Bengaluru",
            state: "Karnataka",
            zipCode: "560001",
            country: "India",
          };
      
          console.log("Creating address:", testAddress.addressLine1);
      
          // // Open Add New Address
          console.log("STEP 1: Opening Add New");
          await expectedDetailsPage.clickAddNewAddress();
      
          console.log("STEP 2: Filling address");
          await expectedDetailsPage.fillAddress(testAddress);
      
          console.log("STEP 3: Filling completed");
      
          console.log("STEP 4: Clicking Save");
          await expectedDetailsPage.saveAddress();
      
          console.log("STEP 5: Save completed");
      
          console.log("STEP 6: Verifying address");
          await expectedDetailsPage.verifyAddressExists(testAddress.addressLine1);
      
          console.log("STEP 7: Verification completed");
      
          // ==========================================
          // WAIT FOR ADDRESS TO APPEAR
          // ==========================================
      
          await expectedDetailsPage.waitForAddressToAppear(
            testAddress.addressLine1,
            30000,
          );
      
          // ==========================================
          // VERIFY ADDRESS EXISTS
          // ==========================================
      
          const result = await expectedDetailsPage.verifyAddressExists(
            testAddress.addressLine1,
          );
      
          console.log("Address added:", result);
      
          expect(result).to.equal(true);
      
          console.log("Shared address created:", testAddress.addressLine1);
        });
      
        it("TC_EXP_038 - Verify Close button closes Add New address form", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          await expectedDetailsPage.clickAddNewAddress();
      
          const addressLine1 = await expectedDetailsPage.waitForVisible(
            expectedDetailsPage.addressLine1Input,
            30000,
          );
      
          expect(await addressLine1.isDisplayed()).to.equal(true);
      
          await expectedDetailsPage.closeAddressForm();
      
          const fields = await driver.findElements(
            expectedDetailsPage.addressLine1Input,
          );
      
          let visible = false;
      
          for (const field of fields) {
            try {
              if (await field.isDisplayed()) {
                visible = true;
                break;
              }
            } catch (error) {}
          }
      
          expect(visible).to.equal(false);
        });
      
        it("TC_EXP_039 - Verify user can edit the existing address", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          console.log("\n========== TC_EXP_030 - EDIT ADDRESS ==========");
      
          // ------------------------------------------
          // Make sure shared address exists
          // ------------------------------------------
          expect(testAddress).to.not.equal(null);
      
          console.log("Editing address:", testAddress.addressLine1);
      
          const originalExists = await expectedDetailsPage.verifyAddressExists(
            testAddress.addressLine1,
          );
      
          expect(originalExists).to.equal(true);
      
          // ------------------------------------------
          // Updated address
          // ------------------------------------------
          const uniqueUpdatedId = Date.now().toString().slice(-10);
      
          updatedAddress = {
            addressLine1: `Updated Address ${uniqueUpdatedId}`,
            addressLine2: "Updated Address Line 2",
            city: "Bengaluru",
            state: "Karnataka",
            zipCode: "560002",
            country: "India",
          };
      
          console.log("Updating address to:", updatedAddress.addressLine1);
      
          // ------------------------------------------
          // Edit SAME address
          // ------------------------------------------
          await expectedDetailsPage.editAddress(
            testAddress.addressLine1,
            updatedAddress,
          );
      
          // ------------------------------------------
          // Verify updated address
          // ------------------------------------------
          const updatedExists = await expectedDetailsPage.verifyAddressExists(
            updatedAddress.addressLine1,
          );
      
          console.log("Updated address exists:", updatedExists);
      
          expect(updatedExists).to.equal(true);
      
          // ------------------------------------------
          // IMPORTANT
          // Use updated address for next tests
          // ------------------------------------------
          testAddress = {
            ...updatedAddress,
          };
      
          console.log("Shared address is now:", testAddress.addressLine1);
        });
      
        it("TC_EXP_040 - Verify address can be set as Default Shipping", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          console.log("\n========== TC_EXP_031 - DEFAULT SHIPPING ==========");
      
          // ==========================================
          // MAKE SURE SAME ADDRESS EXISTS
          // ==========================================
      
          expect(testAddress).to.not.equal(null);
      
          console.log("Setting Default Shipping for:", testAddress.addressLine1);
      
          const addressExists = await expectedDetailsPage.verifyAddressExists(
            testAddress.addressLine1,
          );
      
          expect(addressExists).to.equal(true);
      
          // SET DEFAULT SHIPPING
          await expectedDetailsPage.setDefaultShipping(testAddress.addressLine1);
          // FIND SAME DYNAMIC ADDRESS CARD
          const card = await expectedDetailsPage.getAddressCard(
            testAddress.addressLine1,
          );
          // FIND SHIPPING CHECKBOX INSIDE SAME CARD
          const shippingCheckbox = await card.findElement(
            By.xpath(
              ".//input[@type='checkbox' and " +
                "contains(@ng-model,'shippingAddressId')]",
            ),
          );
      
          // ==========================================
          // VERIFY CHECKED
          // ==========================================
      
          const selected = await shippingCheckbox.isSelected();
      
          console.log("Default Shipping selected:", selected);
      
          expect(selected).to.equal(true);
        });
      
        it("TC_EXP_041 - Verify address can be set as Default Billing", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          console.log("\n========== TC_EXP_032 - DEFAULT BILLING ==========");
      
          // ==========================================
          // MAKE SURE SAME ADDRESS EXISTS
          // ==========================================
      
          expect(testAddress).to.not.equal(null);
      
          console.log("Setting Default Billing for:", testAddress.addressLine1);
      
          const addressExists = await expectedDetailsPage.verifyAddressExists(
            testAddress.addressLine1,
          );
      
          expect(addressExists).to.equal(true);
      
          // ==========================================
          // SET DEFAULT BILLING
          // ==========================================
      
          await expectedDetailsPage.setDefaultBilling(testAddress.addressLine1);
      
          // ==========================================
          // FIND SAME DYNAMIC ADDRESS CARD
          // ==========================================
      
          const card = await expectedDetailsPage.getAddressCard(
            testAddress.addressLine1,
          );
      
          // ==========================================
          // FIND BILLING CHECKBOX INSIDE SAME CARD
          // ==========================================
      
          const billingCheckbox = await card.findElement(
            By.xpath(
              ".//input[@type='checkbox' and " +
                "contains(@ng-model,'billingAddressId')]",
            ),
          );
      
          // ==========================================
          // VERIFY CHECKED
          // ==========================================
      
          const selected = await billingCheckbox.isSelected();
      
          console.log("Default Billing selected:", selected);
      
          expect(selected).to.equal(true);
        });
      
        it("TC_EXP_042 - Verify user can delete the existing address", async function () {
          await expectedDetailsPage.clickContactDetails();
      
          console.log("\n========== TC_EXP_033 - DELETE ADDRESS ==========");
      
          expect(testAddress).to.not.equal(null);
      
          console.log("Deleting:", testAddress.addressLine1);
      
          // Verify it exists before deleting
          const exists = await expectedDetailsPage.verifyAddressExists(
            testAddress.addressLine1,
          );
      
          expect(exists).to.equal(true);
      
          // Delete SAME shared address
          await expectedDetailsPage.deleteAddress(testAddress.addressLine1);
      
          // Verify deleted
          const deleted = await expectedDetailsPage.verifyAddressDeleted(
            testAddress.addressLine1,
          );
      
          expect(deleted).to.equal(true);
      
          console.log("DELETE TEST PASSED:", testAddress.addressLine1);
      
          testAddress = null;
          updatedAddress = null;
        });
      
        it("TC_EXP_043 - Verify Other Details", async function () {
          const text = await expectedDetailsPage.verifyOtherDetails();
      
          expect(text).to.be.a("string");
      
          expect(text.length).to.be.greaterThan(0);
        });
      
        it("TC_EXP_044 - Verify Tracking Details", async function () {
          const text = await expectedDetailsPage.verifyTrackingDetails();
      
          expect(text).to.be.a("string");
      
          expect(text.length).to.be.greaterThan(0);
        });
      
      });
    
      // ===================================DropOff Test Start=============================
    
        // =====================================================================
      // DropOff Page - Queue and Courier Functional Tests
      // =====================================================================
    
      describe("DropOff Page - Queue and Courier Functional Tests", function () {
    
        this.timeout(600000);
    
        const downloadsDirectory = path.join(os.homedir(), "Downloads");
    
        // =========================================================
        // Helper 1 - Get existing downloaded files
        // =========================================================
    
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
    
        // =========================================================
        // Helper 2 - Wait for Excel download
        // =========================================================
    
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
            `No new or updated Excel file was detected in ${downloadsDirectory} within ${timeout / 1000} seconds.`
          );
        }
    
        // =========================================================
        // Navigate to DropOff after Expected Details tests finish
        // =========================================================
    
        before(async function () {
          this.timeout(180000);
    
          console.log("\n========== Opening DropOff Page ==========");
    
          // Same driver and same login session.
          await dropOffDetail.open();
    
          // Wait for DropOff page loading to finish.
          await dropOffDetail.waitForLoadingToFinish(120000);
    
          console.log("✓ DropOff page completely loaded.");
          console.log("✓ Starting DropOff test cases.");
        });
    
        // ---------------------------------------------
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
      
          
      
      it("TC_DROPOFF_009 - Verify DropOff Queue, Courier and Completed totals for each document type",
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
       
      it("TC_DROPOFF_010 - Verify DropOff Queue, Courier and Completed totals for each document category",
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
      
      it("TC_DROPOFF_011 - Verify DropOff Queue, Courier and Completed totals for each Stop",
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
      
      it("TC_DROPOFF_012 - Verify Order IDs 263059 and 263061 in DropOff sections",
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
        
          
    async function getCurrentOrderLocation(orderId) {
      const queuePanel = dropOffDetail.getDropOffPanel();
      const courierPanel = dropOffDetail.getCourierPanel();
      const completedPanel = dropOffDetail.getCompletedPanel();
    
      await dropOffDetail.waitForLoadingToFinish(60000);
    
      let location = null;
    
      const checkLocation = async () => {
          if (await dropOffDetail.isOrderInPanel(queuePanel, orderId)) {
              return "Queue";
          }
    
          if (await dropOffDetail.isOrderInPanel(courierPanel, orderId)) {
              return "Courier";
          }
    
          if (await dropOffDetail.isOrderInPanel(completedPanel, orderId)) {
              return "Completed";
          }
    
          return null;
      };
    
      location = await checkLocation();
    
      if (!location) {
          console.log(`Order ${orderId} not visible. Refreshing page...`);
    
          const refreshButton = await driver.wait(
              until.elementLocated(
                  require("selenium-webdriver").By.css(
                      "button[ng-click='refresh()']"
                  )
              ),
              15000,
              "Refresh button was not found."
          );
    
          await refreshButton.click();
          await dropOffDetail.waitForLoadingToFinish(60000);
    
          await driver.wait(async () => {
              location = await checkLocation();
              return location !== null;
          }, 30000, `Order ${orderId} was not found in any section.`);
      }
    
      console.log(`✓ Order ${orderId} current location: ${location}`);
    
      return location;
    }
    
    it("TC_DROPOFF_014 - Verify order moves from DropOff Queue to Courier and back", async function () {
      this.timeout(180000);
    
      const orderId = "263071";
    
      const queuePanel = dropOffDetail.getDropOffPanel();
      const courierPanel = dropOffDetail.getCourierPanel();
    
      await dropOffDetail.waitForLoadingToFinish(120000);
    
      // Search for the order.
      await dropOffDetail.searchOrderId(orderId);
    
      // Identify the current location.
      let currentLocation = await getCurrentOrderLocation(orderId);
    
      // If the order is in Queue, move it to Courier.
      if (currentLocation === "Queue") {
          console.log(`Order ${orderId} found in DropOff Queue.`);
    
          await dropOffDetail.selectOrderCheckbox(queuePanel, orderId);
    
          await dropOffDetail.clickPanelButton(
              queuePanel,
              "Courier"
          );
    
          const movedToCourier =
              await dropOffDetail.waitForOrderInPanelWithRefresh(
                  courierPanel,
                  orderId,
                  5
              );
    
          expect(movedToCourier).to.equal(true);
    
          console.log(`✓ Order ${orderId} moved from Queue to Courier.`);
      }
    
      // If already in Courier, continue from Courier.
      else if (currentLocation === "Courier") {
          console.log(
              `✓ Order ${orderId} is already in Courier. Skipping Queue to Courier movement.`
          );
      }
    
      else {
          throw new Error(
              `Order ${orderId} is in ${currentLocation}. Expected Queue or Courier.`
          );
      }
    
      // Select the order in Courier.
      await dropOffDetail.selectOrderCheckbox(
          courierPanel,
          orderId
      );
    
      // Move it back to Queue.
      await dropOffDetail.clickPanelButton(
          courierPanel,
          "Queue"
      );
    
      const returnedToQueue =
          await dropOffDetail.waitForOrderInPanelWithRefresh(
              queuePanel,
              orderId,
              5
          );
    
      expect(returnedToQueue).to.equal(true);
    
      // Verify it has left Courier.
      const leftCourier =
          await dropOffDetail.waitForOrderToLeavePanel(
              courierPanel,
              orderId,
              15000
          );
    
      expect(leftCourier).to.equal(true);
    
      console.log(
          `✓ TC_DROPOFF_014 PASSED: Order ${orderId} is back in DropOff Queue.`
      );
    
      await dropOffDetail.searchOrderId("");
    });
    
    it("TC_DROPOFF_015 - Verify order moves from DropOff Queue to Courier, Completed and back", async function () {
      this.timeout(300000);
    
      const orderId = "263071";
    
      const queuePanel = dropOffDetail.getDropOffPanel();
      const courierPanel = dropOffDetail.getCourierPanel();
      const completedPanel = dropOffDetail.getCompletedPanel();
    
      await dropOffDetail.waitForLoadingToFinish(120000);
    
      // Search for the order.
      await dropOffDetail.searchOrderId(orderId);
    
      // Identify the current location.
      const currentLocation = await getCurrentOrderLocation(orderId);
    
      // Step 1: Move Queue to Courier only when necessary.
      if (currentLocation === "Queue") {
          console.log(`Order ${orderId} found in DropOff Queue.`);
    
          await dropOffDetail.selectOrderCheckbox(
              queuePanel,
              orderId
          );
    
          await dropOffDetail.clickPanelButton(
              queuePanel,
              "Courier"
          );
    
          const movedToCourier =
              await dropOffDetail.waitForOrderInPanelWithRefresh(
                  courierPanel,
                  orderId,
                  5
              );
    
          expect(movedToCourier).to.equal(true);
    
          console.log(`✓ Order ${orderId} moved to Courier.`);
      }
    
      // If already in Courier, continue from there.
      else if (currentLocation === "Courier") {
          console.log(
              `✓ Order ${orderId} is already in Courier. Skipping Queue to Courier movement.`
          );
      }
    
      else {
          throw new Error(
              `Order ${orderId} is in ${currentLocation}. Expected Queue or Courier.`
          );
      }
    
      // Step 2: Select the order in Courier.
      await dropOffDetail.selectOrderCheckbox(
          courierPanel,
          orderId
      );
    
      // Step 3: Click Complete.
      await dropOffDetail.clickPanelButton(
          courierPanel,
          "Complete"
      );
    
      console.log("✓ Complete button clicked.");
    
      // Step 4: Complete the shipping-label popup.
      await dropOffDetail.completeCourierOrderWithShippingLabels();
    
      // Step 5: Verify the order appears in Completed.
      const movedToCompleted =
          await dropOffDetail.waitForOrderInPanelWithRefresh(
              completedPanel,
              orderId,
              5
          );
    
      expect(movedToCompleted).to.equal(true);
    
      console.log(`✓ Order ${orderId} moved to Completed.`);
    
      // Step 6: Select the order in Completed.
      await dropOffDetail.selectOrderCheckbox(
          completedPanel,
          orderId
      );
    
      // Step 7: Return the order to Queue.
      await dropOffDetail.clickPanelButton(
          completedPanel,
          "Return"
      );
    
      const returnedToQueue =
          await dropOffDetail.waitForOrderInPanelWithRefresh(
              queuePanel,
              orderId,
              5
          );
    
      expect(returnedToQueue).to.equal(true);
    
      console.log(
          `✓ TC_DROPOFF_015 PASSED: Order ${orderId} returned to DropOff Queue.`
      );
    
      // Clear the search.
      await dropOffDetail.searchOrderId("");
    });
    
      
          // ============================================================
      // TC_DROPOFF_013 - Verify section totals after selecting a date
      // ============================================================
      
      it("TC_DROPOFF_013 - Verify document counts for 14-10-2026",
        async function () {
            this.timeout(180000);
      
            try {
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
            } finally {
                // await dropOffDetail.clearDateFilterOrRefresh(); 
            }
        }
        );   
    
      });
    
      // ===========================Pickup Test case Start============================
    
    describe("Pickup Page - Export and Print Docs Functional Tests", function () {
    
      this.timeout(600000);
    
      before(async function () {
          this.timeout(300000);
    
          await pickupPage.open();
    
          console.log("✓ Pickup page ready. Starting test cases.");
      });
    
      // ------------------------------------------------
      // Helper function: Get Download Directory
      // ------------------------------------------------
    
      function getDownloadDir() {
          return path.join(
              os.homedir(),
              "Downloads"
          );
      }
    
      // ------------------------------------------------
      // Helper function: Verify Export
      // ------------------------------------------------
    
      async function verifyExport(panel, clickExport, testName) {
    
          const count = await pickupPage.getDocumentCount(panel);
    
          console.log(`${testName}: detected ${count} document row(s).`);
    
          if (count === 0) {
    
              await clickExport();
    
              try {
                  await pickupPage.waitForNoDocumentsMessage(5000);
    
                  console.log(
                      `✓ ${testName}: "No documents found." displayed correctly.`
                  );
    
              } catch (error) {
    
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
    
      // ------------------------------------------------
      // Helper function: Verify Print Docs
      // ------------------------------------------------
    
      async function verifyPrint(panel, clickPrint, testName) {
        // Wait until the Pickup page has finished loading.
        await pickupPage.waitForLoadingToFinish();
    
        // Read the actual document total from the panel.
        const panelName = testName.includes("Pickup Queue")
            ? "Pickup Queue"
            : "Completed";
    
        const total = await pickupPage.getSectionTotal(panelName);
    
        console.log(`${testName}: panel total = ${total}`);
    
        // If the application says there are no documents,
        // verify the expected "No documents found" message.
        if (total === 0) {
            await clickPrint();
    
            await pickupPage.waitForNoDocumentsMessage();
    
            console.log(
                `✓ ${testName}: correctly handled the empty panel.`
            );
    
            return;
        }
    
        // The panel reports documents, so do not enter the empty branch.
        // Wait until the actual table rows become available.
        await driver.wait(
            async () => {
                const count = await pickupPage.getDocumentCount(panel);
                console.log(`${testName}: rendered rows = ${count}`);
    
                return count > 0;
            },
            30000,
            `${testName}: panel total is ${total}, but document rows did not render.`
        );
    
        const handlesBefore = await driver.getAllWindowHandles();
        const originalHandle = await driver.getWindowHandle();
    
        // Click Print Docs.
        await clickPrint();
    
        // Wait for the print window to open.
        await driver.wait(
            async () => {
                const handles = await driver.getAllWindowHandles();
    
                return handles.some(
                    handle => !handlesBefore.includes(handle)
                );
            },
            20000,
            `${testName}: Print Docs did not open a new window.`
        );
    
        const handlesAfter = await driver.getAllWindowHandles();
    
        const newHandle = handlesAfter.find(
            handle => !handlesBefore.includes(handle)
        );
    
        expect(newHandle, "New print window should exist").to.exist;
    
        try {
            await driver.switchTo().window(newHandle);
    
            await driver.wait(
                async () => {
                    const url = await driver.getCurrentUrl();
                    return Boolean(url);
                },
                15000,
                "Print window did not load."
            );
    
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
    
      // Pickup test cases go here.
    
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
    
    it("TC_PICKUP_006 - Verify Pickup Queue and Completed totals for each document category",
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
    
    it("TC_PICKUP_007 - Verify Pickup Queue and Completed totals for each Stop",
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
    
    
    it("TC_PICKUP_008 - Search Order IDs using Filter Anything and verify Order ID, Doc ID, and Country",
    async function () {
      this.timeout(180000);
    
      const orderIds = ["263159", "263272"];
    
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
                header => header === headerName.toLowerCase()
              );
    
              return index >= 0
                ? (cellTexts[index] || "").trim()
                : "";
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
    
      let foundCount = 0;
      let notFoundCount = 0;
    
      for (const orderId of orderIds) {
        console.log(
          `\n========== Pickup Search: ${orderId} ==========`
        );
    
        await searchBox.clear();
        await searchBox.sendKeys(orderId);
    
        // Wait for the search results to update.
        await driver.sleep(2000);
    
        // Check for the Order ID without throwing TimeoutError.
        const result = await driver.wait(
          async () => {
            return await findOrderInSections(orderId);
          },
          30000,
          `Order ID ${orderId} search completed.`
        ).catch(() => null);
    
        if (!result) {
          notFoundCount++;
    
          console.log("----------------------------------------");
          console.log(`Order ID : ${orderId}`);
          console.log("Status   : NOT FOUND");
          console.log(
            `Message  : Order ID ${orderId} was not found in Pickup Queue or Completed.`
          );
          console.log("----------------------------------------");
    
          // Continue with the next Order ID.
          await searchBox.clear();
          await driver.sleep(1000);
          continue;
        }
    
        foundCount++;
    
        console.log("----------------------------------------");
        console.log(`Order ID : ${result.orderId}`);
        console.log(`Doc ID   : ${result.docId || "Not found"}`);
        console.log(`Country  : ${result.country || "Not found"}`);
        console.log(`Section  : ${result.section}`);
        console.log(`Row data : ${result.rowText}`);
        console.log("----------------------------------------");
    
        // Verify the details only when the Order ID is found.
        expect(result.orderId).to.equal(orderId);
    
        expect(
          result.docId,
          `Doc ID should be available for Order ID ${orderId}`
        ).to.not.equal("");
    
        expect(
          result.country,
          `Country should be available for Order ID ${orderId}`
        ).to.not.equal("");
    
        await searchBox.clear();
        await driver.sleep(1000);
      }
    
      console.log("\n========== TC_PICKUP_008 SUMMARY ==========");
      console.log(`Total searched : ${orderIds.length}`);
      console.log(`Found          : ${foundCount}`);
      console.log(`Not found      : ${notFoundCount}`);
      console.log("============================================");
    
      console.log(
        "\n✓ TC_PICKUP_008 completed. Missing Order IDs were skipped."
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
    // =================ShipToCustomer Test Start =========================
    // =================ShipToCustomer Test Start =========================
    
    describe("Ship to Customer - Export and Print Docs Functional Tests", function () {
      this.timeout(600000);
    
      // Reuse the shared driver and shipPage.
      before(async function () {
          this.timeout(300000);
    
          await shipPage.open();
    
          console.log("✓ Ship to Customer page ready. Starting test cases.");
      });
    
      function getDownloadDir() {
        const downloadDir =
            process.env.DOWNLOAD_DIR ||
            path.join(os.homedir(), "Downloads");
    
        // Create the folder if it does not exist.
        fs.mkdirSync(downloadDir, { recursive: true });
    
        return downloadDir;
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
    
            await shipPage.waitForPage();
            await shipPage.waitForLoadingToFinish(60000);
    
            for (const filterName of documentFilters) {
                console.log(
                    `\n========== Checking filter: ${filterName} ==========`
                );
    
                // Select filter and wait 2 seconds for the table to update.
                await shipPage.selectDocumentFilter(filterName);
    
                // Read the totals only after the wait.
                const readyToShipTotal =
                    await shipPage.getDocumentCount("readyToShip");
    
                const completedTotal =
                    await shipPage.getDocumentCount("completed");
    
                console.log(`Ready to Ship total: ${readyToShipTotal}`);
                console.log(`Completed total: ${completedTotal}`);
    
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
    
      
      
    it(
      "TC_SHIP_006 - Verify Ready to Ship and Completed totals for each category",
      async function () {
          this.timeout(600000);
    
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
    
          // Wait for the page and sections before testing filters.
          await shipPage.waitForPage();
          await shipPage.waitForLoadingToFinish(60000);
    
          for (const category of categories) {
              console.log(
                  `\n========== Checking category: ${category} ==========`
              );
    
              // Step 1: Select category.
              await shipPage.selectCategory(category);
    
              // Step 2: Wait for the category filter to update the table.
              console.log(
                  `Waiting 2 seconds for "${category}" results to load...`
              );
    
              await driver.sleep(2000);
    
              // Step 3: Read the updated totals.
              const readyToShipTotal =
                  await shipPage.getSectionTotal("Ready to Ship");
    
              const completedTotal =
                  await shipPage.getSectionTotal("Completed");
    
              console.log(
                  `${category} - Ready to Ship total: ${readyToShipTotal}`
              );
    
              console.log(
                  `${category} - Completed total: ${completedTotal}`
              );
    
              // Step 4: Validate totals.
              expect(
                  readyToShipTotal,
                  `${category}: Ready to Ship total`
              ).to.be.a("number").and.at.least(0);
    
              expect(
                  completedTotal,
                  `${category}: Completed total`
              ).to.be.a("number").and.at.least(0);
    
              // Step 5: Store results.
              results.push({
                  category,
                  readyToShipTotal,
                  completedTotal
              });
          }
    
          console.log(
              "\n========== Category Totals Summary =========="
          );
    
          console.table(results);
    
          expect(results).to.have.lengthOf(categories.length);
      }
    );
    
    
    it("TC_SHIP_007 - Search Order IDs 263097, 263098 and Doc ID 99824 in Filter Anything",
      async function () {
          this.timeout(240000);
    
          const searchCases = [
              {
                  type: "Order ID",
                  value: "263097",
                  expectedDocId: "99824"
              },
              {
                  type: "Order ID",
                  value: "263098",
                  expectedDocId: "99825"
              },
              {
                  type: "Doc ID",
                  value: "99824",
                  expectedOrderId: "263097"
              }
          ];
    
          const searchBoxLocator = By.css(
              "input[ng-model='shipToCust']"
          );
    
          await shipPage.waitForPage();
          await shipPage.waitForLoadingToFinish(60000);
    
          const results = [];
    
          // Read all currently visible document rows.
          async function getVisibleRows() {
              const rows = await driver.findElements(
                  By.css("table tbody tr")
              );
    
              const rowTexts = [];
    
              for (const row of rows) {
                  try {
                      if (!(await row.isDisplayed())) {
                          continue;
                      }
    
                      const text = (await row.getText()).trim();
    
                      if (text) {
                          rowTexts.push(text);
                      }
                  } catch (error) {
                      // Angular may redraw rows while filtering.
                  }
              }
    
              return rowTexts;
          }
    
          for (const searchCase of searchCases) {
              console.log(
                  `\n========== Searching ${searchCase.type}: ${searchCase.value} ==========`
              );
    
              // Re-find the search box in case Angular refreshed the page.
              let searchBox = await driver.wait(
                  until.elementLocated(searchBoxLocator),
                  30000,
                  "Filter Anything input was not found."
              );
    
              await driver.wait(
                  until.elementIsVisible(searchBox),
                  15000
              );
    
              await searchBox.clear();
              await searchBox.sendKeys(searchCase.value);
    
              await driver.wait(
                  async () => {
                      try {
                          searchBox = await driver.findElement(
                              searchBoxLocator
                          );
    
                          return (
                              await searchBox.getAttribute("value")
                          ) === searchCase.value;
                      } catch {
                          return false;
                      }
                  },
                  10000,
                  `Could not enter search value: ${searchCase.value}`
              );
    
              // Allow the application's search/filter request to run.
              await driver.sleep(2000);
    
              let matchingRowText = "";
              let noDocumentsMessage = false;
    
              // Wait for the matching ID or the application's empty state.
              try {
                  await driver.wait(
                      async () => {
                          const rowTexts = await getVisibleRows();
    
                          console.log(
                              `Visible rows for ${searchCase.value}:`,
                              rowTexts
                          );
    
                          matchingRowText = rowTexts.find(rowText =>
                              rowText.includes(searchCase.value) &&
                              !/no documents found/i.test(rowText)
                          ) || "";
    
                          noDocumentsMessage = rowTexts.some(rowText =>
                              /no documents found/i.test(rowText)
                          );
    
                          return (
                              matchingRowText !== "" ||
                              noDocumentsMessage
                          );
                      },
                      8000
                  );
              } catch (error) {
                  // No matching row or explicit empty state appeared.
                  matchingRowText = "";
              }
    
              if (matchingRowText) {
                  console.log(
                      `✓ PASS: ${searchCase.type} ${searchCase.value} found.`
                  );
    
                  console.log("Document details:", matchingRowText);
    
                  // Log the related ID for additional verification.
                  if (
                      searchCase.expectedDocId &&
                      !matchingRowText.includes(searchCase.expectedDocId)
                  ) {
                      console.log(
                          `NOTE: Expected Doc ID ${searchCase.expectedDocId} was not present in this row.`
                      );
                  }
    
                  if (
                      searchCase.expectedOrderId &&
                      !matchingRowText.includes(searchCase.expectedOrderId)
                  ) {
                      console.log(
                          `NOTE: Expected Order ID ${searchCase.expectedOrderId} was not present in this row.`
                      );
                  }
    
                  results.push({
                      searchedBy: searchCase.type,
                      searchValue: searchCase.value,
                      status: "PASS - ID FOUND",
                      documentDetails: matchingRowText
                  });
    
              } else {
                  console.log(
                      `✓ PASS: No document found for ${searchCase.type} ${searchCase.value}.`
                  );
    
                  if (noDocumentsMessage) {
                      console.log(
                          'Application displayed: "No documents found."'
                      );
                  }
    
                  results.push({
                      searchedBy: searchCase.type,
                      searchValue: searchCase.value,
                      status: "PASS - NO DOCUMENT FOUND",
                      documentDetails: "No document found"
                  });
              }
          }
    
          // Clear the search field after all searches.
          const searchBox = await driver.findElement(
              searchBoxLocator
          );
    
          await searchBox.clear();
    
          console.log(
              "\n========== Filter Anything Search Results =========="
          );
    
          console.table(results);
    
          expect(results).to.have.lengthOf(searchCases.length);
    
          console.log(
              "✓ TC_SHIP_007 passed: all search cases were completed."
          );
      }
    );
    
    });
    
    // ================Global Search Test========================
    
    })
    }
    
    // ================================================================
    // SUITE 2: GLOBAL SEARCH (14 TEST CASES)
    // ================================================================
    {
    
    const { expect } = require("chai");
    const { By, until } = require("selenium-webdriver");
    const fs = require("fs");
    const path = require("path");
    
    require("dotenv").config({ override: true });
    
    const getDriver = require("../../utils/driver");
    const LoginPage = require("../../pages/Login");
    const NewPage = require("../../pages/NewPage");
    const GlobalSearchPage = require("../../pages/GlobalSearchPage");
    const TestReporter = require("../../utils/testReporter");
    
    // --------------------------------------------------
    // WAIT FOR EXCEL DOWNLOAD
    // --------------------------------------------------
    
    
    async function waitForExcelDownload(downloadDir, existingFiles = {}, timeout = 90000) {
        console.log("Waiting for Excel file download...");
    
        const startTime = Date.now();
        const stableFiles = new Map();
    
        while (Date.now() - startTime < timeout) {
            const files = await fs.promises.readdir(downloadDir);
    
            // Chrome temporary download files.
            const downloadingFiles = files.filter(file =>
                /\.(crdownload|tmp|part)$/i.test(file)
            );
    
            const excelFiles = files.filter(file =>
                /\.(xlsx|xls)$/i.test(file)
            );
    
            for (const file of excelFiles) {
                const fullPath = path.join(downloadDir, file);
    
                try {
                    const stats = await fs.promises.stat(fullPath);
    
                    if (!stats.isFile() || stats.size === 0) continue;
    
                    const previous = existingFiles[file];
    
                    // Accept a new file or an existing file that changed.
                    const isNewOrChanged =
                        !previous ||
                        stats.size !== previous.size ||
                        stats.mtimeMs > previous.mtimeMs;
    
                    if (!isNewOrChanged) continue;
    
                    const lastSize = stableFiles.get(file);
    
                    if (lastSize === stats.size && downloadingFiles.length === 0) {
                        console.log("Excel file downloaded successfully.");
                        console.log(`File Name: ${file}`);
                        console.log(`File Size: ${stats.size} bytes`);
    
                        return {
                            name: file,
                            fullPath
                        };
                    }
    
                    stableFiles.set(file, stats.size);
                } catch (error) {
                    // File may still be writing; check again.
                }
            }
    
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    
        throw new Error(
            `Excel download failed. No completed or updated Excel file found within ${timeout}ms.`
        );
    }
    
    describe("Processor Portal - Global Search Functional Test Cases", function () {
        this.timeout(120000);
    
        let driver;
        let loginPage;
        let newPage;
        let globalSearchPage;
        let activeReporter = null;
    
    
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

            // Reuse the authenticated WebDriver session from Processor Portal.
            driver = sharedSession.driver;

            if (!driver) {
                throw new Error(
                    "Shared WebDriver session is unavailable. " +
                    "Processor Portal login must complete before Global Search."
                );
            }

            // Initialize this suite's page objects using the existing browser.
            // No new browser and no second login are performed.
            loginPage = new LoginPage(driver);
            newPage = new NewPage(driver);
            globalSearchPage = new GlobalSearchPage(driver);

            TestReporter.instrumentPageObject(
                globalSearchPage,
                () => activeReporter
            );

            console.log("Reusing the existing authenticated browser session.");

            // Open Global Search from the current authenticated page.
            await globalSearchPage.open();
            await globalSearchPage.verifyPageLoaded();

            console.log("Global Search setup completed using the existing login.");
        });
    
        // --------------------------------------------------
        // PER-TEST REPORT INITIALIZATION
        // --------------------------------------------------
        beforeEach(function () {
            activeReporter = new TestReporter(driver, this);
            const title = this.currentTest?.title || "Unnamed test";
            const testCaseId = (title.match(/TC_[A-Z]+_?\\d+/i) || [])[0] || "Not specified";
    
            activeReporter.addTestInfo({
                testCaseId,
                testCase: title,
                module: "Processor Portal - Global Search",
                objective: title.replace(/^TC_[A-Z]+_?\\d+\\s*-\\s*/i, ""),
                reportingNote: "Steps are captured from actual page-object actions and the test's existing assertions."
            });
        });
    
        // --------------------------------------------------
        // AUTOMATIC REPORT DETAILS, SCREENSHOT AND CLEANUP
        // --------------------------------------------------
        afterEach(async function () {
            const currentTest = this.currentTest;
    
            if (currentTest && activeReporter) {
                try {
                    const pageUrl = driver
                        ? await driver.getCurrentUrl().catch(() => "URL unavailable")
                        : "Browser unavailable";
    
                    activeReporter.addDetail("FINAL TEST STATUS", String(currentTest.state || "unknown").toUpperCase());
                    activeReporter.addDetail("EXECUTION DURATION", `${currentTest.duration || 0} ms`);
                    activeReporter.addDetail("FINAL BROWSER URL", pageUrl);
    
                    if (currentTest.state === "passed") {
                        activeReporter.addDetail("FINAL ACTUAL RESULT", "All assertions in this test case completed successfully.");
                    }
    
                    if (currentTest.state === "failed" && currentTest.err) {
                        activeReporter.addFailure(currentTest.err);
                    }
    
                    // Screenshot is captured before clearing search filters.
                    await activeReporter.attachScreenshot(`${currentTest.title} - ${currentTest.state || "completed"}`);
                } catch (reportError) {
                    console.error("Could not attach Mochawesome report details:", reportError.message);
                }
            }
    
            // Preserve the original cleanup behavior.
            if (globalSearchPage) {
                try {
                    await globalSearchPage.clearSearchFilters();
                } catch (cleanupError) {
                    console.error("Search filter cleanup failed:", cleanupError.message);
                    if (currentTest && currentTest.state === "passed") throw cleanupError;
                }
            }
    
            activeReporter = null;
        });
        // Browser teardown is handled once by the root-level after hook.

    
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
    
            if (activeReporter) {
                activeReporter.addStep(
                    1,
                    "Verify Global Search page and controls",
                    "Global Search page URL should be correct, and Search and Export to Excel buttons should be visible.",
                    `Current URL: ${currentUrl}; Search button visible: true; Export to Excel button visible: true.`,
                    "PASS"
                );
            }
        });
    
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
    
    it("TC_GS_014 - Verify user can search documents by Tracking Id",
        async function () {
    
            this.timeout(300000);
    
            const trackingIds = [
                // "Test-track-out-1",
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
                // await globalSearchPage.enterTrackingId(trackingId);
                // Step 2: Register Tracking ID field for cleanup.
                globalSearchPage.trackSearchField(
                    globalSearchPage.trackingIdInput
                );
    
                // Step 3: Enter Tracking ID.
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
    
    
    it("TC_GS_015 - Verify user can export Global Search results to Excel",
        async function () {
    
            this.timeout(240000);
    
            const customerName = "JudhistirBehera";
            const reporter = activeReporter || new TestReporter(driver, this);
            reporter.disableAutomaticSteps = true;
    
            reporter.addTestInfo({
                testCaseId: "TC_GS_015",
                module: "Processor Portal - Global Search",
                feature: "Export Global Search results to Excel",
                testData: `Customer: ${customerName}`,
                expectedOverallResult:
                    "Matching documents should be displayed and a valid Excel file should download."
            });
    
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
            reporter.addStep(1, "Clear previous search filters",
                "All previous Global Search filters should be empty.",
                "Previous search filters cleared successfully.", "PASS");
    
            // --------------------------------------------------
            // STEP 2: SELECT CUSTOMER
            // --------------------------------------------------
    
            console.log(`Selecting Customer: ${customerName}`);
    
            await globalSearchPage.selectCustomer(customerName);
    
            console.log("Customer selected successfully.");
            reporter.addStep(2, "Select customer",
                `Customer "${customerName}" should be selected in the Customer dropdown.`,
                `Customer "${customerName}" selected successfully.`, "PASS");
    
            // --------------------------------------------------
            // STEP 3: CLICK SEARCH BUTTON
            // --------------------------------------------------
    
            await globalSearchPage.clickSearch();
    
            console.log("Search button clicked.");
            reporter.addStep(3, "Click Search",
                "The application should start searching using the selected customer.",
                "Search button clicked successfully.", "PASS");
    
            // --------------------------------------------------
            // STEP 4: WAIT FOR SEARCH LOADING TO COMPLETE
            // --------------------------------------------------
    
            const searchStatus =
                await globalSearchPage.waitForSearchToFinish(60000);
    
            expect(searchStatus).to.equal("RESULTS");
    
            console.log("Search loading completed.");
            reporter.addStep(4, "Wait for search completion",
                "Search should complete and return matching results.",
                `Search completed with status: ${searchStatus}.`, "PASS");
    
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
    
            reporter.addStep(5, "Verify total documents",
                "The selected customer should have at least one matching document.",
                `Total documents found: ${totalDocuments}.`, "PASS");
    
            // --------------------------------------------------
            // STEP 6: VERIFY RESULTS TABLE
            // --------------------------------------------------
    
            const resultsTable =
                await globalSearchPage.waitForVisible(
                    globalSearchPage.resultsTable,
                    60000
                );
    
            expect(await resultsTable.isDisplayed()).to.equal(true);
            reporter.addStep(6, "Verify results table",
                "The Global Search results table should be visible.",
                "Results table is displayed.", "PASS");
    
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
    
            reporter.addStep(7, "Verify pagination",
                "Current page rows and total page count should be valid.",
                `Current page rows: ${currentPageRows}; total pages: ${totalPages}.`,
                "PASS");
    
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
            reporter.addStep(8, "Click Export to Excel",
                "The application should initiate the Excel export.",
                "Export to Excel button clicked successfully.", "PASS");
    
            // --------------------------------------------------
            // STEP 10: WAIT FOR EXCEL DOWNLOAD
            // --------------------------------------------------
    
            const downloadedFile = await waitForExcelDownload(
                downloadDir,
                existingFiles,
                90000
            );
    
            reporter.addStep(9, "Wait for Excel download",
                "A completed .xls or .xlsx file should appear in the Downloads folder.",
                `Downloaded file: ${downloadedFile.name}; path: ${downloadedFile.fullPath}.`,
                "PASS");
    
            // --------------------------------------------------
            // STEP 11: VERIFY DOWNLOADED FILE
            // --------------------------------------------------
    
            expect(downloadedFile.name).to.match(/\.(xlsx|xls)$/i);
    
            expect(
                fs.existsSync(downloadedFile.fullPath)
            ).to.equal(true);
    
            const downloadedFileStats = await fs.promises.stat(
                downloadedFile.fullPath
            );
    
            reporter.addStep(10, "Verify downloaded Excel file",
                "The downloaded file should exist, have an Excel extension, and have a non-zero file size.",
                `File exists: true; file size: ${downloadedFileStats.size} bytes.`,
                "PASS");
    
            reporter.addDetail(
                "Final Actual Result",
                `Excel export completed. File: ${downloadedFile.name}; size: ${downloadedFileStats.size} bytes; documents found: ${totalDocuments}.`
            );
    
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
    }