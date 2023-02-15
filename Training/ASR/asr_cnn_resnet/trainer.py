import tensorflow as tf
import tensorflow.keras.backend as K
import numpy as np
from sklearn.model_selection import train_test_split
import pandas as pd
import librosa
import time
from tqdm import tqdm
import edit_distance as ed
from datasets import load_metric
import os


from model.configs import SR, device_name, UNQ_CHARS, INPUT_DIM, MODEL_NAME, NUM_UNQ_CHARS
from model.utils import CER_from_mfccs, batchify, clean_single_wav, gen_mfcc, indices_from_texts, load_model
from model.model import get_model

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

def calculateBatchErrorRates(output,target,start,end,cer,wer,isValidation=False):
    """
        The line of codes below is for computing evaluation metric (CER) on internal validation data.
    """
    input_len = np.ones(output.shape[0]) * output.shape[1]
    # Decode the output using beam search and CTC to get  the required logits
    with tf.device(device_name):
        decoded_indices = K.ctc_decode(output, input_length=input_len,
                            greedy=False, beam_width=100)[0][0]


    # decoded_indices = tf.nn.ctc_beam_search_decoder(inputs=output, sequence_length=input_len,beam_width=100)[0][0]
    
    # Remove the padding token from batchified target texts
    target_indices = [sent[sent != 0].tolist() for sent in target]

    # Remove the padding, unknown token, and blank token from predicted texts
    predicted_indices = [sent[sent > 1].numpy().tolist() for sent in decoded_indices] # idx 0: padding token, idx 1: unknown, idx -1: blank token

    batch_cer = cer
    batch_wer = wer
    len_batch = end - start
    predicted_labels = []
    actual_labels = []
    for i in range(len_batch):
        predicted_indices_list = predicted_indices[i]
        actual_indices_list = target_indices[i]
        predicted_label = "".join([UNQ_CHARS[index] for index in predicted_indices_list])
        actual_label = "".join([UNQ_CHARS[index] for index in actual_indices_list])
        if isValidation == True:
            # print(f"\nPred: {predicted_label}")
            # print(f"Actual: {actual_label}\n")
            predicted_labels.append(predicted_label)
            actual_labels.append(actual_label)
        error_rates = calculateErrorRatesAlt(actual_label,predicted_label)
        batch_cer += error_rates[0]
        batch_wer += error_rates[1]
    batch_cer /= len_batch
    batch_wer /= len_batch
    if isValidation == True:
        return batch_cer, batch_wer, predicted_labels, actual_labels
    return batch_cer,batch_wer

