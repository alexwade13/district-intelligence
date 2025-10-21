#!/usr/bin/env python3
"""
Map census tracts to assembly districts and aggregate demographics.
Creates:
1. ad_tract_mapping.json - which tracts belong to which ADs
2. assembly_demographics.json - aggregate demographics for each AD
3. assembly_tract_data.json - tract-level data organized by AD for drill-down
"""

import geopandas as gpd
import json
from pathlib import Path
import sys

def load_data():
    """Load assembly districts, census tracts, and raw demographic data."""
    print("📂 Loading geographic and demographic data...")
    
    base_dir = Path(__file__).parent.parent
    
    ads_path = base_dir / "geometry" / "raw" / "assembly_districts_nyc.geojson"
    tracts_path = base_dir / "geometry" / "raw" / "census_tracts_nyc.geojson"
    raw_data_path = base_dir / "data" / "raw_tract_data.json"
    
    if not ads_path.exists():
        print(f"   ❌ Assembly districts file not found: {ads_path}")
        print(f"   💡 Run: python3 scripts/download_assembly_districts.py")
        sys.exit(1)
    
    if not tracts_path.exists():
        print(f"   ❌ Census tracts file not found: {tracts_path}")
        sys.exit(1)
    
    if not raw_data_path.exists():
        print(f"   ❌ Raw census data not found: {raw_data_path}")
        print(f"   💡 Run: python3 scripts/download_census_data.py")
        sys.exit(1)
    
    print(f"   📍 Loading assembly districts...")
    ads_gdf = gpd.read_file(ads_path)
    
    print(f"   📍 Loading census tracts...")
    tracts_gdf = gpd.read_file(tracts_path)
    
    print(f"   📊 Loading raw demographic data...")
    with open(raw_data_path, 'r') as f:
        raw_tract_data = json.load(f)
    
    raw_tract_dict = {}
    for borough, borough_data in raw_tract_data.items():
        for tract_key, tract_data in borough_data.items():
            if isinstance(tract_data, dict):
                import re
                match = re.search(r'state:(\d+)> county:(\d+)> tract:(\d+)', tract_key)
                if match:
                    state, county, tract = match.groups()
                    geoid = f"{state}{county}{tract}"
                    raw_tract_dict[geoid] = tract_data
                else:
                    print(f"   ⚠️  Could not parse GEOID from: {tract_key[:80]}")
    
    print(f"   ✅ Loaded {len(ads_gdf)} assembly districts")
    print(f"   ✅ Loaded {len(tracts_gdf)} census tracts")
    print(f"   ✅ Loaded {len(raw_tract_dict)} tract demographic records")
    
    return ads_gdf, tracts_gdf, raw_tract_dict


def spatial_mapping(ads_gdf, tracts_gdf):
    """Perform spatial intersection to map tracts to assembly districts."""
    print("\n🔄 Performing spatial intersection...")
    
    print(f"   📐 Reprojecting to common CRS...")
    if ads_gdf.crs != tracts_gdf.crs:
        ads_gdf = ads_gdf.to_crs(tracts_gdf.crs)
    
    print(f"   🗺️  Performing spatial join (this may take a moment)...")
    joined = gpd.sjoin(tracts_gdf, ads_gdf, how='inner', predicate='intersects')
    
    print(f"   📊 Mapping tracts to assembly districts...")
    print(f"   📋 Available columns after join: {list(joined.columns)}")
    
    geoid_col = None
    for col in ['GEOID', 'GEOID_left', 'GEOID_1']:
        if col in joined.columns:
            geoid_col = col
            break
    
    if not geoid_col:
        print(f"   ❌ Could not find GEOID column in joined data")
        sys.exit(1)
    
    print(f"   ✅ Using GEOID column: {geoid_col}")
    
    ad_to_tracts = {}
    
    for ad_id in sorted(ads_gdf['AssemDist'].unique()):
        matching_tracts = joined[joined['AssemDist'] == ad_id][geoid_col].tolist()
        ad_to_tracts[str(ad_id)] = matching_tracts
        print(f"      AD {ad_id}: {len(matching_tracts)} tracts")
    
    print(f"   ✅ Mapped {len(ad_to_tracts)} assembly districts to census tracts")
    
    return ad_to_tracts


