---
translated: true
---

# 체인데스크

>[체인데스크 플랫폼](https://docs.chaindesk.ai/introduction)은 텍스트, PDF, Word, PowerPoint, Excel, Notion, Airtable, Google Sheets 등 다양한 데이터 소스에서 데이터를 가져와 데이터 저장소(Datastore)에 통합합니다.
그런 다음 이 데이터 저장소를 ChatGPT 플러그인 또는 `Chaindesk API`를 통해 다른 대규모 언어 모델(LLM)에 연결할 수 있습니다.

이 노트북은 [체인데스크](https://www.chaindesk.ai/)의 리트리버 사용 방법을 보여줍니다.

먼저 체인데스크에 가입하고, 데이터 저장소를 만들고, 데이터를 추가한 다음 데이터 저장소 API 엔드포인트 URL을 가져와야 합니다. [API 키](https://docs.chaindesk.ai/api-reference/authentication)도 필요합니다.

## 쿼리

이제 인덱스가 설정되었으므로 리트리버를 설정하고 쿼리를 시작할 수 있습니다.

```python
from langchain_community.retrievers import ChaindeskRetriever
```

```python
retriever = ChaindeskRetriever(
    datastore_url="https://clg1xg2h80000l708dymr0fxc.chaindesk.ai/query",
    # api_key="CHAINDESK_API_KEY", # optional if datastore is public
    # top_k=10 # optional
)
```

```python
retriever.invoke("What is Daftpage?")
```

```output
[Document(page_content='✨ Made with DaftpageOpen main menuPricingTemplatesLoginSearchHelpGetting StartedFeaturesAffiliate ProgramGetting StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!DaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord', metadata={'source': 'https:/daftpage.com/help/getting-started', 'score': 0.8697265}),
 Document(page_content="✨ Made with DaftpageOpen main menuPricingTemplatesLoginSearchHelpGetting StartedFeaturesAffiliate ProgramHelp CenterWelcome to Daftpage’s help center—the one-stop shop for learning everything about building websites with Daftpage.Daftpage is the simplest way to create websites for all purposes in seconds. Without knowing how to code, and for free!Get StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!Start here✨ Create your first site🧱 Add blocks🚀 PublishGuides🔖 Add a custom domainFeatures🔥 Drops🎨 Drawings👻 Ghost mode💀 Skeleton modeCant find the answer you're looking for?mail us at support@daftpage.comJoin the awesome Daftpage community on: 👾 DiscordDaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord", metadata={'source': 'https:/daftpage.com/help', 'score': 0.86570895}),
 Document(page_content=" is the simplest way to create websites for all purposes in seconds. Without knowing how to code, and for free!Get StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!Start here✨ Create your first site🧱 Add blocks🚀 PublishGuides🔖 Add a custom domainFeatures🔥 Drops🎨 Drawings👻 Ghost mode💀 Skeleton modeCant find the answer you're looking for?mail us at support@daftpage.comJoin the awesome Daftpage community on: 👾 DiscordDaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord", metadata={'source': 'https:/daftpage.com/help', 'score': 0.8645384})]
```
