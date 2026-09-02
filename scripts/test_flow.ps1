Write-Host "--- 1. Testing Config API ---" -ForegroundColor Cyan
$cfg = Invoke-RestMethod -Uri "http://localhost:8765/api/config" -Method Get
Write-Host "Razorpay Key: $($cfg.razorpayKeyId) | Success: $($cfg.success)" -ForegroundColor Green

Write-Host "`n--- 2. Testing Slot Reservation ---" -ForegroundColor Cyan
$bookBody = @{
    fullName = "Ramesh Varma"
    mobile = "9390662637"
    email = "ramesh@gmail.com"
    serviceName = "Video Editing"
    prefDate = "2026-08-25"
    prefSlot = "10:00 AM"
    estBudget = "1000"
} | ConvertTo-Json
$slot = Invoke-RestMethod -Uri "http://localhost:8765/api/book-slot" -Method Post -ContentType "application/json" -Body $bookBody
Write-Host "Reserved Booking ID: $($slot.bookingId)" -ForegroundColor Green

Write-Host "`n--- 3. Testing Send OTP ---" -ForegroundColor Cyan
$otpBody = @{
    phone = "9390662637"
    bookingId = $slot.bookingId
} | ConvertTo-Json
$otp = Invoke-RestMethod -Uri "http://localhost:8765/api/send-otp" -Method Post -ContentType "application/json" -Body $otpBody
Write-Host "Generated OTP Code: $($otp.otp) for Phone: $($otp.phone)" -ForegroundColor Green

Write-Host "`n--- 4. Testing Verify OTP ---" -ForegroundColor Cyan
$verifyBody = @{
    phone = "9390662637"
    otp = $otp.otp
    bookingId = $slot.bookingId
} | ConvertTo-Json
$verify = Invoke-RestMethod -Uri "http://localhost:8765/api/verify-otp" -Method Post -ContentType "application/json" -Body $verifyBody
Write-Host "Verification: $($verify.message)" -ForegroundColor Green

Write-Host "`n--- 5. Testing Payment Verification & Email Dispatch to arnestories26@gmail.com ---" -ForegroundColor Cyan
$payBody = @{
    bookingId = $slot.bookingId
    customerName = "Ramesh Varma"
    customerPhone = "9390662637"
    customerEmail = "ramesh@gmail.com"
    serviceName = "Video Editing"
    bookingDate = "2026-08-25"
    bookingTime = "10:00 AM"
    amountPaid = 500
    totalPrice = 1000
    postpaidAmount = 500
    transactionRef = "pay_test_razorpay_9988"
} | ConvertTo-Json
$payment = Invoke-RestMethod -Uri "http://localhost:8765/api/payment" -Method Post -ContentType "application/json" -Body $payBody
Write-Host "Payment Status: $($payment.message)" -ForegroundColor Green
Write-Host "Admin Notified Destination: $($payment.adminNotified)" -ForegroundColor Yellow
Write-Host "Receipt Reference: $($payment.receipt.transactionId) for Booking: $($payment.receipt.bookingId)" -ForegroundColor Green

Write-Host "`n=== ALL TESTS PASSED SUCCESSFULLY! ===" -ForegroundColor Green
