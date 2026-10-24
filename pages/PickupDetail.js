
const { By, until, Select  } = require("selenium-webdriver");

class PickupDetail {
    constructor(driver) {
        this.driver = driver;
        this.url =
            "https://wcsstestclient.azurewebsites.net/p/pickup";

        this.pickupPanel = By.css("div.pickup");
        this.completedPanel = By.css("div.completed-docs");

        this.pickupExport = By.css(
            "div.pickup button[ng-click*='exportDetails']"
        );
        this.completedExport = By.css(
            "div.completed-docs button[ng-click*='exportDetails']"
        );

        this.pickupPrintDocs = By.css(
            "div.pickup a[ng-click*=\"print('PICK')\"]"
        );
        this.completedPrintDocs = By.css(
            "div.completed-docs a[ng-click*=\"print('COMP')\"]"
        );

        this.errorToast = By.css(
            "#toast-container .toast-message, .toast-message"
        );

    //     this.documentFilterDropdown = By.css(
    //     'select[ng-options*="quickFilter.caption"]'
        // );
        
        // Pickup page: Show Documents For dropdown
        this.documentFilterDropdown = By.xpath(
            "//select[option[normalize-space(.)='All Documents']]"
        );

    }

    async waitForLoadingToFinish(timeout = 60000) {
        await this.driver.wait(async () => {
            return this.driver.executeScript(() => {
                const selectors = [
                    ".loading-spiner-holder",
                    ".loading",
                    ".loader",
                    ".spinner",
                    ".loading-spinner",
                    ".preloader"
                ];

                return selectors.every(selector =>
                    Array.from(
                        document.querySelectorAll(selector)
                    ).every(el => {
                        const style = getComputedStyle(el);

                        return (
                            style.display === "none" ||
                            style.visibility === "hidden" ||
                            style.opacity === "0" ||
                            el.offsetWidth === 0 ||
                            el.offsetHeight === 0
                        );
                    })
                );
            });
        }, timeout, "Loading spinner did not disappear.");
    }

    async open() {
        await this.driver.get(this.url);

        await this.driver.wait(
            until.urlContains("/p/pickup"),
            60000
        );

        await this.driver.wait(
            until.elementLocated(this.pickupPanel),
            30000,
            "Pickup Queue panel did not load."
        );

        await this.driver.wait(
            until.elementLocated(this.completedPanel),
            30000,
            "Completed panel did not load."
        );

        await this.waitForLoadingToFinish();

        console.log("✓ Pickup page loaded successfully.");
    }

    async getDocumentCount(panelLocator) {
        const panel = await this.driver.findElement(panelLocator);

        return this.driver.executeScript(element => {
            const text = element.innerText || "";

            if (/no documents found/i.test(text)) {
                return 0;
            }

            const rows = Array.from(
                element.querySelectorAll("tr")
            );

            return rows.filter(row => {
                const cells = row.querySelectorAll("td");
                const rowText = (row.innerText || "").trim();

                return (
                    cells.length > 0 &&
                    rowText.length > 0 &&
                    !/no documents found/i.test(rowText)
                );
            }).length;
        }, panel);
    }

    async getPanelText(panelLocator) {
        const panel = await this.driver.findElement(panelLocator);
        return (await panel.getText()).trim();
    }

    async clickVisible(locator, description) {
        await this.waitForLoadingToFinish();

        const element = await this.driver.wait(
            until.elementLocated(locator),
            30000,
            `${description} button was not found.`
        );

        await this.driver.wait(
            until.elementIsVisible(element),
            15000,
            `${description} button is not visible.`
        );

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        );

        await this.driver.wait(
            until.elementIsEnabled(element),
            10000
        );

        try {
            await element.click();
        } catch (error) {
            await this.driver.executeScript(
                "arguments[0].click();",
                element
            );
        }
    }

    async waitForNoDocumentsMessage(timeout = 10000) {
        await this.driver.wait(async () => {
            const messages = await this.driver.findElements(
                this.errorToast
            );

            for (const message of messages) {
                if (
                    await message.isDisplayed().catch(() => false)
                ) {
                    const text = (await message.getText()).trim();

                    if (/no documents found/i.test(text)) {
                        return true;
                    }
                }
            }

            return false;
        }, timeout, 'Expected error "No documents found." was not displayed.');

        console.log('✓ Application displayed: "No documents found."');
    }

    async clickPickupExport() {
        await this.clickVisible(
            this.pickupExport,
            "Pickup Queue Export"
        );
    }

    async clickCompletedExport() {
        await this.clickVisible(
            this.completedExport,
            "Completed Export"
        );
    }

    async clickPickupPrintDocs() {
        await this.clickVisible(
            this.pickupPrintDocs,
            "Pickup Queue Print Docs"
        );
    }

    async clickCompletedPrintDocs() {
        await this.clickVisible(
            this.completedPrintDocs,
            "Completed Print Docs"
        );
    }

 // Select a document filter from "Show Documents For"
