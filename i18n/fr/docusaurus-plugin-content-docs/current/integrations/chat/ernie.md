---
sidebar_label: Ernie Bot Chat
translated: true
---

# ErnieBotChat

[ERNIE-Bot](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11) est un modèle de langage de grande taille développé par Baidu, couvrant une énorme quantité de données chinoises.
Ce notebook couvre comment commencer avec les modèles de chat ErnieBot.

**Avertissement de dépréciation**

Nous recommandons aux utilisateurs utilisant `langchain_community.chat_models.ErnieBotChat`
d'utiliser `langchain_community.chat_models.QianfanChatEndpoint` à la place.

la documentation pour `QianfanChatEndpoint` se trouve [ici](/docs/integrations/chat/baidu_qianfan_endpoint/).

ils sont 4 pourquoi nous recommandons aux utilisateurs d'utiliser `QianfanChatEndpoint` :

1. `QianfanChatEndpoint` prend en charge plus de LLM sur la plateforme Qianfan.
2. `QianfanChatEndpoint` prend en charge le mode de diffusion en continu.
3. `QianfanChatEndpoint` prend en charge l'appel de fonction.
4. `ErnieBotChat` manque de maintenance et est déprécié.

Quelques conseils pour la migration :

- changer `ernie_client_id` en `qianfan_ak`, et changer également `ernie_client_secret` en `qianfan_sk`.
- installer le package `qianfan`. comme `pip install qianfan`
- changer `ErnieBotChat` en `QianfanChatEndpoint`.

```python
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint

chat = QianfanChatEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## Utilisation

```python
from langchain_community.chat_models import ErnieBotChat
from langchain_core.messages import HumanMessage

chat = ErnieBotChat(
    ernie_client_id="YOUR_CLIENT_ID", ernie_client_secret="YOUR_CLIENT_SECRET"
)
```

ou vous pouvez définir `client_id` et `client_secret` dans vos variables d'environnement

```bash
export ERNIE_CLIENT_ID=YOUR_CLIENT_ID
export ERNIE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

```python
chat([HumanMessage(content="hello there, who are you?")])
```

```output
AIMessage(content='Hello, I am an artificial intelligence language model. My purpose is to help users answer questions or provide information. What can I do for you?', additional_kwargs={}, example=False)
```
