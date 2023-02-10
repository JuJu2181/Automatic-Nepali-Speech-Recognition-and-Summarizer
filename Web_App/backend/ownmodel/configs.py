import json
import tensorflow as tf 
# Necessary global configs
LOAD_MFCC_FILES = True

FRAME_SIZE = 160
SR = 16000
FRAME_RATE = int( SR / FRAME_SIZE )
N_MFCC = 13
HOP_LENGTH = 40

assert FRAME_SIZE % HOP_LENGTH == 0

INPUT_DIM = int(N_MFCC * (FRAME_SIZE / HOP_LENGTH))

# with open('./ownmodel/new_vocab.json','r',encoding='utf8') as f:
    
with open('ownmodel/new_vocab.json','r',encoding='utf8') as f:
    chars_dict = json.load(f)
UNQ_CHARS = list(chars_dict.keys())
UNQ_CHARS = ['0', 'u' ] + sorted(UNQ_CHARS) + ['-'] #"0" -> padding char,"u" -> unknown chars "-" -> blank char
NUM_UNQ_CHARS = len(UNQ_CHARS) # +1 is for '-' blank at last

MODEL_NAME = "ASR_model"


# Checks for the availability of the GPU
device_name = tf.test.gpu_device_name()

if device_name != '/device:GPU:0':
    device_name = '/device:CPU:0'