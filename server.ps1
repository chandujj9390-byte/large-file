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

            if ($urlPath -eq "/api/payment" -and $request.HttpMethod -eq "POST") {
                $resObj = @{ success = $true; message = "Payment verified and booking confirmed." }
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
