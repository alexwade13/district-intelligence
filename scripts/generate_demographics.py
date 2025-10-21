#!/usr/bin/env python3
"""
Generate demographic data for NYC election districts using two-step process.
This script coordinates downloading and processing demographic data.
"""

import sys
import subprocess
from pathlib import Path


def run_script(script_name: str):
    """Run a Python script and return its exit code."""
    script_path = Path(__file__).parent / script_name
    result = subprocess.run([sys.executable, str(script_path)], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    return result.returncode


def main():
    """Coordinate the two-step demographic data process."""
    print("🚀 Starting two-step demographic data generation...")
    print("=" * 60)

    # Step 1: Download raw census data
    print("\n📥 STEP 1: Downloading raw Census data...")
    download_code = run_script("download_census_data.py")

    if download_code != 0:
        print("❌ Download step failed. Aborting.")
        return

    # Step 2: Process the raw data
    print("\n🔄 STEP 2: Processing demographic data...")
    process_code = run_script("process_demographics.py")

    if process_code != 0:
        print("❌ Processing step failed.")
        return

    print("\n🎉 SUCCESS! Two-step demographic data generation complete!")
    print("📁 Check data/demographics.json for the final processed data")


if __name__ == "__main__":
    main()
