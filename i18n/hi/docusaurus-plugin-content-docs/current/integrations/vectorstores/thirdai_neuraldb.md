---
translated: true
---

# ThirdAI NeuralDB

>[NeuralDB](https://www.thirdai.com/neuraldb-enterprise/) एक CPU-अनुकूल और अनुकूलनीय वेक्टर स्टोर है जिसे [ThirdAI](https://www.thirdai.com/) द्वारा विकसित किया गया है।

## प्रारंभीकरण

दो प्रारंभीकरण विधियां हैं:
- स्क्रैच से: मूल मॉडल
- चेकपॉइंट से: पहले सहेजे गए मॉडल को लोड करें

निम्नलिखित सभी प्रारंभीकरण विधियों के लिए, `thirdai_key` पैरामीटर को छोड़ा जा सकता है यदि `THIRDAI_KEY` पर्यावरण चर सेट है।

ThirdAI API कुंजी https://www.thirdai.com/try-bolt/ पर प्राप्त की जा सकती हैं।

```python
from langchain.vectorstores import NeuralDBVectorStore

# From scratch
vectorstore = NeuralDBVectorStore.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
vectorstore = NeuralDBVectorStore.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # vectorstore.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBVectorStore.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

## दस्तावेज़ स्रोतों को डालना

```python
vectorstore.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

vectorstore.insert(
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

## समानता खोज

वेक्टर स्टोर को क्वेरी करने के लिए, आप मानक LangChain वेक्टर स्टोर विधि `similarity_search` का उपयोग कर सकते हैं, जो LangChain दस्तावेज़ वस्तुओं की एक सूची लौटाता है। प्रत्येक दस्तावेज़ वस्तु अनुक्रमित फ़ाइलों से एक पाठ्य खंड को प्रतिनिधित्व करती है। उदाहरण के लिए, यह किसी PDF फ़ाइल से एक अनुच्छेद हो सकता है। पाठ्य के अलावा, दस्तावेज़ के मेटाडेटा फ़ील्ड में जानकारी जैसे दस्तावेज़ की पहचान, इस दस्तावेज़ का स्रोत (यह किस फ़ाइल से आया था) और दस्तावेज़ का स्कोर शामिल होता है।

```python
# This returns a list of LangChain Document objects
documents = vectorstore.similarity_search("query", k=10)
```

## अनुकूलन

NeuralDBVectorStore को उपयोगकर्ता व्यवहार और डोमेन-विशिष्ट ज्ञान के अनुसार अनुकूलित किया जा सकता है। इसे दो तरीकों से अनुकूलित किया जा सकता है:
1. एसोसिएशन: वेक्टर स्टोर एक स्रोत वाक्यांश को लक्ष्य वाक्यांश से जोड़ता है। जब वेक्टर स्टोर स्रोत वाक्यांश देखता है, तो यह लक्ष्य वाक्यांश से संबंधित परिणामों पर भी विचार करेगा।
2. अपवोटिंग: वेक्टर स्टोर किसी विशिष्ट क्वेरी के लिए दस्तावेज़ के स्कोर को अधिक वजन देता है। यह तब उपयोगी है जब आप वेक्टर स्टोर को उपयोगकर्ता व्यवहार के अनुसार अनुकूलित करना चाहते हैं। उदाहरण के लिए, यदि कोई उपयोगकर्ता "कार कैसे बनाई जाती है" खोजता है और आईडी 52 वाले दस्तावेज़ को पसंद करता है, तो हम क्वेरी "कार कैसे बनाई जाती है" के लिए आईडी 52 वाले दस्तावेज़ को अपवोट कर सकते हैं।

```python
vectorstore.associate(source="source phrase", target="target phrase")
vectorstore.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

vectorstore.upvote(query="how is a car manufactured", document_id=52)
vectorstore.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
