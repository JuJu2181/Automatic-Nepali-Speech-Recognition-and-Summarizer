from ownmodel.configs import UNQ_CHARS
from ownmodel.utils import ctc_softmax_output_from_wavs, load_model, load_wav, predict_from_wavs
import os
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


def get_transcript(speech_file):
    model =load_model("./ownmodel/model/best_cnn_model.h5")
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
