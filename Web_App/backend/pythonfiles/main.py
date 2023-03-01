# coding = utf8
import numpy as np
from pythonfiles import tokenizer,ranker
import sys, getopt

inputfile = "sample.txt"
outputfile = "output.txt"
force_use_purnabiram_model = False
use_imputed_text = False

def main(argv):
    global inputfile, outputfile, force_use_purnabiram_model, use_imputed_text
    try:
        opts, args = getopt.getopt(argv,"ti:o:",["t","fp","ifile=","ofile="])
    except getopt.GetoptError:
        print ('main.py -i <inputfile> -o <outputfile>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '--fp':
            print("Forcing purnabiram model")
            force_use_purnabiram_model = True
        elif opt in ("-i", "--ifile"):
            inputfile = arg
        elif opt in ("-o", "--ofile"):
            outputfile = arg
        elif opt in ("-t", "--t"):
            use_imputed_text = True




    
stop_words = open("./pythonfiles/stopwords.txt",'r',encoding="utf-8").read()
word_endings = open("./pythonfiles/word_endings.txt",'r',encoding='utf-8').read() 
kriyapads = open("./pythonfiles/minimal_kriyapad.txt",'r',encoding="utf-8").read().split("\n")
samyojaks = open("./pythonfiles/samyojak.txt",'r',encoding="utf-8").read().split("\n")

def get_summary_from_text(text,force_use_purnabiram_model):
    global stop_words, word_endings, kriyapads, samyojaks
    # 
    # Reading text files (sample text file, word endings file and stopwords file)
    #
    # text = open(file_path,'r',encoding="utf-8").read()
    #
    print(f"Input Text: \n{text}")
    
    is_complete_sentence = True
    # if "।" not in text:
    purnabiram_count = text.count("।") 
    if not force_use_purnabiram_model:
        if purnabiram_count*100 < len(text):
            is_complete_sentence = False
    else:
        is_complete_sentence = False
    # print(is_complete_sentence)   

    valid_characters = tokenizer.get_valid_chars()
    # print(stop_words.split("\n"))
    # print(text)
    #
    # Remove useless characters from the sentence 
    # 
      
    if not is_complete_sentence:
        text = tokenizer.add_purnabiram(text,kriyapads,samyojaks)
    print(f"Sentence after adding purnabirams: \n{text}")  
    
    #
    # Split the sentence into array of words and patagraph in its array. (as Array of Array of the words)
    #
    sentences = tokenizer.get_sentences_as_arr(text)
    # print(sentences)

    text = tokenizer.remove_useless_characters(text,valid_characters)


    sentences = tokenizer.remove_repeating_sentences(sentences)
    
    if len(sentences) == 0:
        return "It is not a valid text. Please try again with a valid text."
    elif len(sentences) == 1:
        return sentences
    
    # print(sentences)
    words_arr = tokenizer.get_words_as_arr(sentences)    
    #
    # Remove the stop words from the array
    #
    words_arr = tokenizer.remove_stop_words_and_filter_word_arr(words_arr,word_endings, stop_words)
    # print(words_arr)
    
    #
    # remove empty sentences and lone word sentences and update sentences accordingly
    #    
    sentences, words_arr = tokenizer.remove_empty_sentences(sentences, words_arr)
    #
    # Tokenize the words and sentences into numbers
    # 
    tokens, token_dict = tokenizer.tokenize(words_arr)
    # 
    # Create a association matrix
    # 
    association_matrix, counter_vector = ranker.create_association_matrix(tokens,No_of_unique_chars= len(token_dict))
    # 
    # Calculate influence of each word on the paragraph
    # 
    word_influence_vector = ranker.calculate_word_ranks(association_matrix, counter_vector)
    # 
    # Based in the word importance ranking, calculate teh sentence importance ranking.
    # 
    sentence_influence = ranker.calculate_sentence_influence(tokens,word_influence_vector)
    # print(sentence_influence)
    #
    # sort sentences based on its influence 
    # 
    # sorted_sentences = tokenizer.sort_sentences_with_influence(sentences,sentence_influence)    
    # 
    # Get first n sentences from the given text as summarized text.
    # 
    
    # for values in zip(sentences,sentence_influence):
    #     print(values)
    
    
    summary_sentences = ranker.get_n_influencial_sentence(sentences,sentence_influence,n=np.ceil(len(sentences)*0.33))

    #
    # Combine all sentences as a single paragraph
    #
    summarized_text = ranker.get_summarized_text(summary_sentences)
    
    print(f"generated summary: \n{summarized_text}")
    
    with open(outputfile, 'w',encoding="utf-8") as f:
        f.write(summarized_text)
    return summarized_text
    
def get_summary_from_text_file(file_path,force_use_purnabiram_model=True):
    text = open(file_path,'r',encoding="utf-8").read()
    return get_summary_from_text(text,force_use_purnabiram_model)

def get_summary_from_input_text(force_use_purnabiram_model):
    text = input("Enter the text to summarize: \n")
    return get_summary_from_text(text,force_use_purnabiram_model)


if __name__ == "__main__":
    main(sys.argv[1:])

    if use_imputed_text:
        get_summary_from_input_text(force_use_purnabiram_model)
    else:
        get_summary_from_text_file(inputfile,force_use_purnabiram_model)
    
