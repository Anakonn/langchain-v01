---
translated: true
---

# Datadog 로그

>[Datadog](https://www.datadoghq.com/)은 클라우드 규모 애플리케이션을 위한 모니터링 및 분석 플랫폼입니다.

이 로더는 `datadog_api_client` Python 패키지를 사용하여 Datadog에서 애플리케이션의 로그를 가져옵니다. 로더를 초기화할 때 `Datadog API 키`와 `APP 키`를 입력해야 하며, 원하는 로그를 추출하기 위한 쿼리를 전달해야 합니다.

```python
from langchain_community.document_loaders import DatadogLogsLoader
```

```python
%pip install --upgrade --quiet  datadog-api-client
```

```python
DD_API_KEY = "..."
DD_APP_KEY = "..."
```

```python
query = "service:agent status:error"

loader = DatadogLogsLoader(
    query=query,
    api_key=DD_API_KEY,
    app_key=DD_APP_KEY,
    from_time=1688732708951,  # Optional, timestamp in milliseconds
    to_time=1688736308951,  # Optional, timestamp in milliseconds
    limit=100,  # Optional, default is 100
)
```

```python
documents = loader.load()
documents
```

```output
[Document(page_content='message: grep: /etc/datadog-agent/system-probe.yaml: No such file or directory', metadata={'id': 'AgAAAYkwpLImvkjRpQAAAAAAAAAYAAAAAEFZa3dwTUFsQUFEWmZfLU5QdElnM3dBWQAAACQAAAAAMDE4OTMwYTQtYzk3OS00MmJjLTlhNDAtOTY4N2EwY2I5ZDdk', 'status': 'error', 'service': 'agent', 'tags': ['accessible-from-goog-gke-node', 'allow-external-ingress-high-ports', 'allow-external-ingress-http', 'allow-external-ingress-https', 'container_id:c7d8ecd27b5b3cfdf3b0df04b8965af6f233f56b7c3c2ffabfab5e3b6ccbd6a5', 'container_name:lab_datadog_1', 'datadog.pipelines:false', 'datadog.submission_auth:private_api_key', 'docker_image:datadog/agent:7.41.1', 'env:dd101-dev', 'hostname:lab-host', 'image_name:datadog/agent', 'image_tag:7.41.1', 'instance-id:7497601202021312403', 'instance-type:custom-1-4096', 'instruqt_aws_accounts:', 'instruqt_azure_subscriptions:', 'instruqt_gcp_projects:', 'internal-hostname:lab-host.d4rjybavkary.svc.cluster.local', 'numeric_project_id:3390740675', 'p-d4rjybavkary', 'project:instruqt-prod', 'service:agent', 'short_image:agent', 'source:agent', 'zone:europe-west1-b'], 'timestamp': datetime.datetime(2023, 7, 7, 13, 57, 27, 206000, tzinfo=tzutc())}),
 Document(page_content='message: grep: /etc/datadog-agent/system-probe.yaml: No such file or directory', metadata={'id': 'AgAAAYkwpLImvkjRpgAAAAAAAAAYAAAAAEFZa3dwTUFsQUFEWmZfLU5QdElnM3dBWgAAACQAAAAAMDE4OTMwYTQtYzk3OS00MmJjLTlhNDAtOTY4N2EwY2I5ZDdk', 'status': 'error', 'service': 'agent', 'tags': ['accessible-from-goog-gke-node', 'allow-external-ingress-high-ports', 'allow-external-ingress-http', 'allow-external-ingress-https', 'container_id:c7d8ecd27b5b3cfdf3b0df04b8965af6f233f56b7c3c2ffabfab5e3b6ccbd6a5', 'container_name:lab_datadog_1', 'datadog.pipelines:false', 'datadog.submission_auth:private_api_key', 'docker_image:datadog/agent:7.41.1', 'env:dd101-dev', 'hostname:lab-host', 'image_name:datadog/agent', 'image_tag:7.41.1', 'instance-id:7497601202021312403', 'instance-type:custom-1-4096', 'instruqt_aws_accounts:', 'instruqt_azure_subscriptions:', 'instruqt_gcp_projects:', 'internal-hostname:lab-host.d4rjybavkary.svc.cluster.local', 'numeric_project_id:3390740675', 'p-d4rjybavkary', 'project:instruqt-prod', 'service:agent', 'short_image:agent', 'source:agent', 'zone:europe-west1-b'], 'timestamp': datetime.datetime(2023, 7, 7, 13, 57, 27, 206000, tzinfo=tzutc())})]
```
