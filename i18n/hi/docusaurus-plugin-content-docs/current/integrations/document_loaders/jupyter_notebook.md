---
translated: true
---

# जूपीटर नोटबुक

>[जूपीटर नोटबुक](https://en.wikipedia.org/wiki/Project_Jupyter#Applications) (पहले `IPython नोटबुक`) एक वेब-आधारित इंटरैक्टिव कंप्यूटेशनल पर्यावरण है जो नोटबुक दस्तावेज़ बनाने के लिए उपयोग किया जाता है।

यह नोटबुक `.html` जूपीटर नोटबुक से डेटा को लोड करने और उसे LangChain द्वारा उपयोग के लिए उपयुक्त प्रारूप में लाने के बारे में बताता है।

```python
from langchain_community.document_loaders import NotebookLoader
```

```python
loader = NotebookLoader(
    "example_data/notebook.html",
    include_outputs=True,
    max_output_length=20,
    remove_newline=True,
)
```

`NotebookLoader.load()` `.html` नोटबुक फ़ाइल को `Document` ऑब्जेक्ट में लोड करता है।

**पैरामीटर**:

* `include_outputs` (bool): क्या सेल आउटपुट को परिणामी दस्तावेज़ में शामिल करना है (डिफ़ॉल्ट false है)।
* `max_output_length` (int): प्रत्येक सेल आउटपुट से शामिल करने के लिए अधिकतम वर्णों की संख्या (डिफ़ॉल्ट 10 है)।
* `remove_newline` (bool): क्या सेल स्रोतों और आउटपुट से नई पंक्ति वर्णों को हटाना है (डिफ़ॉल्ट false है)।
* `traceback` (bool): क्या पूर्ण ट्रेसबैक शामिल करना है (डिफ़ॉल्ट false है)।

```python
loader.load()
```

```output
[Document(page_content='\'markdown\' cell: \'[\'# Notebook\', \'\', \'This notebook covers how to load data from an .html notebook into a format suitable by LangChain.\']\'\n\n \'code\' cell: \'[\'from langchain_community.document_loaders import NotebookLoader\']\'\n\n \'code\' cell: \'[\'loader = NotebookLoader("example_data/notebook.html")\']\'\n\n \'markdown\' cell: \'[\'`NotebookLoader.load()` loads the `.html` notebook file into a `Document` object.\', \'\', \'**Parameters**:\', \'\', \'* `include_outputs` (bool): whether to include cell outputs in the resulting document (default is False).\', \'* `max_output_length` (int): the maximum number of characters to include from each cell output (default is 10).\', \'* `remove_newline` (bool): whether to remove newline characters from the cell sources and outputs (default is False).\', \'* `traceback` (bool): whether to include full traceback (default is False).\']\'\n\n \'code\' cell: \'[\'loader.load(include_outputs=True, max_output_length=20, remove_newline=True)\']\'\n\n', metadata={'source': 'example_data/notebook.html'})]
```
