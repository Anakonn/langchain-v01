---
sidebar_label: Tencent Hunyuan
translated: true
---

# Tencent Hunyuan

>[L'API de modèle hybride de Tencent](https://cloud.tencent.com/document/product/1729) (`API Hunyuan`)
> met en œuvre la communication dialogique, la génération de contenu,
> l'analyse et la compréhension, et peut être largement utilisée dans divers scénarios tels que le service
> client intelligent, le marketing intelligent, le jeu de rôle, la rédaction publicitaire, la description de produit,
> la création de scripts, la génération de CV, la rédaction d'articles, la génération de code, l'analyse de données et l'analyse de contenu.

Voir [plus d'informations](https://cloud.tencent.com/document/product/1729).

```python
from langchain_community.chat_models import ChatHunyuan
from langchain_core.messages import HumanMessage
```

```python
chat = ChatHunyuan(
    hunyuan_app_id=111111111,
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessage(content="J'aime programmer.")
```

## Pour ChatHunyuan avec diffusion en continu

```python
chat = ChatHunyuan(
    hunyuan_app_id="YOUR_APP_ID",
    hunyuan_secret_id="YOUR_SECRET_ID",
    hunyuan_secret_key="YOUR_SECRET_KEY",
    streaming=True,
)
```

```python
chat(
    [
        HumanMessage(
            content="You are a helpful assistant that translates English to French.Translate this sentence from English to French. I love programming."
        )
    ]
)
```

```output
AIMessageChunk(content="J'aime programmer.")
```
