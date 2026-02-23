$files = Get-ChildItem "web_page/pages/public/*.html"
foreach ($f in $files) {
    if ($f.Name -eq "index.html") { continue }
    
    $content = Get-Content $f.FullName -Raw
    
    # 1. Reemplazar la etiqueta <jam-footer></jam-footer> por el contenedor de React
    if ($content -match "<jam-footer></jam-footer>") {
        $content = $content -replace "<jam-footer></jam-footer>", "<div id=""react-footer-root""></div>"
        Write-Output "Actualizado contenedor en $($f.Name)"
    }
    
    # 2. Reemplazar el script del Web Component por el bundle de React
    if ($content -match "js/components/Footer.js") {
        $content = $content -replace "js/components/Footer.js[^""]*", "js/react-footer.bundle.js"
        Write-Output "Actualizado script en $($f.Name)"
    }
    
    [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
}

# 3. Eliminar el archivo del Web Component para evitar confusiones
$legacyFile = "web_page/pages/public/js/components/Footer.js"
if (Test-Path $legacyFile) {
    Remove-Item $legacyFile
    Write-Output "Archivo legado eliminado: $legacyFile"
}
