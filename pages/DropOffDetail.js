const { By, until, Select } = require("selenium-webdriver");

class DropOffDetail {
  constructor(driver) {
    this.driver = driver;
    this.url = "https://wcsstestclient.azurewebsites.net/p/dropoff";

    // ==================== DropOff Queue ====================
    this.dropOffQueueTable = By.css("#dropTable");

    this.exportDropOffQueueButton = By.xpath(
      "//button[@title='Export' and contains(@ng-click,'filteredDropOffDocuments')]",
    );

    this.printDropOffQueueDocsButton = By.xpath(
      "//a[contains(@ng-click,\"printD('DROP')\") " +
        "and normalize-space()='Print Docs']",
    );

    // ==================== Courier ====================
    this.courierBox = By.css(".col-md-4.courier");

    this.exportCourierButton = By.xpath(
      "//div[contains(@class,'col-md-4') and contains(@class,'courier')]" +
        "//button[@title='Export' and " +
        "contains(@ng-click,'filteredCourierDocuments')]",
    );

    this.courierPrintDropdown = By.css(
      ".col-md-4.courier select[ng-model='print']",
    );

    // ==================== Completed ====================
    this.completedBox = By.css(".col-md-4.completed-docs");

    this.exportCompletedButton = By.xpath(
      "//div[contains(@class,'completed-docs')]//button[@title='Export' and contains(@ng-click,'completed')]",
    );

    this.printCompletedDocsButton = By.xpath(
      "//div[contains(@class,'completed-docs')]//a[contains(@ng-click,\"printD('COMP')\") and normalize-space()='Print Docs']",
    );

    // this.completedNoDocumentsMessage = By.css(
    //   "#toast-container .toast-error .toast-message",
    // );

    // ==================== Document Filter ====================
//     this.documentFilterDropdown = By.css(
//   'select[ng-options*="quickFilter.caption"][ng-change*="applyFilter"]'
//       );

      this.documentFilterDropdown = By.css(
    'select[ng-options*="quickFilter.caption"]'
      );
      
      

    // ==================== DropOff Queue ====================

this.dropOffQueueTotal = By.xpath(
  "//div[@ng-show='dropOff != null']//strong[contains(@class,'ng-binding')][1]"
);

this.selectAllDropOffDocumentsButton = By.xpath(
  "//button[contains(@ng-click,'allDropOffDocumentsSelected')]"
);

this.selectedDropOffDocuments = By.xpath(
  "//div[@ng-show='dropOff != null']//button[contains(.,'Selected')]"
);

// ==================== Courier ====================

this.courierTotal = By.xpath(
  "//div[contains(@class,'courier')]//strong[contains(@class,'ng-binding')][1]"
);

this.selectAllCourierDocumentsButton = By.xpath(
  "//div[contains(@class,'courier')]//button[contains(@ng-click,'allCourierDocumentsSelected')]"
);

this.selectedCourierDocuments = By.xpath(
  "//div[contains(@class,'courier')]//button[contains(.,'Selected')]"
);
      this._selectedDropOffDocuments_ = By.xpath(
  "//div[contains(@class,'process-table-col')][.//table[@id='dropTable']]" +
  "//button[contains(@class,'btn-default') and contains(.,'Selected')]"
);

this._selectedCourierDocuments_ = By.xpath(
  "//div[contains(@class,'courier')]" +
  "//button[contains(@class,'btn-default') and contains(.,'Selected')]"
      );
      
      // Inside the DropOffDetail constructor
this.completedNoDocumentsMessage = By.xpath(
  "//*[contains(normalize-space(.), 'No documents found.')]"
);
      
  }

//   async waitForLoadingToFinish(timeout = 120000) {
//     await this.driver.wait(
//       async () => {
//         return await this.driver.executeScript(() => {
//           const selectors = [
//             ".loading-spiner-holder.theme-loading-spiner-holder",
//             ".loading",
//             ".loader",
//             ".spinner",
//             ".loading-spinner",
//             ".preloader",
//           ];

//           for (const selector of selectors) {
//             for (const element of document.querySelectorAll(selector)) {
//               const style = window.getComputedStyle(element);

//               const visible =
//                 style.display !== "none" &&
//                 style.visibility !== "hidden" &&
//                 style.opacity !== "0" &&
//                 element.offsetWidth > 0 &&
//                 element.offsetHeight > 0;

//               if (visible) return false;
//             }
//           }

//           return true;
//         });
//       },
//       timeout,
//       "Loading spinner did not disappear.",
//     );
    //   }
    
