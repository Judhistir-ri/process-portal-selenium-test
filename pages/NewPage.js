const { By, until, Key } = require("selenium-webdriver");

class NewPage {
  constructor(driver) {
    this.driver = driver;

    this.newUrl = "https://wcsstestclient.azurewebsites.net/p/new";

    // ==========================================
    // PAGE
    // ==========================================

    this.pageMarker = By.xpath(
      "//h1[normalize-space()='New'] | " +
        "//h2[normalize-space()='New'] | " +
        "//span[normalize-space()='New'] | " +
        "//button[normalize-space()='New']",
    );

    // ==========================================
    // CUSTOMER
    // ==========================================

    this.customerInput = By.xpath(
      "//label[contains(normalize-space(),'Customer')]/following::input[1]",
    );

    this.customerOption = (customer) =>
      By.xpath(
        "//*[self::li or self::div or self::span]" +
          "[normalize-space()=" +
          this.xpathString(customer) +
          "]",
      );

    // ==========================================
    // CONTACT
    // ==========================================

    this.contactInput = By.xpath(
      "//label[contains(normalize-space(),'Contact')]/following::input[1]",
    );

    this.contactOption = (contact) =>
      By.xpath(
        "//*[self::li or self::div or self::span]" +
          "[normalize-space()=" +
          this.xpathString(contact) +
          "]",
      );

    // ==========================================
    // DROPDOWNS
    // ==========================================

    this.destinationDropdown = By.xpath(
      "//label[contains(normalize-space(),'Destination')]/following::select[1]",
    );

    this.categoryDropdown = By.xpath(
      "//label[contains(normalize-space(),'Category')]/following::select[1]",
    );

    this.originStateDropdown = By.xpath(
      "//label[contains(normalize-space(),'Origin State')]/following::select[1]",
    );

    this.documentTypeDropdown = By.xpath(
      "//label[contains(normalize-space(),'Document Type')]/following::select[1]",
    );

    // ==========================================
    // ADDITIONAL SERVICES
    // ==========================================

    // this.rushCheckbox = By.xpath(
    //   "//label[contains(normalize-space(),'RUSH')]//input[@type='checkbox'] | " +
    //     "//input[@type='checkbox'][following-sibling::*[contains(normalize-space(),'RUSH')]]",
    // );

    // this.prescanCheckbox = By.xpath(
    //   "//label[contains(normalize-space(),'PRESCAN')]//input[@type='checkbox'] | " +
    //     "//input[@type='checkbox'][following-sibling::*[contains(normalize-space(),'PRESCAN')]]",
    // );

    // this.postscanCheckbox = By.xpath(
    //   "//label[contains(normalize-space(),'POSTSCAN')]//input[@type='checkbox'] | " +
    //     "//input[@type='checkbox'][following-sibling::*[contains(normalize-space(),'POSTSCAN')]]",
    // );

    // ==========================================
// ADDITIONAL SERVICES
// ==========================================

this.rushCheckbox = By.css(
    'input[type="checkbox"][ng-model="newDocument.isRush"]'
);

this.prescanCheckbox = By.css(
    'input[type="checkbox"][ng-model="newDocument.isScan"]'
);

this.postscanCheckbox = By.css(
    'input[type="checkbox"][ng-model="newDocument.isPostScan"]'
);

    // ==========================================
    // PAGES
    // ==========================================

    this.pagesInput = By.xpath(
      "//input[contains(@placeholder,'page') or contains(@placeholder,'Page')]",
    );

    // ==========================================
    // DESCRIPTION
    // ==========================================

    this.descriptionInput = By.xpath(
      "//label[contains(normalize-space(),'Description')]/following::textarea[1] | " +
        "//textarea[contains(@placeholder,'Description')]",
    );

    // ==========================================
    // NOTE
    // ==========================================

    this.noteInput = By.xpath(
      "//label[contains(normalize-space(),'Note')]/following::textarea[1] | " +
        "//textarea[contains(@placeholder,'Note')]",
    );

    // ==========================================
    // STOPS
    // ==========================================

    this.stopDropdown = By.xpath(
      "//label[contains(normalize-space(),'Stop')]/following::select[1] | " +
        "//select[contains(@name,'stop') or contains(@id,'stop')]",
    );

    // ==========================================
    // SAVE
    // ==========================================

    this.saveButton = By.xpath(
      "//button[normalize-space()='Save'] | " +
        "//input[@type='button' and @value='Save'] | " +
        "//input[@type='submit' and @value='Save']",
    );

    // ==========================================
    // DOCUMENT LIST
    // ==========================================

    this.documentList = By.xpath(
      "//*[contains(normalize-space(),'Document List')]",
    );
  }

