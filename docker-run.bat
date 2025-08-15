@echo off
setlocal

set IMAGE_NAME="my-crawlee-app"
set IMAGE_TAG="latest"


echo Running Docker container...
docker run --rm -it ^
 --name crawlee-container ^
 -v "%cd%:/app" ^
 %IMAGE_NAME%:%IMAGE_TAG%