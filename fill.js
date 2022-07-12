const util = require("util");
const { chromium } = require("playwright");
// const { expect } = require("@playwright/test");

const runApp = async () => {
    await startBrowser();
    // await fillLoginData(data.username, data.password);
    await selectLisence();
    await chooseDate();

    await close();
};

const startBrowser = async () => {
    global.browser = await chromium.launch({
        headless: false,
        channel: "chrome",
    });
    global.context = await global.browser.newContext();
    // global.context = await global.browser.newContext({
    //     storageState: "dropboxAuthorized.json",
    // });

    global.page = await global.context.newPage();

    await page.goto("https://applydl.dotm.gov.np/login");
};

const fillLoginData = async (username, password) => {
    await page.fill(field.usernameSelector, username);
    await page.fill(field.passwordSelector, password);
    await page.click(field.loginButtonSelector);

    await page.waitForSelector("#navbarDarkDropdownMenuLink");
    await context.storageState({ path: "dropboxAuthorized.json" });
};

const selectLisence = async () => {
    await page.click(field.applyForLicenseSelector);
    await page.click(field.agreementCheckboxSelector);
    await page.click(field.nextBtnSelector);
    await page.click(field.scooterSelector);
    await page.click(field.nextBtnSelector);

    const provinceLocator = await page.locator(field.provinceSelector);
    await provinceLocator.selectOption(
        { label: "Gandaki (गण्डकी)" },
        { force: true }
    );

    const officeLocator = await page.locator(field.officeSelector);
    await officeLocator.selectOption(
        { label: "Transport Management Office, Kaski" },
        { force: true }
    );

    await page.click(field.nextBtnSelector);
};

const chooseDate = async () => {
    const datePickerLocator = await page.locator(field.datePicker);

    await page.click(field.dateSelector);
    await datePickerLocator.waitFor({ state: "visible" });

    // select year
    const yearLocator = await page.locator(field.yearSelector);
    await yearLocator.selectOption({ label: data.currYear }, { force: true });

    // select month
    const monthLocator = await page.locator(field.monthSelector);
    await monthLocator.selectOption({ label: data.currMonth }, { force: true });

    // get all the days where there is chance to have a trial
    const availableDaysLocator = await page.locator(
        field.availableDateSelector
    );
    const availableDaysArray = await availableDaysLocator.allInnerTexts();

    // among all the available days, choose the last date
    const day = availableDaysArray[availableDaysArray.length - 1];

    // select the last day
    const currDate = convertDateToStdFormat(data.currYear, data.currMonth, day);
    await page.click(util.format(field.particularDateSelector, currDate));
    await datePickerLocator.waitFor({ state: "hidden" });

    await page.click(field.nextBtnSelector);
};

const close = async () => {
    if (data.closePageAfterCompletion) {
        await page.close();
        await context.close();
        await browser.close();
    }
};

const convertDateToStdFormat = (year, month, day) => {
    return `${year}-${padTo2Digits(
        monthArray.indexOf(month) + 1
    )}-${padTo2Digits(day)}`;
};

const padTo2Digits = (num) => {
    return num.toString().padStart(2, "0");
};

const monthArray = [
    "Baisakh",
    "Jesth",
    "Asadh",
    "Shrawan",
    "Bhadra",
    "Asojh",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
];

const field = {
    usernameSelector: "input[placeholder='Username']",
    passwordSelector: "#password",
    loginButtonSelector: "button[type='submit']",

    applyForLicenseSelector: "div.dotm_action_wrapper > div:nth-child(5)",
    agreementCheckboxSelector: "#disclaimer",
    nextBtnSelector: "button[type='submit']",
    scooterSelector: "img[alt='Scooter, Moped']",

    provinceSelector:
        "//option[contains(text(),'Gandaki (गण्डकी)')]/ancestor::select",
    officeSelector:
        "//option[contains(text(),'Transport Management Office, Kaski')]/ancestor::select",

    dateSelector: "#visit_date_bs",
    yearSelector: "#year",
    monthSelector: "#month",
    availableDateSelector: ".nepDate",
    particularDateSelector: ".nepDate[data-value='%s']",

    datePicker: "#divNepDatePicker",
};

const data = {
    username: "",
    password: "",
    currYear: "2079",
    currMonth: "Shrawan",
    closePageAfterCompletion: false,
};

runApp();
