from datetime import datetime


def calculate_severity(score):

    if score >= 85:
        return "CRITICAL"
    elif score >= 65:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


def generate_market_alerts(market_data, opportunity_data=None):

    alerts = []
    detected_time = datetime.now().strftime("%d %b %Y, %H:%M")

    rising = market_data.get("rising_categories", [])
    declining = market_data.get("declining_categories", [])
    market_share = market_data.get("market_share", [])
    velocity_score = market_data.get("trend_velocity_score", [])

    # ===============================
    # 1️⃣ TREND SPIKE
    # ===============================

    for item in rising:
        growth = item["growth_percent"]

        if growth >= 25:

            score = min(100, growth)
            severity = calculate_severity(score)

            alerts.append({
                "alert_type": "TREND_SPIKE",
                "severity": severity,
                "score": round(score, 2),
                "category": item["category"],
                "trend_growth": growth,
                "change_from_yesterday": item["change_from_yesterday"],
                "detected_at": detected_time
            })

    # ===============================
    # 2️⃣ MARKET SATURATION
    # ===============================

    for share in market_share:

        category = share["category"]
        percentage = share["percentage"]

        velocity = next(
            (v["score"] for v in velocity_score if v["category"] == category),
            50
        )

        if percentage > 30 and velocity < 50:

            saturation_score = percentage - velocity
            severity = calculate_severity(saturation_score)

            alerts.append({
                "alert_type": "MARKET_SATURATION",
                "severity": severity,
                "score": round(saturation_score, 2),
                "category": category,
                "market_share_percent": percentage,
                "velocity_score": velocity,
                "detected_at": detected_time
            })

    # ===============================
    # 3️⃣ HIGH REFUND RISK
    # ===============================

    if opportunity_data:

        for product in opportunity_data:

            refund_rate = product.get("refund_rate", 0)

            if refund_rate > 0.05:

                score = refund_rate * 100
                severity = calculate_severity(score)

                alerts.append({
                    "alert_type": "HIGH_REFUND_RISK",
                    "severity": severity,
                    "score": round(score, 2),
                    "product": product.get("product_name"),
                    "refund_rate": refund_rate,
                    "conversion_rate": product.get("conversion_rate"),
                    "detected_at": detected_time
                })

    # ===============================
    # 4️⃣ CONVERSION DROP
    # ===============================

    if opportunity_data:

        for product in opportunity_data:

            delta = product.get("conversion_delta", 0)

            if delta < -0.02:

                score = abs(delta) * 100
                severity = calculate_severity(score)

                alerts.append({
                    "alert_type": "CONVERSION_DROP",
                    "severity": severity,
                    "score": round(score, 2),
                    "product": product.get("product_name"),
                    "conversion_delta": delta,
                    "detected_at": detected_time
                })

    return alerts