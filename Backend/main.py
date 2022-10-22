import uvicorn
from fastapi import FastAPI, File, UploadFile
import sys 
import soundfile as sf

# adding Summarizer to the system path
sys.path.insert(0, 'D:\Programming\Projects\major_project\Codes\Summarizer')

# To import from other folders
from summarizer import get_summary_from_text_file 

# Create the app Object 
app = FastAPI() 

# Routes 
@app.get('/')
def index():
    return {'message': 'Automatic Speech Recognition and Summarizer API'}

# when user clicks get summary in frontend
@app.post('/get_summary')
async def get_file(data: UploadFile = File(...)):
    # Get the file name and extension
    filename,ext = data.filename.split(".")
    # print(filename,ext)
    if ext != 'txt':
        reply_msg =  "File is not a text file"
    else:
        ip_content = await data.read() 
        ip_file_path = f'D:\Programming\Projects\major_project\Codes\Backend\Input\\{filename}.{ext}'
        with open(ip_file_path, 'wb') as f:
            f.write(ip_content)
        print("=>File has been uploaded to folder")
        summary = get_summary_from_text_file(ip_file_path)
        # Storing output may not be necessary we can also directly send the response back to client
        # op_file_path = f'D:\Programming\Projects\major_project\Codes\Backend\Output\\output_{filename}.txt'
        # open(op_file_path,'w',encoding='utf-8').write(summary)
        if summary == '' or summary == None:
            reply_msg = "No summary generated"
        else:
            reply_msg = summary
    
    return {"summary": reply_msg}

@app.post('/get_transcript')
async def get_file(data: UploadFile = File(...)):
    # Get the file name and extension
    filename,ext = data.filename.split(".")
    # print(filename,ext)
    if ext not in ('flac','wav'):
        reply_msg =  "File is not an audio file"
    else:
        ip_file_path = f'D:\Programming\Projects\major_project\Codes\Backend\Input\\{filename}.{ext}'
        audio_data, sr = sf.read(data.file)
        print(audio_data,sr)
        sf.write(ip_file_path,audio_data,sr)        
        print("=>File has been uploaded to folder")

if __name__ == "__main__":
    # for development
    uvicorn.run("main:app",host='127.0.0.1',port=8000,reload=True)
    # for production
    # uvicorn.run(app,host='127.0.0.1',port=8000)