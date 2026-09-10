const {
    Builder,
    By,
    until
} = require("selenium-webdriver");

const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const edge = require("selenium-webdriver/edge");

require("dotenv").config();

async function getDriver() {

    const browser =
        (process.env.BROWSER || "chrome").toLowerCase();

    console.log("==========================================");
    console.log("Starting Browser:", browser);
    console.log("==========================================");

    let builder = new Builder();

    // =====================================================
    // CHROME
    // =====================================================

    if (browser === "chrome") {

        const options = new chrome.Options();

        options.addArguments(
            "--start-maximized",
            "--disable-notifications",
            "--disable-popup-blocking",
            "--disable-infobars",
            "--disable-dev-shm-usage",
            "--no-sandbox"
        );

        builder
            .forBrowser("chrome")
            .setChromeOptions(options);

    }

    // =====================================================
    // FIREFOX
    // =====================================================

    else if (browser === "firefox") {

        const options = new firefox.Options();

        options.addArguments(
            "--width=1920",
            "--height=1080"
        );

        builder
            .forBrowser("firefox")
            .setFirefoxOptions(options);
    }

    // =====================================================
    // MICROSOFT EDGE
    // =====================================================

    else if (
        browser === "edge" ||
        browser === "msedge"
    ) {

        const options = new edge.Options();

        options.addArguments(
            "--start-maximized",
            "--disable-notifications",
            "--disable-popup-blocking",
            "--disable-infobars",
            "--disable-dev-shm-usage",
            "--no-sandbox"
        );

        builder
            .forBrowser("MicrosoftEdge")
            .setEdgeOptions(options);

    }

    else {

        throw new Error(
            `Unsupported browser: ${browser}. ` +
            `Use chrome, firefox or edge.`
        );
    }

    const driver = await builder.build();

    // =====================================================
    // TIMEOUTS
    // =====================================================

    await driver.manage().setTimeouts({

        implicit: 5000,

        pageLoad: 60000,

        script: 60000
    });

    // =====================================================
    // WINDOW SIZE
    // =====================================================

    try {

        await driver.manage().window().maximize();

    } catch (error) {

        console.log(
            "Window maximize not supported. Continuing..."
        );
    }

    console.log(
        `✓ ${browser.toUpperCase()} browser started successfully.`
    );

    return driver;
}

module.exports = getDriver;