---
translated: true
---

यह नोटबुक `OneNote` से दस्तावेज़ लोड करने के बारे में कवर करता है।

## पूर्वापेक्षाएं

1. [Microsoft पहचान प्लेटफ़ॉर्म](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) निर्देशों का उपयोग करके एक एप्लिकेशन को पंजीकृत करें।
2. पंजीकरण पूरा होने पर, Azure पोर्टल एप्लिकेशन पंजीकरण के अवलोकन पेन प्रदर्शित करता है। आप एप्लिकेशन (क्लाइंट) आईडी देखते हैं। इसे `क्लाइंट आईडी` भी कहा जाता है, यह मूल्य Microsoft पहचान प्लेटफ़ॉर्म में आपके एप्लिकेशन को अद्वितीय रूप से पहचानता है।
3. **आइटम 1** पर अनुसरण करते समय, आप रीडायरेक्ट URI को `http://localhost:8000/callback` के रूप में सेट कर सकते हैं।
4. **आइटम 1** पर अनुसरण करते समय, एप्लिकेशन गोपनीयता अनुभाग के तहत एक नया पासवर्ड (`client_secret`) उत्पन्न करें।
5. इस [दस्तावेज़](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) पर दिए गए निर्देशों का पालन करें और अपने एप्लिकेशन में `SCOPES` (`Notes.Read`) जोड़ें।
6. आपको `pip install msal` और `pip install beautifulsoup4` कमांड का उपयोग करके msal और bs4 पैकेज स्थापित करने की आवश्यकता है।
7. चरणों के अंत में आपके पास निम्नलिखित मूल्य होने चाहिए:
- `CLIENT_ID`
- `CLIENT_SECRET`

## 🧑 OneNote से आपके दस्तावेजों को इंजेस्ट करने के लिए निर्देश

### 🔑 प्रमाणीकरण

डिफ़ॉल्ट रूप से, `OneNoteLoader` यह मानता है कि `CLIENT_ID` और `CLIENT_SECRET` के मूल्य क्रमशः `MS_GRAPH_CLIENT_ID` और `MS_GRAPH_CLIENT_SECRET` नामक पर्यावरण चर के रूप में संग्रहीत होने चाहिए। आप इन पर्यावरण चरों को अपने एप्लिकेशन की जड़ में `.env` फ़ाइल के माध्यम से या अपने स्क्रिप्ट में निम्नलिखित कमांड का उपयोग करके पास कर सकते हैं।

```python
os.environ['MS_GRAPH_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['MS_GRAPH_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

यह लोडर [*उपयोगकर्ता की ओर से*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0) नामक प्रमाणीकरण का उपयोग करता है। यह 2 चरण का प्रमाणीकरण है जिसमें उपयोगकर्ता सहमति की आवश्यकता होती है। जब आप लोडर को इंस्टैंशिएट करते हैं, तो यह एक URL प्रिंट करेगा जिसे उपयोगकर्ता को आवश्यक अनुमतियों के लिए एप्लिकेशन पर सहमति देने के लिए देखना होगा। उपयोगकर्ता को इस URL पर जाना होगा और एप्लिकेशन को सहमति देनी होगी। फिर उपयोगकर्ता को परिणामी पृष्ठ URL को कॉपी करके कंसोल पर चिपकाना होगा। यदि लॉगिन प्रयास सफल था, तो यह विधि True लौटेगी।

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE")
```

एक बार प्रमाणीकरण हो जाने के बाद, लोडर `~/.credentials/` फ़ोल्डर में एक टोकन (`onenote_graph_token.txt`) संग्रहीत करेगा। इस टोकन का उपयोग बाद में प्रमाणीकरण के लिए किया जा सकता है बिना कॉपी/चिपकाने के चरण के। इस टोकन का उपयोग प्रमाणीकरण के लिए करने के लिए, आपको लोडर के इंस्टैंशिएशन में `auth_with_token` पैरामीटर को True पर बदलना होगा।

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", auth_with_token=True)
```

वैकल्पिक रूप से, आप टोकन को सीधे लोडर को भी पास कर सकते हैं। यह तब उपयोगी है जब आप किसी अन्य एप्लिकेशन द्वारा उत्पन्न किए गए टोकन से प्रमाणीकरण करना चाहते हैं। उदाहरण के लिए, आप [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) का उपयोग करके एक टोकन उत्पन्न कर सकते हैं और फिर उसे लोडर को पास कर सकते हैं।

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", access_token="TOKEN")
```

### 🗂️ दस्तावेज़ लोडर

#### 📑 OneNote नोटबुक से पृष्ठों को लोड करना

`OneNoteLoader` OneDrive में संग्रहीत OneNote नोटबुक से पृष्ठों को लोड कर सकता है। आप किसी विशिष्ट नोटबुक, किसी विशिष्ट अनुभाग या किसी विशिष्ट शीर्षक के तहत संग्रहीत पृष्ठों को फ़िल्टर करने के लिए `notebook_name`, `section_name`, `page_title` का कोई भी संयोजन निर्दिष्ट कर सकते हैं। उदाहरण के लिए, आप उन सभी पृष्ठों को लोड करना चाहते हैं जो OneDrive में `Recipes` नामक अनुभाग के तहत संग्रहीत हैं।

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(section_name="Recipes", auth_with_token=True)
documents = loader.load()
```

#### 📑 पृष्ठ आईडी की सूची से पृष्ठों को लोड करना

एक अन्य संभावना है कि आप लोड करने के लिए प्रत्येक पृष्ठ के `object_ids` की एक सूची प्रदान करें। इसके लिए, आपको [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer) का उपयोग करके सभी दस्तावेज़ आईडी खोजने की आवश्यकता होगी जिनमें आप रुचि रखते हैं। यह [लिंक](https://learn.microsoft.com/en-us/graph/onenote-get-content#page-collection) आपके द्वारा रुचि रखे गए दस्तावेज़ आईडी को पुनर्प्राप्त करने में मददगार होगा।

उदाहरण के लिए, अपने नोटबुक में संग्रहीत सभी पृष्ठों के बारे में जानकारी पुनर्प्राप्त करने के लिए, आपको `https://graph.microsoft.com/v1.0/me/onenote/pages` पर अनुरोध करना होगा। एक बार जब आप उन आईडी की सूची प्राप्त कर लेते हैं जिनमें आप रुचि रखते हैं, तो आप लोडर को निम्नलिखित पैरामीटरों के साथ इंस्टैंशिएट कर सकते हैं।

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
