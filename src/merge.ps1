
$version = "1.0.1"
$sourceFile = "sspjs.js"
$targetFile = "..\dist\sspjs-$version.js"

Write-Host "read source: '$sourceFile'" -fore yellow
$content = [string](gc $sourceFile -Raw)
$result = $content
[regex]::Matches($content, "///include\([a-zA-Z]+\)") | select value | %{
	$include = $_.Value
	$folder = $include.Substring(11, ($include.Length - 12))
	$file = "$folder\$folder.js"
	$incl = [string](gc $file -Raw)
	if([String]::IsNullOrEmpty($incl) -eq $false){
		Write-Host "replace: '$include' with file content: '$file'"  -fore yellow
		$incl = "$incl,"
		$index = $incl.IndexOf("=")
		$incl = $incl.Remove($index, 1).Insert($index, ":")
		$result = $result.Replace($include, $incl)
	}
}

sc $targetFile $result
Write-Host "write target: '$targetFile'"  -fore green