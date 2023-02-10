from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from pythonfiles import tokenizer


def loadModelInitial():
    device = "cpu"
    model = Wav2Vec2ForCTC.from_pretrained(".\\nepalimodel\\model_wav2vec").to(device)
    processor = Wav2Vec2Processor.from_pretrained(".\\nepalimodel\\processor_wav2vec")
    return model, processor, device
    