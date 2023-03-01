from collections import defaultdict
import numpy as np
import pandas as pd
from tokenizer import get_minimal_text
kriyapad1 = open("out.txt",'r',encoding="utf-8").read().split("\n")
kriyapad2 = open("kriyapad2.txt",'r',encoding="utf-8").read().split("\n")
old_kriyapad = open("old_kriyapad.txt",'r',encoding="utf-8").read().split("\n")

def remove_duplicate_items_from_list(list1):
    list2 = []
    for items in list1:
        if items not in list2:
            list2.append(items)
    return list2



def display_different_items_in_lists(list1,list2):
    # print("Total items in old_kriyapad are: ",len(list1))
    # # print("Total items in new_kriyapad are: ",len(list2))
    # # print("Items in old_kriyapad but not in new_kriyapad are: ")
    # with open("difference.txt","w",encoding="utf8") as fl:
    #     for items in list1:
    #         if items not in list2:
    #             # print(items)
    #             fl.write(f"{items}\n")
    print("\nItems in new_kriyapad but not in old_kriyapad are: ")
    for items in list2:
        if items not in list1:
            print(items)
# def sort_dict(old_dict):
#     new_dict = dict()
    
      
      
def get_counts_for_the_words(list1):
    # list1 = "the one the two".split(" ")
    counts = defaultdict(int)
    for item in list1:
        if len(item)<=20:
            counts[item]+= 1
        # print("Done once")
    counts = sorted(counts.items(), key= lambda x:x[1])
    return counts

# def get_sentences():
    
# kriyapad1 = remove_duplicate_items_from_list(kriyapad1)
# kriyapad2 = remove_duplicate_items_from_list(kriyapad2)

# display_different_items_in_lists(kriyapad1,kriyapad2)

# counts = get_counts_for_the_words(kriyapad2)
# print(counts)
# with open("out.txt","w",encoding = "utf8") as fl:
#     for word,count in reversed(counts):
#         if count >= 20:
#             fl.write(f"{word}\n")

# df = pd.read_csv("filtered_sum_texts.csv")
# text = df.iloc[0]
# print(text[0])
# text = text.summary + text.texts


# entire_texts = ""
# for i in range(len(df)):
#     text = df.iloc[i]
#     text = text[0] + text[1]
#     entire_texts += text

# with open("entire_text.txt","w",encoding="utf8") as fl:
#     fl.write(entire_texts)

new_kriyapaad = []
with open("minimal_kriyapad.txt","w",encoding="utf8") as fl:
    for kriyapad in kriyapad1:
        k = get_minimal_text(kriyapad)
        if k not in new_kriyapaad:
            new_kriyapaad.append(k)
            fl.write(f"{k}\n")
print(len(new_kriyapaad))

# display_different_items_in_lists(old_kriyapad,kriyapad1)