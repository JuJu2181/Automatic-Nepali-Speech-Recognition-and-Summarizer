import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import soundfile as sf 
import pyloudnorm as pyln 
import numpy as np
from nepalimodel import load_model

model, processor, device = load_model.loadModelInitial()



torch.cuda.empty_cache()
def segmentLargeArray(inputTensor,chunksize=200000):
    # print(inputTensor)
    list_of_segments = []
    tensor_length = inputTensor.shape[1]
    for i in range(0,tensor_length+1,chunksize):
        list_of_segments.append(inputTensor[:,i:i+chunksize])
    return list_of_segments 
def adjust_volume(ip_tensor,sr):
    data = ip_tensor.numpy()
    # Peak normalization of all audio to -1dB
    meter = pyln.Meter(sr) #create BS.1770 Meter
    # print(data)
    # print(np.transpose(data).shape)
    loudness = meter.integrated_loudness(np.transpose(data)) 
    print(f'Before: {loudness} dB')
    print("---------------------------------------------------")
    # This is peak normalization which depends on the original volume of audio file
    # peak_normalized_audio = pyln.normalize.peak(data,-1.0)
    # Actually this is loudness normalization to a fixed level irrespective of volume in original file
    peak_normalized_audio = pyln.normalize.loudness(data, loudness, 0)
    loudness = meter.integrated_loudness(np.transpose(peak_normalized_audio)) 
    print(f'After peak normalization: {loudness} dB')
    op_tensor = torch.from_numpy(peak_normalized_audio)
    return op_tensor

def predict_from_speech(file):
    # model = Wav2Vec2ForCTC.from_pretrained("D:\\final_year_project\\major_project_fe_react\\fastApi\\nepalimodel\\model_0.1_dropout_5_10sec").to(device)
    # processor = Wav2Vec2Processor.from_pretrained("D:\\final_year_project\\major_project_fe_react\\fastApi\\nepalimodel\\processor_0.1_dropout_5_10sec")
    
    speech_array, sampling_rate = torchaudio.load(file)
    
    # print(speech_array,sampling_rate)
    # print(speech_array.shape)
    
    resampler = torchaudio.transforms.Resample(sampling_rate, 16000)
    
    resampled_array = resampler(speech_array).squeeze()
    print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    # print(resampled_array,resampled_array.shape)
    if len(resampled_array.shape) == 1:
        resampled_array = resampled_array.reshape([1,resampled_array.shape[0]])
    print(resampled_array.shape[1])
    if resampled_array.shape[1] >= 200000:
        print('The input file is longer than 10 seconds')
        list_of_segments = segmentLargeArray(resampled_array)
        # print(list_of_segments)
        output = ''
        for segment in list_of_segments:
            logits = model(segment.to(device)).logits
            pred_ids = torch.argmax(logits,dim=-1)[0]
            output += processor.decode(pred_ids)
        # print(f"Prediction:\n{output}")
        return output
    else:
        print('The input file is less than 10 seconds')
        logits = model(resampled_array.to(device)).logits
        # print(logits)
        pred_ids = torch.argmax(logits, dim = -1)[0]
        # print("Prediction:")
        return(processor.decode(pred_ids))
        
        
        
if __name__ == "__main__":
    predict_from_speech("testy.flac")        