  // =====================================================
  // Helper - XPath string
  // =====================================================

  xpathString(value) {
    if (!value.includes("'")) {
      return `'${value}'`;
    }

    if (!value.includes('"')) {
      return `"${value}"`;
    }

    const parts = value.split("'");

    return "concat('" + parts.join("', \"'\", '") + "')";
  }

  // =====================================================
  // Wait
  // =====================================================

  async waitForPage() {
    console.log("------------------------------------------");
    console.log("Waiting for New Order page...");
    console.log("------------------------------------------");

    // Wait for URL first.
    await this.driver.wait(until.urlContains("/p/new"), 120000);

    console.log("✓ New page URL detected.");

    // Give Angular time to finish route rendering.
    await this.driver.sleep(2000);

    // Wait for page marker.
    try {
      await this.driver.wait(until.elementLocated(this.pageMarker), 60000);

      console.log("✓ New page UI detected.");
    } catch (error) {
      console.log(
        "Page marker was not found, continuing because URL is correct.",
      );
    }

    await this.waitForLoadingToFinish();

    await this.driver.sleep(2000);

    console.log("✓ New Order page ready.");
  }

  // =====================================================
  // Loading spinner
  // =====================================================

  // async waitForLoadingToFinish(timeout = 120000) {
  //   console.log("Waiting for loading spinner...");

  //   try {
  //     await this.driver.wait(async () => {
  //       try {
  //         return await this.driver.executeScript(() => {
  //           const selectors = [
  //             ".loading",
  //             ".loader",
  //             ".spinner",
  //             ".loading-spinner",
  //             ".preloader",
  //             "[aria-busy='true']",
  //             "i.fa.fa-spin.fa-spinner",
  //           ];

  //           for (const selector of selectors) {
  //             const elements = document.querySelectorAll(selector);

  //             for (const element of elements) {
  //               const style = window.getComputedStyle(element);

  //               const visible =
  //                 style.display !== "none" &&
  //                 style.visibility !== "hidden" &&
  //                 style.opacity !== "0" &&
  //                 element.offsetWidth > 0 &&
  //                 element.offsetHeight > 0;

  //               if (visible) {
  //                 return false;
  //               }
  //             }
  //           }

  //           return true;
  //         });
  //       } catch (error) {
  //         // During Angular re-render the renderer can
  //         // temporarily detach. Keep waiting.
  //         return false;
  //       }
  //     }, timeout);

  //     console.log("✓ Loading finished.");
  //   } catch (error) {
  //     console.log("Loading spinner timeout reached. Continuing...");
  //   }
  // }