def aggregate_assembly_demographics(ad_to_tracts, raw_tract_data):
    """Aggregate tract demographics to assembly district level."""
    print("\n📊 Aggregating demographics to assembly district level...")
    
    ad_demographics = {}
    
    for ad_id, tract_geoids in ad_to_tracts.items():
        tract_data = []
        for geoid in tract_geoids:
            if geoid in raw_tract_data:
                tract_data.append(raw_tract_data[geoid])
        
        if not tract_data:
            print(f"   ⚠️  AD {ad_id}: No demographic data found")
            continue
        
        valid_tracts = []
        for t in tract_data:
            pop = t.get('B01003_001E', 0)
            if isinstance(pop, (int, float)) and pop > 0:
                valid_tracts.append(t)
        
        total_pop = sum(t.get('B01003_001E', 0) for t in valid_tracts)
        
        if total_pop > 0:
            weighted_age_sum = 0
            weighted_age_pop = 0
            for t in valid_tracts:
                age = t.get('B01002_001E', 0)
                pop = t.get('B01003_001E', 0)
                if isinstance(age, (int, float)) and isinstance(pop, (int, float)) and age > 0:
                    weighted_age_sum += age * pop
                    weighted_age_pop += pop
            
            weighted_income_sum = 0
            weighted_income_pop = 0
            for t in valid_tracts:
                income = t.get('B19013_001E', 0)
                pop = t.get('B01003_001E', 0)
                if isinstance(income, (int, float)) and isinstance(pop, (int, float)) and income > 0:
                    weighted_income_sum += income * pop
                    weighted_income_pop += pop
            
            total_units = sum(t.get('B25003_001E', 0) for t in valid_tracts if isinstance(t.get('B25003_001E'), (int, float)) and t.get('B25003_001E', 0) > 0)
            renter_units = sum(t.get('B25003_003E', 0) for t in valid_tracts if isinstance(t.get('B25003_003E'), (int, float)) and t.get('B25003_003E', 0) >= 0)
            
            median_age = weighted_age_sum / weighted_age_pop if weighted_age_pop > 0 else 0
            median_income = weighted_income_sum / weighted_income_pop if weighted_income_pop > 0 else 0
            
            ad_demographics[ad_id] = {
                'Population': int(total_pop),
                'Median Age': float(median_age),
                'Median Household Income': float(median_income),
                'Renter Units': float((renter_units / total_units * 100) if total_units > 0 else 0),
            }
            
            print(f"   ✅ AD {ad_id}: pop={int(total_pop):,}, income=${int(median_income):,}")
        else:
            print(f"   ⚠️  AD {ad_id}: Zero population")
    
    print(f"   ✅ Aggregated data for {len(ad_demographics)} assembly districts")
    
    return ad_demographics


def organize_tract_data_by_ad(ad_to_tracts, raw_tract_data):
    """Organize tract demographics by assembly district for drill-down."""
    print("\n📋 Organizing tract data by assembly district...")
    
    ad_tract_data = {}
    
    for ad_id, tract_geoids in ad_to_tracts.items():
        tract_demographics = {}
        
        for geoid in tract_geoids:
            if geoid in raw_tract_data:
                tract = raw_tract_data[geoid]
                
                pop = tract.get('B01003_001E', 0)
                age = tract.get('B01002_001E', 0)
                income = tract.get('B19013_001E', 0)
                units = tract.get('B25003_001E', 0)
                renters = tract.get('B25003_003E', 0)
                
                if not isinstance(pop, (int, float)): pop = 0
                if not isinstance(age, (int, float)): age = 0
                if not isinstance(income, (int, float)): income = 0
                if not isinstance(units, (int, float)): units = 0
                if not isinstance(renters, (int, float)): renters = 0
                
                if age < 0: age = 0
                if income < 0: income = 0
                
                tract_demographics[geoid] = {
                    'Population': int(pop),
                    'Median Age': float(age),
                    'Median Household Income': float(income),
                    'Renter Units': float((renters / units * 100) if units > 0 else 0),
                }
        
        ad_tract_data[ad_id] = {
            'tracts': tract_geoids,
            'tract_demographics': tract_demographics
        }
        
        print(f"   ✅ AD {ad_id}: organized {len(tract_demographics)} tracts")
    
    print(f"   ✅ Organized tract data for {len(ad_tract_data)} assembly districts")
    
    return ad_tract_data


def save_data(ad_to_tracts, ad_demographics, ad_tract_data):
    """Save all generated data files."""
    print("\n💾 Saving data files...")
    
    base_dir = Path(__file__).parent.parent / "data"
    base_dir.mkdir(exist_ok=True)
    
    mapping_path = base_dir / "ad_tract_mapping.json"
    demographics_path = base_dir / "assembly_demographics.json"
    tract_data_path = base_dir / "assembly_tract_data.json"
    
    with open(mapping_path, 'w') as f:
        json.dump(ad_to_tracts, f, indent=2)
    print(f"   ✅ Saved tract mapping: {mapping_path}")
    
    with open(demographics_path, 'w') as f:
        json.dump(ad_demographics, f, indent=2)
    print(f"   ✅ Saved assembly demographics: {demographics_path}")
    
    with open(tract_data_path, 'w') as f:
        json.dump(ad_tract_data, f, indent=2)
    print(f"   ✅ Saved tract data: {tract_data_path}")


def main():
    print("=" * 70)
    print("🗺️  Census Tract to Assembly District Mapping")
    print("=" * 70)
    
    ads_gdf, tracts_gdf, raw_tract_data = load_data()
    
    ad_to_tracts = spatial_mapping(ads_gdf, tracts_gdf)
    
    ad_demographics = aggregate_assembly_demographics(ad_to_tracts, raw_tract_data)
    
    ad_tract_data = organize_tract_data_by_ad(ad_to_tracts, raw_tract_data)
    
    save_data(ad_to_tracts, ad_demographics, ad_tract_data)
    
    print("\n" + "=" * 70)
    print("✅ Assembly district mapping complete!")
    print("=" * 70)
    print("\n📋 Next steps:")
    print("   1. Review data/assembly_demographics.json for AD-level demographics")
    print("   2. Review data/assembly_tract_data.json for tract drill-down data")
    print("   3. Create API endpoints to serve this data")
    print("   4. Update frontend to use assembly district visualization")


if __name__ == "__main__":
    main()

