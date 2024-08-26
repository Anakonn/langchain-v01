---
sidebar_class_name: hidden
title: सिंथेटिक डेटा जनरेशन
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/data_generation.ipynb)

## उपयोग मामला

सिंथेटिक डेटा कृत्रिम रूप से उत्पन्न किया गया डेटा है, वास्तविक दुनिया के घटनाओं से एकत्रित डेटा के बजाय। इसका उपयोग गोपनीयता को खतरे में डाले बिना या वास्तविक दुनिया की सीमाओं का सामना किए बिना वास्तविक डेटा को模拟करने के लिए किया जाता है।

सिंथेटिक डेटा के लाभ:

1. **गोपनीयता और सुरक्षा**: कोई वास्तविक व्यक्तिगत डेटा उल्लंघन का जोखिम नहीं है।
2. **डेटा वृद्धि**: मशीन लर्निंग के लिए डेटासेट का विस्तार करता है।
3. **लचीलापन**: विशिष्ट या दुर्लभ परिदृश्यों का निर्माण करता है।
4. **लागत प्रभावी**: अक्सर वास्तविक दुनिया के डेटा संग्रह से सस्ता होता है।
5. **विनियामक अनुपालन**: सख्त डेटा संरक्षण कानूनों का पालन करने में मदद करता है।
6. **मॉडल मजबूती**: बेहतर सामान्यीकरण वाले AI मॉडल का नेतृत्व कर सकता है।
7. **तेज़ प्रोटोटाइपिंग**: वास्तविक डेटा के बिना त्वरित परीक्षण को सक्षम बनाता है।
8. **नियंत्रित प्रयोग**: विशिष्ट स्थितियों का अनुकरण करता है।
9. **डेटा तक पहुंच**: जब वास्तविक डेटा उपलब्ध नहीं होता है तो एक वैकल्पिक।

नोट: लाभों के बावजूद, सिंथेटिक डेटा का सावधानी से उपयोग किया जाना चाहिए, क्योंकि यह हमेशा वास्तविक दुनिया की जटिलताओं को कैप्चर नहीं कर सकता है।

## त्वरित शुरुआत

इस नोटबुक में, हम langchain लाइब्रेरी का उपयोग करके सिंथेटिक मेडिकल बिलिंग रिकॉर्ड जनरेट करने में गहराई से जाएंगे। यह उपकरण विशेष रूप से उपयोगी है जब आप एल्गोरिदम विकसित या परीक्षण करना चाहते हैं लेकिन वास्तविक मरीज़ डेटा का उपयोग नहीं करना चाहते हैं क्योंकि गोपनीयता चिंताएं या डेटा उपलब्धता की समस्याएं हैं।

### सेटअप

पहले, आपको langchain लाइब्रेरी और इसकी निर्भरताओं को स्थापित करना होगा। चूंकि हम OpenAI जनरेटर श्रृंखला का उपयोग कर रहे हैं, हम उसे भी स्थापित करेंगे। चूंकि यह एक प्रयोगात्मक लाइब्रेरी है, हमें अपने स्थापना में `langchain_experimental` शामिल करना होगा। फिर हम आवश्यक मॉड्यूल आयात करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain_experimental langchain-openai
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()

from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_core.pydantic_v1 import BaseModel
from langchain_experimental.tabular_synthetic_data.openai import (
    OPENAI_TEMPLATE,
    create_openai_data_generator,
)
from langchain_experimental.tabular_synthetic_data.prompts import (
    SYNTHETIC_FEW_SHOT_PREFIX,
    SYNTHETIC_FEW_SHOT_SUFFIX,
)
from langchain_openai import ChatOpenAI
```

## 1. अपने डेटा मॉडल को परिभाषित करें

प्रत्येक डेटासेट में एक संरचना या "स्कीमा" होती है। नीचे दिया गया MedicalBilling क्लास हमारे सिंथेटिक डेटा के लिए स्कीमा के रूप में कार्य करता है। इसे परिभाषित करके, हम अपने सिंथेटिक डेटा जनरेटर को उस डेटा के आकार और प्रकृति के बारे में सूचित कर रहे हैं जिसकी हमें उम्मीद है।

```python
class MedicalBilling(BaseModel):
    patient_id: int
    patient_name: str
    diagnosis_code: str
    procedure_code: str
    total_charge: float
    insurance_claim_amount: float
