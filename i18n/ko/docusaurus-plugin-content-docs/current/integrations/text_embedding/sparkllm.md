---
translated: true
---

# SparkLLM 텍스트 임베딩

공식 웹사이트: https://www.xfyun.cn/doc/spark/Embedding_new_api.html

이 임베딩 모델을 사용하려면 API 키가 필요합니다. https://platform.SparkLLM-ai.com/docs/text-Embedding에서 등록하여 API 키를 받을 수 있습니다.

SparkLLMTextEmbeddings는 2K 토큰 창을 지원하며 2560 차원의 벡터를 생성합니다.

```python
from langchain_community.embeddings import SparkLLMTextEmbeddings

embeddings = SparkLLMTextEmbeddings(
    spark_app_id="<spark_app_id>",
    spark_api_key="<spark_api_key>",
    spark_api_secret="<spark_api_secret>",
)
```

또한 다음과 같이 API 키를 설정할 수 있습니다:

```python
text_q = "Introducing iFlytek"

text_1 = "Science and Technology Innovation Company Limited, commonly known as iFlytek, is a leading Chinese technology company specializing in speech recognition, natural language processing, and artificial intelligence. With a rich history and remarkable achievements, iFlytek has emerged as a frontrunner in the field of intelligent speech and language technologies.iFlytek has made significant contributions to the advancement of human-computer interaction through its cutting-edge innovations. Their advanced speech recognition technology has not only improved the accuracy and efficiency of voice input systems but has also enabled seamless integration of voice commands into various applications and devices.The company's commitment to research and development has been instrumental in its success. iFlytek invests heavily in fostering talent and collaboration with academic institutions, resulting in groundbreaking advancements in speech synthesis and machine translation. Their dedication to innovation has not only transformed the way we communicate but has also enhanced accessibility for individuals with disabilities."

text_2 = "Moreover, iFlytek's impact extends beyond domestic boundaries, as they actively promote international cooperation and collaboration in the field of artificial intelligence. They have consistently participated in global competitions and contributed to the development of international standards.In recognition of their achievements, iFlytek has received numerous accolades and awards both domestically and internationally. Their contributions have revolutionized the way we interact with technology and have paved the way for a future where voice-based interfaces play a vital role.Overall, iFlytek is a trailblazer in the field of intelligent speech and language technologies, and their commitment to innovation and excellence deserves commendation."

query_result = embeddings.embed_query(text_q)
query_result[:8]
```

```output
[-0.043609619140625,
 0.2017822265625,
 0.0270843505859375,
 -0.250244140625,
 -0.024993896484375,
 -0.0382080078125,
 0.06207275390625,
 -0.0146331787109375]
```

```python
doc_result = embeddings.embed_documents([text_1, text_2])
doc_result[0][:8]
```

```output
[-0.161865234375,
 0.58984375,
 0.998046875,
 0.365966796875,
 0.72900390625,
 0.6015625,
 -0.8408203125,
 -0.2666015625]
```