async selectDocumentFilter(filterName) {
    await this.waitForLoadingToFinish();

    // Find the dropdown by its actual option text instead of
    // depending on Angular attributes.
    const dropdown = await this.driver.wait(
        async () => {
            const dropdowns = await this.driver.findElements(
                this.documentFilterDropdown
            );

            for (const element of dropdowns) {
                if (!(await element.isDisplayed().catch(() => false))) {
                    continue;
                }

                const options = await element.findElements(
                    By.css("option")
                );

                const optionTexts = [];

                for (const option of options) {
                    optionTexts.push(
                        (await option.getText()).trim()
                    );
                }

                if (
                    optionTexts.includes("All Documents") &&
                    optionTexts.includes(filterName)
                ) {
                    console.log(
                        "Pickup document filter options:",
                        optionTexts
                    );

                    return element;
                }
            }

            return false;
        },
        20000,
        `Pickup document filter dropdown containing "${filterName}" was not found.`
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block: 'center'});",
        dropdown
    );

    const select = new Select(dropdown);

    await select.selectByVisibleText(filterName);

    // Verify that the requested option was selected.
    await this.driver.wait(
        async () => {
            const selectedOption =
                await select.getFirstSelectedOption();

            return (
                (await selectedOption.getText()).trim() === filterName
            );
        },
        10000,
        `Could not select Pickup document filter: ${filterName}`
    );

    console.log(`✓ Selected Pickup document filter: ${filterName}`);

    // Wait for the filter results to refresh.
    await this.waitForLoadingToFinish();
}

// ======================================================
// GET TOTAL DISPLAYED IN A PICKUP PANEL
// ======================================================

   // ======================================================
