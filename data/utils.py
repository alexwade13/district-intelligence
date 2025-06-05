import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd
from io import StringIO

def get_per_ed_results(per_ad_url: str): 
    """Given a url that points to the per AD totals for a race, return a dataframe with per ED results.
    This page should contain a table where each column is a candidate and the rows are Assembly Districts. 

    This function looks for hrefs that start with the string 'AD'. If it can find no such links, then it throws an exception.

    - Parameters
        - per_ad_url: the url of the subpage with AD totals, ie: https://enr.boenyc.gov/CD27280AD0.html
        - density: whether to return the fraction of votes in each ED per candidate, or total number.
    - Returns
        - df: Dataframe consisting of ElectDist (XXYY) where XX is AD, and YYY is the ED, with columns for each candidate.

    TODO @chrispan-68: Use regex for identifying the link. 
    TODO @chrispan-68: Add asserts and readable errors.
    """
    response = requests.get(per_ad_url)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = []
    for link in soup.find_all("a", href=True):
        if link.text.startswith("AD"):
            subpage = urljoin(per_ad_url, link["href"]) # one AD's results.
            subpage_df = pd.read_html(StringIO(requests.get(subpage).text))[-1].dropna(
                axis=1, how="all"
            )
            columns = ["ED", "Reported %"] + list(subpage_df.iloc[0][2:] + " " + subpage_df.iloc[1][2:])
            data.append(
                subpage_df.iloc[2:-1]
                .set_axis(columns, axis=1)
                .astype({col: int for col in columns[2:]}) # all vote counts are ints.
                .assign(
                    **{
                        "Reported %": lambda df: df["Reported %"].str[:-1].astype(float) / 100.0,
                        "AD": " ".join(link.text.split()), # assembly district.
                    }
                )
                .assign(
                    ElectDist=lambda df: df.AD.str.split().str[-1].astype(int) * 1000
                    + df.ED.str.split().str[-1].astype(int) # AD * 1000 + ED (I think this matches with the ElectDist from the geodata)
                )
            )
    df = pd.concat(data)

    # turn this into a dictionary.
    sum_reporting_perc = 0.0
    sum_counts = 0
    def reformat_dict(input):
        nonlocal sum_reporting_perc, sum_counts
        output = {}
        output["reporting"] = input.pop("Reported %")
        output["candidates"] = input
        output["total"] = sum(input.values())
        sum_reporting_perc += output['reporting'] * output['total']
        sum_counts += output['total']
        return output
    output_dict = {}
    output_dict['districts'] = {k: reformat_dict(v) for k, v in df.drop(columns=["ED", "AD"]).set_index("ElectDist").to_dict(orient='index').items()}
    output_dict['reporting'] = sum_reporting_perc / sum_counts
    output_dict['last_updated'] = str(pd.Timestamp.now())
    return output_dict