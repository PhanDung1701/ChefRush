# Lightweight static HTTP server for local testing in PowerShell
param (
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server started at $prefix"
    
    $mimeMap = @{
        ".html" = "text/html; charset=utf-8"
        ".css"  = "text/css; charset=utf-8"
        ".js"   = "application/javascript; charset=utf-8"
        ".json" = "application/json; charset=utf-8"
        ".png"  = "image/png"
        ".jpg"  = "image/jpeg"
        ".svg"  = "image/svg+xml"
        ".ico"  = "image/x-icon"
        ".wav"  = "audio/wav"
        ".mp3"  = "audio/mpeg"
    }

    while ($listener.IsListening) {
        $context = $null
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $urlPath = $request.Url.LocalPath
            if ($urlPath -eq "/" -or $urlPath -eq "") {
                $urlPath = "/index.html"
            }
            Write-Host "REQ: $($request.Url.PathAndQuery) ($($request.HttpMethod))"

            # Local file path
            $localPath = Join-Path $PSScriptRoot ($urlPath.TrimStart('/').Replace('/', '\'))

            if ($request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                [System.IO.File]::WriteAllText($localPath, $body)
                $response.StatusCode = 200
                $okBytes = [System.Text.Encoding]::UTF8.GetBytes("OK")
                $response.ContentLength64 = $okBytes.Length
                $response.OutputStream.Write($okBytes, 0, $okBytes.Length)
                $response.OutputStream.Close()
                continue
            }

            if (Test-Path -Path $localPath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $contentType = "application/octet-stream"
                if ($mimeMap.ContainsKey($ext)) {
                    $contentType = $mimeMap[$ext]
                }
                $response.ContentType = $contentType
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
                $response.ContentLength64 = $notFoundBytes.Length
                $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
            }
            $response.OutputStream.Close()
        } catch {
            Write-Host "Request handled with error: $_"
            if ($context -and $context.Response) {
                try { $context.Response.OutputStream.Close() } catch {}
            }
        }
    }
} catch {
    Write-Host "Server fatal error: $_"
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