// GET TOTAL DISPLAYED IN A PICKUP PANEL
// ======================================================
async getSectionTotal(panelName) {
    const panelSelectors = {
        "Pickup Queue": "div.pickup",
        "Completed": "div.completed-docs"
    };

    const panelSelector = panelSelectors[panelName];

    if (!panelSelector) {
        throw new Error(
            `Unknown panel "${panelName}". Use "Pickup Queue" or "Completed".`
        );
    }

    await this.waitForLoadingToFinish();

    // Wait until the requested panel is visible and its Total is rendered.
    await this.driver.wait(
        async () => {
            try {
                const panels = await this.driver.findElements(
                    By.css(panelSelector)
                );

                for (const panel of panels) {
                    if (!(await panel.isDisplayed())) {
                        continue;
                    }

                    const panelText = (await panel.getText())
                        .replace(/\u00a0/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();

                    if (/Total\s*:\s*[\d,]+/i.test(panelText)) {
                        return true;
                    }
                }

                return false;
            } catch (error) {
                return false;
            }
        },
        60000,
        `${panelName} total count did not load.`
    );

    // Read the count from the visible panel.
    const panels = await this.driver.findElements(
        By.css(panelSelector)
    );

    for (const panel of panels) {
        if (!(await panel.isDisplayed())) {
            continue;
        }

        const panelText = (await panel.getText())
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const match = panelText.match(
            /Total\s*:\s*([\d,]+)/i
        );

        if (match) {
            const total = Number(match[1].replace(/,/g, ""));

            if (Number.isFinite(total)) {
                console.log(
                    `✓ ${panelName} Total: ${total}`
                );

                return total;
            }
        }
    }

    throw new Error(
        `Could not read ${panelName} total from panel text.`
    );
}
    
    
    async getPanelTotalCount(panelLocator) {
    const panel = await this.driver.wait(
        until.elementLocated(panelLocator),
        10000,
        "Document panel was not found."
    );

    await this.driver.wait(
        until.elementIsVisible(panel),
        10000,
        "Document panel is not visible."
    );

    const panelText = await panel.getText();

    const match = panelText.match(/Total:\s*([\d,]+)/i);

    if (!match) {
        throw new Error(
            `Could not read the Total count from panel. Panel text: ${panelText}`
        );
    }

    return Number(match[1].replace(/,/g, ""));
}

// Get counts for both Pickup Queue and Completed.
async getDocumentFilterCounts() {
    await this.waitForLoadingToFinish();

    const pickupCount = await this.getPanelTotalCount(
        this.pickupPanel
    );

    const completedCount = await this.getPanelTotalCount(
        this.completedPanel
    );

    return {
        pickupCount,
        completedCount
    };
    }
    
    

async selectDocumentCategory(category) {
  console.log(`\n========== Selecting Pickup document category: ${category} ==========`);

  const driver = this.driver;

  // Locate the native category dropdown using its Angular model.
  const categoryDropdown = By.css(
    'select[ng-model="searchOptions.quick2Filter"]'
  );

  // Wait until the dropdown is present and has loaded its options.
  const dropdown = await driver.wait(
    until.elementLocated(categoryDropdown),
    15000,
    "Pickup document category dropdown was not found."
  );

  await driver.wait(
    async () => {
      const options = await dropdown.findElements(By.css("option"));
      return options.length > 1;
    },
    15000,
    "Pickup document category options did not load."
  );

  await driver.wait(until.elementIsVisible(dropdown), 10000);

  const select = new Select(dropdown);

  // Read the actual option labels and trim whitespace.
  const options = await select.getOptions();
  const availableCategories = [];

  for (const option of options) {
    const text = (await option.getText()).trim();

    if (text) {
      availableCategories.push(text);
    }
  }

  console.log("Pickup document categories:", availableCategories);

  const targetCategory = category.trim().toLowerCase();

  const matchingOption = options.find(async option => {
    return (await option.getText()).trim().toLowerCase() === targetCategory;
  });

  // Use a regular loop because Array.find does not await async callbacks.
  let matchedText = null;

  for (const option of options) {
    const text = (await option.getText()).trim();

    if (text.toLowerCase() === targetCategory) {
      matchedText = text;
      break;
    }
  }

  if (!matchedText) {
    throw new Error(
      `Category "${category}" was not found. Available categories: ${
        availableCategories.join(", ") || "(none)"
      }`
    );
  }

  await select.selectByVisibleText(matchedText);

  // Wait for Angular to reflect the selected option.
  await driver.wait(
    async () => {
      const selected = await select.getFirstSelectedOption();
      return (
        (await selected.getText()).trim().toLowerCase() === targetCategory
      );
    },
    10000,
    `Pickup document category "${category}" was not selected.`
  );

  console.log(`✓ Selected Pickup document category: ${matchedText}`);

  // Allow the page's Angular filter to update the document totals.
  await driver.sleep(1000);

  return matchedText;
    }
    
    async getPickupQueueTotal() {
  const totalLocator = By.xpath(
    "//div[contains(@class,'pickup-docs')]" +
    "//div[@ng-show=\"pickupQueue != null\"]" +
    "//strong[contains(normalize-space(.),'Total:')]" +
    "/following-sibling::strong[1]"
  );

  const element = await this.driver.wait(
    until.elementLocated(totalLocator),
    15000,
    "Pickup Queue total count was not found."
  );

  await this.driver.wait(
    until.elementIsVisible(element),
    10000,
    "Pickup Queue total count is not visible."
  );

  const total = (await element.getText()).trim();

  if (!/^\d+$/.test(total)) {
    throw new Error(`Invalid Pickup Queue total: "${total}"`);
  }

  return Number(total);
}

async getCompletedTotal() {
  const totalLocator = By.xpath(
    "//div[contains(@class,'completed-docs')]" +
    "//div[@ng-show=\"completed != null\"]" +
    "//strong[contains(normalize-space(.),'Total:')]" +
    "/following-sibling::strong[1]"
  );

  const element = await this.driver.wait(
    until.elementLocated(totalLocator),
    15000,
    "Completed total count was not found."
  );

  await this.driver.wait(
    until.elementIsVisible(element),
    10000,
    "Completed total count is not visible."
  );

  const total = (await element.getText()).trim();

  if (!/^\d+$/.test(total)) {
    throw new Error(`Invalid Completed total: "${total}"`);
  }

  return Number(total);
}




}

module.exports = PickupDetail;
