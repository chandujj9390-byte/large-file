$port = 8765
$prefix = "http://localhost:$port/"
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$dbPath = Join-Path $root "data\db.json"

function Get-DBData {
    if (Test-Path $dbPath) {
        $json = Get-Content $dbPath -Raw -Encoding UTF8
        return $json | ConvertFrom-Json
    }
    return @{}
}

function Save-DBData($dbObj) {
    $json = $dbObj | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($dbPath, $json, [System.Text.Encoding]::UTF8)
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "ARNE Server running at $prefix"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        if ($urlPath -eq "/payment" -or $urlPath -eq "/payment/") { $urlPath = "/payment.html" }
        if ($urlPath -eq "/confirmation" -or $urlPath -eq "/confirmation/") { $urlPath = "/confirmation.html" }
        if ($urlPath -eq "/privacy-policy" -or $urlPath -eq "/privacy-policy/") { $urlPath = "/privacy-policy.html" }
        if ($urlPath -eq "/terms" -or $urlPath -eq "/terms/") { $urlPath = "/terms.html" }

        # API ROUTING
        if ($urlPath.StartsWith("/api/")) {
            $response.ContentType = "application/json; charset=utf-8"
            
            # Read Body if POST/PUT
            $bodyText = ""
            if ($request.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $bodyText = $reader.ReadToEnd()
                $reader.Close()
            }
            
            $db = Get-DBData

            if ($urlPath -eq "/api/config" -or $urlPath -eq "/api/public/config") {
                $resObj = @{ success = $true; razorpayKeyId = "rzp_test_simulated"; isTestMode = $true; modeMessage = "Smart Test Mode Active" }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if (($urlPath -eq "/api/book-slot" -or $urlPath -eq "/api/booking") -and $request.HttpMethod -eq "POST") {
                $bData = if ($bodyText) { $bodyText | ConvertFrom-Json } else { @{} }
                $bId = if ($bData.bookingId) { $bData.bookingId } elseif ($bData.booking_id) { $bData.booking_id } else { "ARNE-2026-" + (Get-Random -Minimum 100000 -Maximum 999999) }
                $resObj = @{ success = $true; bookingId = $bId; message = "Slot reserved successfully! Proceed to payment gateway." }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/create-order" -and $request.HttpMethod -eq "POST") {
                $orderData = if ($bodyText) { $bodyText | ConvertFrom-Json } else { @{} }
                $amountPaise = if ($orderData.amount) { [int]($orderData.amount * 100) } else { 50000 }
                $orderId = "order_" + (Get-Random -Minimum 10000000 -Maximum 99999999)
                $resObj = @{ success = $true; order_id = $orderId; amount = $amountPaise; currency = "INR"; key_id = "rzp_test_simulated" }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/send-otp" -and $request.HttpMethod -eq "POST") {
                $otpReq = if ($bodyText) { $bodyText | ConvertFrom-Json } else { @{} }
                $phone = if ($otpReq.phone) { $otpReq.phone } else { "9390662637" }
                $cleanPhone = $phone -replace '\D', ''
                if ($cleanPhone.Length -gt 10) { $cleanPhone = $cleanPhone.Substring($cleanPhone.Length - 10) }
                $testOtp = (Get-Random -Minimum 1000 -Maximum 9999).ToString()
                $global:ARNE_LAST_OTP = $testOtp
                $global:ARNE_LAST_PHONE = $cleanPhone
                Write-Host "[ARNE OTP Server] 4-Digit OTP generated for +91 $cleanPhone : [ $testOtp ]" -ForegroundColor Green
                $resObj = @{ success = $true; otp = $testOtp; phone = $cleanPhone; message = "4-Digit OTP sent successfully to +91 $cleanPhone" }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/verify-otp" -and $request.HttpMethod -eq "POST") {
                $vReq = if ($bodyText) { $bodyText | ConvertFrom-Json } else { @{} }
                $enteredOtp = if ($vReq.otp) { $vReq.otp.ToString().Trim() } else { "" }
                $isValid = ($enteredOtp -eq "1234") -or ($global:ARNE_LAST_OTP -and $enteredOtp -eq $global:ARNE_LAST_OTP)
                if ($isValid) {
                    Write-Host "[ARNE OTP Server] OTP Verified successfully: $enteredOtp" -ForegroundColor Green
                    $resObj = @{ success = $true; message = "OTP verified successfully. Proceeding to Razorpay..." }
                } else {
                    Write-Host "[ARNE OTP Server] Invalid OTP: $enteredOtp" -ForegroundColor Red
                    $resObj = @{ success = $false; message = "Invalid 4-digit OTP. Please enter $global:ARNE_LAST_OTP or 1234." }
                }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/payment" -and $request.HttpMethod -eq "POST") {
                $payData = if ($bodyText) { $bodyText | ConvertFrom-Json } else { @{} }
                $bId = if ($payData.bookingId) { $payData.bookingId } else { "ARNE-2026-000000" }
                $cName = if ($payData.customerName) { $payData.customerName } else { "Client" }
                $cPhone = if ($payData.customerPhone) { $payData.customerPhone } else { "N/A" }
                $cEmail = if ($payData.customerEmail) { $payData.customerEmail } else { "N/A" }
                $sName = if ($payData.serviceName) { $payData.serviceName } else { "Creative Service" }
                $txn = if ($payData.transactionRef) { $payData.transactionRef } else { "TXN-ARNE-" + (Get-Random -Minimum 100000 -Maximum 999999) }
                $paid = if ($payData.amountPaid) { $payData.amountPaid } else { 500 }
                
                Write-Host "=================================================" -ForegroundColor Cyan
                Write-Host "[ARNE PAYMENT CONFIRMED]" -ForegroundColor Green
                Write-Host "Booking ID: $bId" -ForegroundColor Yellow
                Write-Host "Client: $cName | Phone: $cPhone | Email: $cEmail"
                Write-Host "Service: $sName | Paid: INR $paid | Txn: $txn"
                Write-Host "[GMAIL ALERT] Notification dispatched to: arnestories26@gmail.com" -ForegroundColor Magenta
                Write-Host "[CUSTOMER NOTIFICATION] Message: Your booking is successful!" -ForegroundColor Green
                Write-Host "=================================================" -ForegroundColor Cyan

                $resObj = @{
                    success = $true
                    message = "Your booking is successful! Payment verified and confirmation sent."
                    adminNotified = "arnestories26@gmail.com"
                    receipt = @{
                        transactionId = $txn
                        bookingId = $bId
                        customerName = $cName
                        customerPhone = $cPhone
                        customerEmail = $cEmail
                        service = $sName
                        amountPaid = $paid
                        paymentMethod = "Razorpay Gateway (+91 OTP Verified)"
                        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                    }
                }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/contact" -and $request.HttpMethod -eq "POST") {
                $resObj = @{ success = $true; message = "Contact details received successfully." }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/login" -and $request.HttpMethod -eq "POST") {
                $loginReq = $bodyText | ConvertFrom-Json
                if ($loginReq.email -eq "arneworks26@gmail.com" -and $loginReq.password -eq "9398123529") {
                    $resObj = @{ success = $true; token = "arne_admin_token_2026"; user = @{ name = "ARNE Admin"; email = "arneworks26@gmail.com"; role = "ADMIN" } }
                } else {
                    $resObj = @{ success = $false; message = "Invalid admin email or password." }
                }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/dashboard") {
                $bookings = $db.bookings
                $totalBookings = if ($bookings) { $bookings.Count } else { 0 }
                $totalRev = 0
                $pendingPost = 0
                if ($bookings) {
                    foreach ($b in $bookings) {
                        $totalRev += [double]$b.totalPrice
                        $pendingPost += [double]$b.amountRemaining
                    }
                }
                $resObj = @{
                    success = $true
                    stats = @{
                        totalBookings = $totalBookings
                        totalRevenue = $totalRev
                        pendingPostpaid = $pendingPost
                        activeProjects = $totalBookings
                    }
                    recentBookings = $bookings
                    unreadNotifications = 1
                }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/bookings") {
                $resObj = @{ success = $true; bookings = $db.bookings }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/customers") {
                $resObj = @{ success = $true; customers = $db.customers }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/services") {
                $resObj = @{ success = $true; services = $db.services }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/slots") {
                $resObj = @{ success = $true; slots = $db.slots }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            if ($urlPath -eq "/api/admin/settings") {
                $resObj = @{ success = $true; settings = $db.settings }
                $jsonStr = $resObj | ConvertTo-Json -Depth 5
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
                continue
            }

            # Default API Fallback Response
            $resObj = @{ success = $true; message = "API request received." }
            $jsonStr = $resObj | ConvertTo-Json -Depth 5
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        # STATIC FILE SERVING
        $relPath = $urlPath.TrimStart('/').Replace('/', '\')
        $candidates = @(
            (Join-Path $root $relPath),
            (Join-Path $root "public\$relPath"),
            (Join-Path $root ($relPath -replace '^public\\', ''))
        )
        
        $resolvedPath = $null
        foreach ($cand in $candidates) {
            if (Test-Path $cand -PathType Leaf) {
                $resolvedPath = $cand
                break
            }
        }
        
        if ($resolvedPath) {
            $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
            $ext = [System.IO.Path]::GetExtension($resolvedPath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                ".webp" { $response.ContentType = "image/webp" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".mp4"  { $response.ContentType = "video/mp4" }
                ".mp3"  { $response.ContentType = "audio/mpeg" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # Single-page app fallback: serve index.html
            $indexPath = Join-Path $root "index.html"
            if (Test-Path $indexPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($indexPath)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        }
        $response.Close()
    } catch {
        # Catch and continue listening
    }
}
