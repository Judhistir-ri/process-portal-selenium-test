const { By, until } = require("selenium-webdriver");

class ExpectedDetailsPage {
  constructor(driver) {
    this.driver = driver;

    this.tabs = {
      documentDetails: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#docDetails']",
      ),

      attachments: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#attachments']",
      ),

      conversation: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#conversation']",
      ),

      activityFeed: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#activityFeed']",
      ),

      orderHistory: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#orderHistory']",
      ),

      contactDetails: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#address']",
      ),

      otherDetails: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#otherDetails']",
      ),

      tracking: By.xpath(
        "//a[@data-toggle='tab' and @data-target='#trackingDetails']",
      ),
    };

    this.panes = {
      documentDetails: By.css("#docDetails"),
      attachments: By.css("#attachments"),
      conversation: By.css("#conversation"),
      activityFeed: By.css("#activityFeed"),
      orderHistory: By.css("#orderHistory"),
      contactDetails: By.css("#address"),
      otherDetails: By.css("#otherDetails"),
      tracking: By.css("#trackingDetails"),
    };

    this.writeNewMessageButton = By.xpath(
      "//button[normalize-space()='Write New Message'] | " +
        "//a[normalize-space()='Write New Message']",
    );

    this.printConversationButton = By.xpath(
      "//button[normalize-space()='Print Conversation'] | " +
        "//a[normalize-space()='Print Conversation']",
    );

    this.backButton = By.xpath(
      "//button[normalize-space()='Back'] | " + "//a[normalize-space()='Back']",
    );

    this.sendButton = By.xpath(
      "//button[normalize-space()='Send'] | " + "//a[normalize-space()='Send']",
    );

    this.messageEditor = By.xpath(
      "//div[contains(@class,'cke_wysiwyg_div') " +
        "and @contenteditable='true'] | " +
        "//div[@contenteditable='true' and @role='textbox']",
    );

    this.documentUploadsTable = By.xpath("//div[@id='attachments']//table");

    this.downloadDocumentButton = By.xpath(
      "//div[@id='attachments']" +
        "//i[@title='Download' " +
        "and @ng-click='downloadDocument(attachment)' " +
        "and contains(@class,'fa-download')]",
    );

    this.feeTable = By.xpath("//div[@id='orderHistory']//table");

    this.documentUploadsSection = By.xpath(
      "//div[@id='attachments']" +
        "//div[contains(normalize-space(.),'Document Uploads:')]",
    );

    this.documentUploadRows = By.xpath(
      "//div[@id='attachments']" +
        "//table//tbody//tr[@ng-repeat='attachment in doc.uploadedAttachments']",
    );

    this.documentUploadDownloadButton = By.xpath(
      "//div[@id='attachments']" +
        "//tr[@ng-repeat='attachment in doc.uploadedAttachments']" +
        "//i[@title='Download' and " +
        "contains(@class,'fa-download')]",
    );

    this.noDocumentMessage = By.xpath(
      "//div[@id='attachments']" +
        "//td[normalize-space()='No Attachments found.']",
    );

    this.returnShippingRows = By.xpath(
      "//div[@id='attachments']" +
        "//tr[@ng-repeat='shippingDetail in doc.shippingDetails']",
    );

    this.returnShippingDownloadButton = By.xpath(
      "//div[@id='attachments']" +
        "//tr[@ng-repeat='shippingDetail in doc.shippingDetails']" +
        "//i[@title='Download' and " +
        "contains(@class,'fa-download')]",
    );

    this.sendPaymentLinkButton = By.xpath(
      "//div[@id='docDetails']" +
        "//button[contains(normalize-space(.),'Send Payment Link')]",
    );

    this.totalAmountText = By.xpath(
      "//div[@id='docDetails']" +
        "//*[contains(normalize-space(.),'Total Amount')]",
    );

    this.paymentLinkPopup = By.xpath(
      "//div[contains(@class,'modal-dialog') and " +
        ".//*[contains(@class,'modal-title') and " +
        "contains(translate(normalize-space(.), " +
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', " +
        "'abcdefghijklmnopqrstuvwxyz'), 'document')]]",
    );

    this.paymentPopupDocumentId = By.xpath(
      "//div[contains(@class,'modal-dialog')]" +
        "//h4[contains(@class,'modal-title')]",
    );

    this.paymentRequestAmount = By.xpath(
      "//div[contains(@class,'modal-dialog')]" +
        "//label[contains(normalize-space(.),'Payment request amount')]" +
        "/following-sibling::input",
    );

    this.paymentSubmitButton = By.xpath(
      "//div[contains(@class,'modal-dialog')]" +
        "//button[normalize-space()='Submit']",
    );

    this.cancelPaymentButton = By.xpath(
      "//div[@id='docDetails']" +
        "//button[contains(normalize-space(.),'Cancel Payment')]",
    );

    this.paymentLinkStatusButton = By.xpath(
      "//div[@id='docDetails']" +
        "//button[" +
        "contains(normalize-space(.),'Send Payment Link') or " +
        "contains(normalize-space(.),'Cancel Payment')" +
        "]",
    );

    this.writeNewMessageButton = By.xpath(
      "//a[normalize-space()='Write New Message']",
    );

    this.printConversationButton = By.xpath(
      "//a[normalize-space()='Print Conversation']",
    );

    this.backButton = By.xpath("//button[normalize-space()='Back']");

    this.sendButton = By.xpath(
      "//a[normalize-space()='Send' and contains(@ng-click,'sendNotification')]",
    );

    this.messageEditor = By.xpath(
      "//div[contains(@class,'cke_wysiwyg_div') and @contenteditable='true' and @role='textbox']",
    );

    this.fileInput = By.id("files");

    // ==========================================
    // CONTACT DETAILS - ADDRESS LOCATORS
    // ==========================================

    this.contactDetailsTab = By.xpath(
  "//a[@data-toggle='tab' and @data-target='#address']"
    );
    

    // Contact Details pane
   this.contactDetailsPane = By.css("#address");

//     this.addressForm = By.xpath(
//   "//*[contains(@ng-show,'addNewShippingAddressContent') " +
//   "and contains(@ng-show,'editShippingAddressContent') " +
//   "and not(contains(@class,'ng-hide'))]"
    // );
    this.addressForm = By.xpath(
  "//*[@ng-show='addNewShippingAddressContent || editShippingAddressContent' " +
  "and not(contains(@class,'ng-hide'))]"
    );

    this.visibleEditAddressForm = By.xpath(
  "//*[@ng-show='editShippingAddressContent' and not(contains(@class,'ng-hide'))]"
);

