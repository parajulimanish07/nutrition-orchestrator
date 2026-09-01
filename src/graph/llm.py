import os
from typing import Optional
from langchain_core.language_models.chat_models import BaseChatModel


def get_llm(
    model_id: Optional[str] = None,
    region_name: Optional[str] = None,
    temperature: float = 0.0,
) -> Optional[BaseChatModel]:
    """
    Initializes and returns an AWS Bedrock LLM client (Claude 3.5 Sonnet / Llama 3).
    Falls back gracefully if AWS credentials are not configured in the current environment.
    """
    model_id = model_id or os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    region_name = region_name or os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    try:
        from langchain_aws import ChatBedrockConverse
        return ChatBedrockConverse(
            model=model_id,
            region_name=region_name,
            temperature=temperature,
        )
    except Exception as e:
        # If AWS credentials or connection are unavailable, return None so orchestrator can use deterministic worker logic
        return None