    // =========================================================
// WAIT UNTIL THE PAGE FINISHES LOADING
// =========================================================

async waitForLoadingToFinish(timeout = 120000) {
    await this.driver.wait(async () => {
        return await this.driver.executeScript(() => {
            const selectors = [
                ".loading-spiner-holder.theme-loading-spiner-holder",
                ".loading",
                ".loader",
                ".spinner",
                ".loading-spinner",
                ".preloader"
            ];

            for (const selector of selectors) {
                for (const element of document.querySelectorAll(selector)) {
                    const style = window.getComputedStyle(element);

                    const visible =
                        style.display !== "none" &&
                        style.visibility !== "hidden" &&
                        style.opacity !== "0" &&
                        element.offsetWidth > 0 &&
                        element.offsetHeight > 0;

                    if (visible) return false;
                }
            }

            return true;
        });
    }, timeout, "Loading spinner did not disappear.");
}


// =========================================================
// OPEN DROPOFF AND WAIT FOR ITS CONTENT TO BE READY
// =========================================================

async open() {
    await this.driver.get(this.url);

    await this.driver.wait(
        until.urlContains("/p/dropoff"),
        30000,
        "DropOff page URL did not load."
    );

    // Wait for initial page loading to finish.
    await this.waitForLoadingToFinish(120000);

    // Wait for the actual DropOff Queue table.
    await this.driver.wait(
        until.elementLocated(this.dropOffQueueTable),
        60000,
        "DropOff Queue table was not found."
    );

    await this.driver.wait(
        until.elementIsVisible(
            await this.driver.findElement(this.dropOffQueueTable)
        ),
        60000,
        "DropOff Queue table is not visible."
    );

    // Angular may render the queue after the first spinner disappears.
    await this.waitForLoadingToFinish(120000);

    // Ensure the Export button is available before proceeding.
    const exportButton = await this.driver.wait(
        until.elementLocated(this.exportDropOffQueueButton),
        60000,
        "DropOff Queue Export button was not found."
    );

    await this.driver.wait(
        until.elementIsVisible(exportButton),
        60000,
        "DropOff Queue Export button is not visible."
    );

    await this.driver.wait(
        until.elementIsEnabled(exportButton),
        60000,
        "DropOff Queue Export button is not enabled."
    );

    console.log("✓ DropOff page and Queue are fully ready.");
}


// =========================================================
// CLICK DROPOFF QUEUE EXPORT
// =========================================================

async clickExportDropOffQueue() {
    // Never click Export while the page is still loading.
    await this.waitForLoadingToFinish(120000);

    const button = await this.driver.wait(
        until.elementLocated(this.exportDropOffQueueButton),
        60000,
        "DropOff Queue Export button was not found."
    );

    await this.driver.wait(
        until.elementIsVisible(button),
        60000,
        "DropOff Queue Export button is not visible."
    );

    await this.driver.wait(
        until.elementIsEnabled(button),
        60000,
        "DropOff Queue Export button is not enabled."
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        button
    );

    await this.waitForLoadingToFinish(120000);
    await button.click();

    console.log("✓ DropOff Queue Export button clicked.");
}

//   async open() {
//     await this.driver.get(this.url);

//     await this.driver.wait(
//       until.urlContains("/p/dropoff"),
//       120000,
//       "DropOff page URL did not load.",
//     );

//     // Wait for all three boxes to be present.
//     await this.driver.wait(
//       until.elementLocated(this.dropOffQueueTable),
//       60000,
//       "DropOff Queue table was not found.",
//     );

//     await this.driver.wait(
//       until.elementLocated(this.courierBox),
//       60000,
//       "Courier box was not found.",
//     );

//     // Wait until the Queue Export button is available.
//     const exportButton = await this.driver.wait(
//       until.elementLocated(this.exportDropOffQueueButton),
//       60000,
//       "DropOff Queue Export button was not found.",
//     );

//     await this.driver.wait(
//       until.elementIsVisible(exportButton),
//       60000,
//       "DropOff Queue Export button is not visible.",
//     );

//     await this.driver.wait(
//       until.elementIsEnabled(exportButton),
//       60000,
//       "DropOff Queue Export button is not enabled.",
//     );

//     // Allow the page's initial rendering to settle.
//     await this.driver.sleep(2000);

//     console.log("✓ DropOff page is ready.");
//   }

