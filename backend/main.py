from fastapi import FastAPI
import requests
import json
import os
import re
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from analysis_engine import calculate_potential_income
from analysis_engine import calculate_opportunity_score
from market_service import get_market_overview, refresh_market_data
from alert_engine import generate_market_alerts
from hastag_engine import get_top_trending_hashtags
from paylabs_service import analyze as paylabs_analyze 
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QWEN_API_KEY = os.getenv("QWEN_API_KEY") 
QWEN_BASE_URL = os.getenv("QWEN_BASE_URL")

print("QWEN_API_KEY:", QWEN_API_KEY)

# =============================
# 🔥 QWEN HELPER FUNCTION
# =============================
def call_qwen(prompt: str):
    url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "qwen-turbo",
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    response = requests.post(url, headers=headers, json=payload)

    print("STATUS:", response.status_code)
    print("TEXT:", response.text)

    try:
        res_json = response.json()
    except:
        return f"Invalid response: {response.text}"

    if response.status_code == 200:
        return res_json["choices"][0]["message"]["content"]
    else:
        return f"AI Error: {res_json}"

@app.get("/")
def root():
    return {"message": "Backend jalan 🚀"}


@app.get("/ask")
def ask_ai(q: str):
    ai_text = call_qwen(q)
    return {"question": q, "answer": ai_text}


@app.get("/analyze")
def analyze(user_id: int, product_name: str):

    result = calculate_potential_income(user_id, product_name)

    if "error" in result:
        return result

    prompt = f"""
    Kamu adalah AI Market Analyst untuk TikTok Affiliate.

    Berikut data performa produk:

    Product: {result['product_name']}
    CTR: {result['ctr']}%
    Conversion Rate: {result['cr']}%
    Estimated Clicks (1000 views): {result['estimated_clicks']}
    Estimated Sales: {result['estimated_sales']}
    Potential Income: ${result['income_min']} - ${result['income_max']}

    Berikan:
    1. Insight performa produk
    2. Level risiko (Low / Medium / High)
    3. Rekomendasi strategi singkat
    """

    ai_text = call_qwen(prompt)

    opportunity_score = calculate_opportunity_score(
        result['ctr'],
        result['cr'],
        result['estimated_sales'],
        result['income_max']
    )

    return {
        "metrics": result,
        "opportunity_score": opportunity_score,
        "ai_insight": ai_text
    }


@app.get("/market-overview")
def market_overview():
    return get_market_overview()


@app.get("/refresh-trends")
def refresh_trends():
    return refresh_market_data()


@app.get("/market-alerts")
def market_alerts():

    market_data = get_market_overview()
    alerts = generate_market_alerts(market_data)

    enriched_alerts = []

    for alert in alerts:
        prompt = f"""
        Kamu adalah AI Senior Ecommerce Strategist.

        Berikut alert sistem:

        {alert}

        Berikan:
        1. Ringkasan singkat (max 2 kalimat)
        2. Dampak bisnis
        3. 3 rekomendasi tindakan konkret

        Format jawaban rapi dan profesional.
        """

        ai_text = call_qwen(prompt)
        alert["ai_insight"] = ai_text
        enriched_alerts.append(alert)

    return {
        "total_alerts": len(enriched_alerts),
        "alerts": enriched_alerts
    }


@app.get("/hashtags/trending")
def trending_hashtags(limit: int = 5):
    data = get_top_trending_hashtags(limit)
    return {
        "total": len(data),
        "hashtags": data
    }


@app.get("/hashtags/generate")
def generate_ai_only_hashtags(product_name: str):

    prompt = f"""
        Kamu adalah AI TikTok Affiliate Growth Strategist.

        Nama Produk:
        {product_name}

        Tugas:
        1. Buat 4–6 PRIMARY hashtag (buyer intent tinggi)
        2. Buat 4–6 SUPPORTING hashtag (niche + edukasi)
        3. Tentukan 1 kombinasi hashtag TERBAIK (max 8)
        4. Fokus konversi, bukan viral semata

        PENTING:
        - Output HARUS JSON MURNI
        - JANGAN pakai markdown
        - JANGAN pakai ```json

        Format JSON:
        {{
            "primary_hashtags": [],
            "supporting_hashtags": [],
            "best_combination": [],
            "strategy_reason": ""
        }}
    """

    try:
        ai_text = call_qwen(prompt)

        clean_text = ai_text.strip()
        clean_text = re.sub(r"^```json", "", clean_text)
        clean_text = re.sub(r"^```", "", clean_text)
        clean_text = re.sub(r"```$", "", clean_text)
        clean_text = clean_text.strip()

        ai_result = json.loads(clean_text)

    except Exception as e:
        ai_result = {
            "error": "AI output invalid",
            "raw_output": ai_text if "ai_text" in locals() else None,
            "exception": str(e)
        }

    return {
        "product_name": product_name,
        "strategy": "AI-only (conversion focused)",
        "ai_recommendation": ai_result
    }


@app.get("/paylabs")
def paylabs_dashboard():

    data = paylabs_analyze()

    prompt = f"""
    Kamu adalah AI Senior Fintech Business Analyst.

    Berikut data performa transaksi:

    Aggregated Data:
    - Revenue: {data["aggregated_data"]["revenue"]}
    - Margin: {data["aggregated_data"]["margin"]}
    - Total Transactions: {data["aggregated_data"]["total_transactions"]}
    - Paid: {data["aggregated_data"]["paid"]}
    - Refunded: {data["aggregated_data"]["refunded"]}
    - Refund Rate: {data["aggregated_data"]["refund_rate_percent"]}%
    - Weekly Growth: {data["weekly_growth_percent"]}%
    - Risk Label: {data["risk_label"]}
    - Business Score: {data["business_score"]}/100

    Top 3 Products:
    {data["ranking_product"][:3]}

    Product Trend Movement:
    {data["product_trend_movement"][:3]}

    Berikan:
    1. Executive summary (max 4 kalimat)
    2. Penjelasan arah pertumbuhan
    3. Komentar kesehatan refund
    4. Rekomendasi strategi singkat

    Gunakan tone profesional dan strategis.
    """

    ai_text = call_qwen(prompt)

    data["ai_executive_insight"] = ai_text

    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)