import numpy as np
def create_association_matrix(tokens, No_of_unique_chars):
    association_matrix = np.zeros(shape=(No_of_unique_chars,No_of_unique_chars))
    counter_vector = np.zeros(shape= No_of_unique_chars)
    for i,sentence in enumerate(tokens):
        for j,words in enumerate(sentence):
            for k,item in enumerate(sentence[j+1:]):
                # print(f" from {sentence} word = {words}, item = {item}")
                if words != item:
                    association_matrix[words][item] += 1
                    association_matrix[item][words] += 1
                    counter_vector[item]+=1
                    counter_vector[words]+=1
    # print(association_matrix)
    # print(counter_vector)
    
    # new_association_matrix = []
    for i,(denominator,rows) in enumerate(zip(counter_vector,association_matrix)):
        # new_row = []
        for j,element in enumerate(rows):
            association_matrix[j][i] = association_matrix[j][i]/denominator
            # new_row.append(element/denominator)
        # new_association_matrix.append(new_row)
     
    return association_matrix,counter_vector

# imp_factor(A) = (1-d) + d (imp_factor(T1)/C(T1) + … + imp_factor(Tn)/C(Tn))

def normalize_importance_vector(iv):
    sum = np.sum(iv)
    return iv/sum 


def find_squared_error(new_iv,old_iv):
    sq_sum = 0
    for n_imp, o_imp in zip(new_iv,old_iv):
        sq_sum += np.square(n_imp-o_imp)
    return sq_sum


def calculate_word_ranks(association_matrix,counter_vector, max_iterations = 50, min_iterations = 10, threshold = 0.000001, damping_factor = 0.85):
    '''max_iterations : maximum number of iterations to go through to find the solution within the threahold (this should be a function of no of unique words)
    threshold : squared precision to be achieved to be classes as the solution vector 
    damping_factor: it is the factor by which a 
    '''
    no_of_unique_word = len(counter_vector)
    new_importance_vector = np.zeros(shape=no_of_unique_word)
    old_importance_vector = np.full(shape = no_of_unique_word, fill_value = 1 /no_of_unique_word)
    for itt in range(max_iterations):
        for i in range(no_of_unique_word):
            sum = 0
            for j in range(no_of_unique_word):
                if i != j:
                    sum += old_importance_vector[j]*association_matrix[i][j]
            
            new_importance_vector[i] = (1-damping_factor) + damping_factor*(sum)
        new_importance_vector = normalize_importance_vector(new_importance_vector)
        # print(new_importance_vector)
        if find_squared_error(new_importance_vector,old_importance_vector)<threshold and itt>=min_iterations:
            print(f"Solution found within {itt} iterations")
            return new_importance_vector
        old_importance_vector = new_importance_vector.copy()
    print("Solution couldnot be found within set max iterations")
    return new_importance_vector



def calculate_sentence_influence(tokens, word_iv):
    ranked_token_list = []
    for sentence in tokens:
        sentence_influence = 0
        for word in sentence:
            sentence_influence += word_iv[word]
        ranked_token_list.append(sentence_influence/len(sentence))
    return ranked_token_list

# def sort_sentences_with_influence(sentences,sentence_influence):
#     no_of_sentences = len(sentences)
#     sorted_sentences = []
#     for i in range(no_of_sentences):
#         ind = np.argmax(sentence_influence)
#         sorted_sentences.append(sentences[ind])
#         sentence_influence[ind] = - np.NINF
#     return sorted_sentences

def get_n_influencial_sentence(sentences,sentence_influence,n):
    sentences_backup = sentences.copy()
    no_of_sentences = len(sentences)
    influencial_sentences = []
    n = int(n)
    print("n = ",n)
    for _ in range(n):
        ind = np.argmax(sentence_influence)
        influencial_sentences.append(sentences[ind])
        sentence_influence[ind] =  np.NINF
    
    influencial_n_sentences = []
    for elemental_sentence in sentences:
        if elemental_sentence in influencial_sentences:
            influencial_n_sentences.append(elemental_sentence)
       
    return influencial_n_sentences

def get_summarized_text(sentences):
    summary = ''
    for elemental_sentence in sentences:
        summary += elemental_sentence
        if summary[-1] == " ":
            addition = "।"
        else:
            addition = " ।"
        summary += addition
    return summary