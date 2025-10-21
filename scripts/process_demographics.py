#!/usr/bin/env python3
"""
Process raw Census data into election district demographics.
This script takes the downloaded raw data and processes it for election districts.
"""

import json
import sys
from pathlib import Path

# Add the lib directory to the Python path
lib_path = Path(__file__).parent.parent / 'lib'
sys.path.insert(0, str(lib_path))

try:
    from demographics import DemographicsProcessor
    import pandas as pd
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure censusdata and other dependencies are installed.")
    print("Run: pip install censusdata pandas requests")
    sys.exit(1)


def load_raw_census_data(filepath: str) -> dict:
    """Load raw census data from JSON file."""
    print(f"📂 Loading raw census data from {filepath}...")

    with open(filepath, 'r') as f:
        raw_data = json.load(f)

    # Convert back to DataFrames
    processed_data = {}
    for borough, data in raw_data.items():
        # Convert the nested dict back to DataFrame format
        df_data = []
        for row_key, row_values in data.items():
            df_data.append(row_values)

        df = pd.DataFrame(df_data)
        processed_data[borough] = df

    print(f"✅ Loaded data for {len(processed_data)} boroughs")
    return processed_data


def main():
    """Process raw census data into election district format."""
    print("🔄 Starting demographic data processing...")

    # Load raw census tract data
    raw_data_path = Path(__file__).parent.parent / 'data' / 'raw_tract_data.json'

    if not raw_data_path.exists():
        print(f"❌ Raw tract data file not found: {raw_data_path}")
        print("Please run: python3 scripts/download_census_data.py first")
        return

    raw_data = load_raw_census_data(str(raw_data_path))

    # Initialize processor
    processor = DemographicsProcessor()

    # Process the raw data
    demographics_data = processor.process_district_demographics_from_raw(raw_data)

    if not demographics_data:
        print("❌ No demographic data was processed. Check the logs above for errors.")
        return

    # Save processed data
    output_path = Path(__file__).parent.parent / 'data' / 'demographics.json'
    processor.save_demographics_data(demographics_data, str(output_path))

    print("\n✅ Demographic data processing complete!")
    print(f"📁 Processed data saved to: {output_path}")
    print(f"📊 Total districts processed: {len(demographics_data)}")


if __name__ == "__main__":
    main()
