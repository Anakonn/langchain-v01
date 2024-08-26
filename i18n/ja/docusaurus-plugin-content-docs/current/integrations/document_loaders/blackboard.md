---
translated: true
---

# Blackboard

>[Blackboard Learn](https://en.wikipedia.org/wiki/Blackboard_Learn) (以前は Blackboard Learning Management System) は、Blackboard Inc.が開発したウェブベースの仮想学習環境およびラーニング・マネジメント・システムです。このソフトウェアには、コースの管理、カスタマイズ可能なオープンアーキテクチャ、学生情報システムや認証プロトコルとの統合を可能にするスケーラブルなデザインが特徴です。ローカルサーバーにインストールしたり、`Blackboard ASP Solutions`でホストしたり、Amazon Web Servicesでホストされるソフトウェアとしてサービスとして提供されることがあります。その主な目的は、従来対面で行われていたコースにオンラインの要素を追加したり、対面での会合が少ないか全くない完全オンラインのコースを開発したりすることだとされています。

これは、[Blackboard Learn](https://www.anthology.com/products/teaching-and-learning/learning-effectiveness/blackboard-learn)インスタンスからデータを読み込む方法について説明しています。

このローダーは、すべての`Blackboard`コースと互換性があるわけではありません。新しい`Blackboard`インターフェイスを使用しているコースとのみ互換性があります。
このローダーを使用するには、BbRouterクッキーが必要です。コースにログインし、ブラウザの開発者ツールからBbRouterクッキーの値をコピーすることで、このクッキーを取得できます。

```python
from langchain_community.document_loaders import BlackboardLoader

loader = BlackboardLoader(
    blackboard_course_url="https://blackboard.example.com/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=_123456_1",
    bbrouter="expires:12345...",
    load_all_recursively=True,
)
documents = loader.load()
```
