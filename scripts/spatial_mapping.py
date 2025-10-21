#!/usr/bin/env python3
"""
Spatial mapping script to map census tracts to election districts.
This provides accurate, neighborhood-level demographic data.
"""

import os
import sys
import json
import pandas as pd
import geopandas as gpd
from pathlib import Path
from typing import Dict, List

# Add lib directory to path
lib_path = Path(__file__).parent.parent / 'lib'
sys.path.insert(0, str(lib_path))

from demographics import DemographicsProcessor


class SpatialMapper:
    """Maps census tracts to election districts using spatial intersection."""

    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.data_dir = self.base_dir / 'data'
        self.shapes_dir = self.data_dir / 'shapes'

        # NYC county FIPS codes
        self.nyc_counties = {
            'New York': '061',    # Manhattan
            'Kings': '047',       # Brooklyn
            'Queens': '081',
            'Bronx': '005',
            'Richmond': '085'     # Staten Island
        }
        self.ny_fips = '36'  # NY state FIPS

        # Borough name mappings
        self.borough_lookup = {
            'Manhattan': 'New York',
            'Brooklyn': 'Kings',
            'Queens': 'Queens',
            'The Bronx': 'Bronx',
            'Staten Island': 'Richmond'
        }

    def load_election_districts(self) -> gpd.GeoDataFrame:
        """Load election district boundaries from GeoJSON."""
        print("📂 Loading election district boundaries...")

        # Try to load from geometry/raw directory first
        geometry_path = self.base_dir / 'geometry' / 'raw' / 'districts-all.geojson'
        
        if geometry_path.exists():
            try:
                districts_gdf = gpd.read_file(geometry_path)
                print(f"✅ Loaded {len(districts_gdf)} election districts from {geometry_path.name}")
                return districts_gdf
            except Exception as e:
                print(f"❌ Error loading districts from {geometry_path}: {e}")

        # Fallback: Try shapes directory
        districts_path = self.shapes_dir / 'districts.json'
        election_districts_path = self.shapes_dir / 'election_districts.json'

        for path in [districts_path, election_districts_path]:
            if path.exists():
                try:
                    districts_gdf = gpd.read_file(path)
                    print(f"✅ Loaded {len(districts_gdf)} election districts from {path.name}")
                    return districts_gdf
                except Exception as e:
                    print(f"❌ Error loading districts from {path}: {e}")

        # If we get here, return None
        print("❌ Error loading election districts: Could not find valid shapefile")
        return None

    def download_census_tracts(self) -> gpd.GeoDataFrame:
        """Download census tract boundaries for NYC using TIGER/Line data."""
        # Check if we already have the tracts saved
        tracts_geojson_path = self.base_dir / 'geometry' / 'raw' / 'census_tracts_nyc.geojson'
        
        if tracts_geojson_path.exists():
            print(f"📂 Loading existing census tracts from {tracts_geojson_path.name}...")
            tracts_gdf = gpd.read_file(tracts_geojson_path)
            print(f"✅ Loaded {len(tracts_gdf)} tracts for NYC\n")
            return tracts_gdf
        
        print("🌐 Downloading census tract shapefiles from Census TIGER/Line...")
        print("   This downloads ~150MB of shapefile data for accurate spatial mapping\n")

        # Download once for entire NY state (includes all NYC counties)
        print(f"🏛️ Downloading NY State census tracts (includes all 5 boroughs)...")
        state_fips = self.ny_fips
        url = f"https://www2.census.gov/geo/tiger/TIGER2023/TRACT/tl_2023_{state_fips}_tract.zip"
        print(f"   📡 Download URL: {url}")

        try:
            import urllib.request
            import zipfile
            import tempfile

            with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp_zip:
                print(f"   ⬇️ Downloading NY State tracts...")
                urllib.request.urlretrieve(url, tmp_zip.name)

                with tempfile.TemporaryDirectory() as tmp_dir:
                    print(f"   📦 Extracting shapefile...")
                    with zipfile.ZipFile(tmp_zip.name, 'r') as zip_ref:
                        zip_ref.extractall(tmp_dir)

                    # Find the .shp file
                    shp_files = [f for f in os.listdir(tmp_dir) if f.endswith('.shp')]
                    if shp_files:
                        shp_path = os.path.join(tmp_dir, shp_files[0])
                        print(f"   📖 Loading shapefile...")
                        all_tracts = gpd.read_file(shp_path)

                        # Filter to only NYC counties and exclude water tracts
                        nyc_county_fips = list(self.nyc_counties.values())
                        tracts_gdf = all_tracts[all_tracts['COUNTYFP'].isin(nyc_county_fips)]
                        tracts_gdf = tracts_gdf[tracts_gdf['ALAND'] > 0]

                        print(f"   ✅ Loaded {len(tracts_gdf)} tracts for NYC")
                        
                        # Save to geometry/raw directory
                        tracts_geojson_path.parent.mkdir(parents=True, exist_ok=True)
                        print(f"   💾 Saving tracts to {tracts_geojson_path}...")
                        tracts_gdf.to_file(tracts_geojson_path, driver='GeoJSON')
                        print(f"   ✅ Saved census tracts for future use\n")
                        
                        return tracts_gdf
                    else:
                        print(f"   ❌ No shapefile found in archive")
                        return gpd.GeoDataFrame()

            # Clean up
            os.unlink(tmp_zip.name)

        except Exception as e:
            print(f"❌ Error downloading tracts: {e}")
            print(f"   URL was: {url}")
            import traceback
            traceback.print_exc()
            return gpd.GeoDataFrame()

    def perform_spatial_mapping(self, tracts_gdf: gpd.GeoDataFrame, districts_gdf: gpd.GeoDataFrame) -> Dict[str, List[str]]:
        """Perform spatial intersection between tracts and districts."""
        print("🔄 Performing spatial intersection...")

        # Ensure both GeoDataFrames are in the same CRS
        if tracts_gdf.crs != districts_gdf.crs:
            print(f"   📐 Reprojecting tracts from {tracts_gdf.crs} to {districts_gdf.crs}")
            tracts_gdf = tracts_gdf.to_crs(districts_gdf.crs)

        # Perform spatial join
        # This finds which tracts intersect with which election districts
        joined = gpd.sjoin(tracts_gdf, districts_gdf, how='inner', predicate='intersects')

        # Group by district to get list of intersecting tracts
        # Try to find the district ID column (could be ElectDist, ELECT_DIST, or other)
        district_col = None
        for col in ['ElectDist', 'ELECT_DIST', 'ED', 'district_id', 'id']:
            if col in districts_gdf.columns:
                district_col = col
                break
        
        if not district_col:
            print(f"❌ Could not find district ID column. Available columns: {list(districts_gdf.columns)}")
            return {}
        
        print(f"   Using district column: {district_col}")
        
        district_to_tracts = {}
        for district_id in districts_gdf[district_col].unique():
            matching_tracts = joined[joined[district_col] == district_id]['GEOID'].tolist()
            if matching_tracts:
                district_to_tracts[str(district_id)] = matching_tracts

        print(f"✅ Mapped {len(district_to_tracts)} districts to census tracts")
        return district_to_tracts

    def aggregate_district_demographics(self, district_to_tracts: Dict[str, List[str]], raw_tract_data: Dict) -> Dict:
        """Aggregate tract-level demographics to district level."""
        print("📊 Aggregating demographics from tracts to districts...")
        
        district_demographics = {}
        processed_count = 0
        missing_tracts = 0

        for district_id, tract_geoids in district_to_tracts.items():
            # tract_geoids are like "36061000100" (state+county+tract)
            # raw_tract_data is a dict keyed by GEOID
            
            matching_data = []
            for geoid in tract_geoids:
                if geoid in raw_tract_data:
                    matching_data.append(raw_tract_data[geoid])
                else:
                    missing_tracts += 1
            
            if not matching_data:
                continue
            
            # Aggregate the data
            total_pop = sum(tract.get('B01003_001E', 0) for tract in matching_data)
            
            if total_pop > 0:
                weighted_age = sum(tract.get('B01002_001E', 0) * tract.get('B01003_001E', 0) for tract in matching_data)
                weighted_income = sum(tract.get('B19013_001E', 0) * tract.get('B01003_001E', 0) for tract in matching_data)
                total_units = sum(tract.get('B25003_001E', 0) for tract in matching_data)
                renter_units = sum(tract.get('B25003_003E', 0) for tract in matching_data)
                
                # Handle Census error codes (negative values)
                median_age = weighted_age / total_pop if total_pop > 0 else 0
                median_income = weighted_income / total_pop if total_pop > 0 else 0
                
                # Filter out error codes
                if median_age < 0:
                    median_age = 0
                if median_income < 0:
                    median_income = 0
                
                district_demographics[district_id] = {
                    'population': int(total_pop),
                    'median_age': float(median_age),
                    'median_income': float(median_income),
                    'pct_renters': float((renter_units / total_units * 100) if total_units > 0 else 0),
                }
                processed_count += 1

        print(f"✅ Aggregated data for {processed_count} districts")
        if missing_tracts > 0:
            print(f"⚠️  {missing_tracts} tract GEOIDs from spatial mapping not found in census data")
        return district_demographics

    def _get_borough_for_district(self, district_id: str) -> str:
        """Extract borough from district ID."""
        # District IDs are formatted like "36061001000" where 061 is county
        if len(district_id) >= 5:
            county_fips = district_id[3:6]
            for borough, fips in self.nyc_counties.items():
                if fips == county_fips:
                    return borough
        return None

    def fallback_borough_aggregation(self, borough_tract_data: Dict) -> Dict:
        """Fallback: aggregate tract data by borough and apply to all districts."""
        print("🔄 Using fallback borough aggregation...")

        # Load election districts to know which districts exist
        election_districts_path = self.data_dir / 'election_districts.json'
        with open(election_districts_path, 'r') as f:
            election_districts = json.load(f)

        # Aggregate tract data by borough
        borough_demographics = {}

        for borough_name, tracts in borough_tract_data.items():
            if not tracts:
                print(f"⚠️ No tract data for {borough_name}")
                continue

            # Aggregate
            total_pop = sum(tract.get('B01003_001E', 0) for tract in tracts)

            if total_pop > 0:
                weighted_age = sum(tract.get('B01002_001E', 0) * tract.get('B01003_001E', 0) for tract in tracts)
                weighted_income = sum(tract.get('B19013_001E', 0) * tract.get('B01003_001E', 0) for tract in tracts)
                total_units = sum(tract.get('B25003_001E', 0) for tract in tracts)
                renter_units = sum(tract.get('B25003_003E', 0) for tract in tracts)
                
                # Map to the county name used in borough lookup
                mapped_borough = None
                for borough, county_name in self.borough_lookup.items():
                    if county_name == borough_name or borough == borough_name:
                        mapped_borough = county_name
                        break
                
                if not mapped_borough:
                    mapped_borough = borough_name
                
                borough_demographics[mapped_borough] = {
                    'population': int(total_pop),
                    'median_age': float(weighted_age / total_pop),
                    'median_income': float(weighted_income / total_pop),
                    'pct_renters': float((renter_units / total_units * 100) if total_units > 0 else 0),
                }
                print(f"✅ Processed {borough_name} ({len(tracts)} tracts)")

        # Apply borough-level data to all districts in that borough
        district_demographics = {}
        for district in election_districts:
            district_id = district['id']
            borough = district.get('borough')

            # Map borough name
            borough_key = self.borough_lookup.get(borough)

            if borough_key and borough_key in borough_demographics:
                district_demographics[district_id] = borough_demographics[borough_key].copy()

        print(f"🎉 Fallback aggregation complete: {len(district_demographics)} districts")
        return district_demographics


