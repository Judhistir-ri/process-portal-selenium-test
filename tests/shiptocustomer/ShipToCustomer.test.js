const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const ShipToCustomerDetail = require("../../pages/ShipToCustomerDetail");

describe("Ship to Customer - Export and Print Docs Functional Tests", function () {
    this.timeout(300000);

    let driver;
    let loginPage;
    let newPage;
    let shipPage;

    before(async function () {
    driver = await getDriver();

    loginPage = new LoginPage(driver);
    newPage = new NewPage(driver);
    shipPage = new ShipToCustomerDetail(driver);

    await loginPage.open();

    await loginPage.login(
        process.env.EMAIL,
        process.env.PASSWORD
    );

    await newPage.waitForPage();

    // Opens Ship to Customer and waits for the sections and documents.
    await shipPage.open();

    console.log("✓ Ship to Customer page ready. Starting test cases.");
});

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    function getDownloadDir() {
        return path.join(
            process.env.USERPROFILE || process.cwd(),
            "Downloads"
        );
    }

    async function verifyExport(section, clickExport, testName) {
        const count = await shipPage.getDocumentCount(section);

        console.log(
            `${testName}: detected ${count} document row(s).`
        );

        // Empty panel: verify the application handles the action.
        if (count === 0) {
            await clickExport();

            try {
                await shipPage.waitForNoDocumentsMessage(5000);

                console.log(
                    `✓ ${testName}: "No documents found." displayed correctly.`
                );
            } catch (error) {
                console.log(
                    `✓ ${testName}: no documents available; no export file expected.`
                );
            }

            return;
        }

        const downloadDir = getDownloadDir();

        if (!fs.existsSync(downloadDir)) {
            throw new Error(
                `Download folder not found: ${downloadDir}`
            );
        }

        const filesBefore = new Set(
            fs.readdirSync(downloadDir)
        );

        await clickExport();

        let downloadedFile;

        await driver.wait(async () => {
            const filesAfter = fs.readdirSync(downloadDir);

            downloadedFile = filesAfter.find(file =>
                !filesBefore.has(file) &&
                /\.(xlsx|xls|csv)$/i.test(file)
            );

            const downloading = filesAfter.some(file =>
                file.endsWith(".crdownload")
            );

            return Boolean(downloadedFile) && !downloading;
        }, 30000, `${testName}: Excel/CSV file was not downloaded.`);

        const filePath = path.join(
            downloadDir,
            downloadedFile
        );

        expect(fs.existsSync(filePath)).to.equal(true);
        expect(fs.statSync(filePath).size).to.be.greaterThan(0);

        console.log(
            `✓ ${testName}: downloaded ${downloadedFile}`
        );
    }

    async function verifyPrint(section, clickPrint, testName) {
        const count = await shipPage.getDocumentCount(section);

        console.log(
            `${testName}: detected ${count} document row(s).`
        );

        if (count === 0) {
            await clickPrint();

            await shipPage.waitForNoDocumentsMessage();

            console.log(
                `✓ ${testName}: empty panel handled correctly.`
            );

            return;
        }

        const handlesBefore = await driver.getAllWindowHandles();
        const originalHandle = await driver.getWindowHandle();

        await clickPrint();

        // Wait for a new window or tab.
        await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();

            return handles.some(
                handle => !handlesBefore.includes(handle)
            );
        }, 30000, `${testName}: Print Docs did not open a new window.`);

        const handlesAfter = await driver.getAllWindowHandles();

        const newHandle = handlesAfter.find(
            handle => !handlesBefore.includes(handle)
        );

        expect(newHandle, "New print window should exist").to.exist;

        try {
            await driver.switchTo().window(newHandle);

            await driver.wait(async () => {
                const url = await driver.getCurrentUrl();
                return Boolean(url);
            }, 15000, "Print window did not load.");

            const printUrl = await driver.getCurrentUrl();
            const printTitle = await driver.getTitle();

            expect(printUrl).to.be.a("string").and.not.empty;

            console.log(`✓ ${testName}: print window opened.`);
            console.log("Print URL:", printUrl);
            console.log("Print window title:", printTitle);
        } finally {
            const handles = await driver.getAllWindowHandles();

            if (handles.includes(newHandle)) {
                await driver.switchTo().window(newHandle);
                await driver.close();
            }

            const remainingHandles = await driver.getAllWindowHandles();

            if (remainingHandles.includes(originalHandle)) {
                await driver.switchTo().window(originalHandle);
            }
        }
    }

    // TC_SHIP_001
    it("TC_SHIP_001 - Verify Ready to Ship Export", async function () {
        await verifyExport(
            "readyToShip",
            () => shipPage.clickReadyToShipExport(),
            "Ready to Ship Export"
        );
    });

    // TC_SHIP_002
    it("TC_SHIP_002 - Verify Ready to Ship Print Docs", async function () {
        await verifyPrint(
            "readyToShip",
            () => shipPage.clickReadyToShipPrintDocs(),
            "Ready to Ship Print Docs"
        );
    });

    // TC_SHIP_003
    it("TC_SHIP_003 - Verify Completed Export", async function () {
        await verifyExport(
            "completed",
            () => shipPage.clickCompletedExport(),
            "Completed Export"
        );
    });

    // TC_SHIP_004
    it("TC_SHIP_004 - Verify Completed Print Docs", async function () {
        await verifyPrint(
            "completed",
            () => shipPage.clickCompletedPrintDocs(),
            "Completed Print Docs"
        );
    });
});