  async clickElement(locator, description) {
    await this.waitForLoadingToFinish();

    const element = await this.driver.wait(
      until.elementLocated(locator),
      60000,
      `${description} was not found.`,
    );

    await this.driver.wait(
      until.elementIsVisible(element),
      30000,
      `${description} is not visible.`,
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      element,
    );

    await this.driver.wait(
      until.elementIsEnabled(element),
      30000,
      `${description} is not enabled.`,
    );

    try {
      await element.click();
    } catch (error) {
      await this.driver.executeScript("arguments[0].click();", element);
    }

    return element;
  }

  // ==================== DropOff Queue methods ====================

//   async clickExportDropOffQueue() {
//     await this.waitForLoadingToFinish();

//     const button = await this.driver.wait(
//       until.elementLocated(this.exportDropOffQueueButton),
//       60000,
//       "DropOff Queue Export button was not found.",
//     );

//     await this.driver.wait(
//       until.elementIsVisible(button),
//       30000,
//       "DropOff Queue Export button is not visible.",
//     );

//     await this.driver.wait(
//       until.elementIsEnabled(button),
//       30000,
//       "DropOff Queue Export button is not enabled.",
//     );

//     await this.driver.executeScript(
//       "arguments[0].scrollIntoView({block:'center'});",
//       button,
//     );

//     console.log("Clicking DropOff Queue Export...");

//     await button.click();

//     console.log("✓ DropOff Queue Export button clicked.");
//   }

  async clickPrintDropOffQueueDocs() {
    await this.clickElement(
      this.printDropOffQueueDocsButton,
      "DropOff Queue Print Docs button",
    );
  }

  // ==================== Courier methods ====================

  async clickExportCourier() {
    await this.clickElement(this.exportCourierButton, "Courier Export button");
  }

  async selectCourierPrintOption(optionName) {
    await this.waitForLoadingToFinish();

    const dropdown = await this.driver.wait(
      until.elementLocated(this.courierPrintDropdown),
      30000,
      "Courier Print dropdown was not found.",
    );

    await this.driver.wait(until.elementIsVisible(dropdown), 30000);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      dropdown,
    );

    const select = new Select(dropdown);
    await select.selectByVisibleText(optionName);

