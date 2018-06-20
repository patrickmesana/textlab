import pandas as pd
from tabulate import tabulate

k_review_stars = "review_stars"


def main():
    df = pd.read_csv("./hilton_reviews.csv")
    print(tabulate(df.describe(), headers="keys"))
    print("\n")
    print("Review Stars Count")
    print(df[k_review_stars].value_counts())


if __name__ == '__main__':
    main()
    print('Done!')
