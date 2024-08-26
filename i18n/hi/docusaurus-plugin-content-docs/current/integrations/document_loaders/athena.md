---
translated: true
---

# अथीना

>[अमेज़न अथीना](https://aws.amazon.com/athena/) एक सर्वरलेस, इंटरैक्टिव एनालिटिक्स सर्विस है जो ओपन-सोर्स फ्रेमवर्क पर निर्मित है, जो ओपन-टेबल और फ़ाइल प्रारूपों का समर्थन करता है। `अथीना` एक सरल, लचीला तरीका प्रदान करता है पेटाबाइट डेटा का विश्लेषण करने के लिए जहां यह रहता है। एक अमेज़न सिंपल स्टोरेज सर्विस (एस3) डेटा लेक और 30 डेटा स्रोतों, जिनमें ऑन-प्रिमाइज़ डेटा स्रोत या अन्य क्लाउड सिस्टम शामिल हैं, का उपयोग करके डेटा का विश्लेषण करें या पायथन का उपयोग करके एप्लिकेशन बनाएं। `अथीना` ओपन-सोर्स `ट्रिनो` और `प्रेस्टो` इंजन और `Apache Spark` फ्रेमवर्क पर निर्मित है, जिसमें कोई प्रावधान या कॉन्फ़िगरेशन प्रयास की आवश्यकता नहीं है।

यह नोटबुक `AWS अथीना` से दस्तावेज़ लोड करने के बारे में चर्चा करता है।

## सेटअप करना

[एक AWS खाता सेट अप करने के लिए निर्देशों](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html) का पालन करें।

एक पायथन लाइब्रेरी इंस्टॉल करें:

```python
! pip install boto3
```

## उदाहरण

```python
from langchain_community.document_loaders.athena import AthenaLoader
```

```python
database_name = "my_database"
s3_output_path = "s3://my_bucket/query_results/"
query = "SELECT * FROM my_table"
profile_name = "my_profile"

loader = AthenaLoader(
    query=query,
    database=database_name,
    s3_output_uri=s3_output_path,
    profile_name=profile_name,
)

documents = loader.load()
print(documents)
```

मेटाडेटा कॉलम के साथ उदाहरण

```python
database_name = "my_database"
s3_output_path = "s3://my_bucket/query_results/"
query = "SELECT * FROM my_table"
profile_name = "my_profile"
metadata_columns = ["_row", "_created_at"]

loader = AthenaLoader(
    query=query,
    database=database_name,
    s3_output_uri=s3_output_path,
    profile_name=profile_name,
    metadata_columns=metadata_columns,
)

documents = loader.load()
print(documents)
```
