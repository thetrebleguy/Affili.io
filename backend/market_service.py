from pytrends.request import TrendReq
import pandas as pd
import numpy as np
import time
import logging
from datetime import datetime, timedelta
import random

logging.basicConfig(level=logging.INFO)

# ==============================
# CATEGORY MAPPING
# ==============================

CATEGORY_KEYWORDS = {
    "fitness": "home workout equipment",
    "beauty & skincare": "skincare",
    "baby": "baby products",
    "digital goods": "online course",
    "electronics": "tech gadgets",
    "home & garden": "home decor",
    "pet": "pet accessories",
    "fashion": "fashion trends",
    "eco-friendly": "eco friendly products",
    "food & beverage": "healthy snacks"
}

# ==============================
# GOOGLE TRENDS CLIENT
# ==============================

pytrend = TrendReq(
    hl='en-US',
    tz=360,
    timeout=(10, 25)
)

cached_market_data = None


# ==============================
# SAFE FETCH (1 KEYWORD MODE - LEBIH STABIL)
# ==============================

def fetch_single_keyword(keyword):
    try:
        pytrend.build_payload([keyword], timeframe='today 1-m')
        data = pytrend.interest_over_time()

        if data.empty:
            return None

        if "isPartial" in data.columns:
            data = data.drop(columns=["isPartial"])

        return data

    except Exception as e:
        logging.warning(f"Keyword failed: {keyword} | {str(e)}")
        return None


# ==============================
# DUMMY FALLBACK DATA (ANTI GAGAL)
# ==============================

def generate_dummy_data():
    logging.warning("Using dummy fallback data")

    dates = [(datetime.today() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    dates.reverse()

    trend_growth = {
        "labels": dates,
        "categories": {}
    }

    velocity = {}
    yesterday_delta = {}

    for cat in CATEGORY_KEYWORDS.keys():
        values = [random.randint(40, 80) for _ in range(7)]
        trend_growth["categories"][cat] = values

        first = values[0]
        last = values[-1]
        yesterday = values[-2]

        v = (last - first) / first
        velocity[cat] = v
        yesterday_delta[cat] = last - yesterday

    return build_final_response(trend_growth, velocity, yesterday_delta)


# ==============================
# FINAL CALCULATION ENGINE
# ==============================

def build_final_response(trend_growth, velocity, yesterday_delta):
    avg_velocity = np.mean(list(velocity.values()))
    avg_velocity_percent = round(avg_velocity * 100, 2)

    if avg_velocity_percent > 10:
        momentum_label = "High Momentum"
    elif avg_velocity_percent > 3:
        momentum_label = "Moderate Growth"
    elif avg_velocity_percent >= 0:
        momentum_label = "Stable"
    else:
        momentum_label = "Cooling Down"

    rising = sorted(
        [
            {
                "category": k,
                "growth_percent": round(v * 100, 2),
                "change_from_yesterday": yesterday_delta[k]
            }
            for k, v in velocity.items() if v > 0
        ],
        key=lambda x: x["growth_percent"],
        reverse=True
    )[:3]

    declining = sorted(
        [
            {
                "category": k,
                "growth_percent": round(v * 100, 2),
                "change_from_yesterday": yesterday_delta[k]
            }
            for k, v in velocity.items() if v < 0
        ],
        key=lambda x: x["growth_percent"]
    )[:3]

    latest_values = {
        cat: trend_growth["categories"][cat][-1]
        for cat in trend_growth["categories"]
    }

    total = sum(latest_values.values())

    market_share = [
        {
            "category": cat,
            "percentage": round((latest_values[cat] / total) * 100, 2)
        }
        for cat in latest_values
    ]

    min_v = min(velocity.values())
    max_v = max(velocity.values())

    velocity_score = []

    for cat, v in velocity.items():
        if max_v - min_v == 0:
            score = 50
        else:
            score = ((v - min_v) / (max_v - min_v)) * 100

        velocity_score.append({
            "category": cat,
            "score": round(score, 2)
        })

    return {
        "rising_categories": rising,
        "declining_categories": declining,
        "avg_trend_velocity": {
            "value_percent": avg_velocity_percent,
            "momentum": momentum_label
        },
        "market_trend_growth": trend_growth,
        "market_share": market_share,
        "trend_velocity_score": velocity_score
    }

# REFRESH (SAFE VERSION)
def refresh_market_data():
    global cached_market_data

    try:
        all_data = []
        velocity = {}
        yesterday_delta = {}

        trend_growth = {
            "labels": [],
            "categories": {}
        }

        for category, keyword in CATEGORY_KEYWORDS.items():
            data = fetch_single_keyword(keyword)

            if data is None:
                continue

            values = data[keyword].tolist()
            dates = data.index.strftime("%Y-%m-%d").tolist()

            trend_growth["labels"] = dates
            trend_growth["categories"][category] = values

            first = values[0]
            last = values[-1]
            yesterday = values[-2]

            v = 0 if first == 0 else (last - first) / first

            velocity[category] = v
            yesterday_delta[category] = last - yesterday

            time.sleep(3)

        if not velocity:
            cached_market_data = generate_dummy_data()
            return cached_market_data

        cached_market_data = build_final_response(
            trend_growth,
            velocity,
            yesterday_delta
        )

        logging.info("Market data refreshed successfully")
        return cached_market_data

    except Exception as e:
        logging.error(str(e))
        cached_market_data = generate_dummy_data()
        return cached_market_data

# GET (NO GOOGLE CALL)

def get_market_overview():
    global cached_market_data

    if cached_market_data is None:
        return {
            "message": "Belum refresh, auto generate dummy data.",
            **generate_dummy_data()
        }

    return cached_market_data