  async waitForLoadingToFinish(timeout = 120000) {
    console.log("Waiting for loading spinner...");

    await this.driver.wait(
        async () => {
            try {
                return await this.driver.executeScript(() => {

                    const selectors = [
                        ".loading-spiner-holder",
                        ".theme-loading-spiner-holder",
                        ".loading",
                        ".loader",
                        ".spinner",
                        ".loading-spinner",
                        ".preloader",
                        "[aria-busy='true']",
                        "i.fa.fa-spin.fa-spinner"
                    ];

                    for (const selector of selectors) {

                        const elements =
                            document.querySelectorAll(selector);

                        for (const element of elements) {

                            const style =
                                window.getComputedStyle(element);

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

        },
        timeout,
        "Loading spinner did not disappear"
    );

    console.log("✓ Loading finished.");
  }
  

  // =====================================================
  // Safe element wait
  // =====================================================

  async waitForElement(locator, timeout = 30000) {
    const element = await this.driver.wait(
      until.elementLocated(locator),
      timeout,
    );

    await this.driver.wait(until.elementIsVisible(element), timeout);

    return element;
  }

  async getOriginValue() {
    const origin = await this.driver.findElement(By.id("countryOfOrigin"));

    const selectedOption = await origin.findElement(By.css("option:checked"));

    return await selectedOption.getText();
  }

  // =====================================================
  // Customer
  // =====================================================
  async selectCustomer(customerName) {
    console.log(`\nSelecting customer: ${customerName}`);

    // ==========================================
    // 1. Find Customer autocomplete input
    // ==========================================

    const customerInput = By.xpath(
      "//input[@placeholder='Select Customer' and @aria-label='Select Customer']",
    );

    const input = await this.driver.wait(
      until.elementLocated(customerInput),
      20000,
    );

    await this.driver.wait(until.elementIsVisible(input), 10000);

    await this.driver.wait(until.elementIsEnabled(input), 10000);

    // ==========================================
    // 2. Click input
    // ==========================================

    await input.click();

    // ==========================================
    // 3. Clear existing value
    // ==========================================

    await input.clear();

    // ==========================================
    // 4. Type customer name
    // ==========================================

    await input.sendKeys(customerName);

    console.log(`Typed customer: ${customerName}`);

    // ==========================================
    // 5. Wait for autocomplete suggestion
    // ==========================================

    const suggestion = By.xpath(
      "//*[(@role='option' or contains(@class,'md-autocomplete-suggestion') or contains(@class,'md-virtual-repeat'))]" +
        "//*[normalize-space()='" +
        customerName +
        "']",
    );

    console.log("Waiting for customer suggestion...");

    const suggestionElement = await this.driver.wait(
      until.elementLocated(suggestion),
      30000,
    );

    await this.driver.wait(until.elementIsVisible(suggestionElement), 10000);

    console.log(`Customer suggestion found: ${customerName}`);

    // ==========================================
    // 6. Wait for WCS spinner to disappear
    // ==========================================

    await this.waitForLoadingToFinish();

    // Small synchronization
    await this.driver.sleep(500);

    // ==========================================
    // 7. Click suggestion
    // ==========================================

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      suggestionElement,
    );

    try {
      await suggestionElement.click();
    } catch (error) {
      console.log("Normal click failed. Trying JavaScript click...");

      await this.driver.executeScript(
        "arguments[0].click();",
        suggestionElement,
      );
    }

    console.log(`✓ Customer selected: ${customerName}`);

    // ==========================================
    // 8. Wait for customer processing
    // ==========================================

    await this.waitForLoadingToFinish();

    await this.driver.sleep(1000);

    console.log("✓ Customer selection completed.");
  }

  //select contact
  async selectContact(contactName) {
    console.log("------------------------------------------");
    console.log(`Selecting Contact: ${contactName}`);
    console.log("------------------------------------------");

    // Contact input from your application
    const contactInput = By.xpath(
      "//input[@placeholder='Select Contact' and @role='combobox']",
    );

    await this.driver.wait(until.elementLocated(contactInput), 15000);

    const input = await this.driver.findElement(contactInput);

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      input,
    );

    await input.clear();

    // IMPORTANT:
    // Search ONLY by name
    await input.sendKeys(contactName);

    console.log(`✓ Typed contact name: ${contactName}`);

    console.log("Waiting for contact suggestions...");

    /*
     * Angular Material autocomplete.
     *
     * Do NOT search by email.
     * Do NOT use md-option.
     *
     * Get the autocomplete suggestion elements.
     */
    const suggestionLocator = By.xpath(
      "//*[contains(@class,'md-autocomplete-suggestion')]",
    );

    let firstSuggestion = null;

    await this.driver.wait(async () => {
      const suggestions = await this.driver.findElements(suggestionLocator);

      console.log(`Autocomplete elements found: ${suggestions.length}`);

      // Check only visible suggestions
      for (const suggestion of suggestions) {
        try {
          if (!(await suggestion.isDisplayed())) {
            continue;
          }

          const text = await suggestion.getText();

          console.log(`Visible suggestion: ${JSON.stringify(text)}`);

          // We only need the NAME.
          // Email is deliberately ignored.
          if (text && text.toLowerCase().includes(contactName.toLowerCase())) {
            firstSuggestion = suggestion;

            console.log("✓ Matching contact found");

            return true;
          }
        } catch (error) {
          // Element may disappear while Angular refreshes
        }
      }

      return false;
    }, 30000);

    if (!firstSuggestion) {
      throw new Error(`Contact suggestion '${contactName}' was not found`);
    }

    /*
     * IMPORTANT:
     *
     * If there are two results:
     *
     * 1. ranajit Sahoo
     *    ranajitsahoo@redintegro.com
     *
     * 2. Ranajit Sahoo
     *    ranajitsahoo123@redintegro.com
     *
     * The first matching visible element is selected.
     */

    console.log("Selecting FIRST matching contact...");

    await this.driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      firstSuggestion,
    );

    await this.driver.sleep(300);

    try {
      await firstSuggestion.click();
    } catch (error) {
      console.log("Normal click failed. Trying JavaScript click...");

      await this.driver.executeScript("arguments[0].click();", firstSuggestion);
    }

    await this.driver.sleep(500);

    console.log("✓ FIRST contact selected successfully");
  }

  // =====================================================
  // Native dropdown helper
  // =====================================================

  async selectDropdownByText(locator, text) {
    const select = await this.waitForElement(locator);

    const option = await select.findElement(
      By.xpath(`.//option[normalize-space()=${this.xpathString(text)}]`),
    );

    await option.click();

    await this.driver.sleep(1000);

    await this.waitForLoadingToFinish();
  }

  // =====================================================
  // Destination
  // =====================================================

  async selectDestination(country) {
    console.log(`Selecting Destination: ${country}`);

    await this.selectDropdownByText(this.destinationDropdown, country);

    console.log(`✓ Destination selected: ${country}`);
  }

  // =====================================================
  // Category
  // =====================================================

  async selectCategory(category) {
    console.log(`Selecting Category: ${category}`);

    await this.selectDropdownByText(this.categoryDropdown, category);

    console.log(`✓ Category selected: ${category}`);
  }

  // =====================================================
  // Origin State
  // =====================================================

 async selectOriginState(stateName) {
    console.log("------------------------------------------");
    console.log(`Selecting Origin State: ${stateName}`);
    console.log("------------------------------------------");

    // Wait for any previous loading to finish
    await this.waitForLoadingToFinish();

    // Find ALL originState dropdowns
    const dropdowns = await this.driver.findElements(
        By.css("select#originState")
    );

    console.log(`Origin State dropdowns found: ${dropdowns.length}`);

    let visibleDropdown = null;

    // Find the visible dropdown
    for (const dropdown of dropdowns) {
        try {
            if (await dropdown.isDisplayed()) {
                visibleDropdown = dropdown;
                console.log("✓ Visible Origin State dropdown found");
                break;
            }
        } catch (error) {
            // Ignore stale/hidden elements
        }
    }

    if (!visibleDropdown) {
        throw new Error(
            "Origin State dropdown was found but no visible dropdown exists"
        );
    }

    // Scroll it into view
    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block: 'center'});",
        visibleDropdown
    );

