---
translated: true
---

# Airbyte JSON (डिप्रीकेटेड)

नोट: `AirbyteJSONLoader` डिप्रीकेटेड है। कृपया [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) का उपयोग करें।

>[Airbyte](https://github.com/airbytehq/airbyte) एक डेटा एकीकरण प्लेटफॉर्म है जो API, डेटाबेस और फ़ाइलों से वेयरहाउस और लेक्स तक के ELT पाइपलाइन के लिए है। इसके पास डेटा वेयरहाउस और डेटाबेस के सबसे बड़े कैटलॉग के ELT कनेक्टर हैं।

यह कवर करता है कि किस तरह से Airbyte से किसी भी स्रोत को स्थानीय JSON फ़ाइल में लोड किया जा सकता है जिसे दस्तावेज़ के रूप में पढ़ा जा सकता है।

पूर्वापेक्षाएं:
डॉकर डेस्कटॉप स्थापित किया गया है

चरण:

1) GitHub से Airbyte क्लोन करें - `git clone https://github.com/airbytehq/airbyte.git`

2) Airbyte निर्देशिका में स्विच करें - `cd airbyte`

3) Airbyte शुरू करें - `docker compose up`

4) अपने ब्राउज़र में, बस http://localhost:8000 पर जाएं। आपसे उपयोगकर्ता नाम और पासवर्ड मांगा जाएगा। डिफ़ॉल्ट रूप से, वह उपयोगकर्ता नाम `airbyte` और पासवर्ड `password` है।

5) अपने इच्छित स्रोत को सेट करें।

6) स्थानीय JSON को गंतव्य के रूप में सेट करें, निर्दिष्ट गंतव्य पथ के साथ - कहें कि `/json_data`। मैनुअल सिंक सेट करें।

7) कनेक्शन चलाएं।

7) क्या फ़ाइलें बनाई गई हैं, यह देखने के लिए, आप यहां नेविगेट कर सकते हैं: `file:///tmp/airbyte_local`

8) अपना डेटा ढूंढें और पथ कॉपी करें। यह पथ फ़ाइल चर में सहेजा जाना चाहिए। यह `/tmp/airbyte_local` से शुरू होना चाहिए।

```python
from langchain_community.document_loaders import AirbyteJSONLoader
```

```python
!ls /tmp/airbyte_local/json_data/
```

```output
_airbyte_raw_pokemon.jsonl
```

```python
loader = AirbyteJSONLoader("/tmp/airbyte_local/json_data/_airbyte_raw_pokemon.jsonl")
```

```python
data = loader.load()
```

```python
print(data[0].page_content[:500])
```

```output
abilities:
ability:
name: blaze
url: https://pokeapi.co/api/v2/ability/66/

is_hidden: False
slot: 1


ability:
name: solar-power
url: https://pokeapi.co/api/v2/ability/94/

is_hidden: True
slot: 3

base_experience: 267
forms:
name: charizard
url: https://pokeapi.co/api/v2/pokemon-form/6/

game_indices:
game_index: 180
version:
name: red
url: https://pokeapi.co/api/v2/version/1/



game_index: 180
version:
name: blue
url: https://pokeapi.co/api/v2/version/2/



game_index: 180
version:
n
```
