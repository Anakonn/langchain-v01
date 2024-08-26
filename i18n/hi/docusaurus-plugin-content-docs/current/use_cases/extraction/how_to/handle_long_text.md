---
sidebar_position: 2
title: लंबे पाठ्य को संभालना
translated: true
---

जब आप फ़ाइलों, जैसे PDF, के साथ काम कर रहे हों, तो आप अपने भाषा मॉडल के संदर्भ विंडो से अधिक पाठ्य मिल सकता है। इस पाठ्य को प्रक्रिया करने के लिए, इन रणनीतियों पर विचार करें:

1. **एलएलएम बदलें** एक अलग एलएलएम चुनें जो एक बड़ी संदर्भ विंडो का समर्थन करता है।
2. **ब्रूट फोर्स** दस्तावेज़ को टुकड़ों में बांटें, और प्रत्येक टुकड़े से सामग्री निकालें।
3. **RAG** दस्तावेज़ को टुकड़ों में बांटें, टुकड़ों को सूचीबद्ध करें, और केवल उन टुकड़ों से सामग्री निकालें जो "प्रासंगिक" लगते हैं।

याद रखें कि इन रणनीतियों में अलग-अलग ट्रेड-ऑफ हैं और सबसे अच्छी रणनीति संभवतः आप डिज़ाइन कर रहे अनुप्रयोग पर निर्भर करती है!

## सेट अप करना

