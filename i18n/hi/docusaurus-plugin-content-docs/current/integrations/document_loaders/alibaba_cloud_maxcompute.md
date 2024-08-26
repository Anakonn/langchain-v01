---
translated: true
---

# अलीबाबा क्लाउड मैक्सकंप्यूट

>[अलीबाबा क्लाउड मैक्सकंप्यूट](https://www.alibabacloud.com/product/maxcompute) (पहले ODPS के रूप में जाना जाता था) एक सामान्य उद्देश्य, पूरी तरह से प्रबंधित, बहु-किरायेदार डेटा प्रोसेसिंग प्लेटफॉर्म है जो बड़े पैमाने पर डेटा वेयरहाउसिंग के लिए है। मैक्सकंप्यूट विभिन्न डेटा आयात समाधानों और वितरित कंप्यूटिंग मॉडलों का समर्थन करता है, जिससे उपयोगकर्ता विशाल डेटासेट को प्रभावी ढंग से क्वेरी कर सकते हैं, उत्पादन लागत को कम कर सकते हैं और डेटा सुरक्षा सुनिश्चित कर सकते हैं।

`MaxComputeLoader` आपको एक मैक्सकंप्यूट एसक्यूएल क्वेरी निष्पादित करने और परिणामों को एक दस्तावेज़ प्रति पंक्ति के रूप में लोड करने देता है।

```python
%pip install --upgrade --quiet  pyodps
```

```output
Collecting pyodps
  Downloading pyodps-0.11.4.post0-cp39-cp39-macosx_10_9_universal2.whl (2.0 MB)
[2K     [90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m2.0/2.0 MB[0m [31m1.7 MB/s[0m eta [36m0:00:00[0m00:01[0m00:01[0m0m
[?25hRequirement already satisfied: charset-normalizer>=2 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (3.1.0)
Requirement already satisfied: urllib3<2.0,>=1.26.0 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (1.26.15)
Requirement already satisfied: idna>=2.5 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (3.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/newboy/anaconda3/envs/langchain/lib/python3.9/site-packages (from pyodps) (2023.5.7)
Installing collected packages: pyodps
Successfully installed pyodps-0.11.4.post0
```

## मूलभूत उपयोग

लोडर को इंस्टैंशिएट करने के लिए आपको एक निष्पादित करने के लिए एसक्यूएल क्वेरी, आपका मैक्सकंप्यूट एंडपॉइंट और प्रोजेक्ट नाम, और आप एक्सेस आईडी और सीक्रेट एक्सेस कुंजी की आवश्यकता होगी। एक्सेस आईडी और सीक्रेट एक्सेस कुंजी को या तो `access_id` और `secret_access_key` पैरामीटरों के माध्यम से सीधे पास किया जा सकता है या उन्हें `MAX_COMPUTE_ACCESS_ID` और `MAX_COMPUTE_SECRET_ACCESS_KEY` के रूप में पर्यावरण चर के रूप में सेट किया जा सकता है।

```python
from langchain_community.document_loaders import MaxComputeLoader
```

```python
base_query = """
SELECT *
FROM (
    SELECT 1 AS id, 'content1' AS content, 'meta_info1' AS meta_info
    UNION ALL
    SELECT 2 AS id, 'content2' AS content, 'meta_info2' AS meta_info
    UNION ALL
    SELECT 3 AS id, 'content3' AS content, 'meta_info3' AS meta_info
) mydata;
"""
```

```python
endpoint = "<ENDPOINT>"
project = "<PROJECT>"
ACCESS_ID = "<ACCESS ID>"
SECRET_ACCESS_KEY = "<SECRET ACCESS KEY>"
```

```python
loader = MaxComputeLoader.from_params(
    base_query,
    endpoint,
    project,
    access_id=ACCESS_ID,
    secret_access_key=SECRET_ACCESS_KEY,
)
data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='id: 1\ncontent: content1\nmeta_info: meta_info1', metadata={}), Document(page_content='id: 2\ncontent: content2\nmeta_info: meta_info2', metadata={}), Document(page_content='id: 3\ncontent: content3\nmeta_info: meta_info3', metadata={})]
```

```python
print(data[0].page_content)
```

```output
id: 1
content: content1
meta_info: meta_info1
```

```python
print(data[0].metadata)
```

```output
{}
```

## कॉलम को सामग्री बनाम मेटाडेटा के रूप में निर्दिष्ट करना

आप `page_content_columns` और `metadata_columns` पैरामीटरों का उपयोग करके कॉलम के उस उपसेट को कॉन्फ़िगर कर सकते हैं जिसे दस्तावेज़ के सामग्री और मेटाडेटा के रूप में लोड किया जाना चाहिए।

```python
loader = MaxComputeLoader.from_params(
    base_query,
    endpoint,
    project,
    page_content_columns=["content"],  # Specify Document page content
    metadata_columns=["id", "meta_info"],  # Specify Document metadata
    access_id=ACCESS_ID,
    secret_access_key=SECRET_ACCESS_KEY,
)
data = loader.load()
```

```python
print(data[0].page_content)
```

```output
content: content1
```

```python
print(data[0].metadata)
```

```output
{'id': 1, 'meta_info': 'meta_info1'}
```