def train_model(model, optimizer, train_wavs, train_texts, validation_wavs, validation_texts, start_epoch= 0, end_epoch=1, batch_size=50,restore_checkpoint=True):

    with tf.device(device_name):
        # Definition of checkpoint
        checkpoint_dir = './training-checkpoints'
        checkpoint_prefix = os.path.join(checkpoint_dir,'ckpt')
        checkpoint = tf.train.Checkpoint(optimizer =optimizer, model = model)
        # restore latest checkpoint
        if restore_checkpoint == True:
            if len(os.listdir(checkpoint_dir)) != 0: 
                checkpoint.restore(tf.train.latest_checkpoint(checkpoint_dir))
                print('Checkpoint Restored')
            else:
                print("There are no checkpoints to restore")
        # These will be the final results to be returned
        train_losses = []
        validation_losses = []
        train_CERs = []
        train_WERs = []
        validation_CERs = []
        validation_WERs = []
        for e in range(start_epoch, end_epoch):
            epoch = e+1
            start_time = time.time()
            len_train = len(train_wavs)
            len_validation = len(validation_wavs)
            training_loss = 0
            training_CER = 0
            training_WER = 0
            validation_loss = 0
            validation_CER = 0
            validation_WER = 0
            train_batch_count = 0
            validation_batch_count = 0
            # Training Steps
            print("Training epoch: {}".format(epoch))
            for start in tqdm(range(0, len_train, batch_size)):

                end = None
                if start + batch_size < len_train:
                    end = start + batch_size
                else:
                    end = len_train
                x, target, target_lengths, output_lengths = batchify(
                    train_wavs[start:end], train_texts[start:end], UNQ_CHARS)

                with tf.GradientTape() as tape:
                    output = model(x, training=True)

                    loss = K.ctc_batch_cost(
                        target, output, output_lengths, target_lengths)

                grads = tape.gradient(loss, model.trainable_weights)
                optimizer.apply_gradients(zip(grads, model.trainable_weights))

                training_loss += np.average(loss.numpy())
                train_batch_count += 1
                training_CER, training_WER = calculateBatchErrorRates(output,target,start,end,training_CER,training_WER)


            # Validation Step
            print("Validation epoch: {}".format(epoch))
            for start in tqdm(range(0, len_validation, batch_size)):

                end = None
                if start + batch_size < len_validation:
                    end = start + batch_size
                else:
                    end = len_validation
                x, target, target_lengths, output_lengths = batchify(
                    validation_wavs[start:end], validation_texts[start:end], UNQ_CHARS)

                output = model(x, training=False)

                # Calculate CTC Loss
                loss = K.ctc_batch_cost(
                    target, output, output_lengths, target_lengths)

                validation_loss += np.average(loss.numpy())
                validation_batch_count += 1
                validation_CER, validation_WER, predicted_labels, actual_labels = calculateBatchErrorRates(output,target,start,end,validation_CER,validation_WER,isValidation=True)
            print(f"\nPred: {predicted_labels[0].split()}")
            print(f"Actual: {actual_labels[0].split()}\n")
            # Average the results
            # losses
            training_loss /= train_batch_count
            validation_loss /= validation_batch_count
            # cers
            training_CER /= train_batch_count
            validation_CER /= validation_batch_count
            # wers 
            training_WER /= train_batch_count 
            validation_WER /= validation_batch_count

            # Append the results 
            train_losses.append(training_loss)
            train_CERs.append(training_CER)
            train_WERs.append(training_WER)
            validation_losses.append(validation_loss)
            validation_CERs.append(validation_CER)
            validation_WERs.append(validation_WER)
            
            rec = f"Epoch: {epoch}, Train Loss: {training_loss:.2f}, Validation Loss: {validation_loss:.2f}, Train CER: {(training_CER*100):.2f}, Validation CER: {(validation_CER*100):.2f}, Train WER: {(training_WER*100):.2f}, Validation WER: {(validation_WER*100):.2f} in {(time.time() - start_time):.2f} secs\n"

            # rec = f"Epoch: {epoch}, Train Loss: {training_loss:.2f}, Validation Loss: {validation_loss:.2f} in {(time.time() - start_time):.2f} secs\n"

            print(rec)
            if epoch % 10 == 0:
                print(f"Now saving checkpoint for epoch {epoch}")
                checkpoint.save(checkpoint_prefix) 
                print('Checkpoint Saved')


        result = {
            'epochs': list(range(start_epoch+1,end_epoch+1)),
            'train_loss': train_losses,
            'validation_loss': validation_losses,
            'train_cer': train_CERs,
            'validation_cer': validation_CERs,
            'train_wer': train_WERs,
            'validation_wer': validation_WERs
        }
    
    return model, result

# def load_data(wavs_dir, texts_dir):
#     texts_df = pd.read_csv(texts_dir)[0:20000]
#     train_wavs = []
#     print(f'There are {texts_df.shape[0]} files')
#     for idx,f_name in enumerate(texts_df["filename"]):
#         wav, _ = librosa.load(f"{wavs_dir}/{f_name}.flac", sr=SR)
#         train_wavs.append(wav)
#         index = idx + 1
#         if index % 10000 == 0:
#             print(f"{index} data loaded !!!")
#     train_texts = texts_df["label"].tolist()
#     return train_wavs, train_texts

