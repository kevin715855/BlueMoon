import requests
import json
from dotenv import load_dotenv
import os
load_dotenv()

# CONFIG
SEPAY_API = os.getenv("SEPAY_API", "")
headers = {
        "Authorization": f"Bearer {SEPAY_API}",
        "Content-Type": "application/json"
    }


# Lấy danh sách giao dịch
def getTransactionsList():
    url = "https://my.sepay.vn/userapi/transactions/list"
    
    response = requests.get(url, headers=headers)
    data = response.json()
    transactions = data.get("transactions", [])
    return transactions


# Lấy chi tiết giao dịch theo ID
def getTransactionDetail(transaction_id):
    url = f"https://my.sepay.vn/userapi/transactions/details/{transaction_id}"

    response = requests.get(url, headers=headers)
    data = response.json()
    transaction = data.get("transaction", [])
    return transaction
    