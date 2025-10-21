#!/usr/bin/env python3
"""
Download raw Census tract data for NYC boroughs.
This script downloads granular census tract data (not borough totals) for proper neighborhood analysis.
"""

import sys
from pathlib import Path

# Add the lib directory to the Python path
lib_path = Path(__file__).parent.parent / 'lib'
sys.path.insert(0, str(lib_path))

try:
    from demographics import DemographicsProcessor
except ImportError as e:
    print(f"Error importing demographics module: {e}")
    print("Make sure censusdata and other dependencies are installed.")
    print("Run: pip install censusdata pandas requests")
    sys.exit(1)


def main():
    """Download and save raw census tract data."""
    print("🌐 Starting Census tract data download...")

    # Initialize processor
    processor = DemographicsProcessor()

    # Download raw census tract data (much more granular than borough data!)
    raw_data = processor.download_raw_census_data()

    if not raw_data:
        print("❌ No tract data was downloaded. Check the logs above for errors.")
        return

    # Save raw tract data
    output_path = Path(__file__).parent.parent / 'data' / 'raw_tract_data.json'
    processor.save_raw_census_data(raw_data, str(output_path))

    print("\n✅ Census tract data download complete!")
    print(f"📁 Raw tract data saved to: {output_path}")
    print("\n📋 Next steps:")
    print("1. Run: python3 scripts/process_demographics.py")
    print("2. Implement proper spatial mapping for accurate district-level data")
    print("3. Use census tract data for real neighborhood-level insights!")


if __name__ == "__main__":
    main()
