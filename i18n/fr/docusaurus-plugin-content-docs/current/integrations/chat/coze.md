---
sidebar_label: Chat Coze
translated: true
---

# Discuter avec le bot Coze

API des modèles de chat ChatCoze par coze.com. Pour plus d'informations, voir [https://www.coze.com/open/docs/chat](https://www.coze.com/open/docs/chat)

```python
from langchain_community.chat_models import ChatCoze
from langchain_core.messages import HumanMessage
```

```python
chat = ChatCoze(
    coze_api_base="YOUR_API_BASE",
    coze_api_key="YOUR_API_KEY",
    bot_id="YOUR_BOT_ID",
    user="YOUR_USER_ID",
    conversation_id="YOUR_CONVERSATION_ID",
    streaming=False,
)
```

Alternativement, vous pouvez définir votre clé API et la base API avec :

```python
import os

os.environ["COZE_API_KEY"] = "YOUR_API_KEY"
os.environ["COZE_API_BASE"] = "YOUR_API_BASE"
```

```python
chat([HumanMessage(content="什么是扣子(coze)")])
```

```output
AIMessage(content='为你找到关于coze的信息如下：

Coze是一个由字节跳动推出的AI聊天机器人和应用程序编辑开发平台。

用户无论是否有编程经验，都可以通过该平台快速创建各种类型的聊天机器人、智能体、AI应用和插件，并将其部署在社交平台和即时聊天应用程序中。

国际版使用的模型比国内版更强大。')
```

## Discuter avec le flux Coze

```python
chat = ChatCoze(
    coze_api_base="YOUR_API_BASE",
    coze_api_key="YOUR_API_KEY",
    bot_id="YOUR_BOT_ID",
    user="YOUR_USER_ID",
    conversation_id="YOUR_CONVERSATION_ID",
    streaming=True,
)
```

```python
chat([HumanMessage(content="什么是扣子(coze)")])
```

```output
AIMessageChunk(content='为你查询到Coze是一个由字节跳动推出的AI聊天机器人和应用程序编辑开发平台。')
```
