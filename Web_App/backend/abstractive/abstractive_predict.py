import re
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

USE_CUDA = False
model_name = "./abstractive/"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# model = None
# tokenizer = None
def load_model():
    global tokenizer, model
    model_name = "./abstractive/"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    if USE_CUDA:
        model = model.to(torch.device("cuda"))

def abstracrive_summarization(text):
    global tokenizer, model
    input_ids = tokenizer(
        (text),
        return_tensors="pt",
        padding="max_length",
        truncation=True,
        max_length=512
    )["input_ids"]
    
    if USE_CUDA:
        input_ids = input_ids.to(torch.device("cuda"))

    output_ids = model.generate(
        input_ids=input_ids,
        max_length=84,
        no_repeat_ngram_size=2,
        num_beams=4
    )[0]

    summary = tokenizer.decode(
        output_ids,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False
    )
    return summary

def abstractive_summarization_from_file(file_path):
    with open(file_path, "r",encoding="utf-8") as f:
        text = f.read()
    return abstracrive_summarization(text)