import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Scroll down the homepage to reveal homepage category cards (look for visible titles such as 'Essentials Collection', 'Best Sellers', or other category cards) so a category card can be clicked.
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Grab Yours' card in the 'Daily Gains' section to open the product list narrowed to that category.
        # Grab Yours link
        elem = page.get_by_role('link', name='Grab Yours', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify products are displayed
        await page.locator("xpath=/html/body/main/div/div[2]/div/div/article[1]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the first product card to be visible.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/div/article[1]").nth(0)).to_be_visible(timeout=15000), "Expected the first product card to be visible."
        await page.locator("xpath=/html/body/main/div/div[2]/div/div/article[2]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the second product card to be visible.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/div/article[2]").nth(0)).to_be_visible(timeout=15000), "Expected the second product card to be visible."
        await page.locator("xpath=/html/body/main/div/div[2]/div/div/article[3]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the third product card to be visible.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/div/article[3]").nth(0)).to_be_visible(timeout=15000), "Expected the third product card to be visible."
        await page.locator("xpath=/html/body/main/div/div[2]/div/div/article[4]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the fourth product card to be visible.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/div/article[4]").nth(0)).to_be_visible(timeout=15000), "Expected the fourth product card to be visible."
        await page.locator("xpath=/html/body/main/div/div[2]/div/div/article[5]").nth(0).scroll_into_view_if_needed()
        # Assert: Expected the fifth product card to be visible.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/div/article[5]").nth(0)).to_be_visible(timeout=15000), "Expected the fifth product card to be visible."
        
        # --> Verify the product list is narrowed to a category
        # Assert: Expected the URL to contain '?category=' indicating the product list is filtered by a category.
        await expect(page).to_have_url(re.compile("category="), timeout=15000), "Expected the URL to contain '?category=' indicating the product list is filtered by a category."
        # Assert: Expected the 'All Categories' filter to be hidden after selecting a category.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/aside/div/div[1]/div/button[1]").nth(0)).not_to_be_visible(timeout=15000), "Expected the 'All Categories' filter to be hidden after selecting a category."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    