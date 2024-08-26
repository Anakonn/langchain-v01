---
translated: true
---

# Geopandas

[Geopandas](https://geopandas.org/en/stable/index.html) एक ओपन-सोर्स परियोजना है जो पायथन में भू-स्थानिक डेटा के साथ काम करना आसान बनाती है।

GeoPandas पैंडास द्वारा उपयोग किए जाने वाले डेटा प्रकारों का विस्तार करता है ताकि ज्यामितीय प्रकारों पर स्थानीय संचालन किए जा सकें।

ज्यामितीय संचालन शेपली द्वारा किए जाते हैं। Geopandas आगे फाइल एक्सेस के लिए फाइना और प्लॉटिंग के लिए मैटप्लॉट पर निर्भर करता है।

भू-स्थानिक डेटा का उपयोग करने वाले एलएलएम एप्लिकेशन (चैट, क्यूए) एक्सप्लोरेशन के लिए एक दिलचस्प क्षेत्र हैं।

```python
%pip install --upgrade --quiet  sodapy
%pip install --upgrade --quiet  pandas
%pip install --upgrade --quiet  geopandas
```

```python
import ast

import geopandas as gpd
import pandas as pd
from langchain_community.document_loaders import OpenCityDataLoader
```

[`Open City Data`](/docs/integrations/document_loaders/open_city_data) से एक GeoPandas डेटाफ्रेम बनाएं, उदाहरण के रूप में इनपुट के रूप में।

```python
# Load Open City Data
dataset = "tmnf-yvry"  # San Francisco crime data
loader = OpenCityDataLoader(city_id="data.sfgov.org", dataset_id=dataset, limit=5000)
docs = loader.load()
```

```python
# Convert list of dictionaries to DataFrame
df = pd.DataFrame([ast.literal_eval(d.page_content) for d in docs])

# Extract latitude and longitude
df["Latitude"] = df["location"].apply(lambda loc: loc["coordinates"][1])
df["Longitude"] = df["location"].apply(lambda loc: loc["coordinates"][0])

# Create geopandas DF
gdf = gpd.GeoDataFrame(
    df, geometry=gpd.points_from_xy(df.Longitude, df.Latitude), crs="EPSG:4326"
)

# Only keep valid longitudes and latitudes for San Francisco
gdf = gdf[
    (gdf["Longitude"] >= -123.173825)
    & (gdf["Longitude"] <= -122.281780)
    & (gdf["Latitude"] >= 37.623983)
    & (gdf["Latitude"] <= 37.929824)
]
```

एसएफ क्राइम डेटा के नमूने का दृश्यीकरण।

```python
import matplotlib.pyplot as plt

# Load San Francisco map data
sf = gpd.read_file("https://data.sfgov.org/resource/3psu-pn9h.geojson")

# Plot the San Francisco map and the points
fig, ax = plt.subplots(figsize=(10, 10))
sf.plot(ax=ax, color="white", edgecolor="black")
gdf.plot(ax=ax, color="red", markersize=5)
plt.show()
```

GeoPandas डेटाफ्रेम को एक `Document` के रूप में लोड करें जिसका उपयोग बाद के प्रोसेसिंग (एम्बेडिंग, चैट आदि) के लिए किया जा सकता है।

`geometry` डिफ़ॉल्ट `page_content` कॉलम होगा, और अन्य सभी कॉलम `metadata` में रखे जाएंगे।

लेकिन, हम `page_content_column` निर्दिष्ट कर सकते हैं।

```python
from langchain_community.document_loaders import GeoDataFrameLoader

loader = GeoDataFrameLoader(data_frame=gdf, page_content_column="geometry")
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='POINT (-122.420084075249 37.7083109744362)', metadata={'pdid': '4133422003074', 'incidntnum': '041334220', 'incident_code': '03074', 'category': 'ROBBERY', 'descript': 'ROBBERY, BODILY FORCE', 'dayofweek': 'Monday', 'date': '2004-11-22T00:00:00.000', 'time': '17:50', 'pddistrict': 'INGLESIDE', 'resolution': 'NONE', 'address': 'GENEVA AV / SANTOS ST', 'x': '-122.420084075249', 'y': '37.7083109744362', 'location': {'type': 'Point', 'coordinates': [-122.420084075249, 37.7083109744362]}, ':@computed_region_26cr_cadq': '9', ':@computed_region_rxqg_mtj9': '8', ':@computed_region_bh8s_q3mv': '309', ':@computed_region_6qbp_sg9q': nan, ':@computed_region_qgnn_b9vv': nan, ':@computed_region_ajp5_b2md': nan, ':@computed_region_yftq_j783': nan, ':@computed_region_p5aj_wyqh': nan, ':@computed_region_fyvs_ahh9': nan, ':@computed_region_6pnf_4xz7': nan, ':@computed_region_jwn9_ihcz': nan, ':@computed_region_9dfj_4gjx': nan, ':@computed_region_4isq_27mq': nan, ':@computed_region_pigm_ib2e': nan, ':@computed_region_9jxd_iqea': nan, ':@computed_region_6ezc_tdp2': nan, ':@computed_region_h4ep_8xdi': nan, ':@computed_region_n4xg_c4py': nan, ':@computed_region_fcz8_est8': nan, ':@computed_region_nqbw_i6c3': nan, ':@computed_region_2dwj_jsy4': nan, 'Latitude': 37.7083109744362, 'Longitude': -122.420084075249})
```
