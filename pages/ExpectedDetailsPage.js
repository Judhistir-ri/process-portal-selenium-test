const { By, until, Select } = require("selenium-webdriver");

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
      "//a[@data-toggle='tab' and @data-target='#address']",
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
        "and not(contains(@class,'ng-hide'))]",
    );

    this.visibleEditAddressForm = By.xpath(
      "//*[@ng-show='editShippingAddressContent' and not(contains(@class,'ng-hide'))]",
    );

    this.visibleAddAddressForm = By.xpath(
      "//*[@ng-show='addNewShippingAddressContent' and not(contains(@class,'ng-hide'))]",
    );

    this.addNewAddressButton = By.xpath(
      "//button[normalize-space(.)='Add New']",
    );

    // ==========================================
    // ADDRESS FORM FIELDS
    // ==========================================

    this.addressLine1Input = By.css(
      "#address input[placeholder='Address Line 1']",
    );

    this.addressLine2Input = By.css(
      "#address input[placeholder='Address Line 2']",
    );

    this.cityInput = By.css("#address input[placeholder='City']");

    this.stateInput = By.css("#address input[placeholder='State']");

    this.zipCodeInput = By.css("#address input[placeholder='Zip Code']");

    this.countryDropdown = By.css(
      "#address select[ng-model='address.country']",
    );

    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    this.closeAddressButton = By.xpath(
      "//div[@id='address']//button[normalize-space()='Close' " +
        "and not(contains(@class,'ng-hide'))]",
    );

    // ==========================================
    // ADD BUTTON
    // ==========================================

    this.addAddressButton = By.xpath(
      "//div[@id='address']//button[normalize-space()='Add' " +
        "and not(contains(@class,'ng-hide'))]",
    );

    // ==========================================
    // SAVE BUTTON - EDIT MODE
    // ==========================================

    this.editSaveAddressButton = By.xpath(
      "//div[@id='address']//button[normalize-space()='Save' " +
        "and not(contains(@class,'ng-hide'))]",
    );

    // Document Details tab
    this.documentDetailsTab = By.xpath(
      "//a[@data-toggle='tab' and @data-target='#docDetails']",
    );

    // Download Shipping Label link
    this.downloadShippingLabelLink = By.xpath(
      "//a[contains(@ng-click,'goToAttachments') " +
        "and contains(normalize-space(.),'Download Shipping Label')]",
    );

    // Attachments tab
    this.attachmentsTab = By.xpath(
      "//a[@data-toggle='tab' and @data-target='#attachments']",
    );

    // Attachments pane
    this.attachmentsPane = By.css("#attachments");
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

  // async getDocumentDetailsFeeDetails() {
  //   await this.clickTab("documentDetails");

  //   await this.driver.sleep(1000);

  //   const fees = await this.driver.executeScript(() => {

  //       const rows = Array.from(
  //           document.querySelectorAll(
  //               "[ng-repeat*='paymentDetail in paymentDetails']"
  //           )
  //       );

  //       return rows
  //           .map(row => {

  //               const feeTypeElement =
  //                   row.querySelector("h5.ng-binding");

  //               const priceElements =
  //                   Array.from(
  //                       row.querySelectorAll(
  //                           "h7.price, h7[title]"
  //                       )
  //                   );

  //               const feeType =
  //                   feeTypeElement
  //                       ? feeTypeElement.innerText
  //                           .replace(/\s+/g, " ")
  //                           .trim()
  //                       : "";

  //               const prices =
  //                   priceElements
  //                       .map(el => {
  //                           const text =
  //                               el.innerText
  //                                   .replace(/[^\d.-]/g, "")
  //                                   .trim();

  //                           return parseFloat(text);
  //                       })
  //                       .filter(value => !isNaN(value));

  //               return {
  //                   feeType,
  //                   unitPrice: prices.length > 0 ? prices[0] : null,
  //                   total: prices.length > 1 ? prices[1] : null
  //               };
  //           })
  //           .filter(fee =>
  //               fee.feeType &&
  //               fee.feeType.toLowerCase() !== "total"
  //           );
  //   });

  //   if (!fees.length) {
  //       throw new Error(
  //           "No fee details were found in Document Details."
  //       );
  //   }

  //   return fees;
  //   }

  // async getFeeDetails() {
  //   await this.clickTab("orderHistory");

  //   const table = await this.waitForVisible(this.feeTable, 60000);

  //   const rows = await table.findElements(By.css("tbody tr"));

  //   const fees = [];

  //   for (const row of rows) {
  //     try {
  //       if (!(await row.isDisplayed())) {
  //         continue;
  //       }

  //       const cells = await row.findElements(By.css("td"));

  //       const values = [];

  //       for (const cell of cells) {
  //         const text = (await cell.getText()).replace(/\s+/g, " ").trim();

  //         values.push(text);
  //       }

  //       if (values.length >= 4) {
  //         fees.push({
  //           feeType: values[0],
  //           quantity: values[1],
  //           unitPrice: values[2],
  //           total: values[3],
  //         });
  //       }
  //     } catch (error) {}
  //   }

  //   if (!fees.length) {
  //     throw new Error("No fee details were found in Order History.");
  //   }

  //   return fees;
  //   }

  async getDocumentDetailsFeeDetails() {
    await this.clickTab("documentDetails");

    await this.driver.sleep(1000);

    const fees = await this.driver.executeScript(() => {
      const rows = Array.from(
        document.querySelectorAll(
          "div[ng-repeat*='paymentDetail in paymentDetails']",
        ),
      );

      return rows
        .map((row) => {
          // Fee Type
          const feeTypeElement = row.querySelector("h5.ng-binding");

          const feeType = feeTypeElement
            ? feeTypeElement.innerText.replace(/\s+/g, " ").trim()
            : "";

          if (!feeType) {
            return null;
          }

          // All price elements inside this payment row
          const priceElements = Array.from(
            row.querySelectorAll("h7.price[title]"),
          );

          const values = priceElements
            .map((element) => {
              const title = element.getAttribute("title");

              return {
                value: parseFloat(title),
                visible: element.offsetParent !== null,
              };
            })
            .filter((item) => item.visible && !isNaN(item.value));

          /*
           * DOM structure:
           *
           * h7 title="1"  -> Quantity
           * h7 title="20" -> Unit Price
           * h7 title="20" -> Total
           *
           * Therefore:
           * values[0] = Quantity
           * values[1] = Unit Price
           * values[2] = Total
           */

          return {
            feeType: feeType,
            quantity: values.length > 0 ? values[0].value : null,
            unitPrice: values.length > 1 ? values[1].value : null,
            total: values.length > 2 ? values[2].value : null,
          };
        })
        .filter(
          (fee) => fee && fee.feeType && fee.feeType.toLowerCase() !== "total",
        );
    });

    if (!fees.length) {
      throw new Error("No fee details were found in Document Details.");
    }

    return fees;
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

        if (values.length < 4) {
          continue;
        }

        const feeType = values[0].trim();

        // Ignore table header
        if (
          feeType.toLowerCase() === "fee type" ||
          feeType.toLowerCase() === "total"
        ) {
          continue;
        }

        fees.push({
          feeType: feeType,
          quantity: values[1],
          unitPrice: values[2],
          total: values[3],
        });
      } catch (error) {
        // Ignore invalid/hidden rows
      }
    }

    if (!fees.length) {
      throw new Error("No fee details were found in Order History.");
    }

    return fees;
  }

  //verify
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

    const buttons = await this.driver.findElements(By.xpath("//button"));

    console.log(`Total buttons found: ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      try {
        if (await buttons[i].isDisplayed()) {
          const text = (await buttons[i].getText()).replace(/\s+/g, " ").trim();

          if (text.toLowerCase().includes("add")) {
            console.log(`BUTTON ${i}: "${text}"`);
          }
        }
      } catch (error) {}
    }

    const button = await this.waitForVisible(this.addNewAddressButton, 30000);

    console.log("Add New button FOUND");

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    try {
      await button.click();
    } catch (error) {
      console.log("Normal click failed, using JS click");

      await this.driver.executeScript("arguments[0].click();", button);
    }

    console.log("Add New button CLICKED");

    await this.waitForVisible(this.addressLine1Input, 30000);

    console.log("Address form OPENED");

    return true;
  }

  // ==========================================
  // GET DYNAMIC ADDRESS CARD BY UNIQUE ADDRESS
  // ==========================================
  async getAddressCard(addressText) {
    const address = String(addressText).trim();

    return await this.driver.wait(async () => {
      try {
        const cards = await this.driver.findElements(
          By.xpath(
            "//div[@ng-repeat='address in customerAddresses track by $index']",
          ),
        );

        for (const card of cards) {
          try {
            if (!(await card.isDisplayed())) {
              continue;
            }

            const text = (await card.getText()).replace(/\s+/g, " ").trim();

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
    }, 30000);
  }

  // ==========================================
  // WAIT FOR ADDRESS TO APPEAR
  // ==========================================
  async waitForAddressToAppear(addressText, timeout = 30000) {
    const address = String(addressText).trim();

    await this.driver.wait(async () => {
      try {
        const cards = await this.driver.findElements(
          By.xpath(
            "//div[@ng-repeat='address in customerAddresses track by $index']",
          ),
        );

        for (const card of cards) {
          try {
            const text = (await card.getText()).replace(/\s+/g, " ").trim();

            if (text.includes(address)) {
              return true;
            }
          } catch (error) {}
        }

        return false;
      } catch (error) {
        return false;
      }
    }, timeout);

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
      30000,
    );

    console.log("1. Address Line 1 FOUND");

    await address1.clear();
    await address1.sendKeys(String(addressLine1));

    console.log("1. Address Line 1 FILLED");

    console.log("2. Looking for Address Line 2...");

    const address2 = await this.waitForVisibleElement(
      this.addressLine2Input,
      30000,
    );

    console.log("2. Address Line 2 FOUND");

    await address2.clear();
    await address2.sendKeys(String(addressLine2));

    console.log("2. Address Line 2 FILLED");

    console.log("3. Looking for City...");

    const cityElement = await this.waitForVisibleElement(this.cityInput, 30000);

    console.log("3. City FOUND");

    await cityElement.clear();
    await cityElement.sendKeys(String(city));

    console.log("3. City FILLED");

    console.log("4. Looking for State...");

    const stateElement = await this.waitForVisibleElement(
      this.stateInput,
      30000,
    );

    console.log("4. State FOUND");

    await stateElement.clear();
    await stateElement.sendKeys(String(state));

    console.log("4. State FILLED");

    console.log("5. Looking for Zip Code...");

    const zipElement = await this.waitForVisibleElement(
      this.zipCodeInput,
      30000,
    );

    console.log("5. Zip Code FOUND");

    await zipElement.clear();
    await zipElement.sendKeys(String(zipCode));

    console.log("5. Zip Code FILLED");

    console.log("6. Looking for Country dropdown...");

    const countryElement = await this.waitForVisibleElement(
      this.countryDropdown,
      30000,
    );

    console.log("6. Country dropdown FOUND");

    const options = await countryElement.findElements(By.css("option"));

    console.log(`Country options found: ${options.length}`);

    let selected = false;

    for (const option of options) {
      const text = (await option.getText()).trim();

      if (text.toLowerCase() === String(country).trim().toLowerCase()) {
        await option.click();

        selected = true;

        console.log(`6. Country selected: ${text}`);

        break;
      }
    }

    if (!selected) {
      throw new Error(`Country "${country}" was not found`);
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

    const addButtons = await this.driver.findElements(this.addAddressButton);

    for (const button of addButtons) {
      try {
        if (!(await button.isDisplayed())) {
          continue;
        }

        await this.driver.executeScript(
          "arguments[0].scrollIntoView({block:'center'});",
          button,
        );

        try {
          await button.click();
        } catch (error) {
          await this.driver.executeScript("arguments[0].click();", button);
        }

        // Wait until form closes
        await this.driver.wait(async () => {
          const fields = await this.driver.findElements(this.addressLine1Input);

          for (const field of fields) {
            try {
              if (await field.isDisplayed()) {
                return false;
              }
            } catch (error) {}
          }

          return true;
        }, 30000);

        return true;
      } catch (error) {
        console.log("Add button handling error:", error.message);
      }
    }

    // ==========================================
    // EDIT EXISTING ADDRESS - SAVE
    // ==========================================

    const saveButtons = await this.driver.findElements(
      this.editSaveAddressButton,
    );

    for (const button of saveButtons) {
      try {
        if (!(await button.isDisplayed())) {
          continue;
        }

        await this.driver.executeScript(
          "arguments[0].scrollIntoView({block:'center'});",
          button,
        );

        try {
          await button.click();
        } catch (error) {
          await this.driver.executeScript("arguments[0].click();", button);
        }

        // Wait until edit form closes
        await this.driver.wait(async () => {
          const fields = await this.driver.findElements(this.addressLine1Input);

          for (const field of fields) {
            try {
              if (await field.isDisplayed()) {
                return false;
              }
            } catch (error) {}
          }

          return true;
        }, 30000);

        return true;
      } catch (error) {
        console.log("Save button handling error:", error.message);
      }
    }

    throw new Error("Neither Add nor Save button is visible.");
  }

  // ==========================================
  // CLOSE ADDRESS FORM
  // ==========================================

  async closeAddressForm() {
    const closeButton = await this.waitForVisible(
      this.closeAddressButton,
      30000,
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      closeButton,
    );

    try {
      await closeButton.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", closeButton);
    }

    // Wait until Address Line 1 is no longer visible
    await this.driver.wait(async () => {
      const fields = await this.driver.findElements(this.addressLine1Input);

      for (const field of fields) {
        try {
          if (await field.isDisplayed()) {
            return false;
          }
        } catch (error) {}
      }

      return true;
    }, 30000);

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
    const expected = String(addressText || "").trim();

    if (!expected) {
      throw new Error("Address text cannot be empty.");
    }

    console.log(`Searching dynamic address card for: ${expected}`);

    const locator = By.xpath(
      "//div[contains(@class,'row') " +
        "and contains(@style,'border:1px solid')" +
        " and .//i[contains(@class,'fa-pencil')]" +
        " and .//i[contains(@class,'fa-times')]" +
        " and .//*[contains(normalize-space(.), " +
        JSON.stringify(expected) +
        ")] ]",
    );

    return await this.driver.wait(async () => {
      const cards = await this.driver.findElements(locator);

      console.log(`Address cards matching locator: ${cards.length}`);

      for (const card of cards) {
        try {
          if (!(await card.isDisplayed())) {
            continue;
          }

          const text = (await card.getText()).replace(/\s+/g, " ").trim();

          console.log(`Checking card: ${text}`);

          if (text.includes(expected)) {
            console.log(`MATCH FOUND: ${expected}`);

            return card;
          }
        } catch (error) {}
      }

      return false;
    }, 30000);
  }

  //Edit address
  async editAddress(existingAddress, updatedAddress) {
    console.log(`\n========== EDIT ADDRESS ==========`);

    console.log(`Looking for address: ${existingAddress}`);

    // ------------------------------------------
    // STEP 1: Find exact dynamic address card
    // ------------------------------------------
    const addressCard = await this.getAddressCard(existingAddress);

    console.log("Address card FOUND");

    // ------------------------------------------
    // STEP 2: Find pencil inside SAME card
    // ------------------------------------------
    const editButton = await addressCard.findElement(
      By.xpath(".//i[contains(@class,'fa-pencil')]"),
    );

    console.log("Edit pencil FOUND");

    // ------------------------------------------
    // STEP 3: Scroll pencil into view
    // ------------------------------------------
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      editButton,
    );

    await this.driver.sleep(500);

    // ------------------------------------------
    // STEP 4: Click pencil
    // ------------------------------------------
    try {
      await editButton.click();
    } catch (error) {
      console.log("Normal click failed. Using JavaScript click.");

      await this.driver.executeScript("arguments[0].click();", editButton);
    }

    console.log("Edit pencil CLICKED");

    // ------------------------------------------
    // STEP 5: Wait for Angular edit form
    // ------------------------------------------
    console.log("Waiting for EDIT address form...");

    await this.driver.wait(async () => {
      try {
        const forms = await this.driver.findElements(
          this.visibleEditAddressForm,
        );

        for (const form of forms) {
          if (await form.isDisplayed()) {
            console.log("EDIT address form is visible");

            return true;
          }
        }
      } catch (error) {}

      return false;
    }, 30000);

    // ------------------------------------------
    // STEP 6: Find visible Address Line 1
    // ------------------------------------------
    const address1 = await this.waitForVisible(this.addressLine1Input, 30000);

    console.log("Address Line 1 visible in EDIT form");

    // ------------------------------------------
    // STEP 7: Fill updated address
    // ------------------------------------------
    await this.fillAddress(updatedAddress);

    console.log("Updated address fields filled");

    // ------------------------------------------
    // STEP 8: Save edited address
    // ------------------------------------------
    await this.saveAddress();

    console.log("Edited address SAVED");

    // ------------------------------------------
    // STEP 9: Wait for updated address
    // ------------------------------------------
    await this.driver.sleep(2000);

    console.log(`Waiting for updated address: ${updatedAddress.addressLine1}`);

    await this.getAddressCard(updatedAddress.addressLine1);

    console.log(`Address updated successfully: ${updatedAddress.addressLine1}`);

    return true;
  }

  // ==========================================
  // DELETE ADDRESS
  // ==========================================
  async deleteAddress(addressText) {
    console.log(`\n========== DELETE ADDRESS ==========`);

    console.log(`Looking for address to delete: ${addressText}`);

    // ------------------------------------------
    // STEP 1: Find exact address card
    // ------------------------------------------
    const addressCard = await this.getAddressCard(addressText);

    console.log("Address card FOUND");

    // ------------------------------------------
    // STEP 2: Find delete X inside same card
    // ------------------------------------------
    const deleteButton = await addressCard.findElement(
      By.xpath(".//i[contains(@class,'fa-times')]"),
    );

    console.log("Delete button FOUND");

    // ------------------------------------------
    // STEP 3: Scroll into view
    // ------------------------------------------
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      deleteButton,
    );

    await this.driver.sleep(500);

    // ------------------------------------------
    // STEP 4: Click delete
    // ------------------------------------------
    try {
      await deleteButton.click();
    } catch (error) {
      console.log("Normal delete click failed. Using JS click.");

      await this.driver.executeScript("arguments[0].click();", deleteButton);
    }

    console.log("Delete button CLICKED");

    // ------------------------------------------
    // STEP 5: Handle browser alert if present
    // ------------------------------------------
    await this.driver.sleep(1000);

    try {
      const alert = await this.driver.switchTo().alert();

      console.log("Delete confirmation alert FOUND");

      await alert.accept();

      console.log("Delete confirmation ACCEPTED");
    } catch (error) {
      console.log("No browser confirmation alert");
    }

    // ------------------------------------------
    // STEP 6: Wait for address to disappear
    // ------------------------------------------
    console.log(`Waiting for address to disappear: ${addressText}`);

    await this.driver.wait(async () => {
      try {
        const cards = await this.driver.findElements(
          By.xpath(
            "//div[contains(@class,'row') " +
              "and contains(@style,'border:1px solid')" +
              " and .//i[contains(@class,'fa-pencil')]" +
              " and .//i[contains(@class,'fa-times')]",
          ),
        );

        for (const card of cards) {
          try {
            if (!(await card.isDisplayed())) {
              continue;
            }

            const text = (await card.getText()).replace(/\s+/g, " ").trim();

            if (text.includes(addressText)) {
              return false;
            }
          } catch (error) {}
        }

        return true;
      } catch (error) {
        return true;
      }
    }, 30000);

    console.log(`Address deleted successfully: ${addressText}`);

    return true;
  }

  // ==========================================
  // SET DEFAULT SHIPPING
  // ==========================================
  async setDefaultShipping(addressText) {
    console.log(`Setting Default Shipping: ${addressText}`);

    let addressCard = await this.getAddressCard(addressText);

    const checkbox = await addressCard.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
          "contains(@ng-model,'shippingAddressId')]",
      ),
    );

    // Find label belonging to this checkbox
    const label = await checkbox
      .findElement(By.xpath("./following-sibling::label"))
      .catch(async () => {
        return await addressCard.findElement(
          By.xpath(
            ".//label[.//span[contains(normalize-space(.),'Default Shipping')]]",
          ),
        );
      });

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      label,
    );

    // Check current state
    let selected = await checkbox.isSelected();

    console.log(`Shipping checkbox before click: ${selected}`);

    if (!selected) {
      try {
        await label.click();
      } catch (error) {
        await this.driver.executeScript("arguments[0].click();", label);
      }
    }

    // Angular can re-render the card.
    // Therefore DON'T reuse old WebElement.
    await this.driver.wait(async () => {
      try {
        addressCard = await this.getAddressCard(addressText);

        const newCheckbox = await addressCard.findElement(
          By.xpath(
            ".//input[@type='checkbox' and " +
              "contains(@ng-model,'shippingAddressId')]",
          ),
        );

        return await newCheckbox.isSelected();
      } catch (error) {
        return false;
      }
    }, 30000);

    console.log(`Default Shipping selected: ${addressText}`);

    return true;
  }

  // ==========================================
  // SET DEFAULT BILLING
  // ==========================================
  async setDefaultBilling(addressText) {
    console.log(`Setting Default Billing: ${addressText}`);

    let addressCard = await this.getAddressCard(addressText);

    const checkbox = await addressCard.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
          "contains(@ng-model,'billingAddressId')]",
      ),
    );

    const label = await addressCard.findElement(
      By.xpath(
        ".//label[.//span[contains(normalize-space(.),'Default Billing')]]",
      ),
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      label,
    );

    let selected = await checkbox.isSelected();

    console.log(`Billing checkbox before click: ${selected}`);

    if (!selected) {
      try {
        await label.click();
      } catch (error) {
        await this.driver.executeScript("arguments[0].click();", label);
      }
    }

    // Angular re-renders after checkbox change.
    await this.driver.wait(async () => {
      try {
        addressCard = await this.getAddressCard(addressText);

        const newCheckbox = await addressCard.findElement(
          By.xpath(
            ".//input[@type='checkbox' and " +
              "contains(@ng-model,'billingAddressId')]",
          ),
        );

        return await newCheckbox.isSelected();
      } catch (error) {
        return false;
      }
    }, 30000);

    console.log(`Default Billing selected: ${addressText}`);

    return true;
  }

  // ==========================================
  // VERIFY DEFAULT SHIPPING
  // ==========================================
  async verifyDefaultShipping(addressText) {
    const card = await this.getAddressCard(addressText);

    const checkbox = await card.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
          "contains(@ng-model,'shippingAddressId')]",
      ),
    );

    const selected = await checkbox.isSelected();

    console.log(`Default Shipping checked: ${selected}`);

    return selected;
  }

  // ==========================================
  // VERIFY DEFAULT BILLING
  // ==========================================
  async verifyDefaultBilling(addressText) {
    const card = await this.getAddressCard(addressText);

    const checkbox = await card.findElement(
      By.xpath(
        ".//input[@type='checkbox' and " +
          "contains(@ng-model,'billingAddressId')]",
      ),
    );

    const selected = await checkbox.isSelected();

    console.log(`Default Billing checked: ${selected}`);

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
      By.xpath("//div[contains(@class,'col-md-6') and .//span]"),
    );

    console.log("Address cards found:", addressCards.length);

    for (let i = 0; i < addressCards.length; i++) {
      try {
        const text = await addressCards[i].getText();

        console.log(`---------- ADDRESS CARD ${i + 1} ----------`);
        console.log(text);
      } catch (error) {
        console.log(`Could not read address card ${i + 1}`);
      }
    }

    // Search specifically for our newly-created address
    const matchingAddress = await this.driver.findElements(
      By.xpath(
        `//div[contains(@class,'col-md-6') and contains(., "${addressLine1}")]`,
      ),
    );

    console.log("Matching address count:", matchingAddress.length);

    if (matchingAddress.length > 0) {
      console.log("NEW ADDRESS FOUND:", addressLine1);

      console.log("========== VERIFY ADDRESS COMPLETE ==========");

      return true;
    }

    console.log("NEW ADDRESS NOT FOUND:", addressLine1);

    console.log("========== VERIFY ADDRESS FAILED ==========");

    return false;
  }

  // ==========================================
  // VERIFY ADDRESS DELETED
  // ==========================================
  async verifyAddressDeleted(addressText) {
    const expectedAddress = String(addressText || "").trim();

    console.log(`========== VERIFY DELETE ==========`);

    console.log(`Checking address is deleted: ${expectedAddress}`);

    await this.driver.wait(async () => {
      try {
        // Find all visible address cards.
        // IMPORTANT:
        // Do NOT require pencil/delete icons here.
        const cards = await this.driver.findElements(
          By.xpath(
            "//div[contains(@class,'row') " +
              "and contains(@style,'border:1px solid')]",
          ),
        );

        console.log(`Address cards found: ${cards.length}`);

        for (const card of cards) {
          try {
            if (!(await card.isDisplayed())) {
              continue;
            }

            const text = (await card.getText()).replace(/\s+/g, " ").trim();

            console.log(`Checking card text: ${text}`);

            // Address still exists
            if (text.includes(expectedAddress)) {
              console.log(`ADDRESS STILL EXISTS: ${expectedAddress}`);

              return false;
            }
          } catch (error) {
            // Ignore stale/hidden card
          }
        }

        // Address no longer found
        console.log(`ADDRESS DELETED: ${expectedAddress}`);

        return true;
      } catch (error) {
        console.log(`Verification error: ${error.message}`);

        return false;
      }
    }, 30000);

    return true;
  }

  // ==========================================
  // CLICK MARK PAYMENT
  // ==========================================
  async clickMarkPayment() {
    const markPaymentButton = await this.driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(@ng-click,'openPaymentReceived(doc)')]"),
      ),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(markPaymentButton), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      markPaymentButton,
    );

    await this.driver.sleep(500);

    try {
      await markPaymentButton.click();
    } catch (error) {
      await this.driver.executeScript(
        "arguments[0].click();",
        markPaymentButton,
      );
    }

    // Wait for payment popup
    await this.driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@class,'modal')]" +
            "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
        ),
      ),
      60000,
    );

    await this.driver.sleep(500);

    return true;
  }

  // ==========================================
  // GET MARK PAYMENT POPUP DOCUMENT ID
  // ==========================================
  async getMarkPaymentPopupDocumentId() {
    const popup = await this.driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@class,'modal')]" +
            "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
        ),
      ),
      60000,
    );

    const text = await popup.getText();

    const match = text.match(/Document\s*\((\d+)\)/i);

    if (!match) {
      throw new Error("Document ID was not found in Mark Payment popup.");
    }

    return match[1];
  }

  // ==========================================
  // GET MARK PAYMENT POPUP AMOUNT
  // ==========================================
  async getMarkPaymentPopupAmount() {
    const popup = await this.driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@class,'modal')]" +
            "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
        ),
      ),
      60000,
    );

    const amountInput = await popup.findElement(
      By.xpath(
        ".//input[contains(@ng-model,'paymentReceived.amountReceived')]",
      ),
    );

    const value = await amountInput.getAttribute("value");

    if (!value || isNaN(parseFloat(value))) {
      throw new Error(
        `Invalid payment amount in Mark Payment popup: "${value}"`,
      );
    }

    return parseFloat(value.replace(/,/g, ""));
  }

  // ==========================================
  // SELECT RANDOM PAYMENT MODE
  // ==========================================
  async selectPaymentMode() {
    const popup = await this.driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@class,'modal')]" +
            "[.//select[contains(@ng-model,'paymentReceived.paymentMode')]]",
        ),
      ),
      60000,
    );

    const paymentModeDropdown = await popup.findElement(
      By.xpath(".//select[contains(@ng-model,'paymentReceived.paymentMode')]"),
    );

    // Get all valid payment options
    const options = await paymentModeDropdown.findElements(By.css("option"));

    const validOptions = [];

    for (const option of options) {
      const value = await option.getAttribute("value");
      const text = (await option.getText()).trim();

      // Ignore placeholder
      if (
        value &&
        value !== "0" &&
        text &&
        !text.toLowerCase().includes("select payment mode")
      ) {
        validOptions.push({
          element: option,
          value: value,
          text: text,
        });
      }
    }

    if (validOptions.length === 0) {
      throw new Error("No valid payment modes found in dropdown.");
    }

    // Select a random payment mode
    const randomIndex = Math.floor(Math.random() * validOptions.length);

    const selectedOption = validOptions[randomIndex];

    console.log(`Random Payment Mode Selected: ${selectedOption.text}`);

    // Select the option
    await this.driver.executeScript(
      `
        const select = arguments[0];
        const value = arguments[1];

        select.value = value;

        select.dispatchEvent(
            new Event('change', { bubbles: true })
        );

        select.dispatchEvent(
            new Event('input', { bubbles: true })
        );
        `,
      paymentModeDropdown,
      selectedOption.value,
    );

    // Allow Angular model to update
    await this.driver.sleep(500);

    // Verify selected option
    const selectedText = await this.driver.executeScript(
      `
        const select = arguments[0];

        return select.options[select.selectedIndex]
            ? select.options[select.selectedIndex].text.trim()
            : "";
        `,
      paymentModeDropdown,
    );

    if (!selectedText || selectedText === "Select Payment Mode") {
      throw new Error(
        `Payment mode was not selected. Selected text: "${selectedText}"`,
      );
    }

    console.log(`✓ Payment Mode successfully selected: ${selectedText}`);

    return selectedText;
  }

  // ==========================================
  // CLICK SUBMIT IN MARK PAYMENT POPUP
  // ==========================================
  async submitMarkPayment() {
    const popup = await this.driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@class,'modal')]" +
            "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
        ),
      ),
      60000,
    );

    const submitButton = await popup.findElement(
      By.xpath(".//button[normalize-space()='Submit']"),
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      submitButton,
    );

    await this.driver.sleep(300);

    try {
      await submitButton.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", submitButton);
    }

    // Wait until popup disappears
    await this.driver.wait(async () => {
      const popups = await this.driver.findElements(
        By.xpath(
          "//div[contains(@class,'modal')]" +
            "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
        ),
      );

      for (const popup of popups) {
        try {
          if (await popup.isDisplayed()) {
            return false;
          }
        } catch (error) {}
      }

      return true;
    }, 60000);

    // Allow Order Summary to refresh
    await this.driver.sleep(3000);

    return true;
  }

  // ==========================================
  // GET ORDER SUMMARY PAID AMOUNT
  // ==========================================

  // async getOrderSummaryPaidAmount() {
  //   const result = await this.driver.executeScript(() => {
  //     const headings = Array.from(document.querySelectorAll("h5"));

  //     for (const heading of headings) {
  //       const label = (heading.innerText || "")
  //         .replace(/\s+/g, " ")
  //         .trim();

  //       if (!/^Paid Amount\s*:/i.test(label)) continue;

  //       const labelColumn = heading.closest(".col-md-8");
  //       if (!labelColumn) continue;

  //       const row = labelColumn.parentElement;
  //       if (!row) continue;

  //       // Get the value from this row only.
  //       const valueColumn = Array.from(row.children).find(
  //         element => element.matches(".col-md-4.price")
  //       );

  //       const strong = valueColumn?.querySelector("strong");
  //       if (!strong) continue;

  //       const amount = parseFloat(
  //         (strong.innerText || "").replace(/[^0-9.-]/g, "")
  //       );

  //       if (!Number.isNaN(amount)) {
  //         return {
  //           amount,
  //           isGreen: !!heading.closest("[ng-class*='greenColor']")
  //         };
  //       }
  //     }

  //     return null;
  //   });

  //   if (!result) {
  //     throw new Error("Paid Amount was not found in Order Summary.");
  //   }

  //   return result;
  //   }

  async getOrderSummaryAmountByLabel(labelText) {
    const result = await this.driver.executeScript((wantedLabel) => {
      const normalize = (text) =>
        (text || "").replace(/\s+/g, " ").trim().replace(/:$/, "").trim();

      // Find the Order Summary panel.
      const summaryHeading = Array.from(
        document.querySelectorAll("h4, h5, h3, h2"),
      ).find(
        (element) =>
          normalize(element.innerText).toLowerCase() === "order summary",
      );

      if (!summaryHeading) {
        return { error: "Order Summary heading not found" };
      }

      let panel = summaryHeading.parentElement;

      while (panel && panel !== document.body) {
        const text = panel.innerText || "";

        if (
          /Total Amount\s*:/i.test(text) &&
          /Paid Amount\s*:/i.test(text) &&
          /Outstanding Amount\s*:/i.test(text)
        ) {
          break;
        }

        panel = panel.parentElement;
      }

      if (!panel || panel === document.body) {
        return { error: "Order Summary panel not found" };
      }

      const heading = Array.from(panel.querySelectorAll("h5")).find(
        (element) =>
          normalize(element.innerText).toLowerCase() ===
          wantedLabel.toLowerCase(),
      );

      if (!heading) {
        return { error: `${wantedLabel} label not found` };
      }

      // Actual DOM: .col-md-8 contains the label.
      // The following sibling .col-md-4.price contains its amount.
      const labelColumn = heading.closest(".col-md-8");

      if (!labelColumn) {
        return { error: `${wantedLabel}: label column not found` };
      }

      const valueColumn = labelColumn.nextElementSibling;

      if (!valueColumn || !valueColumn.matches(".col-md-4.price")) {
        return { error: `${wantedLabel}: amount column not found` };
      }

      const strong = valueColumn.querySelector("strong");

      if (!strong) {
        return { error: `${wantedLabel}: amount value not found` };
      }

      const match = (strong.innerText || "")
        .replace(/,/g, "")
        .match(/-?\d+(?:\.\d{1,2})?/);

      if (!match) {
        return { error: `${wantedLabel}: invalid amount` };
      }

      return { amount: Number(match[0]) };
    }, labelText);

    if (result?.error || !Number.isFinite(result?.amount)) {
      throw new Error(result?.error || `${labelText} could not be read`);
    }

    return result.amount;
  }

  async getOrderSummaryPaidAmount() {
    const amount = await this.getOrderSummaryAmountByLabel("Paid Amount");

    const isGreen = await this.driver.executeScript(() => {
      const normalize = (text) =>
        (text || "")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/:$/, "")
          .trim()
          .toLowerCase();

      const summaryHeading = Array.from(
        document.querySelectorAll("h4, h5, h3, h2"),
      ).find((element) => normalize(element.innerText) === "order summary");

      if (!summaryHeading) {
        return false;
      }

      let panel = summaryHeading.parentElement;

      while (panel && panel !== document.body) {
        const text = panel.innerText || "";

        if (
          /Total Amount\s*:/i.test(text) &&
          /Paid Amount\s*:/i.test(text) &&
          /Outstanding Amount\s*:/i.test(text)
        ) {
          break;
        }

        panel = panel.parentElement;
      }

      if (!panel || panel === document.body) {
        return false;
      }

      const paidLabel = Array.from(panel.querySelectorAll("h5")).find(
        (element) => normalize(element.innerText) === "paid amount",
      );

      if (!paidLabel) {
        return false;
      }

      const greenRow = paidLabel.closest("[ng-class*='greenColor']");

      return !!greenRow && greenRow.classList.contains("greenColor");
    });

    return { amount, isGreen };
  }

  // async getOrderSummaryPaidAmount() {
  //   const amount = await this.getOrderSummaryAmountByLabel("Paid Amount");
  //   return { amount };
  // }

  async getOrderSummaryOutstandingAmount() {
    return await this.getOrderSummaryAmountByLabel("Outstanding Amount");
  }

  async getOrderSummaryTotalAmount() {
    return await this.getOrderSummaryAmountByLabel("Total Amount");
  }

  // ==========================================
  // GET MARK PAYMENT ERROR MESSAGE
  // ==========================================
  async getMarkPaymentErrorMessage() {
    await this.driver.sleep(500);

    const message = await this.driver.executeScript(() => {
      const elements = Array.from(document.querySelectorAll("body *"));

      for (const element of elements) {
        const text = (element.innerText || "").replace(/\s+/g, " ").trim();

        if (text.toLowerCase().includes("no amount due for this document")) {
          return text;
        }
      }

      return null;
    });

    if (!message) {
      throw new Error(
        "Expected error message 'No amount due for this document' was not found.",
      );
    }

    return message;
  }

  // Verify whether Download Shipping Label is displayed
  async isDownloadShippingLabelDisplayed() {
    const links = await this.driver.findElements(
      this.downloadShippingLabelLink,
    );

    for (const link of links) {
      try {
        if (await link.isDisplayed()) {
          return true;
        }
      } catch (error) {
        // Element may have been re-rendered
      }
    }

    return false;
  }

  async getDownloadShippingLabelLinkIfAvailable() {
    const locator = By.xpath(
      "//a[contains(@ng-click,'goToAttachments') " +
        "and contains(normalize-space(.),'Download Shipping Label')]",
    );

    const links = await this.driver.findElements(locator);

    for (const link of links) {
      try {
        if ((await link.isDisplayed()) && (await link.isEnabled())) {
          return link;
        }
      } catch (error) {
        // Ignore stale elements.
      }
    }

    return null;
  }

  async clickDownloadShippingLabel() {
    console.log("STEP 1: Looking for Download Shipping Label...");

    const link = await this.waitForVisible(
      this.downloadShippingLabelLink,
      30000,
    );

    console.log("STEP 2: Download Shipping Label link found.");

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      link,
    );

    await link.click();

    console.log("STEP 3: Download Shipping Label clicked.");

    await this.driver.wait(async () => {
      const activeTab = await this.driver.executeScript(() => {
        const tab = document.querySelector(
          "a[data-toggle='tab'][data-target='#attachments']",
        );

        return tab ? tab.parentElement.classList.contains("active") : false;
      });

      const paneVisible = await this.driver.executeScript(() => {
        const pane = document.querySelector("#attachments");

        return (
          !!pane &&
          pane.classList.contains("active") &&
          pane.getAttribute("aria-hidden") !== "true"
        );
      });

      return activeTab && paneVisible;
    }, 30000);

    console.log("STEP 4: Attachments tab opened successfully.");

    return true;
  }

  async getReturnShippingLabelDownloadIconIfAvailable() {
    const locator = By.xpath(
      "//div[@id='attachments']" +
        "//tr[contains(@ng-repeat,'shippingDetail in doc.shippingDetails')]" +
        "[.//td[contains(normalize-space(.),'Return Shipping Label')]]" +
        "//i[@title='Download' and " +
        "contains(@ng-click,'downloadReturnShippingLabel') and " +
        "contains(@class,'fa-download')]",
    );

    const icons = await this.driver.findElements(locator);

    for (const icon of icons) {
      try {
        if ((await icon.isDisplayed()) && (await icon.isEnabled())) {
          return icon;
        }
      } catch (error) {
        // Ignore stale elements.
      }
    }

    return null;
  }

  async verifyReturnShippingLabelDetails() {
    await this.clickTab("attachments");

    const returnLabelRow = By.xpath(
      "//div[@id='attachments']" +
        "//tr[contains(@ng-repeat,'shippingDetail in doc.shippingDetails')]" +
        "[.//td[contains(normalize-space(.),'Return Shipping Label')]]",
    );

    const row = await this.driver.wait(async () => {
      const rows = await this.driver.findElements(returnLabelRow);

      for (const element of rows) {
        try {
          if (await element.isDisplayed()) {
            return element;
          }
        } catch (error) {
          // Ignore stale elements.
        }
      }

      return false;
    }, 30000);

    const rowText = (await row.getText()).replace(/\s+/g, " ").trim();

    const downloadIcon =
      await this.getReturnShippingLabelDownloadIconIfAvailable();

    return {
      rowText,
      downloadIconVisible: downloadIcon !== null,
    };
  }

  // Get the currently displayed processing stops.
  async getVisibleStops() {
    return await this.verifyProcessingSteps();
  }

  // Get the current Payment Due amount.
  async getCurrentPaymentAmount() {
    return Number(await this.getPaymentAmount());
  }

  // Select a stop that is not already present.
  async selectNewStop() {
    await this.clickTab("documentDetails");

    const dropdown = await this.waitForVisible(
      By.css("#docDetails select[ng-model='documentStop']"),
      30000,
    );

    const existingStops = (await this.getVisibleStops()).map((stop) =>
      stop.trim().toLowerCase(),
    );

    const options = await dropdown.findElements(By.css("option"));
    const availableStops = [];

    for (const option of options) {
      const value = await option.getAttribute("value");
      const text = (await option.getText()).trim();

      if (
        value &&
        text &&
        !existingStops.includes(text.toLowerCase()) &&
        !/select|choose/i.test(text)
      ) {
        availableStops.push({ value, text });
      }
    }

    if (availableStops.length === 0) {
      throw new Error("No new processing stop is available.");
    }

    // Prefer DOS if it is available; otherwise use the first new stop.
    const selected =
      availableStops.find((stop) => stop.text.toUpperCase() === "DOS") ||
      availableStops[0];

    await dropdown.sendKeys(selected.text);
    await this.driver.sleep(1500);

    console.log("Selected stop:", selected.text);
    return selected.text;
  }

  // Click the bottom Save button.
  // async clickDocumentSave() {
  //   const saveButton = await this.waitForVisible(
  //     By.xpath(
  //       "//button[contains(@ng-click,'updateDocDetails') " +
  //         "and contains(@ng-click,\"'save'\") " +
  //         "and normalize-space(.)='Save']",
  //     ),
  //     30000,
  //   );

  //   await this.driver.executeScript(
  //     "arguments[0].scrollIntoView({block:'center'});",
  //     saveButton,
  //   );

  //   await saveButton.click();
  //   await this.driver.sleep(2500);
  // }

  
  // Click the bottom Save button after loading finishes.
  async clickDocumentSave() {
    const spinner = By.css(".loading-spiner-holder");

    // Wait until no visible loading spinner remains.
    await this.driver.wait(async () => {
      const spinners = await this.driver.findElements(spinner);

      for (const element of spinners) {
        try {
          if (await element.isDisplayed()) {
            return false;
          }
        } catch (error) {
          // Spinner was removed from the DOM.
        }
      }

      return true;
    }, 60000, "Loading spinner did not disappear before Save.");

    const saveLocator = By.css(
      "#docDetails button[ng-click*='updateDocDetails'][ng-click*=\"'save'\"]"
    );

    // Re-find the button each time Angular updates the page.
    await this.driver.wait(async () => {
      try {
        const buttons = await this.driver.findElements(saveLocator);

        for (const button of buttons) {
          if (
            await button.isDisplayed() &&
            await button.isEnabled()
          ) {
            const spinnerVisible = await this.driver.executeScript(() => {
              return Array.from(
                document.querySelectorAll(".loading-spiner-holder")
              ).some(el => {
                const style = window.getComputedStyle(el);
                return style.display !== "none" &&
                       style.visibility !== "hidden" &&
                       style.opacity !== "0" &&
                       el.getBoundingClientRect().width > 0 &&
                       el.getBoundingClientRect().height > 0;
              });
            });

            if (!spinnerVisible) {
              return button;
            }
          }
        }
      } catch (error) {
        // Retry if Angular replaces the button.
      }

      return false;
    }, 60000, "Save button remained unavailable or covered.");

    // Locate the current button again immediately before clicking.
    const button = await this.driver.findElement(saveLocator);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button
    );

    // Recheck spinner immediately before the click.
    await this.driver.wait(async () => {
      return await this.driver.executeScript(() => {
        return !Array.from(
          document.querySelectorAll(".loading-spiner-holder")
        ).some(el => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" &&
                 style.visibility !== "hidden" &&
                 style.opacity !== "0" &&
                 el.getBoundingClientRect().width > 0 &&
                 el.getBoundingClientRect().height > 0;
        });
      });
    }, 30000, "Loading overlay appeared again before Save.");

    await button.click();

    console.log("✓ Bottom Save clicked.");

    // Wait for the save operation to finish.
    await this.driver.wait(async () => {
      return await this.driver.executeScript(() => {
        return !Array.from(
          document.querySelectorAll(".loading-spiner-holder")
        ).some(el => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" &&
                 style.visibility !== "hidden" &&
                 style.opacity !== "0" &&
                 el.getBoundingClientRect().width > 0 &&
                 el.getBoundingClientRect().height > 0;
        });
      });
    }, 60000, "Loading overlay did not disappear after Save.");

    console.log("✓ Document Save completed.");
  }


  // Refresh and reopen the same document.
  async refreshAndReopenDocument(orderId, expectedPage) {
    await this.driver.navigate().refresh();

    await expectedPage.waitForOrderDetails();
    await expectedPage.clickOrderId(orderId);
    await expectedPage.waitForOrderDetails();

    await this.clickTab("documentDetails");
    await this.driver.sleep(1500);
  }

  async selectNewStop() {
    await this.clickTab("documentDetails");

    const dropdown = await this.waitForVisible(
      By.css("#docDetails select[ng-model='documentStop']"),
      30000,
    );

    const existingStops = (await this.verifyProcessingSteps()).map((stop) =>
      stop.trim().toLowerCase(),
    );

    const select = new Select(dropdown);
    const options = await select.getOptions();
    const availableStops = [];

    for (const option of options) {
      const value = await option.getAttribute("value");
      const text = (await option.getText()).trim();

      if (
        value &&
        text &&
        !existingStops.includes(text.toLowerCase()) &&
        !/select|choose/i.test(text)
      ) {
        availableStops.push({ value, text });
      }
    }

    if (availableStops.length === 0) {
      throw new Error(
        `No new stop available. Existing stops: ${existingStops.join(", ")}`,
      );
    }

    // Choose a stop that is not already present.
    const selected = availableStops[0];

    await select.selectByValue(selected.value);
    await this.driver.sleep(2000);

    console.log("New stop selected:", selected.text);
    return selected.text;
  }

  // Open the Add Fees form.
  async clickAddFees() {
    await this.clickTab("documentDetails");

    const button = await this.waitForVisible(
      By.css("#docDetails [ng-click*='addFees']"),
      30000,
    );

    await button.click();
    await this.driver.sleep(1000);
  }

  // Select a fee type from the Add Fees dropdown.
  // Pass the exact visible option text you want to test.
  // async selectFeeType(feeType) {
  //   const dropdowns = await this.driver.findElements(
  //     By.css("#docDetails select")
  //   );

  //   for (const dropdown of dropdowns) {
  //     if (!(await dropdown.isDisplayed())) continue;

  //     const options = await dropdown.findElements(By.css("option"));
  //     const matchingOption = [];

  //     for (const option of options) {
  //       const text = (await option.getText()).trim();

  //       if (text.toLowerCase() === feeType.trim().toLowerCase()) {
  //         matchingOption.push(option);
  //       }
  //     }

  //     if (matchingOption.length) {
  //       const value = await matchingOption[0].getAttribute("value");

  //       if (!value) {
  //         throw new Error(`Fee type "${feeType}" has no selectable value.`);
  //       }

  //       await new Select(dropdown).selectByValue(value);
  //       await this.driver.sleep(1500);

  //       console.log("Selected fee type:", feeType);
  //       return feeType;
  //     }
  //   }

  //   throw new Error(
  //     `Fee type "${feeType}" was not found in the visible dropdowns.`
  //   );
  // }

  async selectFeeType(feeType) {
    await this.clickTab("documentDetails");

    // Custom autocomplete input shown in your DevTools screenshot.
    const feeInputLocator = By.css(
      "#docDetails input[placeholder='Select Fee']",
    );

    const feeInput = await this.waitForVisible(feeInputLocator, 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      feeInput,
    );

    await feeInput.click();
    await feeInput.clear();
    await feeInput.sendKeys(feeType);

    // Wait for the autocomplete suggestion list.
    const suggestionLocator = By.xpath(
      "//md-autocomplete-suggestions//li[" +
        "not(contains(@class,'ng-hide')) and " +
        "contains(@class,'md-autocomplete-suggestion')]",
    );

    await this.driver.wait(
      async () => {
        const suggestions = await this.driver.findElements(suggestionLocator);

        for (const suggestion of suggestions) {
          if (await suggestion.isDisplayed()) {
            const text = (await suggestion.getText()).trim();

            if (text.toLowerCase().includes(feeType.trim().toLowerCase())) {
              return true;
            }
          }
        }

        return false;
      },
      15000,
      `No autocomplete suggestion found for fee type: ${feeType}`,
    );

    const suggestions = await this.driver.findElements(suggestionLocator);

    let selected = false;

    for (const suggestion of suggestions) {
      if (!(await suggestion.isDisplayed())) continue;

      const text = (await suggestion.getText()).trim();

      if (text.toLowerCase().includes(feeType.trim().toLowerCase())) {
        await suggestion.click();
        selected = true;
        console.log("Selected fee type:", text);
        break;
      }
    }

    if (!selected) {
      throw new Error(
        `Could not select fee type "${feeType}" from autocomplete suggestions.`,
      );
    }

    // Wait for the fee amount to update.
    await this.driver
      .wait(async () => {
        const amountInputs = await this.driver.findElements(
          By.css("#docDetails input[ng-model='paymentDetail.feeAmount']"),
        );

        for (const input of amountInputs) {
          if (await input.isDisplayed()) {
            const value = await input.getAttribute("value");

            if (value && Number(value) > 0) {
              return true;
            }
          }
        }

        return false;
      }, 15000)
      .catch(() => {
        console.log(
          "Fee amount did not become greater than zero; verify whether this fee type has a zero price.",
        );
      });

    return true;
  }

  // Save the newly selected fee.
  async clickSavePrice() {
    const button = await this.waitForVisible(
      By.xpath(
        "//div[@id='docDetails']//button[" +
          "contains(@ng-click,'savePaymentDetails') and " +
          "contains(normalize-space(.),'Save Price')]",
      ),
      30000,
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.wait(until.elementIsEnabled(button), 15000);

    await button.click();
    await this.driver.sleep(2000);
  }

  // Read the visible fee rows in the Payment Due section.
  async getPaymentDueFeeRows() {
    return await this.driver.executeScript(() => {
      const rows = Array.from(
        document.querySelectorAll(
          "#docDetails [ng-repeat*='paymentDetail in paymentDetails']",
        ),
      );

      return rows
        .filter((row) => {
          const style = window.getComputedStyle(row);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .map((row) => row.innerText.replace(/\s+/g, " ").trim())
        .filter(Boolean);
    });
  }

  // Restore the original fees.
  // async clickRestoreFees() {
  //   const button = await this.waitForVisible(
  //     By.css("#docDetails [ng-click*='restoreFees']"),
  //     30000,
  //   );

  //   await this.driver.executeScript(
  //     "arguments[0].scrollIntoView({block:'center'});",
  //     button,
  //   );

  //   await button.click();
  //   await this.driver.sleep(2000);
  // }

  
async clickRestoreFees() {
  const spinner = By.css(
    ".loading-spiner-holder"
  );

  // Step 1: Wait for any active loading spinner to disappear.
  await this.driver.wait(async () => {
    const spinners = await this.driver.findElements(spinner);

    for (const element of spinners) {
      try {
        if (await element.isDisplayed()) {
          return false;
        }
      } catch (_) {
        // Element disappeared from the DOM.
      }
    }

    return true;
  }, 30000, "Loading spinner did not disappear before Restore Fee.");

  // Step 2: Locate Restore Fee after loading finishes.
  const button = await this.waitForVisible(
    By.css("#docDetails [ng-click*='restoreFees']"),
    30000
  );

  // Step 3: Scroll and wait for the button to become clickable.
  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    button
  );

  await this.driver.wait(
    until.elementIsEnabled(button),
    10000,
    "Restore Fee button is disabled."
  );

  // Step 4: Click Restore Fee.
  await button.click();

  // Step 5: Wait for loading to finish after restoring.
  await this.driver.wait(async () => {
    const spinners = await this.driver.findElements(spinner);

    for (const element of spinners) {
      try {
        if (await element.isDisplayed()) {
          return false;
        }
      } catch (_) {
        // Element disappeared from the DOM.
      }
    }

    return true;
  }, 30000, "Loading spinner did not disappear after Restore Fee.");

  console.log("✓ Restore Fee clicked and loading finished.");
}


  // Click Add Fees.
  async clickAddFees() {
    await this.clickTab("documentDetails");

    const button = await this.waitForVisible(
      By.css("#docDetails [ng-click*='addFees']"),
      30000,
    );

    await button.click();
    await this.driver.sleep(1000);
  }

  async selectFeeType(feeType = "POSTSCAN") {
    const normalizedFee = String(feeType).trim().toUpperCase();
    const expectedText = `${normalizedFee} (${normalizedFee})`;

    console.log("========== SELECT FEE TYPE ==========");
    console.log("Fee to select:", expectedText);

    // Step 1: Make sure Document Details is open.
    await this.clickTab("documentDetails");

    // Step 2: Find the fee input inside Document Details.
    const inputLocator = By.css("#docDetails input[placeholder='Select Fee']");

    const feeInput = await this.waitForVisibleElement(inputLocator, 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      feeInput,
    );

    await feeInput.click();
    await feeInput.clear();
    await feeInput.sendKeys(normalizedFee);

    console.log(`✓ Typed fee: ${normalizedFee}`);

    // Step 3: Find the visible exact option.
    const optionLocator = By.xpath(`//*[normalize-space(.)='${expectedText}']`);

    const option = await this.driver.wait(
      async () => {
        const elements = await this.driver.findElements(optionLocator);
        const matches = [];

        for (const element of elements) {
          try {
            if (!(await element.isDisplayed())) continue;

            const text = (await element.getText()).replace(/\s+/g, " ").trim();

            if (text !== expectedText) continue;

            const rect = await element.getRect();

            if (rect.width > 0 && rect.height > 0) {
              matches.push({
                element,
                area: rect.width * rect.height,
              });
            }
          } catch (_) {
            // Ignore elements removed during Angular re-rendering.
          }
        }

        matches.sort((a, b) => a.area - b.area);

        return matches.length ? matches[0].element : false;
      },
      20000,
      `Visible fee option "${expectedText}" was not found.`,
    );

    // Step 4: Click the option.
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      option,
    );

    try {
      await option.click();
    } catch (_) {
      await this.driver.executeScript("arguments[0].click();", option);
    }

    console.log(`✓ Clicked fee option: ${expectedText}`);

    // Step 5: Verify the input reflects the selected option.
    await this.driver.wait(
      async () => {
        try {
          const value = (await feeInput.getAttribute("value"))
            .replace(/\s+/g, " ")
            .trim();

          return value === expectedText;
        } catch (_) {
          return false;
        }
      },
      10000,
      `Fee input did not update to "${expectedText}".`,
    );

    console.log(`✓ Fee selected successfully: ${expectedText}`);

    return expectedText;
  }

  // Save the added fee.
  async clickSavePrice() {
    const button = await this.waitForVisible(
      By.xpath(
        "//div[@id='docDetails']//button[" +
          "contains(normalize-space(.),'Save Price')]",
      ),
      30000,
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.wait(until.elementIsEnabled(button), 15000);
    await button.click();
    await this.driver.sleep(2000);
  }

  // Read fee rows in Payment Due.
  async getPaymentDueFeeRows() {
    return await this.driver.executeScript(() => {
      const rows = Array.from(
        document.querySelectorAll(
          "#docDetails [ng-repeat*='paymentDetail in paymentDetails']",
        ),
      );

      return rows
        .filter((row) => {
          const style = getComputedStyle(row);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .map((row) => row.innerText.replace(/\s+/g, " ").trim())
        .filter(Boolean);
    });
  }

  // Restore the original fees.
  // async clickRestoreFees() {
  //   const button = await this.waitForVisible(
  //     By.css("#docDetails [ng-click*='restoreFees']"),
  //     30000,
  //   );

  //   await this.driver.executeScript(
  //     "arguments[0].scrollIntoView({block:'center'});",
  //     button,
  //   );

  //   await button.click();
  //   await this.driver.sleep(2000);
  // }

  async setPaymentPopupAmount(amount) {
    const popup = await this.waitForVisible(this.paymentLinkPopup, 30000);

    const amountInput = await popup.findElement(
      By.xpath(
        ".//label[contains(normalize-space(.),'Payment request amount')]" +
          "/ancestor::div[contains(@class,'row')][1]" +
          "//input[@ng-model='paymentRequest.paymentAmount']",
      ),
    );

    await amountInput.click();
    await amountInput.clear();
    await amountInput.sendKeys(String(amount));

    // Trigger Angular's input/change handling.
    await amountInput.sendKeys("\uE004"); // TAB

    await this.driver.sleep(500);

    return await this.getPaymentPopupAmount();
  }

  // async setMarkPaymentPopupAmount(amount) {
  //   const popup = await this.driver.wait(
  //     until.elementLocated(
  //       By.xpath(
  //         "//div[contains(@class,'modal')]" +
  //           "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]",
  //       ),
  //     ),
  //     30000,
  //   );

  //   const input = await popup.findElement(
  //     By.xpath(
  //       ".//input[contains(@ng-model,'paymentReceived.amountReceived')]",
  //     ),
  //   );

  //   await input.click();
  //   await input.clear();
  //   await input.sendKeys(String(amount));
  //   await input.sendKeys("\uE004"); // TAB

  //   await this.driver.wait(async () => {
  //     const value = await input.getAttribute("value");
  //     return Number(value) === Number(amount);
  //   }, 5000);

  //   return await this.getMarkPaymentPopupAmount();
  // }

  
async setMarkPaymentPopupAmount(amount) {
  const modalLocator = By.xpath(
    "//div[contains(@class,'modal') and contains(@class,'in')]" +
    "[.//input[contains(@ng-model,'paymentReceived.amountReceived')]]"
  );

  const modal = await this.driver.wait(
    async () => {
      const modals = await this.driver.findElements(modalLocator);

      for (let i = modals.length - 1; i >= 0; i--) {
        if (await modals[i].isDisplayed()) {
          return modals[i];
        }
      }

      return false;
    },
    15000,
    "Visible Mark Payment modal was not found"
  );

  const amountInput = await modal.findElement(
    By.css("input[ng-model='paymentReceived.amountReceived']")
  );

  await this.driver.wait(until.elementIsVisible(amountInput), 10000);
  await this.driver.wait(until.elementIsEnabled(amountInput), 10000);

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    amountInput
  );

  await amountInput.click();
  await amountInput.sendKeys(
    require("selenium-webdriver").Key.CONTROL,
    "a"
  );
  await amountInput.sendKeys(String(amount));

  await this.driver.wait(async () => {
    const value = await amountInput.getAttribute("value");
    return Number(value) === Number(amount);
  }, 5000, "Payment amount was not entered correctly");
}


  
  // Get a fee row by its displayed fee type.
  async getFeeRow(feeType) {
    await this.clickTab("documentDetails");

    const rows = await this.driver.findElements(
      By.css("#docDetails [ng-repeat*='paymentDetail in paymentDetails']")
    );

    for (const row of rows) {
      try {
        if (!(await row.isDisplayed())) continue;

        const name = await row.findElement(
          By.css("h5.ng-binding")
        ).getText();

        if (
          name.replace(/\s+/g, " ").trim().toLowerCase() ===
          feeType.replace(/\s+/g, " ").trim().toLowerCase()
        ) {
          return row;
        }
      } catch (_) {
        // Ignore rows that are being re-rendered by Angular.
      }
    }

    throw new Error(`Fee row "${feeType}" was not found.`);
  }

  // Read the current total amount.
  async getFeeTableTotalAmount() {
    return await this.getPaymentAmount();
  }

  // Edit a fee row and enter a new unit price.

  
// async editFeeAmount(feeType, newAmount) {
//   const row = await this.getFeeRow(feeType);

//   // Step 1: Click the Edit icon.
//   const editIcon = await row.findElement(
//     By.css("i[ng-click*='editFee']")
//   );

//   await this.driver.executeScript(
//     "arguments[0].scrollIntoView({block:'center'});",
//     editIcon
//   );

//   await editIcon.click();

//   // Step 2: Find the editable fee amount input.
//   const input = await this.driver.wait(async () => {
//     const inputs = await row.findElements(
//       By.css("input[ng-model='paymentDetail.feeAmount']")
//     );

//     for (const element of inputs) {
//       if (await element.isDisplayed()) {
//         return element;
//       }
//     }

//     return false;
//   }, 10000, `Editable amount input not found for "${feeType}".`);

//   // Step 3: Change the unit price.
//   await input.clear();
//   await input.sendKeys(String(newAmount));
//   await input.sendKeys("\uE004"); // TAB

//   await this.driver.wait(async () => {
//     try {
//       return Number(await input.getAttribute("value")) === Number(newAmount);
//     } catch (_) {
//       return false;
//     }
//   }, 5000, "Updated fee amount was not entered correctly.");

//   // Step 4: Click the green checkmark to commit the edited fee.
//   const confirmEdit = await row.findElement(
//     By.css("i[ng-click*='addEditedFee']")
//   );

//   await this.driver.executeScript(
//     "arguments[0].scrollIntoView({block:'center'});",
//     confirmEdit
//   );

//   try {
//     await confirmEdit.click();
//   } catch (_) {
//     await this.driver.executeScript(
//       "arguments[0].click();",
//       confirmEdit
//     );
//   }

//   // Step 5: Wait until edit mode closes.
//   await this.driver.wait(async () => {
//     try {
//       const inputs = await row.findElements(
//         By.css("input[ng-model='paymentDetail.feeAmount']")
//       );

//       for (const element of inputs) {
//         if (await element.isDisplayed()) {
//           return false;
//         }
//       }

//       return true;
//     } catch (_) {
//       return true;
//     }
//   }, 10000, `Edited fee "${feeType}" was not committed.`);

//   console.log(
//     `✓ Fee "${feeType}" updated to ${Number(newAmount).toFixed(2)}`
//   );

//   return Number(newAmount);
  // }
  
  
async editFeeAmount(/* keep your existing parameters here */) {
  await this.waitForLoadingSpinnerToDisappear();

  // Do not click through a modal left open by an earlier test.
  const visibleModals = await this.driver.findElements(
    By.css(".modal.in")
  );

  for (const modal of visibleModals) {
    if (await modal.isDisplayed()) {
      throw new Error(
        "A modal is still open. Close it before editing the fee."
      );
    }
  }

  const editFeeIcon = await this.waitForVisible(
    By.css(
      "#docDetails i[title='Edit Fee']"
    ),
    15000
  );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    editFeeIcon
  );

  await this.waitForLoadingSpinnerToDisappear();
  await editFeeIcon.click();

  // Keep the remainder of your existing edit-fee logic here.
}



  // Delete a fee row.
  async deleteFeeRow(feeType) {
    const row = await this.getFeeRow(feeType);

    const deleteIcon = await row.findElement(
      By.css("i[ng-click*='deleteFee']")
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      deleteIcon
    );

    await deleteIcon.click();
    await this.driver.sleep(1000);
  }

  // Check whether a fee row is still displayed.
  async isFeeRowPresent(feeType) {
    const rows = await this.driver.findElements(
      By.css("#docDetails [ng-repeat*='paymentDetail in paymentDetails']")
    );

    for (const row of rows) {
      try {
        if (!(await row.isDisplayed())) continue;

        const name = await row.findElement(
          By.css("h5.ng-binding")
        ).getText();

        if (
          name.replace(/\s+/g, " ").trim().toLowerCase() ===
          feeType.replace(/\s+/g, " ").trim().toLowerCase()
        ) {
          return true;
        }
      } catch (_) {}
    }

    return false;
  }

  
  // Select any available fee row dynamically.
  async getAnyAvailableFeeType() {
    await this.clickTab("documentDetails");

    const rows = await this.driver.findElements(
      By.css("#docDetails [ng-repeat*='paymentDetail in paymentDetails']")
    );

    for (const row of rows) {
      try {
        if (!(await row.isDisplayed())) continue;

        const feeTypeElement = await row.findElement(
          By.css("h5.ng-binding")
        );

        const feeType = (await feeTypeElement.getText())
          .replace(/\s+/g, " ")
          .trim();

        const editIcons = await row.findElements(
          By.css("i[ng-click*='editFee']")
        );

        const deleteIcons = await row.findElements(
          By.css("i[ng-click*='deleteFee']")
        );

        if (
          feeType &&
          editIcons.length > 0 &&
          deleteIcons.length > 0 &&
          await editIcons[0].isDisplayed() &&
          await deleteIcons[0].isDisplayed()
        ) {
          console.log("Dynamically selected fee type:", feeType);
          return feeType;
        }
      } catch (_) {
        // Ignore hidden or unavailable rows.
      }
    }

    throw new Error(
      "No available fee row with Edit and Delete buttons was found."
    );
  }

  
  // ==========================================
  // SPLIT DOCUMENT METHODS
  // ==========================================

  // async clickSplitDocument() {
  //   const splitButton = await this.waitForVisible(
  //     By.xpath("//button[@title='Split Document' or normalize-space(.)='Split']"),
  //     30000
  //   );

  //   await this.driver.executeScript(
  //     "arguments[0].scrollIntoView({block:'center'});",
  //     splitButton
  //   );

  //   await this.driver.wait(until.elementIsEnabled(splitButton), 10000);
  //   await splitButton.click();
  // }

  
async clickSplitDocument() {
  const splitButtonLocator = By.xpath(
    "//button[@title='Split Document' or normalize-space(.)='Split']"
  );

  // Wait for any previous page operation to finish.
  await this.waitForLoadingSpinnerToDisappear(60000);

  // Locate and wait for the Split button to be visible.
  let splitButton = await this.waitForVisible(
    splitButtonLocator,
    60000
  );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    splitButton
  );

  // Wait until the button is enabled and the spinner is absent.
  await this.driver.wait(async () => {
    const spinners = await this.driver.findElements(
      By.css(".loading-spiner-holder")
    );

    for (const spinner of spinners) {
      if (await spinner.isDisplayed()) {
        return false;
      }
    }

    try {
      splitButton = await this.driver.findElement(
        splitButtonLocator
      );

      return (
        await splitButton.isDisplayed() &&
        await splitButton.isEnabled()
      );
    } catch (_) {
      return false;
    }
  }, 60000, "Split button is not ready to click.");

  // Recheck the spinner immediately before clicking.
  await this.waitForLoadingSpinnerToDisappear(60000);

  splitButton = await this.driver.findElement(
    splitButtonLocator
  );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    splitButton
  );

  await splitButton.click();

  // Wait until the Split confirmation popup appears.
  await this.waitForVisible(
    By.css(".modal-content"),
    30000
  );

  console.log("✓ Split button clicked and confirmation popup opened.");
}


  async getSplitPopupDocId() {
    const heading = await this.waitForVisible(
      By.xpath(
        "//div[contains(@class,'modal-header')]//h3[contains(.,'split the document')]"
      ),
      15000
    );

    const headingText = await heading.getText();
    const match = headingText.match(/document\s+(\d+)/i);

    if (!match) {
      throw new Error("Doc ID was not found in the Split popup heading.");
    }

    return match[1];
  }

  
