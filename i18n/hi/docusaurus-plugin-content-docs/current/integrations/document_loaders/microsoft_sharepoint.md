---
translated: true
---

# माइक्रोसॉफ्ट SharePoint

> [Microsoft SharePoint](https://en.wikipedia.org/wiki/SharePoint) एक वेबसाइट-आधारित सहयोग प्रणाली है जो कार्यप्रवाह अनुप्रयोगों, "सूची" डेटाबेस, और अन्य वेब पार्ट्स और सुरक्षा सुविधाओं का उपयोग करके व्यापार टीमों को एक साथ काम करने के लिए सक्षम बनाती है, जिसे Microsoft द्वारा विकसित किया गया है।

यह नोटबुक [SharePoint Document Library](https://support.microsoft.com/en-us/office/what-is-a-document-library-3b5976dd-65cf-4c9e-bf5a-713c10ca2872) से दस्तावेज़ लोड करने के तरीके को कवर करती है। वर्तमान में, केवल docx, doc, और pdf फाइलें समर्थित हैं।

## पूर्वापेक्षाएँ

1. [Microsoft identity platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) निर्देशों के साथ एक एप्लिकेशन पंजीकृत करें।
2. पंजीकरण समाप्त होने पर, Azure पोर्टल ऐप पंजीकरण का अवलोकन फलक प्रदर्शित करता है। आपको एप्लिकेशन (क्लाइंट) आईडी दिखाई देगी। इसे `client ID` भी कहा जाता है, यह मान माइक्रोसॉफ्ट पहचान मंच में आपके एप्लिकेशन को अद्वितीय रूप से पहचानता है।
3. **आइटम 1** पर पालन करने वाले चरणों के दौरान, आप पुनर्निर्देशन URI को `https://login.microsoftonline.com/common/oauth2/nativeclient` के रूप में सेट कर सकते हैं।
4. **आइटम 1** पर पालन करने वाले चरणों के दौरान, एप्लिकेशन सीक्रेट्स अनुभाग के तहत एक नया पासवर्ड (`client_secret`) उत्पन्न करें।
5. अपने एप्लिकेशन को निम्नलिखित `SCOPES` (`offline_access` और `Sites.Read.All`) जोड़ने के लिए इस [दस्तावेज़](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) के निर्देशों का पालन करें।
6. अपनी **Document Library** से फ़ाइलें प्राप्त करने के लिए, आपको इसकी आईडी की आवश्यकता होगी। इसे प्राप्त करने के लिए, आपको `Tenant Name`, `Collection ID`, और `Subsite ID` के मानों की आवश्यकता होगी।
7. अपने `Tenant Name` को खोजने के लिए इस [दस्तावेज़](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tenant-management-read-tenant-name) के निर्देशों का पालन करें। एक बार जब आपको यह मिल जाए, तो मान से `.onmicrosoft.com` को हटा दें और शेष को अपने `Tenant Name` के रूप में रखें।
8. अपने `Collection ID` और `Subsite ID` प्राप्त करने के लिए, आपको अपने **SharePoint** `site-name` की आवश्यकता होगी। आपके `SharePoint` साइट URL का निम्नलिखित प्रारूप है `https://<tenant-name>.sharepoint.com/sites/<site-name>`। इस URL का अंतिम भाग `site-name` है।
9. Site `Collection ID` प्राप्त करने के लिए, इस URL को ब्राउज़र में हिट करें: `https://<tenant>.sharepoint.com/sites/<site-name>/_api/site/id` और `Edm.Guid` संपत्ति का मान कॉपी करें।
10. `Subsite ID` (या वेब आईडी) प्राप्त करने के लिए उपयोग करें: `https://<tenant>.sharepoint.com/sites/<site-name>/_api/web/id` और `Edm.Guid` संपत्ति का मान कॉपी करें।
11. `SharePoint साइट ID` का निम्नलिखित प्रारूप है: `<tenant-name>.sharepoint.com,<Collection ID>,<subsite ID>`। आप उस मान को अगले चरण में उपयोग के लिए रख सकते हैं।
12. अपने `Document Library ID` प्राप्त करने के लिए [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) पर जाएं। पहला चरण यह सुनिश्चित करना है कि आप अपने **SharePoint** साइट से जुड़े खाते से लॉग इन हैं। फिर आपको `https://graph.microsoft.com/v1.0/sites/<SharePoint site ID>/drive` पर एक अनुरोध करना होगा और प्रतिक्रिया में एक फ़ील्ड `id` के साथ एक पेलोड वापस आएगा जिसमें आपके `Document Library ID` का ID होगा।

## 🧑 SharePoint Document Library से अपने दस्तावेज़ों को प्राप्त करने के निर्देश

### 🔑 प्रमाणीकरण

डिफ़ॉल्ट रूप से, `SharePointLoader` अपेक्षा करता है कि `CLIENT_ID` और `CLIENT_SECRET` के मान पर्यावरण चर के रूप में संग्रहीत हों, जिनका नाम `O365_CLIENT_ID` और `O365_CLIENT_SECRET` क्रमशः हो। आप अपनी एप्लिकेशन की रूट पर एक `.env` फाइल के माध्यम से या अपने स्क्रिप्ट में निम्नलिखित कमांड का उपयोग करके उन पर्यावरण चर को पास कर सकते हैं।

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

यह लोडर [*एक उपयोगकर्ता के पक्ष में*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0) नामक प्रमाणीकरण का उपयोग करता है। यह उपयोगकर्ता की सहमति के साथ 2 चरण प्रमाणीकरण है। जब आप लोडर को प्रारंभ करते हैं, तो यह एक url प्रिंट करेगा जिसे उपयोगकर्ता को आवश्यक अनुमतियों पर ऐप को सहमति देने के लिए विजिट करना होगा। फिर उपयोगकर्ता को इस url को विजिट करना होगा और एप्लिकेशन को सहमति देनी होगी। फिर उपयोगकर्ता को परिणामी पेज url को कॉपी करके कंसोल में पेस्ट करना होगा। यदि लॉगिन प्रयास सफल रहा तो विधि True लौटाएगी।

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID")
```

एक बार प्रमाणीकरण हो जाने पर, लोडर एक टोकन (`o365_token.txt`) को `~/.credentials/` फ़ोल्डर में संग्रहीत करेगा। इस टोकन का उपयोग बाद में बिना कॉपी/पेस्ट चरणों के प्रमाणीकरण के लिए किया जा सकता है जैसा कि पहले समझाया गया था। इस टोकन का उपयोग प्रमाणीकरण के लिए करने के लिए, लोडर के प्रारंभ में `auth_with_token` पैरामीटर को True में बदलें।

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
```

### 🗂️ दस्तावेज़ लोडर

#### 📑 एक Document Library डायरेक्टरी से दस्तावेज़ लोड करना

`SharePointLoader` आपके Document Library के एक विशिष्ट फोल्डर से दस्तावेज़ लोड कर सकता है। उदाहरण के लिए, आप अपने Document Library में `Documents/marketing` फोल्डर में संग्रहीत सभी दस्तावेज़ लोड करना चाहते हैं।

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", folder_path="Documents/marketing", auth_with_token=True)
documents = loader.load()
```

यदि आपको `Resource not found for the segment` त्रुटि प्राप्त हो रही है, तो फ़ोल्डर पथ के बजाय `folder_id` का उपयोग करने का प्रयास करें, जिसे [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer) से प्राप्त किया जा सकता है।

```python
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True
                          folder_id="<folder-id>")
documents = loader.load()
```

यदि आप रूट डायरेक्टरी से दस्तावेज़ लोड करना चाहते हैं, तो आप `folder_id`, `folder_path` और `documents_ids` को छोड़ सकते हैं और लोडर रूट डायरेक्टरी को लोड करेगा।

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
documents = loader.load()
```

`recursive=True` के साथ संयोजन में, आप पूरे SharePoint से सभी दस्तावेजों को आसानी से लोड कर सकते हैं।

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID",
                          recursive=True,
                          auth_with_token=True)
