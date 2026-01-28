set WORKSPACE=..

set LUBAN_EXE=Tools\Luban\Luban.exe
set CONF_ROOT=Confs

%LUBAN_EXE% ^
    -t all ^
    -c typescript-bin ^
    -d bin  ^
    --conf %CONF_ROOT%\luban.conf ^
    -x outputCodeDir=%WORKSPACE%\assets\scripts\gen\table ^
    -x outputDataDir=%WORKSPACE%\assets\bundles\zips\table\table ^
    -x bin.fileExt=bin ^
    -x tableImporter.name=miles

pause