    console.log(`Selected Courier Print option: ${optionName}`);
  }

  // ==================== Completed methods ====================

  async clickExportCompleted() {
    await this.waitForLoadingToFinish();

    const button = await this.driver.wait(
      until.elementLocated(this.exportCompletedButton),
      60000,
      "Completed Export button was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(button),
      30000,
      "Completed Export button is not visible.",
    );

    await this.driver.wait(
      until.elementIsEnabled(button),
      30000,
      "Completed Export button is not enabled.",
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await button.click();

    console.log("✓ Completed Export button clicked.");
  }

  async clickPrintCompletedDocs() {
    await this.clickElement(
      this.printCompletedDocsButton,
      "Completed Print Docs button",
    );
  }

  // ==================== Completed methods ====================

//   async waitForNoDocumentsMessage(timeout = 10000) {
//     const message = await this.driver.wait(
//       until.elementLocated(this.completedNoDocumentsMessage),
//       timeout,
//       "'No documents found.' notification was not displayed.",
//     );

//     await this.driver.wait(
//       until.elementIsVisible(message),
//       5000,
//       "'No documents found.' notification is not visible.",
//     );

//     const actualText = (await message.getText()).trim();

//     if (actualText !== "No documents found.") {
//       throw new Error(
//         `Expected 'No documents found.' but received '${actualText}'`,
//       );
//     }

//     console.log(`✓ Notification displayed: ${actualText}`);
//     return message;
    //     }
    
    async waitForNoDocumentsMessage(timeout = 15000) {
  return await this.driver.wait(async () => {
    const elements = await this.driver.findElements(
      this.completedNoDocumentsMessage
    );

    for (const element of elements) {
      try {
        if (await element.isDisplayed()) {
          const text = (await element.getText()).trim();

          if (text.includes("No documents found.")) {
            console.log(`✓ Notification displayed: ${text}`);
            return element;
          }
        }
      } catch (error) {
        // The notification may disappear while being checked.
      }
    }

    return false;
  }, timeout, "'No documents found.' notification was not displayed.");
    }
    

async getDocumentCount(locator) {
  const element = await this.driver.wait(
    until.elementLocated(locator),
    15000,
    "Total document count was not found."
  );

  await this.driver.wait(
    until.elementIsVisible(element),
    10000,
    "Total document count is not visible."
  );

  const text = (await element.getText()).trim();
  const match = text.match(/[\d,]+/);

  if (!match) {
    throw new Error(`Unable to read Total count from: "${text}"`);
  }

  return Number(match[0].replace(/,/g, ""));
}

async getSelectedCount(locator) {
  const element = await this.driver.wait(
    until.elementLocated(locator),
    15000,
    "Selected document count was not found."
  );

  await this.driver.wait(
    until.elementIsVisible(element),
    10000,
    "Selected document count is not visible."
  );

  const text = (await element.getText()).trim();
  const match = text.match(/Selected\s*:\s*([\d,]+)/i);

  if (!match) {
    throw new Error(
      `Unable to read Selected count. Actual element text: "${text}"`
    );
  }

  return Number(match[1].replace(/,/g, ""));
}

async verifySelectAllCount(
  totalLocator,
  selectAllLocator,
  selectedLocator,
  boxName
) {
  // Read the total count for this panel.
  const total = await this.getDocumentCount(totalLocator);

  console.log(`${boxName} Total: ${total}`);

  // When no documents exist, the expected selected count is zero.
  if (total === 0) {
    const selected = await this.getSelectedCount(selectedLocator);

    if (selected !== 0) {
      throw new Error(
        `${boxName}: Total = 0, but Selected = ${selected}`
      );
    }

    console.log(`✓ ${boxName}: No documents; Selected = 0.`);
    return;
  }

  // Click Select All Documents.
  const selectAllButton = await this.driver.wait(
    until.elementLocated(selectAllLocator),
    15000,
    `${boxName}: Select All Documents button was not found.`
  );

  await this.driver.wait(
    until.elementIsVisible(selectAllButton),
    10000,
    `${boxName}: Select All Documents button is not visible.`
  );

  await this.driver.wait(
    until.elementIsEnabled(selectAllButton),
    10000,
    `${boxName}: Select All Documents button is disabled.`
  );

  await this.driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    selectAllButton
  );

  await selectAllButton.click();

  // Wait until the displayed Selected count equals Total.
  await this.driver.wait(
    async () => {
      try {
        const selected = await this.getSelectedCount(selectedLocator);
        return selected === total;
      } catch {
        return false;
      }
    },
    20000,
    `${boxName}: Selected count did not match Total (${total}).`
  );

  const selected = await this.getSelectedCount(selectedLocator);

  console.log(`${boxName} Selected: ${selected}`);

  if (selected !== total) {
    throw new Error(
      `${boxName}: Total = ${total}, but Selected = ${selected}`
    );
  }

  console.log(
    `✓ ${boxName}: Total matches Selected (${total}).`
  );
    }
    
    
async waitForSectionTotal(sectionName, timeout = 30000) {
    const { By, until } = require("selenium-webdriver");

    const sectionLocator =
        sectionName === "DropOff Queue"
            ? By.xpath("//span[contains(normalize-space(.),'DropOff Queue')]/ancestor::div[contains(@class,'col-md-')][1]")
            : By.xpath("//span[normalize-space(.)='Courier']/ancestor::div[contains(@class,'col-md-')][1]");

    const section = await this.driver.wait(
        until.elementLocated(sectionLocator),
        timeout,
        `${sectionName} section was not found`
    );

    await this.driver.wait(async () => {
        const text = await section.getText();
        return /Total:\s*\d+/.test(text);
    }, timeout, `${sectionName} Total count did not load`);

    const sectionText = await section.getText();
    const match = sectionText.match(/Total:\s*(\d+)/);

    if (!match) {
        throw new Error(
            `${sectionName} Total count could not be read. Text: ${sectionText}`
        );
    }

    return Number(match[1]);
    }
    
    // Wait until the panel's Total count is rendered.