    await this.driver.sleep(500);

    // Get available options
    const options = await visibleDropdown.findElements(By.css("option"));

    console.log(`Origin State options found: ${options.length}`);

    let matchingOption = null;

    for (const option of options) {
        const text = (await option.getText()).trim();

        if (text.toLowerCase() === stateName.toLowerCase()) {
            matchingOption = option;
            console.log(`✓ Found Origin State: ${text}`);
            break;
        }
    }

    if (!matchingOption) {
        throw new Error(
            `Origin State '${stateName}' was not found in dropdown`
        );
    }

    // Click/select the option
    await matchingOption.click();

    await this.driver.sleep(500);

    console.log(`✓ Origin State selected: ${stateName}`);
    }
    
    

  // =====================================================
  // Document Type
  // =====================================================

  // async selectDocumentType(documentType) {
  //   console.log(`Selecting Document Type: ${documentType}`);

  //   await this.selectDropdownByText(this.documentTypeDropdown, documentType);

  //   console.log(`✓ Document Type selected: ${documentType}`);
  // }
  async selectDocumentType(documentTypeName) {
    console.log("------------------------------------------");
    console.log(`Selecting Document Type: ${documentTypeName}`);
    console.log("------------------------------------------");

    await this.waitForLoadingToFinish();

    const dropdown = await this.driver.findElement(
        By.id("documentType")
    );

    await this.driver.wait(
        until.elementIsVisible(dropdown),
        10000,
        "Document Type dropdown is not visible"
    );

    const options = await dropdown.findElements(
        By.css("option")
    );

    console.log(`Document Type options found: ${options.length}`);

    let matchingOption = null;

    for (const option of options) {
        const text = (await option.getText()).trim();
        const value = await option.getAttribute("value");

        console.log(`Option: "${text}" | value="${value}"`);

        if (text.toLowerCase() === documentTypeName.toLowerCase()) {
            matchingOption = option;
            break;
        }
    }

    if (!matchingOption) {
        throw new Error(
            `Document Type '${documentTypeName}' was not found`
        );
    }

    await matchingOption.click();

    console.log(`✓ Document Type selected: ${documentTypeName}`);
}

  // =====================================================
  // Checkbox helper
  // =====================================================

  // async checkCheckbox(locator, name) {
  //   console.log(`Selecting ${name}...`);

  //   const checkbox = await this.waitForElement(locator);

  //   if (!(await checkbox.isSelected())) {
  //     await checkbox.click();

  //     await this.driver.sleep(1000);

  //     await this.waitForLoadingToFinish();
  //   }

  //   console.log(`✓ ${name} selected.`);
  // }

  async checkCheckbox(locator, name) {

    console.log(`Selecting ${name}...`);

    // 1. Make sure any previous loading is completely finished
    await this.waitForLoadingToFinish();

    // 2. Locate checkbox
    const checkbox = await this.driver.wait(
        until.elementLocated(locator),
        30000,
        `${name} checkbox was not found`
    );

    // 3. Wait until checkbox is visible
    await this.driver.wait(
        until.elementIsVisible(checkbox),
        10000,
        `${name} checkbox is not visible`
    );

    // 4. Scroll checkbox into view
    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block: 'center'});",
        checkbox
    );

    await this.driver.sleep(300);

    // 5. IMPORTANT: check spinner again immediately before click
    await this.waitForLoadingToFinish();

    // 6. Check current state
    if (!(await checkbox.isSelected())) {

        try {

            await checkbox.click();

        } catch (error) {

            if (error.name === "ElementClickInterceptedError") {

                console.log(
                    `⚠ ${name} click intercepted. Waiting for spinner...`
                );

                // Wait for overlay to disappear
                await this.waitForLoadingToFinish();

                // Re-find element because Angular may have recreated it
                const freshCheckbox =
                    await this.driver.findElement(locator);

                await this.driver.executeScript(
                    "arguments[0].scrollIntoView({block: 'center'});",
                    freshCheckbox
                );

                await this.driver.sleep(300);

                await this.waitForLoadingToFinish();

                await freshCheckbox.click();

            } else {
                throw error;
            }
        }
    }

    console.log(`✓ ${name} selected`);

    // 7. Wait for fee calculation triggered by checkbox
    await this.driver.sleep(500);

    await this.waitForLoadingToFinish();
  }
  

  // =====================================================
  // Additional Services
  // =====================================================

  async selectAdditionalServices() {
    await this.checkCheckbox(this.rushCheckbox, "RUSH");

    await this.checkCheckbox(this.prescanCheckbox, "PRESCAN");

    await this.checkCheckbox(this.postscanCheckbox, "POSTSCAN");
  }

  // =====================================================
  // Number of Pages
  // =====================================================

  async enterNumberOfPages(numberOfPages) {
    console.log(`Entering Number of Pages: ${numberOfPages}`);

    const pages = await this.waitForElement(this.pagesInput);

    await pages.click();
    await pages.clear();
    await pages.sendKeys(String(numberOfPages));

    // Trigger Angular input/change event.
    await pages.sendKeys("\t");

    await this.driver.sleep(1500);

    await this.waitForLoadingToFinish();

    console.log("✓ Number of pages entered.");
  }

  // =====================================================
  // Description
  // =====================================================

  async enterDescription(description) {
    try {
      const element = await this.waitForElement(this.descriptionInput, 5000);

      await element.clear();
      await element.sendKeys(description);

      console.log("✓ Description entered.");
    } catch (error) {
      console.log("Description field not available. Skipping.");
    }
  }

  // =====================================================
  // Note
  // =====================================================

  async enterNote(note) {
    try {
      const element = await this.waitForElement(this.noteInput, 5000);

      await element.clear();
      await element.sendKeys(note);

      console.log("✓ Note entered.");
    } catch (error) {
      console.log("Note field not available. Skipping.");
    }
  }

  // =====================================================
  // Add Stop
  // =====================================================

  async addStop(stopName) {
    try {
      console.log(`Adding Stop: ${stopName}`);

      await this.selectDropdownByText(this.stopDropdown, stopName);

      console.log(`✓ Stop added: ${stopName}`);
    } catch (error) {
      console.log("Stop dropdown was not found. Skipping stop.");
    }
  }

  // =====================================================
  // Save Order
  // =====================================================

 async clickSave() {
    console.log("------------------------------------------");
    console.log("Saving New Order...");
    console.log("------------------------------------------");

    const saveButton = await this.driver.wait(
        until.elementLocated(By.css("button[ng-click='save()']")),
        10000
    );

    // Scroll Save button to the center of the screen
    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block: 'center', inline: 'center'});",
        saveButton
    );

    // Small wait for fixed footer/overlay to settle
    await this.driver.sleep(1000);

    // Check that button is displayed and enabled
    await this.driver.wait(async () => {
        try {
            return await saveButton.isDisplayed() &&
                   await saveButton.isEnabled();
        } catch (e) {
            return false;
        }
    }, 10000);

    // Use JavaScript click to avoid the fixed footer intercepting Selenium click
    await this.driver.executeScript(
        "arguments[0].click();",
        saveButton
    );

    console.log("✓ Save button clicked successfully");

    // Wait for save operation/loading to finish
    if (typeof this.waitForLoadingSpinner === "function") {
        await this.waitForLoadingSpinner();
    }

    await this.driver.sleep(1000);

    console.log("✓ New Order save operation completed");
}

  // =====================================================
  // Verify Document List
  // =====================================================

  async verifyDocumentList() {
    console.log("Checking Document List...");

    const documentList = await this.driver.wait(
      until.elementLocated(this.documentList),
      30000,
    );

    await this.driver.wait(until.elementIsVisible(documentList), 30000);

    console.log("✓ Document List is displayed.");

    return true;
  }

  async waitForNewOrderPageToFullyLoad(driver) {
    console.log("------------------------------------------");
    console.log("Waiting for New Order page to fully load...");
    console.log("------------------------------------------");

    // Wait until New Order URL is loaded
    await driver.wait(
      until.urlContains("/p/new"),
      30000,
      "New Order page URL was not loaded",
    );

    console.log("✓ New Order URL loaded");

    // Give Angular time to start rendering
    await driver.sleep(1500);

    const spinner = By.css(".loading-spinner-holder");

    // ==============================
    // FIRST LOADING
    // ==============================

    console.log("Waiting for first loading...");

    try {
      await driver.wait(
        async () => {
          const elements = await driver.findElements(spinner);

          if (elements.length === 0) {
            return true;
          }

          return !(await elements[0].isDisplayed());
        },
        30000,
        "First loading did not finish",
      );

      console.log("✓ First loading finished");
    } catch (error) {
      console.log("First loading check completed");
    }

    // ==============================
    // SECOND LOADING
    // ==============================

    console.log("Waiting for second loading...");

    // Important: allow the second loading to start
    await driver.sleep(2000);

    try {
      await driver.wait(
        async () => {
          const elements = await driver.findElements(spinner);

          if (elements.length === 0) {
            return true;
          }

          return !(await elements[0].isDisplayed());
        },
        30000,
        "Second loading did not finish",
      );

      console.log("✓ Second loading finished");
    } catch (error) {
      console.log("Second loading check completed");
    }

    // Final small wait
    await driver.sleep(1500);

    console.log("✓ New Order page completely ready");
    console.log("------------------------------------------");
  }

