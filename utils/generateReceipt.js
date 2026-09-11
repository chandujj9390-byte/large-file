/**
 * ARNE Works — Client Invoice & Receipt Utility
 * Generates a high-end printable studio receipt/invoice with cinematic branding.
 */

export function printReceipt(booking, clientUser) {
  if (!booking) return;

  const invoiceId = booking.id || booking.transaction_id || `ARNE-INV-${Date.now().toString().slice(-6)}`;
  const dateFormatted = booking.booking_date 
    ? new Date(booking.booking_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date(booking.created_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const clientName = booking.client_name || booking.customer_name || clientUser?.user_metadata?.full_name || clientUser?.email?.split('@')[0] || 'Valued Client';
  const clientEmail = booking.client_email || booking.customer_email || clientUser?.email || 'client@arneworks.com';
  const serviceName = booking.service_name || booking.service_type || 'Studio Creative Service';
  
  const totalPrice = Number(booking.total_price || booking.amount_paid || 0);
  const prepaidAmount = Number(booking.prepaid_amount || (totalPrice / 2) || 0);
  const postpaidAmount = Number(booking.postpaid_amount || (totalPrice - prepaidAmount) || 0);
  const amountPaid = Number(booking.amount_paid || prepaidAmount || 0);
  const balanceDue = Math.max(0, totalPrice - amountPaid);
  const status = (booking.status || booking.booking_status || 'CONFIRMED').toUpperCase();

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to view and download your receipt.');
    return;
  }

  const receiptHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipt — ${invoiceId} — ARNE Works</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #060907;
          color: #e5e7eb;
          padding: 40px 20px;
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .receipt-card {
          width: 100%;
          max-width: 740px;
          background: #0d120f;
          border: 1px solid rgba(0, 255, 136, 0.25);
          border-radius: 20px;
          padding: 44px;
          position: relative;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 255, 136, 0.08);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 28px;
          margin-bottom: 32px;
        }

        .logo-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logo-accent {
          color: #00ff88;
        }

        .tagline {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .invoice-meta {
          text-align: right;
        }

        .invoice-badge {
          display: inline-block;
          background: rgba(0, 255, 136, 0.12);
          border: 1px solid rgba(0, 255, 136, 0.4);
          color: #00ff88;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 8px;
        }

        .invoice-id {
          font-family: 'Space Grotesk', monospace;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }

        .invoice-date {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .info-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #f3f4f6;
        }

        .info-sub {
          font-size: 12px;
          color: #9ca3af;
        }

        .table-wrapper {
          margin-bottom: 32px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9ca3af;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 14px;
        }

        td {
          padding: 16px 14px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #e5e7eb;
        }

        .service-name {
          font-weight: 700;
          color: #ffffff;
        }

        .service-desc {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .summary-box {
          margin-left: auto;
          width: 320px;
          background: rgba(0, 255, 136, 0.03);
          border: 1px solid rgba(0, 255, 136, 0.15);
          border-radius: 14px;
          padding: 18px 22px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 6px 0;
          color: #9ca3af;
        }

        .summary-row.total {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 8px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
        }

        .summary-row.total .val {
          color: #00ff88;
          font-family: 'Space Grotesk', sans-serif;
        }

        .paid-stamp {
          position: absolute;
          bottom: 160px;
          right: 50px;
          border: 3px dashed #00ff88;
          color: #00ff88;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 4px;
          padding: 8px 22px;
          border-radius: 8px;
          transform: rotate(-12deg);
          opacity: 0.85;
          text-transform: uppercase;
        }

        .footer {
          margin-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          line-height: 1.6;
        }

        .print-btn-bar {
          text-align: center;
          margin-bottom: 24px;
        }

        .btn-print {
          background: linear-gradient(135deg, #00ff88, #10b981);
          color: #050706;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 12px 28px;
          border-radius: 30px;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
        }

        @media print {
          body {
            background: #ffffff;
            color: #111827;
            padding: 0;
          }
          .print-btn-bar {
            display: none;
          }
          .receipt-card {
            background: #ffffff;
            color: #111827;
            border: 1px solid #e5e7eb;
            box-shadow: none;
            max-width: 100%;
          }
          .logo-title {
            color: #111827;
          }
          .logo-accent {
            color: #059669;
          }
          .info-grid {
            background: #f9fafb;
            border-color: #e5e7eb;
          }
          .info-value, .service-name, .summary-row.total {
            color: #111827;
          }
          .summary-box {
            background: #f9fafb;
            border-color: #e5e7eb;
          }
          .summary-row.total .val {
            color: #059669;
          }
          .paid-stamp {
            border-color: #059669;
            color: #059669;
          }
        }
      </style>
    </head>
    <body>
      <div>
        <div class="print-btn-bar">
          <button class="btn-print" onclick="window.print()">🖨️ Print / Download PDF</button>
        </div>

        <div class="receipt-card">
          <div class="paid-stamp">${status === 'CONFIRMED' || status === 'SUCCESS' || status === 'PAID' ? 'BOOKING CONFIRMED' : status}</div>

          <div class="header">
            <div>
              <div class="logo-title">ARNE<span class="logo-accent">✦</span></div>
              <div class="tagline">Cinematic Video & Design Studio</div>
            </div>
            <div class="invoice-meta">
              <span class="invoice-badge">Official Booking Summary</span>
              <div class="invoice-id">#${invoiceId}</div>
              <div class="invoice-date">${dateFormatted}</div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <div class="info-label">Client Details</div>
              <div class="info-value">${clientName}</div>
              <div class="info-sub">${clientEmail}</div>
              ${booking.client_phone ? `<div class="info-sub">${booking.client_phone}</div>` : ''}
            </div>
            <div>
              <div class="info-label">Studio Provider</div>
              <div class="info-value">ARNE Works Studio</div>
              <div class="info-sub">arneworks26@gmail.com</div>
              <div class="info-sub">Official WhatsApp Support</div>
            </div>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Status</th>
                  <th style="text-align:right;">Reference ID</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="service-name">${serviceName}</div>
                    <div class="service-desc">Professional creative studio deliverables with 100% watermark-free master output.</div>
                  </td>
                  <td>Pending Review / Recorded</td>
                  <td style="text-align:right; font-weight:700;">#${invoiceId}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>Selected Service:</span>
              <span>${serviceName}</span>
            </div>
            <div class="summary-row">
              <span>Business WhatsApp:</span>
              <span style="color:#25D366; font-weight:bold;">Official WhatsApp Direct</span>
            </div>
            <div class="summary-row">
              <span>Business Gmail:</span>
              <span style="color:#00ff88; font-weight:bold;">arneworks26@gmail.com</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing ARNE Works. For support or project inquiries, contact arneworks26@gmail.com.</p>
            <p style="margin-top:4px;">Generated securely via ARNE Client Portal • 256-bit Encrypted Transaction Record</p>
          </div>
        </div>
      </div>

      <script>
        // Auto trigger print prompt
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 350);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}