हमें कुछ उदाहरण डेटा की आवश्यकता है! चलो [कारों पर विकिपीडिया](https://en.wikipedia.org/wiki/Car) से एक लेख डाउनलोड करें और इसे एक LangChain `Document` के रूप में लोड करें।

```python
import re

import requests
from langchain_community.document_loaders import BSHTMLLoader

# Download the content
response = requests.get("https://en.wikipedia.org/wiki/Car")
# Write it to a file
with open("car.html", "w", encoding="utf-8") as f:
    f.write(response.text)
# Load it with an HTML parser
loader = BSHTMLLoader("car.html")
document = loader.load()[0]
# Clean up code
# Replace consecutive new lines with a single new line
document.page_content = re.sub("\n\n+", "\n", document.page_content)
```

```python
print(len(document.page_content))
```

```output
78967
```

## स्कीमा को परिभाषित करें

यहां, हम पाठ्य से प्रमुख विकास को निकालने के लिए एक स्कीमा परिभाषित करेंगे।

```python
from typing import List, Optional

from langchain.chains import create_structured_output_runnable
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class KeyDevelopment(BaseModel):
    """Information about a development in the history of cars."""

    # ^ Doc-string for the entity KeyDevelopment.
    # This doc-string is sent to the LLM as the description of the schema KeyDevelopment,
    # and it can help to improve extraction results.
    # Note that all fields are required rather than optional!
    year: int = Field(
        ..., description="The year when there was an important historic development."
    )
    description: str = Field(
        ..., description="What happened in this year? What was the development?"
    )
    evidence: str = Field(
        ...,
        description="Repeat in verbatim the sentence(s) from which the year and description information were extracted",
    )


class ExtractionData(BaseModel):
    """Extracted information about key developments in the history of cars."""

    key_developments: List[KeyDevelopment]


# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert at identifying key historic development in text. "
            "Only extract important historic developments. Extract nothing if no important information can be found in the text.",
        ),
        # MessagesPlaceholder('examples'), # Keep on reading through this use case to see how to use examples to improve performance
        ("human", "{text}"),
    ]
)


# We will be using tool calling mode, which
# requires a tool calling capable model.
llm = ChatOpenAI(
    # Consider benchmarking with a good model to get
    # a sense of the best possible quality.
    model="gpt-4-0125-preview",
    # Remember to set the temperature to 0 for extractions!
    temperature=0,
)

extractor = prompt | llm.with_structured_output(
    schema=ExtractionData,
    method="function_calling",
    include_raw=False,
)
```

```output
/home/eugene/.pyenv/versions/3.11.2/envs/langchain_3_11/lib/python3.11/site-packages/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

## ब्रूट फोर्स दृष्टिकोण

ऐसे टुकड़ों में दस्तावेज़ को विभाजित करें कि प्रत्येक टुकड़ा एलएलएम के संदर्भ विंडो में समायोजित हो जाए।

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(
    # Controls the size of each chunk
    chunk_size=2000,
    # Controls overlap between chunks
    chunk_overlap=20,
)

texts = text_splitter.split_text(document.page_content)
```

प्रत्येक टुकड़े पर निष्कर्षण को **समानांतर** रूप से चलाने के लिए `.batch` कार्यक्षमता का उपयोग करें!

:::tip
आप अक्सर .batch() का उपयोग करके निष्कर्षण को समानांतर करने में मदद कर सकते हैं! `batch` एक थ्रेड पूल का उपयोग करता है जो आपको कार्यभार को समानांतर करने में मदद करता है।

यदि आपका मॉडल एक एपीआई के माध्यम से उपलब्ध है, तो यह आपके निष्कर्षण प्रवाह को तेज़ कर देगा!
:::

```python
# Limit just to the first 3 chunks
# so the code can be re-run quickly
first_few = texts[:3]

extractions = extractor.batch(
    [{"text": text} for text in first_few],
    {"max_concurrency": 5},  # limit the concurrency by passing max concurrency!
)
```

### परिणाम को मर्ज करें

टुकड़ों से डेटा निकालने के बाद, हम निष्कर्षण को एक साथ मिलाना चाहेंगे।

```python
key_developments = []

for extraction in extractions:
    key_developments.extend(extraction.key_developments)

key_developments[:20]
```

```output
[KeyDevelopment(year=1966, description="The Toyota Corolla began production, recognized as the world's best-selling automobile.", evidence="The Toyota Corolla has been in production since 1966 and is recognized as the world's best-selling automobile."),
 KeyDevelopment(year=1769, description='Nicolas-Joseph Cugnot built the first steam-powered road vehicle.', evidence='French inventor Nicolas-Joseph Cugnot built the first steam-powered road vehicle in 1769.'),
 KeyDevelopment(year=1808, description='François Isaac de Rivaz designed and constructed the first internal combustion-powered automobile.', evidence='French-born Swiss inventor François Isaac de Rivaz designed and constructed the first internal combustion-powered automobile in 1808.'),
 KeyDevelopment(year=1886, description='Carl Benz patented his Benz Patent-Motorwagen, inventing the modern car.', evidence='The modern car—a practical, marketable automobile for everyday use—was invented in 1886, when German inventor Carl Benz patented his Benz Patent-Motorwagen.'),
 KeyDevelopment(year=1908, description='The 1908 Model T, an affordable car for the masses, was manufactured by the Ford Motor Company.', evidence='One of the first cars affordable by the masses was the 1908 Model T, an American car manufactured by the Ford Motor Company.'),
 KeyDevelopment(year=1881, description='Gustave Trouvé demonstrated a three-wheeled car powered by electricity.', evidence='In November 1881, French inventor Gustave Trouvé demonstrated a three-wheeled car powered by electricity at the International Exposition of Electricity.'),
 KeyDevelopment(year=1888, description="Bertha Benz undertook the first road trip by car to prove the road-worthiness of her husband's invention.", evidence="In August 1888, Bertha Benz, the wife of Carl Benz, undertook the first road trip by car, to prove the road-worthiness of her husband's invention."),
 KeyDevelopment(year=1896, description='Benz designed and patented the first internal-combustion flat engine, called boxermotor.', evidence='In 1896, Benz designed and patented the first internal-combustion flat engine, called boxermotor.'),
 KeyDevelopment(year=1897, description='Nesselsdorfer Wagenbau produced the Präsident automobil, one of the first factory-made cars in the world.', evidence='The first motor car in central Europe and one of the first factory-made cars in the world, was produced by Czech company Nesselsdorfer Wagenbau (later renamed to Tatra) in 1897, the Präsident automobil.'),
 KeyDevelopment(year=1890, description='Daimler Motoren Gesellschaft (DMG) was founded by Daimler and Maybach in Cannstatt.', evidence='Daimler and Maybach founded Daimler Motoren Gesellschaft (DMG) in Cannstatt in 1890.'),
 KeyDevelopment(year=1902, description='A new model DMG car was produced and named Mercedes after the Maybach engine.', evidence='Two years later, in 1902, a new model DMG car was produced and the model was named Mercedes after the Maybach engine, which generated 35 hp.'),
 KeyDevelopment(year=1891, description='Auguste Doriot and Louis Rigoulot completed the longest trip by a petrol-driven vehicle using a Daimler powered Peugeot Type 3.', evidence='In 1891, Auguste Doriot and his Peugeot colleague Louis Rigoulot completed the longest trip by a petrol-driven vehicle when their self-designed and built Daimler powered Peugeot Type 3 completed 2,100 kilometres (1,300 mi) from Valentigney to Paris and Brest and back again.'),
 KeyDevelopment(year=1895, description='George Selden was granted a US patent for a two-stroke car engine.', evidence='After a delay of 16 years and a series of attachments to his application, on 5 November 1895, Selden was granted a US patent (U.S. patent 549,160) for a two-stroke car engine.'),
 KeyDevelopment(year=1893, description='The first running, petrol-driven American car was built and road-tested by the Duryea brothers.', evidence='In 1893, the first running, petrol-driven American car was built and road-tested by the Duryea brothers of Springfield, Massachusetts.'),
 KeyDevelopment(year=1897, description='Rudolf Diesel built the first diesel engine.', evidence='In 1897, he built the first diesel engine.'),
 KeyDevelopment(year=1901, description='Ransom Olds started large-scale, production-line manufacturing of affordable cars at his Oldsmobile factory.', evidence='Large-scale, production-line manufacturing of affordable cars was started by Ransom Olds in 1901 at his Oldsmobile factory in Lansing, Michigan.'),
 KeyDevelopment(year=1913, description="Henry Ford began the world's first moving assembly line for cars at the Highland Park Ford Plant.", evidence="This concept was greatly expanded by Henry Ford, beginning in 1913 with the world's first moving assembly line for cars at the Highland Park Ford Plant."),
 KeyDevelopment(year=1914, description="Ford's assembly line worker could buy a Model T with four months' pay.", evidence="In 1914, an assembly line worker could buy a Model T with four months' pay."),
 KeyDevelopment(year=1926, description='Fast-drying Duco lacquer was developed, allowing for a variety of car colors.', evidence='Only Japan black would dry fast enough, forcing the company to drop the variety of colours available before 1913, until fast-drying Duco lacquer was developed in 1926.')]
```

## RAG आधारित दृष्टिकोण

एक और सरल विचार है कि पाठ्य को टुकड़ों में बांटें, लेकिन प्रत्येक टुकड़े से सूचना निकालने के बजाय, केवल सबसे प्रासंगिक टुकड़ों पर ध्यान केंद्रित करें।

:::caution
यह पता लगाना मुश्किल हो सकता है कि कौन से टुकड़े प्रासंगिक हैं।

उदाहरण के लिए, हम यहां उपयोग कर रहे `कार` लेख में, लेख का अधिकांश हिस्सा प्रमुख विकास जानकारी शामिल करता है। इसलिए **RAG** का उपयोग करके, हम संभवतः प्रासंगिक जानकारी का बहुत कुछ फेंक देंगे।

हम आपके उपयोग मामले के साथ प्रयोग करने और यह निर्धारित करने का सुझाव देते हैं कि क्या यह दृष्टिकोण काम करता है या नहीं।
:::

यहां एक सरल उदाहरण है जो `FAISS` वेक्टर स्टोर पर निर्भर करता है।

```python
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

texts = text_splitter.split_text(document.page_content)
vectorstore = FAISS.from_texts(texts, embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 1}
)  # Only extract from first document
```

इस मामले में, RAG एक्सट्रैक्टर केवल शीर्ष दस्तावेज़ पर देख रहा है।

```python
rag_extractor = {
    "text": retriever | (lambda docs: docs[0].page_content)  # fetch content of top doc
} | extractor
```

```python
results = rag_extractor.invoke("Key developments associated with cars")
```

```python
for key_development in results.key_developments:
    print(key_development)
```

```output
year=1924 description="Germany's first mass-manufactured car, the Opel 4PS Laubfrosch, was produced, making Opel the top car builder in Germany with 37.5% of the market." evidence="Germany's first mass-manufactured car, the Opel 4PS Laubfrosch (Tree Frog), came off the line at Rüsselsheim in 1924, soon making Opel the top car builder in Germany, with 37.5 per cent of the market."
year=1925 description='Morris had 41% of total British car production, dominating the market.' evidence='in 1925, Morris had 41 per cent of total British car production.'
year=1925 description='Citroën, Renault, and Peugeot produced 550,000 cars in France, dominating the market.' evidence="Citroën did the same in France, coming to cars in 1919; between them and other cheap cars in reply such as Renault's 10CV and Peugeot's 5CV, they produced 550,000 cars in 1925."
year=2017 description='Production of petrol-fuelled cars peaked.' evidence='Production of petrol-fuelled cars peaked in 2017.'
```

## सामान्य समस्याएं

विभिन्न विधियों में लागत, गति और सटीकता से संबंधित अपने-अपने लाभ और नुकसान हैं।

इन समस्याओं पर ध्यान दें:

* टुकड़ों में सामग्री विभाजन का मतलब है कि एलएलएम जानकारी को निकालने में विफल हो सकता है यदि जानकारी कई टुकड़ों में फैली हुई है।
* बड़ा टुकड़ा ओवरलैप डुप्लिकेट जानकारी को निकाल सकता है, इसलिए डी-डुप्लिकेट करने के लिए तैयार रहें!
* एलएलएम डेटा बना सकते हैं। यदि एक बड़े पाठ्य में एक एकल तथ्य की तलाश कर रहे हैं और एक ब्रूट फोर्स दृष्टिकोण का उपयोग कर रहे हैं, तो आप अधिक बनावटी डेटा प्राप्त कर सकते हैं।
