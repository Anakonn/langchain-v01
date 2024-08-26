---
translated: true
---

# Baidu Qianfan

La plataforma Baidu AI Cloud Qianfan es una plataforma de desarrollo y operación de modelos grandes de un solo paso para desarrolladores empresariales. Qianfan no solo proporciona el modelo de Wenxin Yiyan (ERNIE-Bot) y los modelos de código abierto de terceros, sino que también proporciona varias herramientas de desarrollo de IA y todo el conjunto de entorno de desarrollo, lo que facilita a los clientes el uso y el desarrollo de aplicaciones de modelos grandes.

Básicamente, esos modelos se dividen en los siguientes tipos:

- Embedding
- Chat
- Completion

En este cuaderno, presentaremos cómo usar langchain con [Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html) principalmente en `Embedding` correspondiente al paquete `langchain/embeddings` en langchain:

## Inicialización de la API

Para usar los servicios de LLM basados en Baidu Qianfan, debe inicializar estos parámetros:

Puede elegir inicializar el AK, SK en variables de entorno o inicializar los parámetros:

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

## Usar diferentes modelos en Qianfan

En el caso de que desee implementar su propio modelo basado en Ernie Bot o en modelos de código abierto de terceros, puede seguir estos pasos:

- 1. (Opcional, si los modelos están incluidos en los modelos predeterminados, omítalo) Implemente su modelo en la consola de Qianfan, obtenga su propio punto final de implementación personalizado.
- 2. Establezca el campo llamado `endpoint` en la inicialización:

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
