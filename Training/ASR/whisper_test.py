import whisper 
import os 

model = whisper.load_model("base")

ip_file_path = input('Enter the file to test: ')
print('=> Input received')
audio = whisper.load_audio(ip_file_path)
basename = os.path.basename(ip_file_path)
filename,ext = os.path.splitext(basename)

mel = whisper.log_mel_spectrogram(audio).to(model.device)

# detect the spoken language
_, probs = model.detect_language(mel)
print(f"Detected language: {max(probs, key=probs.get)}")

# decode the audio
options = whisper.DecodingOptions()
result = whisper.decode(model, mel, options)

op_file_path = f'D:\Programming\Projects\major_project\Codes\ASR\wav2vec_predictions\\{filename}_whisper.txt'
# output = model.transcribe(ip_file_path)        
with open(op_file_path,'w+',encoding='utf-8') as f:
    f.write(result.text)
print("=> Output has been written to a file")