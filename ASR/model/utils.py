'''
This file will contain all the utilities functions required by other files
'''

# * imports
import librosa
import librosa.display
import soundfile as sf
import numpy as np
import pickle
import matplotlib.pyplot as plt
import time
import edit_distance as ed
import wave
# Pytorch imports
import torch
from torch import nn
# imports from other files
from .config import INPUT_DIMENSION, SAMPLING_RATE, MFCC_COUNT, HOP_LENGTH, FRAME_SIZE, DEVICE


# * functions
# 1. To load the wav files
def load_wav(path):
    return librosa.load(path, sr=SAMPLING_RATE)[0]

# 2. To extract mfcc from loaded audio


def generate_mfcc(audio_arr):
    mfccs = librosa.feature.mfcc(
        y=audio_arr[:-1], sr=SAMPLING_RATE, n_mfcc=MFCC_COUNT, hop_length=HOP_LENGTH).transpose().flatten()
    # performing z normalization in the mfccs before returning
    return (mfccs - np.mean(mfccs))/np.std(mfccs)

# 3. To save a trained model


def save_model(model, path):
    torch.save(model, path)
    print('Model saved successfully')

# 4. To load a saved model


def load_model(path):
    model = torch.load(path)
    return model

# 5. To clean a single audio file by clipping silent gaps from both ends


def clean_single_audio_file(audiofile, win_size=500):
    audio_avg = np.average(np.absolute(audiofile))

    # clip silent gaps from left end
    for s in range(0, len(audiofile)-win_size, win_size):
        window = audiofile[s:s+win_size]
        window_avg = np.average(np.absolute(window))
        if window_avg > audio_avg:
            # print('Clipping left end')
            audiofile = audiofile[s:]
            break

    # clip silent gaps from right end
    for s in range(len(audiofile)-win_size, 0, -win_size):
        window = audiofile[s-win_size:s]
        window_avg = np.average(np.absolute(window))
        if window_avg > audio_avg:
            # print('Clipping right end')
            audiofile = audiofile[:s]
            break

    padding = FRAME_SIZE - len(audiofile) % FRAME_SIZE
    audiofile = np.pad(audiofile, (0, padding), mode="mean")
    return audiofile

# 6. To plot a audio wave
def plot_wave(wav):
    plt.figure() 
    librosa.display.waveshow(wav, sr=16000, x_axis='s')
    plt.show()

# 7. To plot a spectrogram 
def plot_spectrogram(wav):
    n_fft = 512 
    hop_length=320
    window_type ='hann'
    mel_bins = 64
    Mel_spectrogram = librosa.feature.melspectrogram(y=wav, sr=SAMPLING_RATE, n_fft=n_fft, hop_length=hop_length, win_length=n_fft, window=window_type, n_mels = mel_bins, power=2.0)
    mel_spectrogram_db = librosa.power_to_db(Mel_spectrogram, ref=np.max)
    librosa.display.specshow(mel_spectrogram_db, sr=SAMPLING_RATE, x_axis='time', y_axis='mel',hop_length=hop_length)
    plt.colorbar(format='%+2.0f dB')
    plt.title('Log Mel spectrogram')
    plt.tight_layout()
    plt.show()

# 8. To display Fourier transform representation of the signal
def plot_fourier_transform(wav):
    n_fft = 512 
    # stft => short time fourier transform
    D = np.abs(librosa.stft(wav[:n_fft], n_fft=n_fft, hop_length=n_fft+1))
    plt.plot(D)

# 9. To generate padded text from list of texts 
def pad_text(text_list, unq_chars, unk_idx=1):
    '''
    unq_chars = set of unique characters
    unk_idx = unknown index 
    '''
    # get the length of the longest text in the list of texts to pad all other texts to that length
    max_len = max([len(txt) for txt in text_list])
    # padded_arr will contain all the padded texts
    padded_arr = []
    # seq_lengths will contain the length of each text
    seq_lengths = []

    # pad each text to maximum length
    for txt in text_list:
        len_seq = len(txt)
        txt += "0" * (max_len - len_seq)

        # index 1 for the unknown chars
        arr = np.array(
            [unq_chars.index(ch) if ch in unq_chars else unk_idx for ch in txt])

        padded_arr.append(arr)
        seq_lengths.append(len_seq)

    return np.array(padded_arr), np.array(seq_lengths)

