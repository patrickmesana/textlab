import pandas as pd
from tabulate import tabulate

k_review_stars = "review_stars"
k_business_name = "business_name"


def main():
    df = pd.read_csv("./input/caesars_palace_reviews.csv")
    print(tabulate(df.describe(), headers="keys"))
    print("\n")
    print("Review Stars Count")
    print(df[k_review_stars].value_counts())
    print("\n")
    print("Business Count")
    print(df[k_business_name].value_counts())


if __name__ == '__main__':
    main()
    print('Done!')
