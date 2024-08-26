---
translated: true
---

# 화산 엔진

이 노트북은 화산 임베딩 클래스를 로드하는 방법에 대한 안내를 제공합니다.

## API 초기화

[VolcEngine](https://www.volcengine.com/docs/82379/1099455)을 기반으로 한 LLM 서비스를 사용하려면 다음 매개변수를 초기화해야 합니다:

AK, SK를 환경 변수에서 초기화하거나 매개변수에서 초기화할 수 있습니다:

```base
export VOLC_ACCESSKEY=XXX
export VOLC_SECRETKEY=XXX
```

```python
"""For basic init and call"""
import os

from langchain_community.embeddings import VolcanoEmbeddings

os.environ["VOLC_ACCESSKEY"] = ""
os.environ["VOLC_SECRETKEY"] = ""

embed = VolcanoEmbeddings(volcano_ak="", volcano_sk="")
print("embed_documents result:")
res1 = embed.embed_documents(["foo", "bar"])
for r in res1:
    print("", r[:8])
```

```output
embed_documents result:
 [0.02929673343896866, -0.009310632012784481, -0.060323506593704224, 0.0031018739100545645, -0.002218986628577113, -0.0023125179577618837, -0.04864659160375595, -2.062115163425915e-05]
 [0.01987231895327568, -0.026041055098176003, -0.08395249396562576, 0.020043574273586273, -0.028862033039331436, 0.004629664588719606, -0.023107370361685753, -0.0342753604054451]
```

```python
print("embed_query result:")
res2 = embed.embed_query("foo")
print("", r[:8])
```

```output
embed_query result:
 [0.01987231895327568, -0.026041055098176003, -0.08395249396562576, 0.020043574273586273, -0.028862033039331436, 0.004629664588719606, -0.023107370361685753, -0.0342753604054451]
```