```

उदाहरण के लिए, प्रत्येक रिकॉर्ड में एक `patient_id` होगा जो एक पूर्णांक है, एक `patient_name` होगा जो एक स्ट्रिंग है, और इसी तरह।

## 2. नमूना डेटा

सिंथेटिक डेटा जनरेटर को मार्गदर्शन करने के लिए, यह उपयोगी है कि आप कुछ वास्तविक दुनिया जैसे उदाहरण प्रदान करें। ये उदाहरण "बीज" के रूप में कार्य करते हैं - वे उस प्रकार के डेटा का प्रतिनिधित्व करते हैं जिसे आप चाहते हैं, और जनरेटर इन्हें और अधिक समान दिखने वाला डेटा बनाने के लिए उपयोग करेगा।

यहाँ कुछ काल्पनिक मेडिकल बिलिंग रिकॉर्ड हैं:

```python
examples = [
    {
        "example": """Patient ID: 123456, Patient Name: John Doe, Diagnosis Code:
        J20.9, Procedure Code: 99203, Total Charge: $500, Insurance Claim Amount: $350"""
    },
    {
        "example": """Patient ID: 789012, Patient Name: Johnson Smith, Diagnosis
        Code: M54.5, Procedure Code: 99213, Total Charge: $150, Insurance Claim Amount: $120"""
    },
    {
        "example": """Patient ID: 345678, Patient Name: Emily Stone, Diagnosis Code:
        E11.9, Procedure Code: 99214, Total Charge: $300, Insurance Claim Amount: $250"""
    },
]
```

## 3. एक प्रोम्प्ट टेम्प्लेट बनाएं

जनरेटर हमारा डेटा बनाने का जादू नहीं जानता; हमें इसका मार्गदर्शन करने की आवश्यकता है। हम एक प्रोम्प्ट टेम्प्लेट बनाकर ऐसा करते हैं। यह टेम्प्लेट अंतर्निहित भाषा मॉडल को इस इच्छित प्रारूप में सिंथेटिक डेटा उत्पन्न करने के लिए निर्देशित करने में मदद करता है।

```python
OPENAI_TEMPLATE = PromptTemplate(input_variables=["example"], template="{example}")

prompt_template = FewShotPromptTemplate(
    prefix=SYNTHETIC_FEW_SHOT_PREFIX,
    examples=examples,
    suffix=SYNTHETIC_FEW_SHOT_SUFFIX,
    input_variables=["subject", "extra"],
    example_prompt=OPENAI_TEMPLATE,
)
```

`FewShotPromptTemplate` में शामिल हैं:

- `prefix` और `suffix`: ये संभवतः मार्गदर्शक संदर्भ या निर्देश हैं।
- `examples`: हमने पहले परिभाषित किए गए नमूना डेटा।
- `input_variables`: ये चर ("subject", "extra") आप बाद में गतिशील रूप से भर सकते हैं। उदाहरण के लिए, "subject" को "medical_billing" से भरा जा सकता है ताकि मॉडल को और अधिक मार्गदर्शन मिले।
- `example_prompt`: यह प्रोम्प्ट टेम्प्लेट वह प्रारूप है जिसे हम अपने प्रोम्प्ट में प्रत्येक उदाहरण पंक्ति लेना चाहते हैं।

## 4. डेटा जनरेटर बनाना

स्कीमा और प्रोम्प्ट तैयार होने के बाद, अगला कदम डेटा जनरेटर बनाना है। यह ऑब्जेक्ट अंतर्निहित भाषा मॉडल के साथ संवाद करने का तरीका जानता है ताकि सिंथेटिक डेटा प्राप्त किया जा सके।

```python
synthetic_data_generator = create_openai_data_generator(
    output_schema=MedicalBilling,
    llm=ChatOpenAI(
        temperature=1
    ),  # You'll need to replace with your actual Language Model instance
    prompt=prompt_template,
)
```

## 5. सिंथेटिक डेटा जनरेट करें

अंत में, आइए अपना सिंथेटिक डेटा प्राप्त करें!

```python
synthetic_results = synthetic_data_generator.generate(
    subject="medical_billing",
    extra="the name must be chosen at random. Make it something you wouldn't normally choose.",
    runs=10,
)
```

यह कमांड जनरेटर से 10 सिंथेटिक मेडिकल बिलिंग रिकॉर्ड उत्पन्न करने का अनुरोध करती है। परिणाम `synthetic_results` में संग्रहीत किए जाते हैं। आउटपुट MedicalBilling पाइडेंटिक मॉडल की एक सूची होगी।

### अन्य कार्यान्वयन

```python
from langchain_experimental.synthetic_data import (
    DatasetGenerator,
    create_data_generation_chain,
)
from langchain_openai import ChatOpenAI
```

```python
# LLM
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
chain = create_data_generation_chain(model)
```

```python
chain({"fields": ["blue", "yellow"], "preferences": {}})
```

```output
{'fields': ['blue', 'yellow'],
 'preferences': {},
 'text': 'The vibrant blue sky contrasted beautifully with the bright yellow sun, creating a stunning display of colors that instantly lifted the spirits of all who gazed upon it.'}
