import json
import urllib
import pandas as pd
import geopandas as gpd
from shapely.geometry import mapping

def to_geojson_with_ids(gdf, name, path):
    gdf = gdf.to_crs('EPSG:4326')

    features = []
    for i, row in gdf.iterrows():
        feature = {
            'type': 'Feature',
            'id': int(row[name]),
            'properties': {k: v for k, v in row.items() if k not in ['geometry']},
            'geometry': mapping(row.geometry),
        }
        features.append(feature)

    geojson = {
        'type': 'FeatureCollection',
        'name': name,
        'crs': {
            'type': 'name',
            'properties': {'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'},
        },
        'features': features,
    }

    with open(path, 'w') as f:
        json.dump(geojson, f)

# load the metadata
sheet_id = '1nCooUVXPQSCV6asm0AXaksBpswvvxujiwm8VthPJBAY'
encoded_sheet_name = urllib.parse.quote(f'All Districts')
csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet={encoded_sheet_name}'
df = pd.read_csv(csv_url)

df.set_index(df.columns[0], inplace=True)
df['id'] = df.index
df = df[['borough', 'id']]
df.to_json(f'data/shapes/election_districts.json', orient='index')

df = pd.read_csv(csv_url)

grouped = df.groupby('assembly_district').agg({'borough': 'first'})
grouped['id'] = grouped.index
grouped.to_json(f'data/shapes/assembly_districts.json', orient='index')

# load the geometry
geojson_path = 'geometry/raw/districts-all-25b.geojson'
gdf = gpd.read_file(geojson_path)
gdf.rename(columns={'ElectDist': 'election_district'}, inplace=True)

# merge the datasets
gdf = gdf.merge(df, on='election_district')

# save out the filtered districts
election_districts = gdf[['election_district', 'geometry']].copy()
election_districts['election_district'] = election_districts['election_district'].astype(str)
election_districts = election_districts.rename(columns={'election_district': 'election-district'})
to_geojson_with_ids(
    election_districts,
    'election-district',
    f'public/shapes/election-districts.json',
)

# save out shapes dissolved by borough
assembly_districts = gdf.dissolve(by='assembly_district', as_index=False)[['assembly_district', 'geometry']].copy()
assembly_districts = assembly_districts.rename(columns={'assembly_district': 'assembly-district'})
assembly_districts.set_crs('EPSG:4326', inplace=True)
to_geojson_with_ids(
    assembly_districts,
    'assembly-district',
    f'public/shapes/assembly-districts.json',
)

