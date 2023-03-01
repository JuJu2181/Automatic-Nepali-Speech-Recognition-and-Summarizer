'''
Important Notes:
    1. The dimension of wav files is in the format of  -> batch * sequence * frame_size.

'''


from tensorflow.keras import models
import tensorflow.keras.backend as K
import tensorflow as tf
import librosa
import numpy as np
import pickle
import matplotlib.pyplot as plt
import time
import edit_distance as ed
from datasets import load_metric

# For adjusting volume 
import soundfile as sf 
import pyloudnorm as pyln 

# Global configs required for training
from .configs import INPUT_DIM, SR, N_MFCC, HOP_LENGTH, FRAME_SIZE

# device_name = '/device:CPU:0'

# Loads model from the directory argument
def load_model(model_dir):
    return models.load_model(model_dir)


# Loading wav file from librosa
def load_wav(dir):
    return librosa.load(dir, sr=SR)[0]


# Generates Normalized MFCCs from audio
def gen_mfcc(arr):
    mfccs = librosa.feature.mfcc(
        y=arr[:-1], sr=SR, n_mfcc=N_MFCC, hop_length=HOP_LENGTH).transpose().flatten()
    return (mfccs - np.mean(mfccs)) / np.std(mfccs)


# Generates padded text from list of texts
def pad_text(list_texts, unq_chars, unk_idx=1):
    max_len = max([len(txt) for txt in list_texts])
    padded_arr = []
    seq_lengths = []

    for txt in list_texts:
        len_seq = len(txt)
        txt += "0" * (max_len - len_seq)

        # index 1 for the unknown chars
        arr = np.array(
            [unq_chars.index(ch) if ch in unq_chars else unk_idx for ch in txt])

        padded_arr.append(arr)
        seq_lengths.append(len_seq)

    return np.array(padded_arr), np.array(seq_lengths)


# Returns tensor batch*seq*frame
def pad_list_np(list_np):
    max_len = max([len(arr) for arr in list_np])

    # So that the numpy array can be reshaped according to the input dimension
    max_len += INPUT_DIM - (max_len % INPUT_DIM)

    padded_arr = []

    for arr in list_np:
        len_seq = len(arr)
        arr = np.pad(arr, (0, max_len - len_seq), constant_values=0)
        padded_arr.append(arr)

    return np.array(padded_arr).reshape((len(list_np), -1, INPUT_DIM))

# Generates batches of wavs and texts  with padding as per needed
def batchify(wavs, texts, unq_chars):
    assert len(wavs) == len(texts)
    # generates tensor of dim (batch * seq * frame)
    input_tensor = pad_list_np(wavs)
    target_tensor, target_lengths_tensor = pad_text(texts, unq_chars)
    output_seq_lengths_tensor = np.full(
        (len(wavs),), fill_value=input_tensor.shape[1])

    return input_tensor, target_tensor, target_lengths_tensor.reshape((-1, 1)), output_seq_lengths_tensor.reshape((-1, 1))

# Decoding with prefix beam search from MFCC features only
def predict_from_mfccs(model, mfccs, unq_chars):

    mfccs = pad_list_np(mfccs)  # coverts the data to 3d
    pred = model(mfccs, training=False)

    input_len = np.ones(pred.shape[0]) * pred.shape[1]
    # Use greedy search. For complex tasks, you can use beam search
    results = K.ctc_decode(pred, input_length=input_len,
                           greedy=False, beam_width=100)[0][0]

    sentences = []
    char_indices = []
    for chars_indices in results:

        sent = ""
        temp_indices = []
        for idx in chars_indices:

            if idx > 1:
                sent += unq_chars[idx]
                temp_indices.append(idx.numpy())
        sentences.append(sent)
        char_indices.append(temp_indices)
    return sentences, char_indices


# Decoding with prefix beam search from wavs only
def predict_from_wavs(model, wavs, unq_chars):
    mfccs = [gen_mfcc(wav) for wav in wavs]
    return predict_from_mfccs(model, mfccs, unq_chars)


