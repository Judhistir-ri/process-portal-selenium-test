const { expect } = require("chai");
const { until, By } = require("selenium-webdriver");

const getDriver = require("../../utils/driver");

const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ExpectedPage = require("../../pages/ExpectedPage");
const ExpectedDetailsPage = require("../../pages/ExpectedDetailsPage");

require("dotenv").config();



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

  it("TC_EXP_015 - Verify Send Payment Link", async function () {
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

  it("TC_EXP_006 - Verify Attachments tab opens", async function () {
    await expectedDetailsPage.clickTab("attachments");

    const text = await expectedDetailsPage.getPaneText("attachments");

    expect(text).to.include("Document Uploads");
  });

  it("TC_EXP_007 - Verify uploaded document details", async function () {
    const text = await expectedDetailsPage.verifyDocumentUploads();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_008 - Verify uploaded document download when available", async function () {
    const available =
      await expectedDetailsPage.checkDocumentUploadAvailability();

    if (available) {
      const result = await expectedDetailsPage.downloadDocumentIfAvailable();

      expect(result).to.equal(true);
    } else {
      expect(available).to.equal(false);
    }
  });
  it("TC_EXP_009 - Verify Return Shipping Label download when available", async function () {
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

  it("TC_EXP_009 - Verify Conversations tab and conversation details", async function () {
    const text = await expectedDetailsPage.verifyConversationTab();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_013 - Verify Write New Message and Send", async function () {
    const message = `Automation test message ${Date.now()}`;

    await expectedDetailsPage.clickWriteNewMessage();

    await expectedDetailsPage.enterMessage(message);

    await expectedDetailsPage.clickSend(message);

    await expectedDetailsPage.verifyLatestMessage(message);
  });

  it("TC_EXP_010 - Verify Activity Feed", async function () {
    const text = await expectedDetailsPage.verifyActivityFeed();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_027 - Verify Payment Requested Amount in Activity Feed", async function () {
    const amount =
      await expectedDetailsPage.getPaymentRequestedAmountFromActivity();

    expect(amount).to.be.greaterThan(0);
  });

  it("TC_EXP_028 - Verify Payment Link in Activity Feed", async function () {
    const paymentLink =
      await expectedDetailsPage.verifyPaymentLinkInActivityFeed();

    expect(paymentLink).to.match(/^https?:\/\/.+external-payments/i);
  });

  it("TC_EXP_011 - Verify Fee Details", async function () {
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

  it("TC_EXP_012 - Verify Fee Total Amount", async function () {
    const fees = await expectedDetailsPage.getFeeDetails();

    const validFees = fees.filter(
      (fee) =>
        fee.feeType &&
        fee.feeType.toLowerCase() !== "total" &&
        !isNaN(parseFloat(String(fee.total).replace(/[$,]/g, "").trim())),
    );

    const calculatedTotal = validFees.reduce((sum, fee) => {
      const amount = parseFloat(String(fee.total).replace(/[$,]/g, "").trim());

      return sum + amount;
    }, 0);

    const displayedTotal = await driver.executeScript(() => {
      const rows = Array.from(
        document.querySelectorAll("#orderHistory table tbody tr"),
      );

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll("td"));

        if (!cells.length) continue;

        const firstCell = cells[0].innerText.trim().toLowerCase();

        if (firstCell === "total") {
          const lastCell = cells[cells.length - 1].innerText.trim();

          const match = lastCell.match(/[\d,]+\.\d{2}/);

          if (match) {
            return parseFloat(match[0].replace(/,/g, ""));
          }
        }
      }

      return null;
    });

    expect(displayedTotal).to.not.equal(null);

    expect(calculatedTotal).to.equal(displayedTotal);
  });

  it("TC_EXP_012 - Verify Contact Details", async function () {
    const text = await expectedDetailsPage.verifyContactDetails();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

 it("TC_EXP_027 - Verify Add New button opens address form", async function () {

  await expectedDetailsPage.clickContactDetails();

  await expectedDetailsPage.clickAddNewAddress();

  const addressLine1 = await expectedDetailsPage.waitForVisible(
    expectedDetailsPage.addressLine1Input,
    30000
  );

  expect(await addressLine1.isDisplayed()).to.equal(true);

  await expectedDetailsPage.closeAddressForm();

 });
  
it("TC_EXP_035 - Verify user can add a new address", async function () {

  await expectedDetailsPage.clickContactDetails();


  // ==========================================
  // CREATE ONE SHARED ADDRESS
  // ==========================================
  const uniqueId = Date.now().toString().slice(-10);
  testAddress = {
    addressLine1:  `Automation Address ${uniqueId}`,
    addressLine2: "Test Address Line 2",
    city: "Bengaluru",
    state: "Karnataka",
    zipCode: "560001",
    country: "India"
  };

  console.log(
    "Creating address:",
    testAddress.addressLine1
  );

  // // Open Add New Address
  // await expectedDetailsPage.clickAddNewAddress();

  // // Fill address
  // await expectedDetailsPage.fillAddress(testAddress);

  // // Save address
  // await expectedDetailsPage.saveAddress();

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
    30000
  );

  // ==========================================
  // VERIFY ADDRESS EXISTS
  // ==========================================

  const result =
    await expectedDetailsPage.verifyAddressExists(
      testAddress.addressLine1
    );

  console.log(
    "Address added:",
    result
  );

  expect(result).to.equal(true);

  console.log(
    "Shared address created:",
    testAddress.addressLine1
  );
});
  
  

  it("TC_EXP_029 - Verify Close button closes Add New address form", async function () {

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

    } catch (error) {}

  }

  expect(visible).to.equal(false);

});
  
  it("TC_EXP_030 - Verify user can edit the existing address", async function () {

  await expectedDetailsPage.clickContactDetails();

  console.log(
    "\n========== TC_EXP_030 - EDIT ADDRESS =========="
  );

  // ------------------------------------------
  // Make sure shared address exists
  // ------------------------------------------
  expect(testAddress).to.not.equal(null);

  console.log(
    "Editing address:",
    testAddress.addressLine1
  );

  const originalExists =
    await expectedDetailsPage.verifyAddressExists(
      testAddress.addressLine1
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
    country: "India"
};

console.log(
    "Updating address to:",
    updatedAddress.addressLine1
);

  // ------------------------------------------
  // Edit SAME address
  // ------------------------------------------
  await expectedDetailsPage.editAddress(
    testAddress.addressLine1,
    updatedAddress
  );

  // ------------------------------------------
  // Verify updated address
  // ------------------------------------------
  const updatedExists =
    await expectedDetailsPage.verifyAddressExists(
      updatedAddress.addressLine1
    );

  console.log(
    "Updated address exists:",
    updatedExists
  );

  expect(updatedExists).to.equal(true);

  // ------------------------------------------
  // IMPORTANT
  // Use updated address for next tests
  // ------------------------------------------
  testAddress = {
    ...updatedAddress
  };

  console.log(
    "Shared address is now:",
    testAddress.addressLine1
  );
  });
  
  
it("TC_EXP_031 - Verify address can be set as Default Shipping", async function () {

  await expectedDetailsPage.clickContactDetails();

  console.log(
    "\n========== TC_EXP_031 - DEFAULT SHIPPING =========="
  );

  // ==========================================
  // MAKE SURE SAME ADDRESS EXISTS
  // ==========================================

  expect(testAddress).to.not.equal(null);

  console.log(
    "Setting Default Shipping for:",
    testAddress.addressLine1
  );

  const addressExists =
    await expectedDetailsPage.verifyAddressExists(
      testAddress.addressLine1
    );

  expect(addressExists).to.equal(true);

  // SET DEFAULT SHIPPING
  await expectedDetailsPage.setDefaultShipping(
    testAddress.addressLine1
  );
  // FIND SAME DYNAMIC ADDRESS CARD
  const card =
    await expectedDetailsPage.getAddressCard(
      testAddress.addressLine1
    );
  // FIND SHIPPING CHECKBOX INSIDE SAME CARD
  const shippingCheckbox =
    await card.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
        "contains(@ng-model,'shippingAddressId')]"
      )
    );

  // ==========================================
  // VERIFY CHECKED
  // ==========================================

  const selected =
    await shippingCheckbox.isSelected();

  console.log(
    "Default Shipping selected:",
    selected
  );

  expect(selected).to.equal(true);
});
  
  
it("TC_EXP_032 - Verify address can be set as Default Billing", async function () {

  await expectedDetailsPage.clickContactDetails();

  console.log(
    "\n========== TC_EXP_032 - DEFAULT BILLING =========="
  );

  // ==========================================
  // MAKE SURE SAME ADDRESS EXISTS
  // ==========================================

  expect(testAddress).to.not.equal(null);

  console.log(
    "Setting Default Billing for:",
    testAddress.addressLine1
  );

  const addressExists =
    await expectedDetailsPage.verifyAddressExists(
      testAddress.addressLine1
    );

  expect(addressExists).to.equal(true);

  // ==========================================
  // SET DEFAULT BILLING
  // ==========================================

  await expectedDetailsPage.setDefaultBilling(
    testAddress.addressLine1
  );

  // ==========================================
  // FIND SAME DYNAMIC ADDRESS CARD
  // ==========================================

  const card =
    await expectedDetailsPage.getAddressCard(
      testAddress.addressLine1
    );

  // ==========================================
  // FIND BILLING CHECKBOX INSIDE SAME CARD
  // ==========================================

  const billingCheckbox =
    await card.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
        "contains(@ng-model,'billingAddressId')]"
      )
    );

  // ==========================================
  // VERIFY CHECKED
  // ==========================================

  const selected =
    await billingCheckbox.isSelected();

  console.log(
    "Default Billing selected:",
    selected
  );

  expect(selected).to.equal(true);
});
  

  
  it("TC_EXP_033 - Verify user can delete the existing address", async function () {

  await expectedDetailsPage.clickContactDetails();

  console.log(
    "\n========== TC_EXP_033 - DELETE ADDRESS =========="
  );

  expect(testAddress).to.not.equal(null);

  console.log(
    "Deleting:",
    testAddress.addressLine1
  );

  // Verify it exists before deleting
  const exists =
    await expectedDetailsPage.verifyAddressExists(
      testAddress.addressLine1
    );

  expect(exists).to.equal(true);

  // Delete SAME shared address
  await expectedDetailsPage.deleteAddress(
    testAddress.addressLine1
  );

  // Verify deleted
  const deleted =
    await expectedDetailsPage.verifyAddressDeleted(
      testAddress.addressLine1
    );

  expect(deleted).to.equal(true);

  console.log(
    "DELETE TEST PASSED:",
    testAddress.addressLine1
  );

  testAddress = null;
  updatedAddress = null;
});
  
  

  it("TC_EXP_013 - Verify Other Details", async function () {
    const text = await expectedDetailsPage.verifyOtherDetails();

    expect(text).to.be.a("string");

    expect(text.length).to.be.greaterThan(0);
  });

  it("TC_EXP_014 - Verify Tracking Details", async function () {
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
