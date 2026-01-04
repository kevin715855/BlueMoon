from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime

# PDF generation
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from backend.app.core.db import get_db
from backend.app.models.bill import Bill
from backend.app.models.payment_transaction import PaymentTransaction
from backend.app.models.resident import Resident
from backend.app.models.transaction_detail import TransactionDetail
from backend.app.schemas.payment import ReceiptResponse, ReceiptBillDetail

# Import Auth
from backend.app.api.auth import get_current_user

router = APIRouter()


@router.get("/{transaction_id}", response_model=ReceiptResponse, summary="Xuất biên lai thanh toán JSON")
def get_receipt(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_user)
):
    """
    Lấy thông tin biên lai thanh toán theo transaction ID (JSON format).
    Áp dụng cho cả thanh toán online và offline.
    """
    
    # Lấy transaction
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.transID == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(404, "Không tìm thấy giao dịch")
    
    # Lấy thông tin resident
    resident = db.query(Resident).filter(
        Resident.residentID == getattr(transaction, 'residentID')
    ).first()
    
    if not resident:
        raise HTTPException(404, "Không tìm thấy thông tin cư dân")
    
    # Lấy chi tiết các hóa đơn đã thanh toán trong transaction này
    transaction_details = db.query(TransactionDetail).filter(
        TransactionDetail.transID == transaction_id
    ).all()
    
    bills_data = []
    bill_deadlines = []
    if transaction_details:
        bill_ids = [getattr(td, 'billID') for td in transaction_details]
        bills = db.query(Bill).filter(Bill.billID.in_(bill_ids)).all()
        
        for bill in bills:
            bill_deadline = getattr(bill, 'deadline', None)
            if bill_deadline:
                bill_deadlines.append(bill_deadline)
            bills_data.append(ReceiptBillDetail(
                billID=getattr(bill, 'billID'),
                billName=str(getattr(bill, 'billName', None) or getattr(bill, 'typeOfBill', '') or ''),
                amount=float(getattr(bill, 'amount', 0)),
                deadlineDate=str(bill_deadline) if bill_deadline else ""
            ))

    payment_method = str(getattr(transaction, 'paymentMethod', '') or '')
    normalized_method = payment_method.strip().lower()
    if not normalized_method:
        payment_type = "Unknown"
    elif "offline" in normalized_method:
        payment_type = "Offline"
    else:
        payment_type = "Online"
    deadline_date = str(min(bill_deadlines)) if bill_deadlines else None
    
    return ReceiptResponse(
        transID=getattr(transaction, 'transID'),
        residentID=getattr(transaction, 'residentID'),
        residentName=str(getattr(resident, 'fullName', '')),
        apartmentID=str(getattr(resident, 'apartmentID', '')),
        phoneNumber=str(getattr(resident, 'phoneNumber', None)) if getattr(resident, 'phoneNumber', None) else None,
        totalAmount=float(getattr(transaction, 'amount', 0)),
        paymentMethod=payment_method,
        paymentType=payment_type,
        paymentContent=str(getattr(transaction, 'paymentContent', None)) if getattr(transaction, 'paymentContent', None) else None,
        status=str(getattr(transaction, 'status', '')),
        payDate=str(getattr(transaction, 'payDate', '')),
        deadlineDate=deadline_date,
        bills=bills_data
    )


