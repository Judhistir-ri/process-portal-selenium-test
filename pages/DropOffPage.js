const { By, until } = require("selenium-webdriver");

class DropOffPage {
  constructor(driver) {
    this.driver = driver;

    // ==============================
    // URL
    // ==============================

    this.dropOffUrl = "https://wcsstestclient.azurewebsites.net/p/dropoff";

    // ==============================
    // Common Locators
    // ==============================

    this.filterAnything = By.css("input[placeholder='Filter Anything']");

    this.dropOffQueueTable = By.css("#dropTable");

    this.loadingSpinner = By.css(
      ".loading-spiner-holder.theme-loading-spiner-holder",
    );

    // ==============================
    // DropOff Queue
    // ==============================

    this.getOrderIdCell = (orderId) =>
      By.xpath(
        `//table[@id='dropTable']//tbody//tr` +
          `[.//td[@title='${orderId}']]` +
          `//td[@title='${orderId}']`,
      );

    this.getOrderCheckbox = (orderId) =>
      By.xpath(
        `//table[@id='dropTable']//tbody//tr` +
          `[.//td[@title='${orderId}']]` +
          `//input[@type='checkbox']`,
      );

    // ==============================
    // Courier Button
    // ==============================

    this.courierButton = By.xpath(
      "//table[@id='dropTable']" +
        "/ancestor::div[contains(@class,'col-md-4')][1]" +
        "//button[contains(@class,'btn-info')]" +
        "[contains(normalize-space(.),'Courier')]",
    );

    // ==============================
    // Refresh Button
    // ==============================

    this.refreshButton = By.xpath(
      "//button[@ng-click='refresh()' and " +
        ".//i[contains(@class,'fa-refresh')]]",
    );

    // ==============================
    // Courier Table
    // ==============================

    // Courier is a process-table.
    // The DropOff table has id="dropTable",
    // so exclude it here.

    this.courierTable = By.xpath(
      "//table[contains(@class,'process-table') and " + "not(@id='dropTable')]",
    );

    // ==============================
    // Courier Order Row
    // ==============================

    this.getCourierOrderRow = (orderId) =>
      By.xpath(
        `//table[contains(@class,'process-table') and ` +
          `not(@id='dropTable')]` +
          `//tbody//tr[` +
          `.//td[@title='${orderId}' or ` +
          `normalize-space()='${orderId}']` +
          `]`,
      );

    // ==============================
    // Courier Checkbox
    // ==============================

    // This checkbox is ONLY from the
    // Courier process-table row.

    this.getCourierOrderCheckbox = (orderId) =>
      By.xpath(
        `//table[contains(@class,'process-table') and ` +
          `not(@id='dropTable')]` +
          `//tbody//tr[` +
          `.//td[@title='${orderId}' or ` +
          `normalize-space()='${orderId}']` +
          `]//input[@type='checkbox']`,
      );

    // ==============================
    // Courier Complete Button
    // ==============================

    // Find Complete in the same container
    // as the Courier process-table.

    this.completeButton = By.xpath(
      "//table[contains(@class,'process-table') and " +
        "not(@id='dropTable')]" +
        "/ancestor::div[contains(@class,'col-md-4')][1]" +
        "//button[contains(@class,'btn-info')]" +
        "[contains(normalize-space(.),'Complete')]",
    );

    // ==============================
    // Shipping Label Popup
    // ==============================

    this.generateShippingLabel = By.xpath(
      "//*[contains(normalize-space(.),'Generate Shipping Label')]",
    );

    // ==============================
    // OUTGOING TRACKING ID
    // ==============================

    this.outgoingTrackingInput = By.xpath(
      "//div[contains(@class,'modal-dialog')" +
        " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
        "//tr[.//label[normalize-space()='Outgoing']]" +
        "//input[@ng-model='outSideGeneratedLabel.trackCardNumber']",
    );

    // ==============================
    // OUTGOING COURIER
    // ==============================

    this.outgoingCourierDropdown = By.xpath(
      "//div[contains(@class,'modal-dialog')" +
        " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
        "//tr[.//label[normalize-space()='Outgoing']]" +
        "//select[@ng-model='outSideGeneratedLabel.courier']",
    );

    // ==============================
    // INCOMING TRACKING ID
    // ==============================

    this.incomingTrackingInput = By.xpath(
      "//div[contains(@class,'modal-dialog')" +
        " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
        "//tr[.//label[normalize-space()='Incoming']]" +
        "//input[@ng-model='incomingLabel.trackCardNumber']",
    );

    // ==============================
    // INCOMING COURIER
    // ==============================

    this.incomingCourierDropdown = By.xpath(
      "//div[contains(@class,'modal-dialog')" +
        " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
        "//tr[.//label[normalize-space()='Incoming']]" +
        "//select[@ng-model='incomingLabel.courier']",
    );

    // ==============================
    // SAVE & COMPLETE
    // ==============================

    this.saveAndCompleteButton = By.xpath(
      "//div[contains(@class,'modal-dialog')" +
        " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
        "//button[contains(normalize-space(.),'Save & Complete')]",
    );
  }

