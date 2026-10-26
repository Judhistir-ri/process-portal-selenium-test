// Combined Selenium/Mocha test suite.
// Logs in once, then runs Expected Details, DropOff, Pickup,
// and Ship to Customer tests in that order.

const { expect } = require("chai");
const { until, By, Key } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
const os = require("os");

require("dotenv").config({ override: true });

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ExpectedPage = require("../../pages/ExpectedPage");
const ExpectedDetailsPage = require("../../pages/ExpectedDetailsPage");
const DropOffDetail = require("../../pages/DropOffDetail");
const PickupDetail = require("../../pages/PickupDetail");
const ShipToCustomerDetail = require("../../pages/ShipToCustomerDetail");

describe("Combined Processor Portal Tests - Single Login", function () {
  this.timeout(1200000);

  let driver;

  // Log in only once for all four test sections.
  before(async function () {
    this.timeout(300000);

    driver = await getDriver();

    const loginPage = new LoginPage(driver);
    const newPage = new NewPage(driver);

    await loginPage.open();
    await loginPage.login(process.env.EMAIL, process.env.PASSWORD);
    await newPage.waitForPage();

    console.log(
      "\n✓ Logged in once. Starting Expected Details, DropOff, Pickup, and Ship to Customer tests.\n"
    );
  });

  // Quit the browser only after all four sections finish.
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  // ============================================================
  // SECTION 1: EXPECTED DETAILS
  // ============================================================

  describe(
    "Expected Page - Document Details Functional Test Cases",
    function () {
      this.timeout(1200000);

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

        newPage = new NewPage(driver);
        expectedPage = new ExpectedPage(driver);
        expectedDetailsPage = new ExpectedDetailsPage(driver);

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

      it(
        "TC_EXP_001 - Verify top Order ID is displayed and clickable",
        async function () {
          expect(orderId).to.match(/^\d+$/);
          expect(docId).to.match(/^\d+$/);
        }
      );

      it(
        "TC_EXP_002 - Verify Document Details are displayed",
        async function () {
          await expectedPage.waitForOrderDetails();

          const result = await expectedPage.verifyOrderDetails({
            orderId,
            docId,
            country,
          });

          expect(result).to.equal(true);
        }
      );

      it(
        "TC_EXP_003 - Verify Processing Steps and Processing Step Count",
        async function () {
          const steps =
            await expectedPage.getProcessingStepsFromOrder();

          const count =
            await expectedPage.getProcessingStepCount();

          expect(steps).to.be.an("array");
          expect(steps.length).to.be.greaterThan(0);
          expect(count).to.be.a("number");
          expect(count).to.equal(steps.length);
        }
      );

      it("TC_EXP_004 - Verify Country", async function () {
        const result =
          await expectedDetailsPage.verifyText(country);

        expect(result).to.equal(true);
      });

      it(
        "TC_EXP_005 - Verify Customer ID and Customer Name",
        async function () {
          const pageText =
            await expectedDetailsPage.getCurrentPageText();

          expect(pageText).to.include("Customer Id");
          expect(pageText).to.include("Customer Name");
        }
      );

      it("TC_EXP_006 - Verify Send Payment Link", async function () {
        const status =
          await expectedDetailsPage.checkPaymentLinkStatus();

        if (status === "Cancel Payment") {
          expect(status).to.equal("Cancel Payment");
          return;
        }

        expect(status).to.equal("Send Payment Link");

        await expectedDetailsPage.clickSendPaymentLink();
        await expectedDetailsPage.verifyPaymentLinkPopup();

        const popupDocumentId =
          await expectedDetailsPage.getPaymentPopupDocumentId();

        const pageDocumentId =
          await expectedDetailsPage.getDocumentId();

        expect(popupDocumentId).to.equal(pageDocumentId);

        const paymentPopupAmount =
          await expectedDetailsPage.getPaymentPopupAmount();

        const totalAmount =
          await expectedDetailsPage.getPaymentAmount();

        expect(paymentPopupAmount).to.equal(totalAmount);

        await expectedDetailsPage.submitPaymentLink();

        const finalStatus =
          await expectedDetailsPage.getPaymentLinkButtonText();

        expect(finalStatus).to.equal("Cancel Payment");
      });

      it("TC_EXP_007 - Verify Attachments tab opens", async function () {
        await expectedDetailsPage.clickTab("attachments");

        const text =
          await expectedDetailsPage.getPaneText("attachments");

        expect(text).to.include("Document Uploads");
      });

      it(
        "TC_EXP_008 - Verify uploaded document details",
        async function () {
          const text =
            await expectedDetailsPage.verifyDocumentUploads();

          expect(text).to.be.a("string");
          expect(text.length).to.be.greaterThan(0);
        }
      );

      it(
        "TC_EXP_009 - Verify uploaded document download when available",
        async function () {
          const available =
            await expectedDetailsPage.checkDocumentUploadAvailability();

          if (available) {
            const result =
              await expectedDetailsPage.downloadDocumentIfAvailable();

            expect(result).to.equal(true);
          } else {
            expect(available).to.equal(false);
          }
        }
      );

      it(
        "TC_EXP_010 - Verify Return Shipping Label download when available",
        async function () {
          const available =
            await expectedDetailsPage.checkReturnShippingLabelAvailability();

          if (available) {
            const result =
              await expectedDetailsPage.downloadReturnShippingLabelIfAvailable();

            expect(result).to.equal(true);
          } else {
            expect(available).to.equal(false);
          }
        }
      );

      it(
        "TC_EXP_011 - Verify Conversations tab and conversation details",
        async function () {
          const text =
            await expectedDetailsPage.verifyConversationTab();

          expect(text).to.be.a("string");
          expect(text.length).to.be.greaterThan(0);
        }
      );

      it(
        "TC_EXP_012 - Verify Write New Message and Send",
        async function () {
          const message = `Automation test message ${Date.now()}`;

          await expectedDetailsPage.clickWriteNewMessage();
          await expectedDetailsPage.enterMessage(message);
          await expectedDetailsPage.clickSend(message);
          await expectedDetailsPage.verifyLatestMessage(message);
        }
      );

      it("TC_EXP_013 - Verify Activity Feed", async function () {
        const text =
          await expectedDetailsPage.verifyActivityFeed();

        expect(text).to.be.a("string");
        expect(text.length).to.be.greaterThan(0);
      });

      it(
        "TC_EXP_014 - Verify Payment Requested Amount in Activity Feed",
        async function () {
          const amount =
            await expectedDetailsPage.getPaymentRequestedAmountFromActivity();

          expect(amount).to.be.greaterThan(0);
        }
      );

      it(
        "TC_EXP_015 - Verify Payment Link in Activity Feed",
        async function () {
          const paymentLink =
            await expectedDetailsPage.verifyPaymentLinkInActivityFeed();

          expect(paymentLink).to.match(
            /^https?:\/\/.+external-payments/i
          );
        }
      );

      it("TC_EXP_016 - Verify Fee Details", async function () {
        const fees =
          await expectedDetailsPage.getFeeDetails();

        expect(fees).to.be.an("array");
        expect(fees.length).to.be.greaterThan(0);

        for (const fee of fees) {
          expect(fee.feeType).to.not.equal("");
          expect(fee.quantity).to.not.equal("");
          expect(fee.unitPrice).to.not.equal("");
          expect(fee.total).to.not.equal("");
        }
      });

      function normalizeFeeType(feeType) {
        return String(feeType)
          .replace(/\([^)]*\)/g, "")
          .replace(/:/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      }

      it(
        "TC_EXP_017 - Verify Fee Amounts Between Document Details and Order History",
        async function () {
          console.log("\n==========================================");
          console.log("TC_EXP_017 - Verify Fee Amounts");
          console.log("==========================================");

          console.log("\nGetting fees from Document Details...");

          const documentFees =
            await expectedDetailsPage.getDocumentDetailsFeeDetails();

          console.log("\nDocument Details Fees:");
          console.log(JSON.stringify(documentFees, null, 2));

          const documentTotal =
            await expectedDetailsPage.getPaymentAmount();

          console.log(
            `Document Details Total Amount: $${documentTotal.toFixed(2)}`
          );

          console.log("\nGetting fees from Order History...");

          const orderHistoryFees =
            await expectedDetailsPage.getFeeDetails();

          console.log("\nOrder History Fees:");
          console.log(JSON.stringify(orderHistoryFees, null, 2));

          expect(orderHistoryFees.length).to.equal(
            documentFees.length,
            "Number of fees is different between Document Details and Order History"
          );

          for (const documentFee of documentFees) {
            const normalizedDocumentFee =
              normalizeFeeType(documentFee.feeType);

            const matchingOrderFee = orderHistoryFees.find(
              (orderFee) =>
                normalizeFeeType(orderFee.feeType) ===
                normalizedDocumentFee
            );

            expect(
              matchingOrderFee,
              `Fee "${documentFee.feeType}" not found in Order History`
            ).to.not.equal(undefined);

            const documentUnitPrice =
              Number(documentFee.unitPrice);

            const orderUnitPrice = parseFloat(
              String(matchingOrderFee.unitPrice)
                .replace(/[$,]/g, "")
                .trim()
            );

            console.log(`\n${documentFee.feeType}`);

            console.log(
              `Unit Price: Document Details=$${documentUnitPrice.toFixed(2)}, ` +
                `Order History=$${orderUnitPrice.toFixed(2)}`
            );

            expect(
              documentUnitPrice,
              `Unit Price mismatch for ${documentFee.feeType}`
            ).to.equal(orderUnitPrice);

            const documentFeeTotal =
              Number(documentFee.total);

            const orderFeeTotal = parseFloat(
              String(matchingOrderFee.total)
                .replace(/[$,]/g, "")
                .trim()
            );

            console.log(
              `Total: Document Details=$${documentFeeTotal.toFixed(2)}, ` +
                `Order History=$${orderFeeTotal.toFixed(2)}`
            );

            expect(
              documentFeeTotal,
              `Total mismatch for ${documentFee.feeType}`
            ).to.equal(orderFeeTotal);
          }

          const orderHistoryTotal = orderHistoryFees.reduce(
            (sum, fee) => {
              const amount = parseFloat(
                String(fee.total).replace(/[$,]/g, "").trim()
              );

              return sum + amount;
            },
            0
          );

          console.log("\n------------------------------------------");
          console.log(
            `Document Details Total : $${documentTotal.toFixed(2)}`
          );
          console.log(
            `Order History Total    : $${orderHistoryTotal.toFixed(2)}`
          );
          console.log("------------------------------------------");

          expect(
            documentTotal,
            "Overall Total Amount is different between Document Details and Order History"
          ).to.equal(orderHistoryTotal);

          console.log(
            "\n✓ All fee amounts and total amount are matching."
          );
        }
      );

            it(
        "TC_EXP_110 - Verify Document Details opens for the selected Doc ID",
        async function () {
          expect(orderId).to.match(/^\d+$/);
          expect(docId).to.match(/^\d+$/);

          await expectedDetailsPage.clickTab("documentDetails");

          const detailsText =
            await expectedDetailsPage.getPaneText("documentDetails");

          expect(detailsText).to.include(String(docId));

          console.log(
            `✓ Document Details opened for Doc ID: ${docId}`
          );
        }
      );

      it(
        "TC_EXP_111 - Verify Download Shipping Label opens Attachments and displays the return label",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");

          const link =
            await expectedDetailsPage.getDownloadShippingLabelLinkIfAvailable();

          if (!link) {
            this.skip();
          }

          const clicked =
            await expectedDetailsPage.clickDownloadShippingLabel();

          expect(clicked).to.equal(true);

          const result =
            await expectedDetailsPage.verifyReturnShippingLabelDetails();

          expect(result.rowText).to.include("Return Shipping Label");

          expect(
            result.downloadIconVisible,
            "Return Shipping Label download icon should be visible"
          ).to.equal(true);

          console.log(
            `✓ TC_EXP_111 passed for Order ID ${orderId}`
          );
        }
      );

      it(
        "TC_EXP_113 - Verify Print Cover Sheet downloads a PDF",
        async function () {
          console.log(
            "\n========== TC_EXP_113 - PRINT COVER SHEET =========="
          );

          await expectedDetailsPage.clickTab("documentDetails");

          const downloadDir = path.join(
            os.homedir(),
            "Downloads"
          );

          const filesBefore = new Set(
            fs.readdirSync(downloadDir)
          );

          const printCoverSheet = By.xpath(
            "//a[contains(@ng-click,'generatePDF') " +
              "and contains(normalize-space(.),'Print Cover Sheet')]"
          );

          const button =
            await expectedDetailsPage.waitForVisible(
              printCoverSheet,
              30000
            );

          expect(await button.isDisplayed()).to.equal(true);

          await button.click();

          await driver.wait(
            async () => {
              const filesAfter =
                fs.readdirSync(downloadDir);

              const downloadedPdf = filesAfter.find(
                (file) =>
                  !filesBefore.has(file) &&
                  file.toLowerCase().endsWith(".pdf")
              );

              const downloading = filesAfter.some(
                (file) => file.endsWith(".crdownload")
              );

              return Boolean(downloadedPdf) && !downloading;
            },
            60000,
            "Print Cover Sheet PDF was not downloaded."
          );

          const filesAfter =
            fs.readdirSync(downloadDir);

          const downloadedPdf = filesAfter.find(
            (file) =>
              !filesBefore.has(file) &&
              file.toLowerCase().endsWith(".pdf")
          );

          expect(downloadedPdf).to.not.equal(undefined);

          const pdfPath = path.join(
            downloadDir,
            downloadedPdf
          );

          expect(
            fs.statSync(pdfPath).size
          ).to.be.greaterThan(0);

          console.log(
            `✓ Cover Sheet PDF downloaded: ${downloadedPdf}`
          );
        }
          );
              it(
        "TC_EXP_119 - Verify payment request amount can be less than due amount",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");

          const status =
            await expectedDetailsPage.checkPaymentLinkStatus();

          console.log("Payment Link Button Status:", status);

          if (status === "Cancel Payment") {
            console.log("✓ Payment link already exists. Skipping click.");
            expect(status).to.equal("Cancel Payment");
            return;
          }

          expect(status).to.equal("Send Payment Link");

          const dueAmount =
            await expectedDetailsPage.getPaymentAmount();

          const requestedAmount = 50;

          expect(dueAmount).to.be.greaterThan(requestedAmount);

          await expectedDetailsPage.clickSendPaymentLink();
          await expectedDetailsPage.verifyPaymentLinkPopup();

          const popupDocumentId =
            await expectedDetailsPage.getPaymentPopupDocumentId();

          const pageDocumentId =
            await expectedDetailsPage.getDocumentId();

          expect(popupDocumentId).to.equal(pageDocumentId);

          await expectedDetailsPage.setPaymentPopupAmount(requestedAmount);

          const actualAmount =
            await expectedDetailsPage.getPaymentPopupAmount();

          expect(actualAmount).to.equal(requestedAmount);

          await expectedDetailsPage.submitPaymentLink();

          const finalStatus =
            await expectedDetailsPage.getPaymentLinkButtonText();

          expect(finalStatus).to.equal("Cancel Payment");

          console.log("✓ TC_EXP_119 PASSED");
        }
      );

      it(
        "TC_EXP_120 - Verify error when amount received exceeds due amount",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");

          const documentId =
            await expectedDetailsPage.getDocumentId();

          const dueAmount =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();

          expect(dueAmount).to.be.greaterThan(0);

          await expectedDetailsPage.clickMarkPayment();

          const popupDocumentId =
            await expectedDetailsPage.getMarkPaymentPopupDocumentId();

          expect(popupDocumentId).to.equal(documentId);

          const enteredAmount = dueAmount + 100;

          await expectedDetailsPage.setMarkPaymentPopupAmount(
            enteredAmount
          );

          const selectedMode =
            await expectedDetailsPage.selectPaymentMode();

          console.log("Document ID:", documentId);
          console.log("Due Amount:", dueAmount);
          console.log("Entered Amount:", enteredAmount);
          console.log("Payment Mode:", selectedMode);

          const popup = await driver.findElement(
            By.xpath(
              "//div[contains(@class,'modal')]" +
                "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]"
            )
          );

          await popup
            .findElement(
              By.xpath(".//button[normalize-space()='Submit']")
            )
            .click();

          const errorLocator = By.xpath(
            "//*[contains(normalize-space(.)," +
              "'Amount can not be more than the due amount')]"
          );

          const errorMessage = await driver.wait(
            async () => {
              const elements =
                await driver.findElements(errorLocator);

              for (const element of elements) {
                try {
                  if (!(await element.isDisplayed())) continue;

                  const text = (await element.getText())
                    .replace(/\s+/g, " ")
                    .trim();

                  if (
                    text.includes(
                      "Amount can not be more than the due amount"
                    )
                  ) {
                    return text;
                  }
                } catch (_) {}
              }

              return false;
            },
            10000,
            "Overpayment validation message was not displayed."
          );

          expect(errorMessage).to.include(
            "Amount can not be more than the due amount"
          );

          console.log("✓ Correct overpayment validation displayed.");

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

          const cancelButton =
            await visiblePaymentModal.findElement(
              By.xpath(".//button[normalize-space()='Cancel']")
            );

          await driver.wait(
            until.elementIsEnabled(cancelButton),
            5000
          );

          await cancelButton.click();

          await driver.wait(
            until.stalenessOf(visiblePaymentModal),
            10000,
            "Mark Payment modal did not close after clicking Cancel"
          );

          console.log(
            "✓ TC_EXP_120 PASSED; Mark Payment modal closed."
          );
        }
      );

      it(
        "TC_EXP_121 - Verify partial payment updates Order Summary",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");

          const documentId =
            await expectedDetailsPage.getDocumentId();

          const paidBefore =
            await expectedDetailsPage.getOrderSummaryPaidAmount();

          const outstandingBefore =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();

          const totalBefore =
            await expectedDetailsPage.getOrderSummaryTotalAmount();

          console.log("Document ID:", documentId);
          console.log("Total Amount:", totalBefore);
          console.log("Paid Before:", paidBefore.amount);
          console.log("Outstanding Before:", outstandingBefore);

          expect(
            paidBefore.amount + outstandingBefore
          ).to.be.closeTo(totalBefore, 0.01);

          expect(outstandingBefore).to.be.greaterThan(1);

          await expectedDetailsPage.clickMarkPayment();

          const popupDocumentId =
            await expectedDetailsPage.getMarkPaymentPopupDocumentId();

          expect(popupDocumentId).to.equal(documentId);

          const paymentAmount = Math.min(
            50,
            outstandingBefore - 1
          );

          await expectedDetailsPage.setMarkPaymentPopupAmount(
            paymentAmount
          );

          const selectedMode =
            await expectedDetailsPage.selectPaymentMode();

          console.log("Payment Mode:", selectedMode);

          const popup = await driver.findElement(
            By.xpath(
              "//div[contains(@class,'modal')]" +
                "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]"
            )
          );

          await popup
            .findElement(
              By.xpath(".//button[normalize-space()='Submit']")
            )
            .click();

          try {
            const alert = await driver.wait(
              until.alertIsPresent(),
              5000
            );

            console.log(
              "Confirmation Alert:",
              await alert.getText()
            );

            await alert.accept();
          } catch (_) {
            console.log("No browser confirmation alert appeared.");
          }

          await driver.wait(
            async () => {
              try {
                const paid =
                  await expectedDetailsPage.getOrderSummaryPaidAmount();

                const outstanding =
                  await expectedDetailsPage.getOrderSummaryOutstandingAmount();

                return (
                  Math.abs(
                    paid.amount -
                      (paidBefore.amount + paymentAmount)
                  ) < 0.01 &&
                  Math.abs(
                    outstanding -
                      (outstandingBefore - paymentAmount)
                  ) < 0.01
                );
              } catch (_) {
                return false;
              }
            },
            30000,
            "Order Summary did not reflect the partial payment."
          );

          const paidAfter =
            await expectedDetailsPage.getOrderSummaryPaidAmount();

          const outstandingAfter =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();

          expect(paidAfter.amount).to.be.closeTo(
            paidBefore.amount + paymentAmount,
            0.01
          );

          expect(outstandingAfter).to.be.closeTo(
            outstandingBefore - paymentAmount,
            0.01
          );

          console.log(
            "✓ Partial payment updated Order Summary successfully."
          );
          console.log("Paid After:", paidAfter.amount);
          console.log("Outstanding After:", outstandingAfter);
        }
      );

      it(
        "TC_EXP_122 - Verify full payment clears Outstanding Amount",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");

          const documentId =
            await expectedDetailsPage.getDocumentId();

          const paidBefore =
            await expectedDetailsPage.getOrderSummaryPaidAmount();

          const outstandingBefore =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();

          const totalBefore =
            await expectedDetailsPage.getOrderSummaryTotalAmount();

          console.log("Document ID:", documentId);
          console.log("Total Before:", totalBefore);
          console.log("Paid Before:", paidBefore.amount);
          console.log("Outstanding Before:", outstandingBefore);

          if (outstandingBefore <= 0.01) {
            expect(paidBefore.amount).to.be.closeTo(
              totalBefore,
              0.01
            );

            expect(outstandingBefore).to.be.closeTo(0, 0.01);

            expect(paidBefore.isGreen).to.equal(true);

            console.log(
              "✓ Document is already fully paid. No additional payment is required."
            );

            return;
          }

          expect(
            paidBefore.amount + outstandingBefore
          ).to.be.closeTo(totalBefore, 0.01);

          await expectedDetailsPage.clickMarkPayment();

          const popupDocumentId =
            await expectedDetailsPage.getMarkPaymentPopupDocumentId();

          expect(popupDocumentId).to.equal(documentId);

          await expectedDetailsPage.setMarkPaymentPopupAmount(
            outstandingBefore
          );

          const popupAmount =
            await expectedDetailsPage.getMarkPaymentPopupAmount();

          expect(popupAmount).to.be.closeTo(
            outstandingBefore,
            0.01
          );

          const selectedMode =
            await expectedDetailsPage.selectPaymentMode();

          console.log("Payment Mode:", selectedMode);
          console.log("Full Payment Amount:", popupAmount);

          const popup = await driver.findElement(
            By.xpath(
              "//div[contains(@class,'modal')]" +
                "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]"
            )
          );

          const submitButton = await popup.findElement(
            By.xpath(".//button[normalize-space()='Submit']")
          );

          await driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            submitButton
          );

          await submitButton.click();

          try {
            const alert = await driver.wait(
              until.alertIsPresent(),
              5000
            );

            console.log(
              "Confirmation Alert:",
              await alert.getText()
            );

            await alert.accept();
          } catch (_) {}

          await driver.wait(
            async () => {
              try {
                const outstanding =
                  await expectedDetailsPage.getOrderSummaryOutstandingAmount();

                return Math.abs(outstanding) < 0.01;
              } catch (_) {
                return false;
              }
            },
            30000,
            "Outstanding Amount did not become zero."
          );

          await driver.sleep(1000);

          const paidAfter =
            await expectedDetailsPage.getOrderSummaryPaidAmount();

          const outstandingAfter =
            await expectedDetailsPage.getOrderSummaryOutstandingAmount();

          const totalAfter =
            await expectedDetailsPage.getOrderSummaryTotalAmount();

          console.log("Paid After:", paidAfter.amount);
          console.log("Outstanding After:", outstandingAfter);
          console.log("Total After:", totalAfter);
          console.log("Paid Amount Green:", paidAfter.isGreen);

          expect(paidAfter.amount).to.be.closeTo(
            paidBefore.amount + outstandingBefore,
            0.01
          );

          expect(outstandingAfter).to.be.closeTo(0, 0.01);

          expect(paidAfter.amount).to.be.closeTo(
            totalAfter,
            0.01
          );

          expect(paidAfter.isGreen).to.equal(true);

          console.log("✓ TC_EXP_122 passed.");
        }
          );
              const PRICE_INCREASE = 5;

      it(
        "TC_EXP_123 - Verify edited fee total and Restore Fee",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");
          await expectedDetailsPage.waitForLoadingToFinish();

          const testFee =
            await expectedDetailsPage.getAnyAvailableFeeType();

          const feesBefore =
            await expectedDetailsPage.getDocumentDetailsFeeDetails();

          const feeBefore = feesBefore.find(
            (fee) =>
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

          const totalAfterRestore =
            await expectedDetailsPage.getFeeTableTotalAmount();

          expect(totalAfterRestore).to.be.closeTo(totalBefore, 0.01);

          console.log("✓ TC_EXP_123 passed.");
        }
      );

      it(
        "TC_EXP_124 - Verify edited fee after Save Price and bottom Save",
        async function () {
          this.timeout(120000);

          await expectedDetailsPage.clickTab("documentDetails");
          await expectedDetailsPage.waitForLoadingToFinish();

          const testFee =
            await expectedDetailsPage.getAnyAvailableFeeType();

          const feesBefore =
            await expectedDetailsPage.getDocumentDetailsFeeDetails();

          const normalize = (value) =>
            String(value).replace(/\s+/g, " ").trim().toLowerCase();

          const feeBefore = feesBefore.find(
            (fee) => normalize(fee.feeType) === normalize(testFee)
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

          try {
            await expectedDetailsPage.editFeeAmount(
              testFee,
              originalUnitPrice + PRICE_INCREASE
            );

            await expectedDetailsPage.clickSavePrice();
            await expectedDetailsPage.waitForLoadingToFinish();

            await driver.wait(
              async () => {
                try {
                  const currentTotal =
                    await expectedDetailsPage.getFeeTableTotalAmount();

                  return (
                    Math.abs(currentTotal - expectedUpdatedTotal) < 0.01
                  );
                } catch (_) {
                  return false;
                }
              },
              45000,
              "Total Amount did not update after Save Price."
            );

            await expectedDetailsPage.clickDocumentSave();
            await expectedDetailsPage.waitForLoadingToFinish();

            const totalAfterDocumentSave =
              await expectedDetailsPage.getFeeTableTotalAmount();

            expect(totalAfterDocumentSave).to.be.closeTo(
              expectedUpdatedTotal,
              0.01
            );

            console.log("✓ Save Price and bottom Save verified.");
          } finally {
            await expectedDetailsPage.waitForLoadingToFinish();
            await expectedDetailsPage.clickRestoreFees();
            await expectedDetailsPage.waitForLoadingToFinish();

            await driver.wait(
              async () => {
                try {
                  const currentTotal =
                    await expectedDetailsPage.getFeeTableTotalAmount();

                  return Math.abs(currentTotal - totalBefore) < 0.01;
                } catch (_) {
                  return false;
                }
              },
              45000,
              "Restore Fee did not return Total Amount to its original value."
            );

            const totalAfterRestore =
              await expectedDetailsPage.getFeeTableTotalAmount();

            expect(totalAfterRestore).to.be.closeTo(totalBefore, 0.01);
          }

          console.log("✓ TC_EXP_124 passed.");
        }
      );

      it(
        "TC_EXP_125 - Verify deleted fee and Restore Fee",
        async function () {
          await expectedDetailsPage.clickTab("documentDetails");

          const testFee =
            await expectedDetailsPage.getAnyAvailableFeeType();

          const totalBefore =
            await expectedDetailsPage.getFeeTableTotalAmount();

          const feesBefore =
            await expectedDetailsPage.getDocumentDetailsFeeDetails();

          const feeBefore = feesBefore.find(
            (fee) =>
              fee.feeType.replace(/\s+/g, " ").trim().toLowerCase() ===
              testFee.replace(/\s+/g, " ").trim().toLowerCase()
          );

          expect(feeBefore, `Fee "${testFee}" should exist`).to.exist;

          expect(Number(feeBefore.total)).to.be.greaterThan(0);

          await expectedDetailsPage.deleteFeeRow(testFee);

          expect(
            await expectedDetailsPage.isFeeRowPresent(testFee)
          ).to.equal(false);

          const totalAfterDelete =
            await expectedDetailsPage.getFeeTableTotalAmount();

          expect(totalAfterDelete).to.be.lessThan(totalBefore);

          await expectedDetailsPage.clickSavePrice();
          await expectedDetailsPage.clickRestoreFees();

          const totalAfterRestore =
            await expectedDetailsPage.getFeeTableTotalAmount();

          expect(totalAfterRestore).to.be.closeTo(totalBefore, 0.01);

          expect(
            await expectedDetailsPage.isFeeRowPresent(testFee)
          ).to.equal(true);

          console.log(`✓ TC_EXP_125 passed for fee: ${testFee}`);
        }
      );

      it(
        "TC_EXP_126 - Verify Print Document icon opens a new window",
        async function () {
          this.timeout(90000);

          await expectedPage.open();

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

          await driver.executeScript(
            "arguments[0].click();",
            icon
          );

          await driver.wait(
            async () => {
              const handles = await driver.getAllWindowHandles();
              return handles.length > windowsBefore.length;
            },
            30000,
            "Print Document did not open a new window"
          );

          const windowsAfter = await driver.getAllWindowHandles();

          const newWindow = windowsAfter.find(
            (handle) => !windowsBefore.includes(handle)
          );

          expect(newWindow).to.exist;

          await driver.switchTo().window(newWindow);

          await driver.wait(
            async () => {
              const url = await driver.getCurrentUrl();
              return url && url !== "about:blank";
            },
            30000,
            "The print document window did not load"
          );

          const documentUrl = await driver.getCurrentUrl();

          expect(documentUrl).to.not.equal("about:blank");

          console.log("Opened document URL:", documentUrl);
          console.log("✓ TC_EXP_126 PASSED");

          await driver.switchTo().window(windowsBefore[0]);
        }
          );
              it(
        "TC_EXP_127 - Verify Split Document creates two documents with the same Order ID and different Doc IDs",
        async function () {
          this.timeout(120000);

          const originalOrderId = String(orderId).trim();
          const originalDocId = String(docId).trim();

          console.log("Original Order ID:", originalOrderId);
          console.log("Original Doc ID:", originalDocId);

          await expectedDetailsPage.clickSplitDocument();

          const popupDocId =
            await expectedDetailsPage.getSplitPopupDocId();

          expect(popupDocId).to.equal(originalDocId);

          const splitCount =
            await expectedDetailsPage.getSplitDocumentCount();

          expect(splitCount).to.equal("2");

          await expectedDetailsPage.confirmSplitDocument();

          await expectedDetailsPage.searchOrderIdInFilterAnything(
            originalOrderId
          );

          await driver.sleep(1500);

          const documents =
            await expectedDetailsPage.waitForSplitDocuments(
              originalOrderId
            );

          expect(documents.length).to.be.at.least(2);

          const matchingDocuments = documents.filter(
            (document) => document.orderId === originalOrderId
          );

          const docIds = [
            ...new Set(
              matchingDocuments.map((document) => document.docId)
            ),
          ];

          expect(matchingDocuments.length).to.be.at.least(2);
          expect(docIds.length).to.be.at.least(2);

          console.log("Verified Order ID:", originalOrderId);
          console.log("Verified Doc IDs:", docIds);
        }
      );

      it("TC_EXP_018 - Verify Contact Details", async function () {
        const text =
          await expectedDetailsPage.verifyContactDetails();

        expect(text).to.be.a("string");
        expect(text.length).to.be.greaterThan(0);
      });

      it(
        "TC_EXP_019 - Verify Add New button opens address form",
        async function () {
          await expectedDetailsPage.clickContactDetails();
          await expectedDetailsPage.clickAddNewAddress();

          const addressLine1 =
            await expectedDetailsPage.waitForVisible(
              expectedDetailsPage.addressLine1Input,
              30000
            );

          expect(await addressLine1.isDisplayed()).to.equal(true);

          await expectedDetailsPage.closeAddressForm();
        }
      );

      it(
        "TC_EXP_020 - Verify user can add a new address",
        async function () {
          await expectedDetailsPage.clickContactDetails();

          const uniqueId = Date.now().toString().slice(-10);

          testAddress = {
            addressLine1: `Automation Address ${uniqueId}`,
            addressLine2: "Test Address Line 2",
            city: "Bengaluru",
            state: "Karnataka",
            zipCode: "560001",
            country: "India",
          };

          console.log(
            "Creating address:",
            testAddress.addressLine1
          );

          await expectedDetailsPage.clickAddNewAddress();
          await expectedDetailsPage.fillAddress(testAddress);
          await expectedDetailsPage.saveAddress();

          await expectedDetailsPage.waitForAddressToAppear(
            testAddress.addressLine1,
            30000
          );

          const result =
            await expectedDetailsPage.verifyAddressExists(
              testAddress.addressLine1
            );

          expect(result).to.equal(true);

          console.log(
            "Shared address created:",
            testAddress.addressLine1
          );
        }
      );

      it(
        "TC_EXP_021 - Verify Close button closes Add New address form",
        async function () {
          await expectedDetailsPage.clickContactDetails();
          await expectedDetailsPage.clickAddNewAddress();

          const addressLine1 =
            await expectedDetailsPage.waitForVisible(
              expectedDetailsPage.addressLine1Input,
              30000
            );

          expect(await addressLine1.isDisplayed()).to.equal(true);

          await expectedDetailsPage.closeAddressForm();

          const fields = await driver.findElements(
            expectedDetailsPage.addressLine1Input
          );

          let visible = false;

          for (const field of fields) {
            try {
              if (await field.isDisplayed()) {
                visible = true;
                break;
              }
            } catch (_) {}
          }

          expect(visible).to.equal(false);
        }
      );

      it(
        "TC_EXP_022 - Verify user can edit the existing address",
        async function () {
          await expectedDetailsPage.clickContactDetails();

          expect(testAddress).to.not.equal(null);

          const originalExists =
            await expectedDetailsPage.verifyAddressExists(
              testAddress.addressLine1
            );

          expect(originalExists).to.equal(true);

          const uniqueUpdatedId =
            Date.now().toString().slice(-10);

          updatedAddress = {
            addressLine1: `Updated Address ${uniqueUpdatedId}`,
            addressLine2: "Updated Address Line 2",
            city: "Bengaluru",
            state: "Karnataka",
            zipCode: "560002",
            country: "India",
          };

          await expectedDetailsPage.editAddress(
            testAddress.addressLine1,
            updatedAddress
          );

          const updatedExists =
            await expectedDetailsPage.verifyAddressExists(
              updatedAddress.addressLine1
            );

          expect(updatedExists).to.equal(true);

          // Reuse the same address for the remaining address tests.
          testAddress = { ...updatedAddress };

          console.log(
            "Shared address is now:",
            testAddress.addressLine1
          );
        }
      );

      it(
        "TC_EXP_023 - Verify address can be set as Default Shipping",
        async function () {
          await expectedDetailsPage.clickContactDetails();

          expect(testAddress).to.not.equal(null);

          const addressExists =
            await expectedDetailsPage.verifyAddressExists(
              testAddress.addressLine1
            );

          expect(addressExists).to.equal(true);

          await expectedDetailsPage.setDefaultShipping(
            testAddress.addressLine1
          );

          const card =
            await expectedDetailsPage.getAddressCard(
              testAddress.addressLine1
            );

          const shippingCheckbox = await card.findElement(
            By.xpath(
              ".//input[@type='checkbox' and " +
                "contains(@ng-model,'shippingAddressId')]"
            )
          );

          expect(
            await shippingCheckbox.isSelected()
          ).to.equal(true);
        }
      );

      it(
        "TC_EXP_024 - Verify address can be set as Default Billing",
        async function () {
          await expectedDetailsPage.clickContactDetails();

          expect(testAddress).to.not.equal(null);

          const addressExists =
            await expectedDetailsPage.verifyAddressExists(
              testAddress.addressLine1
            );

          expect(addressExists).to.equal(true);

          await expectedDetailsPage.setDefaultBilling(
            testAddress.addressLine1
          );

          const card =
            await expectedDetailsPage.getAddressCard(
              testAddress.addressLine1
            );

          const billingCheckbox = await card.findElement(
            By.xpath(
              ".//input[@type='checkbox' and " +
                "contains(@ng-model,'billingAddressId')]"
            )
          );

          expect(
            await billingCheckbox.isSelected()
          ).to.equal(true);
        }
      );

      it(
        "TC_EXP_025 - Verify user can delete the existing address",
        async function () {
          await expectedDetailsPage.clickContactDetails();

          expect(testAddress).to.not.equal(null);

          const exists =
            await expectedDetailsPage.verifyAddressExists(
              testAddress.addressLine1
            );

          expect(exists).to.equal(true);

          await expectedDetailsPage.deleteAddress(
            testAddress.addressLine1
          );

          const deleted =
            await expectedDetailsPage.verifyAddressDeleted(
              testAddress.addressLine1
            );

          expect(deleted).to.equal(true);

          testAddress = null;
          updatedAddress = null;
        }
      );

      it("TC_EXP_026 - Verify Other Details", async function () {
        const text =
          await expectedDetailsPage.verifyOtherDetails();

        expect(text).to.be.a("string");
        expect(text.length).to.be.greaterThan(0);
      });

      it("TC_EXP_027 - Verify Tracking Details", async function () {
        const text =
          await expectedDetailsPage.verifyTrackingDetails();

        expect(text).to.be.a("string");
        expect(text.length).to.be.greaterThan(0);
      });
    });

    // ============================================================
    // SECTION 2: DROPOFF
    // ============================================================

    describe(
      "DropOff Page - Queue and Courier Functional Tests",
      function () {
        this.timeout(300000);

        let newPage;
        let dropOffDetail;

        const downloadsDirectory = path.join(
          os.homedir(),
          "Downloads"
        );

        function getExistingFiles() {
          const snapshot = new Map();

          if (!fs.existsSync(downloadsDirectory)) {
            fs.mkdirSync(downloadsDirectory, {
              recursive: true,
            });
          }

          for (const file of fs.readdirSync(downloadsDirectory)) {
            const fullPath = path.join(
              downloadsDirectory,
              file
            );

            try {
              const stat = fs.statSync(fullPath);

              snapshot.set(file, {
                size: stat.size,
                mtimeMs: stat.mtimeMs,
              });
            } catch (_) {
              // Ignore files that are being changed or removed.
            }
          }

          return snapshot;
        }

        async function waitForExcelDownload(
          existingFiles,
          timeout = 90000
        ) {
          const startTime = Date.now();
          const stableCounts = new Map();

          while (Date.now() - startTime < timeout) {
            const files = fs.existsSync(downloadsDirectory)
              ? fs.readdirSync(downloadsDirectory)
              : [];

            for (const file of files) {
              const extension =
                path.extname(file).toLowerCase();

              if (
                extension !== ".xlsx" &&
                extension !== ".xls"
              ) {
                continue;
              }

              const fullPath = path.join(
                downloadsDirectory,
                file
              );

              try {
                const stat = fs.statSync(fullPath);
                const previous = existingFiles.get(file);

                if (
                  previous &&
                  previous.size === stat.size &&
                  previous.mtimeMs === stat.mtimeMs
                ) {
                  continue;
                }

                const lastSize = stableCounts.get(file);

                if (
                  lastSize &&
                  lastSize.size === stat.size
                ) {
                  lastSize.count += 1;
                } else {
                  stableCounts.set(file, {
                    size: stat.size,
                    count: 1,
                  });
                }

                if (
                  stableCounts.get(file).count >= 2 &&
                  stat.size > 0
                ) {
                  return fullPath;
                }
              } catch (_) {
                // The file may still be downloading.
              }
            }

            await new Promise((resolve) =>
              setTimeout(resolve, 1000)
            );
          }

          throw new Error(
            "Excel download was not completed within the timeout."
          );
        }

                // Verify a print action opens a new tab or window.
        async function verifyPrintOpensNewTab(
          driver,
          triggerPrint,
          description
        ) {
          const handlesBefore = await driver.getAllWindowHandles();
          const originalHandle = await driver.getWindowHandle();

          try {
            await triggerPrint();

            await driver.wait(
              async () => {
                const handlesNow =
                  await driver.getAllWindowHandles();

                return handlesNow.some(
                  (handle) => !handlesBefore.includes(handle)
                );
              },
              60000,
              `${description} did not open a new tab/window.`
            );

            const handlesAfter =
              await driver.getAllWindowHandles();

            const newHandle = handlesAfter.find(
              (handle) => !handlesBefore.includes(handle)
            );

            expect(newHandle).to.exist;

            await driver.switchTo().window(newHandle);

            await driver.wait(
              async () => {
                const handlesNow =
                  await driver.getAllWindowHandles();

                if (!handlesNow.includes(newHandle)) {
                  return false;
                }

                const url = await driver
                  .getCurrentUrl()
                  .catch(() => "");

                const title = await driver
                  .getTitle()
                  .catch(() => "");

                return Boolean(url || title);
              },
              30000,
              `${description} tab did not load.`
            );

            const printUrl = await driver.getCurrentUrl();
            const printTitle = await driver
              .getTitle()
              .catch(() => "");

            expect(printUrl).to.be.a("string").that.is.not.empty;

            console.log(`✓ ${description} opened.`);
            console.log(`URL: ${printUrl}`);
            console.log(`Title: ${printTitle}`);
          } finally {
            const handlesNow =
              await driver.getAllWindowHandles();

            for (const handle of handlesNow) {
              if (!handlesBefore.includes(handle)) {
                await driver.switchTo().window(handle);
                await driver.close();
              }
            }

            const remainingHandles =
              await driver.getAllWindowHandles();

            if (remainingHandles.includes(originalHandle)) {
              await driver.switchTo().window(originalHandle);
            }
          }
        }

        // ==================== Login and navigation ====================
        before(async function () {
          newPage = new NewPage(driver);
          dropOffDetail = new DropOffDetail(driver);

          await newPage.waitForPage();
          await dropOffDetail.open();

          console.log(
            "✓ DropOff page loaded and ready. Starting test cases."
          );
        });

        // TC_DROPOFF_001 - Export DropOff Queue to Excel
        it(
          "TC_DROPOFF_001 - Verify Export downloads the DropOff Queue Excel file",
          async function () {
            const exportButton = await driver.wait(
              until.elementLocated(
                dropOffDetail.exportDropOffQueueButton
              ),
              60000
            );

            await driver.wait(
              until.elementIsVisible(exportButton),
              30000
            );

            await driver.wait(
              until.elementIsEnabled(exportButton),
              30000
            );

            const existingFiles = getExistingFiles();

            console.log(
              "Clicking DropOff Queue Export button..."
            );

            await dropOffDetail.clickExportDropOffQueue();

            const filePath =
              await waitForExcelDownload(existingFiles, 90000);

            expect(fs.existsSync(filePath)).to.equal(true);
            expect(fs.statSync(filePath).size).to.be.greaterThan(0);

            expect([".xls", ".xlsx"]).to.include(
              path.extname(filePath).toLowerCase()
            );

            console.log(
              `✓ DropOff Queue Excel downloaded: ${filePath}`
            );
          }
        );

        // TC_DROPOFF_002 - Print Docs for DropOff Queue
        it(
          "TC_DROPOFF_002 - Verify Print Docs opens the DropOff Queue print view",
          async function () {
            await verifyPrintOpensNewTab(
              driver,
              async () => {
                await dropOffDetail.clickPrintDropOffQueueDocs();
              },
              "DropOff Queue Print Docs"
            );
          }
        );

        // TC_DROPOFF_003 - Export Courier to Excel
        it(
          "TC_DROPOFF_003 - Verify Export downloads the Courier Excel file",
          async function () {
            const existingFiles = getExistingFiles();

            await dropOffDetail.clickExportCourier();

            const filePath =
              await waitForExcelDownload(existingFiles, 90000);

            expect(fs.existsSync(filePath)).to.equal(true);
            expect(fs.statSync(filePath).size).to.be.greaterThan(0);

            expect([".xls", ".xlsx"]).to.include(
              path.extname(filePath).toLowerCase()
            );

            console.log(`✓ Courier Excel downloaded: ${filePath}`);
          }
        );

        // TC_DROPOFF_004 - Courier print dropdown: Cheques
        it(
          "TC_DROPOFF_004 - Verify Courier print dropdown opens Cheques print tab",
          async function () {
            await verifyPrintOpensNewTab(
              driver,
              async () => {
                await dropOffDetail.selectCourierPrintOption("Cheques");
              },
              "Courier - Cheques"
            );
          }
        );

        // TC_DROPOFF_005 - Courier print dropdown: Shipping
        it(
          "TC_DROPOFF_005 - Verify Courier print dropdown opens Shipping print tab",
          async function () {
            await verifyPrintOpensNewTab(
              driver,
              async () => {
                await dropOffDetail.selectCourierPrintOption("Shipping");
              },
              "Courier - Shipping"
            );
          }
        );

        // TC_DROPOFF_006 - Courier print dropdown: Docs
        it(
          "TC_DROPOFF_006 - Verify Courier print dropdown opens Docs print tab",
          async function () {
            await verifyPrintOpensNewTab(
              driver,
              async () => {
                await dropOffDetail.selectCourierPrintOption("Docs");
              },
              "Courier - Docs"
            );
          }
        );

        // TC_DROPOFF_007 - Completed Export based on document availability
        it(
          "TC_DROPOFF_007 - Verify Completed Export based on document availability",
          async function () {
            const completedCount =
              await dropOffDetail.getCompletedDocumentCount();

            console.log(
              `Completed document count: ${completedCount}`
            );

            if (completedCount === 0) {
              await dropOffDetail.clickExportCompleted();

              await driver.wait(
                async () => {
                  const message =
                    await dropOffDetail.getNoDocumentsMessageIfPresent();

                  return message === "No documents found.";
                },
                15000,
                "No documents found notification was not displayed."
              );

              expect(
                await dropOffDetail.getNoDocumentsMessageIfPresent()
              ).to.equal("No documents found.");

              console.log(
                "✓ No documents found message displayed for Export."
              );

              return;
            }

            const existingFiles = getExistingFiles();

            await dropOffDetail.clickExportCompleted();

            const filePath =
              await waitForExcelDownload(existingFiles, 90000);

            expect(fs.existsSync(filePath)).to.equal(true);
            expect(fs.statSync(filePath).size).to.be.greaterThan(0);

            console.log(
              `✓ Completed Export downloaded: ${filePath}`
            );
          }
        );

        // TC_DROPOFF_008 - Completed Print Docs based on document availability
        it(
          "TC_DROPOFF_008 - Verify Completed Print Docs based on document availability",
          async function () {
            const completedCount =
              await dropOffDetail.getCompletedDocumentCount();

            console.log(
              `Completed document count: ${completedCount}`
            );

            const handlesBefore =
              await driver.getAllWindowHandles();

            if (completedCount === 0) {
              await dropOffDetail.clickPrintCompletedDocs();

              await driver.wait(
                async () => {
                  const message =
                    await dropOffDetail.getNoDocumentsMessageIfPresent();

                  return message === "No documents found.";
                },
                15000,
                "No documents found notification was not displayed."
              );

              expect(
                await dropOffDetail.getNoDocumentsMessageIfPresent()
              ).to.equal("No documents found.");

              console.log(
                "✓ No documents found message displayed for Print Docs."
              );

              return;
            }

            await dropOffDetail.clickPrintCompletedDocs();

            await driver.wait(
              async () => {
                const handlesNow =
                  await driver.getAllWindowHandles();

                return handlesNow.some(
                  (handle) => !handlesBefore.includes(handle)
                );
              },
              60000,
              "Completed Print Docs did not open a new tab/window."
            );

            const handlesAfter =
              await driver.getAllWindowHandles();

            const newHandle = handlesAfter.find(
              (handle) => !handlesBefore.includes(handle)
            );

            expect(newHandle).to.exist;

            await driver.switchTo().window(newHandle);

            const printUrl = await driver.getCurrentUrl();

            expect(printUrl).to.be.a("string").that.is.not.empty;

            console.log(
              "✓ Completed Print Docs opened:",
              printUrl
            );

            await driver.close();

            await driver.switchTo().window(handlesBefore[0]);
          }
            );
            it(
    "TC_DROPOFF_014 - Verify order moves from DropOff Queue to Courier and back",
    async function () {
      this.timeout(120000);

      const orderId = "263071";

      const dropOffPanel = dropOffDetail.getDropOffPanel();
      const courierPanel = dropOffDetail.getCourierPanel();

      // Search for the order.
      await dropOffDetail.searchOrderId(orderId);
      await dropOffDetail.waitForLoadingToFinish();

      // Verify the initial location.
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

      expect(inDropOff).to.equal(true);
      expect(inCourier).to.equal(false);

      // Move the order to Courier.
      await dropOffDetail.selectOrderCheckbox(
        dropOffPanel,
        orderId
      );

      await dropOffDetail.clickPanelButton(
        dropOffPanel,
        "Courier"
      );

      const movedToCourier =
        await dropOffDetail.waitForOrderInPanelWithRefresh(
          courierPanel,
          orderId,
          5
        );

      expect(movedToCourier).to.equal(true);

      const leftDropOff = await dropOffDetail.waitForOrderToLeavePanel(
        dropOffPanel,
        orderId,
        15000
      );

      expect(leftDropOff).to.equal(true);

      console.log(`✓ Order ${orderId} moved to Courier.`);

      // Move the order back to DropOff Queue.
      await dropOffDetail.selectOrderCheckbox(
        courierPanel,
        orderId
      );

      await dropOffDetail.clickPanelButton(
        courierPanel,
        "Queue"
      );

      const returnedToDropOff =
        await dropOffDetail.waitForOrderInPanelWithRefresh(
          dropOffPanel,
          orderId,
          5
        );

      expect(returnedToDropOff).to.equal(true);

      const leftCourier = await dropOffDetail.waitForOrderToLeavePanel(
        courierPanel,
        orderId,
        15000
      );

      expect(leftCourier).to.equal(true);

      console.log(
        `✓ Order ${orderId} returned to DropOff Queue successfully.`
      );
    }
  );

  it(
    "TC_DROPOFF_015 - Verify order moves from DropOff Queue to Courier, Completed and back",
    async function () {
      this.timeout(240000);

      const orderId = "263071";

      // Wait for the DropOff page to finish loading.
      await dropOffDetail.waitForLoadingToFinish(120000);

      // Search for the order.
      await dropOffDetail.searchOrderId(orderId);

      // Confirm the order is in DropOff Queue.
      await dropOffDetail.waitForOrderInPanelWithRefresh(
        dropOffDetail.getDropOffPanel(),
        orderId,
        5
      );

      console.log(`✓ Order ${orderId} found in DropOff Queue.`);

      // Move the order to Courier.
      await dropOffDetail.selectOrderCheckbox(
        dropOffDetail.getDropOffPanel(),
        orderId
      );

      await dropOffDetail.clickPanelButton(
        dropOffDetail.getDropOffPanel(),
        "Courier"
      );

      await dropOffDetail.waitForOrderInPanelWithRefresh(
        dropOffDetail.getCourierPanel(),
        orderId,
        5
      );

      console.log(`✓ Order ${orderId} moved to Courier.`);

      // Complete the order.
      await dropOffDetail.selectOrderCheckbox(
        dropOffDetail.getCourierPanel(),
        orderId
      );

      await dropOffDetail.clickPanelButton(
        dropOffDetail.getCourierPanel(),
        "Complete"
      );

      console.log("✓ Complete button clicked.");

      // Handle the shipping-label popup.
      await dropOffDetail.completeCourierOrderWithShippingLabels();

      // Verify the order appears in Completed.
      await dropOffDetail.waitForOrderInPanelWithRefresh(
        dropOffDetail.getCompletedPanel(),
        orderId,
        5
      );

      console.log(`✓ Order ${orderId} moved to Completed.`);

      // Return the order to DropOff Queue.
      await dropOffDetail.selectOrderCheckbox(
        dropOffDetail.getCompletedPanel(),
        orderId
      );

      await dropOffDetail.clickPanelButton(
        dropOffDetail.getCompletedPanel(),
        "Return"
      );

      await dropOffDetail.waitForOrderInPanelWithRefresh(
        dropOffDetail.getDropOffPanel(),
        orderId,
        5
      );

      console.log(`✓ Order ${orderId} returned to DropOff Queue.`);
    }
  );
});