async getSplitDocumentCount() {
  const countInput = await this.waitForVisible(
    By.css("input[ng-model='splitCount']"),
    30000
  );

  return await countInput.getAttribute("value");
}



async confirmSplitDocument() {
  const yesButton = await this.waitForVisible(
    By.css(".modal-content .modal-footer button[ng-click='ok()']"),
    30000
  );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    yesButton
  );

  await this.driver.wait(
    until.elementIsEnabled(yesButton),
    10000
  );

  await yesButton.click();

  // Wait until the Split popup closes.
  await this.driver.wait(async () => {
    const modals = await this.driver.findElements(
      By.css(".modal-content")
    );

    for (const modal of modals) {
      try {
        if (await modal.isDisplayed()) {
          const text = (await modal.getText()).toLowerCase();

          if (text.includes("split document into")) {
            return false;
          }
        }
      } catch (error) {}
    }

    return true;
  }, 30000, "Split popup did not close after clicking Yes.");
}


  async searchOrderIdInFilterAnything(orderId) {
    const filterInput = await this.waitForVisible(
      By.css("input[placeholder='Filter Anything']"),
      30000
    );

    await filterInput.clear();
    await filterInput.sendKeys(String(orderId));
  }

 
async getDocumentsByOrderId(orderId) {
  const rows = await this.driver.findElements(
    By.css("table.process-table tbody tr")
  );

  const documents = [];

  for (const row of rows) {
    try {
      if (!(await row.isDisplayed())) continue;

      const cells = await row.findElements(By.css("td"));
      if (cells.length < 3) continue;

      const cellTexts = [];

      for (const cell of cells) {
        cellTexts.push(
          (await cell.getText()).replace(/\s+/g, " ").trim()
        );
      }

      // Identify the Order ID cell by its exact text.
      const orderIndex = cellTexts.findIndex(
        text => text === String(orderId).trim()
      );

      if (orderIndex === -1) continue;

      // Doc ID is the cell immediately after Order ID.
      const docId = cellTexts[orderIndex + 1];

      if (/^\d+$/.test(docId)) {
        documents.push({
          orderId: cellTexts[orderIndex],
          docId
        });
      }
    } catch (error) {
      // Ignore rows that are being re-rendered by Angular.
    }
  }

  return documents;
}


  
async waitForSplitDocuments(orderId, timeout = 60000) {
  return await this.driver.wait(async () => {
    const documents = await this.getDocumentsByOrderId(orderId);

    console.log("Visible documents in left table:", documents);

    const uniqueDocIds = [
      ...new Set(documents.map(document => document.docId))
    ];

    if (
      documents.length >= 2 &&
      uniqueDocIds.length >= 2
    ) {
      return documents;
    }

    return false;
  }, timeout, "Two documents with different Doc IDs were not displayed.");
}

  
async waitForLoadingSpinnerToDisappear(timeout = 60000) {
  const spinner = By.css(".loading-spiner-holder");

  await this.driver.wait(async () => {
    const spinners = await this.driver.findElements(spinner);

    for (const element of spinners) {
      if (await element.isDisplayed()) {
        return false;
      }
    }

    return true;
  }, timeout, "Loading spinner did not disappear");
}

  async waitForLoadingToFinish(timeout = 60000) {
  const spinner = By.css(".loading-spiner-holder");

  await this.driver.wait(async () => {
    const spinners = await this.driver.findElements(spinner);

    for (const element of spinners) {
      if (await element.isDisplayed()) {
        return false;
      }
    }

    return true;
  }, timeout, "Loading spinner did not disappear");

  await this.driver.wait(
    until.elementIsVisible(
      await this.driver.findElement(By.css("#docDetails"))
    ),
    timeout
  ).catch(() => {});
}

  async waitForFeeTotalToUpdate(previousTotal, timeout = 30000) {
  await this.waitForLoadingToFinish();

  await this.driver.wait(async () => {
    const currentTotal = await this.getFeeTableTotalAmount();

    return Number.isFinite(currentTotal) &&
      Math.abs(currentTotal - previousTotal) > 0.001;
  }, timeout, "Fee Total Amount did not update after saving");

  return this.getFeeTableTotalAmount();
}


}

module.exports = ExpectedDetailsPage;
