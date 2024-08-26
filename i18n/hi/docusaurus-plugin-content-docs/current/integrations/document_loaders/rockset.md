---
translated: true
---

# रॉकसेट

> रॉकसेट एक रियल-टाइम एनालिटिक्स डेटाबेस है जो बिना किसी ऑपरेशनल बोझ के विशाल, अर्ध-संरचित डेटा पर क्वेरी करने में सक्षम बनाता है। रॉकसेट के साथ, इंजेस्ट किया गया डेटा एक सेकंड के भीतर क्वेरी योग्य हो जाता है और उस डेटा पर विश्लेषणात्मक क्वेरी आमतौर पर मिलीसेकंड में निष्पादित होती हैं। रॉकसेट कंप्यूट-अनुकूलित है, जिससे यह 100TB रेंज (या 100 टीबी से अधिक के साथ रोलअप) में उच्च संचालन अनुप्रयोगों को सर्व करने के लिए उपयुक्त है।

यह नोटबुक दिखाता है कि लैंगचेन में एक दस्तावेज़ लोडर के रूप में रॉकसेट का उपयोग कैसे किया जाए। शुरू करने के लिए, सुनिश्चित करें कि आपके पास एक रॉकसेट खाता और एक API कुंजी उपलब्ध है।

## वातावरण सेट करना

1. [रॉकसेट कंसोल](https://console.rockset.com/apikeys) पर जाएं और एक API कुंजी प्राप्त करें। [API संदर्भ](https://rockset.com/docs/rest-api/#introduction) से अपने API क्षेत्र का पता लगाएं। इस नोटबुक के उद्देश्य के लिए, हम मान लेंगे कि आप `Oregon(us-west-2)` से रॉकसेट का उपयोग कर रहे हैं।
2. `ROCKSET_API_KEY` पर्यावरण चर सेट करें।
3. रॉकसेट पायथन क्लाइंट इंस्टॉल करें, जिसका उपयोग लैंगचेन द्वारा रॉकसेट डेटाबेस के साथ बातचीत करने के लिए किया जाएगा।

```python
%pip install --upgrade --quiet  rockset
```

# दस्तावेज़ लोड करना

लैंगचेन के साथ रॉकसेट एकीकरण आपको SQL क्वेरी के माध्यम से रॉकसेट संग्रह से दस्तावेज़ लोड करने की अनुमति देता है। ऐसा करने के लिए, आपको एक `RocksetLoader` ऑब्जेक्ट का निर्माण करना होगा। यहां एक उदाहरण स्निपेट है जो एक `RocksetLoader` को इनिशियलाइज़ करता है।

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 3"),  # SQL query
    ["text"],  # content columns
    metadata_keys=["id", "date"],  # metadata columns
)
```

यहां, आप देख सकते हैं कि निम्नलिखित क्वेरी चलाई जाती है:

```sql
SELECT * FROM langchain_demo LIMIT 3
```

संग्रह में `text` कॉलम को पृष्ठ सामग्री के रूप में उपयोग किया जाता है, और रिकॉर्ड के `id` और `date` कॉलम को मेटाडेटा के रूप में उपयोग किया जाता है (यदि आप `metadata_keys` में कुछ भी नहीं पास करते हैं, तो पूरा रॉकसेट दस्तावेज़ मेटाडेटा के रूप में उपयोग किया जाएगा)।

क्वेरी को निष्पादित करने और परिणामी `Document`s के एक इटरेटर तक पहुंचने के लिए, चलाएं:

```python
loader.lazy_load()
```

क्वेरी को निष्पादित करने और एक साथ सभी परिणामी `Document`s तक पहुंचने के लिए, चलाएं:

```python
loader.load()
```

`loader.load()` के एक उदाहरण प्रतिक्रिया यह है:

```python
[
    Document(
        page_content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a libero porta, dictum ipsum eget, hendrerit neque. Morbi blandit, ex ut suscipit viverra, enim velit tincidunt tellus, a tempor velit nunc et ex. Proin hendrerit odio nec convallis lobortis. Aenean in purus dolor. Vestibulum orci orci, laoreet eget magna in, commodo euismod justo.",
        metadata={"id": 83209, "date": "2022-11-13T18:26:45.000000Z"}
    ),
    Document(
        page_content="Integer at finibus odio. Nam sit amet enim cursus lacus gravida feugiat vestibulum sed libero. Aenean eleifend est quis elementum tincidunt. Curabitur sit amet ornare erat. Nulla id dolor ut magna volutpat sodales fringilla vel ipsum. Donec ultricies, lacus sed fermentum dignissim, lorem elit aliquam ligula, sed suscipit sapien purus nec ligula.",
        metadata={"id": 89313, "date": "2022-11-13T18:28:53.000000Z"}
    ),
    Document(
        page_content="Morbi tortor enim, commodo id efficitur vitae, fringilla nec mi. Nullam molestie faucibus aliquet. Praesent a est facilisis, condimentum justo sit amet, viverra erat. Fusce volutpat nisi vel purus blandit, et facilisis felis accumsan. Phasellus luctus ligula ultrices tellus tempor hendrerit. Donec at ultricies leo.",
        metadata={"id": 87732, "date": "2022-11-13T18:49:04.000000Z"}
    )
]
```

## कई कॉलम को सामग्री के रूप में उपयोग करना

आप कई कॉलम को सामग्री के रूप में उपयोग करने का चयन कर सकते हैं:

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],  # TWO content columns
)
```

"sentence1" फ़ील्ड `"This is the first sentence."` और "sentence2" फ़ील्ड `"This is the second sentence."` होने का मान लेते हुए, परिणामी `Document` का `page_content` होगा:

```output
This is the first sentence.
This is the second sentence.
```

आप `RocksetLoader` निर्माता में `content_columns_joiner` तर्क सेट करके अपना स्वयं का फ़ंक्शन सामग्री कॉलम को जोड़ने के लिए परिभाषित कर सकते हैं। `content_columns_joiner` एक ऐसी विधि है जो `List[Tuple[str, Any]]]` को तर्क के रूप में लेती है, जो कॉलम नाम और कॉलम मान के टुपल की एक सूची का प्रतिनिधित्व करती है। डिफ़ॉल्ट रूप से, यह एक ऐसी विधि है जो प्रत्येक कॉलम मान को एक नई लाइन के साथ जोड़ती है।

उदाहरण के लिए, यदि आप sentence1 और sentence2 को एक स्पेस के साथ जोड़ना चाहते हैं, तो आप `content_columns_joiner` को इस प्रकार सेट कर सकते हैं:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: " ".join(
        [doc[1] for doc in docs]
    ),  # join with space instead of /n
)
```

परिणामी `Document` का `page_content` इस प्रकार होगा:

```output
This is the first sentence. This is the second sentence.
```

अक्सर आप `page_content` में कॉलम नाम शामिल करना चाहते हैं। आप ऐसा इस प्रकार कर सकते हैं:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: "\n".join(
        [f"{doc[0]}: {doc[1]}" for doc in docs]
    ),
)
```

इससे निम्नलिखित `page_content` प्राप्त होगा:

```output
sentence1: This is the first sentence.
sentence2: This is the second sentence.
```
