# engine.py

import random
from datetime import datetime, timedelta
from collections import defaultdict

# =========================
# DUMMY DATA GENERATOR (30 DAYS)
# =========================

def generate_transactions(days=30):

    products = [
        {"name": "Smart LED Desk Lamp", "cost": 40000},
        {"name": "Crossbody Bag", "cost": 35000},
        {"name": "Wireless Charger", "cost": 25000},
        {"name": "Desk Organizer", "cost": 20000},
        {"name": "Bluetooth Speaker", "cost": 60000},
        {"name": "Notebook Planner", "cost": 15000},
        {"name": "Ergo Mouse", "cost": 50000},
        {"name": "Standing Desk Mini", "cost": 120000},
    ]

    today = datetime.today()
    transactions = []

    for i in range(days):
        date = today - timedelta(days=i)

        for p in products:

            base_sales = random.randint(3, 10)

            # simulate rising product
            if p["name"] == "Smart LED Desk Lamp":
                base_sales += int((days - i) * 0.3)

            for _ in range(base_sales):

                price = random.randint(p["cost"] + 15000, p["cost"] + 90000)
                status = "SUCCESS" if random.random() > 0.08 else "REFUND"

                transactions.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "product": p["name"],
                    "amount": price,
                    "cost": p["cost"],
                    "status": status
                })

    return transactions


# =========================
# ANALYTICS ENGINE
# =========================

def analyze():

    transactions = generate_transactions()

    total_transactions = len(transactions)
    paid = len([t for t in transactions if t["status"] == "SUCCESS"])
    refunded = len([t for t in transactions if t["status"] == "REFUND"])
    refund_rate = (refunded / total_transactions) * 100

    revenue = sum(t["amount"] for t in transactions if t["status"] == "SUCCESS")
    total_cost = sum(t["cost"] for t in transactions if t["status"] == "SUCCESS")
    margin = revenue - total_cost

    # =========================
    # RANKING PRODUCT
    # =========================

    product_revenue = defaultdict(int)
    for t in transactions:
        if t["status"] == "SUCCESS":
            product_revenue[t["product"]] += t["amount"]

    ranking = sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)

    # =========================
    # REVENUE TREND (7 DAYS)
    # =========================

    today = datetime.today()
    last7 = defaultdict(int)
    prev7_total = 0

    for t in transactions:
        date_obj = datetime.strptime(t["date"], "%Y-%m-%d")

        if t["status"] == "SUCCESS":
            if date_obj >= today - timedelta(days=7):
                last7[t["date"]] += t["amount"]

            elif date_obj >= today - timedelta(days=14):
                prev7_total += t["amount"]

    last7_total = sum(last7.values())

    growth = 0
    if prev7_total > 0:
        growth = ((last7_total - prev7_total) / prev7_total) * 100

    growth_badge = f"+{round(growth,1)}% Weekly Growth (Rising)" if growth > 0 else f"{round(growth,1)}% Weekly Growth (Cooling)"

    # =========================
    # PRODUCT TREND MOVEMENT
    # =========================

    product_trend = []

    for product in product_revenue.keys():

        last = 0
        prev = 0

        for t in transactions:
            if t["product"] == product and t["status"] == "SUCCESS":
                date_obj = datetime.strptime(t["date"], "%Y-%m-%d")

                if date_obj >= today - timedelta(days=7):
                    last += t["amount"]
                elif date_obj >= today - timedelta(days=14):
                    prev += t["amount"]

        g = 0
        if prev > 0:
            g = ((last - prev) / prev) * 100

        product_trend.append({
            "product": product,
            "growth_percent": round(g, 2),
            "status": "Rising" if g > 0 else "Cooling"
        })

    # =========================
    # RISK LABEL
    # =========================

    risk_label = "⚠ Elevated Refund Activity" if refund_rate > 5 else "Normal"

    # =========================
    # BUSINESS SCORE
    # =========================

    score = 50
    if growth > 20:
        score += 20
    if refund_rate < 5:
        score += 15
    if margin > 0:
        score += 15

    score = min(score, 100)

    return {
        "aggregated_data": {
            "total_transactions": total_transactions,
            "paid": paid,
            "refunded": refunded,
            "refund_rate_percent": round(refund_rate, 2),
            "revenue": revenue,
            "margin": margin,
        },
        "ranking_product": ranking,
        "business_score": score,
        "risk_label": risk_label,
        "revenue_trend_last_7_days": dict(last7),
        "weekly_growth_percent": round(growth, 2),
        "weekly_growth_badge": growth_badge,
        "product_trend_movement": product_trend
    }