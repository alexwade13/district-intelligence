import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd
from io import StringIO
import numpy as np
import random
import time

def safe_get_request(url, avg_wait_secs=1.0):
    """Requests from a url but ensures a random amount of time between requests. 
    
    - Parameters
        - url: the url being requested.
        - avg_wait_secs: We will wait between 0.5-1.5x avg_wait_secs before requesting.
    - Returns
        - response: the output from requests.get(url)
    """
    time.sleep(avg_wait_secs * (0.5 + random.random()))
    return requests.get(url)

def get_elections(url: str):
    """Given the root url, ie https://enr.boenyc.gov, output a dict, from election name to per_ad link, ie: 
    {"State Senator": "https://enr.boenyc.gov/CD27280AD0.html", ...}
    
    The values returned are able to be passed directly in get_per_ed_results below. 
    
    TODO @chrispan-68: some sub-pages don't follow the format, ie: https://web.archive.org/web/20210625211942/https://web.enrboenyc.us/OF18AD0PY1.html

    - Parameters
        - url: root url of the boenyc election night results website.
    - Returns
        - election_to_link: the dictionary described above. 
    """
    response = safe_get_request(url)
    soup = BeautifulSoup(response.text, "html.parser")
    races_table = soup.find_all("table")[-1] # this table contains each race with AD Details links.

    race_to_url = {}
    for row in races_table.find_all('tr'):

        cells = row.find_all('td')
        if len(cells) < 7:
            continue  # skip rows that don’t match expected format

        race_title = f"{cells[2].get_text(strip=True)} ({cells[3].get_text(strip=True)})"
        ad_link_tag = cells[6].find('a')

        assert ad_link_tag, f"Couldn't find AD Details for row: {row.prettify()}"
        assert ad_link_tag.text == "AD Details", f"Expected 'AD Details' as the text of the link, instead found: {ad_link_tag.text}"
        
        race_to_url[race_title] = ad_link_tag['href'] # this link is to the AD Details page, which is by borough.

    election_to_link = {} # we still need to click on the 'Total' link in the AD Details page.
    for race_title, sub_link in race_to_url.items():
        sub_url = urljoin(url, sub_link)
        sub_response = safe_get_request(sub_url)
        sub_soup = BeautifulSoup(sub_response.text, "html.parser")

        total_tag_links = [tag_link for tag_link in sub_soup.find_all("a", href=True) if tag_link.text == 'Total']
        if len(total_tag_links) != 1:
            continue
        election_to_link[race_title] = urljoin(url, total_tag_links[0]['href'])
    return election_to_link

def get_per_ed_results(per_ad_url: str, format='grouped'): 
    """Given a url that points to the per AD totals for a race, return a dataframe with per ED results.
    This page should contain a table where each column is a candidate and the rows are Assembly Districts. 

    This function looks for hrefs that start with the string 'AD'. If it can find no such links, then it throws an exception.

    - Parameters
        - per_ad_url: the url of the subpage with AD totals, ie: https://enr.boenyc.gov/CD27280AD0.html
        - format: 'dict' or 'df', depending on whether you want to do get_nested_dict post-formatting
    - Returns
        - df: Dataframe consisting of ElectDist (XXYY) where XX is AD, and YYY is the ED, with columns for each candidate.

    TODO @chrispan-68: Use regex for identifying the link. 
    TODO @chrispan-68: Add asserts and readable errors.
    """
    response = safe_get_request(per_ad_url)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = []
    for link in soup.find_all("a", href=True):
        if link.text.startswith("AD"):
            subpage = urljoin(per_ad_url, link["href"]) # one AD's results.
            subpage_df = pd.read_html(StringIO(safe_get_request(subpage).text))[-1].dropna(
                axis=1, how="all"
            )
            columns = ["ED", "Reported %"] + list(subpage_df.iloc[0][2:] + " " + subpage_df.iloc[1][2:])
            data.append(
                subpage_df.iloc[2:-1]
                .set_axis(columns, axis=1)
                .astype({col: int for col in columns[2:]}) # all vote counts are ints.
                .rename(columns=lambda col: col.replace("&nbsp", "").strip())
                .assign(
                    **{
                        "Reported %": lambda df: df["Reported %"].str[:-1].astype(float) / 100.0,
                        "AD": " ".join(link.text.split()), # assembly district.
                    }
                )
                .assign(AD=lambda df: df.AD.str.split().str[-1].astype(int), ED=lambda df: df.ED.str.split().str[-1].astype(int))
                .assign(
                    ElectDist=lambda df: df.AD * 1000 + df.ED # AD * 1000 + ED (To match with geodata)
                )
            )
    df = pd.concat(data)
    if format == 'df':
        return df
    elif format == 'nested':
        output = get_nested_dict(df)
        output['last_updated'] = str(pd.Timestamp.now())
        return output
    elif format == 'grouped':
        output = get_grouped_dict(df)
        output['last_updated'] = str(pd.Timestamp.now())
    else:
        raise ValueError("Unrecognized format", format)

