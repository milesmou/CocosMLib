set WORKSPACE=..

set LUBAN_EXE=Tools\Luban\Luban.exe
set CONF_ROOT=Confs

%LUBAN_EXE% ^
    -t all ^
    -c typescript-json ^
    -d json  ^
    --conf %CONF_ROOT%\luban.conf ^
    -x outputCodeDir=%WORKSPACE%\assets\scripts\gen\table ^
    -x outputDataDir=%WORKSPACE%\assets\bundles\dynamic\table ^
    -x tableImporter.name=miles ^
    -x json.compact=1

pause