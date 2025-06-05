import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd
from io import StringIO

def get_elections(url: str):
    """Given the root url, ie https://enr.boenyc.gov, output a dict, from election name to per_ad link, ie: 
    {"State Senator": "https://enr.boenyc.gov/CD27280AD0.html", ...}
    
    The values returned are able to be passed directly in get_per_ed_results below. 

    - Parameters
        - url: root url of the boenyc election night results website.
    - Returns
        - election_to_link: the dictionary described above. 
    """
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    races_table = soup.find_all("table")[-1] # this table contains each race with AD Details links.

    race_to_url = {}
    for row in races_table.find_all('tr'):
        cells = row.find_all('td')
        if len(cells) < 7:
            continue  # skip rows that don’t match expected format

        race_title = cells[2].get_text(strip=True)
        ad_link_tag = cells[6].find('a')

        assert ad_link_tag, f"Couldn't find AD Details for row: {row.prettify()}"
        assert ad_link_tag.text == "AD Details", f"Expected 'AD Details' as the text of the link, instead found: {ad_link_tag.text}"
        
        race_to_url[race_title] = ad_link_tag['href'] # this link is to the AD Details page, which is by borough.

    election_to_link = {} # we still need to click on the 'Total' link in the AD Details page.
    for race_title, sub_link in race_to_url.items():
        sub_url = urljoin(url, sub_link)
        sub_response = requests.get(sub_url)
        sub_soup = BeautifulSoup(sub_response.text, "html.parser")

        total_tag_links = [tag_link for tag_link in sub_soup.find_all("a", href=True) if tag_link.text == 'Total']
        assert len(total_tag_links) == 1, f"Expected 1 'Total' sublink but found {len(total_tag_links)} in {sub_url}"
        election_to_link[race_title] = urljoin(url, total_tag_links[0]['href'])
    return election_to_link

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