async selectAdditionalServices(driver) {
    console.log("------------------------------------------");
    console.log("Selecting RUSH, PRESCAN and POSTSCAN");
    console.log("------------------------------------------");

    const services = [
        {
            name: "RUSH",
            locator: By.css('input[type="checkbox"][ng-model="newDocument.isRush"]')
        },
        {
            name: "PRESCAN",
            locator: By.css('input[type="checkbox"][ng-model="newDocument.isScan"]')
        },
        {
            name: "POSTSCAN",
            locator: By.css('input[type="checkbox"][ng-model="newDocument.isPostScan"]')
        }
    ];

    for (const service of services) {
        console.log(`Selecting ${service.name}...`);

        try {
            const checkbox = await driver.wait(
                until.elementLocated(service.locator),
                10000,
                `${service.name} checkbox was not found`
            );

            await driver.wait(
                until.elementIsVisible(checkbox),
                10000,
                `${service.name} checkbox is not visible`
            );

            // Scroll checkbox into view
            await driver.executeScript(
                "arguments[0].scrollIntoView({block: 'center'});",
                checkbox
            );

            await driver.sleep(300);

            // Check current state before clicking
            const isSelected = await checkbox.isSelected();

            if (!isSelected) {
                await checkbox.click();
                console.log(`✓ ${service.name} selected`);
            } else {
                console.log(`✓ ${service.name} already selected`);
            }

        } catch (error) {
            console.log(`✗ Failed to select ${service.name}`);
            throw error;
        }
    }

    console.log("✓ RUSH, PRESCAN and POSTSCAN selected");
  }
  
  
  // async enterRandomPagesAndVerifyCopyCharge() {

  //   console.log("------------------------------------------");
  //   console.log("Selecting No of Pages");
  //   console.log("------------------------------------------");

  //   // Generate random number from 1 to 20
  //   const pages = Math.floor(Math.random() * 20) + 1;

  //   console.log(`Random No of Pages selected: ${pages}`);

  //   // Locate No of Pages input
  //   const pagesInput = await this.driver.wait(
  //       until.elementLocated(By.id('pagesOfProducts')),
  //       15000
  //   );

  //   await this.driver.wait(
  //       until.elementIsVisible(pagesInput),
  //       10000
  //   );

  //   // Clear existing value
  //   await pagesInput.clear();

  //   // Enter random pages
  //   await pagesInput.sendKeys(String(pages));

  //   console.log(`✓ No of Pages entered: ${pages}`);

  //   // Trigger Angular change/blur
  //   await pagesInput.sendKeys(Key.TAB);

  //   // Wait for fee calculation
  //   await this.waitForLoadingSpinner();

  //   // Give Angular time to update fee summary
  //   await this.driver.sleep(1500);

  //   console.log(`Pages: ${pages}`);

  //   // --------------------------------------------------
  //   // EXPECTED COPY CHARGE
  //   // --------------------------------------------------

  //   if (pages <= 10) {

  //       console.log("Pages <= 10");
  //       console.log("Expected: COPY CHARGE should NOT be displayed");

  //       // Search for Copy Charge text
  //       const copyChargeElements = await this.driver.findElements(
  //           By.xpath("//*[contains(normalize-space(.), 'Copy') and contains(normalize-space(.), 'CHARGE')]")
  //       );

  //       let copyChargeVisible = false;

  //       for (const element of copyChargeElements) {
  //           try {
  //               if (await element.isDisplayed()) {
  //                   const text = await element.getText();

  //                   if (/COPY\s*CHARGE/i.test(text)) {
  //                       copyChargeVisible = true;
  //                       console.log(`COPY CHARGE found: ${text}`);
  //                       break;
  //                   }
  //               }
  //           } catch (e) {
  //               // Element disappeared - ignore
  //           }
  //       }

  //       if (copyChargeVisible) {
  //           throw new Error(
  //               `COPY CHARGE should NOT be displayed for ${pages} pages`
  //           );
  //       }

  //       console.log(
  //           `✓ COPY CHARGE correctly not displayed for ${pages} pages`
  //       );

  //   } else {

  //       const extraPages = pages - 10;

  //       // $1 for every page above 10
  //       const expectedCopyCharge = extraPages * 1;

  //       console.log(`Pages: ${pages}`);
  //       console.log(`Extra pages: ${extraPages}`);
  //       console.log(
  //           `Expected COPY CHARGE: $${expectedCopyCharge.toFixed(2)}`
  //       );

  //       // Find Copy Charge
  //       const copyChargeElement = await this.driver.wait(
  //           until.elementLocated(
  //               By.xpath(
  //                   "//*[contains(normalize-space(.), 'Copy') and contains(normalize-space(.), 'CHARGE')]"
  //               )
  //           ),
  //           15000
  //       );

  //       await this.driver.wait(
  //           until.elementIsVisible(copyChargeElement),
  //           10000
  //       );

  //       const copyChargeText = await copyChargeElement.getText();

  //       console.log(`Actual COPY CHARGE text: ${copyChargeText}`);

  //       // Extract amount from text
  //       const amountMatch = copyChargeText.match(
  //           /\$?\s*(\d+(?:\.\d{1,2})?)/
  //       );

  //       if (!amountMatch) {
  //           throw new Error(
  //               `Could not extract COPY CHARGE amount from: ${copyChargeText}`
  //           );
  //       }

  //       const actualCopyCharge = parseFloat(amountMatch[1]);

  //       console.log(
  //           `Expected COPY CHARGE: $${expectedCopyCharge.toFixed(2)}`
  //       );

  //       console.log(
  //           `Actual COPY CHARGE: $${actualCopyCharge.toFixed(2)}`
  //       );

  //       // Compare price
  //       if (actualCopyCharge !== expectedCopyCharge) {

  //           throw new Error(
  //               `COPY CHARGE mismatch. ` +
  //               `Pages: ${pages}, ` +
  //               `Expected: $${expectedCopyCharge.toFixed(2)}, ` +
  //               `Actual: $${actualCopyCharge.toFixed(2)}`
  //           );
  //       }

  //       console.log(
  //           `✓ COPY CHARGE verified successfully: $${actualCopyCharge.toFixed(2)}`
  //       );
  //   }

  //   return {
  //       pages,
  //       extraPages: Math.max(0, pages - 10),
  //       expectedCopyCharge: pages > 10 ? pages - 10 : 0
  //   };
  // }

  async enterRandomPagesAndVerifyCopyCharge() {

    console.log("------------------------------------------");
    console.log("Selecting No of Pages");
    console.log("------------------------------------------");

    const pages = Math.floor(Math.random() * 20) + 1;

    console.log(`Random No of Pages selected: ${pages}`);

    const pagesInput = await this.driver.wait(
        until.elementLocated(By.id("pagesOfProducts")),
        15000
    );

    await this.driver.wait(
        until.elementIsVisible(pagesInput),
        15000
    );

    await pagesInput.click();

    await pagesInput.sendKeys(Key.CONTROL, "a");
    await pagesInput.sendKeys(String(pages));

    // IMPORTANT:
    // Move focus away from the input so Angular ng-change/blur
    // can process the new value.
    await pagesInput.sendKeys(Key.TAB);

    console.log(`✓ No of Pages entered: ${pages}`);

    // Wait for Angular/API fee calculation
    await this.waitForLoadingToFinish();

    // Give calculateFees API/UI time to update
    await this.driver.sleep(3000);

    const extraPages = Math.max(0, pages - 10);
    const expectedCopyCharge = extraPages;

    console.log(`Pages: ${pages}`);
    console.log(`Extra pages: ${extraPages}`);
    console.log(`Expected COPY CHARGE: $${expectedCopyCharge.toFixed(2)}`);

    return {
        pages,
        extraPages,
        expectedCopyCharge
    };
  }
  
  
  
  async waitForLoadingSpinner(timeout = 15000) {
    const spinner = By.css('.fa-spinner');

    try {
        await this.driver.wait(
            until.elementLocated(spinner),
            3000
        );
    } catch (e) {
        // Spinner may not appear for every action
    }

    try {
        await this.driver.wait(
            until.stalenessOf(await this.driver.findElement(spinner)),
            timeout
        );
    } catch (e) {
        // Spinner may already be gone
    }
  }
  
  // =====================================================