  // ============================================================
  // Wait for WCS Loading
  // ============================================================

  async waitForLoadingToFinish() {
    await this.driver.wait(async () => {
      try {
        return await this.driver.executeScript(() => {
          const selectors = [
            ".loading-spiner-holder.theme-loading-spiner-holder",
            ".loading",
            ".loader",
            ".spinner",
            ".loading-spinner",
            ".preloader",
            "i.fa.fa-spin.fa-spinner",
          ];

          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);

            for (const element of elements) {
              const style = window.getComputedStyle(element);

              const visible =
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                style.opacity !== "0" &&
                element.offsetWidth > 0 &&
                element.offsetHeight > 0;

              if (visible) {
                return false;
              }
            }
          }

          return true;
        });
      } catch (error) {
        return false;
      }
    }, 120000);
  }

  // ============================================================
  // Open DropOff
  // ============================================================

  async open() {
    await this.driver.get(this.dropOffUrl);
    await this.waitForPage();
  }

  // ============================================================
  // Wait for DropOff Page
  // ============================================================

  async waitForPage() {
    await this.driver.wait(until.urlContains("/p/dropoff"), 120000);

    await this.driver.wait(until.elementLocated(this.filterAnything), 60000);

    await this.driver.wait(until.elementLocated(this.dropOffQueueTable), 60000);

    await this.waitForLoadingToFinish();

    await this.driver.sleep(3000);
  }

  // ============================================================
  // Search Order in DropOff
  // ============================================================

  async searchOrder(orderId) {
    await this.waitForLoadingToFinish();

    const searchBox = await this.driver.wait(
      until.elementLocated(this.filterAnything),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(searchBox), 30000);

    await searchBox.clear();

    await searchBox.sendKeys(String(orderId));

    await this.driver.sleep(3000);

    await this.waitForLoadingToFinish();

    await this.waitForOrderInDropOff(orderId);
  }

  // ============================================================
  // Wait for Order in DropOff
  // ============================================================

  async waitForOrderInDropOff(orderId) {
    const locator = this.getOrderIdCell(orderId);

    const element = await this.driver.wait(
      until.elementLocated(locator),
      120000,
    );

    await this.driver.wait(until.elementIsVisible(element), 30000);

    return element;
  }

  // ============================================================
  // Verify Order ID in DropOff
  // ============================================================

  async verifyOrderId(orderId) {
    const element = await this.waitForOrderInDropOff(orderId);

    const actual = (await element.getText()).trim();

    if (actual !== String(orderId)) {
      throw new Error(`Expected Order ID ${orderId}, but found ${actual}.`);
    }

    return true;
  }

  // ============================================================
  // Verify Stop in DropOff
  // ============================================================

  async verifyStop(orderId) {
    const rowLocator = By.xpath(
      `//table[@id='dropTable']//tbody//tr` + `[.//td[@title='${orderId}']]`,
    );

    const row = await this.driver.wait(until.elementLocated(rowLocator), 60000);

    await this.driver.wait(until.elementIsVisible(row), 30000);

    await this.waitForLoadingToFinish();

    const cells = await row.findElements(By.css("td"));

    if (cells.length === 0) {
      throw new Error(`No cells found for Order ID ${orderId}.`);
    }

    const stopCell = cells[cells.length - 1];

    const stop = (await stopCell.getText()).trim();

    if (!stop) {
      throw new Error(`Stop is empty for Order ID ${orderId}.`);
    }

    console.log(`Drop Off Stop: ${stop}`);

    return stop;
  }

  // ============================================================
  // Select DropOff Order
  // ============================================================

  async selectOrder(orderId) {
    await this.waitForLoadingToFinish();

    const checkbox = await this.driver.wait(
      until.elementLocated(this.getOrderCheckbox(orderId)),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(checkbox), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      checkbox,
    );

    await this.driver.sleep(1000);

    if (!(await checkbox.isSelected())) {
      try {
        await checkbox.click();
      } catch (error) {
        await this.driver.executeScript("arguments[0].click();", checkbox);
      }
    }

    await this.driver.sleep(2000);

    await this.waitForLoadingToFinish();
  }

  // ============================================================
  // Wait for Courier Button
  // ============================================================

  async waitForCourierButton() {
    await this.waitForLoadingToFinish();

    const button = await this.driver.wait(
      until.elementLocated(this.courierButton),
      120000,
    );

    await this.driver.wait(until.elementIsVisible(button), 60000);

    await this.driver.wait(until.elementIsEnabled(button), 60000);

    return button;
  }

  // ============================================================
  // Click Courier
  // ============================================================

  async clickCourier() {
    const button = await this.waitForCourierButton();

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.sleep(1000);

    try {
      await button.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", button);
    }
  }

  // ============================================================
  // Wait for Courier Checkbox
  //
  // FLOW:
  //
  // Click Courier
  //      ↓
  // Wait 5 seconds
  //      ↓
  // Click Refresh
  //      ↓
  // Wait 5 seconds
  //      ↓
  // Find Courier checkbox
  //      ↓
  // Select Courier checkbox
  //
  // NO ORDER ID VERIFICATION
  // ============================================================

  async waitForCourierCheckbox(orderId) {
    // Wait exactly 5 seconds after Courier
    await this.driver.sleep(5000);

    // ==========================================
    // Refresh
    // ==========================================

    const refreshButton = await this.driver.wait(
      until.elementLocated(this.refreshButton),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(refreshButton), 30000);

    await this.driver.wait(until.elementIsEnabled(refreshButton), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      refreshButton,
    );

    try {
      await refreshButton.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", refreshButton);
    }

    console.log(`Refresh clicked for Courier. Order ID: ${orderId}`);

    // ==========================================
    // Wait exactly 5 seconds after Refresh
    // ==========================================

    await this.driver.sleep(5000);

    await this.waitForLoadingToFinish();

    // ==========================================
    // Find Courier checkbox
    // ==========================================

    const checkbox = await this.driver.wait(
      until.elementLocated(this.getCourierOrderCheckbox(orderId)),
      120000,
    );

    await this.driver.wait(until.elementIsVisible(checkbox), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      checkbox,
    );

    await this.driver.sleep(1000);

    // ==========================================
    // Select Courier checkbox
    // ==========================================

    if (!(await checkbox.isSelected())) {
      try {
        await checkbox.click();
      } catch (error) {
        await this.driver.executeScript("arguments[0].click();", checkbox);
      }
    }

    await this.driver.sleep(2000);

    await this.waitForLoadingToFinish();

    return true;
  }

  // ============================================================
  // Select Courier Order
  //
  // This method can still be used independently if needed.
  // ============================================================

  async selectCourierOrder(orderId) {
    await this.waitForLoadingToFinish();

    const checkbox = await this.driver.wait(
      until.elementLocated(this.getCourierOrderCheckbox(orderId)),
      120000,
    );

    await this.driver.wait(until.elementIsVisible(checkbox), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      checkbox,
    );

    await this.driver.sleep(1000);

    if (!(await checkbox.isSelected())) {
      try {
        await checkbox.click();
      } catch (error) {
        await this.driver.executeScript("arguments[0].click();", checkbox);
      }
    }

    await this.driver.sleep(2000);

    await this.waitForLoadingToFinish();

    return true;
  }

  // ============================================================
  // Wait for Courier Complete Button
  // ============================================================

  async waitForCompleteButton() {
    await this.waitForLoadingToFinish();

    const button = await this.driver.wait(
      until.elementLocated(this.completeButton),
      120000,
    );

    await this.driver.wait(until.elementIsVisible(button), 60000);

    await this.driver.wait(until.elementIsEnabled(button), 60000);

    return button;
  }

  // ============================================================
  // Click Courier Complete
  // ============================================================

  async clickComplete() {
    const button = await this.waitForCompleteButton();

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await this.driver.sleep(1500);

    try {
      await button.click();
    } catch (error) {
      await this.driver.sleep(2000);

      const freshButton = await this.driver.wait(
        until.elementLocated(this.completeButton),
        60000,
      );

      await this.driver.wait(until.elementIsVisible(freshButton), 30000);

      await this.driver.wait(until.elementIsEnabled(freshButton), 30000);

      await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        freshButton,
      );

      await this.driver.sleep(1000);

      try {
        await freshButton.click();
      } catch (secondError) {
        await this.driver.executeScript("arguments[0].click();", freshButton);
      }
    }

    await this.driver.sleep(5000);
  }

  // ============================================================
  // Wait for Generate Shipping Label
  // ============================================================

  async waitForShippingLabelPopup() {
    const popup = await this.driver.wait(
      until.elementLocated(this.generateShippingLabel),
      120000,
    );

    await this.driver.wait(until.elementIsVisible(popup), 60000);

    await this.driver.sleep(2000);
  }

  // ============================================================
  // Verify Shipping Label Order ID + Doc ID
  // ============================================================

  async verifyShippingLabelDetails(orderId, docId) {
    await this.waitForShippingLabelPopup();

    await this.driver.wait(async () => {
      try {
        const pageText = String(
          await this.driver.executeScript(
            "return document.body.innerText || '';",
          ),
        )
          .replace(/\s+/g, " ")
          .toLowerCase();

        return (
          pageText.includes(String(orderId).toLowerCase()) &&
          pageText.includes(String(docId).toLowerCase())
        );
      } catch (error) {
        return false;
      }
    }, 120000);

    return true;
  }

  async processCourier(orderId, docId) {
    // ==========================================
    // Click Courier Complete
    // ==========================================

    await this.clickComplete();

    // ==========================================
    // Wait for Generate Shipping Label popup
    // ==========================================

    await this.waitForShippingLabelPopup();

    // ==========================================
    // Verify Order ID + Doc ID
    // ==========================================

    await this.verifyShippingLabelDetails(orderId, docId);

    // ==========================================
    // Generate Tracking IDs
    // ==========================================

    const timestamp = Date.now().toString().slice(-8);

    const outgoingTrackingId = `OUT${orderId}${timestamp}`;

    const incomingTrackingId = `IN${orderId}${timestamp}`;

    // ==========================================
    // OUTGOING TRACKING ID
    // ==========================================

    const outgoingInput = await this.driver.wait(
      until.elementLocated(this.outgoingTrackingInput),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(outgoingInput), 30000);

    await this.driver.executeScript(
      `
        const input = arguments[0];
        const value = arguments[1];

        const setter =
            Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value'
            ).set;

        setter.call(input, value);

        input.dispatchEvent(
            new Event('input', { bubbles: true })
        );

        input.dispatchEvent(
            new Event('change', { bubbles: true })
        );

        input.dispatchEvent(
            new Event('blur', { bubbles: true })
        );
        `,
      outgoingInput,
      outgoingTrackingId,
    );

    // ==========================================
    // INCOMING TRACKING ID
    // ==========================================

    const incomingInput = await this.driver.wait(
      until.elementLocated(this.incomingTrackingInput),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(incomingInput), 30000);

    await this.driver.executeScript(
      `
        const input = arguments[0];
        const value = arguments[1];

        const setter =
            Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value'
            ).set;

        setter.call(input, value);

        input.dispatchEvent(
            new Event('input', { bubbles: true })
        );

        input.dispatchEvent(
            new Event('change', { bubbles: true })
        );

        input.dispatchEvent(
            new Event('blur', { bubbles: true })
        );
        `,
      incomingInput,
      incomingTrackingId,
    );

    // ==========================================
    // OUTGOING COURIER
    // ==========================================

    const outgoingCourier = await this.driver.wait(
      until.elementLocated(this.outgoingCourierDropdown),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(outgoingCourier), 30000);

    const selectedOutgoingCourier =
      await this.selectRandomCourier(outgoingCourier);

    // ==========================================
    // INCOMING COURIER
    // ==========================================

    const incomingCourier = await this.driver.wait(
      until.elementLocated(this.incomingCourierDropdown),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(incomingCourier), 30000);

    const selectedIncomingCourier =
      await this.selectRandomCourier(incomingCourier);

    // ==========================================
    // VERIFY OUTGOING TRACKING ID
    // ==========================================

    const actualOutgoingTrackingId = await outgoingInput.getAttribute("value");

    if (actualOutgoingTrackingId !== outgoingTrackingId) {
      throw new Error(
        `Outgoing Tracking ID verification failed. ` +
          `Expected: ${outgoingTrackingId}, ` +
          `Actual: ${actualOutgoingTrackingId}`,
      );
    }

    // ==========================================
    // VERIFY INCOMING TRACKING ID
    // ==========================================

    const actualIncomingTrackingId = await incomingInput.getAttribute("value");

    if (actualIncomingTrackingId !== incomingTrackingId) {
      throw new Error(
        `Incoming Tracking ID verification failed. ` +
          `Expected: ${incomingTrackingId}, ` +
          `Actual: ${actualIncomingTrackingId}`,
      );
    }

    // ==========================================
    // VERIFY OUTGOING COURIER
    // ==========================================

    const actualOutgoingCourier = await this.driver.executeScript(
      `
            const select = arguments[0];

            return select.options[
                select.selectedIndex
            ]
                ? select.options[
                    select.selectedIndex
                  ].textContent.trim()
                : "";
            `,
      outgoingCourier,
    );

    if (actualOutgoingCourier !== selectedOutgoingCourier) {
      throw new Error(
        `Outgoing Courier verification failed. ` +
          `Expected: ${selectedOutgoingCourier}, ` +
          `Actual: ${actualOutgoingCourier}`,
      );
    }

    // ==========================================
    // VERIFY INCOMING COURIER
    // ==========================================

    const actualIncomingCourier = await this.driver.executeScript(
      `
            const select = arguments[0];

            return select.options[
                select.selectedIndex
            ]
                ? select.options[
                    select.selectedIndex
                  ].textContent.trim()
                : "";
            `,
      incomingCourier,
    );

    if (actualIncomingCourier !== selectedIncomingCourier) {
      throw new Error(
        `Incoming Courier verification failed. ` +
          `Expected: ${selectedIncomingCourier}, ` +
          `Actual: ${actualIncomingCourier}`,
      );
    }

    // ==========================================
    // SAVE & COMPLETE
    // ==========================================

    const saveButton = await this.driver.wait(
      until.elementLocated(this.saveAndCompleteButton),
      60000,
    );

    await this.driver.wait(until.elementIsVisible(saveButton), 30000);

    await this.driver.wait(until.elementIsEnabled(saveButton), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      saveButton,
    );

    await this.driver.sleep(1000);

    try {
      await saveButton.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", saveButton);
    }

    await this.driver.sleep(10000);

    await this.waitForLoadingToFinish();

    return {
      outgoingTrackingId,
      incomingTrackingId,
      outgoingCourier: selectedOutgoingCourier,
      incomingCourier: selectedIncomingCourier,
    };
  }

  async selectRandomCourier(selectElement) {
    const options = await selectElement.findElements(By.css("option"));

    const validOptions = [];

    for (const option of options) {
      const value = await option.getAttribute("value");

      const text = (await option.getText()).trim();

      if (value && value !== "?" && text && text.toLowerCase() !== "select") {
        validOptions.push({
          value,
          text,
        });
      }
    }

    if (validOptions.length === 0) {
      throw new Error("No valid Courier options found.");
    }

    const randomIndex = Math.floor(Math.random() * validOptions.length);

    const selectedCourier = validOptions[randomIndex];

    await this.driver.executeScript(
      `
        const select = arguments[0];
        const value = arguments[1];

        const setter =
            Object.getOwnPropertyDescriptor(
                HTMLSelectElement.prototype,
                'value'
            ).set;

        setter.call(select, value);

        select.dispatchEvent(
            new Event('input', { bubbles: true })
        );

        select.dispatchEvent(
            new Event('change', { bubbles: true })
        );

        select.dispatchEvent(
            new Event('blur', { bubbles: true })
        );
        `,
      selectElement,
      selectedCourier.value,
    );

    await this.driver.sleep(1000);

    const actualValue = await selectElement.getAttribute("value");

    if (actualValue !== selectedCourier.value) {
      throw new Error(
        `Courier selection failed. ` +
          `Expected value: ${selectedCourier.value}, ` +
          `Actual value: ${actualValue}`,
      );
    }

    return selectedCourier.text;
  }
}

module.exports = DropOffPage;
