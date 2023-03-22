import re
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from pythonfiles.tokenizer import add_purnabiram



USE_CUDA = False
model_name = "./abstractive/"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

kriyapads = open("./pythonfiles/minimal_kriyapad.txt",'r',encoding="utf-8").read().split("\n")
samyojaks = open("./pythonfiles/samyojak.txt",'r',encoding="utf-8").read().split("\n")


def filter_summary(summary):
    words_arr = summary.split(" ")
    print(words_arr)
    if words_arr[-1] == "":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "यो":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "पनि":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "पढ्नुहोस्":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "पनि":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "यो":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "अनि":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "परियारअनि":
        words_arr = words_arr[:-1]
    if words_arr[-1] == "कमल":
        words_arr = words_arr[:-1]
    
    new_summary = " ".join(words_arr)
    return new_summary
        

# model = None
# tokenizer = None
def load_model():
    global tokenizer, model
    model_name = "./abstractive/"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    if USE_CUDA:
        model = model.to(torch.device("cuda"))


def add_purnabiram_to_text(text):
    return add_purnabiram(text,kriyapads,samyojaks)


def seperate_text_into_chunks(text):
    
    sentence_arr = text.split("।")
    new_sentence_arr = []
    for sentences in sentence_arr:
        if len(sentences) > 5:
            new_sentence_arr.append(sentences)
    sentence_arr = new_sentence_arr.copy()
     
    new_sentence_arr = []
    
    if len(sentence_arr) > 8:
        for i in range(0,len(sentence_arr),10):
            if i+10 <= len(sentence_arr):
                new_sentence_arr.append("। ".join(sentence_arr[i:i+10]))
            else:
                new_sentence_arr.append("। ".join(sentence_arr[i:]))
    else:
        return [text]
    return new_sentence_arr           

def get_summary_of_text(text):
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
    
    summary = filter_summary(summary)
    return summary
                    
def abstracrive_summarization(text):
    global tokenizer, model
    
    text = add_purnabiram_to_text(text)
    
    text_chunks = seperate_text_into_chunks(text)
    
    print(text_chunks)
    
    summ_arr = []
    for i_texts in text_chunks:
        summ_arr.append(get_summary_of_text(i_texts))
    
    
    print(summ_arr)
    summary = "। ".join(summ_arr)
    return re.sub('\।+', '।', summary)

def abstractive_summarization_from_file(file_path):
    with open(file_path, "r",encoding="utf-8") as f:
        text = f.read()
    return abstracrive_summarization(text)