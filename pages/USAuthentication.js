const { By, until } = require("selenium-webdriver");

class OrderPage {

    constructor(driver) {

        this.driver = driver;

        // Navigation
        this.newOrder = By.xpath("//span[normalize-space()='New Order']");
        this.usAuthentication = By.xpath("//a[@href='/orders/new/us-authentication']");
        this.cart = By.xpath("//span[normalize-space()='Cart']");
        this.myOrders = By.xpath("//span[normalize-space()='My Orders']");

        // Form
        this.country = By.xpath("//label[contains(text(),'Select or Type Country')]/following::input[1]");
        this.document = By.xpath("(//input[@role='combobox'])[2]");
        this.customerReference = By.xpath("//input[contains(@placeholder,'reference')]");

        this.fileInput = By.css("input[type='file']");

        this.processDocuments = By.xpath("//*[contains(text(),'Process Attached Documents')]");
        this.mailDocuments = By.xpath("//*[contains(text(),'Mail Original Documents')]");

        // Additional Services
        this.preScan = By.xpath("//*[contains(text(),'Pre-Scan')]");
        this.postScan = By.xpath("//*[contains(text(),'Post-Scan')]");
        this.rush = By.xpath("//*[contains(text(),'Rush')]");

        // Buttons
        this.addToCartBtn = By.xpath("//button[contains(.,'Add to Cart')]");
        // Add More Documents
        this.addMoreDocumentsBtn = By.xpath( "//button[contains(normalize-space(.),'Add More Documents')]");


        this.trackingNumber = By.xpath("//label[contains(.,'Tracking number to WCS')]/following::input[1]");
        this.courier = By.xpath("//label[contains(.,'Courier')]/following::input[1]");
        this.numberOfPages = By.xpath("//label[normalize-space()='Add Number of Pages']/following::input[1]");

        
    }

    //---------------------------------------
    // Generic Methods
    //---------------------------------------

    async find(locator) {

        return await this.driver.wait(
            until.elementLocated(locator),
            20000
        );

    }

    async click(locator) {

        const element = await this.find(locator);

        await this.driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            element
        );

        await this.driver.wait(
            until.elementIsVisible(element),
            10000
        );

        await this.driver.executeScript(
            "arguments[0].click();",
            element
        );

    }

    async type(locator, text) {

        const element = await this.find(locator);

        await element.clear();

        await element.sendKeys(text);

    }

    async getText(locator) {

        return (await this.find(locator)).getText();

    }

    async waitUntilUrlContains(text) {

        await this.driver.wait(async () => {

            return (await this.driver.getCurrentUrl()).includes(text);

        },20000);

    }

    //---------------------------------------
    // Navigation
    //---------------------------------------

    async openUSAuthentication() {

        await this.click(this.newOrder);

        await this.click(this.usAuthentication);

        await this.waitUntilUrlContains("/orders/new/us-authentication");

    }


    async openCart() {

    console.log("Opening Cart...");

    await this.click(this.cart);

    await this.driver.wait(
        async () => {
            return (
                await this.driver.getCurrentUrl()
            ).includes("/cart");
        },
        30000
    );

    await this.driver.sleep(2000);

    console.log(
        "Cart opened:",
        await this.driver.getCurrentUrl()
    );

    }
    
    async addMoreDocuments() {

    console.log("Clicking Add More Documents...");

    await this.click(this.addMoreDocumentsBtn);

    // Wait for US Authentication page
    await this.driver.wait(
        async () => {
            return (
                await this.driver.getCurrentUrl()
            ).includes("/orders/new/us-authentication");
        },
        30000
    );

    // Wait for country field
    await this.driver.wait(
        until.elementLocated(this.country),
        30000
    );

    console.log(
        "Add More Documents -> US Authentication page opened."
    );
    }
    

    async openMyOrders() {

        await this.click(this.myOrders);

    }


    // ==========================================
// Fixed Country
// ==========================================

