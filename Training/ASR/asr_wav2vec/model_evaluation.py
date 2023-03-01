import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from model.config import *
# For adjusting volume 
import soundfile as sf 
import pyloudnorm as pyln 
import numpy as np
import os 
import pandas as pd 
# To ignore cuda warnings of no gpu
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from datasets import load_metric

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
    # This is peak normalization which depends on the original volume of audio file
    # peak_normalized_audio = pyln.normalize.peak(data,-1.0)
    # Actually this is loudness normalization to a fixed level irrespective of volume in original file
    peak_normalized_audio = pyln.normalize.loudness(data, loudness, 0)
    loudness = meter.integrated_loudness(np.transpose(peak_normalized_audio)) 
    print(f'After peak normalization: {loudness} dB')
    op_tensor = torch.from_numpy(peak_normalized_audio)
    return op_tensor


def predict_from_speech(ip_file,model,processor):
    print("=> Loading the audio input to the model")
    speech_array, sampling_rate = torchaudio.load(ip_file)
    # print(speech_array,sampling_rate)
    print('=> Adjusting volume of audio input')
    speech_array = adjust_volume(speech_array,sampling_rate)
    resampler = torchaudio.transforms.Resample(sampling_rate, 16000)
    resampled_array = resampler(speech_array).squeeze()
    if len(resampled_array.shape) == 1:
        resampled_array = resampled_array.reshape([1,resampled_array.shape[0]])
    # print(resampled_array.shape[1])
    if resampled_array.shape[1] >= 200000:
        print('The input file is longer than 10 seconds')
        print('Now Predicting ...')
        list_of_segments = segmentLargeArray(resampled_array,chunksize=50000)
        # print(list_of_segments)
        output = ''
        for segment in list_of_segments:
            logits = model(segment.to(DEVICE)).logits
            pred_ids = torch.argmax(logits,dim=-1)[0]
            output += processor.decode(pred_ids)
        print(f"Prediction:\n{output}")
    else:
        print('The input file is less than 10 seconds')
        print('Now Predicting ...')
        logits = model(resampled_array.to(DEVICE)).logits
        # print(logits)
        pred_ids = torch.argmax(logits, dim = -1)[0]
        output = processor.decode(pred_ids)
        print(f"Prediction:\n{output}")
    return output

def load_evaluation_metrics():
    wer_metric = load_metric("wer")
    cer_metric = load_metric("cer",revision="master")
    return wer_metric,cer_metric

def evaluate_metrics(model,processor,test_df):
    print(f"=> Loading Metrics")
    wer_metric, cer_metric = load_evaluation_metrics()
    test_files_count = test_df.shape[0]
    print(f"There are total {test_files_count} files")
    total_wer = 0 
    total_cer = 0
    wers = []
    cers = [] 
    accuracies = []
    total_accuracy = 0
    test_df['predicted_label'] = ''
    # looping in all the audio and labels 
    for i in range(0,test_files_count):
        predicted_label = predict_from_speech(ip_file=test_df['path'][i],model=model,processor=processor)
        test_df['predicted_label'][i] = predicted_label
        actual_label = test_df['labels'][i]
        assert len(predicted_label) == len(actual_label)
        # calculating the metrics 
        wer = wer_metric.compute(predictions=predicted_label, references=actual_label)
        cer = cer_metric.compute(predictions=predicted_label,references=actual_label)
        accuracy = 1 - cer 
        wers.append(wer)
        cers.append(cer)
        accuracies.append(accuracy)
        total_wer += wer 
        total_cer += cer 
        total_accuracy += accuracy 
    
    # just some verifications here
    assert total_wer == sum(wers)
    assert total_cer == sum(cers)
    assert total_accuracy == sum(accuracies)

    average_wer = total_wer / test_files_count
    average_cer = total_cer / test_files_count 
    average_accuracy = total_accuracy / test_files_count

    return average_wer, average_cer, average_accuracy, test_df 


if __name__ == "__main__":
    # can be changed to relative paths
    model_path = 'D:\Programming\Projects\major_project\Codes\ASR\wav2vec_trained_models\\nepali-wav2vec-v2\models\model-lt-4sec-first-5000' 
    processor_path = 'D:\Programming\Projects\major_project\Codes\ASR\wav2vec_trained_models\\nepali-wav2vec-v2\processors\processor_0.1_dropout_lt_4sec_first_5000'
    print("=> Loading the trained model and processor")
    model = Wav2Vec2ForCTC.from_pretrained(model_path).to(DEVICE)
    processor = Wav2Vec2Processor.from_pretrained(processor_path)
    
    # ** For single file 
    # ip_file_path = input('Enter the file to test: ')
    # print('=> Input received')
    # basename = os.path.basename(ip_file_path)
    # filename,ext = os.path.splitext(basename)
    # op_file_path = f'D:\Programming\Projects\major_project\Codes\ASR\wav2vec_predictions\\{filename}.txt'
    # output = predict_from_speech(ip_file_path,model,processor)        
    # with open(op_file_path,'w+',encoding='utf-8') as f:
    #     f.write(output)
    # print("=> Output has been written to a file")
    
    # ** For testing in an entire test dataset
    test_dataset_path = 'D:\Programming\Projects\major_project\Codes\Training\ASR\eval_data\dataset_duration_gt_10sec.csv'
    # Audio paths for audio directory
    audio_path = 'D:\Programming\Projects\major_project\Codes\ASR\data\\audio\\' 
    test_df =  pd.read_csv(test_dataset_path,usecols=["path","labels"])
    test_df["path"] = audio_path + test_df["path"] + ".flac"
    print(f'Before:\n{test_df.head()}')
    average_wer, average_cer, average_accuracy, test_df = evaluate_metrics(model,processor,test_df[:5])
    print(f"Average Test WER: {average_wer}")
    print(f"Average Test CER: {average_cer}")
    print(f"Average Accuracy: {average_accuracy}")
    print(f"After:\n{test_df.head()}")