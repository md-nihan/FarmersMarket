@echo off
echo Installing AI Service Dependencies...
echo ========================================
echo This will install the required Python packages for the AI service
echo Make sure you have Python and pip installed
echo ========================================
cd ai-service
pip install -r requirements.txt
echo ========================================
echo Installation complete!
pause