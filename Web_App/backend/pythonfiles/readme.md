# Nepali Extractive Text Summarization using TextRank algorithm

## Working of this model follows these steps

1. Read the text.

2. Remove useless characters from the text.

3. Splitting text into sentences and words as array.

4. Tokenizing individual words present.

5. Calculating influence factor of each words.

6. Measuring average influence of the sentence using word influence.

7. Ranking sentences based on that influences.

8. Re-sequencing top N influencial sentences sentences with

9. Displaying summarized text and saving it to the output.txt file.

## Installing the dependencies

This model barely uses any complicated libraries, rather it uses numpy. Version I used is given in requirements.txt. But it is more likely latest version of numpy works just fine.

    pip install numpy

If you are facing any compatibility issues try:

    pip install -r requirements.txt

## Inferencing the model

This model can be inferenced by various ways. First step is to clone the repo.

    git clone https://github.com/AnjaanKhadka/Extractive-text-summarization-Nepali.git

Then execute following code to get summary from text in sample.txt file

    python main.py

This inferencing will give summarized text as:

### Sample text

![image](https://user-images.githubusercontent.com/43941329/197317315-cadbe63b-98da-45ae-a02f-38486085a701.png)

### Summarized text

![image](https://user-images.githubusercontent.com/43941329/197317319-61e3fe5e-b9de-48d0-a498-ebced103f987.png)

To use this model on custom text file, execute following code.

    python main.py -i <path_to_your_text_file> -o <path_to_your_text_file>

Or you can execute

    python main.py -t

Then CLI asks for the text input and you can get summary that way as well.