// SECTION 3: Pickup
describe(
  "Pickup Page - Export and Print Docs Functional Tests",
  function () {
    // Continue with the Pickup test cases in the next part.
  }
    );
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

      it(
        "TC_PICKUP_005 - Verify Pickup Queue and Completed totals for each document filter",
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
              `\n========== Testing document filter: ${documentType} ==========`
            );

            await pickupPage.selectDocumentFilter(documentType);
            await pickupPage.waitForLoadingToFinish();

            const pickupQueueTotal =
              await pickupPage.getSectionTotal("Pickup Queue");

            const completedTotal =
              await pickupPage.getSectionTotal("Completed");

            console.log(`Pickup Queue Total: ${pickupQueueTotal}`);
            console.log(`Completed Total: ${completedTotal}`);

            if (
              pickupQueueTotal === null ||
              pickupQueueTotal === undefined
            ) {
              throw new Error(
                `Pickup Queue total unavailable for "${documentType}".`
              );
            }

            if (
              completedTotal === null ||
              completedTotal === undefined
            ) {
              throw new Error(
                `Completed total unavailable for "${documentType}".`
              );
            }

            const pickupTotalNumber = Number(
              String(pickupQueueTotal).replace(/,/g, "")
            );

            const completedTotalNumber = Number(
              String(completedTotal).replace(/,/g, "")
            );

            expect(pickupTotalNumber).to.be.finite;
            expect(pickupTotalNumber).to.be.at.least(0);

            expect(completedTotalNumber).to.be.finite;
            expect(completedTotalNumber).to.be.at.least(0);
          }

          console.log("✓ TC_PICKUP_005 completed.");
        }
      );

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

            await pickupPage.selectDocumentCategory(category);
            await pickupPage.waitForLoadingToFinish();

            const pickupQueueTotal =
              await pickupPage.getSectionTotal("Pickup Queue");

            const completedTotal =
              await pickupPage.getSectionTotal("Completed");

            console.log(`Pickup Queue Total: ${pickupQueueTotal}`);
            console.log(`Completed Total: ${completedTotal}`);

            expect(pickupQueueTotal)
              .to.be.a("number")
              .and.at.least(0);

            expect(completedTotal)
              .to.be.a("number")
              .and.at.least(0);
          }

          console.log("✓ TC_PICKUP_006 completed.");
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
            await pickupPage.waitForLoadingToFinish();

            const pickupQueueTotal =
              await pickupPage.getSectionTotal("Pickup Queue");

            const completedTotal =
              await pickupPage.getSectionTotal("Completed");

            console.log(`Stop: ${stopName}`);
            console.log(`Pickup Queue Total: ${pickupQueueTotal}`);
            console.log(`Completed Total: ${completedTotal}`);

            expect(pickupQueueTotal)
              .to.be.a("number")
              .and.at.least(0);

            expect(completedTotal)
              .to.be.a("number")
              .and.at.least(0);
          }

          console.log("✓ TC_PICKUP_007 completed.");
        }
    );
          it(
        "TC_PICKUP_008 - Search Order IDs and verify Order ID, Doc ID, and Country",
        async function () {
          this.timeout(180000);

          const orderIds = ["263029", "262950"];

          const searchBoxLocator = By.css(
            "input[placeholder='Filter Anything']"
          );

          await driver.wait(
            until.elementLocated(searchBoxLocator),
            30000,
            "Filter Anything search box was not found."
          );

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

          const searchBox = await driver.findElement(searchBoxLocator);

          for (const orderId of orderIds) {
            console.log(`\n========== Pickup Search: ${orderId} ==========`);

            await searchBox.clear();
            await searchBox.sendKeys(orderId);

            const result = await driver.wait(
              async () => await findOrderInSections(orderId),
              30000,
              `Order ID ${orderId} was not found in Pickup Queue or Completed.`
            );

            expect(result).to.exist;
            expect(result.orderId).to.equal(orderId);

            console.log(`Order ID: ${result.orderId}`);
            console.log(`Doc ID: ${result.docId || "Not found"}`);
            console.log(`Country: ${result.country || "Not found"}`);
            console.log(`Section: ${result.section}`);
            console.log(`Row data: ${result.rowText}`);

            expect(result.docId).to.not.equal("");
            expect(result.country).to.not.equal("");
          }

          await searchBox.clear();

          console.log(
            "✓ Both Order IDs were searched and verified on the Pickup page."
          );
        }
      );

      it(
        "TC_PICKUP_009 - Verify document counts for 14-10-2026",
        async function () {
          this.timeout(180000);

          const selectedDate = "2026-10-14";

          try {
            console.log("\n========== Pickup Date Filter Test ==========");

            await pickupPage.selectDateFilter(selectedDate);

            const pickupQueueCount =
              await pickupPage.getSectionTotal("Pickup Queue");

            const completedCount =
              await pickupPage.getSectionTotal("Completed");

            console.log(`Selected Date: 14-10-2026`);
            console.log(`Pickup Queue Documents: ${pickupQueueCount}`);
            console.log(`Completed Documents: ${completedCount}`);

            expect(pickupQueueCount).to.be.a("number").and.at.least(0);
            expect(completedCount).to.be.a("number").and.at.least(0);
          } finally {
            await pickupPage.clearDateFilter();
          }
        }
      );
    });