```

```python
chain(
    {
        "fields": {"colors": ["blue", "yellow"]},
        "preferences": {"style": "Make it in a style of a weather forecast."},
    }
)
```

```output
{'fields': {'colors': ['blue', 'yellow']},
 'preferences': {'style': 'Make it in a style of a weather forecast.'},
 'text': "Good morning! Today's weather forecast brings a beautiful combination of colors to the sky, with hues of blue and yellow gently blending together like a mesmerizing painting."}
```

```python
chain(
    {
        "fields": {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
        "preferences": None,
    }
)
```

```output
{'fields': {'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
 'preferences': None,
 'text': 'Tom Hanks, the renowned actor known for his incredible versatility and charm, has graced the silver screen in unforgettable movies such as "Forrest Gump" and "Green Mile".'}
```

```python
chain(
    {
        "fields": [
            {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
            {"actor": "Mads Mikkelsen", "movies": ["Hannibal", "Another round"]},
        ],
        "preferences": {"minimum_length": 200, "style": "gossip"},
    }
)
```

```output
{'fields': [{'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
  {'actor': 'Mads Mikkelsen', 'movies': ['Hannibal', 'Another round']}],
 'preferences': {'minimum_length': 200, 'style': 'gossip'},
 'text': 'Did you know that Tom Hanks, the beloved Hollywood actor known for his roles in "Forrest Gump" and "Green Mile", has shared the screen with the talented Mads Mikkelsen, who gained international acclaim for his performances in "Hannibal" and "Another round"? These two incredible actors have brought their exceptional skills and captivating charisma to the big screen, delivering unforgettable performances that have enthralled audiences around the world. Whether it\'s Hanks\' endearing portrayal of Forrest Gump or Mikkelsen\'s chilling depiction of Hannibal Lecter, these movies have solidified their places in cinematic history, leaving a lasting impact on viewers and cementing their status as true icons of the silver screen.'}
```

जैसा कि हम देख सकते हैं, बनाए गए उदाहरण विविध हैं और उन जानकारियों को प्रस्तुत करते हैं जिन्हें हम उनमें देखना चाहते थे। साथ ही, उनका शैली भी दिए गए प्राथमिकताओं को काफी अच्छी तरह से प्रतिबिंबित करती है।

## निष्कर्षण बेंचमार्किंग उद्देश्यों के लिए उदाहरण डेटासेट का उत्पादन

```python
inp = [
    {
        "Actor": "Tom Hanks",
        "Film": [
            "Forrest Gump",
            "Saving Private Ryan",
            "The Green Mile",
            "Toy Story",
            "Catch Me If You Can",
        ],
    },
    {
        "Actor": "Tom Hardy",
        "Film": [
            "Inception",
            "The Dark Knight Rises",
            "Mad Max: Fury Road",
            "The Revenant",
            "Dunkirk",
        ],
    },
]

generator = DatasetGenerator(model, {"style": "informal", "minimal length": 500})
dataset = generator(inp)
```

```python
dataset
```

```output
[{'fields': {'Actor': 'Tom Hanks',
   'Film': ['Forrest Gump',
    'Saving Private Ryan',
    'The Green Mile',
    'Toy Story',
    'Catch Me If You Can']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hanks, the versatile and charismatic actor, has graced the silver screen in numerous iconic films including the heartwarming and inspirational "Forrest Gump," the intense and gripping war drama "Saving Private Ryan," the emotionally charged and thought-provoking "The Green Mile," the beloved animated classic "Toy Story," and the thrilling and captivating true story adaptation "Catch Me If You Can." With his impressive range and genuine talent, Hanks continues to captivate audiences worldwide, leaving an indelible mark on the world of cinema.'},
 {'fields': {'Actor': 'Tom Hardy',
   'Film': ['Inception',
    'The Dark Knight Rises',
    'Mad Max: Fury Road',
    'The Revenant',
    'Dunkirk']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hardy, the versatile actor known for his intense performances, has graced the silver screen in numerous iconic films, including "Inception," "The Dark Knight Rises," "Mad Max: Fury Road," "The Revenant," and "Dunkirk." Whether he\'s delving into the depths of the subconscious mind, donning the mask of the infamous Bane, or navigating the treacherous wasteland as the enigmatic Max Rockatansky, Hardy\'s commitment to his craft is always evident. From his breathtaking portrayal of the ruthless Eames in "Inception" to his captivating transformation into the ferocious Max in "Mad Max: Fury Road," Hardy\'s dynamic range and magnetic presence captivate audiences and leave an indelible mark on the world of cinema. In his most physically demanding role to date, he endured the harsh conditions of the freezing wilderness as he portrayed the rugged frontiersman John Fitzgerald in "The Revenant," earning him critical acclaim and an Academy Award nomination. In Christopher Nolan\'s war epic "Dunkirk," Hardy\'s stoic and heroic portrayal of Royal Air Force pilot Farrier showcases his ability to convey deep emotion through nuanced performances. With his chameleon-like ability to inhabit a wide range of characters and his unwavering commitment to his craft, Tom Hardy has undoubtedly solidified his place as one of the most talented and sought-after actors of his generation.'}]
```

## उत्पन्न उदाहरणों से निष्कर्षण

ठीक है, आइए देखें कि क्या हम अब इस उत्पन्न डेटा से आउटपुट निकाल सकते हैं और यह हमारे मामले के साथ कैसे तुलना करता है!

```python
from typing import List

from langchain.chains import create_extraction_chain_pydantic
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from pydantic import BaseModel, Field
```

```python
class Actor(BaseModel):
    Actor: str = Field(description="name of an actor")
    Film: List[str] = Field(description="list of names of films they starred in")
```

### पार्सर

```python
llm = OpenAI()
parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Extract fields from a given text.\n{format_instructions}\n{text}\n",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

_input = prompt.format_prompt(text=dataset[0]["text"])
output = llm.invoke(_input.to_string())

parsed = parser.parse(output)
parsed
```

```output
Actor(Actor='Tom Hanks', Film=['Forrest Gump', 'Saving Private Ryan', 'The Green Mile', 'Toy Story', 'Catch Me If You Can'])
```

```python
(parsed.Actor == inp[0]["Actor"]) & (parsed.Film == inp[0]["Film"])
```

```output
True
```

### एक्सट्रैक्टर

```python
extractor = create_extraction_chain_pydantic(pydantic_schema=Actor, llm=model)
extracted = extractor.run(dataset[1]["text"])
extracted
```

```output
[Actor(Actor='Tom Hardy', Film=['Inception', 'The Dark Knight Rises', 'Mad Max: Fury Road', 'The Revenant', 'Dunkirk'])]
```

```python
(extracted[0].Actor == inp[1]["Actor"]) & (extracted[0].Film == inp[1]["Film"])
```

```output
True
```
