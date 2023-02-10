from ownmodel.configs import UNQ_CHARS
from ownmodel.utils import ctc_softmax_output_from_wavs, load_model, load_wav, predict_from_wavs
import os


def get_transcript(speech_file):
    model =load_model("./ownmodel/model/model_20000_kaggle_50.h5")
    input_wav = load_wav(speech_file)
    """Gives the array of predicted sentences"""
    print("Predicting sentences.....")
    sentences, char_indices = predict_from_wavs(model, [input_wav], UNQ_CHARS)
    print(sentences, "\n")

    """Gives softmax output of the ctc model"""
    # softmax = ctc_softmax_output_from_wavs(model, [input_wav])
    # print(softmax)
    return sentences[0]

# if __name__ == "__main__":

#     # Loads the trained model
#     print("Loading model.....")
#     # model = load_model("./ownmodel/model/model_20000_kaggle_50.h5")
#     model = load_model("./model/model_20000_kaggle_50.h5")
#     print("Model loaded \u2705 \u2705 \u2705 \u2705\n")
    
    
    # speech_input = input("Enter the path to speech file: ")
    # print("Now Predicting ...")
    # print('=> Input received')
    # basename = os.path.basename(speech_input)
    # filename,ext = os.path.splitext(basename)
    # op_file_path = f'./predictions/{filename}.txt'       
    # output = get_transcript(model, speech_input)
    # with open(op_file_path,'w+',encoding='utf-8') as f:
    #     f.write(output)
    # print("=> Output has been written to a file")