@router.get("/{transaction_id}/pdf", summary="Xuất biên lai thanh toán PDF")
def get_receipt_pdf(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_accountant = Depends(get_current_user)
):
    """
    Xuất biên lai thanh toán dưới dạng file PDF.
    """
    
    # Lấy transaction
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.transID == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(404, "Không tìm thấy giao dịch")
    
    # Lấy thông tin resident
    resident = db.query(Resident).filter(
        Resident.residentID == getattr(transaction, 'residentID')
    ).first()
    
    if not resident:
        raise HTTPException(404, "Không tìm thấy thông tin cư dân")
    
    # Lấy chi tiết các hóa đơn
    transaction_details = db.query(TransactionDetail).filter(
        TransactionDetail.transID == transaction_id
    ).all()
    
    bills = []
    if transaction_details:
        bill_ids = [getattr(td, 'billID') for td in transaction_details]
        bills = db.query(Bill).filter(Bill.billID.in_(bill_ids)).all()
    
    # Tạo PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    # Default fonts
    font_name = 'Helvetica'
    font_name_bold = 'Helvetica-Bold'
    
    # Register Vietnamese font (DejaVu Sans supports Vietnamese)
    try:
        # Try to register DejaVu Sans font for Vietnamese support
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfbase import pdfmetrics
        import os
        
        # Common font paths
        font_paths = [
            'C:/Windows/Fonts/DejaVuSans.ttf',  # Windows
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',  # Linux
            'C:/Windows/Fonts/arial.ttf',  # Windows Arial as fallback
        ]
        
        font_registered = False
        for font_path in font_paths:
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('Vietnamese', font_path))
                font_name = 'Vietnamese'
                font_name_bold = 'Vietnamese'
                font_registered = True
                break
    except Exception:
        pass  # Use default Helvetica fonts
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=font_name_bold,
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=1  # center
    )
    
    # Title
    elements.append(Paragraph("BIÊN LAI THANH TOÁN", title_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Thông tin giao dịch
    info_data = [
        ['Mã giao dịch:', f"#{getattr(transaction, 'transID')}"],
        ['Ngày thanh toán:', str(getattr(transaction, 'payDate', ''))],
        ['Trạng thái:', str(getattr(transaction, 'status', ''))],
        ['', ''],
        ['Họ tên:', str(getattr(resident, 'fullName', ''))],
        ['Căn hộ:', str(getattr(resident, 'apartmentID', ''))],
        ['Số điện thoại:', str(getattr(resident, 'phoneNumber', '') or 'N/A')],
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('FONTNAME', (0, 0), (0, -1), font_name_bold),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Bảng hóa đơn
    if bills:
        heading2_style = ParagraphStyle(
            'Heading2Custom',
            parent=styles['Heading2'],
            fontName=font_name_bold
        )
        elements.append(Paragraph("<b>Chi tiết hóa đơn:</b>", heading2_style))
        elements.append(Spacer(1, 0.2*inch))
        
        bill_data = [['STT', 'Mã HĐ', 'Loại hóa đơn', 'Số tiền']]

        
        createDate = datetime.now()

        month = createDate.month
        year = createDate.year
        if month==1: 
            month = 12
            year = year - 1
        else:
            month=month
            year=year            
            
        bill_data = [['STT', 'Mã HĐ', 'Loại hóa đơn', 'Số tiền']]
        for idx, bill in enumerate(bills, 1):
            content = bill.typeOfBill.replace("ELECTRICITY", f"Tiền Điện tháng {month}/{year}") \
                                 .replace("WATER", f"Tiền Nước tháng {month}/{year}") \
                                 .replace("SERVICE", f"Phí Dịch Vụ tháng {month}/{year}")
            
            print(content)
            bill_data.append([
                str(idx),
                f"#{getattr(bill, 'billID')}",
                content,
                f"{float(getattr(bill, 'amount', 0)):,.0f} VNĐ"
            ])
        
        bill_table = Table(bill_data, colWidths=[0.8*inch, 1.2*inch, 2.5*inch, 1.8*inch])
        bill_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), font_name_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        elements.append(bill_table)
        elements.append(Spacer(1, 0.3*inch))
    
    # Tổng cộng
    total_data = [
        ['Phương thức thanh toán:', str(getattr(transaction, 'paymentMethod', ''))],
        ['TỔNG CỘNG:', f"{float(getattr(transaction, 'amount', 0)):,.0f} VNĐ"]
    ]
    
    total_table = Table(total_data, colWidths=[4*inch, 2*inch])
    total_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), font_name_bold),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('FONTSIZE', (0, 1), (-1, 1), 14),
        ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#dc2626')),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(total_table)
    
    # Footer
    elements.append(Spacer(1, 0.5*inch))
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontName=font_name
    )
    elements.append(Paragraph(
        "<i>Cảm ơn quý cư dân đã thanh toán đúng hạn!</i>",
        footer_style
    ))
    elements.append(Paragraph(
        f"<i>Biên lai được tạo tự động ngày {datetime.now().strftime('%d/%m/%Y %H:%M')}</i>",
        footer_style
    ))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=receipt_{transaction_id}.pdf"
        }
    )
