'''
This file will contain all required global configurations for the project
'''

import torch

MODEL_NAME = "Nepali_ASR_model"

LOAD_MFCC_FILES = True 

FRAME_SIZE = 160 
SAMPLING_RATE = 16000 
FRAME_RATE = int(SAMPLING_RATE/FRAME_SIZE)
MFCC_COUNT = 13 
HOP_LENGTH = 40 

assert FRAME_SIZE % HOP_LENGTH == 0 

INPUT_DIMENSION = int(MFCC_COUNT * (FRAME_SIZE / HOP_LENGTH))

# Unique characters in dataset
UNQ_CHARS = [' ', 'ँ', 'ं', 'ः', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', '्', 'ॠ', '\u200c', '\u200d', '।']
# Add padding, unknown and blank characters in the vocabulary
UNQ_CHARS = ['P', 'U' ] + sorted(UNQ_CHARS) + ['-'] #"P" -> padding char,"U" -> unknown chars "-" -> blank char
# Number of unique characters in the dataset
NUM_UNQ_CHARS = len(UNQ_CHARS) # +1 is for '-' blank at last

# Checks for availability of GPU 
DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")