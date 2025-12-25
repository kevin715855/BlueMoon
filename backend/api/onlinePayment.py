import requests
import json

# CONFIG
API_TOKEN = "9JOG3HEVB2KXUBD7SGOYGTLTNAC2OWP13PDQIVSFLFY1XZ5R7ZISWOBX0WD54ETN" 
headers = {
        "Authorization": f"Bearer {API_TOKEN}",
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
    




