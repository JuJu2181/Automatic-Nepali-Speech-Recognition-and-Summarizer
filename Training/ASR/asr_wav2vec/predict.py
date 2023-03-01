import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
# from model.config import *
# For adjusting volume 
import soundfile as sf 
import pyloudnorm as pyln 
import numpy as np
import os 
from datasets import load_metric
import pandas as pd 

# To ignore cuda warnings of no gpu
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
DEVICE = "cpu"

wer_metric = load_metric("wer")
cer_metric = load_metric("cer",revision="master")

def calculateErrorRatesAlt(actual_label,predicted_label):
    # Calculate CER and WER for given arguments 
    cer = cer_metric.compute(predictions=[predicted_label],references=[actual_label])
    wer = wer_metric.compute(predictions=[predicted_label],references=[actual_label])
    return cer,wer

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
    # print(f'Before: {loudness} dB')
    # This is peak normalization which depends on the original volume of audio file
    peak_normalized_audio = pyln.normalize.peak(data,-1.0)
    # Actually this is loudness normalization to a fixed level irrespective of volume in original file
    # peak_normalized_audio = pyln.normalize.loudness(data, loudness, 0)
    loudness = meter.integrated_loudness(np.transpose(peak_normalized_audio)) 
    # print(f'After peak normalization: {loudness} dB')
    op_tensor = torch.from_numpy(peak_normalized_audio)
    return op_tensor

def predict_from_speech(ip_file,model,processor):
    # print("=> Loading the audio input to the model")
    speech_array, sampling_rate = torchaudio.load(ip_file)
    # print(speech_array,sampling_rate)
    # print('=> Adjusting volume of audio input')
    speech_array = adjust_volume(speech_array,sampling_rate)
    resampler = torchaudio.transforms.Resample(sampling_rate, 16000)
    resampled_array = resampler(speech_array).squeeze()
    if len(resampled_array.shape) == 1:
        resampled_array = resampled_array.reshape([1,resampled_array.shape[0]])
    # print(resampled_array.shape[1])
    if resampled_array.shape[1] >= 200000:
        # print('The input file is longer than 10 seconds')
        # print('Now Predicting ...')
        list_of_segments = segmentLargeArray(resampled_array,chunksize=50000)
        # print(list_of_segments)
        output = ''
        for segment in list_of_segments:
            logits = model(segment.to(DEVICE)).logits
            pred_ids = torch.argmax(logits,dim=-1)[0]
            output += processor.decode(pred_ids)
        # print(f"Prediction:\n{output}")
    else:
        # print('The input file is less than 10 seconds')
        # print('Now Predicting ...')
        logits = model(resampled_array.to(DEVICE)).logits
        # print(logits)
        pred_ids = torch.argmax(logits, dim = -1)[0]
        output = processor.decode(pred_ids)
        # print(f"Prediction:\n{output}")
    return output
        
def evaluate_models(model_dir=r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\models", processor_dir=r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\processors",eval_folder_path=r"D:\Programming\Projects\major_project\Codes\Training\ASR\eval_data"):
    wavs = []
    transcripts = []
    print("Getting the input files for evaluation")
    for filepath in os.listdir(eval_folder_path):
        basename = os.path.basename(filepath)
        filename, ext = os.path.splitext(basename)
        if ext == ".wav":
            wavs.append(eval_folder_path + "\\" + basename)
        elif ext == ".txt":
            with open(eval_folder_path + "\\" + basename, encoding="utf8") as f:
                transcripts.append(f.read())
    print("Loading the models and processors for evaluation")
    models = os.listdir(model_dir)
    processors = os.listdir(processor_dir)
    result = {}
    for model_name, processor_name in zip(models,processors):
        predicted_labels = []
        cers = []
        wers = []
        print(f"For Model: {model_name}")
        model_path = model_dir + "\\"+model_name 
        processor_path = processor_dir +"\\"+processor_name 
        model = Wav2Vec2ForCTC.from_pretrained(model_path).to(DEVICE)
        processor = Wav2Vec2Processor.from_pretrained(processor_path)
        for wav,actual_label in zip(wavs,transcripts):
            predicted_label = predict_from_speech(wav,model,processor)
            predicted_labels.append(predicted_label)
            cer,wer = calculateErrorRatesAlt(predicted_label=predicted_label,actual_label=actual_label)
            cers.append(cer)
            wers.append(wer)
        result[model_name] = {
            'Model Name': model_name,
            'Actual Labels': transcripts,
            'Predicted Labels': predicted_labels,
            'CERs': cers,
            'WERs': wers,
            'Average CER': sum(cers)/len(cers),
            'Average WER': sum(wers)/len(wers)
        }
        
    # print(result)
    df_res = pd.DataFrame.from_dict(result,orient='index')
    df_res = df_res.explode(['Actual Labels','Predicted Labels','CERs','WERs']).reset_index(drop=True)
    df_res.to_csv("wav2vec_eva1.csv",index=False)
    print("Done")
            



if __name__ == "__main__":
    # evaluate_models()

    # can be changed to relative paths
    # model_path = r'D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\models\model-lt-4sec-first-5000' 
    # processor_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\processors\processor_0.1_dropout_lt_4sec_first_5000"
    print("=> Loading the trained model and processor")
    model_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\models\trained_model_91"
    processor_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\processors\processor_91"
    model = Wav2Vec2ForCTC.from_pretrained(model_path).to(DEVICE)
    processor = Wav2Vec2Processor.from_pretrained(processor_path)
    # ip_file_path = input('Enter the file to test: ')
    ip_file_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\eval_data\eval7.wav"
    print('=> Input received')
    basename = os.path.basename(ip_file_path)
    filename,ext = os.path.splitext(basename)
    op_file_path = f'D:\Programming\Projects\major_project\Codes\Training\ASR\\asr_wav2vec\wav2vec_predictions\\{filename}.txt'
    output = predict_from_speech(ip_file_path,model,processor)        
    with open(op_file_path,'w+',encoding='utf-8') as f:
        f.write(output)
    print("=> Output has been written to a file")