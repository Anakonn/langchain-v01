---
translated: true
---

# **NeuralDB**

NeuralDB एक CPU-अनुकूल और अनुकूलनीय पुनर्प्राप्ति इंजन है जिसे ThirdAI द्वारा विकसित किया गया है।

### **प्रारंभीकरण**

दो प्रारंभीकरण विधियाँ हैं:
- स्क्रैच से: मूल मॉडल
- चेकपॉइंट से: पहले सहेजे गए मॉडल को लोड करें

निम्नलिखित सभी प्रारंभीकरण विधियों के लिए, `thirdai_key` पैरामीटर को छोड़ा जा सकता है यदि `THIRDAI_KEY` पर्यावरण चर सेट है।

ThirdAI API कुंजी https://www.thirdai.com/try-bolt/ पर प्राप्त की जा सकती हैं।

```python
from langchain.retrievers import NeuralDBRetriever

# From scratch
retriever = NeuralDBRetriever.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
retriever = NeuralDBRetriever.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # retriever.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBRetriever.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

### **दस्तावेज़ स्रोतों को डालना**

```python
retriever.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

retriever.insert(
    # If you have files in other formats, or prefer to configure how
    # your files are parsed, then you can pass in NeuralDB document objects
    # like this.
    sources=[
        ndb.PDF(
            "/path/to/doc.pdf",
            version="v2",
            chunk_size=100,
            metadata={"published": 2022},
        ),
        ndb.Unstructured("/path/to/deck.pptx"),
    ]
)
```

### **दस्तावेज़ पुनर्प्राप्त करना**

रिट्रीवर को क्वेरी करने के लिए, आप मानक LangChain रिट्रीवर विधि `get_relevant_documents` का उपयोग कर सकते हैं, जो LangChain दस्तावेज़ वस्तुओं की एक सूची लौटाता है। प्रत्येक दस्तावेज़ वस्तु अनुक्रमित फ़ाइलों से एक पाठ्य खंड को प्रतिनिधित्व करती है। उदाहरण के लिए, यह किसी PDF फ़ाइल से एक अनुच्छेद हो सकता है। पाठ्य के अलावा, दस्तावेज़ के मेटाडेटा फ़ील्ड में जानकारी जैसे दस्तावेज़ की पहचान, इस दस्तावेज़ का स्रोत (यह किस फ़ाइल से आया है) और दस्तावेज़ का स्कोर शामिल होता है।

```python
# This returns a list of LangChain Document objects
documents = retriever.invoke("query", top_k=10)
```

### **अनुकूलन**

NeuralDBRetriever को उपयोगकर्ता व्यवहार और डोमेन-विशिष्ट ज्ञान के अनुसार अनुकूलित किया जा सकता है। इसे दो तरीकों से अनुकूलित किया जा सकता है:
1. एसोसिएशन: रिट्रीवर एक स्रोत वाक्यांश को लक्ष्य वाक्यांश से जोड़ता है। जब रिट्रीवर स्रोत वाक्यांश देखता है, तो यह लक्ष्य वाक्यांश से संबंधित परिणामों पर भी विचार करेगा।
2. अपवोटिंग: रिट्रीवर किसी विशिष्ट क्वेरी के लिए दस्तावेज़ के स्कोर को अधिक वजन देता है। यह तब उपयोगी होता है जब आप रिट्रीवर को उपयोगकर्ता व्यवहार के अनुसार अनुकूलित करना चाहते हैं। उदाहरण के लिए, यदि कोई उपयोगकर्ता "कार कैसे बनाई जाती है" खोजता है और आरोहित दस्तावेज़ आईडी 52 वाले दस्तावेज़ से संतुष्ट होता है, तो हम क्वेरी "कार कैसे बनाई जाती है" के लिए दस्तावेज़ आईडी 52 को अधिक वजन दे सकते हैं।

```python
retriever.associate(source="source phrase", target="target phrase")
retriever.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

retriever.upvote(query="how is a car manufactured", document_id=52)
retriever.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
