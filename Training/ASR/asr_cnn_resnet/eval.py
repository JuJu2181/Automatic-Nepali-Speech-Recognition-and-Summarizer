from model.configs import UNQ_CHARS
from model.utils import ctc_softmax_output_from_wavs, load_model, load_wav, predict_from_wavs, calculateWER, calculateErrorRates, calculateErrorRatesAlt
import os

import sys
import pandas as pd
# For adjusting volume 
import soundfile as sf 
import pyloudnorm as pyln 
import numpy as np


def adjust_volume(data,sr=16000,norm="peak"):
    # Peak normalization of all audio to -1dB
    meter = pyln.Meter(sr) #create BS.1770 Meter
    # print(data)
    # print(np.transpose(data).shape)
    loudness = meter.integrated_loudness(np.transpose(data)) 
    # print(f'Before: {loudness} dB')
    if norm == "peak":
        # This is peak normalization which depends on the original volume of audio file
        peak_normalized_audio = pyln.normalize.peak(data,-1.0)
    elif norm=="fixed":
        # Actually this is loudness normalization to a fixed level irrespective of volume in original file
        peak_normalized_audio = pyln.normalize.loudness(data, loudness, 0)
    else:
        peak_normalized_audio = data
    loudness = meter.integrated_loudness(np.transpose(peak_normalized_audio)) 
    # print(f'After peak normalization: {loudness} dB')
    return peak_normalized_audio


def get_transcript(model, speech_file):
    input_wav = load_wav(speech_file)
    # print(type(input_wav))
    normalized_wav = adjust_volume(input_wav,16000,norm="fixed")
    # print(type(normalized_wav))
    """Gives the array of predicted sentences"""
    print("Predicting sentences.....")
    sentences, char_indices = predict_from_wavs(model, [normalized_wav], UNQ_CHARS)
    print(sentences, "\n")
    """Gives softmax output of the ctc model"""
    # softmax = ctc_softmax_output_from_wavs(model, [input_wav])
    # print(softmax)
    return sentences[0]

def evaluate(model=None,eval_folder_path=r"D:\Programming\Projects\major_project\Codes\Training\ASR\eval_data"):
    #listing the audio and transcripts from the eval folder path
    wavs = []
    transcripts = []
    predicted_labels = []
    actual_labels = []
    cers = []
    cers_alt = []
    wers = []
    wers_alt = []
    for filepath in os.listdir(eval_folder_path):
        basename = os.path.basename(filepath)
        filename, ext = os.path.splitext(basename)
        if ext == ".wav":
            wavs.append(load_wav(eval_folder_path + "\\" + basename))
        elif ext == ".txt":
            with open(eval_folder_path + "\\" + basename, encoding="utf8") as f:
                transcripts.append(f.read())
    normalized_wavs = [adjust_volume(wav,norm="fixed") for wav in wavs]
    predicted_sentences, char_indices = predict_from_wavs(model,normalized_wavs,UNQ_CHARS)
    for pred,actual in zip(predicted_sentences,transcripts):
        # print(f"Prediction: {pred}")
        # print(f"Actual: {actual}")
        predicted_labels.append(pred)
        actual_labels.append(actual)
        cer, wer = calculateErrorRates(actual,pred)
        cer_alt, wer_alt = calculateErrorRatesAlt(actual,pred)
        cers.append(cer)
        cers_alt.append(cer_alt)
        wers.append(wer)
        wers_alt.append(wer_alt)
    
    result = {
        "Actual": actual_labels,
        "Prediction": predicted_labels,
        "CER": cers,
        "CER alt": cers_alt,
        "WER": wers,
        "WER alt": wers_alt
    }
    return result
    

if __name__ == "__main__":
    # Loads the trained model
    # print("Evaluation Started \u2705 \u2705 \u2705 \u2705\n")
    # print("Loading model.....")
    # models_dir=r"D:\from_vm\trained_models_new_final"
    # model_names = os.listdir(models_dir)
    # results = []
    # for model_name in model_names:
    #     print(f"For model: {model_name}")
    #     model = load_model(models_dir+"\\"+model_name)
    #     print("Model loaded \u2705 \u2705 \u2705 \u2705\n")
    #     result = evaluate(model=model)
    #     # print(result)
    #     # res_df = pd.DataFrame(result)
    #     # print(res_df)
    #     print("Model evaluated \u2705 \u2705 \u2705 \u2705\n")
    #     results.append(result)
    # result = {
    #     'Model': model_names,
    #     'Result': results
    # }
    # # print(result)
    # df_res = pd.DataFrame({
    #     'Model': result['Model'],
    #     'Actual': [x['Actual'] for x in result['Result']],
    #     'Prediction': [x['Prediction'] for x in result['Result']],
    #     'CER': [x['CER'] for x in result['Result']],
    #     'WER': [x['WER'] for x in result['Result']]
    # })
    # df_res = df_res.explode(['Actual','Prediction','CER','WER']).reset_index(drop=True)
    # print(df_res)
    # df_res.to_csv("result_eval_new_final_fixed_loudness.csv",index=False)

    # model = load_model(
    #     r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_cnn_resnet\trained_models\model_95.h5")
    # print("Evaluation done")
    # sys.exit(1)
    speech_input = input("Enter the path to speech file: ")
    print("Now Predicting ...")
    print('=> Input received')
    basename = os.path.basename(speech_input)
    filename,ext = os.path.splitext(basename)
    op_file_path = f'D:\Programming\Projects\major_project\Codes\Training\ASR\\asr_cnn_resnet\cnn_predictions\\{filename}.txt'       
    model = load_model(r"D:\from_vm\trained_models_new_final\model_175.h5")
    output = get_transcript(model, speech_input)
    with open(op_file_path,'w+',encoding='utf-8') as f:
        f.write(output)
    print("=> Output has been written to a file")