// ENTER NOTES
// =====================================================

async enterNotes(notes) {
    console.log("------------------------------------------");
    console.log("Entering Notes");
    console.log("------------------------------------------");

    const element = await this.driver.wait(
        until.elementLocated(this.noteInput),
        30000
    );

    await element.click();
    await element.clear();
    await element.sendKeys(notes);

    console.log("✓ Notes entered.");
}
  
  // =====================================================
// VERIFY PROCESSING STEPS
// =====================================================

// async verifyProcessingSection() {
//     console.log("------------------------------------------");
//     console.log("Verifying Processing Steps");
//     console.log("------------------------------------------");

//     try {
//         // Verify RUSH
//         const rush = await this.driver.findElement(this.rushCheckbox);

//         if (!(await rush.isSelected())) {
//             throw new Error("RUSH is not selected");
//         }

//         console.log("✓ RUSH is selected");

//         // Verify PRESCAN
//         const prescan = await this.driver.findElement(this.prescanCheckbox);

//         if (!(await prescan.isSelected())) {
//             throw new Error("PRESCAN is not selected");
//         }

//         console.log("✓ PRESCAN is selected");

//         // Verify POSTSCAN
//         const postscan = await this.driver.findElement(this.postscanCheckbox);

//         if (!(await postscan.isSelected())) {
//             throw new Error("POSTSCAN is not selected");
//         }

