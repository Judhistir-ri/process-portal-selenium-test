const addContext = require("mochawesome/addContext");

const METHOD_DEFINITIONS = {
    selectCustomer: ["Select customer", a => `Customer "${a[0]}" should be selected in the Customer dropdown.`],
    selectUserByEmail: ["Select user by email", a => `User "${a[0]}" with email "${a[1]}" should be selected.`],
    selectOriginCountry: ["Select origin country", a => `Origin country "${a[0]}" should be selected.`],
    selectDestinationCountry: ["Select destination country", a => `Destination country "${a[0]}" should be selected.`],
    enterText: ["Enter search criteria", a => `Search value "${a[1]}" should be entered in the selected field.`],
    enterDocId: ["Enter document ID", a => `Document ID "${a[0]}" should be entered.`],
    enterOrderId: ["Enter order ID", a => `Order ID "${a[0]}" should be entered.`],
    enterCustomerReference: ["Enter customer reference", a => `Customer reference "${a[0]}" should be entered.`],
    enterInvoiceReference: ["Enter invoice reference", a => `Invoice reference "${a[0]}" should be entered.`],
    enterTrackingId: ["Enter tracking ID", a => `Tracking ID "${a[0]}" should be entered.`],
    selectFromDate: ["Select From Date", a => `From Date should be set to "${a[0]}".`],
    searchByDateRange: ["Search by date range", a => `Search should run from "${a[0]}" through "${a[1]}".`],
    clickSearch: ["Click Search", () => "Search should be submitted using the selected search criteria."],
    waitForSearchToFinish: ["Wait for search completion", () => "Search should finish and return results or a no-data response."],
    getTotalDocumentsFound: ["Read total documents found", () => "The application should return a readable document count; zero is valid for no matches."],
    getCurrentPageRowCount: ["Read current-page row count", () => "The visible row count should be readable."],
    getTotalPageCount: ["Read total page count", () => "The pagination page count should be readable."],
    getGlobalSearchTableData: ["Read Global Search result rows", () => "Visible result rows should be extracted when records exist."],
    getDocIdSearchResults: ["Read Doc Id search results", () => "Doc Id result records should be extracted."],
    getOrderIdSearchResults: ["Read Order Id search results", () => "Order Id result records should be extracted."],
    getCustomerReferenceSearchResults: ["Read Customer Reference results", () => "Customer Reference result records should be extracted."],
    getInvoiceReferenceSearchResults: ["Read Invoice Reference results", () => "Invoice Reference result records should be extracted."],
    getNoDataMessage: ["Read no-data message", () => "The no-data message should be readable when no records match."],
    getToastErrorMessage: ["Read application notification", () => "Any search notification should be readable."],
    exportToExcel: ["Click Export to Excel", () => "The Export to Excel action should be triggered."],
    clearSearchFilters: ["Clear search filters", () => "Search filters should be cleared."]
};

function summarize(value) {
    if (value === undefined) return "Action completed successfully.";
    if (value === null) return "Returned null.";
    if (["string", "number", "boolean"].includes(typeof value)) return String(value);
    if (Array.isArray(value)) return `Retrieved ${value.length} record(s).`;
    return "Action completed successfully.";
}

class TestReporter {
    constructor(driver, testContext) {
        this.driver = driver;
        this.testContext = testContext;
        this.stepNumber = 0;
        this._instrumentationDepth = 0;
        this.disableAutomaticSteps = false;
    }

    addTestInfo(info) {
        const value = Object.entries(info || {})
            .map(([key, item]) => `${key}: ${typeof item === "object" ? JSON.stringify(item) : item}`)
            .join("\n");
        addContext(this.testContext, { title: "TEST CASE INFORMATION", value });
    }

    addStep(number, title, expected, actual, status = "PASS") {
        const value = [
            `Step: ${number}`,
            `Action: ${title}`,
            "",
            "EXPECTED RESULT:",
            expected,
            "",
            "ACTUAL RESULT:",
            actual,
            "",
            `STATUS: ${status}`
        ].join("\n");
        addContext(this.testContext, { title: `STEP ${number}: ${title}`, value });
    }

