# WCS Processor Portal – Selenium Automation

Automated UI testing for the WCS Processor Portal and selected WCS Customer Portal flows. The project uses **Selenium WebDriver with Node.js**, **Mocha** as the test runner, **Chai** for assertions, and **Mochawesome** for HTML/JSON test reports.

> This README is based on the source files and `package.json` included in the supplied ZIP. Configure your own environment values before running tests. Do not commit real credentials or customer data.

## Table of contents

- [Project overview](#project-overview)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment configuration](#environment-configuration)
- [Browser configuration](#browser-configuration)
- [Running tests](#running-tests)
- [Test modules](#test-modules)
- [Test reports](#test-reports)
- [Downloads and test assets](#downloads-and-test-assets)
- [How the framework works](#how-the-framework-works)
- [Important execution notes](#important-execution-notes)
- [Troubleshooting](#troubleshooting)

## Project overview

The repository contains page-object classes and Mocha test suites covering:

- Processor Portal login and new-order creation.
- Expected documents and document details.
- Global Search.
- DropOff Queue, Courier, and Completed sections.
- Pickup Queue and Completed sections.
- Ship To Customer and Completed sections.
- End-to-end order processing from login through processing steps and shipping.
- Customer Portal login and a US Authentication order/checkout flow.

The tests interact with the web applications through browser UI elements. They are integration/UI tests and may create or update records in the configured test environment.

## Technology stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Selenium WebDriver (`selenium-webdriver`) | Browser automation |
| Mocha | Test runner and test lifecycle |
| Chai | Assertions |
| Mochawesome | HTML and JSON test reports |
| dotenv | Loads local environment variables from `.env` |
| Chrome, Firefox, Microsoft Edge | Supported browser choices in `utils/driver.js` |

The project uses CommonJS (`"type": "commonjs"` in `package.json`).

## Project structure

```text
.
├── assets/
│   ├── coverletter.pdf
│   ├── dummytext.pdf
│   └── sample.pdf
├── Downloads/                         # Downloaded files / test artifacts
├── pages/                             # Page Object Model classes
│   ├── GlobalSearchPage.js
│   ├── CartCheckoutPage.js
│   ├── CustomerLogin.js
│   ├── DropOffDetail.js
│   ├── DropOffPage.js
│   ├── ExpectedDetailsPage.js
│   ├── ExpectedPage.js
│   ├── Login.js
│   ├── NewPage.js
│   ├── PickupDetail.js
│   ├── PickupPage.js
│   ├── ProcessingSteps.js
│   ├── ShipToCustomerDetail.js
│   ├── ShipToCustomerPage.js
│   └── USAuthentication.js
├── reports/                            # Mochawesome output
├── tests/
│   ├── all_tests/
│   │   └── processorPortalAllTests.test.js
│   ├── customerLogin/
│   │   └── customerLogin.test.js
│   ├── dropoff/
│   │   └── DropOff.test.js
│   ├── expected/
│   │   └── expectedDetails.test.js
│   ├── globalSearch/
│   │   └── globalSearch.test.js
│   ├── login/
│   │   └── login.test.js
│   ├── new/
│   │   └── createNewOrder.test.js
│   ├── pickup/
│   │   └── Pickup.test.js
│   ├── process/
│   │   └── process.test.js
│   ├── shiptocustomer/
│   │   └── ShipToCustomer.test.js
│   └── usAuthentcation/
│       └── usAuthentication.test.js
├── utils/
│   ├── driver.js
│   └── testReporter.js
├── .env                               # Create locally; not included in the supplied ZIP
├── package.json
└── package-lock.json
```

### Page Object Model

The `pages/` directory contains the browser interaction logic. The test files call methods on these page objects rather than keeping all locators and browser actions inside each test.

| Page object | Main responsibility |
|---|---|
| `Login.js` | Processor Portal login |
| `NewPage.js` | Create a new processor order, select customer/contact/countries/category/document type/services, enter pages and save |
| `ExpectedPage.js` | Expected list, open order/document details, inspect processing steps, save and process |
| `ExpectedDetailsPage.js` | Document details, attachments, shipping labels, fees/payments, conversations, activity, contact/address and tracking details |
| `GlobalSearchPage.js` | Search filters, result data, no-data messages, and Excel export |
| `DropOffPage.js` / `DropOffDetail.js` | DropOff Queue, Courier and Completed workflows, counts, filters, exports, printing and courier completion |
| `PickupPage.js` / `PickupDetail.js` | Pickup Queue and Completed workflows, filters, counts, exports and printing |
| `ShipToCustomerPage.js` / `ShipToCustomerDetail.js` | Ready to Ship and Completed workflows, filters, counts, exports and printing |
| `CustomerLogin.js` | Customer Portal login and dashboard checks |
| `USAuthentication.js` | Customer-side US Authentication order flow |
| `CartCheckoutPage.js` | Shipping selection, refund policy, payment selection and checkout |
| `ProcessingSteps.js` | Processing-step related helper module |

## Prerequisites

Install the following on the machine that will run the tests:

1. **Node.js and npm**.
2. A supported browser: Google Chrome, Mozilla Firefox, or Microsoft Edge.
3. A compatible browser driver available to Selenium. Selenium Manager may resolve drivers automatically in supported setups, but browser/driver compatibility and network access still matter.
4. Access to the WCS test applications and valid test accounts.
5. For tests that upload files, retain the required PDFs under `assets/`.

Check the installed versions:

```bash
node --version
npm --version
```

## Installation

Clone or copy the repository, open a terminal in the project root, and install the dependencies:

```bash
npm install
```

The dependencies are declared in `package.json` and pinned further by `package-lock.json`.

## Environment configuration

Create a `.env` file in the project root. The ZIP contains code that reads the following environment variables, but does not contain the `.env` file itself.

Example template:

```dotenv
# Processor Portal account
EMAIL=your_processor_portal_email
PASSWORD=your_processor_portal_password

# Browser: chrome, firefox, or edge
BROWSER=chrome

# Optional: country expected by the end-to-end process test
PROCESS_COUNTRY=Afghanistan

# Customer Portal account (used by customer login / US Authentication tests)
WCS_EMAIL=your_customer_portal_email
WCS_PASSWORD=your_customer_portal_password

# Optional: custom download directory for suites that read DOWNLOAD_DIR
DOWNLOAD_DIR=
```

### Environment variable usage in the source

| Variable | Used for |
|---|---|
| `EMAIL` | Processor Portal login in the processor-side test suites |
| `PASSWORD` | Processor Portal login in the processor-side test suites |
| `BROWSER` | Browser selection in `utils/driver.js`; defaults to `chrome` |
| `PROCESS_COUNTRY` | Expected country in the end-to-end process test; defaults to `Afghanistan` |
| `WCS_EMAIL` | Customer Portal login |
| `WCS_PASSWORD` | Customer Portal login |
| `DOWNLOAD_DIR` | Download directory override in the combined suite and relevant export/download suites |

Keep `.env` private. Add it to `.gitignore` if it is not already ignored. Never place real passwords, payment information, access tokens, or customer data in source control or README files.

Some test files contain fixed test values and test-record identifiers in their source. Review and update those values for the target test environment before execution.

## Browser configuration

`utils/driver.js` reads `BROWSER` and supports:

```dotenv
BROWSER=chrome
```

Other supported values:

```dotenv
BROWSER=firefox
```

```dotenv
BROWSER=edge
```

The driver setup configures browser options, maximizes the window where possible, and sets Selenium timeouts (implicit wait: 5 seconds; page-load and script timeouts: 60 seconds).

## Running tests

Run commands from the repository root.

### Run the complete Mocha test discovery pattern

```bash
npm test
```

This runs:

```bash
mocha tests/**/*.test.js --reporter mochawesome
```

The exact files discovered depend on the shell/Mocha glob behavior and project contents. This command can include standalone suites as well as the combined suite; avoid running it against a shared mutable test environment unless the tests and test data are safe to run together.

### Processor Portal login

```bash
npx mocha tests/login/login.test.js
```

Or use the configured script:

```bash
npm run test_login
```

### Global Search

```bash
npm run test_global_search
```

Equivalent test file:

```bash
npx mocha tests/globalSearch/globalSearch.test.js
```

### Combined Processor Portal test suite

```bash
npm run test_processor_portal
```

Equivalent test file:

```bash
npx mocha tests/all_tests/processorPortalAllTests.test.js
```

### Create New Order

```bash
npm run test_create_new_order
```

Equivalent test file:

```bash
npx mocha tests/new/createNewOrder.test.js
```

### Complete order processing flow

```bash
npm run test_process
```

Equivalent test file:

```bash
npx mocha tests/process/process.test.js
```

### Other standalone suites

```bash
npx mocha tests/expected/expectedDetails.test.js
npx mocha tests/dropoff/DropOff.test.js
npx mocha tests/pickup/Pickup.test.js
npx mocha tests/shiptocustomer/ShipToCustomer.test.js
npx mocha tests/customerLogin/customerLogin.test.js
npx mocha tests/usAuthentcation/usAuthentication.test.js
```

The package scripts currently defined in `package.json` are:

| npm script | Test file |
|---|---|
| `npm test` | `tests/**/*.test.js` |
| `npm run test_login` | `tests/login/login.test.js` |
| `npm run test_global_search` | `tests/globalSearch/globalSearch.test.js` |
| `npm run test_processor_portal` | `tests/all_tests/processorPortalAllTests.test.js` |
| `npm run test_create_new_order` | `tests/new/createNewOrder.test.js` |
| `npm run test_process` | `tests/process/process.test.js` |

## Test modules

The following summarizes the test coverage represented by the test names and test flows in the supplied source.

### 1. Processor Portal login — `tests/login/login.test.js`

- Verify that the login page is displayed.
- Log in using valid processor account credentials and verify navigation to the new-order page.

### 2. Create New Order — `tests/new/createNewOrder.test.js`

The single end-to-end test creates a processor order. The flow selects a customer and contact, origin and destination, category, origin state, document type and additional services; enters a page count, description and notes; checks processing information; saves the order; and verifies the document list.

The current test uses values such as Afghanistan, Federal Government, Maryland, and Federal Government (Others). It selects additional services through the page object and checks the copy-charge behavior based on the randomly selected page count. The stop-selection step is explicitly skipped because a stop value has not been supplied in the test.

### 3. Expected and Document Details — `tests/expected/expectedDetails.test.js`

Coverage includes:

- Order ID, document details, processing steps, country, customer details.
- Payment link and payment-related behavior, including partial/full payment and validation.
- Attachments, shipping labels, cover sheet, uploaded documents and document printing.
- Add Stop and fee operations, saving/restoring/editing/deleting fees, and fee totals.
- Split document behavior.
- Conversations, sending messages, printing conversations and activity feed.
- Payment activity, transaction report export and order history.
- Contact details, address add/edit/default shipping/default billing/delete, other details and tracking details.

The source includes multiple test titles with repeated or non-sequential identifiers. Refer to the test file itself as the authoritative list when selecting a specific test by title or grep pattern.

### 4. Global Search — `tests/globalSearch/globalSearch.test.js`

Coverage includes page load and searching by customer name/email, origin country, destination country, description, Doc ID, Order ID, customer reference, invoice reference, category, date range and tracking ID. It also tests exporting search results to Excel.

### 5. DropOff — `tests/dropoff/DropOff.test.js`

Coverage includes DropOff Queue, Courier and Completed exports/print actions, Courier print options (Cheques, Shipping and Docs), section totals, document filters, categories, stops, searching for order IDs, and moving an order between Queue, Courier and Completed.

### 6. Pickup — `tests/pickup/Pickup.test.js`

Coverage includes Pickup Queue and Completed exports/print actions, totals by document filter/category/stop, searching for orders and checking order/document/country details, and date-based counts.

### 7. Ship To Customer — `tests/shiptocustomer/ShipToCustomer.test.js`

Coverage includes Ready to Ship and Completed exports/print actions, totals by document filter/category, and searching for order IDs and a Doc ID.

### 8. Combined Processor Portal suite — `tests/all_tests/processorPortalAllTests.test.js`

This file brings together the Expected/Document Details, DropOff, Pickup and Ship To Customer test groups. It contains the corresponding test cases in one suite. It is separate from the standalone test files, so running both standalone and combined suites can execute overlapping coverage.

### 9. Complete order processing — `tests/process/process.test.js`

`TC_PROCESS_FULL_001` automates a larger business flow:

1. Log in to the Processor Portal.
2. Read an order from Expected and open its details.
3. Read its document ID, country and processing steps.
4. Save and process the order.
5. For each processing step, work through DropOff/Courier and Pickup.
6. Continue through the processing steps.
7. Open Ship To Customer, complete the shipping details and save.

This test uses a long Mocha timeout because it performs multiple UI workflows. It creates/changes application data and should be run with suitable test records and an isolated test environment.

### 10. Customer Portal login — `tests/customerLogin/customerLogin.test.js`

The test enters the customer account email and password, pauses for a person to complete CAPTCHA in the browser, submits the login, and checks the dashboard URL and welcome text. It is not fully unattended because CAPTCHA completion is manual.

### 11. US Authentication order — `tests/usAuthentcation/usAuthentication.test.js`

The customer-side flow logs in, opens US Authentication, selects a country and document type, selects additional services, chooses an upload/shipping option, optionally enters tracking/courier details, enters a customer reference, adds the order to cart, and completes checkout. The test then waits for the confirmation URL and verifies that an order number is returned.

The source includes a fixed card test-data block for the card-payment branch. Use only payment test credentials approved for the configured test environment; never use a real payment card.

## Test reports

Mochawesome is configured in `package.json` for selected npm scripts. Those scripts create both HTML and JSON output:

| Command | Report directory | HTML report |
|---|---|---|
| `npm run test_global_search` | `reports/global-search/` | `GlobalSearchReport.html` |
| `npm run test_processor_portal` | `reports/processor-portal/` | `ProcessorPortalReport.html` |
| `npm run test_create_new_order` | `reports/new-order/` | `CreateNewOrderReport.html` |
| `npm run test_process` | `reports/process/` | `ProcessReport.html` |

Example report command:

```bash
npm run test_processor_portal
```

Open a report on Ubuntu/Linux:

```bash
xdg-open reports/processor-portal/ProcessorPortalReport.html
```

Open a report on Windows Command Prompt:

```cmd
start "" "reports\processor-portal\ProcessorPortalReport.html"
```

Open a report on macOS:

```bash
open reports/processor-portal/ProcessorPortalReport.html
```

The standalone `test_login` and default `test` scripts use Mochawesome but do not currently specify a custom report directory or filename. The report output location/name for those commands therefore follows Mochawesome defaults.

### Run an individual file and create a custom report

Example for DropOff:

```bash
npx mocha tests/dropoff/DropOff.test.js \
  --reporter mochawesome \
  --reporter-options "reportDir=reports/dropoff,reportFilename=DropOffReport,html=true,json=true,overwrite=true"
```

On Windows PowerShell, the same command can be entered on one line:

```powershell
npx mocha tests/dropoff/DropOff.test.js --reporter mochawesome --reporter-options "reportDir=reports/dropoff,reportFilename=DropOffReport,html=true,json=true,overwrite=true"
```

## Downloads and test assets

- Test upload PDFs are stored in `assets/`.
- Browser downloads are written to a download directory. Some suites use `DOWNLOAD_DIR`; others derive a path from the operating system/user profile or project location.
- The ZIP contains sample downloaded PDF/XLS/XLSX files and existing Mochawesome reports. These are execution artifacts, not required source dependencies.
- Before running export/download tests, ensure the configured download directory exists and the browser has permission to write to it.
- If moving the project to another machine, update `DOWNLOAD_DIR` or the download path logic as appropriate.

## How the framework works

### Test lifecycle

Most suites follow the Mocha lifecycle:

- `before` creates the WebDriver instance and page objects.
- `it` executes one or more test cases.
- `after` closes the browser using `driver.quit()`.

### WebDriver setup

`utils/driver.js` centralizes browser creation. It reads `BROWSER`, configures Chrome/Firefox/Edge, applies timeouts and maximizes the window where possible.

### Page objects

Page objects encapsulate locators and reusable UI actions. Tests call page-object methods to perform actions and then use Chai assertions to validate results.

### Mochawesome test reporter helper

`utils/testReporter.js` provides a `TestReporter` class for adding test information, step details, failure reasons, stack traces and screenshots to Mochawesome. It can also instrument selected page-object methods to record automatic steps. The helper is available in the source; its use depends on how a particular test suite initializes and invokes it.

## Important execution notes

1. **Use a test environment.** These tests can create orders, change document statuses, add/edit addresses, alter fees, send messages, and complete checkout workflows.
2. **Test data is stateful.** Some tests refer to fixed order/document IDs and expect records to be in particular sections. A previous run can change the state and affect a later run.
3. **Order creation is not read-only.** `createNewOrder.test.js`, `process.test.js`, and `usAuthentication.test.js` create or process records.
4. **CAPTCHA requires manual action.** The Customer Portal login test pauses for manual CAPTCHA completion.
5. **Downloads are path-sensitive.** Ensure download folders exist and paths match the operating system.
6. **Avoid parallel execution against shared records.** The tests use shared application state and fixed test data in places. Run suites sequentially unless test data has been isolated.
7. **Combined and standalone suites overlap.** Running `processorPortalAllTests.test.js` together with standalone Expected, DropOff, Pickup or Ship To Customer suites may repeat the same operations.
8. **Review hard-coded test values.** Update order IDs, document IDs, dates, customer/contact names, countries, service choices and other fixed values for the target environment.
9. **Keep secrets out of Git.** Store credentials in `.env`, restrict access to reports/downloads containing customer information, and avoid committing sensitive artifacts.
10. **Check the test title IDs.** Some source files contain duplicate/non-sequential test case identifiers. The README preserves the broad coverage and does not renumber or silently change source test cases.

## Troubleshooting

### Browser does not start

- Confirm the selected browser is installed.
- Check `BROWSER` is one of `chrome`, `firefox`, or `edge`.
- Update the browser and ensure Selenium can obtain a compatible driver.
- Check network/proxy restrictions if Selenium Manager cannot resolve a driver.

### Login fails

- Verify `EMAIL` and `PASSWORD` or `WCS_EMAIL` and `WCS_PASSWORD`.
- Confirm the account is enabled and can access the relevant test application.
- For Customer Portal login, complete CAPTCHA manually when prompted.

### Element not found / timeout

- Confirm the application page loaded and the test account has the expected permissions.
- Check whether the target order/document is in the expected workflow section.
- Check whether filters/search terms or previous test runs changed the visible data.
- Re-check locators if the application UI has changed.

### Export or download test fails

- Verify the download directory exists and is writable.
- Check `DOWNLOAD_DIR` and any OS-specific path construction in the relevant test.
- Ensure the browser download is complete before the test checks the file.
- Check whether a file with the expected name already exists and whether the test handles existing files.

### Test passes alone but fails in a combined run

- Look for shared records or workflow states changed by earlier tests.
- Run tests sequentially.
- Reset or provision suitable test data before rerunning.
- Avoid running standalone and combined versions of the same module against the same records in the same execution window.

---

**Maintainer note:** Update this README whenever test files, npm scripts, environment variables, browser setup, or report locations change.