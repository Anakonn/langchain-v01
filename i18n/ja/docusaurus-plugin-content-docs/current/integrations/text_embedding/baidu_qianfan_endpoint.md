---
translated: true
---

# Baidu Qianfan

Baidu AI Cloud Qianfan Platformは、企業開発者向けのワンストップ大規模モデル開発およびサービス運用プラットフォームです。Qianfanは、Wenxin Yiyan（ERNIE-Bot）のモデルやサードパーティのオープンソースモデルを含むだけでなく、さまざまなAI開発ツールと一連の開発環境も提供し、顧客が大規模モデルアプリケーションを簡単に使用および開発できるようにします。

基本的に、これらのモデルは次のタイプに分かれます：

- 埋め込み
- チャット
- 完了

このノートブックでは、主にlangchainの`Embedding`を`langchain/embeddings`パッケージに対応する[Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)の使用方法を紹介します：

## API初期化

Baidu Qianfanに基づくLLMサービスを使用するには、これらのパラメータを初期化する必要があります：

環境変数でAK、SKを初期化するか、パラメータを初期化することができます：

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

## Qianfanで異なるモデルを使用する

Ernie Botやサードパーティのオープンソースモデルに基づいて独自のモデルをデプロイしたい場合は、次の手順に従うことができます：

- 1. （オプション、モデルがデフォルトモデルに含まれている場合は省略）Qianfanコンソールでモデルをデプロイし、独自にカスタマイズしたデプロイエンドポイントを取得します。
- 2. 初期化時に`endpoint`というフィールドを設定します：

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
