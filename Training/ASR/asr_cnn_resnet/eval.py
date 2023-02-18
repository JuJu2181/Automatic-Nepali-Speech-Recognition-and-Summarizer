from model.configs import UNQ_CHARS
from model.utils import ctc_softmax_output_from_wavs, load_model, load_wav, predict_from_wavs
import os
import edit_distance as ed
from datasets import load_metric
import sys
import pandas as pd

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


def get_transcript(model, speech_file):

    input_wav = load_wav(speech_file)

    """Gives the array of predicted sentences"""
    print("Predicting sentences.....")
    sentences, char_indices = predict_from_wavs(model, [input_wav], UNQ_CHARS)
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
    predicted_sentences, char_indices = predict_from_wavs(model,wavs,UNQ_CHARS)
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
    print("Evaluation Started \u2705 \u2705 \u2705 \u2705\n")
    print("Loading model.....")
    models_dir="D:\\Programming\\Projects\\major_project\\Codes\\Training\\ASR\\asr_cnn_resnet\\trained_models"
    model_names = os.listdir(models_dir)
    results = []
    for model_name in model_names:
        print(f"For model: {model_name}")
        model = load_model(models_dir+"\\"+model_name)
        print("Model loaded \u2705 \u2705 \u2705 \u2705\n")
        result = evaluate(model=model)
        # print(result)
        # res_df = pd.DataFrame(result)
        # print(res_df)
        results.append(result)
    result = {
        'Model': model_names,
        'Result': results
    }
    # print(result)
    df_res = pd.DataFrame({
        'Model': result['Model'],
        'Actual': [x['Actual'] for x in result['Result']],
        'Prediction': [x['Prediction'] for x in result['Result']],
        'CER': [x['CER'] for x in result['Result']],
        'WER': [x['WER'] for x in result['Result']]
    })
    df_res = df_res.explode(['Actual','Prediction','CER','WER']).reset_index(drop=True)
    print(df_res)
    df_res.to_csv("result_eval.csv",index=False)

    # model = load_model(
    #     r"D:\Programming\Projects\major_project\Codes\Training\ASR\asr_cnn_resnet\trained_models\model_95.h5")
    print("Evaluation done")
    sys.exit(1)
    speech_input = input("Enter the path to speech file: ")
    print("Now Predicting ...")
    print('=> Input received')
    basename = os.path.basename(speech_input)
    filename,ext = os.path.splitext(basename)
    op_file_path = f'D:\Programming\Projects\major_project\Codes\Training\ASR\\asr_cnn_resnet\cnn_predictions\\{filename}.txt'       
    output = get_transcript(model, speech_input)
    with open(op_file_path,'w+',encoding='utf-8') as f:
        f.write(output)
    print("=> Output has been written to a file")