# Converts the text to list of indices as per the unique characters list
def indices_from_texts(texts_list, unq_chars, unk_idx=1):

    indices_list = []
    for txt in texts_list:

        # index 1 for the unknown chars
        lst = [unq_chars.index(
            ch) if ch in unq_chars else unk_idx for ch in txt]

        indices_list.append(lst)

    return indices_list


'''
Calculates CER( character error rate) from dataset;
'''
# CER from mfccs
def CER_from_mfccs(model, mfccs, texts, unq_chars, batch_size=100):

    with tf.device(device_name):

        len_mfccs = len(mfccs)
        batch_count = 0
        sum_cer = 0

        start_time = time.time()
        for start in range(0, len_mfccs, batch_size):
            end = None
            if start + batch_size < len_mfccs:
                end = start + batch_size
            else:
                end = len_mfccs
            pred_sentences, pred_indices = predict_from_mfccs(
                model, mfccs[start:end], unq_chars)
            actual_indices = indices_from_texts(texts[start:end], unq_chars)

            len_batch_texts = end - start
            batch_cer = 0
            for i in range(len_batch_texts):

                pred = pred_indices[i]
                actu = actual_indices[i]

                sm = ed.SequenceMatcher(pred, actu)
                ed_dist = sm.distance()
                batch_cer += ed_dist / len(actu)

            batch_cer /= len_batch_texts
            batch_count += 1
            sum_cer += batch_cer

            print("CER -> {:.2f}%, \t No.of sentences -> {}, \t Time Taken -> {:.2f} secs.".format(
                (sum_cer / batch_count) * 100, end, time.time() - start_time))

        print(
            "The total time taken for all sentences CER calculation is  {:.2f} secs.".format(time.time() - start_time))
        return sum_cer / batch_count

# CER from wavs
def CER_from_wavs(model, wavs, texts, unq_chars, batch_size=100):

    assert len(wavs) == len(texts)

    len_wavs = len(wavs)
    for i in range(len_wavs):
        wavs[i] = gen_mfcc(wavs[i])

    return CER_from_mfccs(model, wavs, texts, unq_chars, batch_size)


# CTC softmax probabilities output from mfcc features
def ctc_softmax_output_from_mfccs(model, mfccs):
    mfccs = pad_list_np(mfccs)
    y = model(mfccs)
    return y


# CTC softmax probabilities output from wavs
def ctc_softmax_output_from_wavs(model, wavs):
    mfccs = [gen_mfcc(wav) for wav in wavs]
    return ctc_softmax_output_from_mfccs(model, mfccs)


# Clean the single audio file by clipping silent gaps from both ends
def clean_single_wav(wav, win_size=500):
    wav_avg = np.average(np.absolute(wav))

    for s in range(0, len(wav)-win_size, win_size):
        window = wav[s:s+win_size]
        if np.average(np.absolute(window)) > wav_avg:
            wav = wav[s:]
            break

    for s in range(len(wav)-win_size, 0, -win_size):
        window = wav[s-win_size:s]
        if np.average(np.absolute(window)) > wav_avg:
            wav = wav[:s]
            break

    pad = FRAME_SIZE - len(wav) % FRAME_SIZE
    wav = np.pad(wav, (0, pad), mode="mean")
    return wav

# Calculating error rates
# To load the evaluation metrics 
wer_metric = load_metric("wer")
cer_metric = load_metric("cer",revision="master")

