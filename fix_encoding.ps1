$files = Get-ChildItem "web_page/pages/public/*.html", "web_page/pages/public/js/**/*.js", "web_page/pages/public/js/*.js" -Recurse
foreach ($f in $files) {
    if ($f.Extension -match "html|js") {
        $content = Get-Content $f.FullName -Encoding Default
        [System.IO.File]::WriteAllText($f.FullName, ($content -join "`r`n"), [System.Text.Encoding]::UTF8)
    }
}

$css = "web_page/pages/public/css/style.css"
$c = Get-Content $css -Encoding Default
$c = $c -replace "content: '‹'", "content: '\\2039'"
$c = $c -replace "content: '›'", "content: '\\203a'"
[System.IO.File]::WriteAllText($css, ($c -join "`r`n"), [System.Text.Encoding]::UTF8)