documents = loader.load()
```

#### 📑 Documents IDs की सूची से दस्तावेज़ लोड करना

एक और संभावना है कि आप प्रत्येक दस्तावेज़ के लिए `object_id` की सूची प्रदान करें जिसे आप लोड करना चाहते हैं। इसके लिए, आपको [Microsoft Graph API](https://developer.microsoft.com/en-us/graph/graph-explorer) को क्वेरी करना होगा ताकि आप जिन दस्तावेज़ों में रुचि रखते हैं उनकी सभी दस्तावेज़ ID प्राप्त कर सकें। यह [लिंक](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources) उन एंडपॉइंट्स की एक सूची प्रदान करता है जो दस्तावेज़ ID को पुनः प्राप्त करने में सहायक होंगे।

उदाहरण के लिए, `data/finance/` फोल्डर में संग्रहीत सभी ऑब्जेक्ट्स के बारे में जानकारी प्राप्त करने के लिए, आपको इस अनुरोध को करना होगा: `https://graph.microsoft.com/v1.0/drives/<document-library-id>/root:/data/finance:/children`। एक बार जब आपके पास ID की सूची हो जाए जिसमें आप रुचि रखते हैं, तो आप निम्नलिखित पैरामीटर के साथ लोडर को प्रारंभ कर सकते हैं।

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