// SECTION 4: Ship to Customer
describe(
  "Ship to Customer - Export and Print Docs Functional Tests",
  function () {
    this.timeout(300000);

    let newPage;
    let shipPage;

    before(async function () {
      newPage = new NewPage(driver);
      shipPage = new ShipToCustomerDetail(driver);

      await newPage.waitForPage();
      await shipPage.open();

      console.log(
        "✓ Ship to Customer page ready. Starting test cases."
      );
    });

    function getDownloadDir() {
      return path.join(
        process.env.USERPROFILE || process.cwd(),
        "Downloads"
      );
    }

            // TC_SHIP_001
      it(
        "TC_SHIP_001 - Verify Ready to Ship Export",
        async function () {
          await verifyExport(
            "readyToShip",
            () => shipPage.clickReadyToShipExport(),
            "Ready to Ship Export"
          );
        }
      );

      // TC_SHIP_002
      it(
        "TC_SHIP_002 - Verify Ready to Ship Print Docs",
        async function () {
          await verifyPrint(
            "readyToShip",
            () => shipPage.clickReadyToShipPrintDocs(),
            "Ready to Ship Print Docs"
          );
        }
      );

      // TC_SHIP_003
      it(
        "TC_SHIP_003 - Verify Completed Export",
        async function () {
          await verifyExport(
            "completed",
            () => shipPage.clickCompletedExport(),
            "Completed Export"
          );
        }
      );

      // TC_SHIP_004
      it(
        "TC_SHIP_004 - Verify Completed Print Docs",
        async function () {
          await verifyPrint(
            "completed",
            () => shipPage.clickCompletedPrintDocs(),
            "Completed Print Docs"
          );
        }
      );

      // TC_SHIP_005
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

      // TC_SHIP_006
      it(
        "TC_SHIP_006 - Verify Ready to Ship and Completed totals for each category",
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

          const results = [];

          for (const category of categories) {
            console.log(
              `\n========== Checking category: ${category} ==========`
            );

            await shipPage.selectCategory(category);

            const readyToShipTotal =
              await shipPage.getSectionTotal("Ready to Ship");

            const completedTotal =
              await shipPage.getSectionTotal("Completed");

            console.log(`Ready to Ship total: ${readyToShipTotal}`);
            console.log(`Completed total: ${completedTotal}`);

            expect(readyToShipTotal)
              .to.be.a("number")
              .and.at.least(0);

            expect(completedTotal)
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
        }
      );

      // TC_SHIP_007
      it(
        "TC_SHIP_007 - Search Order IDs 263097, 263098 and Doc ID 99824",
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

          const searchBoxLocator = By.css(
            "input[ng-model='shipToCust']"
          );

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

          const results = [];

          for (const searchCase of searchCases) {
            console.log(
              `\n========== Searching ${searchCase.type}: ${searchCase.value} ==========`
            );

            await searchBox.clear();
            await searchBox.sendKeys(searchCase.value);

            await driver.wait(
              async () =>
                (await searchBox.getAttribute("value")) ===
                searchCase.value,
              10000,
              `Could not enter search value: ${searchCase.value}`
            );

            let matchingRowText = "";

            await driver.wait(
              async () => {
                const rows = await driver.findElements(
                  By.css("table tbody tr")
                );

                const rowTexts = [];

                for (const row of rows) {
                  try {
                    if (!(await row.isDisplayed())) continue;

                    const rowText = (await row.getText()).trim();

                    if (
                      rowText &&
                      !/no documents found/i.test(rowText)
                    ) {
                      rowTexts.push(rowText);
                    }
                  } catch (error) {
                    // Ignore rows redrawn during Angular updates.
                  }
                }

                matchingRowText =
                  rowTexts.find(rowText =>
                    rowText.includes(searchCase.expectedOrderId) &&
                    rowText.includes(searchCase.expectedDocId)
                  ) || "";

                console.log(
                  `Rows displayed for ${searchCase.value}:`,
                  rowTexts
                );

                return matchingRowText !== "";
              },
              30000,
              `No matching row found for ${searchCase.type} ${searchCase.value}.`
            );

            console.log("✓ Matching row found:", matchingRowText);

            expect(matchingRowText).to.include(
              searchCase.expectedOrderId
            );

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

          console.log(
            "\n========== Filter Anything Search Results =========="
          );
          console.table(results);

          expect(results).to.have.lengthOf(searchCases.length);

          console.log(
            "✓ TC_SHIP_007 passed: all three searches returned matching rows."
          );
        }
        );
      
       });