    recordAutomaticStep(title, expected, actual, status = "PASS") {
        if (this.disableAutomaticSteps) return;
        this.stepNumber += 1;
        this.addStep(this.stepNumber, title, expected, actual, status);
    }

    addDetail(title, value) {
        addContext(this.testContext, {
            title,
            value: typeof value === "string" ? value : JSON.stringify(value, null, 2)
        });
    }

    addFailure(error) {
        this.addDetail("FAILURE REASON", error?.message || "Unknown failure.");
        if (error?.stack) this.addDetail("ERROR STACK TRACE", error.stack);
    }

    async attachScreenshot(title = "Execution Screenshot") {
        if (!this.driver) return;
        try {
            const image = await this.driver.takeScreenshot();
            addContext(this.testContext, { title, value: `data:image/png;base64,${image}` });
        } catch (error) {
            this.addDetail("SCREENSHOT CAPTURE", `Could not capture screenshot: ${error.message}`);
        }
    }

    static instrumentPageObject(pageObject, getReporter) {
        if (!pageObject || pageObject.__reportingInstrumented) return;
        Object.defineProperty(pageObject, "__reportingInstrumented", { value: true });

        for (const [methodName, [label, expectedFor]] of Object.entries(METHOD_DEFINITIONS)) {
            if (typeof pageObject[methodName] !== "function") continue;
            const original = pageObject[methodName];

            pageObject[methodName] = async function (...args) {
                const reporter = getReporter?.();
                if (!reporter || reporter.disableAutomaticSteps) {
                    return original.apply(this, args);
                }

                const isOuter = reporter._instrumentationDepth === 0;
                reporter._instrumentationDepth += 1;

                try {
                    const result = await original.apply(this, args);
                    if (isOuter) {
                        let actual = summarize(result);

                        if (methodName === "enterText") actual = `Entered search value "${args[1]}".`;
                        else if (methodName === "selectCustomer") actual = `Customer "${args[0]}" selection action completed.`;
                        else if (methodName === "selectUserByEmail") actual = `User "${args[0]}" (${args[1]}) selection action completed.`;
                        else if (methodName === "selectOriginCountry" || methodName === "selectDestinationCountry") actual = `${label} action completed for "${args[0]}".`;
                        else if (methodName === "getTotalDocumentsFound") actual = `Application returned ${result} document(s).`;
                        else if (methodName === "getCurrentPageRowCount") actual = `Current page contains ${result} visible row(s).`;
                        else if (methodName === "getTotalPageCount") actual = `Pagination reports ${result} page(s).`;
                        else if (methodName === "waitForSearchToFinish") actual = `Search completed with status "${result}".`;
                        else if (methodName === "getNoDataMessage" || methodName === "getToastErrorMessage") actual = result ? `Application message: ${result}` : "No application message was returned.";
                        else if (methodName === "getGlobalSearchTableData" || methodName.endsWith("SearchResults")) actual = `Retrieved ${Array.isArray(result) ? result.length : 0} result row(s).`;
                        else if (methodName === "searchByDateRange") actual = `Date-range search action completed for ${args[0]} through ${args[1]}.`;
                        else if (methodName === "selectFromDate") actual = `From Date selection action completed for ${args[0]}.`;
                        else if (methodName === "enterTrackingId") actual = `Tracking ID "${args[0]}" entered.`;

                        reporter.recordAutomaticStep(label, expectedFor(args), actual, "PASS");
                    }
                    return result;
                } catch (error) {
                    if (isOuter) {
                        reporter.recordAutomaticStep(label, expectedFor(args), `Action failed: ${error.message}`, "FAIL");
                    }
                    throw error;
                } finally {
                    reporter._instrumentationDepth -= 1;
                }
            };
        }
    }
}

module.exports = TestReporter;