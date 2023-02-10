# wave basics 
import wave 

# read from a loaded audio file
# obj = wave.open("D:\Programming\Projects\major_project\Codes\ASR\\ne_np_female\\test30sec.wav","rb")
obj = wave.open("D:\Programming\Projects\major_project\Codes\ASR\data\\5k\\audio\\00a1f8a9cc.flac","rb")
# getting the parameters 
n_channels = obj.getnchannels()
sample_width = obj.getsampwidth()
frame_rate = obj.getframerate()
n_frames = obj.getnframes() 
params = obj.getparams()

# print params
print(f"Number of Channels: {n_channels}")
print(f"Sample width: {sample_width}")
print(f"Frame rate: {frame_rate}")
print(f"Number of frames: {n_frames}")
print(f"Parameters: {params}")

# time of the audio 
t_audio = n_frames/frame_rate
print(f'Audio time: {t_audio} seconds')

# read all frames with -1 
frames = obj.readframes(-1)
# frames is of type bytes and individual frame is integer
print(type(frames),type(frames[0]))
# also it can be seen that the number of frames is different from the length of frames list  
print(len(frames))
obj.close()

# # writing to an audio file
# obj_new = wave.open("wave_test_new.wav","wb")
# # saving to mono channel
# obj_new.setnchannels(1)
# obj_new.setsampwidth(4)
# obj_new.setframerate(48000)
# obj_new.writeframes(frames)
# obj_new.close()
