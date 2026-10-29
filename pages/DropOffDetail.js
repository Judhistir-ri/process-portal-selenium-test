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
      'select[ng-options*="quickFilter.caption"]',
    );

    // ==================== DropOff Queue ====================

    this.dropOffQueueTotal = By.xpath(
      "//div[@ng-show='dropOff != null']//strong[contains(@class,'ng-binding')][1]",
    );

    this.selectAllDropOffDocumentsButton = By.xpath(
      "//button[contains(@ng-click,'allDropOffDocumentsSelected')]",
    );

    this.selectedDropOffDocuments = By.xpath(
      "//div[@ng-show='dropOff != null']//button[contains(.,'Selected')]",
    );

    // ==================== Courier ====================

    this.courierTotal = By.xpath(
      "//div[contains(@class,'courier')]//strong[contains(@class,'ng-binding')][1]",
    );

    this.selectAllCourierDocumentsButton = By.xpath(
      "//div[contains(@class,'courier')]//button[contains(@ng-click,'allCourierDocumentsSelected')]",
    );

    this.selectedCourierDocuments = By.xpath(
      "//div[contains(@class,'courier')]//button[contains(.,'Selected')]",
    );
    this._selectedDropOffDocuments_ = By.xpath(
      "//div[contains(@class,'process-table-col')][.//table[@id='dropTable']]" +
        "//button[contains(@class,'btn-default') and contains(.,'Selected')]",
    );

    this._selectedCourierDocuments_ = By.xpath(
      "//div[contains(@class,'courier')]" +
        "//button[contains(@class,'btn-default') and contains(.,'Selected')]",
    );

    // Inside the DropOffDetail constructor
    this.completedNoDocumentsMessage = By.xpath(
      "//*[contains(normalize-space(.), 'No documents found.')]",
    );

    // Document Category dropdown (second dropdown in the filter row)
    this.documentCategoryDropdown = By.css(
      "select[ng-model='searchOptions.quickFilter'] ~ select",
    );
  }

  async waitForLoadingToFinish(timeout = 120000) {
    await this.driver.wait(
      async () => {
        return await this.driver.executeScript(() => {
          const selectors = [
            ".loading-spiner-holder.theme-loading-spiner-holder",
            ".loading",
            ".loader",
            ".spinner",
            ".loading-spinner",
            ".preloader",
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
      },
      timeout,
      "Loading spinner did not disappear.",
    );
  }

  // =========================================================
  // OPEN DROPOFF AND WAIT FOR ITS CONTENT TO BE READY
  // =========================================================

  async open() {
    await this.driver.get(this.url);

    await this.driver.wait(
      until.urlContains("/p/dropoff"),
      30000,
      "DropOff page URL did not load.",
    );

    // Wait for initial page loading to finish.
    await this.waitForLoadingToFinish(120000);

    // Wait for the actual DropOff Queue table.
    await this.driver.wait(
      until.elementLocated(this.dropOffQueueTable),
      60000,
      "DropOff Queue table was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(
        await this.driver.findElement(this.dropOffQueueTable),
      ),
      60000,
      "DropOff Queue table is not visible.",
    );

    // Angular may render the queue after the first spinner disappears.
    await this.waitForLoadingToFinish(120000);

    // Ensure the Export button is available before proceeding.
    const exportButton = await this.driver.wait(
      until.elementLocated(this.exportDropOffQueueButton),
      60000,
      "DropOff Queue Export button was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(exportButton),
      60000,
      "DropOff Queue Export button is not visible.",
    );

    await this.driver.wait(
      until.elementIsEnabled(exportButton),
      60000,
      "DropOff Queue Export button is not enabled.",
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
      "DropOff Queue Export button was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(button),
      60000,
      "DropOff Queue Export button is not visible.",
    );

    await this.driver.wait(
      until.elementIsEnabled(button),
      60000,
      "DropOff Queue Export button is not enabled.",
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
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
    return await this.driver.wait(
      async () => {
        const elements = await this.driver.findElements(
          this.completedNoDocumentsMessage,
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
      },
      timeout,
      "'No documents found.' notification was not displayed.",
    );
  }

  async getDocumentCount(locator) {
    const element = await this.driver.wait(
      until.elementLocated(locator),
      15000,
      "Total document count was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(element),
      10000,
      "Total document count is not visible.",
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
      "Selected document count was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(element),
      10000,
      "Selected document count is not visible.",
    );

    const text = (await element.getText()).trim();
    const match = text.match(/Selected\s*:\s*([\d,]+)/i);

    if (!match) {
      throw new Error(
        `Unable to read Selected count. Actual element text: "${text}"`,
      );
    }

    return Number(match[1].replace(/,/g, ""));
  }

  async verifySelectAllCount(
    totalLocator,
    selectAllLocator,
    selectedLocator,
    boxName,
  ) {
    // Read the total count for this panel.
    const total = await this.getDocumentCount(totalLocator);

    console.log(`${boxName} Total: ${total}`);

    // When no documents exist, the expected selected count is zero.
    if (total === 0) {
      const selected = await this.getSelectedCount(selectedLocator);

      if (selected !== 0) {
        throw new Error(`${boxName}: Total = 0, but Selected = ${selected}`);
      }

      console.log(`✓ ${boxName}: No documents; Selected = 0.`);
      return;
    }

    // Click Select All Documents.
    const selectAllButton = await this.driver.wait(
      until.elementLocated(selectAllLocator),
      15000,
      `${boxName}: Select All Documents button was not found.`,
    );

    await this.driver.wait(
      until.elementIsVisible(selectAllButton),
      10000,
      `${boxName}: Select All Documents button is not visible.`,
    );

    await this.driver.wait(
      until.elementIsEnabled(selectAllButton),
      10000,
      `${boxName}: Select All Documents button is disabled.`,
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      selectAllButton,
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
      `${boxName}: Selected count did not match Total (${total}).`,
    );

    const selected = await this.getSelectedCount(selectedLocator);

    console.log(`${boxName} Selected: ${selected}`);

    if (selected !== total) {
      throw new Error(
        `${boxName}: Total = ${total}, but Selected = ${selected}`,
      );
    }

    console.log(`✓ ${boxName}: Total matches Selected (${total}).`);
  }

  async waitForSectionTotal(sectionName, timeout = 30000) {
    const { By, until } = require("selenium-webdriver");

    const sectionLocator =
      sectionName === "DropOff Queue"
        ? By.xpath(
            "//span[contains(normalize-space(.),'DropOff Queue')]/ancestor::div[contains(@class,'col-md-')][1]",
          )
        : By.xpath(
            "//span[normalize-space(.)='Courier']/ancestor::div[contains(@class,'col-md-')][1]",
          );

    const section = await this.driver.wait(
      until.elementLocated(sectionLocator),
      timeout,
      `${sectionName} section was not found`,
    );

    await this.driver.wait(
      async () => {
        const text = await section.getText();
        return /Total:\s*\d+/.test(text);
      },
      timeout,
      `${sectionName} Total count did not load`,
    );

    const sectionText = await section.getText();
    const match = sectionText.match(/Total:\s*(\d+)/);

    if (!match) {
      throw new Error(
        `${sectionName} Total count could not be read. Text: ${sectionText}`,
      );
    }

    return Number(match[1]);
  }

  // Wait until the panel's Total count is rendered.
  async waitForPanelTotal(panelSelector, timeout = 60000) {
    const totalLocator = By.css(`${panelSelector} strong.ng-binding`);

    await this.driver.wait(
      async () => {
        const elements = await this.driver.findElements(totalLocator);

        for (const element of elements) {
          const text = (await element.getText()).trim();

          if (/^Total:\s*[\d,]+$/i.test(text)) {
            return true;
          }
        }

        return false;
      },
      timeout,
      `Total count did not load for ${panelSelector}`,
    );

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
  await this.waitForLoadingToFinish(60000);

  const count = await this.getSectionTotal("Completed");

  console.log(`✓ Completed document count: ${count}`);

  return count;
}


  async getNoDocumentsMessageIfPresent() {
    return await this.driver.executeScript(() => {
      const elements = [...document.querySelectorAll("body *")];

      const message = elements.find((el) => {
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
      "Document filter dropdown was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(dropdown),
      10000,
      "Document filter dropdown is not visible.",
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
          availableOptions.join(", "),
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
      `Filter "${filterName}" was not selected.`,
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

  // =========================================================
  // DOCUMENT CATEGORY FILTER
  // =========================================================

  // async selectDocumentCategory(categoryName) {
  //   await this.waitForLoadingToFinish();

  //   // Actual Document Category dropdown from DevTools:
  //   // ng-model="searchOptions.quickFilter"
  //   // ng-change="applyFilter()"
  //   const categoryDropdown = By.css(
  //     "select[ng-model='searchOptions.quickFilter']"
  //   );

  //   const dropdown = await this.driver.wait(
  //     until.elementLocated(categoryDropdown),
  //     30000,
  //     "Document Category dropdown was not found."
  //   );

  //   await this.driver.wait(
  //     until.elementIsVisible(dropdown),
  //     15000,
  //     "Document Category dropdown is not visible."
  //   );

  //   await this.driver.executeScript(
  //     "arguments[0].scrollIntoView({block:'center'});",
  //     dropdown
  //   );

  //   const select = new Select(dropdown);

  //   // Verify that the requested category exists before selecting it.
  //   const options = await select.getOptions();
  //   const availableCategories = await Promise.all(
  //     options.map(async option => (await option.getText()).trim())
  //   );

  //   console.log("Available document categories:", availableCategories);

  //   if (!availableCategories.includes(categoryName)) {
  //     throw new Error(
  //       `Category "${categoryName}" not found. Available categories: ` +
  //       availableCategories.join(", ")
  //     );
  //   }

  //   await select.selectByVisibleText(categoryName);

  //   // Wait for Angular to apply the selected category and update totals.
  //   await this.waitForLoadingToFinish();

  //   await this.driver.wait(async () => {
  //     const selectedText = await select.getFirstSelectedOption()
  //       .then(option => option.getText())
  //       .catch(() => "");

  //     return selectedText.trim() === categoryName;
  //   }, 15000, `Category "${categoryName}" was not selected.`);

  //   // Allow the updated totals to render.
  //   await this.driver.sleep(1000);

  //   console.log(`✓ Selected Document Category: ${categoryName}`);
  // }


  

  async selectDocumentCategory(categoryName) {
    await this.waitForLoadingToFinish();

    // Find the actual dropdown by its option labels.
    const dropdowns = await this.driver.findElements(By.css("select"));

    let categoryDropdown = null;
    let availableCategories = [];

    for (const dropdown of dropdowns) {
      if (!(await dropdown.isDisplayed())) continue;

      const select = new Select(dropdown);
      const options = await select.getOptions();

      const optionTexts = await Promise.all(
        options.map(async (option) => (await option.getText()).trim()),
      );

      if (optionTexts.includes("All Categories")) {
        categoryDropdown = dropdown;
        availableCategories = optionTexts;
        break;
      }
    }

    if (!categoryDropdown) {
      throw new Error(
        "Could not find the Document Category dropdown containing 'All Categories'.",
      );
    }

    console.log("Available document categories:", availableCategories);

    if (!availableCategories.includes(categoryName)) {
      throw new Error(`Category "${categoryName}" was not found.`);
    }

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      categoryDropdown,
    );

    const categorySelect = new Select(categoryDropdown);

    // Select the requested category.
    await categorySelect.selectByVisibleText(categoryName);

    // Verify the selection actually changed.
    await this.driver.wait(
      async () => {
        const selectedOption = await categorySelect.getFirstSelectedOption();

        const selectedText = (await selectedOption.getText()).trim();

        return selectedText === categoryName;
      },
      10000,
      `Category "${categoryName}" was not selected.`,
    );

    console.log(`✓ Selected Document Category: ${categoryName}`);

    // Wait for Angular to apply the category filter.
    await this.waitForLoadingToFinish();

    // Allow the total values to refresh after filtering.
    await this.driver.wait(
      async () => {
        const totalElements = await this.driver.findElements(
          By.xpath(
            "//div[@ng-show='dropOff != null']" +
              "//strong[contains(@class,'ng-binding')]",
          ),
        );

        return (
          totalElements.length > 0 && (await totalElements[0].isDisplayed())
        );
      },
      30000,
      "DropOff Queue total did not become visible.",
    );
  }

  // =========================================================
  // READ TOTAL FROM A PANEL
  // =========================================================

  async getDocumentCategoryPanelTotal(panelName) {
    const panelSelectors = {
      "DropOff Queue": "div[ng-show='dropOff != null']",
      Courier: "div.courier",
      Completed: "div.completed-docs",
    };

    const panelSelector = panelSelectors[panelName];

    if (!panelSelector) {
      throw new Error(`Unknown panel name: ${panelName}`);
    }

    const panel = await this.driver.wait(
      until.elementLocated(By.css(panelSelector)),
      30000,
      `${panelName} panel was not found.`,
    );

    await this.driver.wait(
      until.elementIsVisible(panel),
      15000,
      `${panelName} panel is not visible.`,
    );

    // Read the Total value specifically, not category-wise counts.
    await this.driver.wait(
      async () => {
        const text = await panel.getText();
        return /Total:\s*[\d,]+/i.test(text);
      },
      30000,
      `${panelName} Total count did not load.`,
    );

    const panelText = await panel.getText();
    const match = panelText.match(/Total:\s*([\d,]+)/i);

    if (!match) {
      throw new Error(
        `Could not read ${panelName} total. Panel text: ${panelText}`,
      );
    }

    return Number(match[1].replace(/,/g, ""));
  }

  // ============================================================
  // SELECT STOP FILTER
  // ============================================================
  async selectStopFilter(stopName) {
    await this.waitForLoadingToFinish(120000);

    const stopDropdown = By.css("select[ng-model='searchOptions.stopFilter']");

    const dropdown = await this.driver.wait(
      until.elementLocated(stopDropdown),
      30000,
      "Stop dropdown was not found.",
    );

    await this.driver.wait(
      until.elementIsVisible(dropdown),
      15000,
      "Stop dropdown is not visible.",
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      dropdown,
    );

    const select = new Select(dropdown);

    // Read the real options displayed by the application.
    const options = await select.getOptions();
    const optionNames = await Promise.all(
      options.map((option) => option.getText()),
    );

    console.log("Available stops:", optionNames);

    // Select the requested stop.
    await select.selectByVisibleText(stopName);

    // Verify the selection actually changed.
    const selectedOption = await select.getFirstSelectedOption();
    const selectedText = (await selectedOption.getText()).trim();

    if (selectedText !== stopName) {
      throw new Error(
        `Stop selection failed. Expected "${stopName}", got "${selectedText}".`,
      );
    }

    console.log(`✓ Selected Stop: ${selectedText}`);

    // Wait for the application to refresh the counts.
    await this.waitForLoadingToFinish(120000);
    await this.driver.sleep(1000);
  }

  async selectDateFilter(date) {
    // date should be in dd-mm-yyyy format, e.g. 14-10-2026.
    const [day, month, year] = date.split("-");
    const inputDate = `${year}-${month}-${day}`;

    const dateInput = this.driver.findElement(
      By.css("input[type='date'][ng-model='dateFilter']"),
    );

    await this.driver.wait(
      until.elementIsVisible(dateInput),
      15000,
      "Date filter input was not visible.",
    );

    await this.driver.executeScript(
      `
      const input = arguments[0];
      const dateValue = arguments[1];

      input.value = dateValue;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    `,
      dateInput,
      inputDate,
    );

    // Wait for the date filter to be applied and the panel totals to refresh.
    await this.driver.wait(
      async () => {
        const currentValue = await dateInput.getAttribute("value");
        return currentValue === inputDate;
      },
      10000,
      `Date filter was not set to ${date}.`,
    );

    await this.driver.sleep(2000);

    console.log(`✓ Date filter applied: ${date}`);
  }

  async getDateFilteredDocumentCounts() {
    const counts = {};

    for (const section of ["DropOff Queue", "Courier", "Completed"]) {
      counts[section] = await this.getDocumentCategoryPanelTotal(section);
    }

    return counts;
  }

  getDropOffPanel() {
    return By.xpath(
      "//table[@id='dropTable']/ancestor::div[contains(@class,'col-md-4')][1]",
    );
  }

  // Get the Courier panel.
  getCourierPanel() {
    return By.css("div.col-md-4.courier");
  }

  // Get the Completed panel.
  getCompletedPanel() {
    return By.css("div.col-md-4.completed-docs");
  }

  async waitForOrderInPanel(panelLocator, orderId, timeout = 15000) {
    const rowLocator = By.xpath(
      `${this.xpathForElement(panelLocator)}` +
        `//tr[.//*[normalize-space()='${orderId}']]`,
    );

    return await this.driver.wait(
      until.elementLocated(rowLocator),
      timeout,
      `Order ${orderId} was not found in the requested panel`,
    );
  }

  // Converts a panel locator into an XPath string for use in a row locator.
  xpathForElement(panelLocator) {
    return panelLocator.value;
  }

  // async searchOrderId(orderId) {
  // const searchBoxLocator = By.css(
  //     "input[placeholder='Filter Anything']"
  // );

  // const searchBox = await this.driver.wait(
  //     until.elementLocated(searchBoxLocator),
  //     30000,
  //     "Filter Anything search box was not found."
  // );

  // await this.driver.wait(
  //     until.elementIsVisible(searchBox),
  //     15000,
  //     "Filter Anything search box is not visible."
  // );

  // await searchBox.clear();
  // await searchBox.sendKeys(String(orderId));

  // // Wait for Angular to update the filtered results.
  // await this.driver.wait(async () => {
  //     const value = await searchBox.getAttribute("value");
  //     return value === String(orderId);
  // }, 10000, "Order ID was not entered into Filter Anything.");

  // await this.driver.sleep(2000);
  // }

  // Search an Order ID using the DropOff page search box.
  async searchOrderId(orderId) {
    const searchLocators = [
      By.css("input[placeholder='Filter Anything']"),
      By.css("input[placeholder*='Search']"),
      By.css("input[placeholder*='Order Id']"),
    ];

    let searchBox = null;

    for (const locator of searchLocators) {
      const elements = await this.driver.findElements(locator);

      for (const element of elements) {
        if ((await element.isDisplayed()) && (await element.isEnabled())) {
          searchBox = element;
          break;
        }
      }

      if (searchBox) break;
    }

    if (!searchBox) {
      throw new Error("Could not find a visible, enabled order search box.");
    }

    await searchBox.clear();
    await searchBox.sendKeys(String(orderId));

    await this.driver.wait(
      async () => {
        const value = await searchBox.getAttribute("value");
        return value === String(orderId);
      },
      10000,
      "Order ID was not entered correctly.",
    );

    // Allow Angular to update the filtered tables.
    await this.driver.sleep(2000);

    console.log(`✓ Searched for Order ID: ${orderId}`);
  }

  async selectOrderCheckbox(panelLocator, orderId) {
    const panel = await this.driver.wait(
      until.elementLocated(panelLocator),
      15000,
    );

    const row = await panel.findElement(
      By.xpath(`.//tr[.//*[normalize-space()='${orderId}']]`),
    );

    const checkbox = await row.findElement(By.css("input[type='checkbox']"));

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      checkbox,
    );

    if (!(await checkbox.isSelected())) {
      await checkbox.click();
    }
  }

  async clickPanelButton(panelLocator, buttonText) {
    const panel = await this.driver.wait(
      until.elementLocated(panelLocator),
      15000,
      `Panel for ${buttonText} button was not found.`,
    );

    // Match button text even when it contains an arrow icon.
    const buttonLocator = By.xpath(
      `.//button[contains(normalize-space(.), '${buttonText}')]`,
    );

    const button = await panel.findElement(buttonLocator);

    await this.driver.wait(
      until.elementIsVisible(button),
      10000,
      `${buttonText} button is not visible.`,
    );

    await this.driver.wait(
      until.elementIsEnabled(button),
      10000,
      `${buttonText} button is not enabled.`,
    );

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      button,
    );

    await button.click();

    // Wait for the application to finish the operation.
    await this.waitForLoadingToFinish(60000);
  }

  // async isOrderInPanel(panelLocator, orderId) {
  //     try {
  //         const panel = await this.driver.findElement(panelLocator);

  //         return await this.driver.executeScript(
  //             (panelElement, id) => {
  //                 const rows = panelElement.querySelectorAll("tr");

  //                 return Array.from(rows).some(row => {
  //                     const cells = row.querySelectorAll("td");

  //                     return Array.from(cells).some(cell => {
  //                         const text = (cell.innerText || "").trim();
  //                         const title = (cell.getAttribute("title") || "").trim();

  //                         return text === id || title === id;
  //                     });
  //                 });
  //             },
  //             panel,
  //             String(orderId)
  //         );
  //     } catch (error) {
  //         return false;
  //     }
  // }

  // Check whether an Order ID exists in a specific panel.
  // async isOrderInPanel(panelLocator, orderId) {
  //   const panel = await this.driver.findElement(panelLocator);

  //   const rows = await panel.findElements(By.xpath(".//tbody/tr"));

  //   for (const row of rows) {
  //     const rowText = await row.getText();

  //     // Match the exact Order ID, not a partial match.
  //     const cells = await row.findElements(By.xpath("./td"));

  //     for (const cell of cells) {
  //       const cellText = (await cell.getText()).trim();

  //       if (cellText === String(orderId)) {
  //         return true;
  //       }
  //     }
  //   }

  //   return false;
  // }



async isOrderInPanel(panelLocator, orderId) {
  const expectedId = String(orderId).trim();

  const panels = await this.driver.findElements(panelLocator);

  for (const panel of panels) {
    if (!(await panel.isDisplayed().catch(() => false))) {
      continue;
    }

    const cells = await panel.findElements(
      By.css("td.orderIdCol, tbody td")
    );

    for (const cell of cells) {
      try {
        const cellText = (await cell.getText()).trim();
        const title = (
          (await cell.getAttribute("title")) || ""
        ).trim();

        if (cellText === expectedId || title === expectedId) {
          return true;
        }
      } catch (error) {
        // The table may be updating; skip stale cells.
      }
    }
  }

  return false;
}


  async waitForOrderInPanelWithRefresh(panelLocator, orderId, waitSeconds = 5) {
    // First wait for the application to update.
    await this.driver.sleep(waitSeconds * 1000);
    await this.waitForLoadingToFinish(60000);

    if (await this.isOrderInPanel(panelLocator, orderId)) {
      return true;
    }

    console.log(`Order ${orderId} not visible yet. Clicking Refresh...`);

    const refreshButton = await this.driver.wait(
      until.elementLocated(By.css("button[ng-click='refresh()']")),
      15000,
      "Refresh button was not found.",
    );

    await this.driver.wait(until.elementIsVisible(refreshButton), 10000);

    await this.driver.wait(until.elementIsEnabled(refreshButton), 10000);

    await refreshButton.click();

    // Wait for the refresh and updated results.
    await this.waitForLoadingToFinish(60000);
    await this.driver.sleep(waitSeconds * 1000);

    return await this.isOrderInPanel(panelLocator, orderId);
  }

  async waitForOrderToLeavePanel(panelLocator, orderId, timeout = 15000) {
    try {
      await this.driver.wait(
        async () => {
          return !(await this.isOrderInPanel(panelLocator, orderId));
        },
        timeout,
        `Order ${orderId} did not leave the panel within ${timeout}ms.`,
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async clearDateFilterOrRefresh() {
    const driver = this.driver;

    console.log("Checking and clearing the date filter...");

    const clearLocator = By.xpath(
      "//*[self::button or self::a or self::span]" +
        "[normalize-space(.)='Clear']",
    );

    let cleared = false;

    try {
      const buttons = await driver.findElements(clearLocator);

      for (const button of buttons) {
        if (await button.isDisplayed().catch(() => false)) {
          await button.click();
          await driver.sleep(500);
          await this.waitForLoadingToFinish();
          cleared = true;
          console.log("✓ Clicked Clear in the date picker.");
          break;
        }
      }
    } catch (error) {
      console.log(`Could not click Clear: ${error.message}`);
    }

    // If Clear was not found, or did not work, refresh the page.
    if (!cleared) {
      console.log("Clear button not available. Refreshing DropOff page...");

      await driver.navigate().refresh();

      await driver.wait(
        async () => {
          return await driver.executeScript(
            () => document.readyState === "complete",
          );
        },
        30000,
        "Browser refresh did not complete.",
      );

      await this.waitForLoadingToFinish();

      console.log("✓ DropOff page fully loaded after refresh.");
    }
  }

  // ============================================================
  // Complete Courier Order - Generate Shipping Label
  // ============================================================

  // async completeCourierOrderWithShippingLabels(filePath) {
  //     const popup = By.xpath(
  //         "//div[contains(@class,'modal-dialog')]" +
  //         "[.//*[contains(normalize-space(.),'GENERATE SHIPPING LABEL') " +
  //         "or contains(normalize-space(.),'Generate Shipping Label')]]"
  //     );

  //     const outgoingRow = By.xpath(
  //         "//tr[.//label[normalize-space()='Outgoing']]"
  //     );

  //     const incomingRow = By.xpath(
  //         "//tr[.//label[normalize-space()='Incoming']]"
  //     );

  //     // Wait until the Generate Shipping Label popup is visible.
  //     await this.driver.wait(
  //         until.elementLocated(popup),
  //         15000
  //     );

  //     await this.driver.wait(async () => {
  //         const element = await this.driver.findElement(popup);
  //         return element.isDisplayed();
  //     }, 15000);

  //     // Find the correct fields inside each row.
  //     const outgoingTracking = await this.driver.findElement(
  //         By.xpath(
  //             "//tr[.//label[normalize-space()='Outgoing']]" +
  //             "//input[@ng-model='outSideGeneratedLabel.trackCardNumber']"
  //         )
  //     );

  //     const incomingTracking = await this.driver.findElement(
  //         By.xpath(
  //             "//tr[.//label[normalize-space()='Incoming']]" +
  //             "//input[@ng-model='incomingLabel.trackCardNumber']"
  //         )
  //     );

  //     const outgoingCourier = await this.driver.findElement(
  //         By.xpath(
  //             "//tr[.//label[normalize-space()='Outgoing']]" +
  //             "//select[@ng-model='outSideGeneratedLabel.courier']"
  //         )
  //     );

  //     const incomingCourier = await this.driver.findElement(
  //         By.xpath(
  //             "//tr[.//label[normalize-space()='Incoming']]" +
  //             "//select[@ng-model='incomingLabel.courier']"
  //         )
  //     );

  //     // Generate unique tracking IDs for this test run.
  //     const runId = Date.now();

  //     await outgoingTracking.clear();
  //     await outgoingTracking.sendKeys(`OUT-${runId}`);

  //     await incomingTracking.clear();
  //     await incomingTracking.sendKeys(`IN-${runId}`);

  //     // Randomly select a valid, non-empty courier option.
  //     async function selectRandomCourier(dropdown) {
  //         const select = new Select(dropdown);
  //         const options = await select.getOptions();

  //         const validOptions = [];

  //         for (const option of options) {
  //             const value = await option.getAttribute("value");
  //             const disabled = await option.getAttribute("disabled");

  //             if (value && value.trim() !== "" && disabled === null) {
  //                 validOptions.push(value);
  //             }
  //         }

  //         if (validOptions.length === 0) {
  //             throw new Error(
  //                 "No valid courier options are available."
  //             );
  //         }

  //         const randomIndex = Math.floor(
  //             Math.random() * validOptions.length
  //         );

  //         await select.selectByValue(validOptions[randomIndex]);

  //         console.log(
  //             `Selected courier option: ${validOptions[randomIndex]}`
  //         );
  //     }

  //     await selectRandomCourier(outgoingCourier);
  //     await selectRandomCourier(incomingCourier);

  //     // Locate the upload control inside each corresponding row.
  //     const outgoingFile = await this.driver.findElement(
  //         By.xpath(
  //             "//tr[.//label[normalize-space()='Outgoing']]" +
  //             "//input[@type='file']"
  //         )
  //     );

  //     const incomingFile = await this.driver.findElement(
  //         By.xpath(
  //             "//tr[.//label[normalize-space()='Incoming']]" +
  //             "//input[@type='file']"
  //         )
  //     );

  //     // Upload a file to both Outgoing and Incoming.
  //     await outgoingFile.sendKeys(filePath);
  //     await incomingFile.sendKeys(filePath);

  //     // Save & Complete.
  //     const saveButton = await this.driver.findElement(
  //         By.xpath(
  //             "//button[contains(normalize-space(.),'Save & Complete')]"
  //         )
  //     );

  //     await this.driver.wait(
  //         until.elementIsEnabled(saveButton),
  //         15000
  //     );

  //     await saveButton.click();

  //     // Wait until the popup closes.
  //     await this.driver.wait(async () => {
  //         const popups = await this.driver.findElements(popup);

  //         if (popups.length === 0) {
  //             return true;
  //         }

  //         return !(await popups[0].isDisplayed().catch(() => false));
  //     }, 30000);

  //     await this.waitForLoadingToFinish();

  //     console.log(
  //         "✓ Shipping labels submitted successfully."
  //     );
  // }

  // async completeCourierOrderWithShippingLabels() {
  //     const path = require("path");
  //     const fs = require("fs");
  //     const driver = this.driver;
  //     const timeout = 60000;

  //     console.log(
  //         "\n========== Complete Courier Order with Shipping Labels =========="
  //     );

  //     const popup = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]"
  //     );

  //     const outgoingTrackingLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//tr[.//label[normalize-space()='Outgoing']]" +
  //         "//input[@ng-model='outSideGeneratedLabel.trackCardNumber']"
  //     );

  //     const outgoingCourierLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//tr[.//label[normalize-space()='Outgoing']]" +
  //         "//select[@ng-model='outSideGeneratedLabel.courier']"
  //     );

  //     const incomingTrackingLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//tr[.//label[normalize-space()='Incoming']]" +
  //         "//input[@ng-model='incomingLabel.trackCardNumber']"
  //     );

  //     const incomingCourierLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//tr[.//label[normalize-space()='Incoming']]" +
  //         "//select[@ng-model='incomingLabel.courier']"
  //     );

  //     const outgoingFileLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//tr[.//label[normalize-space()='Outgoing']]" +
  //         "//input[@type='file']"
  //     );

  //     const incomingFileLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//tr[.//label[normalize-space()='Incoming']]" +
  //         "//input[@type='file']"
  //     );

  //     const saveButtonLocator = By.xpath(
  //         "//div[contains(@class,'modal-dialog')" +
  //         " and .//h3[contains(normalize-space(),'Generate Shipping Label')]]" +
  //         "//button[@ng-click='saveOutsideGeneratedLabel()']"
  //     );

  //     // Wait for the popup.
  //     await driver.wait(
  //         until.elementLocated(popup),
  //         timeout,
  //         "Generate Shipping Label popup was not found"
  //     );

  //     await driver.wait(async () => {
  //         const elements = await driver.findElements(popup);
  //         return elements.length > 0 &&
  //             await elements[0].isDisplayed().catch(() => false);
  //     }, timeout, "Generate Shipping Label popup is not visible");

  //     console.log("✓ Generate Shipping Label popup is visible.");

  //     // Generate unique tracking IDs.
  //     const runId = Date.now();
  //     const outgoingTrackingId = `OUT${runId}`;
  //     const incomingTrackingId = `IN${runId}`;

  //     // Fill tracking IDs.
  //     const outgoingTracking = await driver.findElement(
  //         outgoingTrackingLocator
  //     );

  //     const incomingTracking = await driver.findElement(
  //         incomingTrackingLocator
  //     );

  //     await outgoingTracking.clear();
  //     await outgoingTracking.sendKeys(outgoingTrackingId);

  //     await incomingTracking.clear();
  //     await incomingTracking.sendKeys(incomingTrackingId);

  //     console.log(`✓ Outgoing tracking number: ${outgoingTrackingId}`);
  //     console.log(`✓ Incoming tracking number: ${incomingTrackingId}`);

  //     // Select a random valid courier using Selenium Select.
  //     // This follows the working selection approach in DropOffPage.js.
  //     const selectRandomCourier = async (locator, label) => {
  //         const dropdown = await driver.wait(
  //             until.elementLocated(locator),
  //             timeout,
  //             `${label} courier dropdown was not found`
  //         );

  //         await driver.wait(
  //             until.elementIsVisible(dropdown),
  //             timeout,
  //             `${label} courier dropdown is not visible`
  //         );

  //         const select = new Select(dropdown);
  //         const options = await select.getOptions();
  //         const validOptions = [];

  //         for (const option of options) {
  //             const value = await option.getAttribute("value");
  //             const disabled = await option.getAttribute("disabled");
  //             const text = (await option.getText()).trim();

  //             // Exclude placeholder options and disabled choices.
  //             if (
  //                 value !== null &&
  //                 value.trim() !== "" &&
  //                 value !== "?" &&
  //                 disabled === null &&
  //                 text.toLowerCase() !== "select"
  //             ) {
  //                 validOptions.push({
  //                     value,
  //                     text
  //                 });
  //             }
  //         }

  //         if (validOptions.length === 0) {
  //             throw new Error(
  //                 `No valid courier options found for ${label}.`
  //             );
  //         }

  //         const chosen =
  //             validOptions[Math.floor(Math.random() * validOptions.length)];

  //         // Use Selenium's native select operation, not JS value assignment.
  //         await select.selectByValue(chosen.value);

  //         // Wait until Selenium can read the chosen option as selected.
  //         await driver.wait(async () => {
  //             try {
  //                 const freshDropdown = await driver.findElement(locator);
  //                 const freshSelect = new Select(freshDropdown);
  //                 const selected = await freshSelect.getFirstSelectedOption();
  //                 const selectedValue = await selected.getAttribute("value");

  //                 return selectedValue === chosen.value;
  //             } catch {
  //                 return false;
  //             }
  //         }, timeout, `${label} courier selection did not update`);

  //         // Allow Angular to process the selection and update validation.
  //         await driver.wait(async () => {
  //             try {
  //                 const freshDropdown = await driver.findElement(locator);

  //                 const invalid = await freshDropdown.getAttribute("aria-invalid");
  //                 const classes = await freshDropdown.getAttribute("class") || "";

  //                 return invalid !== "true" &&
  //                     !classes.includes("ng-invalid-required");
  //             } catch {
  //                 return false;
  //             }
  //         }, timeout, `${label} courier selection is still invalid`);

  //         console.log(
  //             `✓ ${label} courier selected: ${chosen.text} (${chosen.value})`
  //         );

  //         return chosen;
  //     };

  //     await selectRandomCourier(
  //         outgoingCourierLocator,
  //         "Outgoing"
  //     );

  //     await selectRandomCourier(
  //         incomingCourierLocator,
  //         "Incoming"
  //     );

  //     // Upload both shipping-label files.
  //     const outgoingFilePath = path.resolve(
  //         process.cwd(),
  //         "assets",
  //         "sample.pdf"
  //     );

  //     const incomingFilePath = path.resolve(
  //         process.cwd(),
  //         "assets",
  //         "coverletter.pdf"
  //     );

  //     if (!fs.existsSync(outgoingFilePath)) {
  //         throw new Error(`Outgoing label file not found: ${outgoingFilePath}`);
  //     }

  //     if (!fs.existsSync(incomingFilePath)) {
  //         throw new Error(`Incoming label file not found: ${incomingFilePath}`);
  //     }

  //     const outgoingFile = await driver.findElement(outgoingFileLocator);
  //     const incomingFile = await driver.findElement(incomingFileLocator);

  //     await outgoingFile.sendKeys(outgoingFilePath);
  //     console.log("✓ Uploaded outgoing label file.");

  //     await incomingFile.sendKeys(incomingFilePath);
  //     console.log("✓ Uploaded incoming label file.");

  //     // Verify the tracking IDs remain populated.
  //     await driver.wait(async () => {
  //         try {
  //             const outgoing = await driver.findElement(
  //                 outgoingTrackingLocator
  //             );
  //             const incoming = await driver.findElement(
  //                 incomingTrackingLocator
  //             );

  //             return (
  //                 (await outgoing.getAttribute("value")) === outgoingTrackingId &&
  //                 (await incoming.getAttribute("value")) === incomingTrackingId
  //             );
  //         } catch {
  //             return false;
  //         }
  //     }, timeout, "Tracking numbers were not retained by the form");

  //     // Wait for the loading spinner to disappear.
  //     await this.waitForLoadingToFinish(timeout);

  //     // Wait for Save & Complete to become enabled in the application.
  //     const saveButton = await driver.wait(
  //         until.elementLocated(saveButtonLocator),
  //         timeout,
  //         "Save & Complete button was not found"
  //     );

  //     await driver.wait(async () => {
  //         try {
  //             const button = await driver.findElement(saveButtonLocator);
  //             const enabled = await button.isEnabled();
  //             const ariaDisabled = await button.getAttribute("aria-disabled");

  //             return enabled && ariaDisabled !== "true";
  //         } catch {
  //             return false;
  //         }
  //     }, timeout,
  //     "Save & Complete remains disabled. Check the required form fields.");

  //     await this.waitForLoadingToFinish(timeout);

  //     console.log("✓ Save & Complete is enabled. Submitting shipping labels...");

  //     const currentSaveButton = await driver.findElement(saveButtonLocator);

  //     await driver.executeScript(
  //         "arguments[0].scrollIntoView({block:'center'});",
  //         currentSaveButton
  //     );

  //     await currentSaveButton.click();

  //     // Wait for the popup to close and the save operation to finish.
  //     await driver.wait(async () => {
  //         try {
  //             const popups = await driver.findElements(popup);

  //             if (popups.length === 0) {
  //                 return true;
  //             }

  //             return !(await popups[0].isDisplayed().catch(() => false));
  //         } catch {
  //             return true;
  //         }
  //     }, timeout, "Shipping Label popup did not close after saving");

  //     await this.waitForLoadingToFinish(timeout);

  //     console.log("✓ Shipping labels saved successfully.");

  //     return {
  //         outgoingTrackingId,
  //         incomingTrackingId
  //     };
  // }

  
async completeCourierOrderWithShippingLabels() {
    const path = require("path");
    const fs = require("fs");
    const driver = this.driver;
    const timeout = 120000;

    console.log(
        "\n========== Complete Courier Order with Shipping Labels =========="
    );

    const popup = By.xpath(
        "//form[@name='existingLabelForm']"
    );

    const saveButtonLocator = By.css(
        "form[name='existingLabelForm'] " +
        "button[ng-click='saveOutsideGeneratedLabel()']"
    );

    try {
        // 1. Wait for the shipping-label popup and form to appear.
        console.log("Waiting for Generate Shipping Label popup...");

        const form = await driver.wait(
            until.elementLocated(popup),
            30000,
            "Generate Shipping Label form was not found."
        );

        await driver.wait(
            until.elementIsVisible(form),
            15000,
            "Generate Shipping Label form is not visible."
        );

        console.log("✓ Shipping-label popup is visible.");

        // Wait for initial loading to finish.
        await this.waitForLoadingToFinish(timeout);

        // 2. Locate tracking fields and courier dropdowns.
        const outgoingTracking = await driver.findElement(
            By.css(
                "form[name='existingLabelForm'] " +
                "input[ng-model='outSideGeneratedLabel.trackCardNumber']"
            )
        );

        const incomingTracking = await driver.findElement(
            By.css(
                "form[name='existingLabelForm'] " +
                "input[ng-model='incomingLabel.trackCardNumber']"
            )
        );

        const outgoingCourier = await driver.findElement(
            By.css(
                "form[name='existingLabelForm'] " +
                "select[ng-model='outSideGeneratedLabel.courier']"
            )
        );

        const incomingCourier = await driver.findElement(
            By.css(
                "form[name='existingLabelForm'] " +
                "select[ng-model='incomingLabel.courier']"
            )
        );

        // 3. Enter unique tracking numbers.
        const runId = Date.now();
        const outgoingTrackingNumber = `OUT${runId}`;
        const incomingTrackingNumber = `IN${runId}`;

        await outgoingTracking.clear();
        await outgoingTracking.sendKeys(outgoingTrackingNumber);

        await incomingTracking.clear();
        await incomingTracking.sendKeys(incomingTrackingNumber);

        console.log(`✓ Outgoing tracking number: ${outgoingTrackingNumber}`);
        console.log(`✓ Incoming tracking number: ${incomingTrackingNumber}`);

        // 4. Select a valid courier option.
        const selectRandomCourier = async (dropdown, label) => {
            await driver.wait(
                until.elementIsEnabled(dropdown),
                15000,
                `${label} courier dropdown is not enabled.`
            );

            const select = new Select(dropdown);
            const options = await select.getOptions();
            const validOptions = [];

            for (const option of options) {
                const value = await option.getAttribute("value");
                const text = (await option.getText()).trim();
                const disabled = await option.getAttribute("disabled");

                if (
                    value &&
                    value.trim() !== "" &&
                    text &&
                    disabled === null
                ) {
                    validOptions.push({
                        value: value.trim(),
                        text
                    });
                }
            }

            if (!validOptions.length) {
                throw new Error(
                    `No valid courier options found for ${label}.`
                );
            }

            const chosen =
                validOptions[
                    Math.floor(Math.random() * validOptions.length)
                ];

            await select.selectByValue(chosen.value);

            await driver.wait(async () => {
                const selected = await dropdown.getAttribute("value");
                return selected === chosen.value;
            }, 15000, `${label} courier selection did not update.`);

            console.log(
                `✓ ${label} courier selected: ${chosen.text} (${chosen.value})`
            );
        };

        await selectRandomCourier(outgoingCourier, "Outgoing");
        await selectRandomCourier(incomingCourier, "Incoming");

        // Wait for any loading triggered by the courier selections.
        await this.waitForLoadingToFinish(timeout);

        // 5. Upload the shipping-label files.
        const outgoingFilePath = path.resolve(
            process.cwd(),
            "assets",
            "sample.pdf"
        );

        const incomingFilePath = path.resolve(
            process.cwd(),
            "assets",
            "coverletter.pdf"
        );

        if (!fs.existsSync(outgoingFilePath)) {
            throw new Error(
                `Outgoing label file not found: ${outgoingFilePath}`
            );
        }

        if (!fs.existsSync(incomingFilePath)) {
            throw new Error(
                `Incoming label file not found: ${incomingFilePath}`
            );
        }

        const outgoingFile = await driver.findElement(
            By.css(
                "form[name='existingLabelForm'] " +
                "input[type='file'][name='service_id']"
            )
        );

        const incomingFile = await driver.findElement(
            By.css(
                "form[name='existingLabelForm'] " +
                "input[type='file'][name='service_inc']"
            )
        );

        await outgoingFile.sendKeys(outgoingFilePath);
        console.log("✓ Uploaded outgoing label file.");

        await incomingFile.sendKeys(incomingFilePath);
        console.log("✓ Uploaded incoming label file.");

        // 6. Wait for the popup's asynchronous processing to finish.
        console.log("Waiting for shipping-label processing...");

        await this.waitForLoadingToFinish(timeout);

        // Verify tracking numbers and courier selections remain populated.
        await driver.wait(async () => {
            return await driver.executeScript(() => {
                const formElement = document.querySelector(
                    "form[name='existingLabelForm']"
                );

                if (!formElement) return false;

                const requiredModels = [
                    "outSideGeneratedLabel.trackCardNumber",
                    "outSideGeneratedLabel.courier",
                    "incomingLabel.trackCardNumber",
                    "incomingLabel.courier"
                ];

                return requiredModels.every(model => {
                    const element = formElement.querySelector(
                        `[ng-model="${model}"]`
                    );

                    return element &&
                        String(element.value || "").trim() !== "";
                });
            });
        }, 30000, "Shipping-label fields were not ready.");

        // Allow Angular to process the latest form changes.
        await driver.sleep(1000);

        // 7. Read the real Angular validation state.
        const saveButton = await driver.findElement(saveButtonLocator);

        await driver.wait(
            until.elementIsVisible(saveButton),
            10000
        );

        const diagnostics = await driver.executeScript(button => {
            const formElement = button.closest(
                "form[name='existingLabelForm']"
            );

            const angular = window.angular;
            const scope = formElement && angular
                ? angular.element(formElement).scope()
                : null;

            const formController =
                scope?.existingLabelForm ||
                (formElement && angular
                    ? angular.element(formElement).controller("form")
                    : null);

            return {
                buttonDisabled: button.disabled,
                ariaDisabled: button.getAttribute("aria-disabled"),
                ngDisabled: button.getAttribute("ng-disabled"),
                formInvalid: formController?.$invalid ?? null,
                serviceIdRequiredError:
                    formController?.service_id?.$error?.required ?? null,
                controls: formElement
                    ? Array.from(
                        formElement.querySelectorAll(
                            "[name='service_id'], [name='service_inc']"
                        )
                    ).map(element => ({
                        tag: element.tagName,
                        name: element.name,
                        model: element.getAttribute("ng-model"),
                        value: element.value,
                        required: element.required
                    }))
                    : []
            };
        }, saveButton);

        console.log("========== Shipping Label Diagnostics ==========");
        console.dir(diagnostics, { depth: null });

        // Do not bypass application validation.
        if (diagnostics.buttonDisabled) {
            throw new Error(
                "Save & Complete is disabled after loading. " +
                "Check the Angular validation diagnostics above."
            );
        }

        // 8. Click Save & Complete.
        await driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            saveButton
        );

        await saveButton.click();

        console.log("✓ Clicked Save & Complete.");

        // 9. Wait for the popup to close.
        await driver.wait(async () => {
            const forms = await driver.findElements(popup);

            if (!forms.length) return true;

            return !(await forms[0]
                .isDisplayed()
                .catch(() => false));
        }, timeout, "Shipping-label popup did not close after saving.");

        // Wait for the resulting page update to finish.
        await this.waitForLoadingToFinish(timeout);

        console.log("✓ Shipping labels submitted successfully.");

        return {
            outgoingTrackingNumber,
            incomingTrackingNumber
        };
    } catch (error) {
        console.error(
            `❌ Failed to complete shipping labels: ${error.message}`
        );
        throw error;
    }
}


  async waitForShippingLabelLoading(timeout = 30000) {
    await this.driver.wait(
      async () => {
        return await this.driver.executeScript(() => {
          const selectors = [
            ".loading-spiner-holder.theme-loading-spiner-holder",
            ".loading",
            ".loader",
            ".spinner",
            ".loading-spinner",
            ".preloader",
          ];

          const isVisible = (element) => {
            const style = window.getComputedStyle(element);

            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              Number(style.opacity) !== 0 &&
              element.getClientRects().length > 0
            );
          };

          return !selectors.some((selector) =>
            Array.from(document.querySelectorAll(selector)).some(isVisible),
          );
        });
      },
      timeout,
      "Shipping-label loading did not finish.",
    );

    // Give Angular time to update the form after loading.
    await this.driver.sleep(500);
  }
}

module.exports = DropOffDetail;