this.visibleAddAddressForm = By.xpath(
  "//*[@ng-show='addNewShippingAddressContent' and not(contains(@class,'ng-hide'))]"
);
    
    

    // Add New button
  //   this.addNewAddressButton = By.xpath(
  // "//button[contains(@ng-click,'showAddNewAddress') and " +
  // "contains(normalize-space(.),'Add New') and " +
  // "not(contains(@class,'ng-hide'))]"
    // );
    this.addNewAddressButton = By.xpath(
    "//button[normalize-space(.)='Add New']"
    );
    

    // ==========================================
// ADDRESS FORM FIELDS
// ==========================================

this.addressLine1Input = By.css(
  "#address input[placeholder='Address Line 1']"
);

this.addressLine2Input = By.css(
  "#address input[placeholder='Address Line 2']"
);

this.cityInput = By.css(
  "#address input[placeholder='City']"
);

this.stateInput = By.css(
  "#address input[placeholder='State']"
);

this.zipCodeInput = By.css(
  "#address input[placeholder='Zip Code']"
);

this.countryDropdown = By.css(
  "#address select[ng-model='address.country']"
);

// ==========================================
// CLOSE BUTTON
// ==========================================

this.closeAddressButton = By.xpath(
  "//div[@id='address']//button[normalize-space()='Close' " +
  "and not(contains(@class,'ng-hide'))]"
);

// ==========================================
// ADD BUTTON
// ==========================================

this.addAddressButton = By.xpath(
  "//div[@id='address']//button[normalize-space()='Add' " +
  "and not(contains(@class,'ng-hide'))]"
);

// ==========================================
// SAVE BUTTON - EDIT MODE
// ==========================================

