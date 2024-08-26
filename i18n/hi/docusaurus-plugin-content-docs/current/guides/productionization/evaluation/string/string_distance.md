---
translated: true
---

# स्ट्रिंग दूरी

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/string/string_distance.ipynb)

>सूचना सिद्धांत, भाषाविज्ञान और कंप्यूटर विज्ञान में, [लेवेंश्टीन दूरी (विकिपीडिया)](https://en.wikipedia.org/wiki/Levenshtein_distance) दो अनुक्रमों के बीच अंतर को मापने के लिए एक स्ट्रिंग मीट्रिक है। अनौपचारिक रूप से, दो शब्दों के बीच लेवेंश्टीन दूरी एक शब्द को दूसरे में बदलने के लिए आवश्यक एकल-वर्ण संपादन (इंसर्शन, डिलीशन या प्रतिस्थापन) की न्यूनतम संख्या है। इसका नाम सोवियत गणितज्ञ व्लादिमीर लेवेंश्टीन के नाम पर रखा गया है, जिन्होंने 1965 में इस दूरी पर विचार किया था।

किसी एलएलएम या श्रृंखला के स्ट्रिंग आउटपुट को संदर्भ लेबल के खिलाफ तुलना करने का एक सबसे सरल तरीका `लेवेंश्टीन` या `पोस्टफिक्स` दूरी जैसे स्ट्रिंग दूरी मापदंडों का उपयोग करना है। यह बहुत मूलभूत यूनिट परीक्षण के लिए लगभग/अस्पष्ट मैचिंग मानदंडों के साथ उपयोग किया जा सकता है।

इसका उपयोग `स्ट्रिंग_दूरी` मूल्यांकक का उपयोग करके किया जा सकता है, जो [rapidfuzz](https://github.com/maxbachmann/RapidFuzz) लाइब्रेरी से दूरी मीट्रिक का उपयोग करता है।

**नोट:** लौटाए गए स्कोर _दूरियां_ हैं, अर्थात् कम होना "बेहतर" होता है।

अधिक जानकारी के लिए, [StringDistanceEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.string_distance.base.StringDistanceEvalChain.html#langchain.evaluation.string_distance.base.StringDistanceEvalChain) के लिए संदर्भ दस्तावेज़ देखें।

```python
%pip install --upgrade --quiet  rapidfuzz
```

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("string_distance")
```

```python
evaluator.evaluate_strings(
    prediction="The job is completely done.",
    reference="The job is done",
)
```

```output
{'score': 0.11555555555555552}
```

```python
# The results purely character-based, so it's less useful when negation is concerned
evaluator.evaluate_strings(
    prediction="The job is done.",
    reference="The job isn't done",
)
```

```output
{'score': 0.0724999999999999}
```

## स्ट्रिंग दूरी मीट्रिक कॉन्फ़िगर करें

डिफ़ॉल्ट रूप से, `StringDistanceEvalChain` लेवेंश्टीन दूरी का उपयोग करता है, लेकिन यह अन्य स्ट्रिंग दूरी एल्गोरिदम का भी समर्थन करता है। `दूरी` तर्क का उपयोग करके कॉन्फ़िगर करें।

```python
from langchain.evaluation import StringDistance

list(StringDistance)
```

```output
[<StringDistance.DAMERAU_LEVENSHTEIN: 'damerau_levenshtein'>,
 <StringDistance.LEVENSHTEIN: 'levenshtein'>,
 <StringDistance.JARO: 'jaro'>,
 <StringDistance.JARO_WINKLER: 'jaro_winkler'>]
```

```python
jaro_evaluator = load_evaluator("string_distance", distance=StringDistance.JARO)
```

```python
jaro_evaluator.evaluate_strings(
    prediction="The job is completely done.",
    reference="The job is done",
)
```

```output
{'score': 0.19259259259259254}
```

```python
jaro_evaluator.evaluate_strings(
    prediction="The job is done.",
    reference="The job isn't done",
)
```

```output
{'score': 0.12083333333333324}
```
