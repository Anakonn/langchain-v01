---
translated: true
---

# माइक्रोसॉफ्ट OneDrive

>[माइक्रोसॉफ्ट OneDrive](https://en.wikipedia.org/wiki/OneDrive) (पहले `SkyDrive`) माइक्रोसॉफ्ट द्वारा संचालित एक फ़ाइल होस्टिंग सेवा है।

यह नोटबुक `OneDrive` से दस्तावेज़ लोड करने के बारे में कवर करता है। वर्तमान में, केवल docx, doc और pdf फ़ाइलों का समर्थन किया जाता है।

## पूर्वापेक्षाएं

1. [माइक्रोसॉफ्ट आइडेंटिटी प्लेटफॉर्म](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) के निर्देशों का पालन करते हुए एक एप्लिकेशन पंजीकृत करें।
2. पंजीकरण पूरा होने पर, Azure पोर्टल एप्लिकेशन पंजीकरण के अवलोकन पेन प्रदर्शित करता है। आप एप्लिकेशन (क्लाइंट) ID देखते हैं। इसे `क्लाइंट ID` भी कहा जाता है, यह मूल्य माइक्रोसॉफ्ट आइडेंटिटी प्लेटफॉर्म में आपके एप्लिकेशन को अद्वितीय रूप से पहचानता है।
3. **आइटम 1** में आप जो कदम अनुसरण कर रहे हैं, उनमें आप रीडायरेक्ट URI को `http://localhost:8000/callback` के रूप में सेट कर सकते हैं।
4. **आइटम 1** में आप जो कदम अनुसरण कर रहे हैं, उनमें एप्लिकेशन सीक्रेट्स अनुभाग के तहत एक नया पासवर्ड (`client_secret`) जनरेट करें।
5. इस [दस्तावेज़](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) के निर्देशों का पालन करें ताकि आप अपने एप्लिकेशन में निम्नलिखित `SCOPES` (`offline_access` और `Files.Read.All`) जोड़ सकें।
6. [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) पर जाएं ताकि आप अपना `OneDrive ID` प्राप्त कर सकें। पहला कदम यह सुनिश्चित करना है कि आप अपने OneDrive खाते से जुड़े खाते में लॉग इन हैं। फिर आपको `https://graph.microsoft.com/v1.0/me/drive` पर एक अनुरोध करना होगा और प्रतिक्रिया में एक फ़ील्ड `id` होगा जो आपके OneDrive खाते की ID को धारण करता है।
7. आपको `pip install o365` कमांड का उपयोग करके o365 पैकेज इंस्टॉल करना होगा।
8. चरणों को पूरा करने के बाद आपके पास निम्नलिखित मूल्य होने चाहिए:
- `CLIENT_ID`
- `CLIENT_SECRET`
- `DRIVE_ID`

## 🧑 OneDrive से आपके दस्तावेजों को इंजेस्ट करने के लिए निर्देश

### 🔑 प्रमाणीकरण

डिफ़ॉल्ट रूप से, `OneDriveLoader` यह मानता है कि `CLIENT_ID` और `CLIENT_SECRET` के मूल्य क्रमशः `O365_CLIENT_ID` और `O365_CLIENT_SECRET` नामक पर्यावरण चर के रूप में संग्रहीत होने चाहिए। आप इन पर्यावरण चरों को अपने एप्लिकेशन की जड़ में एक `.env` फ़ाइल के माध्यम से या अपने स्क्रिप्ट में निम्नलिखित कमांड का उपयोग करके पास कर सकते हैं।

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

यह लोडर [*उपयोगकर्ता की ओर से*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0) नामक प्रमाणीकरण का उपयोग करता है। यह 2 चरण का प्रमाणीकरण है जिसमें उपयोगकर्ता सहमति देता है। जब आप लोडर को इंस्टैंशिएट करते हैं, तो यह एक URL प्रिंट करेगा जिसे उपयोगकर्ता को विज़िट करना होगा ताकि वह आवश्यक अनुमतियों के लिए एप्लिकेशन को सहमति दे सके। उपयोगकर्ता को फिर इस URL पर जाना होगा और एप्लिकेशन को सहमति देनी होगी। फिर उपयोगकर्ता को परिणामी पृष्ठ URL को कॉपी करके कंसोल पर पेस्ट करना होगा। यदि लॉगिन प्रयास सफल था, तो यह विधि True लौटाएगी।

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID")
```

एक बार प्रमाणीकरण हो जाने के बाद, लोडर `~/.credentials/` फ़ोल्डर में एक टोकन (`o365_token.txt`) संग्रहीत करेगा। इस टोकन का उपयोग बाद में प्रमाणीकरण के लिए किया जा सकता है बिना कॉपी/पेस्ट चरणों के जो पहले समझाए गए थे। इस टोकन का उपयोग प्रमाणीकरण के लिए करने के लिए, आपको लोडर के इंस्टैंशिएशन में `auth_with_token` पैरामीटर को True पर बदलना होगा।

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", auth_with_token=True)
```

### 🗂️ दस्तावेज़ लोडर

#### 📑 OneDrive डायरेक्टरी से दस्तावेज़ लोड करना

`OneDriveLoader` आपके OneDrive के भीतर एक विशिष्ट फ़ोल्डर से दस्तावेज़ लोड कर सकता है। उदाहरण के लिए, आप `Documents/clients` फ़ोल्डर में संग्रहीत सभी दस्तावेज़ लोड करना चाहते हैं।

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", folder_path="Documents/clients", auth_with_token=True)
documents = loader.load()
```

#### 📑 दस्तावेज़ आईडी की एक सूची से दस्तावेज़ लोड करना

एक अन्य संभावना है कि आप लोड करने के लिए प्रत्येक दस्तावेज़ के `object_id` की एक सूची प्रदान करें। इसके लिए, आपको [माइक्रोसॉफ्ट ग्राफ API](https://developer.microsoft.com/en-us/graph/graph-explorer) का उपयोग करके सभी दस्तावेज़ ID खोजने की आवश्यकता होगी जिसमें आप रुचि रखते हैं। यह [लिंक](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources) ऐसे एंडपॉइंट्स की एक सूची प्रदान करता है जो दस्तावेज़ ID को पुनर्प्राप्त करने में मददगार होंगे।

उदाहरण के लिए, दस्तावेज़ फ़ोल्डर के रूट में संग्रहीत सभी वस्तुओं के बारे में जानकारी प्राप्त करने के लिए, आपको `https://graph.microsoft.com/v1.0/drives/{YOUR DRIVE ID}/root/children` पर एक अनुरोध करना होगा। एक बार आप उन ID की सूची प्राप्त कर लेते हैं जिनमें आप रुचि रखते हैं, तो आप लोडर को निम्नलिखित पैरामीटरों के साथ इंस्टैंशिएट कर सकते हैं।

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