def get_grouped_dict(df):
    """Useful helper function to get a dictionary output with several non-nested groups.
        - Parameters
            - column, the col to groupby on.
        - Returns
            - grouped_dict: a dictionary with several separate groups. 
        """
    def _get_one_grouped_dict(df, column):
        assert column in df.columns or column == 'ALL', f"Column {column} not in dataframe columns {df.columns}."

        output = {}
        for g, gdf in df.assign(ALL='all').groupby(column):
            cand_df = gdf[[c for c in gdf.columns if not c in ["ED", "AD", "Reported %", "ElectDist", "ALL"]]]
            total_voters = cand_df.sum(axis=1) / gdf["Reported %"] # The total voters (including those who have not been reported)
            valid_eds = gdf.eval("`Reported %` > 0") & (cand_df.sum(axis=1) > 0) # For EDs with 0% reporting, we should drop.

            group_res = {}
            group_res['total'] = float(cand_df.sum().sum())
            group_res['candidates'] = cand_df.sum().to_dict()
            if not valid_eds.any():
                group_res['approx_total_voters'] = 0
                group_res['reporting'] = 0
            else:
                group_res['approx_total_voters'] = float(total_voters.fillna(0).sum())
                group_res['reporting'] = float(np.average(gdf.loc[valid_eds]["Reported %"], weights=total_voters.loc[valid_eds]))
            output[g] = group_res
        
        return output

    DICT_GROUPS = ['ALL', 'AD', 'ElectDist']
    GROUP_NAMES = ['all', 'assembly_districts', 'election_districts']
    output = {}
    for group, name in zip(DICT_GROUPS, GROUP_NAMES):
        output[name] = _get_one_grouped_dict(df, group)
    return output


def get_nested_dict(df, subsets=[("AD", "assembly_districts"), ("ElectDist", "electoral_districts")]):
        """Useful helper function to get a nested dictionary from a dataframe.
        - Parameters
            - subsets: defines all the nested subgroups and their names in the output dict.
        - Returns
            - nested_dict: a dictionary with len(subsets) levels of nesting and stats for each nesting group.
        """
        if len(subsets) == 0:
            cand_df = df[[c for c in df.columns if not c in ["ED", "AD", "Reported %", "ElectDist"]]]
            total_voters = cand_df.sum(axis=1) / df["Reported %"] # The total voters (including those who have not been reported)
            valid_eds = df.eval("`Reported %` > 0") & (cand_df.sum(axis=1) > 0) # For EDs with 0% reporting, we should drop.

            output = {}
            output['total'] = float(cand_df.sum().sum())
            output['candidates'] = cand_df.sum().to_dict()
            if not valid_eds.any():
                output['approx_total_voters'] = 0
                output['reporting'] = 0
            else:
                output['approx_total_voters'] = float(total_voters.fillna(0).sum())
                output['reporting'] = float(np.average(df.loc[valid_eds]["Reported %"], weights=total_voters.loc[valid_eds]))
            return output
        # recurse
        cur_subset = subsets[0]
        assert len(cur_subset) == 2, f"the subset: {cur_subset} is malformatted, every element of 'subsets' should be a pair."
        future_subsets = subsets[1:]
        output = {}
        output[cur_subset[1]] = {}
        output['total'] = 0
        output['approx_total_voters'] = 0
        output['candidates'] = {}
        sum_reporting_percs = 0.0
        for g, gdf in df.groupby(cur_subset[0]):
            child_dict = get_nested_dict(gdf, future_subsets)
            output[cur_subset[1]][g] = child_dict
            output['total'] += child_dict['total']
            output['approx_total_voters'] += child_dict['approx_total_voters']
            sum_reporting_percs += child_dict['approx_total_voters'] * child_dict['reporting']
            for cand in child_dict['candidates'].keys():
                if not cand in output['candidates']:
                    output['candidates'][cand] = 0
                output['candidates'][cand] += child_dict['candidates'][cand]
        output["reporting"] = sum_reporting_percs / output['approx_total_voters']
        return output