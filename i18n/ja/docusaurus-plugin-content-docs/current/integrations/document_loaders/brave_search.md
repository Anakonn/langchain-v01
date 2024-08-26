---
translated: true
---

# Brave Search

>[Brave Search](https://en.wikipedia.org/wiki/Brave_Search)は、Brave Softwareが開発した検索エンジンです。
> - `Brave Search`は独自のWebインデックスを使用しています。2022年5月時点では、100億ページ以上をカバーし、BingのAPIやオプトインベースのGoogle(クライアントサイド)からの検索結果を除いて、92%の検索結果を自社のインデックスから提供しています。Braveによると、スパムやその他の低品質なコンテンツを回避するために、インデックスは「Google やBingよりも意図的に小さく」なっているため、「長尾クエリの回収では、まだGoogleほど良くありません」とのことです。
>- `Brave Search Premium`: 2023年4月時点では、Brave Searchはアド フリーのウェブサイトですが、広告を含むモデルに移行する予定です。プレミアムユーザーはアド フリーの体験を得られます。ユーザーのIPアドレスを含むユーザーデータは、デフォルトでは収集されません。オプトインデータ収集には、プレミアムアカウントが必要になります。

## インストールとセットアップ

Brave Search APIにアクセスするには、[アカウントを作成してAPIキーを取得する](https://api.search.brave.com/app/dashboard)必要があります。

```python
api_key = "..."
```

```python
from langchain_community.document_loaders import BraveSearchLoader
```

## 例

```python
loader = BraveSearchLoader(
    query="obama middle name", api_key=api_key, search_kwargs={"count": 3}
)
docs = loader.load()
len(docs)
```

```output
3
```

```python
[doc.metadata for doc in docs]
```

```output
[{'title': "Obama's Middle Name -- My Last Name -- is 'Hussein.' So?",
  'link': 'https://www.cair.com/cair_in_the_news/obamas-middle-name-my-last-name-is-hussein-so/'},
 {'title': "What's up with Obama's middle name? - Quora",
  'link': 'https://www.quora.com/Whats-up-with-Obamas-middle-name'},
 {'title': 'Barack Obama | Biography, Parents, Education, Presidency, Books, ...',
  'link': 'https://www.britannica.com/biography/Barack-Obama'}]
```

```python
[doc.page_content for doc in docs]
```

```output
['I wasn’t sure whether to laugh or cry a few days back listening to radio talk show host Bill Cunningham repeatedly scream Barack <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong> — my last <strong>name</strong> — as if he had anti-Muslim Tourette’s. “Hussein,” Cunningham hissed like he was beckoning Satan when shouting the ...',
 'Answer (1 of 15): A better question would be, “What’s up with <strong>Obama</strong>’s first <strong>name</strong>?” President Barack Hussein <strong>Obama</strong>’s father’s <strong>name</strong> was Barack Hussein <strong>Obama</strong>. He was <strong>named</strong> after his father. Hussein, <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong>, is a very common Arabic <strong>name</strong>, meaning &quot;good,&quot; &quot;handsome,&quot; or ...',
 'Barack <strong>Obama</strong>, in full Barack Hussein <strong>Obama</strong> II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and the first African American to hold the office. Before winning the presidency, <strong>Obama</strong> represented Illinois in the U.S.']
```
