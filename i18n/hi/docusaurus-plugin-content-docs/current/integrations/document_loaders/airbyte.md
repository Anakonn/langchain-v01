---
translated: true
---

# AirbyteLoader

>[Airbyte](https://github.com/airbytehq/airbyte) एक डेटा एकीकरण प्लेटफ़ॉर्म है जो ELT पाइपलाइनों को APIs, डेटाबेस और फाइलों से वेयरहाउस और लेक तक ले जाता है। इसमें डेटा वेयरहाउस और डेटाबेस के लिए ELT कनेक्टर्स की सबसे बड़ी कैटलॉग है।

यह कवर करता है कि Airbyte से किसी भी स्रोत को LangChain दस्तावेज़ों में कैसे लोड किया जाए

## स्थापना

`AirbyteLoader` का उपयोग करने के लिए आपको `langchain-airbyte` एकीकरण पैकेज को स्थापित करना होगा।

```python
% pip install -qU langchain-airbyte
```

नोट: वर्तमान में, `airbyte` लाइब्रेरी Pydantic v2 का समर्थन नहीं करती है। कृपया इस पैकेज का उपयोग करने के लिए Pydantic v1 पर डाउनग्रेड करें।

नोट: इस पैकेज के लिए वर्तमान में Python 3.10+ की आवश्यकता है।

## दस्तावेज़ लोड करना

डिफ़ॉल्ट रूप से, `AirbyteLoader` किसी भी संरचित डेटा को एक स्ट्रीम से लोड करेगा और yaml-स्वरूपित दस्तावेज़ आउटपुट करेगा।

```python
from langchain_airbyte import AirbyteLoader

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
)
docs = loader.load()
print(docs[0].page_content[:500])
```

```yaml
academic_degree: PhD
address:
  city: Lauderdale Lakes
  country_code: FI
  postal_code: '75466'
  province: New Jersey
  state: Hawaii
  street_name: Stoneyford
  street_number: '1112'
age: 44
blood_type: "O\u2212"
created_at: '2004-04-02T13:05:27+00:00'
email: bread2099+1@outlook.com
gender: Fluid
height: '1.62'
id: 1
language: Belarusian
name: Moses
nationality: Dutch
occupation: Track Worker
telephone: 1-467-194-2318
title: M.Sc.Tech.
updated_at: '2024-02-27T16:41:01+00:00'
weight: 6
```

आप दस्तावेज़ों को स्वरूपित करने के लिए एक कस्टम प्रॉम्प्ट टेम्पलेट भी निर्दिष्ट कर सकते हैं:

```python
from langchain_core.prompts import PromptTemplate

loader_templated = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)
docs_templated = loader_templated.load()
print(docs_templated[0].page_content)
```

```output
My name is Verdie and I am 1.73 meters tall.
```

## लेज़ी लोडिंग दस्तावेज़

`AirbyteLoader` की सबसे शक्तिशाली विशेषताओं में से एक इसकी क्षमता है कि यह अपस्ट्रीम स्रोतों से बड़े दस्तावेज़ों को लोड कर सकता है। बड़े डेटासेट के साथ काम करते समय, डिफ़ॉल्ट `.load()` व्यवहार धीमा और मेमोरी-गहन हो सकता है। इससे बचने के लिए, आप `.lazy_load()` विधि का उपयोग कर सकते हैं ताकि दस्तावेज़ों को अधिक मेमोरी-कुशल तरीके से लोड किया जा सके।

```python
import time

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

start_time = time.time()
my_iterator = loader.lazy_load()
print(
    f"Just calling lazy load is quick! This took {time.time() - start_time:.4f} seconds"
)
```

```output
Just calling lazy load is quick! This took 0.0001 seconds
```

और आप दस्तावेज़ों को उस समय पुनरावृत्त कर सकते हैं जब उन्हें प्रकट किया जाता है:

```python
for doc in my_iterator:
    print(doc.page_content)
```

```output
My name is Andera and I am 1.91 meters tall.
My name is Jody and I am 1.85 meters tall.
My name is Zonia and I am 1.53 meters tall.
```

आप `.alazy_load()` के साथ असिंक्रोनस तरीके से दस्तावेज़ों को लेज़ी लोड भी कर सकते हैं:

```python
loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

my_async_iterator = loader.alazy_load()

async for doc in my_async_iterator:
    print(doc.page_content)
```

```output
My name is Carmelina and I am 1.74 meters tall.
My name is Ali and I am 1.90 meters tall.
My name is Rochell and I am 1.83 meters tall.
```

## विन्यास

`AirbyteLoader` को निम्नलिखित विकल्पों के साथ कॉन्फ़िगर किया जा सकता है:

- `source` (str, आवश्यक): Airbyte स्रोत का नाम जिससे लोड करना है।
- `stream` (str, आवश्यक): स्ट्रीम का नाम जिससे लोड करना है (Airbyte स्रोत कई स्ट्रीम वापस कर सकते हैं)
- `config` (dict, आवश्यक): Airbyte स्रोत के लिए विन्यास
- `template` (PromptTemplate, वैकल्पिक): दस्तावेज़ों को स्वरूपित करने के लिए एक कस्टम प्रॉम्प्ट टेम्पलेट
- `include_metadata` (bool, वैकल्पिक, डिफ़ॉल्ट True): क्या आउटपुट दस्तावेज़ों में सभी फ़ील्ड को मेटाडेटा के रूप में शामिल करना है

अधिकांश विन्यास `config` में होगा, और आप प्रत्येक स्रोत के लिए "Config field reference" में विशिष्ट विन्यास विकल्प पा सकते हैं [Airbyte documentation](https://docs.airbyte.com/integrations/) में।
