---
translated: true
---

# LASER 언어 독립적 문장 표현 임베딩 Meta AI

>[LASER](https://github.com/facebookresearch/LASER/)는 Meta AI Research 팀이 개발한 Python 라이브러리로, 2/25/2024 기준 147개 이상의 언어에 대한 다국어 문장 임베딩을 생성하는 데 사용됩니다.
>- 지원되는 언어 목록은 https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200에서 확인할 수 있습니다.

## 종속성

LaserEmbed를 LangChain과 함께 사용하려면 `laser_encoders` Python 패키지를 설치해야 합니다.

```python
%pip install laser_encoders
```

## 가져오기

```python
from langchain_community.embeddings.laser import LaserEmbeddings
```

## Laser 인스턴스화

### 매개변수

- `lang: Optional[str]`
    >비어 있으면 다국어 LASER 인코더 모델("laser2")을 기본적으로 사용합니다.
    지원되는 언어와 lang_codes 목록은 [여기](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200)와 [여기](https://github.com/facebookresearch/LASER/blob/main/laser_encoders/language_list.py)에서 확인할 수 있습니다.

```python
# Ex Instantiationz
embeddings = LaserEmbeddings(lang="eng_Latn")
```

## 사용법

### 문서 임베딩 생성

```python
document_embeddings = embeddings.embed_documents(
    ["This is a sentence", "This is some other sentence"]
)
```

### 쿼리 임베딩 생성

```python
query_embeddings = embeddings.embed_query("This is a query")
```
