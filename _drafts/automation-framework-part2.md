# Building a Scalable Test Automation Framework with Java, Selenium & Rest Assured – Part 2: Core Architecture

In the previous part, we laid the foundation of our automation framework by setting up Cucumber with TestNG and running our first BDD-style test. That gave us the structure to write scenarios and map them to step definitions.

Now, in this part, we’ll move one step ahead and focus on designing the Core Architecture of our framework. A well-thought-out architecture ensures that our framework is scalable, reusable, and easy to maintain — qualities that are non-negotiable in any industry-level setup.

## Why Core Architecture Matters?

Before diving into code, let’s understand why this layer is important:
• Separation of concerns → Business logic, driver setup, configurations, and utilities should never mix.
• Reusability → Common functionality (like driver initialization, waits, config reading) should not be duplicated in tests.
• Maintainability → A structured layout makes it easy for new team members to onboard quickly.
• Scalability → Supports UI (Selenium), API (Rest Assured), and hybrid tests without clutter.

1. config/\*.properties (local / qa / staging)

Purpose
Externalize environment-specific values (browser, base URLs, timeouts, grid settings). You switch environments by passing -Denv=qa (or default local) and ConfigLoader loads the matching file.

Why this is good
• Separation of concerns: Test behavior/config is separated from code.
• Easy environment switching: No code changes required to run against different environments.
• Fail-safe defaults: You can put sane defaults per environment.

What to watch for / improvements
• Keep secrets out of plain properties (use vault or CI secrets for credentials).
• Consider having a common.properties for shared values and environment overrides.
• Validate and document required keys so missing keys fail fast (your ConfigLoader does that).

2. ConfigLoader.java

What it does
• On class load, reads config/<env>.properties from classpath.
• Stores properties in a single immutable PROPS object.
• Exposes typed helper getters: get, getBoolean, getInt.

Best practices followed
• Fail fast: If a config file is missing, it throws a clear runtime exception — prevents mysterious test runs.
• Single source of truth: All config read from one place; easy to change.
• Typed helpers: getBoolean and getInt reduce repeated parsing logic.

Suggestions / improvements
• Add a getOrDefault(key, defaultVal) pattern consistently to avoid throwing when not necessary.
• Improve error messages to include env and file path (already mostly done).
• Consider caching environment name for logs.
• If you later need dynamic reload (rare in CI), avoid static init — but static is fine for CI runs.

3. BrowserType.java

What it does
• Gives type-safety to browser choices instead of raw strings.
• from converts the config string to enum.

Best practices
• Type-safety: Enums prevent magic strings spread throughout code.
• Centralized parsing: If you need to support aliases (e.g., “chrome-headless”), you can extend from().

4. DriverManager.java (ThreadLocal, local vs remote, headless)

Key ideas from the code:
• private static final ThreadLocal<WebDriver> TL_DRIVER = new ThreadLocal<>();
• getDriver() lazily creates driver per thread.
• quitDriver() quits and TL_DRIVER.remove() to avoid leaks.
• createDriver() reads grid.enabled, browser, headless from ConfigLoader.
• createLocalDriver() builds ChromeOptions/FirefoxOptions/EdgeOptions.
• createRemoteDriver() builds RemoteWebDriver with options.
• Timeouts: sets implicit wait (0 recommended), page load timeout, maximizes only when not headless.

Why this is solid
• ThreadLocal: Essential for parallel execution; each test thread gets its own driver instance.
• Lazy init: Driver created only when needed.
• Centralized creation: All browser-specific config is in one place (single responsibility).
• Support for Grid/Remote: Easy to switch to Selenium Grid/Selenoid/remote services via config.
• Sensible timeouts: Default implicit wait is 0 to avoid mixing implicit+explicit waits; uses explicit waits elsewhere.

Best practices followed
• No static/global WebDriver: Avoids cross-test interference.
• Remove ThreadLocal on quit: Prevents memory leaks between tests.
• Use Options objects: Encapsulate browser capabilities cleanly.
• PageLoadStrategy set explicitly (safer than default for certain apps).

Notes on specific lines
• options.addArguments("--headless=new"): uses newer headless mode for Chrome; good when using recent Chrome/Chromedriver.
• driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(implicit)); — you set implicit = 0 in configs (good); rely on explicit waits.
• if (!headless) driver.manage().window().maximize(); — in headless mode the window maximize is not meaningful and can cause errors on some setups.

