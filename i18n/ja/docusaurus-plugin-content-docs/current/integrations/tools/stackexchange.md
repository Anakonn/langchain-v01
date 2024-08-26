---
translated: true
---

# StackExchange

>[Stack Exchange](https://stackexchange.com/)は、さまざまな分野の質問と回答(Q&A)のウェブサイトのネットワークで、各サイトが特定のトピックをカバーし、質問、回答、ユーザーが評判システムの対象となっています。この評判システムにより、サイトは自己管理が可能になります。

The ``StackExchange`` コンポーネントは、LangChainにStackExchangeのAPIを統合し、Stack Exchangeネットワークの[StackOverflow](https://stackoverflow.com/)サイトにアクセスできるようにします。Stack Overflowはコンピュータープログラミングに焦点を当てています。

このノートブックでは、``StackExchange``コンポーネントの使用方法について説明します。

まず、Stack Exchange APIを実装するpythonパッケージ stackapiをインストールする必要があります。

```python
pip install --upgrade stackapi
```

```python
from langchain_community.utilities import StackExchangeAPIWrapper

stackexchange = StackExchangeAPIWrapper()

stackexchange.run("zsh: command not found: python")
```
