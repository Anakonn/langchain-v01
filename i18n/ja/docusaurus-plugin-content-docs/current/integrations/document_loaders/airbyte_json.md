---
translated: true
---

# Airbyte JSON (Deprecated)

注意: `AirbyteJSONLoader` は非推奨となりました。代わりに [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte) は、API、データベース、ファイルからデータウェアハウスやレイクへのELTパイプラインのためのデータ統合プラットフォームです。データウェアハウスやデータベースへのELTコネクタのカタログが最も大きいです。

これは、AirbyteのソースからローカルのJSONファイルにデータをロードする方法を説明しています。

前提条件:
Docker Desktopがインストールされていること

手順:

1) GitHubからAirbyteをクローンする - `git clone https://github.com/airbytehq/airbyte.git`

2) Airbyteディレクトリに移動する - `cd airbyte`

3) Airbyteを起動する - `docker compose up`

4) ブラウザで http://localhost:8000 にアクセスする。ユーザー名とパスワードの入力を求められます。デフォルトではユーザー名 `airbyte`、パスワード `password` です。

5) 任意のソースを設定する。

6) 宛先をローカルのJSONに設定し、宛先パスを指定する - `/json_data` などとします。手動同期を設定する。

7) 接続を実行する。

7) 作成されたファイルを確認するには、`file:///tmp/airbyte_local` に移動します。

8) データを見つけ、パスをコピーする。そのパスをファイル変数に保存する。`/tmp/airbyte_local` から始まるはずです。

```python
from langchain_community.document_loaders import AirbyteJSONLoader
```

```python
!ls /tmp/airbyte_local/json_data/
```

```output
_airbyte_raw_pokemon.jsonl
```

```python
loader = AirbyteJSONLoader("/tmp/airbyte_local/json_data/_airbyte_raw_pokemon.jsonl")
```

```python
data = loader.load()
```

```python
print(data[0].page_content[:500])
```

```output
abilities:
ability:
name: blaze
url: https://pokeapi.co/api/v2/ability/66/

is_hidden: False
slot: 1


ability:
name: solar-power
url: https://pokeapi.co/api/v2/ability/94/

is_hidden: True
slot: 3

base_experience: 267
forms:
name: charizard
url: https://pokeapi.co/api/v2/pokemon-form/6/

game_indices:
game_index: 180
version:
name: red
url: https://pokeapi.co/api/v2/version/1/



game_index: 180
version:
name: blue
url: https://pokeapi.co/api/v2/version/2/



game_index: 180
version:
n
```