# 10. Returns tensor batch*seq*frame 
def pad_list_np(list_np):
    # get maximum length of array from the given list of arrays
    max_len = max([len(arr) for arr in list_np])

    # So that the numpy array can be reshaped according to the input dimension
    max_len += INPUT_DIMENSION - (max_len % INPUT_DIMENSION)

    padded_arr = []

    for arr in list_np:
        len_seq = len(arr)
        arr = np.pad(arr, (0, max_len - len_seq), constant_values=0)
        padded_arr.append(arr)

    # final shape: no_of_arrays(rows), -1, 52 => -1 means unknown dimension
    return np.array(padded_arr).reshape((len(list_np), -1, INPUT_DIMENSION))

# 11. Generate batches of wavs and texts with padding as per needed 
def batchify(wavs, texts, unq_chars):
    assert len(wavs) == len(texts)
    # generates tensor of dim (batch * seq * frame)
    input_tensor = pad_list_np(wavs)
    target_tensor, target_lengths_tensor = pad_text(texts, unq_chars)
    output_seq_lengths_tensor = np.full(
        (len(wavs),), fill_value=input_tensor.shape[1])

    return input_tensor, target_tensor, target_lengths_tensor.reshape((-1, 1)), output_seq_lengths_tensor.reshape((-1, 1))

# 12. To decode with prefix beam search for MFCC features only
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

# 23. Decoding with prefix beam search from wavs only
def predict_from_wavs(model, wavs, unq_chars):
    mfccs = [generate_mfcc(wav) for wav in wavs]
    return predict_from_mfccs(model, mfccs, unq_chars)

#24. Converts the text to list of indices as per the unique characters list
def indices_from_texts(texts_list, unq_chars, unk_idx=1):

    indices_list = []
    for txt in texts_list:

        # index 1 for the unknown chars
        lst = [unq_chars.index(
            ch) if ch in unq_chars else unk_idx for ch in txt]

        indices_list.append(lst)

    return indices_list


#25. To find CER from mfccs
def CER_from_mfccs(model, mfccs, texts, unq_chars, batch_size=100):

    with torch.device(DEVICE):

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

#26. CER from wavs
def CER_from_wavs(model, wavs, texts, unq_chars, batch_size=100):

    assert len(wavs) == len(texts)

    len_wavs = len(wavs)
    for i in range(len_wavs):
        wavs[i] = generate_mfcc(wavs[i])

    return CER_from_mfccs(model, wavs, texts, unq_chars, batch_size)


#27. CTC softmax probabilities output from mfcc features
def ctc_softmax_output_from_mfccs(model, mfccs):
    mfccs = pad_list_np(mfccs)
    y = model(mfccs)
    return y

#28. CTC softmax probabilities output from wavs
def ctc_softmax_output_from_wavs(model, wavs):
    mfccs = [generate_mfcc(wav) for wav in wavs]
    return ctc_softmax_output_from_mfccs(model, mfccs)

#28. Plots lossses from the file
def plot_losses(dir, optimal_epoch=None):
    losses = None
    with open(dir, "rb") as f:
        losses = pickle.load(f)
        f.close()

    train_losses, test_losses = losses["train_losses"], losses["test_losses"]
    epochs = len(train_losses)
    # print(len(test_losses))

    X = range(1, epochs+1)

    fig, ax = plt.subplots(1, figsize=(15, 10))

    fig.suptitle('Train and Test Losses', fontsize=25,)

    ax.set_xlim(0, 72)
    ax.plot(X, train_losses, color="red", label="Train Loss")
    ax.plot(X, test_losses, color="green", label="Test Loss")

    plt.rcParams.update({'font.size': 20})

    plt.legend(loc="upper right", frameon=False, fontsize=20)
    # plt.xlabel("Epochs",{"size":20})
    # plt.ylabel("Loss", {"size":20})

    if (optimal_epoch != None):
        plt.axvline(x=optimal_epoch, ymax=0.5)
        # ax.plot(58, 0, 'go', label='marker only')
        plt.text(optimal_epoch, 35,
                 f'Optimal Epoch at {optimal_epoch}', fontsize=15)

    plt.show()