import datetime
from datetime import timezone
import json
import urllib
import numpy as np
import pandas as pd
from utils import *

# load districts
df = get_per_ed_results("https://enr.boenyc.gov/CD27280AD0.html", format='df')
json.dump(get_nested_dict(pd.DataFrame({
    "ED": df.ED,
    "AD": df.AD,
    "ElectDist": df.ElectDist,
    "Reported %": np.random.rand(len(df)),
    "Adrienne Adams": np.round(np.random.rand(len(df)) * 10),
    "Andrew Cuomo": np.round(np.random.rand(len(df)) * 100),
    "Zohran Mamdani": np.round(np.random.rand(len(df)) * 100),
    "WRITE-IN": np.round(np.random.rand(len(df)) * 5),
})), open('data/cache/Mayoral (Democratic).json', 'w'), indent=4)