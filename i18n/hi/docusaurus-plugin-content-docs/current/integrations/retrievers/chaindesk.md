---
translated: true
---

# चेनडेस्क

>[चेनडेस्क प्लेटफॉर्म](https://docs.chaindesk.ai/introduction) किसी भी स्रोत (डेटा स्रोत: टेक्स्ट, PDF, वर्ड, पावरपॉइंट, एक्सेल, नोशन, एयरटेबल, गूगल शीट्स आदि) से डेटा लाता है और उसे डेटास्टोर (एक से अधिक डेटा स्रोतों का कंटेनर) में रखता है।
फिर आप अपने डेटास्टोर को प्लगइन या किसी अन्य बड़े भाषा मॉडल (एलएलएम) के माध्यम से `चेनडेस्क एपीआई` के माध्यम से चैटजीपीटी से जोड़ सकते हैं।

यह नोटबुक [चेनडेस्क](https://www.chaindesk.ai/) के रिट्रीवर का उपयोग करने का तरीका दिखाता है।

पहले, आपको चेनडेस्क के लिए साइन अप करना होगा, एक डेटास्टोर बनाना होगा, कुछ डेटा जोड़ना होगा और अपने डेटास्टोर एपीआई एंडपॉइंट यूआरएल प्राप्त करना होगा। आपको [एपीआई कुंजी](https://docs.chaindesk.ai/api-reference/authentication) की आवश्यकता होगी।

## क्वेरी

अब जब हमारा इंडेक्स सेट हो गया है, तो हम एक रिट्रीवर सेट अप कर सकते हैं और उसे क्वेरी करना शुरू कर सकते हैं।

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
