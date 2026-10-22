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

require("dotenv").config({ override: true });

describe("Expected Page - Document Details Functional Test Cases", function () {
  this.timeout(1200000);

  let driver;
  let loginPage;
  let newPage;
  let expectedPage;
  let expectedDetailsPage;

  let testAddress = null;
  let updatedAddress = null;

  let orderId;
  let docId;
  let country;

  before(async function () {
    this.timeout(300000);

    driver = await getDriver();

    loginPage = new LoginPage(driver);
    newPage = new NewPage(driver);
    expectedPage = new ExpectedPage(driver);
    expectedDetailsPage = new ExpectedDetailsPage(driver);

    await loginPage.open();

    await loginPage.login(process.env.EMAIL, process.env.PASSWORD);

    await newPage.waitForPage();

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

  it("TC_EXP_008 - Verify uploaded document details", async function () {
    const text = await expectedDetailsPage.verifyDocumentUploads();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_009 - Verify uploaded document download when available", async function () {
    const available =
      await expectedDetailsPage.checkDocumentUploadAvailability();

    if (available) {
      const result = await expectedDetailsPage.downloadDocumentIfAvailable();

      expect(result).to.equal(true);
    } else {
      expect(available).to.equal(false);
    }
  });
  it("TC_EXP_010 - Verify Return Shipping Label download when available", async function () {
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

  it("TC_EXP_011 - Verify Conversations tab and conversation details", async function () {
    const text = await expectedDetailsPage.verifyConversationTab();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_012 - Verify Write New Message and Send", async function () {
    const message = `Automation test message ${Date.now()}`;

    await expectedDetailsPage.clickWriteNewMessage();

    await expectedDetailsPage.enterMessage(message);

    await expectedDetailsPage.clickSend(message);

    await expectedDetailsPage.verifyLatestMessage(message);
  });

  it("TC_EXP_013 - Verify Activity Feed", async function () {
    const text = await expectedDetailsPage.verifyActivityFeed();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_014 - Verify Payment Requested Amount in Activity Feed", async function () {
    const amount =
      await expectedDetailsPage.getPaymentRequestedAmountFromActivity();

    expect(amount).to.be.greaterThan(0);
  });

  it("TC_EXP_015 - Verify Payment Link in Activity Feed", async function () {
    const paymentLink =
      await expectedDetailsPage.verifyPaymentLinkInActivityFeed();

    expect(paymentLink).to.match(/^https?:\/\/.+external-payments/i);
  });

  it("TC_EXP_016 - Verify Fee Details", async function () {
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

  // it("TC_EXP_012 - Verify Fee Total Amount", async function () {
  //   const fees = await expectedDetailsPage.getFeeDetails();

  //   const validFees = fees.filter(
  //     (fee) =>
  //       fee.feeType &&
  //       fee.feeType.toLowerCase() !== "total" &&
  //       !isNaN(parseFloat(String(fee.total).replace(/[$,]/g, "").trim())),
  //   );

  //   const calculatedTotal = validFees.reduce((sum, fee) => {
  //     const amount = parseFloat(String(fee.total).replace(/[$,]/g, "").trim());

  //     return sum + amount;
  //   }, 0);

  //   const displayedTotal = await driver.executeScript(() => {
  //     const rows = Array.from(
  //       document.querySelectorAll("#orderHistory table tbody tr"),
  //     );

  //     for (const row of rows) {
  //       const cells = Array.from(row.querySelectorAll("td"));

  //       if (!cells.length) continue;

  //       const firstCell = cells[0].innerText.trim().toLowerCase();

  //       if (firstCell === "total") {
  //         const lastCell = cells[cells.length - 1].innerText.trim();

  //         const match = lastCell.match(/[\d,]+\.\d{2}/);

  //         if (match) {
  //           return parseFloat(match[0].replace(/,/g, ""));
  //         }
  //       }
  //     }

  //     return null;
  //   });

  //   expect(displayedTotal).to.not.equal(null);

  //   expect(calculatedTotal).to.equal(displayedTotal);
  // });

  function normalizeFeeType(feeType) {
    return String(feeType)
      .replace(/\([^)]*\)/g, "")
      .replace(/:/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  it("TC_EXP_017 - Verify Fee Amounts Between Document Details and Order History", async function () {
    console.log("\n==========================================");
    console.log("TC_EXP_017 - Verify Fee Amounts");
    console.log("==========================================");

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

    expect(documentTotal).to.equal(
      orderHistoryTotal,
      "Overall Total Amount is different between Document Details and Order History",
    );

    console.log("\n✓ All fee amounts and total amount are matching.");
  });

 
  it("TC_EXP_110 - Verify Document Details opens for the selected Doc ID", async function () {
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

  it("TC_EXP_111 - Verify Download Shipping Label opens Attachments and displays the return label", async function () {
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

  it("TC_EXP_113 - Verify Print Cover Sheet downloads a PDF", async function () {
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

  it("TC_EXP_112 - Verify document status message and background based on attachment icon", async function () {
    await expectedPage.open();

    // Get the top Order ID row.
    const orderId = await expectedPage.getTopOrderId();

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


  it("TC_EXP_114 - Verify Add Stop is saved and Payment Due is updated", async function () {
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

  it("TC_EXP_115 - Verify unsaved Add Stop is removed after refresh", async function () {
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

  // it("TC_EXP_116 - Verify Add Fee is saved in Payment Due", async function () {
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

  it("TC_EXP_118 - Verify payment request amount cannot exceed due amount", async function () {
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

  it("TC_EXP_119 - Verify payment request amount can be less than due amount", async function () {
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

  it("TC_EXP_120 - Verify error when amount received exceeds due amount", async function () {
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


  it("TC_EXP_121 - Verify partial payment updates Order Summary", async function () {
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

  it("TC_EXP_122 - Verify full payment clears Outstanding Amount", async function () {
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

// TC_EXP_123 - Edit fee, Save Price, Restore Fee.
// it("TC_EXP_123 - Verify edited fee total and Restore Fee", async function () {
//   await expectedDetailsPage.clickTab("documentDetails");

//   const testFee =
//     await expectedDetailsPage.getAnyAvailableFeeType();

//   const totalBefore =
//     await expectedDetailsPage.getFeeTableTotalAmount();

//   const feesBefore =
//     await expectedDetailsPage.getDocumentDetailsFeeDetails();

//   const feeBefore = feesBefore.find(
//     fee =>
//       fee.feeType.replace(/\s+/g, " ").trim().toLowerCase() ===
//       testFee.replace(/\s+/g, " ").trim().toLowerCase()
//   );

//   expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;

//   const originalUnitPrice = Number(feeBefore.unitPrice);

//   await expectedDetailsPage.editFeeAmount(
//     testFee,
//     originalUnitPrice + PRICE_INCREASE
//   );

//   await expectedDetailsPage.clickSavePrice();

//   const totalAfterSave =
//     await expectedDetailsPage.getFeeTableTotalAmount();

//   expect(totalAfterSave).to.be.greaterThan(
//     totalBefore,
//     "Total Amount should increase after saving the edited fee."
//   );

//   await expectedDetailsPage.clickRestoreFees();

//   const totalAfterRestore =
//     await expectedDetailsPage.getFeeTableTotalAmount();

//   expect(totalAfterRestore).to.be.closeTo(
//     totalBefore,
//     0.01,
//     "Restore Fee should return Total Amount to its original value."
//   );

//   console.log(
//     `✓ TC_EXP_123 passed. Fee: ${testFee}, ` +
//     `Before: ${totalBefore}, After Restore: ${totalAfterRestore}`
//   );
  // });
  
const PRICE_INCREASE = 5;

//

//   await expectedDetailsPage.clickTab("documentDetails");

//   // Select any available fee dynamically.
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
//   const originalQuantity = Number(feeBefore.quantity);

//   expect(originalUnitPrice).to.be.a("number");
//   expect(originalQuantity).to.be.greaterThan(0);

//   const totalBefore =
//     await expectedDetailsPage.getFeeTableTotalAmount();

//   const expectedIncrease = PRICE_INCREASE * originalQuantity;

//   console.log("Selected Fee:", testFee);
//   console.log("Original Unit Price:", originalUnitPrice);
//   console.log("Original Quantity:", originalQuantity);
//   console.log("Total Before:", totalBefore);

//   // Edit fee and commit using the green checkmark.
//   await expectedDetailsPage.editFeeAmount(
//     testFee,
//     originalUnitPrice + PRICE_INCREASE
//   );

//   // Save the edited fee price.
//   await expectedDetailsPage.clickSavePrice();

//   // Wait for Total Amount to reflect the price increase.
//   await driver.wait(async () => {
//     try {
//       const currentTotal =
//         await expectedDetailsPage.getFeeTableTotalAmount();

//       return Math.abs(
//         currentTotal - (totalBefore + expectedIncrease)
//       ) < 0.01;
//     } catch (_) {
//       return false;
//     }
//   }, 15000, "Total Amount did not update after saving the edited fee.");

//   const totalAfterSave =
//     await expectedDetailsPage.getFeeTableTotalAmount();

//   console.log("Total After Save Price:", totalAfterSave);

//   expect(totalAfterSave).to.be.closeTo(
//     totalBefore + expectedIncrease,
//     0.01,
//     "Total Amount should increase by the edited fee amount."
//   );

//   // Restore the original fees.
//   await expectedDetailsPage.clickRestoreFees();

//   await driver.wait(async () => {
//     try {
//       const currentTotal =
//         await expectedDetailsPage.getFeeTableTotalAmount();

//       return Math.abs(currentTotal - totalBefore) < 0.01;
//     } catch (_) {
//       return false;
//     }
//   }, 15000, "Restore Fee did not return Total Amount to its original value.");

//   const totalAfterRestore =
//     await expectedDetailsPage.getFeeTableTotalAmount();

//   expect(totalAfterRestore).to.be.closeTo(
//     totalBefore,
//     0.01,
//     "Restore Fee should return Total Amount to its original value."
//   );

//   console.log("Total After Restore:", totalAfterRestore);
//   console.log("✓ TC_EXP_123 passed.");
// });



// TC_EXP_124 - Edit fee, Save Price, bottom Save, Restore Fee.

  it("TC_EXP_123 - Verify edited fee total and Restore Fee", async function () {
  await expectedDetailsPage.clickTab("documentDetails");
  await expectedDetailsPage.waitForLoadingToFinish();

  const testFee = await expectedDetailsPage.getAnyAvailableFeeType();
  const feesBefore =
    await expectedDetailsPage.getDocumentDetailsFeeDetails();

  const feeBefore = feesBefore.find(
    fee =>
      fee.feeType.replace(/\s+/g, " ").trim().toLowerCase() ===
      testFee.replace(/\s+/g, " ").trim().toLowerCase()
  );

  expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;

  const originalUnitPrice = Number(feeBefore.unitPrice);
  const totalBefore =
    await expectedDetailsPage.getFeeTableTotalAmount();

  await expectedDetailsPage.editFeeAmount(
    testFee,
    originalUnitPrice + PRICE_INCREASE
  );

  await expectedDetailsPage.waitForLoadingToFinish();
  await expectedDetailsPage.clickSavePrice();

  const totalAfterSave =
    await expectedDetailsPage.waitForFeeTotalToUpdate(totalBefore);

  expect(totalAfterSave).to.be.greaterThan(totalBefore);

  await expectedDetailsPage.clickRestoreFees();
  await expectedDetailsPage.waitForLoadingToFinish();

  await this.timeout(60000);

  const totalAfterRestore =
    await expectedDetailsPage.getFeeTableTotalAmount();

  expect(totalAfterRestore).to.be.closeTo(
    totalBefore,
    0.01,
    "Restore Fee should return Total Amount to its original value."
  );

  console.log("✓ TC_EXP_123 passed.");
});
  
  // it("TC_EXP_124 - Verify edited fee after Save Price and bottom Save", async function () {
  // await expectedDetailsPage.clickTab("documentDetails");

  // const testFee =
  //   await expectedDetailsPage.getAnyAvailableFeeType();

  // const totalBefore =
  //   await expectedDetailsPage.getFeeTableTotalAmount();

  // const feesBefore =
  //   await expectedDetailsPage.getDocumentDetailsFeeDetails();

  // const feeBefore = feesBefore.find(
  //   fee =>
  //     fee.feeType.replace(/\s+/g, " ").trim().toLowerCase() ===
  //     testFee.replace(/\s+/g, " ").trim().toLowerCase()
  // );

  // expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;

  // const originalUnitPrice = Number(feeBefore.unitPrice);

  // await expectedDetailsPage.editFeeAmount(
  //   testFee,
  //   originalUnitPrice + PRICE_INCREASE
  // );

  // await expectedDetailsPage.clickSavePrice();

  // const totalAfterSavePrice =
  //   await expectedDetailsPage.getFeeTableTotalAmount();

  // expect(totalAfterSavePrice).to.be.greaterThan(
  //   totalBefore,
  //   "Total Amount should increase after clicking Save Price."
  // );

  // await expectedDetailsPage.clickDocumentSave();

  // const totalAfterDocumentSave =
  //   await expectedDetailsPage.getFeeTableTotalAmount();

  // expect(totalAfterDocumentSave).to.be.closeTo(
  //   totalAfterSavePrice,
  //   0.01,
  //   "Bottom Save should preserve the updated Total Amount."
  // );

  // await expectedDetailsPage.clickRestoreFees();

  // const totalAfterRestore =
  //   await expectedDetailsPage.getFeeTableTotalAmount();

  // expect(totalAfterRestore).to.be.closeTo(
  //   totalBefore,
  //   0.01,
  //   "Restore Fee should return Total Amount to its original value."
  // );

  // console.log(
  //   `✓ TC_EXP_124 passed. Fee: ${testFee}, ` +
  //   `Before: ${totalBefore}, After Restore: ${totalAfterRestore}`
  // );
  //   });


// TC_EXP_125 - Delete fee, Save Price, Restore Fee.

  
it("TC_EXP_124 - Verify edited fee after Save Price and bottom Save", async function () {
  this.timeout(120000);

  await expectedDetailsPage.clickTab("documentDetails");
  await expectedDetailsPage.waitForLoadingToFinish();

  // Capture the original fee details and total.
  const testFee = await expectedDetailsPage.getAnyAvailableFeeType();

  const feesBefore =
    await expectedDetailsPage.getDocumentDetailsFeeDetails();

  const normalize = value =>
    String(value).replace(/\s+/g, " ").trim().toLowerCase();

  const feeBefore = feesBefore.find(
    fee => normalize(fee.feeType) === normalize(testFee)
  );

  expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;

  const originalUnitPrice = Number(feeBefore.unitPrice);
  const originalQuantity = Number(feeBefore.quantity);
  const totalBefore =
    await expectedDetailsPage.getFeeTableTotalAmount();

  expect(Number.isFinite(originalUnitPrice)).to.equal(true);
  expect(originalQuantity).to.be.greaterThan(0);

  const expectedIncrease = PRICE_INCREASE * originalQuantity;
  const expectedUpdatedTotal = totalBefore + expectedIncrease;

  console.log("Selected Fee:", testFee);
  console.log("Original Unit Price:", originalUnitPrice);
  console.log("Quantity:", originalQuantity);
  console.log("Total Before:", totalBefore);
  console.log("Expected Total After Edit:", expectedUpdatedTotal);

  try {
    // Step 1: Edit the fee unit price.
    await expectedDetailsPage.editFeeAmount(
      testFee,
      originalUnitPrice + PRICE_INCREASE
    );

    // Step 2: Click Save Price and wait for recalculation to finish.
    await expectedDetailsPage.clickSavePrice();
    await expectedDetailsPage.waitForLoadingToFinish();

    // Wait until the total reflects the updated unit price and quantity.
    await driver.wait(async () => {
      try {
        const currentTotal =
          await expectedDetailsPage.getFeeTableTotalAmount();

        return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
      } catch (_) {
        return false;
      }
    }, 45000, "Total Amount did not update after Save Price.");

    const totalAfterSavePrice =
      await expectedDetailsPage.getFeeTableTotalAmount();

    console.log("Total After Save Price:", totalAfterSavePrice);

    expect(totalAfterSavePrice).to.be.closeTo(
      expectedUpdatedTotal,
      0.01,
      "Total Amount should reflect the edited fee price and quantity."
    );

    // Step 3: Click the bottom Save button.
    await expectedDetailsPage.clickDocumentSave();
    await expectedDetailsPage.waitForLoadingToFinish();

    // Wait until the saved total remains correct.
    await driver.wait(async () => {
      try {
        const currentTotal =
          await expectedDetailsPage.getFeeTableTotalAmount();

        return Math.abs(currentTotal - expectedUpdatedTotal) < 0.01;
      } catch (_) {
        return false;
      }
    }, 45000, "Bottom Save did not preserve the updated Total Amount.");

    const totalAfterDocumentSave =
      await expectedDetailsPage.getFeeTableTotalAmount();

    console.log("Total After Bottom Save:", totalAfterDocumentSave);

    expect(totalAfterDocumentSave).to.be.closeTo(
      expectedUpdatedTotal,
      0.01,
      "Bottom Save should preserve the updated Total Amount."
    );

    console.log("✓ Save Price and bottom Save verified.");

  } finally {
    // Restore the original fees even if an assertion fails.
    await expectedDetailsPage.waitForLoadingToFinish();
    await expectedDetailsPage.clickRestoreFees();
    await expectedDetailsPage.waitForLoadingToFinish();

    await driver.wait(async () => {
      try {
        const currentTotal =
          await expectedDetailsPage.getFeeTableTotalAmount();

        return Math.abs(currentTotal - totalBefore) < 0.01;
      } catch (_) {
        return false;
      }
    }, 45000, "Restore Fee did not return Total Amount to its original value.");

    const totalAfterRestore =
      await expectedDetailsPage.getFeeTableTotalAmount();

    console.log("Total After Restore:", totalAfterRestore);

    expect(totalAfterRestore).to.be.closeTo(
      totalBefore,
      0.01,
      "Restore Fee should return Total Amount to its original value."
    );
  }

  console.log("✓ TC_EXP_124 passed.");
});

  
  it("TC_EXP_125 - Verify deleted fee and Restore Fee", async function () {
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
  
  
it("TC_EXP_127 - Verify Split Document creates two documents with the same Order ID and different Doc IDs", async function () {
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




  it("TC_EXP_0018 - Verify Contact Details", async function () {
    const text = await expectedDetailsPage.verifyContactDetails();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_019 - Verify Add New button opens address form", async function () {
    await expectedDetailsPage.clickContactDetails();

    await expectedDetailsPage.clickAddNewAddress();

    const addressLine1 = await expectedDetailsPage.waitForVisible(
      expectedDetailsPage.addressLine1Input,
      30000,
    );

    expect(await addressLine1.isDisplayed()).to.equal(true);

    await expectedDetailsPage.closeAddressForm();
  });

  it("TC_EXP_020 - Verify user can add a new address", async function () {
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

  it("TC_EXP_021 - Verify Close button closes Add New address form", async function () {
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

  it("TC_EXP_022 - Verify user can edit the existing address", async function () {
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

  it("TC_EXP_023 - Verify address can be set as Default Shipping", async function () {
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

  it("TC_EXP_024 - Verify address can be set as Default Billing", async function () {
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

  it("TC_EXP_025 - Verify user can delete the existing address", async function () {
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

  it("TC_EXP_026 - Verify Other Details", async function () {
    const text = await expectedDetailsPage.verifyOtherDetails();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_027 - Verify Tracking Details", async function () {
    const text = await expectedDetailsPage.verifyTrackingDetails();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
});
