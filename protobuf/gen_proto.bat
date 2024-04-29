set JSOut=..\assets\scripts\gen\proto
set CSOut=cs_out

if not exist  %JSOut% md %JSOut%
if not exist  %CSOut% md %CSOut%

@REM 生成JS代码
cmd /c "cd tools/compile-proto && npm run build-proto"
@REM 生成CS代码
tools\protoc\bin\protoc.exe --csharp_out=%CSOut% ./proto/*.proto

pause