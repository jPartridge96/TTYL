@echo off
echo Welcome to build tool - Angular to apk
echo usage: build.bat projectName 
echo ================================================================================
set project=%1
@REM set configFile=%2
@REM set iconFile=%3
@REM set splashFile=%4
@REM set pluginsFile=%5

cd %project%

echo Cleaning old dist and mobile folders
rmdir dist /s /q
rmdir mobile /s /q
echo success: cleaning complete.
echo Building angular app...
call ng build
echo success: angular app built

echo Creating cordova project 'mobile'...
call cordova create mobile
echo success: cordova project created

echo Deleting www content...
cd mobile\www
rmdir css /s /q 
rmdir js /s /q
rmdir img /s /q
del index.html
echo success: www is empty

cd ..
cd ..
cd dist

for /d %%a in (*) do set projFolder=%%a

cd ..
cd mobile\www

echo Copying dist to www...
@REM xcopy ..\..\dist\angular-bootstrap-template\* .
@REM the following command is not copying assets folder
@REM xcopy ..\..\dist\%projFolder%\* .
@REM this command copies all subfolders and files including assets
xcopy ..\..\dist\%projFolder%  /e
echo success: copy dist to www complete

echo Updating config.xml file
cd ..
del config.xml
echo success: old config.xml deleted
copy ..\..\config.xml .
echo success: new config.xml copied

echo copying icon and splash
copy ..\..\icon.png .
copy ..\..\splash.png .
echo success: copying complete

echo executing packing commands
call ..\..\plugins.bat


:DONE
@REM Copy the apk from
mkdir ..\..\releases
copy platforms\android\app\build\outputs\apk\debug\app-debug.apk ..\..\releases
ren ..\..\releases\app-debug.apk totyl-v1.0.apk

echo changing folder to original path
cd ..
cd ..
echo ---DONE---





