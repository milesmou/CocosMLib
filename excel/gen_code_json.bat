set WORKSPACE=..

set LUBAN_EXE=%WORKSPACE%\excel\Tools\Luban\Luban.exe
set CONF_ROOT=%WORKSPACE%\excel\Confs

%LUBAN_EXE% ^
    -t all ^
    -c typescript-json ^
    -d json  ^
    --conf %CONF_ROOT%\luban.conf ^
    -x outputCodeDir=%WORKSPACE%\assets\scripts\gen\table ^
    -x outputDataDir=%WORKSPACE%\assets\bundles\dynamic\table ^
    -x tableImporter.name=miles

pause