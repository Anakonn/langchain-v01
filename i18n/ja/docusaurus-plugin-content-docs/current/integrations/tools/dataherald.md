---
translated: true
---

# Dataherald

このノートブックでは、dataheraldコンポーネントの使用方法について説明します。

まず、Dataheraldアカウントを設定し、API KEYを取得する必要があります:

1. dataheraldにアクセスし、[ここ](https://www.dataherald.com/)から登録します
2. ログイン後のAdmin Consoleで、API KEYを作成します
3. pip install dataherald

次に、いくつかの環境変数を設定する必要があります:
1. API KEYをDATAHERALD_API_KEY環境変数に保存します

```python
pip install dataherald
```

```python
import os

os.environ["DATAHERALD_API_KEY"] = ""
```

```python
from langchain_community.utilities.dataherald import DataheraldAPIWrapper
```

```python
dataherald = DataheraldAPIWrapper(db_connection_id="65fb766367dd22c99ce1a12d")
```

```python
dataherald.run("How many employees are in the company?")
```

```output
'select COUNT(*) from employees'
```
