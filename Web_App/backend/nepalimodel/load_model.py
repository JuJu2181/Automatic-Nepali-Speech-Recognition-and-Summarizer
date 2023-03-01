from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from pythonfiles import tokenizer


def loadModelInitial():
    device = "cpu"
    model = Wav2Vec2ForCTC.from_pretrained(".\\nepalimodel\\best_wav2vec_model").to(device)
    processor = Wav2Vec2Processor.from_pretrained(".\\nepalimodel\\best_wav2vec_processor")
    return model, processor, device
    