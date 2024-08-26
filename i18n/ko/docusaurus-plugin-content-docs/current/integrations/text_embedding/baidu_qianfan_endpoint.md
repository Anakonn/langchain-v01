---
translated: true
---

# 바이두 Qianfan

바이두 AI 클라우드 Qianfan 플랫폼은 기업 개발자를 위한 원스톱 대규모 모델 개발 및 서비스 운영 플랫폼입니다. Qianfan은 Wenxin Yiyan(ERNIE-Bot) 모델과 타사 오픈 소스 모델을 제공할 뿐만 아니라 다양한 AI 개발 도구와 전체 개발 환경을 제공하여 고객이 대규모 모델 애플리케이션을 쉽게 사용하고 개발할 수 있습니다.

기본적으로 이러한 모델은 다음과 같은 유형으로 구분됩니다:

- 임베딩
- 채팅
- 완성

이 노트북에서는 주로 `langchain/embeddings` 패키지에 해당하는 `Embedding`을 사용하여 [Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)과 langchain을 사용하는 방법을 소개합니다:

## API 초기화

바이두 Qianfan 기반 LLM 서비스를 사용하려면 다음 매개변수를 초기화해야 합니다:

AK, SK를 환경 변수에서 선택하거나 매개변수에서 초기화할 수 있습니다:

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```

```python
"""For basic init and call"""
import os

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

os.environ["QIANFAN_AK"] = "your_ak"
os.environ["QIANFAN_SK"] = "your_sk"

embed = QianfanEmbeddingsEndpoint(
    # qianfan_ak='xxx',
    # qianfan_sk='xxx'
)
res = embed.embed_documents(["hi", "world"])


async def aioEmbed():
    res = await embed.aembed_query("qianfan")
    print(res[:8])


await aioEmbed()


async def aioEmbedDocs():
    res = await embed.aembed_documents(["hi", "world"])
    for r in res:
        print("", r[:8])


await aioEmbedDocs()
```

```output
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: trying to refresh access_token
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: successfully refresh access_token
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: requesting llm api endpoint: /embeddings/embedding-v1
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: async requesting llm api endpoint: /embeddings/embedding-v1
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: async requesting llm api endpoint: /embeddings/embedding-v1

[-0.03313107788562775, 0.052325375378131866, 0.04951248690485954, 0.0077608139254152775, -0.05907672271132469, -0.010798933915793896, 0.03741293027997017, 0.013969100080430508]
 [0.0427522286772728, -0.030367236584424973, -0.14847028255462646, 0.055074431002140045, -0.04177454113960266, -0.059512972831726074, -0.043774791061878204, 0.0028191760648041964]
 [0.03803155943751335, -0.013231384567916393, 0.0032379645854234695, 0.015074018388986588, -0.006529552862048149, -0.13813287019729614, 0.03297128155827522, 0.044519297778606415]
```

## Qianfan의 다른 모델 사용

Ernie Bot 또는 타사 오픈 소스 모델 기반으로 자체 모델을 배포하려는 경우 다음 단계를 따르세요:

- 1. (기본 모델에 포함된 경우 건너뛰기) Qianfan 콘솔에 모델을 배포하고 사용자 지정 배포 엔드포인트를 가져옵니다.
- 2. 초기화에서 `endpoint` 필드를 설정합니다:

```python
embed = QianfanEmbeddingsEndpoint(model="bge_large_zh", endpoint="bge_large_zh")

res = embed.embed_documents(["hi", "world"])
for r in res:
    print(r[:8])
```

```output
[INFO] [09-15 20:01:40] logging.py:55 [t:140292313159488]: requesting llm api endpoint: /embeddings/bge_large_zh

[-0.0001582596160005778, -0.025089964270591736, -0.03997539356350899, 0.013156415894627571, 0.000135212714667432, 0.012428865768015385, 0.016216561198234558, -0.04126659780740738]
[0.0019113451708108187, -0.008625439368188381, -0.0531032420694828, -0.0018436014652252197, -0.01818147301673889, 0.010310115292668343, -0.008867680095136166, -0.021067561581730843]
```
