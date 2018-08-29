from nlpkit import tfidf_model, tf_model
from nlpkit.model_loader import cached_or_train
from nlpkit.prepare import prepare_line
from nlpkit.tokenizer import tokenize, tokens_to_texts, without_art_prep_conj_words, without_num_sym_words, \
    allow_noun_adj_adp, allow_noun_adj, lemmatizing, doc_pos_tokens_with_texts
import pandas as pd
import scipy.sparse
import numpy as np
from nlpkit.tsne import tsne_representation
from nlpkit.utils import do_or_load_pickle, create_folder_if_not_exists, dump_json


def basic_tokenize_doc(input_doc):
    doc = tokenize(input_doc)
    doc = allow_noun_adj(doc)
    tokens_text = lemmatizing(tokens_to_texts(doc))
    doc = doc_pos_tokens_with_texts(doc, tokens_text)
    doc = [token for token in doc if len(token.text) > 2]
    return doc


def prepare_and_tokenize(raw_document):
    return basic_tokenize_doc(prepare_line(raw_document))


def prepare_viz_data(tf_dump, metas, contents):
    trained_array = tf_dump["transformations"].toarray()
    corpus_where = np.where(trained_array > 0)
    docs_where = corpus_where[0]
    words_where = corpus_where[1]
    vocab = tf_dump["features"]

    vocab_counts = {w: [] for w in vocab}
    for i, word_where in enumerate(words_where):
        doc_where = docs_where[i]
        word_name = vocab[word_where]
        count_where = trained_array[doc_where][word_where]
        w_occurences = vocab_counts[word_name]
        w_occurences.append((int(doc_where), float(count_where)))

    base_folder = "./output/"
    create_folder_if_not_exists(base_folder)
    dump_json(vocab_counts, base_folder + "vocab_stats.json")
    metas_splitted = metas.to_dict(orient='split')
    metas_as_dict = {column_name: [values[i] for values in metas_splitted['data']]
                     for i, column_name in enumerate(metas_splitted['columns'])}

    dump_json(metas_as_dict, base_folder + "metas.json")
    contents.to_json(base_folder + "contents.json", orient='values')


def review_sentiment(row):
    if row['review_stars'] > 2:
        return '+'
    else:
        return '-'


def main():
    df = pd.read_csv("./input/caesars_palace_reviews.csv")
    # df = df[:1000]
    reviews_text = df["text"]
    df['review_sentiment'] = df.apply(lambda row: review_sentiment(row), axis=1)

    tokenized_reviews = do_or_load_pickle("tokenized_reviews",
                                          lambda: [prepare_and_tokenize(raw_doc) for raw_doc in reviews_text],
                                          should_overwrite=True)

    trained_model = cached_or_train(tf_model.train_model,
                                    lambda: [tokens_to_texts(doc) for doc in tokenized_reviews],
                                    'tf', should_overwrite=True)

    trained_model_transformations = trained_model["transformations"]

    if isinstance(trained_model_transformations, scipy.sparse.csr.csr_matrix):
        transforms = trained_model_transformations.toarray()
    else:
        transforms = trained_model_transformations

    perplexity = 35.
    metric = 'cosine'

    tsne_coords = do_or_load_pickle("tf_tsne",
                                    lambda: tsne_representation(transforms, metric=metric, perplexity=perplexity),
                                    should_overwrite=True)

    [tsne_coords_x, tsne_coords_y] = tsne_coords
    tsne_viz_data_values = [{"X": float(x), "Y": float(tsne_coords_y[i])} for i, x in enumerate(tsne_coords_x)]

    tsne_viz_data = {"data": {"values": tsne_viz_data_values}}
    dump_json(tsne_viz_data, "./output/tf/tsne.json")

    prepare_viz_data(trained_model, df[["review_sentiment", "review_stars"]], reviews_text)
    return None


if __name__ == '__main__':
    main()