Improvements / edge-cases
• Add capability to inject additional capabilities (e.g., browserVersion, platformName) for cloud providers.
• Add logging around driver creation and grid connection attempts (helps debugging).
• For remote drivers, set setCapability("se:recordVideo", true) or similar if using Selenoid/BrowserStack — but that’s environment-specific.
• Add retry when connecting to Grid to tolerate temporary network issues.
• Consider using Selenium Manager (Selenium 4.6+) or WebDriverManager fallback for local binary management — modern Selenium auto-downloads drivers.

5. BasePage.java (abstract page with explicit waits & safe actions)

Purpose
• Provide a base building block for all page objects: central access to driver and wait, and common actions.

Best practices
• Explicit Waits: All interactions are wrapped with waits (waitVisible, waitClickable) to reduce flakiness.
• No direct driver.findElement in tests: Tests interact with page methods that hide locator and wait complexity.
• Reuse WebDriverWait instance: Avoid creating a new wait object each time; reuse the one configured by explicit timeout.

Further suggestions
• Add jsClick(By) fallback for stubborn elements, but use only when click() fails.
• Provide safeGetAttribute, hover, scrollIntoView, and retryAction helpers.
• Avoid exposing driver publicly; keep protected so only page objects or framework internals use it.
• Consider a FluentWait or custom wait util for polling/flexible exceptions.
• Add logging in every action (e.g., log.info("Clicking element: {}", locator)).

6. BaseTest.java (TestNG base for non-Cucumber tests)

Purpose
• Provide setup/teardown for TestNG tests: start driver, navigate to base URL, and clean up.

Why this is good
• Test isolation: Each test gets a fresh browser instance, avoiding state leakage.
• Config-driven URL: The URL can be changed per environment.

Notes
• For Cucumber you’ll implement similar logic in @Before/@After hooks so step definitions stay clean.
• alwaysRun = true ensures teardown even when a prior setup fails — helps clear resources.

Improvements
• Add test-scoped logging context (test name) for easier tracing in logs/reports.
• Optionally accept a parameter to start tests without auto-navigation (for API-only scenarios).

7. BaseAPI.java (Rest Assured request spec)

Purpose
• Centralize base API configuration so every API client can extend BaseAPI and use givenBase() to start requests.

Best practices
• RequestSpecBuilder centralizes baseUri, headers, content-type — no duplication in tests.
• Enable logging on failure to avoid noisy logs in successful runs but capture required details on failures.
• Use RequestSpecification to apply common authentication tokens, headers, or filters.

Improvements
• Add an authentication manager to inject/access tokens and refresh flows (e.g., store tokens in a singleton or thread-local for multi-threaded API tests).
• Add a ResponseSpecification for common status checks (e.g., 200).
• Add filters for pretty logging, or attach request/response payloads to test reports.

8. SampleSteps.java (updated steps using DriverManager + ConfigLoader)

What changed
• Removed new ChromeDriver() from step defs — now steps use centralized DriverManager.
• URLs read from ConfigLoader instead of hard-coded strings.

Best practices
• Step defs remain thin and delegate to page objects or managers — keeps BDD scenarios readable.
• Single point of driver creation/cleanup makes global behavior predictable.

Improvements
• Remove quitDriver() from step defs and put it in a Cucumber @After hook — that keeps step defs focused on behavior.
• Use page objects inside steps (e.g., HomePage home = new HomePage(); home.assertTitle(expected)), not direct driver calls — increases readability and reuse.
• Add assertions with clear failure messages.

## Cross-cutting Best Practices & Rationale (why this Phase 3 is designed this way)

    1.	Fail-fast configuration — If a config is missing or malformed we fail immediately. This prevents long noisy runs against wrong settings.
    2.	Thread safety — ThreadLocal<WebDriver> allows safe parallel execution without test interference.
    3.	Explicit waits over implicit waits — Implicit waits are set to 0 in config, and all interactions use explicit WebDriverWait to reduce flakiness and avoid mix-ups between implicit and explicit waits.
    4.	Centralized factories and base classes — Driver, API request specs, and base page logic are centralized. This reduces duplication and makes changes (e.g., adding a desired capability) quick.
    5.	Separation of concerns — Page Objects encapsulate UI logic; step defs and tests orchestrate flows; config controls environment specifics.
    6.	Minimal leakage in tests — quitDriver() removes ThreadLocal and quits, preventing leftover browser processes.

## What’s Next?

With our Core Architecture in place, we now have a solid foundation to:
• Add Page Object Model (POM) for UI automation.
• Extend support for API testing using Rest Assured.
• Plug in logging (Log4j/SLF4J) and reporting (Extent Reports/Allure).

In the next part of this series, we’ll focus on building the Page Object Model (POM) layer, which will make our UI test scripts clean and readable. 🚀
