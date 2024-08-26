---
translated: true
---

# ओपनएआई मेटाडेटा टैगर

यह अक्सर उपयोगी हो सकता है कि संरचित मेटाडेटा के साथ निगलित दस्तावेजों को टैग किया जाए, जैसे कि शीर्षक, स्वर, या दस्तावेज़ की लंबाई, ताकि बाद में एक अधिक लक्षित समानता खोज की अनुमति हो सके। हालांकि, बड़ी संख्या में दस्तावेज़ों के लिए, इस लेबलिंग प्रक्रिया को मैन्युअल रूप से करना थकाऊ हो सकता है।

`OpenAIMetadataTagger` दस्तावेज़ ट्रांसफार्मर इस प्रक्रिया को स्वचालित करता है द्वारा प्रत्येक प्रदान किए गए दस्तावेज़ से मेटाडेटा निकालता है एक प्रदान की गई स्कीमा के अनुसार। यह हुड के तहत एक विन्यास योग्य `OpenAI Functions`-संचालित श्रृंखला का उपयोग करता है, इसलिए यदि आप एक कस्टम LLM उदाहरण पास करते हैं, तो यह एक `OpenAI` मॉडल होना चाहिए जिसमें फंक्शंस समर्थन हो।

**नोट:** यह दस्तावेज़ ट्रांसफार्मर पूर्ण दस्तावेजों के साथ सबसे अच्छा काम करता है, इसलिए इसे किसी अन्य विभाजन या प्रसंस्करण से पहले पूरे दस्तावेजों के साथ चलाना सबसे अच्छा है!

उदाहरण के लिए, मान लीजिए कि आप मूवी समीक्षा के एक सेट को इंडेक्स करना चाहते थे। आप निम्नानुसार एक मान्य `JSON Schema` वस्तु के साथ दस्तावेज़ ट्रांसफार्मर को प्रारंभ कर सकते हैं:

```python
from langchain_community.document_transformers.openai_functions import (
    create_metadata_tagger,
)
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
```

```python
schema = {
    "properties": {
        "movie_title": {"type": "string"},
        "critic": {"type": "string"},
        "tone": {"type": "string", "enum": ["positive", "negative"]},
        "rating": {
            "type": "integer",
            "description": "The number of stars the critic rated the movie",
        },
    },
    "required": ["movie_title", "critic", "tone"],
}

# Must be an OpenAI model that supports functions
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

document_transformer = create_metadata_tagger(metadata_schema=schema, llm=llm)
```

आप तब दस्तावेज़ ट्रांसफार्मर को दस्तावेजों की एक सूची पास कर सकते हैं, और यह सामग्री से मेटाडेटा निकाल देगा:

```python
original_documents = [
    Document(
        page_content="Review of The Bee Movie\nBy Roger Ebert\n\nThis is the greatest movie ever made. 4 out of 5 stars."
    ),
    Document(
        page_content="Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.",
        metadata={"reliable": False},
    ),
]

enhanced_documents = document_transformer.transform_documents(original_documents)
```

```python
import json

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

नए दस्तावेज़ों को फिर एक पाठ विभाजक द्वारा आगे संसाधित किया जा सकता है इससे पहले कि उन्हें एक वेक्टर स्टोर में लोड किया जाए। निकाले गए क्षेत्र मौजूदा मेटाडेटा को अधिलेखित नहीं करेंगे।

आप एक Pydantic स्कीमा के साथ दस्तावेज़ ट्रांसफार्मर को भी प्रारंभ कर सकते हैं:

```python
from typing import Literal

from pydantic import BaseModel, Field


class Properties(BaseModel):
    movie_title: str
    critic: str
    tone: Literal["positive", "negative"]
    rating: int = Field(description="Rating out of 5 stars")


document_transformer = create_metadata_tagger(Properties, llm)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

## अनुकूलन

आप दस्तावेज़ ट्रांसफार्मर कंस्ट्रक्टर में अंतर्निहित टैगिंग श्रृंखला को मानक LLMChain तर्क पास कर सकते हैं। उदाहरण के लिए, यदि आप चाहते थे कि LLM इनपुट दस्तावेज़ों में विशिष्ट विवरणों पर ध्यान केंद्रित करे, या किसी विशेष शैली में मेटाडेटा निकाले, तो आप एक कस्टम प्रॉम्प्ट पास कर सकते हैं:

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    """Extract relevant information from the following text.
Anonymous critics are actually Roger Ebert.

{input}
"""
)

document_transformer = create_metadata_tagger(schema, llm, prompt=prompt)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Roger Ebert", "tone": "negative", "rating": 1, "reliable": false}
```
