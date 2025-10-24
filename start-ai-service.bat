@echo off
echo Starting FarmLink AI Service...
echo ========================================
echo Make sure you have Python installed and in your PATH
echo Also ensure you have installed the required packages:
echo   pip install -r ai-service/requirements.txt
echo ========================================
cd ai-service
python app.py
pause