def calculateWER(actual_label, predicted_label):
    # convert string to list
    actual_words = actual_label.split()
    predicted_words = predicted_label.split()
    # costs will hold the costs like in Levenshtein distance algorithm
    costs = [[0 for inner in range(len(predicted_words)+1)] for outer in range(len(actual_words)+1)]
    # backtrace will hold the operations we've done.
    # so we could later backtrace, like the WER algorithm requires us to.
    backtrace = [[0 for inner in range(len(predicted_words)+1)] for outer in range(len(actual_words)+1)]
    # ok means no change, sub means substitution, ins means insertion and del means deletion
    operations = {
        'ok': 0,
        'sub': 1,
        'ins': 2,
        'del': 3
    }
    # penalties for insertion, substitution and deletion
    penalties = {
        'ins': 1,
        'sub': 1,
        'del': 1
    }
    # First column represents the case where we achieve zero predicted labels i-e all the actual labels were deleted 
    for i in range(1,len(actual_words)+1):
        costs[i][0] = penalties['del']*i 
        backtrace[i][0] = operations['del']
    
    # First row represents the case where we achieve the predicted label by inserting all the predicted labels into a zero length actual label i-e all unwanted insertions 
    for j in range(1,len(predicted_words)+1):
        costs[0][j] = penalties['ins']*j 
        backtrace[0][j] = operations['ins']
    
    # computation
    for i in  range(1,len(actual_words)+1):
        for j in range(1,len(predicted_words)+1):
            # no change in predictions and actual label
            if actual_words[i-1] == predicted_words[j-1]:
                costs[i][j] = costs[i-1][j-1]
                backtrace[i][j] = operations['ok']
            else:
                # change has occured
                sub_cost = costs[i-1][j-1] + penalties['sub']
                ins_cost = costs[i][j-1] + penalties['ins']
                del_cost = costs[i-1][j] + penalties['del']
                costs[i][j] = min(sub_cost,ins_cost,del_cost)
                if costs[i][j] == sub_cost:
                    backtrace[i][j] = operations['sub']
                elif costs[i][j] == ins_cost:
                    backtrace[i][j] = operations['ins']
                else: 
                    backtrace[i][j] = operations['del']
    
    # backtrace through the best route
    i = len(actual_words)
    j = len(predicted_words)
    sub_count = 0 
    del_count = 0 
    ins_count = 0 
    correct_count = 0 

    while i > 0 or j > 0:
        if backtrace[i][j] == operations['ok']:
            correct_count += 1
            i -= 1
            j -= 1
        elif backtrace[i][j] == operations['sub']:
            sub_count += 1 
            i -= 1
            j -= 1
        elif backtrace[i][j] == operations['ins']:
            ins_count += 1
            j -= 1
        elif backtrace[i][j] == operations['del']:
            del_count += 1
            i -= 1
    
    """ 
    WER formula: 
    WER = S + D + I / N = S + D I / S + D + C
    """
    wer = round((sub_count + del_count + ins_count)/(sub_count + del_count + correct_count),3)
    # wer = round((sub_count + ins_count + del_count)/(float)(len(actual_words)),3)
    return wer 

# Function to calculate the WER and CER 
def calculateErrorRates(actual_label,predicted_label):
    # For CER
    sm = ed.SequenceMatcher(predicted_label,actual_label)
    ed_dist = sm.distance() 
    cer = ed_dist/len(actual_label)
    # For WER 
    wer = calculateWER(actual_label,predicted_label)
    return cer,wer

# Using imported functions
def calculateErrorRatesAlt(actual_label,predicted_label):
    # Calculate CER and WER for given arguments 
    cer = cer_metric.compute(predictions=[predicted_label],references=[actual_label])
    wer = wer_metric.compute(predictions=[predicted_label],references=[actual_label])
    return cer,wer

# Function to normalize volume 
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

def segmentLargeArray(inputTensor,chunksize=200000):
    # print(inputTensor)
    list_of_segments = []
    tensor_length = inputTensor.shape[1]
    for i in range(0,tensor_length+1,chunksize):
        list_of_segments.append(inputTensor[:,i:i+chunksize])
    return list_of_segments 

def adjust_volume(data,sr=16000,norm="peak"):
    # Peak normalization of all audio to -1dB
    meter = pyln.Meter(sr) #create BS.1770 Meter
    # print(data)
    # print(np.transpose(data).shape)
    loudness = meter.integrated_loudness(np.transpose(data)) 
    print(f'Before: {loudness} dB')
    if norm == "peak":
        # This is peak normalization which depends on the original volume of audio file
        peak_normalized_audio = pyln.normalize.peak(data,-1.0)
    elif norm=="fixed":
        # Actually this is loudness normalization to a fixed level irrespective of volume in original file
        peak_normalized_audio = pyln.normalize.loudness(data, loudness, -1)
    else:
        peak_normalized_audio = data
    loudness = meter.integrated_loudness(np.transpose(peak_normalized_audio)) 
    print(f'After peak normalization: {loudness} dB')
    return peak_normalized_audio