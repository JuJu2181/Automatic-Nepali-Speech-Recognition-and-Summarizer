# Automatic Nepali Speech Recognition and Summarizer (ANSRAS)
A simple system developed as major project for final year of computer which will convert Nepali speech to text and provide summary of text.

## Tasks completed
- [X] Speech Recognition Using CNN-GRU
- [X] Speech Recognition Using Wav2Vec2
- [X] Text Summarization using TextRank

## Directory Structure
- Training folder has all files needed for model training
- Web_App folder has all files needed for webapp(frontend and backend included) for real time testing

## To setup webapp in your local machine
1. Clone this repo
2. Install all the requirements from requirements.txt
```
pip install -r requirements.txt
```
2. For setting up Backend Go inside backend folder
3. Create a new folder named static and create 3 other folders named audio, input-text, text
4. Inside nepalimodel create a new folder called model_wav2vec and then download files from [here](https://huggingface.co/anish-shilpakar/wav2vec2-nepali-asr-v1/tree/main) and place the files in this folder
5. Run this command to start backend server
```
uvicorn api:app --reload
```
6. For frontend, open a new terminal and go inside the frontend folder
7. Make sure you have react installed in your computer, then run following command
```
npm install
```
8. To open the webapp run frontend server while still keeping the backend server running
```
npm start
```