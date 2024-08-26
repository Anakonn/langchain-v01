---
title: कस्टम रिट्रीवर
translated: true
---

# कस्टम रिट्रीवर

## अवलोकन

कई एलएलएम अनुप्रयोगों में `रिट्रीवर` का उपयोग करके बाहरी डेटा स्रोतों से जानकारी पुनर्प्राप्त करना शामिल होता है।

एक रिट्रीवर किसी दिए गए उपयोगकर्ता `प्रश्न` के लिए प्रासंगिक `दस्तावेज़ों` की एक सूची पुनर्प्राप्त करने के लिए जिम्मेदार होता है।

पुनर्प्राप्त दस्तावेज़ अक्सर प्रोम्प्ट्स के रूप में प्रारूपित किए जाते हैं जिन्हें एक एलएलएम में फ़ीड किया जाता है, जिससे एलएलएम उस जानकारी का उपयोग कर एक उचित प्रतिक्रिया (जैसे, ज्ञान आधार पर एक उपयोगकर्ता प्रश्न का उत्तर देना) उत्पन्न कर सकता है।

## इंटरफ़ेस

अपना स्वयं का रिट्रीवर बनाने के लिए, आपको `BaseRetriever` क्लास का विस्तार करना और निम्नलिखित विधियों को लागू करना होगा:

| विधि                           | विवरण                                           | आवश्यक/वैकल्पिक |
|--------------------------------|--------------------------------------------------|-------------------|
| `_get_relevant_documents`      | किसी प्रश्न के लिए प्रासंगिक दस्तावेज़ प्राप्त करें।  | आवश्यक          |
| `_aget_relevant_documents`     | एसिंक्रोनस नेटिव समर्थन प्रदान करने के लिए लागू करें। | वैकल्पिक          |

`_get_relevant_documents` के अंदर की तर्कशक्ति किसी डेटाबेस या वेब का उपयोग करके अनुरोधों का उपयोग करके किसी भी तरह के कॉल शामिल कर सकती है।

:::tip
`BaseRetriever` से वारिस होकर, आपका रिट्रीवर स्वचालित रूप से एक LangChain [Runnable](/docs/expression_language/interface) बन जाता है और मानक `Runnable` कार्यक्षमता को आउट ऑफ़ द बॉक्स प्राप्त कर लेगा!
:::

:::info
आप एक `RunnableLambda` या `RunnableGenerator` का उपयोग करके एक रिट्रीवर को लागू कर सकते हैं।

एक `BaseRetriever` के रूप में एक रिट्रीवर को लागू करने का मुख्य लाभ एक `RunnableLambda` (एक कस्टम [runnable function](/docs/expression_language/primitives/functions)) की तुलना में यह है कि एक `BaseRetriever` एक अच्छी तरह से ज्ञात LangChain इकाई है, इसलिए कुछ निगरानी उपकरण रिट्रीवरों के लिए विशेष व्यवहार को लागू कर सकते हैं। एक और अंतर यह है कि एक `BaseRetriever` कुछ एपीआई में `RunnableLambda` से थोड़ा अलग व्यवहार करेगा; उदाहरण के लिए, `astream_events` एपीआई में `start` इवेंट `on_chain_start` के बजाय `on_retriever_start` होगा।
:::

## उदाहरण

चलो एक खिलौना रिट्रीवर को लागू करते हैं जो उपयोगकर्ता प्रश्न में मौजूद पाठ को समाहित करने वाले सभी दस्तावेज़ों को वापस करता है।