def load_data_with_mfcc(texts_dir):
    texts_df = pd.read_csv(texts_dir,skiprows=0,nrows=1000)
    train_texts = texts_df["label"].to_list()
    train_wavs = texts_df["mfcc"].to_list()
    train_wavs = [np.fromstring(mfcc_str, sep=',',dtype=np.float32) for mfcc_str in train_wavs]
    return train_wavs, train_texts

def update_csv(result):
    print("Now updating csv file")
    original_csv_path = "./results_new_data.csv"
    original_df = pd.read_csv(original_csv_path)
    df_temp = pd.DataFrame(result)
    df_temp.rename(columns={"epochs":"epoch"},inplace=True)
    # df_temp["train_cer"] = df_temp["train_cer"]*100
    # df_temp["validation_cer"] = df_temp["validation_cer"]*100
    # df_temp["train_wer"] = df_temp["train_wer"]*100
    # df_temp["validation_wer"] = df_temp["validation_wer"]*100
    df_final = pd.concat([original_df,df_temp],ignore_index=True)
    print(f"Updated results dataframe now have {df_final.shape[0]} rows")
    df_final.to_csv(original_csv_path,index=False)
    print("Updated CSV saved")


if __name__ == "__main__":
    print(device_name)

    # Defintion of the model
    model = get_model(INPUT_DIM, NUM_UNQ_CHARS, num_res_blocks=5, num_cnn_layers=2,
                      cnn_filters=50, cnn_kernel_size=15, rnn_dim=170, rnn_dropout=0.15, num_rnn_layers=2,
                      num_dense_layers=1, dense_dim=340, model_name=MODEL_NAME, rnn_type="lstm",
                      use_birnn=True)
    print("Model defined \u2705 \u2705 \u2705 \u2705\n")

    # Defintion of the optimizer
    optimizer = tf.keras.optimizers.Adam()

    #load data along with mfcc
    t1 = time.time()
    # Load the data
    print("Loading data.....")
    train_wavs, train_texts = load_data_with_mfcc(texts_dir="~/manualpartition/teamSaransha/data/data_cnn/data_first_40k.csv")
    t2 = time.time()
    print(f"Data loaded with mfcc \u2705 \u2705 \u2705 \u2705\nAnd It took {t2-t1} seconds\n")

    # Train Test Split
    """
    Originally the data was split in the 95% train and 5% test set; With total of 148K (audio,text) pairs.
    """
    t3 = time.time()
    print("Splitting data.....")
    train_wavs, test_wavs, train_texts, test_texts = train_test_split(
        train_wavs, train_texts, test_size=0.2,shuffle=False, random_state=None)
    t4 = time.time()
    print(f"Data splitted \u2705 \u2705 \u2705 \u2705\nAnd It took {t4-t3} seconds\n")
    # Train the model
    """
    Originally the model was trained for 58 epochs; With a batch size of 50.
    """
    # loading checkpoint
    # model = load_model('/content/drive/MyDrive/Training_Checkpoints/checkpoint_50.h5')
    t5 = time.time()
    print("Training Model.....")
    model_trained, result = train_model(model, optimizer, train_wavs, train_texts,
                test_wavs, test_texts, start_epoch=0,end_epoch=50, batch_size=64,restore_checkpoint=True)
    model_trained.save('./model1.h5')
    t6 = time.time()
    print(f"Model Trained and Saved \u2705 \u2705 \u2705 \u2705\nAnd It took {t6-t5} seconds\n")

    update_csv(result)
    print('Results updated \u2705 \u2705 \u2705 \u2705\n')
    print(f"Total time taken: {time.time() - t1} seconds")



    '''
    Some notes:
    Batch size - 500,300 gave GPU error
    Batch size - 5 was too slow took nearly 1 hr for an epoch
    Batch size - 250 increased gpu utilization without giving error and saw some improvement in training time
    '''
