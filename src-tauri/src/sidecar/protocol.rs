use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize)]
pub struct RpcRequest {
    pub jsonrpc: &'static str,
    pub id: String,
    pub method: String,
    pub params: Value,
}

impl RpcRequest {
    pub fn new(method: impl Into<String>, params: Value) -> (Self, String) {
        let id = uuid::Uuid::new_v4().to_string();
        (
            Self {
                jsonrpc: "2.0",
                id: id.clone(),
                method: method.into(),
                params,
            },
            id,
        )
    }
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct RpcError {
    pub code: i64,
    pub message: String,
    #[serde(default)]
    pub data: Option<Value>,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct RpcResponse {
    pub id: String,
    #[serde(default)]
    pub result: Option<Value>,
    #[serde(default)]
    pub error: Option<RpcError>,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct RpcNotification {
    pub method: String,
    #[serde(default)]
    pub params: Value,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SidecarMessage {
    Response(RpcResponse),
    Notification(RpcNotification),
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    struct ProtocolParseTestCase<'a> {
        name: &'a str,
        raw_json: &'a str,
        expected_message: SidecarMessage,
    }

    #[test]
    fn test_sidecar_message_parsing_table() {
        let cases = [
            ProtocolParseTestCase {
                name: "success_response",
                raw_json: r#"{"id":"req-1","result":{"pong":true}}"#,
                expected_message: SidecarMessage::Response(RpcResponse {
                    id: "req-1".to_string(),
                    result: Some(json!({"pong": true})),
                    error: None,
                }),
            },
            ProtocolParseTestCase {
                name: "error_response_with_data",
                raw_json: r#"{"id":"req-2","error":{"code":-32600,"message":"invalid params","data":{"field":"key"}}}"#,
                expected_message: SidecarMessage::Response(RpcResponse {
                    id: "req-2".to_string(),
                    result: None,
                    error: Some(RpcError {
                        code: -32600,
                        message: "invalid params".to_string(),
                        data: Some(json!({"field": "key"})),
                    }),
                }),
            },
            ProtocolParseTestCase {
                name: "transcript_delta_notification",
                raw_json: r#"{"method":"transcript.delta","params":{"text":"hello world"}}"#,
                expected_message: SidecarMessage::Notification(RpcNotification {
                    method: "transcript.delta".to_string(),
                    params: json!({"text": "hello world"}),
                }),
            },
            ProtocolParseTestCase {
                name: "ai_suggestion_notification",
                raw_json: r#"{"method":"assist.suggestion","params":{"title":"System Architecture","code":"impl Actor"}}"#,
                expected_message: SidecarMessage::Notification(RpcNotification {
                    method: "assist.suggestion".to_string(),
                    params: json!({"title": "System Architecture", "code": "impl Actor"}),
                }),
            },
        ];

        for case in cases {
            let actual: SidecarMessage = serde_json::from_str(case.raw_json)
                .unwrap_or_else(|e| panic!("failed parsing case '{}': {}", case.name, e));
            assert_eq!(
                actual, case.expected_message,
                "case '{}' failed",
                case.name
            );
        }
    }

    #[test]
    fn test_rpc_request_format() {
        let (req, id) = RpcRequest::new("system.ping", json!({"ping": true}));
        assert_eq!(req.jsonrpc, "2.0");
        assert_eq!(req.method, "system.ping");
        assert_eq!(req.id, id);
    }
}
