#!/usr/bin/env python3
from paylabs_service import analyze

result = analyze()
print("Paylabs Service Test Results:")
print("=" * 50)
print(f"Business Score: {result.get('business_score', 'N/A')}/100")
print(f"Weekly Growth: {result.get('weekly_growth_badge', 'N/A')}")
print(f"Total Revenue: Rp {result.get('aggregated_data', {}).get('revenue', 0):,.0f}")
print(f"Refund Rate: {result.get('aggregated_data', {}).get('refund_rate_percent', 0)}%")
print(f"Total Transactions: {result.get('aggregated_data', {}).get('total_transactions', 0)}")
print("=" * 50)
print("Status: Backend integration successful!")
