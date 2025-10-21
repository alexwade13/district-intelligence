"""
Demographics data processing for NYC election districts.
Adapted from district_candidate_research/census_data/

This module handles downloading raw Census data and processing it for election districts.
"""

import json
import os
import re
from typing import Dict, List, Optional

import requests
import censusdata
import pandas as pd


class DemographicsProcessor:
    """Process census demographic data for NYC election districts."""

    def __init__(self):
        self.survey = 'acs5'
        self.year = 2023
        self.ny_fips = '36'  # New York State FIPS code

        # Census variable codes for different demographic metrics
        self.demographic_variables = {
            'population': 'B01003_001E',
            'housing_units': 'B25003_001E',
            'median_household_income': 'B19013_001E',
            'median_age': 'B01002_001E',
            'renter_units': 'B25003_003E',
            'male_population': 'B01001_002E',
            'female_population': 'B01001_026E',
            'hispanic_latino': 'B03003_003E',
            'black_african_american': 'B02001_003E',
            'white_alone': 'B02001_002E',
            'asian_alone': 'B02001_005E',
            'other_race': 'B02001_007E',
            'two_or_more_races': 'B02001_008E',
            'foreign_born': 'B05002_013E'
        }

        # Language variables (C16001 series)
        self.language_variables = []

        # NYC borough FIPS codes
        self.nyc_counties = {
            'New York': '061',  # Manhattan
            'Kings': '047',     # Brooklyn
            'Queens': '081',    # Queens
            'Bronx': '005',     # Bronx
            'Richmond': '085'   # Staten Island
        }

    def get_census_variables(self) -> Dict[str, str]:
        """Get all available census variables for the current survey/year."""
        variables_url = f"https://api.census.gov/data/{self.year}/acs/{self.survey}/variables.json"
        response = requests.get(variables_url)
        return response.json()['variables']

    def get_language_variables(self) -> List[str]:
        """Get all language-related variables (C16001 series)."""
        if not self.language_variables:
            variables = self.get_census_variables()
            self.language_variables = [
                var for var in variables.keys()
                if var.startswith('C16001')
            ]
        return self.language_variables

    def get_election_districts_list(self) -> List[str]:
        """Get list of all NYC election district IDs."""
        districts_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'shapes', 'election_districts.json')

        with open(districts_path, 'r') as f:
            districts_data = json.load(f)

        return list(districts_data.keys())

    def get_borough_for_district(self, district_id: str) -> str:
        """Get borough name for a district ID."""
        districts_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'shapes', 'election_districts.json')

        with open(districts_path, 'r') as f:
            districts_data = json.load(f)

        return districts_data.get(district_id, {}).get('borough', 'Unknown')

    def get_county_fips_for_borough(self, borough: str) -> str:
        """Get county FIPS code for borough name."""
        borough_to_county = {
            'Manhattan': 'New York',
            'Brooklyn': 'Kings',
            'Queens': 'Queens',
            'Bronx': 'Bronx',
            'Staten Island': 'Richmond'
        }
        return self.nyc_counties.get(borough_to_county.get(borough, borough), '061')

    def process_district_demographics(self, district_id: str) -> Dict:
        """Process demographic data for a specific election district."""
        borough = self.get_borough_for_district(district_id)
        county_fips = self.get_county_fips_for_borough(borough)

        if borough == 'Unknown':
            print(f"Warning: Unknown borough for district {district_id}")
            return {}

        try:
            # For MVP, we'll use borough-level data as a proxy
            # In a full implementation, we'd aggregate census tracts to election districts
            geo = censusdata.censusgeo([
                ('state', self.ny_fips),
                ('county', county_fips)
            ])

            print(f"    Fetching data for {borough} (district {district_id})...")

            # Get all demographic variables for this borough
            var_codes = list(self.demographic_variables.values())
            data = censusdata.download(
                self.survey,
                self.year,
                geo,
                var_codes
            )

            # Convert to our format
            results = {}
            for var_name, var_code in self.demographic_variables.items():
                if var_code in data.columns:
                    value = data[var_code].iloc[0] if not data.empty else 0
                    results[var_name] = float(value) if pd.notna(value) else 0.0

            # Add borough info
            results['borough'] = borough
            results['district_id'] = district_id

            print(f"    ✅ Got data for {borough}: pop={results.get('population', 0):,}")
            return results

        except Exception as e:
            print(f"❌ Error processing district {district_id}: {e}")
            return {}

    def download_raw_census_data(self) -> Dict[str, pd.DataFrame]:
        """Download raw census tract data for all NYC counties."""
        print("📡 Downloading raw Census tract data for all NYC counties...")
        print("   This gives us ~2,000 census tracts instead of 5 boroughs!")

        raw_data = {}

        for borough_name, county_fips in self.nyc_counties.items():
            try:
                print(f"    Fetching tract data for {borough_name} (county {county_fips})...")

                # Download ALL census tracts for this county (much more granular!)
                geo = censusdata.censusgeo([
                    ('state', self.ny_fips),
                    ('county', county_fips),
                    ('tract', '*')  # All tracts in this county
                ])

                var_codes = list(self.demographic_variables.values())
                data = censusdata.download(
                    self.survey,
                    self.year,
                    geo,
                    var_codes
                )

                raw_data[borough_name] = data
                print(f"    ✅ Got {borough_name} data: {len(data)} tracts")

            except Exception as e:
                print(f"❌ Error downloading {borough_name}: {e}")
                raw_data[borough_name] = pd.DataFrame()

        total_tracts = sum(len(df) for df in raw_data.values() if not df.empty)
        print(f"🎉 Downloaded data for {total_tracts} census tracts total!")
        return raw_data

    def save_raw_census_data(self, raw_data: Dict[str, pd.DataFrame], filepath: str):
        """Save raw census data to files for later processing."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        # Save as JSON for easy API serving
        json_data = {}
        for borough, df in raw_data.items():
            if not df.empty:
                # Convert DataFrame to dict, handling censusgeo objects
                df_dict = {}
                for idx, row in df.iterrows():
                    row_dict = {}
                    for col, value in row.items():
                        if hasattr(value, 'geo'):  # censusgeo object
                            row_dict[col] = str(value)  # Convert to string representation
                        else:
                            row_dict[col] = value
                    df_dict[str(idx)] = row_dict  # Convert index to string

                json_data[borough] = df_dict

        with open(filepath, 'w') as f:
            json.dump(json_data, f, indent=2, default=str)

        print(f"💾 Saved raw census data to {filepath}")

    def process_district_demographics_from_raw(self, raw_data: Dict[str, pd.DataFrame]) -> Dict[str, Dict]:
        """Process raw census tract data into election district format."""
        print("🔄 Processing census tract data for election districts...")

        district_ids = self.get_election_districts_list()
        results = {}

        # Group districts by borough
        borough_districts = {}
        for district_id in district_ids:
            borough = self.get_borough_for_district(district_id)
            if borough not in borough_districts:
                borough_districts[borough] = []
            borough_districts[borough].append(district_id)

        # Process each borough's tract data
        for borough, district_list in borough_districts.items():
            if borough not in raw_data or raw_data[borough].empty:
                print(f"⚠️ No tract data for {borough}, skipping {len(district_list)} districts")
                continue

            borough_df = raw_data[borough]
            tract_count = len(borough_df)
            print(f"  📊 {borough}: {tract_count} census tracts")

            # For now, aggregate tract data by borough and assign to districts
            # TODO: Implement proper spatial intersection with election district boundaries
            borough_results = {}
            for var_name, var_code in self.demographic_variables.items():
                if var_code in borough_df.columns:
                    # Aggregate tracts within borough (sum for counts, mean for rates)
                    if var_name in ['median_household_income', 'median_age']:
                        # For medians, take population-weighted average
                        total_pop = borough_df['B01003_001E'].sum()  # Total population
                        if total_pop > 0:
                            weighted_sum = (borough_df[var_code] * borough_df['B01003_001E']).sum()
                            borough_results[var_name] = weighted_sum / total_pop
                        else:
                            borough_results[var_name] = 0.0
                    else:
                        # For counts, sum them up
                        borough_results[var_name] = borough_df[var_code].sum()

            # Assign aggregated borough data to all districts in this borough
            for district_id in district_list:
                district_result = borough_results.copy()
                district_result['district_id'] = district_id
                district_result['borough'] = borough
                results[district_id] = district_result

            print(f"  ✅ Processed {borough} ({len(district_list)} districts from {tract_count} tracts)")

        print(f"🎉 Successfully processed {len(results)} districts from census tract data!")
        return results

    def save_demographics_data(self, data: Dict[str, Dict], filepath: str):
        """Save processed demographic data to JSON file."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Saved demographic data for {len(data)} districts to {filepath}")


def main():
    """Main function to process and save demographic data."""
    processor = DemographicsProcessor()

    print("Processing demographic data for NYC election districts...")
    demographics_data = processor.process_all_districts_demographics()

    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'demographics.json')
    processor.save_demographics_data(demographics_data, output_path)


if __name__ == "__main__":
    main()