//         console.log("✓ POSTSCAN is selected");

//         console.log("✓ Processing steps verified successfully");

//         return true;

//     } catch (error) {
//         console.log("✗ Processing steps verification failed");
//         throw error;
//     }
  // }
  
  async verifyProcessingSection() {

    console.log("------------------------------------------");
    console.log("Verifying Processing Steps");
    console.log("------------------------------------------");

    try {

        // ==========================================
        // VERIFY RUSH
        // ==========================================

        const rush = await this.driver.wait(
            until.elementLocated(this.rushCheckbox),
            10000,
            "RUSH checkbox was not found"
        );

        await this.driver.wait(
            until.elementIsVisible(rush),
            10000,
            "RUSH checkbox is not visible"
        );

        if (!(await rush.isSelected())) {
            throw new Error("RUSH is not selected");
        }

        console.log("✓ RUSH is selected");


        // ==========================================
        // VERIFY PRESCAN
        // ==========================================

        const prescan = await this.driver.wait(
            until.elementLocated(this.prescanCheckbox),
            10000,
            "PRESCAN checkbox was not found"
        );

        await this.driver.wait(
            until.elementIsVisible(prescan),
            10000,
            "PRESCAN checkbox is not visible"
        );

        if (!(await prescan.isSelected())) {
            throw new Error("PRESCAN is not selected");
        }

        console.log("✓ PRESCAN is selected");


        // ==========================================
        // VERIFY POSTSCAN
        // ==========================================

        const postscan = await this.driver.wait(
            until.elementLocated(this.postscanCheckbox),
            10000,
            "POSTSCAN checkbox was not found"
        );

        await this.driver.wait(
            until.elementIsVisible(postscan),
            10000,
            "POSTSCAN checkbox is not visible"
        );

        if (!(await postscan.isSelected())) {
            throw new Error("POSTSCAN is not selected");
        }

        console.log("✓ POSTSCAN is selected");


        console.log("✓ Processing steps verified successfully");

        return true;

    } catch (error) {

        console.log("✗ Processing steps verification failed");
        console.log(`Reason: ${error.message}`);

        throw error;
    }
}
  

}

module.exports = NewPage;