def main():
    """Main execution function."""
    print("🗺️ Starting spatial mapping of census tracts to election districts...\n")

    mapper = SpatialMapper()

    # Step 1: Load election districts
    districts_gdf = mapper.load_election_districts()

    # Step 2: Download census tracts
    tracts_gdf = mapper.download_census_tracts()

    if tracts_gdf.empty or districts_gdf is None:
        print("❌ Could not download census tract boundaries")
        print("   Falling back to borough-level aggregation...")

        # Load raw tract data
        raw_data_path = mapper.data_dir / 'raw_tract_data.json'
        if not raw_data_path.exists():
            print("❌ No raw tract data found. Run download_census_data.py first.")
            sys.exit(1)

        # Load and process with fallback
        processor = DemographicsProcessor()
        
        # Load raw data and flatten
        with open(raw_data_path, 'r') as f:
            raw_data = json.load(f)
        
        # Flatten by borough for fallback
        borough_data = {}
        for borough, tracts in raw_data.items():
            borough_data[borough] = list(tracts.values())

        district_demographics = mapper.fallback_borough_aggregation(borough_data)

        # Save results
        output_path = mapper.data_dir / 'district_demographics.json'
        with open(output_path, 'w') as f:
            json.dump(district_demographics, f, indent=2)

        print(f"💾 Saved spatially-mapped demographics to {output_path}")
        print(f"📊 Total districts with data: {len(district_demographics)}")
        return

    # Step 3: Perform spatial mapping
    district_to_tracts = mapper.perform_spatial_mapping(tracts_gdf, districts_gdf)

    # Step 4: Load raw census data
    raw_data_path = mapper.data_dir / 'raw_tract_data.json'
    if not raw_data_path.exists():
        print("❌ No raw tract data found. Run download_census_data.py first.")
        sys.exit(1)

    processor = DemographicsProcessor()
    
    # Load raw data and flatten the nested structure
    with open(raw_data_path, 'r') as f:
        raw_data = json.load(f)
    
    # Flatten: {borough: {tract_key: {data}}} -> list of dicts with tract info
    flattened_data = {}
    for borough, tracts in raw_data.items():
        for tract_key, data in tracts.items():
            # Extract tract code from key like "tract:000100"
            import re
            tract_match = re.search(r'tract:(\d+)', tract_key)
            if tract_match:
                tract_code = tract_match.group(1)
                # Also extract county from key like "county:061"
                county_match = re.search(r'county:(\d+)', tract_key)
                county_code = county_match.group(1) if county_match else None
                
                # Build full GEOID (state + county + tract)
                if county_code:
                    geoid = f"36{county_code}{tract_code}"
                    flattened_data[geoid] = data
    
    print(f"   Loaded {len(flattened_data)} census tracts from raw data")
    raw_tract_data = flattened_data

    # Step 5: Aggregate demographics
    district_demographics = mapper.aggregate_district_demographics(district_to_tracts, raw_tract_data)

    # Step 6: Save results
    output_path = mapper.data_dir / 'district_demographics.json'
    with open(output_path, 'w') as f:
        json.dump(district_demographics, f, indent=2)

    print(f"💾 Saved spatially-mapped demographics to {output_path}")
    print(f"📊 Total districts with data: {len(district_demographics)}")


if __name__ == '__main__':
    main()