this.editSaveAddressButton = By.xpath(
  "//div[@id='address']//button[normalize-space()='Save' " +
  "and not(contains(@class,'ng-hide'))]"
    );
    
   
  }

  async waitForVisible(locator, timeout = 60000) {
    const element = await this.driver.wait(
      until.elementLocated(locator),
      timeout,
    );

    await this.driver.wait(until.elementIsVisible(element), timeout);

    return element;
  }

  async waitForVisibleElement(locator, timeout = 30000) {
    return await this.driver.wait(async () => {

        const elements = await this.driver.findElements(locator);

        for (const element of elements) {
            try {
                if (await element.isDisplayed()) {
                    return element;
                }
            } catch (error) {
                // Element may have disappeared/re-rendered
            }
        }

        return false;

    }, timeout);
}

  async click(locator) {
    const element = await this.waitForVisible(locator);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      element,
    );

    try {
      await element.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", element);
    }

    await this.driver.sleep(1000);
  }

  async clickTab(tabName) {
    if (!this.tabs[tabName]) {
      throw new Error(`Unknown Expected page tab: ${tabName}`);
    }

    await this.click(this.tabs[tabName]);

    if (this.panes[tabName]) {
      await this.waitForVisible(this.panes[tabName], 60000);
    }

    return true;
  }

  async getPaneText(tabName) {
    if (!this.panes[tabName]) {
      throw new Error(`Unknown Expected page tab: ${tabName}`);
    }

    const element = await this.waitForVisible(this.panes[tabName], 60000);

    return (await element.getText()).replace(/\s+/g, " ").trim();
  }

  async getCurrentPageText() {
    return String(
      await this.driver.executeScript("return document.body.innerText || '';"),
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  async verifyProcessingSteps() {
    const locator = By.xpath(
      "//ul[contains(@class,'trackerWrapper-exp')]" +
        "//li[contains(@id,'docStop')]" +
        "//div[contains(@class,'stopNames') " +
        "and not(contains(@class,'ng-hide'))]",
    );

    const elements = await this.driver.wait(
      until.elementsLocated(locator),
      60000,
    );

    const steps = [];

    for (const element of elements) {
      try {
        if (!(await element.isDisplayed())) {
          continue;
        }

        const text = (await element.getText()).replace(/\s+/g, " ").trim();

        if (text && !steps.includes(text)) {
          steps.push(text);
        }
      } catch (error) {
        continue;
      }
    }

    if (steps.length === 0) {
      throw new Error("No visible processing steps were found.");
    }

    return steps;
  }

  async verifyText(expectedText, actualText = null) {
    const expected = String(expectedText || "")
      .trim()
      .toLowerCase();

    if (!expected) {
      throw new Error("Expected text cannot be empty.");
    }

    const pageText = (
      actualText === null ? await this.getCurrentPageText() : String(actualText)
    ).toLowerCase();

    if (!pageText.includes(expected)) {
      throw new Error(
        `Expected text "${expectedText}" was not found on the page.`,
      );
    }

    return true;
  }

  async verifyDocumentUploads() {
    await this.clickTab("attachments");

    const table = await this.waitForVisible(this.documentUploadsTable, 60000);

    const text = (await table.getText()).replace(/\s+/g, " ").trim();

    if (!text) {
      throw new Error("Document Uploads table is empty.");
    }

    return text;
  }

  async downloadDocumentIfAvailable() {
    await this.clickTab("attachments");

    const buttons = await this.driver.findElements(
      this.documentUploadDownloadButton,
    );

    for (const button of buttons) {
      if (await button.isDisplayed()) {
        await this.driver.executeScript(
          "arguments[0].scrollIntoView({block:'center'});",
          button,
        );

        try {
          await button.click();
        } catch (error) {
          await this.driver.executeScript("arguments[0].click();", button);
        }

        await this.driver.sleep(3000);

        return true;
      }
    }

    return false;
  }

  async downloadReturnShippingLabelIfAvailable() {
    await this.clickTab("attachments");

    const returnLabelDownload = By.xpath(
      "//div[@id='attachments']" +
        "//div[contains(@class,'custom-scroll')]" +
        "//table" +
        "//tr[.//td[contains(normalize-space(.),'Return Shipping Label')]]" +
        "//i[@title='Download' and " +
        "contains(@ng-click,'downloadReturnShippingLabel') and " +
        "contains(@class,'fa-download')]",
    );

    const button = await this.driver.wait(
      until.elementLocated(returnLabelDownload),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(button), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.sleep(500);

    try {
      await button.click();
    } catch (error) {
      await this.driver.executeScript(
        `
            arguments[0].dispatchEvent(
                new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            );
            `,
        button,
      );
    }

    await this.driver.sleep(5000);

    return true;
  }

  async checkDocumentUploadAvailability() {
    await this.clickTab("attachments");

    const buttons = await this.driver.findElements(
      this.documentUploadDownloadButton,
    );

    for (const button of buttons) {
      if (await button.isDisplayed()) {
        return true;
      }
    }

    return false;
  }

  // async checkReturnShippingLabelAvailability() {

  // await this.clickTab("attachments");

  // const buttons =
  //     await this.driver.findElements(
  //         this.returnShippingDownloadButton
  //     );

  // for (const button of buttons) {
  //     if (await button.isDisplayed()) {
  //         return true;
  //     }
  // }

  // return false;
  // }

  async checkReturnShippingLabelAvailability() {
    await this.clickTab("attachments");

    const returnLabelDownload = By.xpath(
      "//div[@id='attachments']" +
        "//div[contains(@class,'custom-scroll')]" +
        "//table" +
        "//tr[.//td[contains(normalize-space(.),'Return Shipping Label')]]" +
        "//i[@title='Download' and " +
        "contains(@ng-click,'downloadReturnShippingLabel') and " +
        "contains(@class,'fa-download')]",
    );

    const buttons = await this.driver.findElements(returnLabelDownload);

    for (const button of buttons) {
      try {
        if (await button.isDisplayed()) {
          return true;
        }
      } catch (error) {}
    }

    return false;
  }

  async verifyConversationTab() {
    await this.clickTab("conversation");

    const text = await this.getPaneText("conversation");

    if (!text) {
      throw new Error("Conversation tab is empty.");
    }

    return text;
  }

  async getConversationText() {
    await this.clickTab("conversation");

    return await this.getPaneText("conversation");
  }

  async clickWriteNewMessage() {
    await this.clickTab("conversation");

    await this.click(this.writeNewMessageButton);

    await this.driver.wait(until.elementLocated(this.messageEditor), 60000);

    await this.driver.wait(
      until.elementIsVisible(await this.driver.findElement(this.messageEditor)),
      30000,
    );

    return true;
  }

  //   async clickWriteNewMessage() {
  //     await this.clickTab("conversation");

  //     await this.click(this.writeNewMessageButton);

  //     await this.driver.wait(until.elementLocated(this.messageEditor), 60000);

  //     return true;
  //   }

  async enterMessage(message = "This is an automation test message.") {
    await this.clickTab("conversation");

    const editor = await this.waitForVisible(this.messageEditor, 60000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      editor,
    );

    await editor.click();

    await this.driver.executeScript(
      `
        const editor = arguments[0];

        editor.focus();

        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    `,
      editor,
    );

    await editor.sendKeys(" " + String(message));

    await this.driver.sleep(1000);

    const editorText = await editor.getText();

    if (!editorText.includes(String(message))) {
      throw new Error("Message was not entered into the message editor.");
    }

    return true;
  }

  async uploadMessageFile(filePath) {
    if (!filePath) {
      return false;
    }

    const fileInput = await this.waitForVisible(this.fileInput, 30000);

    await fileInput.sendKeys(filePath);

    await this.driver.sleep(2000);

    return true;
  }

  async clickSend(message) {
    const sendButton = await this.driver.wait(
      until.elementLocated(this.sendButton),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(sendButton), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      sendButton,
    );

    try {
      await sendButton.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", sendButton);
    }

    if (message) {
      await this.waitForMessageToAppear(message);
    } else {
      await this.driver.sleep(5000);
    }

    return true;
  }

  async waitForMessageToAppear(message, timeout = 60000) {
    await this.driver.wait(async () => {
      try {
        const conversation = await this.driver.findElement(
          By.id("conversation"),
        );

        const text = (await conversation.getText()).replace(/\s+/g, " ").trim();

        return text.includes(String(message));
      } catch (error) {
        return false;
      }
    }, timeout);

    await this.driver.sleep(3000);

    return true;
  }

  async verifyLatestConversationMessage(message) {
    await this.clickTab("conversation");

    const conversation = await this.driver.wait(
      until.elementLocated(By.css("#conversation")),
      60000,
    );

    const messages = await conversation.findElements(
      By.xpath(".//div[contains(@class,'panel') or contains(@class,'row')]"),
    );

    const conversationText = await conversation.getText();

    if (!conversationText.includes(String(message))) {
      throw new Error(
        `Message "${message}" was not found in the conversation.`,
      );
    }

    return true;
  }

  async verifyLatestMessage(message) {
    await this.clickTab("conversation");

    await this.waitForMessageToAppear(message, 60000);

    const conversation = await this.driver.findElement(By.id("conversation"));

    const text = await conversation.getText();

    if (!text.includes(String(message))) {
      throw new Error(
        `Message "${message}" was not found in the conversation.`,
      );
    }

    return true;
  }

  async sendMessage(message = "Automation test message") {
    await this.enterMessage(message);

    await this.clickSend(message);

    return true;
  }

  async clickBack() {
    await this.click(this.backButton);

    await this.driver.sleep(2000);

    return true;
  }

  async printConversation() {
    await this.clickTab("conversation");

    const beforeHandles = await this.driver.getAllWindowHandles();

    await this.click(this.printConversationButton);

    await this.driver.wait(async () => {
      const handles = await this.driver.getAllWindowHandles();

      return handles.length > beforeHandles.length;
    }, 60000);

    return true;
  }

  async clickPrintConversation() {
    return await this.printConversation();
  }

  async verifyActivityFeed() {
    await this.clickTab("activityFeed");

    const text = await this.getPaneText("activityFeed");

    if (!text) {
      throw new Error("Activity Feed is empty.");
    }

    return text;
  }

  async getActivityFeedText() {
    await this.clickTab("activityFeed");

    const activityFeed = await this.waitForVisible(
      this.panes.activityFeed,
      60000,
    );

    return (await activityFeed.getText()).replace(/\s+/g, " ").trim();
  }

  async getPaymentRequestedAmountFromActivity() {
    await this.clickTab("activityFeed");

    const activityFeed = await this.waitForVisible(
      this.panes.activityFeed,
      60000,
    );

    const text = (await activityFeed.getText()).replace(/\s+/g, " ").trim();

    const match = text.match(
      /Payment requested\s*:\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    );

    if (!match) {
      throw new Error(
        "Payment requested amount was not found in Activity Feed.",
      );
    }

    const amount = parseFloat(match[1]);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid Payment requested amount found: "${match[1]}"`);
    }

    return amount;
  }

  async verifyPaymentLinkInActivityFeed() {
    await this.clickTab("activityFeed");

    const activityFeed = await this.waitForVisible(
      this.panes.activityFeed,
      60000,
    );

    const text = (await activityFeed.getText()).replace(/\s+/g, " ").trim();

    const paymentLinkMatch = text.match(/https?:\/\/[^\s]+/i);

    if (!paymentLinkMatch) {
      throw new Error("Payment link was not found in Activity Feed.");
    }

    const paymentLink = paymentLinkMatch[0];

    if (!/external-payments/i.test(paymentLink)) {
      throw new Error(
        `A URL was found, but it does not appear to be a payment link: "${paymentLink}"`,
      );
    }

    return paymentLink;
  }

  async getMessagesFromActivityFeed() {
    await this.clickTab("activityFeed");

    const notificationMessages = By.xpath(
      "//div[@id='activityFeed']" +
        "//div[contains(@class,'panel-body')]" +
        "//span[contains(@class,'ng-binding') and normalize-space()]",
    );

    const elements = await this.driver.findElements(notificationMessages);

    const messages = [];

    for (const element of elements) {
      try {
        if (!(await element.isDisplayed())) {
          continue;
        }

        const text = (await element.getText()).replace(/\s+/g, " ").trim();

        if (text) {
          messages.push(text);
        }
      } catch (error) {
        continue;
      }
    }

    return messages;
  }

  async verifyMessageInActivityFeed(message) {
    await this.clickTab("activityFeed");

    await this.driver.wait(async () => {
      try {
        const activityFeed = await this.driver.findElement(
          this.panes.activityFeed,
        );

        const text = (await activityFeed.getText()).replace(/\s+/g, " ").trim();

        return text.includes(String(message));
      } catch (error) {
        return false;
      }
    }, 60000);

    await this.driver.sleep(2000);

    return true;
  }

  async verifyPaymentAmountInActivityFeed(expectedAmount) {
    const actualAmount = await this.getPaymentRequestedAmountFromActivity();

    if (Number(actualAmount) !== Number(expectedAmount)) {
      throw new Error(
        `Payment requested amount mismatch. Expected: ${expectedAmount}, Actual: ${actualAmount}`,
      );
    }

    return true;
  }

  async getFeeDetails() {
    await this.clickTab("orderHistory");

    const table = await this.waitForVisible(this.feeTable, 60000);

    const rows = await table.findElements(By.css("tbody tr"));

    const fees = [];

    for (const row of rows) {
      try {
        if (!(await row.isDisplayed())) {
          continue;
        }

        const cells = await row.findElements(By.css("td"));

        const values = [];

        for (const cell of cells) {
          const text = (await cell.getText()).replace(/\s+/g, " ").trim();

          values.push(text);
        }

        if (values.length >= 4) {
          fees.push({
            feeType: values[0],
            quantity: values[1],
            unitPrice: values[2],
            total: values[3],
          });
        }
      } catch (error) {}
    }

    if (!fees.length) {
      throw new Error("No fee details were found in Order History.");
    }

    return fees;
  }

  async verifyContactDetails() {
    await this.clickTab("contactDetails");

    const text = await this.getPaneText("contactDetails");

    if (!text) {
      throw new Error("Contact Details is empty.");
    }

    return text;
  }

  async verifyAddressDetails() {
    return await this.verifyContactDetails();
  }

  async verifyOtherDetails() {
    await this.clickTab("otherDetails");

    const text = await this.getPaneText("otherDetails");

    if (!text) {
      throw new Error("Other Details is empty.");
    }

    return text;
  }

  async verifyTrackingDetails() {
    await this.clickTab("tracking");

    const text = await this.getPaneText("tracking");

    if (!text) {
      throw new Error("Tracking Details is empty.");
    }

    return text;
  }

  async scrollToPaymentSection() {
    const button = await this.waitForVisible(this.sendPaymentLinkButton, 60000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.sleep(1000);
  }

  async getDocumentId() {
    const text = await this.getCurrentPageText();

    const match = text.match(/Doc#:\s*(\d+)/i);

    if (!match) {
      throw new Error("Document ID was not found on the page.");
    }

    return match[1];
  }

  async getPaymentAmount() {
    const text = await this.getCurrentPageText();

    const match = text.match(/Total Amount\s*:\s*USD\s*([\d,.]+)/i);

    if (!match) {
      throw new Error("Payment amount was not found on the page.");
    }

    return parseFloat(match[1].replace(/,/g, ""));
  }

  async checkPaymentLinkStatus() {
    await this.clickTab("documentDetails");

    const button = await this.driver.wait(
      until.elementLocated(this.paymentLinkStatusButton),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(button), 30000);

    const text = (await button.getText()).trim();

    if (/cancel payment/i.test(text)) {
      return "Cancel Payment";
    }

    if (/send payment link/i.test(text)) {
      return "Send Payment Link";
    }

    throw new Error(`Unexpected payment button text: "${text}"`);
  }

  //   async clickSendPaymentLink() {

  //     await this.clickTab("documentDetails");

  //     const button =
  //         await this.waitForVisible(
  //             this.sendPaymentLinkButton,
  //             60000
  //         );

  //     await this.driver.executeScript(
  //         "arguments[0].scrollIntoView({block:'center'});",
  //         button
  //     );

  //     await this.driver.sleep(500);

  //     try {
  //         await button.click();
  //     } catch (error) {
  //         await this.driver.executeScript(
  //             "arguments[0].click();",
  //             button
  //         );
  //     }

  //     await this.driver.wait(
  //         until.elementLocated(
  //             this.paymentLinkPopup
  //         ),
  //         60000
  //     );
  //     }

  async clickSendPaymentLink() {
    await this.clickTab("documentDetails");

    const status = await this.checkPaymentLinkStatus();

    if (status === "Cancel Payment") {
      return false;
    }

    const button = await this.waitForVisible(this.sendPaymentLinkButton, 60000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.sleep(500);

    try {
      await button.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", button);
    }

    await this.driver.wait(until.elementLocated(this.paymentLinkPopup), 60000);

    return true;
  }

  async verifyPaymentLinkPopup() {
    const popup = await this.waitForVisible(this.paymentLinkPopup, 60000);

    const text = await popup.getText();

    if (!text.includes("Payment request amount")) {
      throw new Error("Payment request amount is not displayed in the popup.");
    }

    return true;
  }

  async getPaymentPopupDocumentId() {
    const popup = await this.waitForVisible(this.paymentLinkPopup, 60000);

    const text = await popup.getText();

    const match = text.match(/Document\s*\((\d+)\)/i);

    if (!match) {
      throw new Error("Document ID was not found in payment popup.");
    }

    return match[1];
  }

  async getPaymentPopupAmount() {
    const popup = await this.driver.wait(
      until.elementLocated(this.paymentLinkPopup),
      60000,
    );

    const amountInput = await popup.findElement(
      By.xpath(
        ".//label[contains(normalize-space(.),'Payment request amount')]" +
          "/ancestor::div[contains(@class,'row')][1]" +
          "//input[@ng-model='paymentRequest.paymentAmount']",
      ),
    );

    const value = await amountInput.getAttribute("value");

    return parseFloat(String(value).replace(/[$,]/g, "").trim());
  }

  async submitPaymentLink() {
    const button = await this.waitForVisible(this.paymentSubmitButton, 60000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    try {
      await button.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", button);
    }

    await this.driver.sleep(2000);
  }

  async getPaymentLinkButtonText() {
    const button = await this.driver.wait(
      until.elementLocated(this.cancelPaymentButton),
      60000,
    );

    return (await button.getText()).trim();
  }

  // ==========================================
  // CONTACT DETAILS
  // ==========================================
  async clickContactDetails() {
    const tab = await this.waitForVisible(this.contactDetailsTab, 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      tab,
    );

    try {
      await tab.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", tab);
    }

    await this.driver.sleep(1500);

    await this.waitForVisible(this.contactDetailsPane, 30000);

    return true;
  }

  // ==========================================
  // CLICK ADD NEW ADDRESS
  // ==========================================
  // async clickAddNewAddress() {
  // const button = await this.waitForVisible(
  //   this.addNewAddressButton,
  //   30000
  // );

  // await this.driver.executeScript(
  //   "arguments[0].scrollIntoView({block:'center'});",
  //   button
  // );

  // try {
  //   await button.click();
  // } catch (error) {
  //   await this.driver.executeScript(
  //     "arguments[0].click();",
  //     button
  //   );
  // }

  // // Wait for Address Line 1 to appear
  // await this.waitForVisible(
  //   this.addressLine1Input,
  //   30000
  // );

  // return true;
  // }

  async clickAddNewAddress() {

    console.log("Looking for Add New button...");

    const buttons = await this.driver.findElements(
        By.xpath("//button")
    );

    console.log(
        `Total buttons found: ${buttons.length}`
    );

    for (let i = 0; i < buttons.length; i++) {

        try {

            if (await buttons[i].isDisplayed()) {

                const text =
                    (await buttons[i].getText())
                        .replace(/\s+/g, " ")
                        .trim();

                if (text.toLowerCase().includes("add")) {

                    console.log(
                        `BUTTON ${i}: "${text}"`
                    );
                }
            }

        } catch (error) {}
    }

    const button = await this.waitForVisible(
        this.addNewAddressButton,
        30000
    );

    console.log(
        "Add New button FOUND"
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        button
    );

    try {

        await button.click();

    } catch (error) {

        console.log(
            "Normal click failed, using JS click"
        );

        await this.driver.executeScript(
            "arguments[0].click();",
            button
        );
    }

    console.log(
        "Add New button CLICKED"
    );

    await this.waitForVisible(
        this.addressLine1Input,
        30000
    );

    console.log(
        "Address form OPENED"
    );

    return true;
  }
  
  

 // ==========================================
// GET DYNAMIC ADDRESS CARD BY UNIQUE ADDRESS
// ==========================================
async getAddressCard(addressText) {
  const address = String(addressText).trim();

  return await this.driver.wait(
    async () => {
      try {
        const cards = await this.driver.findElements(
          By.xpath(
            "//div[@ng-repeat='address in customerAddresses track by $index']"
          )
        );

        for (const card of cards) {
          try {
            if (!(await card.isDisplayed())) {
              continue;
            }

            const text = (await card.getText())
              .replace(/\s+/g, " ")
              .trim();

            if (text.includes(address)) {
              return card;
            }
          } catch (error) {
            // Angular may re-render the card
          }
        }

        return false;
      } catch (error) {
        return false;
      }
    },
    30000
  );
  }
  
  // ==========================================
// WAIT FOR ADDRESS TO APPEAR
// ==========================================
async waitForAddressToAppear(addressText, timeout = 30000) {
  const address = String(addressText).trim();

  await this.driver.wait(
    async () => {
      try {
        const cards = await this.driver.findElements(
          By.xpath(
            "//div[@ng-repeat='address in customerAddresses track by $index']"
          )
        );

        for (const card of cards) {
          try {
            const text = (await card.getText())
              .replace(/\s+/g, " ")
              .trim();

            if (text.includes(address)) {
              return true;
            }
          } catch (error) {}
        }

        return false;
      } catch (error) {
        return false;
      }
    },
    timeout
  );

  return true;
  }
  

  // ==========================================
  // FILL ADDRESS FORM
  // ==========================================


//   async fillAddress({
//   addressLine1,
//   addressLine2,
//   city,
//   state,
//   zipCode,
//   country,
// }) {
//   const address1 = await this.waitForVisible(
//     this.addressLine1Input,
//     30000
//   );

//   await address1.clear();
//   await address1.sendKeys(addressLine1);

//   const address2 = await this.waitForVisible(
//     this.addressLine2Input,
//     30000
//   );

//   await address2.clear();
//   await address2.sendKeys(addressLine2);

//   const cityElement = await this.waitForVisible(
//     this.cityInput,
//     30000
//   );

//   await cityElement.clear();
//   await cityElement.sendKeys(city);

//   const stateElement = await this.waitForVisible(
//     this.stateInput,
//     30000
//   );

//   await stateElement.clear();
//   await stateElement.sendKeys(state);

//   const zipElement = await this.waitForVisible(
//     this.zipCodeInput,
//     30000
//   );

//   await zipElement.clear();
//   await zipElement.sendKeys(zipCode);

//   // Country dropdown
//   const countryElement = await this.waitForVisible(
//     this.countryDropdown,
//     30000
//   );

//   const options = await countryElement.findElements(
//     By.css("option")
//   );

//   let selected = false;

//   for (const option of options) {
//     const text = (await option.getText()).trim();

//     if (
//       text.toLowerCase() ===
//       String(country).toLowerCase()
//     ) {
//       await option.click();
//       selected = true;
//       break;
//     }
//   }

//   if (!selected) {
//     throw new Error(
//       `Country "${country}" was not found in country dropdown.`
//     );
//   }

//   return true;
  //     }
  
  async fillAddress({
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
}) {

    console.log("========== FILL ADDRESS START ==========");

    console.log("1. Looking for Address Line 1...");

    const address1 = await this.waitForVisibleElement(
        this.addressLine1Input,
        30000
    );

    console.log("1. Address Line 1 FOUND");

    await address1.clear();
    await address1.sendKeys(String(addressLine1));

    console.log("1. Address Line 1 FILLED");


    console.log("2. Looking for Address Line 2...");

    const address2 = await this.waitForVisibleElement(
        this.addressLine2Input,
        30000
    );

    console.log("2. Address Line 2 FOUND");

    await address2.clear();
    await address2.sendKeys(String(addressLine2));

    console.log("2. Address Line 2 FILLED");


    console.log("3. Looking for City...");

    const cityElement = await this.waitForVisibleElement(
        this.cityInput,
        30000
    );

    console.log("3. City FOUND");

    await cityElement.clear();
    await cityElement.sendKeys(String(city));

    console.log("3. City FILLED");


    console.log("4. Looking for State...");

    const stateElement = await this.waitForVisibleElement(
        this.stateInput,
        30000
    );

    console.log("4. State FOUND");

    await stateElement.clear();
    await stateElement.sendKeys(String(state));

    console.log("4. State FILLED");


    console.log("5. Looking for Zip Code...");

    const zipElement = await this.waitForVisibleElement(
        this.zipCodeInput,
        30000
    );

    console.log("5. Zip Code FOUND");

    await zipElement.clear();
    await zipElement.sendKeys(String(zipCode));

    console.log("5. Zip Code FILLED");


    console.log("6. Looking for Country dropdown...");

    const countryElement = await this.waitForVisibleElement(
        this.countryDropdown,
        30000
    );

    console.log("6. Country dropdown FOUND");

    const options = await countryElement.findElements(
        By.css("option")
    );

    console.log(
        `Country options found: ${options.length}`
    );

    let selected = false;

    for (const option of options) {

        const text = (await option.getText()).trim();

        if (
            text.toLowerCase() ===
            String(country).trim().toLowerCase()
        ) {

            await option.click();

            selected = true;

            console.log(
                `6. Country selected: ${text}`
            );

            break;
        }
    }

    if (!selected) {
        throw new Error(
            `Country "${country}" was not found`
        );
    }

    console.log("========== FILL ADDRESS COMPLETE ==========");

    return true;
  }
  
  

  // ==========================================
  // SAVE / ADD ADDRESS
  // ==========================================
async saveAddress() {

  // ==========================================
  // ADD NEW ADDRESS
  // ==========================================

  const addButtons = await this.driver.findElements(
    this.addAddressButton
  );

  for (const button of addButtons) {

    try {
      if (!(await button.isDisplayed())) {
        continue;
      }

      await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        button
      );

      try {
        await button.click();
      } catch (error) {
        await this.driver.executeScript(
          "arguments[0].click();",
          button
        );
      }

      // Wait until form closes
      await this.driver.wait(
        async () => {
          const fields = await this.driver.findElements(
            this.addressLine1Input
          );

          for (const field of fields) {
            try {
              if (await field.isDisplayed()) {
                return false;
              }
            } catch (error) {}
          }

          return true;
        },
        30000
      );

      return true;

    } catch (error) {
      console.log("Add button handling error:", error.message);
    }
  }


  // ==========================================
  // EDIT EXISTING ADDRESS - SAVE
  // ==========================================

  const saveButtons = await this.driver.findElements(
    this.editSaveAddressButton
  );

  for (const button of saveButtons) {

    try {
      if (!(await button.isDisplayed())) {
        continue;
      }

      await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        button
      );

      try {
        await button.click();
      } catch (error) {
        await this.driver.executeScript(
          "arguments[0].click();",
          button
        );
      }

      // Wait until edit form closes
      await this.driver.wait(
        async () => {
          const fields = await this.driver.findElements(
            this.addressLine1Input
          );

          for (const field of fields) {
            try {
              if (await field.isDisplayed()) {
                return false;
              }
            } catch (error) {}
          }

          return true;
        },
        30000
      );

      return true;

    } catch (error) {
      console.log("Save button handling error:", error.message);
    }
  }

  throw new Error(
    "Neither Add nor Save button is visible."
  );
  }
  
  

  // ==========================================
  // CLOSE ADDRESS FORM
  // ==========================================

  async closeAddressForm() {
  const closeButton = await this.waitForVisible(
    this.closeAddressButton,
    30000
  );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    closeButton
  );

  try {
    await closeButton.click();
  } catch (error) {
    await this.driver.executeScript(
      "arguments[0].click();",
      closeButton
    );
  }

  // Wait until Address Line 1 is no longer visible
  await this.driver.wait(
    async () => {
      const fields = await this.driver.findElements(
        this.addressLine1Input
      );

      for (const field of fields) {
        try {
          if (await field.isDisplayed()) {
            return false;
          }
        } catch (error) {}
      }

      return true;
    },
    30000
  );

  return true;
  }
  
  // async getAddressCard(addressText) {

  // const locator = By.xpath(
  //   "//div[contains(@class,'row')]" +
  //   "[.//i[contains(@class,'fa-pencil')]]" +
  //   "[.//i[contains(@class,'fa-times')]]" +
  //   "[.//*[contains(normalize-space(.), " +
  //   JSON.stringify(addressText) +
  //   ")]]"
  // );

  // return await this.driver.wait(
  //   async () => {

  //     const elements = await this.driver.findElements(
  //       locator
  //     );

  //     for (const element of elements) {

  //       try {

  //         if (await element.isDisplayed()) {
  //           return element;
  //         }

  //       } catch (error) {}
  //     }

  //     return false;

  //   },
  //   30000
  // );
  //   }
  
  
// ==========================================
// EDIT ADDRESS
// ==========================================

  async getAddressCard(addressText) {

  const expected =
    String(addressText || "")
      .trim();

  if (!expected) {
    throw new Error(
      "Address text cannot be empty."
    );
  }

  console.log(
    `Searching dynamic address card for: ${expected}`
  );

  const locator = By.xpath(
    "//div[contains(@class,'row') " +
    "and contains(@style,'border:1px solid')" +
    " and .//i[contains(@class,'fa-pencil')]" +
    " and .//i[contains(@class,'fa-times')]" +
    " and .//*[contains(normalize-space(.), " +
    JSON.stringify(expected) +
    ")] ]"
  );

  return await this.driver.wait(
    async () => {

      const cards =
        await this.driver.findElements(
          locator
        );

      console.log(
        `Address cards matching locator: ${cards.length}`
      );

      for (const card of cards) {

        try {

          if (!(await card.isDisplayed())) {
            continue;
          }

          const text =
            (await card.getText())
              .replace(/\s+/g, " ")
              .trim();

          console.log(
            `Checking card: ${text}`
          );

          if (text.includes(expected)) {

            console.log(
              `MATCH FOUND: ${expected}`
            );

            return card;
          }

        } catch (error) {}
      }

      return false;

    },
    30000
  );
  }
  
  //Edit address
  async editAddress(existingAddress, updatedAddress) {

  console.log(
    `\n========== EDIT ADDRESS ==========`
  );

  console.log(
    `Looking for address: ${existingAddress}`
  );

  // ------------------------------------------
  // STEP 1: Find exact dynamic address card
  // ------------------------------------------
  const addressCard = await this.getAddressCard(
    existingAddress
  );

  console.log("Address card FOUND");

  // ------------------------------------------
  // STEP 2: Find pencil inside SAME card
  // ------------------------------------------
  const editButton = await addressCard.findElement(
    By.xpath(
      ".//i[contains(@class,'fa-pencil')]"
    )
  );

  console.log("Edit pencil FOUND");

  // ------------------------------------------
  // STEP 3: Scroll pencil into view
  // ------------------------------------------
  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    editButton
  );

  await this.driver.sleep(500);

  // ------------------------------------------
  // STEP 4: Click pencil
  // ------------------------------------------
  try {

    await editButton.click();

  } catch (error) {

    console.log(
      "Normal click failed. Using JavaScript click."
    );

    await this.driver.executeScript(
      "arguments[0].click();",
      editButton
    );
  }

  console.log(
    "Edit pencil CLICKED"
  );

  // ------------------------------------------
  // STEP 5: Wait for Angular edit form
  // ------------------------------------------
  console.log(
    "Waiting for EDIT address form..."
  );

  await this.driver.wait(
    async () => {

      try {

        const forms =
          await this.driver.findElements(
            this.visibleEditAddressForm
          );

        for (const form of forms) {

          if (await form.isDisplayed()) {

            console.log(
              "EDIT address form is visible"
            );

            return true;
          }
        }

      } catch (error) {}

      return false;

    },
    30000
  );

  // ------------------------------------------
  // STEP 6: Find visible Address Line 1
  // ------------------------------------------
  const address1 =
    await this.waitForVisible(
      this.addressLine1Input,
      30000
    );

  console.log(
    "Address Line 1 visible in EDIT form"
  );

  // ------------------------------------------
  // STEP 7: Fill updated address
  // ------------------------------------------
  await this.fillAddress(
    updatedAddress
  );

  console.log(
    "Updated address fields filled"
  );

  // ------------------------------------------
  // STEP 8: Save edited address
  // ------------------------------------------
  await this.saveAddress();

  console.log(
    "Edited address SAVED"
  );

  // ------------------------------------------
  // STEP 9: Wait for updated address
  // ------------------------------------------
  await this.driver.sleep(2000);

  console.log(
    `Waiting for updated address: ${updatedAddress.addressLine1}`
  );

  await this.getAddressCard(
    updatedAddress.addressLine1
  );

  console.log(
    `Address updated successfully: ${updatedAddress.addressLine1}`
  );

  return true;
  }
  
  
  
// ==========================================
// DELETE ADDRESS
// ==========================================
// async deleteAddress(addressText) {

//   console.log(
//     `Deleting address: ${addressText}`
//   );

//   const addressCard =
//     await this.getAddressCard(addressText);

//   const deleteButton =
//     await addressCard.findElement(
//       By.xpath(
//         ".//i[contains(@class,'fa-times')]"
//       )
//     );

//   await this.driver.executeScript(
//     "arguments[0].scrollIntoView({block:'center'});",
//     deleteButton
//   );

//   try {
//     await deleteButton.click();
//   } catch (error) {
//     await this.driver.executeScript(
//       "arguments[0].click();",
//       deleteButton
//     );
//   }

//   await this.driver.sleep(1000);

//   // Handle browser confirmation if present
//   try {

//     const alert =
//       await this.driver.switchTo().alert();

//     console.log(
//       "Delete confirmation found"
//     );

//     await alert.accept();

//     await this.driver.sleep(1000);

//   } catch (error) {
//     // No browser alert
//   }

//   // Wait until exact address disappears
//   await this.driver.wait(
//     async () => {

//       try {

//         const cards =
//           await this.driver.findElements(
//             By.xpath(
//               "//div[@ng-repeat='address in customerAddresses track by $index']"
//             )
//           );

//         for (const card of cards) {

//           try {

//             const text =
//               (await card.getText())
//                 .replace(/\s+/g, " ")
//                 .trim();

//             if (
//               await card.isDisplayed() &&
//               text.includes(addressText)
//             ) {
//               return false;
//             }

//           } catch (error) {}
//         }

//         return true;

//       } catch (error) {
//         return false;
//       }

//     },
//     30000
//   );

//   console.log(
//     `Address deleted successfully: ${addressText}`
//   );

//   return true;
  //   }
  
  // ==========================================
// DELETE ADDRESS
// ==========================================
async deleteAddress(addressText) {

  console.log(
    `\n========== DELETE ADDRESS ==========`
  );

  console.log(
    `Looking for address to delete: ${addressText}`
  );

  // ------------------------------------------
  // STEP 1: Find exact address card
  // ------------------------------------------
  const addressCard =
    await this.getAddressCard(
      addressText
    );

  console.log(
    "Address card FOUND"
  );

  // ------------------------------------------
  // STEP 2: Find delete X inside same card
  // ------------------------------------------
  const deleteButton =
    await addressCard.findElement(
      By.xpath(
        ".//i[contains(@class,'fa-times')]"
      )
    );

  console.log(
    "Delete button FOUND"
  );

  // ------------------------------------------
  // STEP 3: Scroll into view
  // ------------------------------------------
  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    deleteButton
  );

  await this.driver.sleep(500);

  // ------------------------------------------
  // STEP 4: Click delete
  // ------------------------------------------
  try {

    await deleteButton.click();

  } catch (error) {

    console.log(
      "Normal delete click failed. Using JS click."
    );

    await this.driver.executeScript(
      "arguments[0].click();",
      deleteButton
    );
  }

  console.log(
    "Delete button CLICKED"
  );

  // ------------------------------------------
  // STEP 5: Handle browser alert if present
  // ------------------------------------------
  await this.driver.sleep(1000);

  try {

    const alert =
      await this.driver.switchTo().alert();

    console.log(
      "Delete confirmation alert FOUND"
    );

    await alert.accept();

    console.log(
      "Delete confirmation ACCEPTED"
    );

  } catch (error) {

    console.log(
      "No browser confirmation alert"
    );
  }

  // ------------------------------------------
  // STEP 6: Wait for address to disappear
  // ------------------------------------------
  console.log(
    `Waiting for address to disappear: ${addressText}`
  );

  await this.driver.wait(
    async () => {

      try {

        const cards =
          await this.driver.findElements(
            By.xpath(
              "//div[contains(@class,'row') " +
              "and contains(@style,'border:1px solid')" +
              " and .//i[contains(@class,'fa-pencil')]" +
              " and .//i[contains(@class,'fa-times')]"
            )
          );

        for (const card of cards) {

          try {

            if (!(await card.isDisplayed())) {
              continue;
            }

            const text =
              (await card.getText())
                .replace(/\s+/g, " ")
                .trim();

            if (text.includes(addressText)) {

              return false;
            }

          } catch (error) {}
        }

        return true;

      } catch (error) {

        return true;
      }

    },
    30000
  );

  console.log(
    `Address deleted successfully: ${addressText}`
  );

  return true;
  }
  
  
  
  
// ==========================================
// SET DEFAULT SHIPPING
// ==========================================
async setDefaultShipping(addressText) {

  console.log(
    `Setting Default Shipping: ${addressText}`
  );

  let addressCard =
    await this.getAddressCard(addressText);

  const checkbox =
    await addressCard.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
        "contains(@ng-model,'shippingAddressId')]"
      )
    );

  // Find label belonging to this checkbox
  const label =
    await checkbox.findElement(
      By.xpath("./following-sibling::label")
    ).catch(async () => {
      return await addressCard.findElement(
        By.xpath(
          ".//label[.//span[contains(normalize-space(.),'Default Shipping')]]"
        )
      );
    });

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    label
  );

  // Check current state
  let selected =
    await checkbox.isSelected();

  console.log(
    `Shipping checkbox before click: ${selected}`
  );

  if (!selected) {

    try {
      await label.click();
    } catch (error) {
      await this.driver.executeScript(
        "arguments[0].click();",
        label
      );
    }
  }

  // Angular can re-render the card.
  // Therefore DON'T reuse old WebElement.
  await this.driver.wait(
    async () => {

      try {

        addressCard =
          await this.getAddressCard(addressText);

        const newCheckbox =
          await addressCard.findElement(
            By.xpath(
              ".//input[@type='checkbox' and " +
              "contains(@ng-model,'shippingAddressId')]"
            )
          );

        return await newCheckbox.isSelected();

      } catch (error) {
        return false;
      }

    },
    30000
  );

  console.log(
    `Default Shipping selected: ${addressText}`
  );

  return true;
  }
  
  
// ==========================================
// SET DEFAULT BILLING
// ==========================================
async setDefaultBilling(addressText) {

  console.log(
    `Setting Default Billing: ${addressText}`
  );

  let addressCard =
    await this.getAddressCard(addressText);

  const checkbox =
    await addressCard.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
        "contains(@ng-model,'billingAddressId')]"
      )
    );

  const label =
    await addressCard.findElement(
      By.xpath(
        ".//label[.//span[contains(normalize-space(.),'Default Billing')]]"
      )
    );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    label
  );

  let selected =
    await checkbox.isSelected();

  console.log(
    `Billing checkbox before click: ${selected}`
  );

  if (!selected) {

    try {
      await label.click();
    } catch (error) {
      await this.driver.executeScript(
        "arguments[0].click();",
        label
      );
    }
  }

  // Angular re-renders after checkbox change.
  await this.driver.wait(
    async () => {

      try {

        addressCard =
          await this.getAddressCard(addressText);

        const newCheckbox =
          await addressCard.findElement(
            By.xpath(
              ".//input[@type='checkbox' and " +
              "contains(@ng-model,'billingAddressId')]"
            )
          );

        return await newCheckbox.isSelected();

      } catch (error) {
        return false;
      }

    },
    30000
  );

  console.log(
    `Default Billing selected: ${addressText}`
  );

  return true;
  }
  
  // ==========================================
// VERIFY DEFAULT SHIPPING
// ==========================================
async verifyDefaultShipping(addressText) {

  const card =
    await this.getAddressCard(addressText);

  const checkbox =
    await card.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
        "contains(@ng-model,'shippingAddressId')]"
      )
    );

  const selected =
    await checkbox.isSelected();

  console.log(
    `Default Shipping checked: ${selected}`
  );

  return selected;
}


// ==========================================
// VERIFY DEFAULT BILLING
// ==========================================
async verifyDefaultBilling(addressText) {

  const card =
    await this.getAddressCard(addressText);

  const checkbox =
    await card.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
        "contains(@ng-model,'billingAddressId')]"
      )
    );

  const selected =
    await checkbox.isSelected();

  console.log(
    `Default Billing checked: ${selected}`
  );

  return selected;
  }
  
  

// ==========================================
// VERIFY ADDRESS EXISTS
// ==========================================
// async verifyAddressExists(addressText) {

//     try {

//         const card = await this.getAddressCard(
//             addressText
//         );

//         if (await card.isDisplayed()) {
//             console.log(
//                 `Address found: ${addressText}`
//             );

//             return true;
//         }

//         return false;

//     } catch (error) {

//         console.log(
//             `Address not found: ${addressText}`
//         );

//         return false;
//     }
  //   }
  
  async verifyAddressExists(addressLine1) {

    console.log("========== VERIFY ADDRESS START ==========");
    console.log("Searching for address:", addressLine1);

    // Give Angular/API time to refresh the address list
    await this.driver.sleep(3000);

    // Find all address cards
    const addressCards = await this.driver.findElements(
        By.xpath(
            "//div[contains(@class,'col-md-6') and .//span]"
        )
    );

    console.log("Address cards found:", addressCards.length);

    for (let i = 0; i < addressCards.length; i++) {

        try {

            const text = await addressCards[i].getText();

            console.log(`---------- ADDRESS CARD ${i + 1} ----------`);
            console.log(text);

        } catch (error) {
            console.log(
                `Could not read address card ${i + 1}`
            );
        }
    }

    // Search specifically for our newly-created address
    const matchingAddress = await this.driver.findElements(
        By.xpath(
            `//div[contains(@class,'col-md-6') and contains(., "${addressLine1}")]`
        )
    );

    console.log(
        "Matching address count:",
        matchingAddress.length
    );

    if (matchingAddress.length > 0) {

        console.log(
            "NEW ADDRESS FOUND:",
            addressLine1
        );

        console.log("========== VERIFY ADDRESS COMPLETE ==========");

        return true;
    }

    console.log(
        "NEW ADDRESS NOT FOUND:",
        addressLine1
    );

    console.log("========== VERIFY ADDRESS FAILED ==========");

    return false;
  }
  
  
// ==========================================
// VERIFY ADDRESS DELETED
// ==========================================
async verifyAddressDeleted(addressText) {

    const expectedAddress =
        String(addressText || "")
            .trim();

    console.log(
        `========== VERIFY DELETE ==========`
    );

    console.log(
        `Checking address is deleted: ${expectedAddress}`
    );

    await this.driver.wait(
        async () => {

            try {

                // Find all visible address cards.
                // IMPORTANT:
                // Do NOT require pencil/delete icons here.
                const cards =
                    await this.driver.findElements(
                        By.xpath(
                            "//div[contains(@class,'row') " +
                            "and contains(@style,'border:1px solid')]"
                        )
                    );

                console.log(
                    `Address cards found: ${cards.length}`
                );

                for (const card of cards) {

                    try {

                        if (!(await card.isDisplayed())) {
                            continue;
                        }

                        const text =
                            (await card.getText())
                                .replace(/\s+/g, " ")
                                .trim();

                        console.log(
                            `Checking card text: ${text}`
                        );

                        // Address still exists
                        if (text.includes(expectedAddress)) {

                            console.log(
                                `ADDRESS STILL EXISTS: ${expectedAddress}`
                            );

                            return false;
                        }

                    } catch (error) {
                        // Ignore stale/hidden card
                    }
                }

                // Address no longer found
                console.log(
                    `ADDRESS DELETED: ${expectedAddress}`
                );

                return true;

            } catch (error) {

                console.log(
                    `Verification error: ${error.message}`
                );

                return false;
            }

        },
        30000
    );

    return true;
  }
  
  

}

module.exports = ExpectedDetailsPage;
