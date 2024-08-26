---
translated: true
---

# Glue कैटलॉग

[AWS Glue डेटा कैटलॉग](https://docs.aws.amazon.com/en_en/glue/latest/dg/catalog-and-crawler.html) एक केंद्रीकृत मेटाडेटा भंडार है जो आपको AWS में संग्रहीत अपने डेटा के बारे में मेटाडेटा को प्रबंधित, एक्सेस और साझा करने में मदद करता है। यह आपकी डेटा संपत्तियों के लिए एक मेटाडेटा स्टोर के रूप में कार्य करता है, जिससे विभिन्न AWS सेवाएं और आपके एप्लिकेशन उन डेटा को प्राप्त और कनेक्ट कर सकते हैं जिन्हें उन्हें आवश्यकता है।

जब आप AWS Glue में डेटा स्रोतों, रूपांतरणों और लक्ष्यों को परिभाषित करते हैं, तो इन तत्वों के बारे में मेटाडेटा डेटा कैटलॉग में संग्रहीत किया जाता है। इसमें डेटा स्थानों, स्कीमा परिभाषाओं, रनटाइम मेट्रिक्स और अधिक के बारे में जानकारी शामिल है। यह विभिन्न डेटा स्टोर प्रकारों जैसे Amazon S3, Amazon RDS, Amazon Redshift और JDBC के साथ संगत बाहरी डेटाबेस का समर्थन करता है। यह सीधे तौर पर Amazon Athena, Amazon Redshift Spectrum और Amazon EMR के साथ एकीकृत है, जिससे इन सेवाओं को डेटा को सीधे एक्सेस और क्वेरी करने की अनुमति मिलती है।

Langchain GlueCatalogLoader डेटा कैटलॉग में दिए गए Pandas dtype के समान प्रारूप में दिए गए Glue डेटाबेस के सभी टेबल्स की स्कीमा प्राप्त करेगा।

## सेटअप करना

- [AWS खाता सेट करने के लिए निर्देशों का पालन करें](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html)।
- boto3 लाइब्रेरी इंस्टॉल करें: `pip install boto3`

## उदाहरण

```python
from langchain_community.document_loaders.glue_catalog import GlueCatalogLoader
```

```python
database_name = "my_database"
profile_name = "my_profile"

loader = GlueCatalogLoader(
    database=database_name,
    profile_name=profile_name,
)

schemas = loader.load()
print(schemas)
```

## टेबल फ़िल्टरिंग के साथ उदाहरण

टेबल फ़िल्टरिंग आपको Glue डेटाबेस के एक विशिष्ट उप-सेट के लिए स्कीमा जानकारी को चयनित रूप से पुनः प्राप्त करने की अनुमति देता है। सभी टेबल्स के स्कीमा को लोड करने के बजाय, आप `table_filter` तर्क का उपयोग कर सकते हैं ताकि आप किन टेबल्स में रुचि रखते हैं उन्हें निर्दिष्ट कर सकें।

```python
from langchain_community.document_loaders.glue_catalog import GlueCatalogLoader
```

```python
database_name = "my_database"
profile_name = "my_profile"
table_filter = ["table1", "table2", "table3"]

loader = GlueCatalogLoader(
    database=database_name, profile_name=profile_name, table_filter=table_filter
)

schemas = loader.load()
print(schemas)
```