async waitForPanelTotal(panelSelector, timeout = 60000) {
  const totalLocator = By.css(
    `${panelSelector} strong.ng-binding`
  );

  await this.driver.wait(async () => {
    const elements = await this.driver.findElements(totalLocator);

    for (const element of elements) {
      const text = (await element.getText()).trim();

      if (/^Total:\s*[\d,]+$/i.test(text)) {
        return true;
      }
    }

    return false;
  }, timeout, `Total count did not load for ${panelSelector}`);

  const elements = await this.driver.findElements(totalLocator);

  for (const element of elements) {
    const text = (await element.getText()).trim();
    const match = text.match(/^Total:\s*([\d,]+)$/i);

    if (match) {
      return Number(match[1].replace(/,/g, ""));
    }
  }

  throw new Error(`Unable to read Total count for ${panelSelector}`);
}

async getDropOffQueueTotal() {
  return this.waitForPanelTotal("div.col-md-9");
}

async getCourierTotal() {
  return this.waitForPanelTotal("div.col-md-6");
}

    
async getCompletedDocumentCount() {
  await this.waitForLoadingToFinish();

  return await this.driver.wait(
    async () => {
      const count = await this.driver.executeScript(() => {
        const headings = [...document.querySelectorAll("strong span")];
        const heading = headings.find(
          el => el.textContent.trim() === "Completed"
        );

        if (!heading) return null;

        // Find the Completed section containing its heading.
        let section = heading;
        while (section && section !== document.body) {
          const text = section.innerText || "";

          if (
            /Total\s*:\s*[\d,]+/.test(text) &&
            section.querySelector("table")
          ) {
            const match = text.match(/Total\s*:\s*([\d,]+)/);
            if (match) {
              return Number(match[1].replace(/,/g, ""));
            }
          }

          section = section.parentElement;
        }

        return null;
      });

      return count;
    },
    30000,
    "Completed document count did not load."
  );
}

async getNoDocumentsMessageIfPresent() {
  return await this.driver.executeScript(() => {
    const elements = [...document.querySelectorAll("body *")];

    const message = elements.find(el => {
      const text = (el.textContent || "").trim();

      return (
        text === "No documents found." &&
        el.children.length === 0 &&
        el.getClientRects().length > 0
      );
    });

    return message ? message.textContent.trim() : null;
  });
    }
    
    
async selectDocumentFilter(filterName) {
    await this.waitForLoadingToFinish();

    const dropdown = await this.driver.wait(
        until.elementLocated(this.documentFilterDropdown),
        15000,
        "Document filter dropdown was not found."
    );

    await this.driver.wait(
        until.elementIsVisible(dropdown),
        10000,
        "Document filter dropdown is not visible."
    );

    const select = new Select(dropdown);

    // Ensure the requested filter actually exists.
    const options = await select.getOptions();
    const availableOptions = [];

    for (const option of options) {
        availableOptions.push((await option.getText()).trim());
    }

    if (!availableOptions.includes(filterName)) {
        throw new Error(
            `Filter "${filterName}" not found. Available filters: ` +
            availableOptions.join(", ")
        );
    }

    await select.selectByVisibleText(filterName);

    // Verify that Selenium selected the requested option.
    await this.driver.wait(
        async () => {
            const selectedOption = await select.getFirstSelectedOption();
            return (await selectedOption.getText()).trim() === filterName;
        },
        10000,
        `Filter "${filterName}" was not selected.`
    );

    console.log(`✓ Selected document filter: ${filterName}`);

    // Wait for Angular to finish updating the document counts.
    await this.waitForLoadingToFinish();
}

async getSectionTotal(sectionName) {
    const sectionConfig = {
        "DropOff Queue": {
            container: "dropOff"
        },
        "Courier": {
            container: "courier"
        },
        "Completed": {
            container: "completed"
        }
    };

    const config = sectionConfig[sectionName];

    if (!config) {
        throw new Error(`Unknown DropOff section: ${sectionName}`);
    }

    // These names match the ng-show sections shown in DevTools.
    const totalLocator = By.xpath(
        `//div[@ng-show='${config.container} != null']` +
        "//strong[contains(@class,'ng-binding')][1]"
    );

    const totalElement = await this.driver.wait(
        until.elementLocated(totalLocator),
        15000,
        `${sectionName} total was not found.`
    );

    await this.driver.wait(
        until.elementIsVisible(totalElement),
        10000,
        `${sectionName} total is not visible.`
    );

    const totalText = (await totalElement.getText()).trim();
    const total = Number(totalText.replace(/,/g, ""));

    if (!Number.isFinite(total)) {
        throw new Error(
            `Invalid total for ${sectionName}: "${totalText}"`
        );
    }

    return total;
}


    
    

}

module.exports = DropOffDetail;
