BlueMoon/     
│
├── backend/                        # Code Python (Server)
│   ├── main.py                     # File chạy server FastAPI
│   ├── app/
│   │   ├── models/                 # Định nghĩa các bảng DB (User, Fee...)
│   │   ├── schemas/                # Định nghĩa dữ liệu đầu vào/ra (Pydantic)
│   │   ├── api/                    # Chứa các endpoints (routes)
│   │   │   ├── auth.py             # Login API
│   │   │   ├── fees.py             # API tính phí, tạo phí
│   │   │   └── residents.py        # API quản lý dân
│   │   ├── services/               # Logic nghiệp vụ (Tính toán tiền...)
│   │   └── core/                   # Config DB, Security
│   ├── requirements.txt
│   └── .env                        # Lưu mật khẩu DB
│
├── frontend/                       # Code ReactJS (Client)
│   ├── src/
│   │   ├── components/             # Các nút bấm, bảng biểu dùng chung
│   │   ├── pages/                  # Các màn hình chính
│   │   │   ├── Login/
│   │   │   ├── AdminDashboard/
│   │   │   ├── FeeManagement/      # Màn hình Kế toán
│   │   │   └── ResidentPortal/     # Màn hình Cư dân
│   │   ├── services/               # File gọi API (axios)
│   │   ├── utils/                  # Hàm format tiền tệ (VND), ngày tháng
│   │   └── App.js
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md