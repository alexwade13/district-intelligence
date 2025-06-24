import boto3
import tempfile
import json
import pandas as pd

print("This sell sets the https://results.socialists.nyc/ website to VALID. If you are sure you want to do this, type 'VALID' in all caps.")

user_response = input("Response: ")

if user_response.strip() == "VALID":
    s3 = boto3.client("s3")
    with tempfile.NamedTemporaryFile("w+", suffix=".json", delete=True) as tmp:
        json.dump({
            "error": False,
            "last_updated": str(pd.Timestamp.now())
            }, tmp, indent=4)
        tmp.flush()
        s3.upload_file(
            tmp.name,
            "dsa-ewg-live-election-results",
            f"results/status.json",
            ExtraArgs={
                "ACL": "public-read",
                "CacheControl": "no-cache, no-store, must-revalidate",
            },
        )
else:
    print(f"You entered '{user_response}' which is not 'VALID', exiting...")