async selectCountry(countryName = "Afghanistan") {

    console.log("Selecting Country...");

    await this.click(this.country);

    const option = await this.driver.wait(
        until.elementLocated(
            By.xpath(
                `//li[@role='option' and not(@aria-disabled='true') and normalize-space()='${countryName}']`
            )
        ),
        20000
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        option
    );

    await this.driver.executeScript(
        "arguments[0].click();",
        option
    );

    await this.driver.sleep(1000);

    console.log("Country Selected:", countryName);

    return countryName;
}


// ==========================================
// Fixed Document
// ==========================================

async selectDocument(documentName = "General (Others)") {

    console.log("Selecting Document...");

    await this.click(this.document);

    const option = await this.driver.wait(
        until.elementLocated(
            By.xpath(
                `//li[@role='option' and not(@aria-disabled='true') and normalize-space()='${documentName}']`
            )
        ),
        20000
    );

    await this.driver.executeScript(
        "arguments[0].scrollIntoView({block:'center'});",
        option
    );

    await this.driver.executeScript(
        "arguments[0].click();",
        option
    );

    await this.driver.sleep(1000);

    console.log("Document Selected:", documentName);

    return documentName;
}

    
      async selectAdditionalServices() {

        console.log(
            "Additional Services..."
        );


        const services = [
            "Pre-Scan",
            "Post-Scan",
            "Rush"
        ];


        const count =
            Math.floor(
                Math.random() * 4
            );


        const shuffled =
            services.sort(
                () => 0.5 - Math.random()
            );


        const selected =
            shuffled.slice(
                0,
                count
            );


        for (
            const service of selected
        ) {

            const checkbox =
                await this.driver.findElement(
                    By.xpath(
                        `//span[contains(text(),'${service}')]`
                    )
                );


            await this.driver.executeScript(
                "arguments[0].click();",
                checkbox
            );

        }


        console.log(
            "Selected :",
            selected.join(", ") || "None"
        );

    }

    // ==========================================
// Random Country
// ==========================================

// async selectRandomCountry() {

//     console.log("Selecting random country...");

//     // Open country dropdown
//     await this.click(this.country);

//     // Wait for dropdown options
//     const options = await this.driver.wait(
//         until.elementsLocated(
//             By.xpath(
//                 "//li[@role='option' and not(@aria-disabled='true')]"
//             )
//         ),
//         20000
//     );

//     // Keep only visible options with text
//     const validOptions = [];

//     for (const option of options) {

//         try {

//             if (
//                 await option.isDisplayed()
//             ) {

//                 const text =
//                     (await option.getText()).trim();

//                 if (
//                     text &&
//                     !text.toLowerCase().includes("no options")
//                 ) {

//                     validOptions.push({
//                         element: option,
//                         text: text
//                     });

//                 }

//             }

//         } catch (e) {
//             // Ignore stale/invisible options
//         }

//     }

//     if (validOptions.length === 0) {

//         throw new Error(
//             "No country options found."
//         );

//     }

//     // Random country
//     const randomIndex =
//         Math.floor(
//             Math.random() * validOptions.length
//         );

//     const selected =
//         validOptions[randomIndex];

//     console.log(
//         "Random Country Selected:",
//         selected.text
//     );

//     // Scroll into view
//     await this.driver.executeScript(
//         "arguments[0].scrollIntoView({block:'center'});",
//         selected.element
//     );

//     // Click country
//     await this.driver.executeScript(
//         "arguments[0].click();",
//         selected.element
//     );

//     await this.driver.sleep(1000);

//     return selected.text;
// }


