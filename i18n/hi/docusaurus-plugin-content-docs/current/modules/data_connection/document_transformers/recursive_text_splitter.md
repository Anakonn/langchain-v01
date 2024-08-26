---
translated: true
---

# वर्ण द्वारा पुनर्कृत रूप से विभाजित करना

यह पाठ विभाजक सामान्य पाठ के लिए अनुशंसित है। यह एक वर्णों की सूची द्वारा परिमाणित है। यह उन पर क्रम में विभाजित करने का प्रयास करता है जब तक कि टुकड़े पर्याप्त छोटे न हो जाएं। डिफ़ॉल्ट सूची `["\n\n", "\n", " ", ""]` है। इसका प्रभाव यह है कि जितना संभव हो उतना पैराग्राफ़ (और फिर वाक्य, और फिर शब्द) एक साथ रखने का प्रयास करता है, क्योंकि वे सामान्य रूप से सबसे मजबूत रूप से संबंधित पाठ के टुकड़े होंगे।

1. पाठ कैसे विभाजित होता है: वर्णों की सूची द्वारा।
2. टुकड़े का आकार कैसे मापा जाता है: वर्णों की संख्या द्वारा।

```python
%pip install -qU langchain-text-splitters
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
```

```python
texts = text_splitter.create_documents([state_of_the_union])
print(texts[0])
print(texts[1])
```

```output
page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and'
page_content='of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.'
```

```python
text_splitter.split_text(state_of_the_union)[:2]
```

```output
['Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and',
 'of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.']
```

## शब्द सीमाओं के बिना भाषाओं से पाठ विभाजित करना

कुछ लिखने की प्रणालियों में [शब्द सीमाएं](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries) नहीं होती हैं, उदाहरण के लिए चीनी, जापानी और थाई। `["\n\n", "\n", " ", ""]` के डिफ़ॉल्ट अलगाव सूची का उपयोग करके पाठ विभाजित करने से शब्द टुकड़ों के बीच विभाजित हो सकते हैं। शब्दों को एक साथ रखने के लिए, आप अतिरिक्त विरामचिह्नों को शामिल करने के लिए अलगाव सूची को अधिलेखित कर सकते हैं:

* ASCII पूर्ण विराम "`.`", [यूनिकोड पूर्णविराम](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)) पूर्ण विराम "`．`" (चीनी पाठ में उपयोग किया जाता है), और [आइडियोग्राफिक पूर्ण विराम](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`" (जापानी और चीनी में उपयोग किया जाता है) को जोड़ें।
* थाई, म्यांमार, खमेर और जापानी में उपयोग किए जाने वाले [शून्य-चौड़ाई स्पेस](https://en.wikipedia.org/wiki/Zero-width_space) को जोड़ें।
* ASCII कॉमा "`,`", यूनिकोड पूर्णविराम कॉमा "`，`", और यूनिकोड आइडियोग्राफिक कॉमा "`、`" को जोड़ें।

```python
text_splitter = RecursiveCharacterTextSplitter(
    separators=[
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",  # Zero-width space
        "\uff0c",  # Fullwidth comma
        "\u3001",  # Ideographic comma
        "\uff0e",  # Fullwidth full stop
        "\u3002",  # Ideographic full stop
        "",
    ],
    # Existing args
)
```
