---
translated: true
---

# माइक्रोसॉफ्ट एक्सेल

`UnstructuredExcelLoader` का उपयोग `माइक्रोसॉफ्ट एक्सेल` फ़ाइलों को लोड करने के लिए किया जाता है। लोडर `.xlsx` और `.xls` दोनों फ़ाइलों के साथ काम करता है। पृष्ठ सामग्री एक्सेल फ़ाइल का कच्चा पाठ होगा। यदि आप लोडर को `"elements"` मोड में उपयोग करते हैं, तो दस्तावेज़ मेटाडेटा में `text_as_html` कुंजी के तहत एक्सेल फ़ाइल का HTML प्रतिनिधित्व उपलब्ध होगा।

```python
from langchain_community.document_loaders import UnstructuredExcelLoader
```

```python
loader = UnstructuredExcelLoader("example_data/stanley-cups.xlsx", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='\n  \n    \n      Team\n      Location\n      Stanley Cups\n    \n    \n      Blues\n      STL\n      1\n    \n    \n      Flyers\n      PHI\n      2\n    \n    \n      Maple Leafs\n      TOR\n      13\n    \n  \n', metadata={'source': 'example_data/stanley-cups.xlsx', 'filename': 'stanley-cups.xlsx', 'file_directory': 'example_data', 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'page_number': 1, 'page_name': 'Stanley Cups', 'text_as_html': '<table border="1" class="dataframe">\n  <tbody>\n    <tr>\n      <td>Team</td>\n      <td>Location</td>\n      <td>Stanley Cups</td>\n    </tr>\n    <tr>\n      <td>Blues</td>\n      <td>STL</td>\n      <td>1</td>\n    </tr>\n    <tr>\n      <td>Flyers</td>\n      <td>PHI</td>\n      <td>2</td>\n    </tr>\n    <tr>\n      <td>Maple Leafs</td>\n      <td>TOR</td>\n      <td>13</td>\n    </tr>\n  </tbody>\n</table>', 'category': 'Table'})
```

## एज़्योर एआई डॉक्यूमेंट इंटेलिजेंस का उपयोग करना

>[एज़्योर एआई डॉक्यूमेंट इंटेलिजेंस](https://aka.ms/doc-intelligence) (पहले `एज़्योर फॉर्म रिकॉग्नाइज़र` के रूप में जाना जाता था) एक मशीन-लर्निंग
>आधारित सेवा है जो डिजिटल या स्कैन किए गए PDF, छवियों, ऑफ़िस और HTML फ़ाइलों से पाठ (हस्तलिखित सहित), तालिकाएं, दस्तावेज़ संरचनाएं (जैसे शीर्षक, अनुभाग शीर्षक आदि) और कुंजी-मान-युग्म निकालती है।
>
>डॉक्यूमेंट इंटेलिजेंस `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` और `HTML` का समर्थन करता है।

`डॉक्यूमेंट इंटेलिजेंस` का यह वर्तमान कार्यान्वयन सामग्री को पृष्ठवार शामिल कर सकता है और इसे LangChain दस्तावेज़ों में बदल सकता है। डिफ़ॉल्ट आउटपुट प्रारूप मार्कडाउन है, जिसे `MarkdownHeaderTextSplitter` के साथ आसानी से सेमांटिक दस्तावेज़ चंकिंग के लिए श्रृंखलित किया जा सकता है। आप `mode="single"` या `mode="page"` का भी उपयोग कर सकते हैं ताकि एक पृष्ठ या दस्तावेज़ में विभाजित शुद्ध पाठ वापस मिल सके।

### पूर्वापेक्षा

**पूर्व-दृश्य** क्षेत्रों में से किसी एक में एक एज़्योर एआई डॉक्यूमेंट इंटेलिजेंस संसाधन: **पूर्वी संयुक्त राज्य अमेरिका**, **पश्चिमी संयुक्त राज्य अमेरिका 2**, **पश्चिमी यूरोप** - यदि आपके पास नहीं है तो [इस दस्तावेज़](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) का पालन करके एक बनाएं। आप लोडर को `<endpoint>` और `<key>` पैरामीटर के रूप में पास करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```