```python
from typing import List

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever


class ToyRetriever(BaseRetriever):
    """A toy retriever that contains the top k documents that contain the user query.

    This retriever only implements the sync method _get_relevant_documents.

    If the retriever were to involve file access or network access, it could benefit
    from a native async implementation of `_aget_relevant_documents`.

    As usual, with Runnables, there's a default async implementation that's provided
    that delegates to the sync implementation running on another thread.
    """

    documents: List[Document]
    """List of documents to retrieve from."""
    k: int
    """Number of top results to return"""

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """Sync implementations for retriever."""
        matching_documents = []
        for document in self.documents:
            if len(matching_documents) > self.k:
                return matching_documents

            if query.lower() in document.page_content.lower():
                matching_documents.append(document)
        return matching_documents

    # Optional: Provide a more efficient native implementation by overriding
    # _aget_relevant_documents
    # async def _aget_relevant_documents(
    #     self, query: str, *, run_manager: AsyncCallbackManagerForRetrieverRun
    # ) -> List[Document]:
    #     """Asynchronously get documents relevant to a query.

    #     Args:
    #         query: String to find relevant documents for
    #         run_manager: The callbacks handler to use

    #     Returns:
    #         List of relevant documents
    #     """
```

## इसका परीक्षण करें 🧪

```python
documents = [
    Document(
        page_content="Dogs are great companions, known for their loyalty and friendliness.",
        metadata={"type": "dog", "trait": "loyalty"},
    ),
    Document(
        page_content="Cats are independent pets that often enjoy their own space.",
        metadata={"type": "cat", "trait": "independence"},
    ),
    Document(
        page_content="Goldfish are popular pets for beginners, requiring relatively simple care.",
        metadata={"type": "fish", "trait": "low maintenance"},
    ),
    Document(
        page_content="Parrots are intelligent birds capable of mimicking human speech.",
        metadata={"type": "bird", "trait": "intelligence"},
    ),
    Document(
        page_content="Rabbits are social animals that need plenty of space to hop around.",
        metadata={"type": "rabbit", "trait": "social"},
    ),
]
retriever = ToyRetriever(documents=documents, k=3)
```

```python
retriever.invoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

यह एक **runnable** है, इसलिए यह मानक Runnable इंटरफ़ेस का लाभ उठाएगा! 🤩

```python
await retriever.ainvoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

```python
retriever.batch(["dog", "cat"])
```

```output
[[Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'type': 'dog', 'trait': 'loyalty'})],
 [Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'})]]
```

```python
async for event in retriever.astream_events("bar", version="v1"):
    print(event)
```

```output
{'event': 'on_retriever_start', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'name': 'ToyRetriever', 'tags': [], 'metadata': {}, 'data': {'input': 'bar'}}
{'event': 'on_retriever_stream', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'name': 'ToyRetriever', 'data': {'chunk': []}}
{'event': 'on_retriever_end', 'name': 'ToyRetriever', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'data': {'output': []}}
```

## योगदान

हम रोचक रिट्रीवरों के योगदानों का सम्मान करते हैं!

अपने योगदान को LangChain में जोड़ा जाए, इसके लिए यह जांच-सूची आपकी मदद कर सकती है:

प्रलेखन:

* रिट्रीवर में सभी प्रारंभिकरण तर्कों के लिए डॉक-स्ट्रिंग हैं, क्योंकि ये [एपीआई संदर्भ](https://api.python.langchain.com/en/stable/langchain_api_reference.html) में प्रदर्शित किए जाएंगे।
* मॉडल के लिए डॉक-स्ट्रिंग में रिट्रीवर के लिए उपयोग किए जाने वाले किसी भी प्रासंगिक एपीआई का लिंक होना चाहिए (उदाहरण के लिए, यदि रिट्रीवर विकिपीडिया से पुनर्प्राप्त कर रहा है, तो विकिपीडिया एपीआई के लिंक अच्छे होंगे!)

परीक्षण:

* [ ] `invoke` और `ainvoke` काम करते हैं, इसे सत्यापित करने के लिए यूनिट या एकीकरण परीक्षण जोड़ें।

अनुकूलन:

यदि रिट्रीवर बाहरी डेटा स्रोतों (जैसे, एपीआई या फ़ाइल) से कनेक्ट कर रहा है, तो लगभग निश्चित रूप से एक एसिंक्रोनस नेटिव अनुकूलन का लाभ उठाएगा!

* [ ] `_aget_relevant_documents` (जिसका उपयोग `ainvoke` द्वारा किया जाता है) का एक नेटिव एसिंक्रोनस कार्यान्वयन प्रदान करें
