---
translated: true
---

# TensorFlow 데이터셋

>[TensorFlow 데이터셋](https://www.tensorflow.org/datasets)은 TensorFlow 또는 Jax와 같은 다른 Python ML 프레임워크에서 사용할 수 있는 준비된 데이터셋 모음입니다. 모든 데이터셋은 [tf.data.Datasets](https://www.tensorflow.org/api_docs/python/tf/data/Dataset)로 노출되어 사용하기 쉽고 고성능의 입력 파이프라인을 제공합니다. 시작하려면 [가이드](https://www.tensorflow.org/datasets/overview)와 [데이터셋 목록](https://www.tensorflow.org/datasets/catalog/overview#all_datasets)을 참조하세요.

이 노트북은 문서 형식으로 `TensorFlow 데이터셋`을 로드하는 방법을 보여줍니다.

## 설치

`tensorflow`와 `tensorflow-datasets` Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  tensorflow
```

```python
%pip install --upgrade --quiet  tensorflow-datasets
```

## 예시

예로 [`mlqa/en` 데이터셋](https://www.tensorflow.org/datasets/catalog/mlqa#mlqaen)을 사용합니다.

>`MLQA`(`Multilingual Question Answering Dataset`)는 다국어 질문 답변 성능을 평가하기 위한 벤치마크 데이터셋입니다. 이 데이터셋은 아랍어, 독일어, 스페인어, 영어, 힌디어, 베트남어, 중국어 등 7개 언어로 구성되어 있습니다.
>
>- 홈페이지: https://github.com/facebookresearch/MLQA
>- 소스 코드: `tfds.datasets.mlqa.Builder`
>- 다운로드 크기: 72.21 MiB

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

이제 데이터셋 샘플을 문서 형식으로 변환하는 사용자 정의 함수를 만들어야 합니다.

이것은 필수 사항입니다. TF 데이터셋에는 표준 형식이 없기 때문에 사용자 정의 변환 함수를 만들어야 합니다.

`context` 필드를 `Document.page_content`로 사용하고 다른 필드를 `Document.metadata`에 배치하겠습니다.

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

`TensorflowDatasetLoader`에는 다음과 같은 매개변수가 있습니다:
- `dataset_name`: 로드할 데이터셋의 이름
- `split_name`: 로드할 분할의 이름. 기본값은 "train"입니다.
- `load_max_docs`: 로드할 문서 수의 제한. 기본값은 100입니다.
- `sample_to_document_function`: 데이터셋 샘플을 문서로 변환하는 함수

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
