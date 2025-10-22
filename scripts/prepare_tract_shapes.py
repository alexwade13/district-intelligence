#!/usr/bin/env python3
"""
Convert census tracts GeoJSON to the format needed for the web app.
Adds sequential IDs and copies to public/shapes/
"""
import json
import sys

def prepare_tract_shapes():
    print("📂 Loading census tracts GeoJSON...")
    
    # Load the census tracts
    input_path = "geometry/raw/census_tracts_nyc.geojson"
    output_path = "public/shapes/census-tracts.json"
    
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    print(f"   Loaded {len(data['features'])} census tracts")
    
    # Add sequential IDs to each feature
    for i, feature in enumerate(data['features']):
        feature['id'] = i
        # Ensure GEOID is in properties for easy access
        if 'GEOID' not in feature['properties']:
            feature['properties']['GEOID'] = feature['properties'].get('GEOID20', 'unknown')
    
    print(f"   Added IDs to all features")
    
    # Save to public/shapes
    with open(output_path, 'w') as f:
        json.dump(data, f)
    
    print(f"✅ Saved to {output_path}")
    print(f"📊 Total tracts: {len(data['features'])}")
    
    # Also create a mapping file for quick GEOID -> ID lookups
    mapping = {}
    for feature in data['features']:
        geoid = feature['properties']['GEOID']
        mapping[geoid] = feature['id']
    
    mapping_path = "data/tract_id_mapping.json"
    with open(mapping_path, 'w') as f:
        json.dump(mapping, f, indent=2)
    
    print(f"✅ Saved ID mapping to {mapping_path}")

if __name__ == "__main__":
    prepare_tract_shapes()

