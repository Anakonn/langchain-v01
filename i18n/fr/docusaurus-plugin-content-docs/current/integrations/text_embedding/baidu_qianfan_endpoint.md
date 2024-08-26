---
translated: true
---

# Baidu Qianfan

La plateforme Baidu AI Cloud Qianfan est une plateforme de développement et d'exploitation de modèles de grande taille tout-en-un pour les développeurs d'entreprise. Qianfan fournit non seulement le modèle Wenxin Yiyan (ERNIE-Bot) et les modèles open-source tiers, mais aussi divers outils de développement IA et l'ensemble de l'environnement de développement, ce qui facilite l'utilisation et le développement d'applications de modèles de grande taille pour les clients.

Fondamentalement, ces modèles sont répartis dans les types suivants :

- Embedding
- Chat
- Completion

Dans ce notebook, nous présenterons comment utiliser langchain avec [Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html) principalement dans `Embedding` correspondant au package `langchain/embeddings` dans langchain :

## Initialisation de l'API

Pour utiliser les services LLM basés sur Baidu Qianfan, vous devez initialiser ces paramètres :

Vous pouvez choisir d'initialiser l'AK, SK dans les variables d'environnement ou d'initialiser les paramètres :

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

## Utiliser différents modèles dans Qianfan

Dans le cas où vous souhaitez déployer votre propre modèle basé sur Ernie Bot ou des modèles open-source tiers, vous pouvez suivre ces étapes :

- 1. (Facultatif, si les modèles sont inclus dans les modèles par défaut, ignorez cette étape) Déployez votre modèle dans la console Qianfan, obtenez votre point de terminaison de déploiement personnalisé.
- 2. Configurez le champ appelé `endpoint` dans l'initialisation :

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
