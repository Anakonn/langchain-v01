---
translated: true
---

# Airtable

>[Airtable](https://en.wikipedia.org/wiki/Airtable) एक क्लाउड सहयोग सेवा है।
`Airtable` एक स्प्रेडशीट-डेटाबेस हाइब्रिड है, जिसमें डेटाबेस की सुविधाएं हैं लेकिन स्प्रेडशीट पर लागू की गई हैं।
> एक Airtable टेबल में फ़ील्ड स्प्रेडशीट के कोशिकाओं के समान हैं, लेकिन 'चेकबॉक्स', 'फ़ोन नंबर' और 'ड्रॉप-डाउन सूची' जैसे प्रकार होते हैं, और छवि जैसे फ़ाइल संलग्नकों का संदर्भ ले सकते हैं।

>उपयोगकर्ता एक डेटाबेस बना सकते हैं, कॉलम प्रकार सेट कर सकते हैं, रिकॉर्ड जोड़ सकते हैं, टेबल को एक-दूसरे से जोड़ सकते हैं, सहयोग कर सकते हैं, रिकॉर्ड को क्रमबद्ध कर सकते हैं
> और बाहरी वेबसाइटों पर दृश्य प्रकाशित कर सकते हैं।

## स्थापना और सेटअप

```bash
pip install pyairtable
```

* अपना [API कुंजी](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens) प्राप्त करें।
* अपने आधार का [ID](https://airtable.com/developers/web/api/introduction) प्राप्त करें।
* टेबल URL से [टेबल ID](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl) प्राप्त करें।

## दस्तावेज़ लोडर

```python
<!--IMPORTS:[{"imported": "AirtableLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.airtable.AirtableLoader.html", "title": "Airtable"}]-->
from langchain_community.document_loaders import AirtableLoader
```

एक [उदाहरण](/docs/integrations/document_loaders/airtable) देखें।
