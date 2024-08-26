---
translated: true
---

# मास्टोडन

>[मास्टोडन](https://joinmastodon.org/) एक संघीय सोशल मीडिया और सोशल नेटवर्किंग सेवा है।

यह लोडर `मास्टोडन.पाई` पायथन पैकेज का उपयोग करके एक सूची के `मास्टोडन` खातों के "टूट्स" से पाठ प्राप्त करता है।

सार्वजनिक खातों को डिफ़ॉल्ट रूप से किसी भी प्रमाणीकरण के बिना क्वेरी किया जा सकता है। यदि गैर-सार्वजनिक खाते या उदाहरण क्वेरी किए जाते हैं, तो आपको अपने खाते के लिए एक एप्लिकेशन पंजीकृत करना होगा जो आपको एक एक्सेस टोकन प्राप्त करता है, और उस टोकन और आपके खाते के एपीआई आधार यूआरएल को सेट करना होगा।

फिर आपको उन मास्टोडन खाता नामों को पास करना होगा जिनसे आप सामग्री निकालना चाहते हैं, `@account@instance` प्रारूप में।

```python
from langchain_community.document_loaders import MastodonTootsLoader
```

```python
%pip install --upgrade --quiet  Mastodon.py
```

```python
loader = MastodonTootsLoader(
    mastodon_accounts=["@Gargron@mastodon.social"],
    number_toots=50,  # Default value is 100
)

# Or set up access information to use a Mastodon app.
# Note that the access token can either be passed into
# constructor or you can set the environment "MASTODON_ACCESS_TOKEN".
# loader = MastodonTootsLoader(
#     access_token="<ACCESS TOKEN OF MASTODON APP>",
#     api_base_url="<API BASE URL OF MASTODON APP INSTANCE>",
#     mastodon_accounts=["@Gargron@mastodon.social"],
#     number_toots=50,  # Default value is 100
# )
```

```python
documents = loader.load()
for doc in documents[:3]:
    print(doc.page_content)
    print("=" * 80)
```

```output
<p>It is tough to leave this behind and go back to reality. And some people live here! I’m sure there are downsides but it sounds pretty good to me right now.</p>
================================================================================
<p>I wish we could stay here a little longer, but it is time to go home 🥲</p>
================================================================================
<p>Last day of the honeymoon. And it’s <a href="https://mastodon.social/tags/caturday" class="mention hashtag" rel="tag">#<span>caturday</span></a>! This cute tabby came to the restaurant to beg for food and got some chicken.</p>
================================================================================
```

टूट पाठ (दस्तावेज़ के `page_content`) डिफ़ॉल्ट रूप से मास्टोडन एपीआई द्वारा लौटाए गए एचटीएमएल है।
