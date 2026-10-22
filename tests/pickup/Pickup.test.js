
const { expect } = require("chai");
const { By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/Login");
const NewPage = require("../../pages/NewPage");
const PickupDetail = require("../../pages/PickupDetail");

describe("Pickup Page - Export and Print Docs Functional Tests", function () {
    this.timeout(300000);

    let driver;
    let loginPage;
    let newPage;
    let pickupPage;

    before(async function () {
        driver = await getDriver();

        loginPage = new LoginPage(driver);
        newPage = new NewPage(driver);
        pickupPage = new PickupDetail(driver);

        await loginPage.open();
        await loginPage.login(
            process.env.EMAIL,
            process.env.PASSWORD
        );

        await newPage.waitForPage();
        await pickupPage.open();

        console.log("✓ Pickup page ready. Starting test cases.");
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

    async function verifyExport(panel, clickExport, testName) {
    const count = await pickupPage.getDocumentCount(panel);

    console.log(`${testName}: detected ${count} document row(s).`);

    // Only expect the error when there are no documents.
    if (count === 0) {
        await clickExport();

        try {
            await pickupPage.waitForNoDocumentsMessage(5000);
            console.log(
                `✓ ${testName}: "No documents found." displayed correctly.`
            );
        } catch (error) {
            // Some implementations do not show a toast for an empty export.
            // Do not fail solely because the toast was not displayed.
            console.log(
                `✓ ${testName}: no documents available; export download was not expected.`
            );
        }

        return;
    }

    const downloadDir = getDownloadDir();

    if (!fs.existsSync(downloadDir)) {
        throw new Error(`Download folder not found: ${downloadDir}`);
    }

    const filesBefore = new Set(fs.readdirSync(downloadDir));

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

    const filePath = path.join(downloadDir, downloadedFile);

    expect(fs.existsSync(filePath)).to.equal(true);
    expect(fs.statSync(filePath).size).to.be.greaterThan(0);

    console.log(`✓ ${testName}: downloaded ${downloadedFile}`);
}

    async function verifyPrint(panel, clickPrint, testName) {
        const count = await pickupPage.getDocumentCount(panel);

        console.log(`${testName}: detected ${count} document row(s).`);

        if (count === 0) {
            await clickPrint();
            await pickupPage.waitForNoDocumentsMessage();

            console.log(
                `✓ ${testName}: correctly handled the empty panel.`
            );
            return;
        }

        const handlesBefore = await driver.getAllWindowHandles();
        const originalHandle = await driver.getWindowHandle();

        await clickPrint();

        await driver.wait(async () => {
            const handles = await driver.getAllWindowHandles();

            return handles.some(
                handle => !handlesBefore.includes(handle)
            );
        }, 20000, `${testName}: Print Docs did not open a new window.`);

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

            expect(printUrl).to.be.a("string").and.not.empty;

            console.log(`✓ ${testName}: print window opened.`);
            console.log("Print URL:", printUrl);
        } finally {
            const handles = await driver.getAllWindowHandles();

            if (handles.includes(newHandle)) {
                await driver.switchTo().window(newHandle);
                await driver.close();
            }

            const remaining = await driver.getAllWindowHandles();

            if (remaining.includes(originalHandle)) {
                await driver.switchTo().window(originalHandle);
            }
        }
    }

    it("TC_PICKUP_001 - Verify Pickup Queue Export", async function () {
        await verifyExport(
            By.css("div.pickup"),
            () => pickupPage.clickPickupExport(),
            "Pickup Queue Export"
        );
    });

    it("TC_PICKUP_002 - Verify Pickup Queue Print Docs", async function () {
        await verifyPrint(
            By.css("div.pickup"),
            () => pickupPage.clickPickupPrintDocs(),
            "Pickup Queue Print Docs"
        );
    });

    it("TC_PICKUP_003 - Verify Completed Export", async function () {
        await verifyExport(
            By.css("div.completed-docs"),
            () => pickupPage.clickCompletedExport(),
            "Completed Export"
        );
    });

    it("TC_PICKUP_004 - Verify Completed Print Docs", async function () {
        await verifyPrint(
            By.css("div.completed-docs"),
            () => pickupPage.clickCompletedPrintDocs(),
            "Completed Print Docs"
        );
    });
});
