#!/usr/bin/env python3
"""
Download NYC Assembly District boundaries from NYC Open Data.
Filters to NYC assembly districts (23-87) and saves as GeoJSON.
"""

import geopandas as gpd
import requests
from pathlib import Path
import sys

def download_assembly_districts():
    """Download assembly district boundaries from Census TIGER/Line."""
    
    print("🏛️ Downloading NYC Assembly District boundaries...")
    
    url = "https://www2.census.gov/geo/tiger/TIGER2023/SLDL/tl_2023_36_sldl.zip"
    output_dir = Path(__file__).parent.parent / "geometry" / "raw"
    output_path = output_dir / "assembly_districts_nyc.geojson"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        print(f"   📡 Fetching from Census TIGER/Line (NY State Lower Districts)...")
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        
        import zipfile
        import tempfile
        
        print(f"   📦 Extracting ZIP file...")
        with tempfile.TemporaryDirectory() as tmpdir:
            zip_path = Path(tmpdir) / "assembly.zip"
            with open(zip_path, 'wb') as f:
                f.write(response.content)
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(tmpdir)
            
            print(f"   📂 Loading shapefile data...")
            gdf = gpd.read_file(tmpdir)
        
        print(f"   📊 Original data: {len(gdf)} assembly districts")
        print(f"   📊 Columns: {list(gdf.columns)}")
        
        ad_column = None
        for col in ['SLDLST', 'NAMELSAD', 'NAME']:
            if col in gdf.columns:
                ad_column = col
                break
        
        if not ad_column:
            print(f"   ⚠️  Could not find assembly district ID column. Available columns: {list(gdf.columns)}")
            print(f"   💾 Saving all districts without filtering...")
            gdf.to_file(output_path, driver='GeoJSON')
        else:
            print(f"   ✅ Found assembly district column: {ad_column}")
            
            gdf['ad_num'] = gdf['SLDLST'].astype(int)
            nyc_gdf = gdf[(gdf['ad_num'] >= 23) & (gdf['ad_num'] <= 87)].copy()
            
            nyc_gdf['AssemDist'] = nyc_gdf['ad_num']
            
            print(f"   🗽 Filtered to NYC assembly districts (23-87): {len(nyc_gdf)} districts")
            
            nyc_gdf.to_file(output_path, driver='GeoJSON')
        
        print(f"   💾 Saved to: {output_path}")
        print(f"   ✅ Assembly district boundaries downloaded successfully!")
        
        return output_path
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error downloading data: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"   ❌ Error processing data: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_assembly_districts()

