---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/tensorflow_datasets
translated: false
---

# TensorFlow Datasets

>[TensorFlow Datasets](https://www.tensorflow.org/datasets) is a collection of datasets ready to use, with TensorFlow or other Python ML frameworks, such as Jax. All datasets are exposed as [tf.data.Datasets](https://www.tensorflow.org/api_docs/python/tf/data/Dataset), enabling easy-to-use and high-performance input pipelines. To get started see the [guide](https://www.tensorflow.org/datasets/overview) and the [list of datasets](https://www.tensorflow.org/datasets/catalog/overview#all_datasets).

This notebook shows how to load `TensorFlow Datasets` into a Document format that we can use downstream.

## Installation

You need to install `tensorflow` and `tensorflow-datasets` python packages.

```python
%pip install --upgrade --quiet  tensorflow
```

```python
%pip install --upgrade --quiet  tensorflow-datasets
```

## Example

As an example, we use the [`mlqa/en` dataset](https://www.tensorflow.org/datasets/catalog/mlqa#mlqaen).

>`MLQA` (`Multilingual Question Answering Dataset`) is a benchmark dataset for evaluating multilingual question answering performance. The dataset consists of 7 languages: Arabic, German, Spanish, English, Hindi, Vietnamese, Chinese.
>
>- Homepage: https://github.com/facebookresearch/MLQA
>- Source code: `tfds.datasets.mlqa.Builder`
>- Download size: 72.21 MiB

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

Now we have to create a custom function to convert dataset sample into a Document.

This is a requirement. There is no standard format for the TF datasets that's why we need to make a custom transformation function.

Let's use `context` field as the `Document.page_content` and place other fields in the `Document.metadata`.

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

`TensorflowDatasetLoader` has these parameters:
- `dataset_name`: the name of the dataset to load
- `split_name`: the name of the split to load. Defaults to "train".
- `load_max_docs`: a limit to the number of loaded documents. Defaults to 100.
- `sample_to_document_function`: a function that converts a dataset sample to a Document

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