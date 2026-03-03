from playwright.sync_api import sync_playwright


def get_top_trending_hashtags(limit: int = 10):
    url = "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en"
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 375, "height": 812},  # MOBILE
            user_agent=(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 "
                "Mobile/15E148 Safari/604.1"
            )
        )

        page = context.new_page()
        page.goto(url, timeout=60000)

        # Tunggu hashtag pertama muncul
        page.wait_for_selector("span[class*='titleText']", timeout=60000)

        # Scroll biar data kebuka
        page.mouse.wheel(0, 3000)
        page.wait_for_timeout(5000)

        ranks = page.query_selector_all("span[class*='rankingIndex']")
        hashtags = page.query_selector_all("span[class*='titleText']")
        posts = page.query_selector_all("span[class*='itemWrapper']")

        min_len = min(len(ranks), len(hashtags), len(posts))

        for i in range(min(limit, min_len)):
            results.append({
                "rank": ranks[i].inner_text().strip(),
                "hashtag": hashtags[i].inner_text().strip(),
                "posts": posts[i].inner_text().strip(),
                "source": "tiktok_creative_center"
            })

        browser.close()

    return results