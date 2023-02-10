from fileinput import filename
import os 
import subprocess 
from pydub import AudioSegment

def convertToFlac(audio_file,filename):
    command = f'ffmpeg -i {audio_file} {filename}.flac'
    subprocess.call(command,shell=True)
    print('=> File has been converted to .flac format')

# Alternatively using AudioSegment of Pydub
def convertToFlacAlt(audio_file,filename,ext):
    if ext == '.wav':
        ip = AudioSegment.from_wav(audio_file)
    # for mp3 you need to use from_mp3 instead of from_wav
    elif ext == '.mp3':
        ip = AudioSegment.from_mp3(audio_file)
    ip.export(f"{filename}_alt.flac",format="flac")
    print('=> File has been converted to .flac format') 

if __name__== '__main__':
    EXTENSIONS_LIST = ['.wav','.mp3']
    ip = input('Path of File to convert: ').lower()
    f,ext = os.path.splitext(ip)
    filename = f.split('\\')[-1]
    if ext in EXTENSIONS_LIST:
        print(f"=> Now converting to {ext} file to .flac format")
        # convertToFlac(ip,filename)
        convertToFlacAlt(ip,filename,ext)
    elif ext == '.flac':
        print("=> No Conversion needed | Already a .flac File")
    else:
        print(f"=> {ext} is an unknown format")

    