// ==========================================
// Random Document
// ==========================================

    // async selectRandomDocument() {

    // console.log("Selecting random document...");

    // // Open document dropdown
    // await this.click(this.document);

    // // Wait for document options
    // const options = await this.driver.wait(
    //     until.elementsLocated(
    //         By.xpath(
    //             "//li[@role='option' and not(@aria-disabled='true')]"
    //         )
    //     ),
    //     20000
    // );

    // // Keep visible valid options
    // const validOptions = [];

    // for (const option of options) {

    //     try {

    //         if (
    //             await option.isDisplayed()
    //         ) {

    //             const text =
    //                 (await option.getText()).trim();

    //             if (
    //                 text &&
    //                 !text.toLowerCase().includes("no options")
    //             ) {

    //                 validOptions.push({
    //                     element: option,
    //                     text: text
    //                 });

    //             }

    //         }

    //     } catch (e) {
    //         // Ignore stale/invisible options
    //     }

    // }

    // if (validOptions.length === 0) {

    //     throw new Error(
    //         "No document options found for the selected country."
    //     );

    // }

    // // Random document
    // const randomIndex =
    //     Math.floor(
    //         Math.random() * validOptions.length
    //     );

    // const selected =
    //     validOptions[randomIndex];

    // console.log(
    //     "Random Document Selected:",
    //     selected.text
    // );

    // // Scroll into view
    // await this.driver.executeScript(
    //     "arguments[0].scrollIntoView({block:'center'});",
    //     selected.element
    // );

    // // Click document
    // await this.driver.executeScript(
    //     "arguments[0].click();",
    //     selected.element
    // );

    // await this.driver.sleep(1000);

    // return selected.text;
    // }
    
    

    async enterNumberOfPages(pages) {

    const input = await this.find(this.numberOfPages);

    await input.clear();

    await input.sendKeys(String(pages));

}

    //---------------------------------------
    // Upload
    //---------------------------------------

  async selectUploadOption(pdfPath) {

    const random = Math.floor(Math.random() * 2);

    if (random === 0) {

        console.log("Upload Option : Process Attached Documents");

        await this.click(this.processDocuments);

await this.driver.wait(
    until.elementLocated(this.numberOfPages),
    10000
);

await this.driver.wait(
    until.elementIsVisible(
        await this.find(this.numberOfPages)
    ),
    10000
);

        // Number of pages
        await this.driver.wait(
    until.elementLocated(this.numberOfPages),
    10000
);

await this.enterNumberOfPages(1);

        // Upload PDF
        const upload = await this.find(this.fileInput);

        await upload.sendKeys(pdfPath);

        return "PROCESS";

    }

    console.log("Upload Option : Mail Original Documents");

    await this.click(this.mailDocuments);

    await this.driver.sleep(1000);

    return "MAIL";

    }
    
   async enterTrackingNumber(number){

    const tracking = await this.find(
        this.trackingNumber
    );

    await tracking.clear();

    await tracking.sendKeys(number);

}
    
   async selectCourier(name="DHL"){

    const courier = await this.find(this.courier);

    await courier.click();

    await courier.sendKeys(name);

    await this.click(
        By.xpath(`//li[contains(.,'${name}')]`)
    );

}
    

    async selectAdditionalServices() {

    const services = [
        this.preScan,
        this.postScan,
        this.rush
    ];

    for (const service of services) {

        // 50% chance of selecting each service
        if (Math.random() > 0.5) {

            try {

                await this.click(service);

                console.log("Selected Additional Service");

            } catch (e) {
                // Ignore if service is unavailable
            }

        }

    }

    }

    async chooseMailOriginalDocuments(){

        await this.click(this.mailDocuments);

    }

    //---------------------------------------
    // Customer Reference
    //---------------------------------------

    async enterCustomerReference(text){

        await this.type(this.customerReference,text);

    }

    //---------------------------------------
    // Cart
    //---------------------------------------

    async addToCart() {

    console.log("Clicking Add to Cart...");

    await this.click(this.addToCartBtn);

    console.log("Waiting for Add to Cart operation...");

    // Wait until the "Adding to Cart..." loading message disappears
    await this.driver.wait(async () => {

        const loaders = await this.driver.findElements(
            By.xpath(
                "//*[normalize-space()='Adding to Cart...']"
            )
        );

        for (const loader of loaders) {

            try {

                if (await loader.isDisplayed()) {
                    return false;
                }

            } catch (e) {
                // Element disappeared - that's good
            }
        }

        return true;

    }, 60000);

    // Give React/API state a little time to update
    await this.driver.sleep(2000);

    console.log("Add to Cart operation completed.");

}
    
    async getOrderNumber() {

        return await this.getText(
            By.xpath("//*[contains(text(),'Order No')]")
        );

    }

    async getLatestOrder(){

        return await this.getText(
            By.xpath("(//*[contains(text(),'Order ID')])[1]")
        );

    }

}

module.exports = OrderPage;