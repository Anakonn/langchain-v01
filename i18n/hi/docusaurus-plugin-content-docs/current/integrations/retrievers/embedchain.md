---
translated: true
---

# Embedchain

>[Embedchain](https://github.com/embedchain/embedchain) एक डेटा पाइपलाइन बनाने के लिए एक RAG फ्रेमवर्क है। यह सभी डेटा को लोड, इंडेक्स, पुनः प्राप्त और समन्वयित करता है।
>
>यह एक [ओपन सोर्स पैकेज](https://github.com/embedchain/embedchain) के रूप में और एक [होस्टेड प्लेटफॉर्म समाधान](https://app.embedchain.ai/) के रूप में उपलब्ध है।

यह नोटबुक `Embedchain` का उपयोग करने वाले रिट्रीवर का प्रदर्शन करता है।

# स्थापना

पहले आपको [`embedchain` पैकेज](https://pypi.org/project/embedchain/) स्थापित करना होगा।

आप पैकेज को निम्नलिखित कमांड चलाकर स्थापित कर सकते हैं।

```python
%pip install --upgrade --quiet  embedchain
```

# नया रिट्रीवर बनाएं

`EmbedchainRetriever` में एक स्टैटिक `.create()` फैक्टरी मेथड है जो निम्नलिखित तर्कों को लेता है:

* `yaml_path: string` वैकल्पिक -- YAML कॉन्फ़िगरेशन फ़ाइल का पथ। यदि प्रदान नहीं किया गया है, तो एक डिफ़ॉल्ट कॉन्फ़िगरेशन का उपयोग किया जाता है। आप विभिन्न अनुकूलन विकल्पों का अन्वेषण करने के लिए [दस्तावेज़](https://docs.embedchain.ai/) ब्राउज़ कर सकते हैं।

```python
# Setup API Key

import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass()
```

```output
 ········
```

```python
from langchain_community.retrievers import EmbedchainRetriever

# create a retriever with default options
retriever = EmbedchainRetriever.create()

# or if you want to customize, pass the yaml config path
# retriever = EmbedchainRetiever.create(yaml_path="config.yaml")
```

# डेटा जोड़ें

Embedchain में, आप संभव सभी समर्थित डेटा प्रकारों को जोड़ सकते हैं। आप [दस्तावेज़](https://docs.embedchain.ai/) ब्राउज़ कर सकते हैं ताकि समर्थित डेटा प्रकारों को देख सकें।

Embedchain स्वचालित रूप से डेटा के प्रकारों का अनुमान लगाता है। इसलिए आप एक स्ट्रिंग, URL या स्थानीय फ़ाइल पथ जोड़ सकते हैं।

```python
retriever.add_texts(
    [
        "https://en.wikipedia.org/wiki/Elon_Musk",
        "https://www.forbes.com/profile/elon-musk",
        "https://www.youtube.com/watch?v=RcYjXbSJBN8",
    ]
)
```

```output
Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 4/4 [00:08<00:00,  2.22s/it]

Successfully saved https://en.wikipedia.org/wiki/Elon_Musk (DataType.WEB_PAGE). New chunks count: 378

Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:01<00:00,  1.17s/it]

Successfully saved https://www.forbes.com/profile/elon-musk (DataType.WEB_PAGE). New chunks count: 13

Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:02<00:00,  2.25s/it]

Successfully saved https://www.youtube.com/watch?v=RcYjXbSJBN8 (DataType.YOUTUBE_VIDEO). New chunks count: 53


```

```output
['1eab8dd1ffa92906f7fc839862871ca5',
 '8cf46026cabf9b05394a2658bd1fe890',
 'da3227cdbcedb018e05c47b774d625f6']
```

# रिट्रीवर का उपयोग करें

अब आप एक क्वेरी के आधार पर प्रासंगिक दस्तावेजों को खोजने के लिए रिट्रीवर का उपयोग कर सकते हैं।

```python
result = retriever.invoke("How many companies does Elon Musk run and name those?")
```

```python
result
```

```output
[Document(page_content='Views Filmography Companies Zip2 X.com PayPal SpaceX Starlink Tesla, Inc. Energycriticismlitigation OpenAI Neuralink The Boring Company Thud X Corp. Twitteracquisitiontenure as CEO xAI In popular culture Elon Musk (Isaacson) Elon Musk (Vance) Ludicrous Power Play "Members Only" "The Platonic Permutation" "The Musk Who Fell to Earth" "One Crew over the Crewcoo\'s Morty" Elon Musk\'s Crash Course Related Boring Test Tunnel Hyperloop Musk family Musk vs. Zuckerberg SolarCity Tesla Roadster in space', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'}),
 Document(page_content='Elon Musk PROFILEElon MuskCEO, Tesla$241.2B$508M (0.21%)Real Time Net Worthas of 11/18/23Reflects change since 5 pm ET of prior trading day. 1 in the world todayPhoto by Martin Schoeller for ForbesAbout Elon MuskElon Musk cofounded six companies, including electric car maker Tesla, rocket producer SpaceX and tunneling startup Boring Company.He owns about 21% of Tesla between stock and options, but has pledged more than half his shares as collateral for personal loans of up to $3.5', metadata={'source': 'https://www.forbes.com/profile/elon-musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3c8573134c575fafc025e9211413723e1f7a725b5936e8ee297fb7fb63bdd01a'}),
 Document(page_content='to form PayPal. In October 2002, eBay acquired PayPal for $1.5 billion, and that same year, with $100 million of the money he made, Musk founded SpaceX, a spaceflight services company. In 2004, he became an early investor in electric vehicle manufacturer Tesla Motors, Inc. (now Tesla, Inc.). He became its chairman and product architect, assuming the position of CEO in 2008. In 2006, Musk helped create SolarCity, a solar-energy company that was acquired by Tesla in 2016 and became Tesla Energy.', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'})]
```
