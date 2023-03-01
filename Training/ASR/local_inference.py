"""
Script for local inference of Automatic Speech Recognition
"""
#* imports 
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import sys
import numpy as np 
import pandas as pd
# For adjusting volume 
import soundfile as sf 
import pyloudnorm as pyln 
# For wav2vec 
import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from datasets import load_metric
# imports from files
from asr_cnn_resnet.model.configs import UNQ_CHARS
from asr_cnn_resnet.model.utils import ctc_softmax_output_from_wavs, load_model, load_wav, predict_from_wavs, calculateWER, calculateErrorRates, calculateErrorRatesAlt, segmentLargeArray, adjust_volume

# To ignore CUDA warnings of GPU 
DEVICE = "cpu"

def speech_recognition_using_wav2vec(ip_file,model,processor):
    # print("=> Loading the audio input to the model")
    speech_array, sampling_rate = torchaudio.load(ip_file)
    print(sampling_rate)
    print('=> Adjusting volume of audio input')
    # convert to numpy array before volume normalization
    speech_array = speech_array.numpy()
    speech_array = adjust_volume(speech_array,sampling_rate,norm="fixed")
    # convert back to torch tensor after volume normalization
    speech_array = torch.from_numpy(speech_array)
    resampler = torchaudio.transforms.Resample(sampling_rate, 16000)
    resampled_array = resampler(speech_array).squeeze()
    if len(resampled_array.shape) == 1:
        resampled_array = resampled_array.reshape([1,resampled_array.shape[0]])
    print(resampled_array.shape[1])
    if resampled_array.shape[1] >= 200000:
        # print('The input file is longer than 10 seconds')
        # print('Now Predicting ...')
        list_of_segments = segmentLargeArray(resampled_array,chunksize=50000)
        # print(list_of_segments)
        output1 = ''
        output2 = ''
        for segment in list_of_segments:
            logits = model(segment.to(DEVICE)).logits
            pred_ids = torch.argmax(logits,dim=-1)
            output1 = output1 + " " + processor.decode(pred_ids[0])
            output2 = output2 + " " + processor.decode(pred_ids[1])
        # print(f"Prediction:\n{output}")
        outputs = [output1,output2]
    else:
        # print('The input file is less than 10 seconds')
        # print('Now Predicting ...')
        logits = model(resampled_array.to(DEVICE)).logits
        print("Logits:")
        print(logits[0][0])
        # Apply softmax to logits
        output_probs = torch.nn.functional.softmax(logits, dim=-1)
        print("Probabilities:")
        print(output_probs[0][0])
        # print(processor.decode(output_probs[0][0]))
        # exit()
        pred_ids = torch.argmax(output_probs, dim = -1)
        print("Predicted Ids:")
        # print(pred_ids)
        outputs = [processor.decode(pred_id) for pred_id in pred_ids]
        # print(f"Prediction:\n{output}")
    return outputs


def speech_recognition_using_cnn_resnet(model, speech_file):
    input_wav = load_wav(speech_file)
    # print(type(input_wav))
    normalized_wav = adjust_volume(input_wav,16000,norm="peak")
    # print(type(normalized_wav))
    """Gives the array of predicted sentences"""
    # print("Predicting sentences.....")
    sentences, char_indices = predict_from_wavs(model, [normalized_wav], UNQ_CHARS)
    # print(sentences, "\n")
    """Gives softmax output of the ctc model"""
    # softmax = ctc_softmax_output_from_wavs(model, [input_wav])
    # print(softmax)
    return sentences[0]

def save_output(output,ip_file_path,is_append):
    basename = os.path.basename(ip_file_path)
    filename,ext = os.path.splitext(basename)
    op_file_path = f'D:\Programming\Projects\major_project\Codes\Training\ASR\\new_predictions\\{filename}.txt'     
    if is_append == True:
        file_mode = 'a'
    else:
        file_mode = 'w+'
    with open(op_file_path,file_mode,encoding='utf-8') as f:
        f.write("\n-------------------\n")
        f.write(output)
    print("=> Output has been written to a file")



def infer(algorithm="wav2vec"):
    ip_file_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\eval_data\eval2.wav"
    if algorithm == "wav2vec":
        print(f"Using Wav2Vec2 Model")
        model_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\models\trained_model_91"
        processor_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_wav2vec\wav2vec_trained_models\nepali-wav2vec-v2\processors\processor_91"
        model = Wav2Vec2ForCTC.from_pretrained(model_path)
        processor = Wav2Vec2Processor.from_pretrained(processor_path)
        output = speech_recognition_using_wav2vec(ip_file_path,model,processor)
        print(output)
        # save_output(output,ip_file_path,True)
    elif algorithm == "cnn_resnet":
        print(f"Using CNN ResNet Model")
        model_path = r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_cnn_resnet\trained_models_new_final\model_50.h5"
        model = load_model(model_path)
        output = speech_recognition_using_cnn_resnet(model,ip_file_path)
        print(output)
        save_output(output,ip_file_path,True)


if __name__ == "__main__":
    infer("wav2vec")