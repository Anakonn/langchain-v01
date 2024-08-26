---
translated: true
---

# TensorFlow डेटासेट्स

>[TensorFlow डेटासेट्स](https://www.tensorflow.org/datasets) एक ऐसा संग्रह है जो तैयार उपयोग के लिए डेटासेट्स प्रदान करता है, जिसका उपयोग TensorFlow या अन्य Python ML फ्रेमवर्क्स, जैसे Jax, में किया जा सकता है। सभी डेटासेट्स को [tf.data.Datasets](https://www.tensorflow.org/api_docs/python/tf/data/Dataset) के रूप में प्रदर्शित किया जाता है, जो आसान-से-उपयोग और उच्च-प्रदर्शन इनपुट पाइपलाइन को सक्षम करता है। शुरू करने के लिए [गाइड](https://www.tensorflow.org/datasets/overview) और [डेटासेट्स की सूची](https://www.tensorflow.org/datasets/catalog/overview#all_datasets) देखें।

यह नोटबुक दिखाता है कि `TensorFlow डेटासेट्स` को किस तरह से डॉक्यूमेंट प्रारूप में लोड किया जा सकता है जिसका उपयोग आगे किया जा सकता है।

## इंस्टॉलेशन

आपको `tensorflow` और `tensorflow-datasets` पायथन पैकेज इंस्टॉल करने की आवश्यकता है।

```python
%pip install --upgrade --quiet  tensorflow
```

```python
%pip install --upgrade --quiet  tensorflow-datasets
```

## उदाहरण

उदाहरण के लिए, हम [`mlqa/en` डेटासेट](https://www.tensorflow.org/datasets/catalog/mlqa#mlqaen) का उपयोग करते हैं।

>`MLQA` (`बहुभाषीय प्रश्न उत्तर डेटासेट`) बहुभाषीय प्रश्न उत्तर प्रदर्शन का मूल्यांकन करने के लिए एक बेंचमार्क डेटासेट है। यह डेटासेट 7 भाषाओं से मिलकर बना है: अरबी, जर्मन, स्पेनिश, अंग्रेजी, हिंदी, वियतनामी, चीनी।
>
>- होमपेज: https://github.com/facebookresearch/MLQA
>- सोर्स कोड: `tfds.datasets.mlqa.Builder`
>- डाउनलोड आकार: 72.21 MiB

```python
# Feature structure of `mlqa/en` dataset:

FeaturesDict(
    {
        "answers": Sequence(
            {
                "answer_start": int32,
                "text": Text(shape=(), dtype=string),
            }
        ),
        "context": Text(shape=(), dtype=string),
        "id": string,
        "question": Text(shape=(), dtype=string),
        "title": Text(shape=(), dtype=string),
    }
)
```

```python
import tensorflow as tf
import tensorflow_datasets as tfds
```

```python
# try directly access this dataset:
ds = tfds.load("mlqa/en", split="test")
ds = ds.take(1)  # Only take a single example
ds
```

```output
<_TakeDataset element_spec={'answers': {'answer_start': TensorSpec(shape=(None,), dtype=tf.int32, name=None), 'text': TensorSpec(shape=(None,), dtype=tf.string, name=None)}, 'context': TensorSpec(shape=(), dtype=tf.string, name=None), 'id': TensorSpec(shape=(), dtype=tf.string, name=None), 'question': TensorSpec(shape=(), dtype=tf.string, name=None), 'title': TensorSpec(shape=(), dtype=tf.string, name=None)}>
```

अब हमें डेटासेट नमूने को एक दस्तावेज़ में रूपांतरित करने के लिए एक कस्टम फ़ंक्शन बनाना होगा।

यह एक आवश्यकता है। TF डेटासेट्स के लिए कोई मानक प्रारूप नहीं है इसलिए हमें एक कस्टम रूपांतरण फ़ंक्शन बनाना होगा।

चलिए `context` फ़ील्ड को `Document.page_content` के रूप में उपयोग करें और अन्य फ़ील्ड्स को `Document.metadata` में रखें।

```python
from langchain_core.documents import Document


def decode_to_str(item: tf.Tensor) -> str:
    return item.numpy().decode("utf-8")


def mlqaen_example_to_document(example: dict) -> Document:
    return Document(
        page_content=decode_to_str(example["context"]),
        metadata={
            "id": decode_to_str(example["id"]),
            "title": decode_to_str(example["title"]),
            "question": decode_to_str(example["question"]),
            "answer": decode_to_str(example["answers"]["text"][0]),
        },
    )


for example in ds:
    doc = mlqaen_example_to_document(example)
    print(doc)
    break
```

```output
page_content='After completing the journey around South America, on 23 February 2006, Queen Mary 2 met her namesake, the original RMS Queen Mary, which is permanently docked at Long Beach, California. Escorted by a flotilla of smaller ships, the two Queens exchanged a "whistle salute" which was heard throughout the city of Long Beach. Queen Mary 2 met the other serving Cunard liners Queen Victoria and Queen Elizabeth 2 on 13 January 2008 near the Statue of Liberty in New York City harbour, with a celebratory fireworks display; Queen Elizabeth 2 and Queen Victoria made a tandem crossing of the Atlantic for the meeting. This marked the first time three Cunard Queens have been present in the same location. Cunard stated this would be the last time these three ships would ever meet, due to Queen Elizabeth 2\'s impending retirement from service in late 2008. However this would prove not to be the case, as the three Queens met in Southampton on 22 April 2008. Queen Mary 2 rendezvoused with Queen Elizabeth 2  in Dubai on Saturday 21 March 2009, after the latter ship\'s retirement, while both ships were berthed at Port Rashid. With the withdrawal of Queen Elizabeth 2 from Cunard\'s fleet and its docking in Dubai, Queen Mary 2 became the only ocean liner left in active passenger service.' metadata={'id': '5116f7cccdbf614d60bcd23498274ffd7b1e4ec7', 'title': 'RMS Queen Mary 2', 'question': 'What year did Queen Mary 2 complete her journey around South America?', 'answer': '2006'}

2023-08-03 14:27:08.482983: W tensorflow/core/kernels/data/cache_dataset_ops.cc:854] The calling iterator did not fully read the dataset being cached. In order to avoid unexpected truncation of the dataset, the partially cached contents of the dataset  will be discarded. This can happen if you have an input pipeline similar to `dataset.cache().take(k).repeat()`. You should use `dataset.take(k).cache().repeat()` instead.
```

```python
from langchain_community.document_loaders import TensorflowDatasetLoader
from langchain_core.documents import Document

loader = TensorflowDatasetLoader(
    dataset_name="mlqa/en",
    split_name="test",
    load_max_docs=3,
    sample_to_document_function=mlqaen_example_to_document,
)
```

`TensorflowDatasetLoader` में ये पैरामीटर हैं:
- `dataset_name`: लोड करने के लिए डेटासेट का नाम
- `split_name`: लोड करने के लिए स्प्लिट का नाम। डिफ़ॉल्ट "train" है।
- `load_max_docs`: लोड किए जाने वाले दस्तावेजों की अधिकतम संख्या। डिफ़ॉल्ट 100 है।
- `sample_to_document_function`: एक डेटासेट नमूने को दस्तावेज़ में रूपांतरित करने वाली फ़ंक्शन

```python
docs = loader.load()
len(docs)
```

```output
2023-08-03 14:27:22.998964: W tensorflow/core/kernels/data/cache_dataset_ops.cc:854] The calling iterator did not fully read the dataset being cached. In order to avoid unexpected truncation of the dataset, the partially cached contents of the dataset  will be discarded. This can happen if you have an input pipeline similar to `dataset.cache().take(k).repeat()`. You should use `dataset.take(k).cache().repeat()` instead.
```

```output
3
```

```python
docs[0].page_content
```

```output
'After completing the journey around South America, on 23 February 2006, Queen Mary 2 met her namesake, the original RMS Queen Mary, which is permanently docked at Long Beach, California. Escorted by a flotilla of smaller ships, the two Queens exchanged a "whistle salute" which was heard throughout the city of Long Beach. Queen Mary 2 met the other serving Cunard liners Queen Victoria and Queen Elizabeth 2 on 13 January 2008 near the Statue of Liberty in New York City harbour, with a celebratory fireworks display; Queen Elizabeth 2 and Queen Victoria made a tandem crossing of the Atlantic for the meeting. This marked the first time three Cunard Queens have been present in the same location. Cunard stated this would be the last time these three ships would ever meet, due to Queen Elizabeth 2\'s impending retirement from service in late 2008. However this would prove not to be the case, as the three Queens met in Southampton on 22 April 2008. Queen Mary 2 rendezvoused with Queen Elizabeth 2  in Dubai on Saturday 21 March 2009, after the latter ship\'s retirement, while both ships were berthed at Port Rashid. With the withdrawal of Queen Elizabeth 2 from Cunard\'s fleet and its docking in Dubai, Queen Mary 2 became the only ocean liner left in active passenger service.'
```

```python
docs[0].metadata
```

```output
{'id': '5116f7cccdbf614d60bcd23498274ffd7b1e4ec7',
 'title': 'RMS Queen Mary 2',
 'question': 'What year did Queen Mary 2 complete her journey around South America?',
 'answer': '2006'}
```
