---
translated: true
---

# OCI डेटा विज्ञान मॉडल तैनाती एंडपॉइंट

[OCI डेटा विज्ञान](https://docs.oracle.com/en-us/iaas/data-science/using/home.htm) एक पूरी तरह से प्रबंधित और सर्वरलेस प्लेटफ़ॉर्म है जहां डेटा विज्ञान टीमें मशीन लर्निंग मॉडल को ओरेकल क्लाउड इंफ्रास्ट्रक्चर में बना, प्रशिक्षित और प्रबंधित कर सकते हैं।

यह नोटबुक [OCI डेटा विज्ञान मॉडल तैनाती](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-about.htm) पर होस्ट किए गए एक एलएलएम का उपयोग करने के बारे में बताता है।

प्रमाणीकरण के लिए, [oracle-ads](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) का उपयोग किया गया है ताकि एंडपॉइंट को कॉल करने के लिए क्रेडेंशियल्स स्वचालित रूप से लोड किए जा सकें।

```python
!pip3 install oracle-ads
```

## पूर्वापेक्षा

### मॉडल तैनात करें

[ओरेकल गिटहब नमूना भंडार](https://github.com/oracle-samples/oci-data-science-ai-samples/tree/main/model-deployment/containers/llama2) देखें कि अपने एलएलएम को OCI डेटा विज्ञान मॉडल तैनाती पर कैसे तैनात करें।

### नीतियाँ

OCI डेटा विज्ञान मॉडल तैनाती एंडपॉइंट तक पहुंचने के लिए आवश्यक [नीतियों](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-policies-auth.htm#model_dep_policies_auth__predict-endpoint) को सुनिश्चित करें।

## सेटअप

### vLLM

मॉडल तैनात करने के बाद, आपको `OCIModelDeploymentVLLM` कॉल के निम्नलिखित आवश्यक पैरामीटर सेट करने होंगे:

- **`endpoint`**: तैनात किए गए मॉडल का मॉडल HTTP एंडपॉइंट, उदाहरण के लिए `https://<MD_OCID>/predict`।
- **`model`**: मॉडल का स्थान।

### पाठ उत्पादन अनुमान (TGI)

आपको `OCIModelDeploymentTGI` कॉल के निम्नलिखित आवश्यक पैरामीटर सेट करने होंगे:

- **`endpoint`**: तैनात किए गए मॉडल का मॉडल HTTP एंडपॉइंट, उदाहरण के लिए `https://<MD_OCID>/predict`।

### प्रमाणीकरण

आप या तो ads या वातावरण चर के माध्यम से प्रमाणीकरण सेट कर सकते हैं। जब आप OCI डेटा विज्ञान नोटबुक सत्र में काम कर रहे हों, तो आप अन्य OCI संसाधनों तक पहुंचने के लिए संसाधन प्रिंसिपल का उपयोग कर सकते हैं। [यहाँ](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) देखें कि और क्या विकल्प हैं।

## उदाहरण

```python
import ads
from langchain_community.llms import OCIModelDeploymentVLLM

# Set authentication through ads
# Use resource principal are operating within a
# OCI service that has resource principal based
# authentication configured
ads.set_auth("resource_principal")

# Create an instance of OCI Model Deployment Endpoint
# Replace the endpoint uri and model name with your own
llm = OCIModelDeploymentVLLM(endpoint="https://<MD_OCID>/predict", model="model_name")

# Run the LLM
llm.invoke("Who is the first president of United States?")
```

```python
import os

from langchain_community.llms import OCIModelDeploymentTGI

# Set authentication through environment variables
# Use API Key setup when you are working from a local
# workstation or on platform which does not support
# resource principals.
os.environ["OCI_IAM_TYPE"] = "api_key"
os.environ["OCI_CONFIG_PROFILE"] = "default"
os.environ["OCI_CONFIG_LOCATION"] = "~/.oci"

# Set endpoint through environment variables
# Replace the endpoint uri with your own
os.environ["OCI_LLM_ENDPOINT"] = "https://<MD_OCID>/predict"

# Create an instance of OCI Model Deployment Endpoint
llm = OCIModelDeploymentTGI()

# Run the LLM
llm.invoke("Who is the first president of United States?")
```
