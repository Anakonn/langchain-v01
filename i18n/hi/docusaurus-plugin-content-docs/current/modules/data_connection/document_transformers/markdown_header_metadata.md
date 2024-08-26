---
translated: true
---

# MarkdownHeaderTextSplitter

### प्रेरणा

कई चैट या Q+A अनुप्रयोग दस्तावेज़ों को एम्बेडिंग और वेक्टर स्टोरेज से पहले टुकड़ों में बांटने में शामिल हैं।

[पाइनकोन से ये नोट](https://www.pinecone.io/learn/chunking-strategies/) कुछ उपयोगी युक्तियां प्रदान करते हैं:

जब पूरा अनुच्छेद या दस्तावेज़ एम्बेड किया जाता है, तो एम्बेडिंग प्रक्रिया समग्र संदर्भ और वाक्यों और वाक्यांशों के बीच संबंधों को भी ध्यान में रखती है। इससे अधिक व्यापक वेक्टर प्रतिनिधित्व प्राप्त हो सकता है जो पाठ के व्यापक अर्थ और थीम को पकड़ता है।

जैसा कि उल्लेख किया गया है, टुकड़ों में बांटना अक्सर समान संदर्भ को एक साथ रखने का लक्ष्य रखता है। इस पर ध्यान रखते हुए, हम दस्तावेज़ की खुद की संरचना को विशेष रूप से मानने चाहते हैं। उदाहरण के लिए, एक मार्कडाउन फ़ाइल हेडर द्वारा संगठित होती है। विशिष्ट हेडर समूहों के भीतर टुकड़े बनाना एक अनुमानित विचार है। इस चुनौती का समाधान करने के लिए, हम `MarkdownHeaderTextSplitter` का उपयोग कर सकते हैं। यह एक निर्दिष्ट सेट हेडर द्वारा एक मार्कडाउन फ़ाइल को विभाजित करेगा।

उदाहरण के लिए, अगर हम इस मार्कडाउन को विभाजित करना चाहते हैं:

```python
md = '# Foo\n\n ## Bar\n\nHi this is Jim  \nHi this is Joe\n\n ## Baz\n\n Hi this is Molly'
```

हम विभाजन के लिए हेडर निर्दिष्ट कर सकते हैं:

```python
[("#", "Header 1"),("##", "Header 2")]
```

और सामग्री समान हेडर के साथ समूहीकृत या विभाजित की जाती है:

```python
{'content': 'Hi this is Jim  \nHi this is Joe', 'metadata': {'Header 1': 'Foo', 'Header 2': 'Bar'}}
{'content': 'Hi this is Molly', 'metadata': {'Header 1': 'Foo', 'Header 2': 'Baz'}}
```

चलो नीचे कुछ उदाहरण देखते हैं।

```python
%pip install -qU langchain-text-splitters
```

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter
```

```python
markdown_document = "# Foo\n\n    ## Bar\n\nHi this is Jim\n\nHi this is Joe\n\n ### Boo \n\n Hi this is Lance \n\n ## Baz\n\n Hi this is Molly"

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]

markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```

```output
[Document(page_content='Hi this is Jim  \nHi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='Hi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='Hi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```

```python
type(md_header_splits[0])
```

```output
langchain.schema.document.Document
```

डिफ़ॉल्ट रूप से, `MarkdownHeaderTextSplitter` विभाजन के लिए उपयोग किए जाने वाले हेडर को आउटपुट टुकड़े के सामग्री से हटा देता है। इसे `strip_headers = False` सेट करके अक्षम किया जा सकता है।

```python
markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on, strip_headers=False
)
md_header_splits = markdown_splitter.split_text(markdown_document)
md_header_splits
```

```output
[Document(page_content='# Foo  \n## Bar  \nHi this is Jim  \nHi this is Joe', metadata={'Header 1': 'Foo', 'Header 2': 'Bar'}),
 Document(page_content='### Boo  \nHi this is Lance', metadata={'Header 1': 'Foo', 'Header 2': 'Bar', 'Header 3': 'Boo'}),
 Document(page_content='## Baz  \nHi this is Molly', metadata={'Header 1': 'Foo', 'Header 2': 'Baz'})]
```

प्रत्येक मार्कडाउन समूह के भीतर, हम फिर से कोई भी पाठ विभाजक लागू कर सकते हैं।

```python
markdown_document = "# Intro \n\n    ## History \n\n Markdown[9] is a lightweight markup language for creating formatted text using a plain-text editor. John Gruber created Markdown in 2004 as a markup language that is appealing to human readers in its source code form.[9] \n\n Markdown is widely used in blogging, instant messaging, online forums, collaborative software, documentation pages, and readme files. \n\n ## Rise and divergence \n\n As Markdown popularity grew rapidly, many Markdown implementations appeared, driven mostly by the need for \n\n additional features such as tables, footnotes, definition lists,[note 1] and Markdown inside HTML blocks. \n\n #### Standardization \n\n From 2012, a group of people, including Jeff Atwood and John MacFarlane, launched what Atwood characterised as a standardisation effort. \n\n ## Implementations \n\n Implementations of Markdown are available for over a dozen programming languages."

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
]

# MD splits
markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on, strip_headers=False
)
md_header_splits = markdown_splitter.split_text(markdown_document)

# Char-level splits
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 250
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(md_header_splits)
splits
```

```output
[Document(page_content='# Intro  \n## History  \nMarkdown[9] is a lightweight markup language for creating formatted text using a plain-text editor. John Gruber created Markdown in 2004 as a markup language that is appealing to human readers in its source code form.[9]', metadata={'Header 1': 'Intro', 'Header 2': 'History'}),
 Document(page_content='Markdown is widely used in blogging, instant messaging, online forums, collaborative software, documentation pages, and readme files.', metadata={'Header 1': 'Intro', 'Header 2': 'History'}),
 Document(page_content='## Rise and divergence  \nAs Markdown popularity grew rapidly, many Markdown implementations appeared, driven mostly by the need for  \nadditional features such as tables, footnotes, definition lists,[note 1] and Markdown inside HTML blocks.', metadata={'Header 1': 'Intro', 'Header 2': 'Rise and divergence'}),
 Document(page_content='#### Standardization  \nFrom 2012, a group of people, including Jeff Atwood and John MacFarlane, launched what Atwood characterised as a standardisation effort.', metadata={'Header 1': 'Intro', 'Header 2': 'Rise and divergence'}),
 Document(page_content='## Implementations  \nImplementations of Markdown are available for over a dozen programming languages.', metadata={'Header 1': 'Intro', 'Header 2': 'Implementations'})]
```
