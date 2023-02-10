'''
Here I will define a Deep learning model for ASR 
'''

#---------------------------------Imports---------------------------------------#
from unicodedata import bidirectional
from .config import * 
import torch 
import torch.nn.functional as F #Parameterless functions, like some activation functions 
from torch import optim #For optimizers like SGD, Adam etc. 
from torch import nn # All neural network modules 
from torch.utils.data import DataLoader # Gives easier data management by creating mini batches etc
from tqdm import tqdm #For displaying nice progress bar
import numpy as np 

# Residual block for the model 
def res_block():
    pass 


# Class for Neural Network 
class NN(nn.Module):
    def __init__(self,ip_channels,num_classes,num_res_blocks = 3, num_cnn_layers=1,cnn_filters=50,cnn_kernel_size=15,num_rnn_layers=2,rnn_dim=170,hidden_size=256,dense_dim=300,use_birnn=True,use_resnet=True,rnn_type="lstm",rnn_dropout=0.15):
        super(NN,self).__init__()
        self.conv1 = nn.Conv1d(
            in_channels=ip_channels,
            out_channels=cnn_filters,
            kernel_size=cnn_kernel_size,
            stride=1,
            padding='same'
        )
        self.batchNorm = nn.BatchNorm1d()
        self.rnn = nn.GRU(input_size = rnn_dim, hidden_size=hidden_size, num_layers=num_rnn_layers,bidirectional=use_birnn,dropout=rnn_dropout,batch_first=True) if rnn_type=="gru" else nn.LSTM(input_size=rnn_dim,hidden_size=hidden_size,num_layers=num_rnn_layers,bidirectional=use_birnn,dropout=rnn_dropout,batch_first=True)
        self.fc = nn.Linear(hidden_size*dense_dim,num_classes)

    def forward(self):
        pass
