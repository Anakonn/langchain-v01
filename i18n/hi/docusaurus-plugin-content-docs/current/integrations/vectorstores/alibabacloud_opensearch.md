---
translated: true
---

# अलीबाबा क्लाउड ओपनसर्च

>[अलीबाबा क्लाउड ओपनसर्च](https://www.alibabacloud.com/product/opensearch) एक वन-स्टॉप प्लेटफॉर्म है जो बुद्धिमान खोज सेवाओं को विकसित करने के लिए है। `ओपनसर्च` को `अलीबाबा` द्वारा विकसित किए गए बड़े पैमाने पर वितरित खोज इंजन पर बनाया गया था। `ओपनसर्च` अलीबाबा समूह में 500 से अधिक व्यावसायिक मामलों और हजारों अलीबाबा क्लाउड ग्राहकों की सेवा करता है। `ओपनसर्च` ई-कॉमर्स, O2O, मल्टीमीडिया, सामग्री उद्योग, समुदाय और मंच, और उद्यमों में बड़ा डेटा क्वेरी सहित विभिन्न खोज परिदृश्यों में खोज सेवाओं को विकसित करने में मदद करता है।

>`ओपनसर्च` आपको उच्च गुणवत्ता, रखरखाव-मुक्त और उच्च-प्रदर्शन वाली बुद्धिमान खोज सेवाएं विकसित करने में मदद करता है ताकि आपके उपयोगकर्ताओं को उच्च खोज दक्षता और सटीकता प्रदान की जा सके।

>`ओपनसर्च` वेक्टर खोज सुविधा प्रदान करता है। विशिष्ट परिदृश्यों में, विशेष रूप से परीक्षण प्रश्न खोज और छवि खोज परिदृश्यों में, आप वेक्टर खोज सुविधा का उपयोग मल्टीमोडल खोज सुविधा के साथ कर सकते हैं ताकि खोज परिणामों की सटीकता में सुधार किया जा सके।

यह नोटबुक `अलीबाबा क्लाउड ओपनसर्च वेक्टर खोज संस्करण` से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

## सेटअप करना

### एक इंस्टेंस खरीदें और इसे कॉन्फ़िगर करें

[अलीबाबा क्लाउड](https://opensearch.console.aliyun.com) से ओपनसर्च वेक्टर खोज संस्करण खरीदें और सहायता [दस्तावेज़ीकरण](https://help.aliyun.com/document_detail/463198.html?spm=a2c4g.465092.0.0.2cd15002hdwavO) के अनुसार इंस्टेंस कॉन्फ़िगर करें।

चलाने के लिए, आपके पास एक [ओपनसर्च वेक्टर खोज संस्करण](https://opensearch.console.aliyun.com) इंस्टेंस चालू और चल रहा होना चाहिए।

### अलीबाबा क्लाउड ओपनसर्च वेक्टर स्टोर क्लास

                                                                                                                `AlibabaCloudOpenSearch` क्लास निम्नलिखित कार्यों का समर्थन करता है:
- `add_texts`
- `add_documents`
- `from_texts`
- `from_documents`
- `similarity_search`
- `asimilarity_search`
- `similarity_search_by_vector`
- `asimilarity_search_by_vector`
- `similarity_search_with_relevance_scores`
- `delete_doc_by_texts`

ओपनसर्च वेक्टर खोज संस्करण इंस्टेंस को जल्दी से परिचित और कॉन्फ़िगर करने के लिए [सहायता दस्तावेज](https://www.alibabacloud.com/help/en/opensearch/latest/vector-search) पढ़ें।

यदि उपयोग के दौरान कोई समस्या होती है, तो कृपया xingshaomin.xsm@alibaba-inc.com से संपर्क करें, और हम आपकी सहायता और समर्थन प्रदान करने का पूरा प्रयास करेंगे।

इंस्टेंस चालू और चल रहा होने के बाद, दस्तावेजों को विभाजित करने, एम्बेडिंग प्राप्त करने, अलीबाबा क्लाउड ओपनसर्च इंस्टेंस से कनेक्ट करने, दस्तावेजों को इंडेक्स करने और वेक्टर पुनर्प्राप्ति करने के लिए इन चरणों का पालन करें।

हमें पहले निम्नलिखित Python पैकेज इंस्टॉल करने की आवश्यकता है।

```python
%pip install --upgrade --quiet  alibabacloud_ha3engine_vector
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## उदाहरण

```python
from langchain_community.vectorstores import (
    AlibabaCloudOpenSearch,
    AlibabaCloudOpenSearchSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

दस्तावेजों को विभाजित करें और एम्बेडिंग प्राप्त करें।

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

ओपनसर्च सेटिंग्स बनाएं।

```python
settings = AlibabaCloudOpenSearchSettings(
    endpoint=" The endpoint of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    instance_id="The identify of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    protocol="Communication Protocol between SDK and Server, default is http.",
    username="The username specified when purchasing the instance.",
    password="The password specified when purchasing the instance.",
    namespace="The instance data will be partitioned based on the namespace field. If the namespace is enabled, you need to specify the namespace field name during initialization. Otherwise, the queries cannot be executed correctly.",
    tablename="The table name specified during instance configuration.",
    embedding_field_separator="Delimiter specified for writing vector field data, default is comma.",
    output_fields="Specify the field list returned when invoking OpenSearch, by default it is the value list of the field mapping field.",
    field_name_mapping={
        "id": "id",  # The id field name mapping of index document.
        "document": "document",  # The text field name mapping of index document.
        "embedding": "embedding",  # The embedding field name mapping of index document.
        "name_of_the_metadata_specified_during_search": "opensearch_metadata_field_name,=",
        # The metadata field name mapping of index document, could specify multiple, The value field contains mapping name and operator, the operator would be used when executing metadata filter query,
        # Currently supported logical operators are: > (greater than), < (less than), = (equal to), <= (less than or equal to), >= (greater than or equal to), != (not equal to).
        # Refer to this link: https://help.aliyun.com/zh/open-search/vector-search-edition/filter-expression
    },
)

# for example

# settings = AlibabaCloudOpenSearchSettings(
#     endpoint='ha-cn-5yd3fhdm102.public.ha.aliyuncs.com',
#     instance_id='ha-cn-5yd3fhdm102',
#     username='instance user name',
#     password='instance password',
#     table_name='test_table',
#     field_name_mapping={
#         "id": "id",
#         "document": "document",
#         "embedding": "embedding",
#         "string_field": "string_filed,=",
#         "int_field": "int_filed,=",
#         "float_field": "float_field,=",
#         "double_field": "double_field,="
#
#     },
# )
```

सेटिंग्स द्वारा एक ओपनसर्च एक्सेस इंस्टेंस बनाएं।

```python
# Create an opensearch instance and index docs.
opensearch = AlibabaCloudOpenSearch.from_texts(
    texts=docs, embedding=embeddings, config=settings
)
```

या

```python
# Create an opensearch instance.
opensearch = AlibabaCloudOpenSearch(embedding=embeddings, config=settings)
```

पाठ जोड़ें और सूचकांक बनाएं।

```python
metadatas = [
    {"string_field": "value1", "int_field": 1, "float_field": 1.0, "double_field": 2.0},
    {"string_field": "value2", "int_field": 2, "float_field": 3.0, "double_field": 4.0},
    {"string_field": "value3", "int_field": 3, "float_field": 5.0, "double_field": 6.0},
]
# the key of metadatas must match field_name_mapping in settings.
opensearch.add_texts(texts=docs, ids=[], metadatas=metadatas)
```

क्वेरी करें और डेटा पुनर्प्राप्त करें।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = opensearch.similarity_search(query)
print(docs[0].page_content)
```

मेटाडेटा के साथ क्वेरी करें और डेटा पुनर्प्राप्त करें।

```python
query = "What did the president say about Ketanji Brown Jackson"
metadata = {
    "string_field": "value1",
    "int_field": 1,
    "float_field": 1.0,
    "double_field": 2.0,
}
docs = opensearch.similarity_search(query, filter=metadata)
print(docs[0].page_content)
```

यदि उपयोग के दौरान कोई समस्या होती है, तो कृपया <xingshaomin.xsm@alibaba-inc.com> से संपर्क करें, और हम आपकी सहायता और समर्थन प्रदान करने का पूरा प्रयास करेंगे।
