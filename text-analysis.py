from nlpkit.prepare import prepare_line
from nlpkit.tokenizer import tokenize
import pandas as pd

from nlpkit.utils import do_or_load_pickle


def prepare_and_tokenize(raw_document):
    cleaned_document = prepare_line(raw_document)
    tokenized_document = tokenize(cleaned_document)
    return tokenized_document


def main():
    df = pd.read_csv("./input/session/hilton_reviews.csv")
    reviews = df["text"]
    tokenized_reviews = do_or_load_pickle("tokenized_reviews",
                                          lambda: [prepare_and_tokenize(raw_doc) for raw_doc in reviews])
    return tokenized_reviews


if __name__ == '__main__':
    main()
