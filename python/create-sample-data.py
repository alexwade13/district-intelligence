import datetime
from datetime import timezone
import json
import urllib
import numpy as np
import pandas as pd

# load districts
sheet_id = '1nCooUVXPQSCV6asm0AXaksBpswvvxujiwm8VthPJBAY'
encoded_sheet_name = urllib.parse.quote('All Districts')
csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet={encoded_sheet_name}'
df = pd.read_csv(csv_url)

obj = {}
districts = {}
for district in df['district']:
	data = {}
	data['reporting'] = np.random.rand()
	candidates = {}
	candidates['Adrienne Adams'] = int(np.round(np.random.rand() * 10))
	candidates['Selma Bartholomew'] = int(np.round(np.random.rand() * 5))
	candidates['Michael Blake'] = int(np.round(np.random.rand() * 5))
	candidates['Andrew Cuomo'] = int(np.round(np.random.rand() * 30))
	candidates['Brad Lander'] = int(np.round(np.random.rand() * 10))
	candidates['Zohran Kwame Mamdani'] = int(np.round(np.random.rand() * 30))
	candidates['Zellnor Myrie'] = int(np.round(np.random.rand() * 5))
	candidates['Paperboy Prince'] = int(np.round(np.random.rand() * 1))
	candidates['Jessica Ramos'] = int(np.round(np.random.rand() * 5))
	candidates['Scott Stringer'] = int(np.round(np.random.rand() * 5))
	candidates['Whitney Tilson'] = int(np.round(np.random.rand() * 1))
	candidates['Write In'] = int(np.round(np.random.rand() * 1))
	data['total'] = sum(candidates.values())
	data['candidates'] = candidates
	districts[district] = data

obj['districts'] = districts
obj['reporting'] = np.random.rand()
obj['last_updated'] = str(datetime.datetime.now(timezone.utc))

with open('data/sample.json', 'w') as f:
	json.dump(obj, f)