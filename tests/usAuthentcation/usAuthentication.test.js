const { expect } = require("chai");
const path = require("path");

const getDriver = require("../../utils/driver");
const LoginPage = require("../../pages/CustomerLogin");
const USAuthentication = require("../../pages/USAuthentication");
const CartCheckoutPage = require("../../pages/CartCheckoutPage.js");

const pdf = path.resolve(
    __dirname,
    "../../assets/coverletter.pdf"
);

describe("US Authentication Order", function () {

    this.timeout(300000);

    let driver;
    let loginPage;
    let usAuthentication;
    let cartCheckoutPage;

    before(async function () {
        driver = await getDriver();

        loginPage = new LoginPage(driver);
        usAuthentication = new USAuthentication(driver);
        cartCheckoutPage = new CartCheckoutPage(driver);
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it("Complete Order Flow", async function () {

        // Complete US Authentication order flow

        await loginPage.open();

        await loginPage.login(
            process.env.WCS_EMAIL,
            process.env.WCS_PASSWORD
        );

        await usAuthentication.openUSAuthentication();

        // await usAuthentication.selectRandomCountry();
        // await usAuthentication.selectRandomDocument();

        await usAuthentication.selectCountry("Afghanistan");
        await usAuthentication.selectDocument("General (Others)");

        await usAuthentication.selectAdditionalServices();
        await usAuthentication.selectAdditionalServices();

        const uploadType =
            await usAuthentication.selectUploadOption(pdf);

        if (uploadType === "MAIL") {
            await usAuthentication.enterTrackingNumber(
                "TRK123456"
            );

            await usAuthentication.selectCourier("DHL");
        }

        const customerReference =
            "Automation-US-" + Date.now();

        await usAuthentication.enterCustomerReference(
            customerReference
        );

        await usAuthentication.addToCart();

        await usAuthentication.openCart();

        const shippingType =
            await cartCheckoutPage.selectShippingOption(pdf);

        await cartCheckoutPage.acceptRefundPolicy();

        const paymentMethod =
            await cartCheckoutPage.selectPaymentMethod();

        if (paymentMethod === "Credit/Debit Card") {

            await cartCheckoutPage.enterCardDetails(
                "Judhistir Behera",
                "4111111111111111",
                "12/36",
                "246"
            );

            await cartCheckoutPage.checkoutAndPay();

        } else {

            await cartCheckoutPage.checkoutFromCart();

            await cartCheckoutPage.confirmPayLater();
        }

        await driver.wait(
            async () => {
                const currentUrl =
                    await driver.getCurrentUrl();

                return currentUrl.includes("/confirmation");
            },
            60000
        );

        const orderNumber =
            await usAuthentication.getOrderNumber();

        expect(orderNumber).to.not.equal("");
    });
});