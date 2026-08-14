import json
from pathlib import Path

migration_path = Path("/home/ubuntu/pro-2/supabase/migrations/20260814001000_atomic_financial_posting_engine.sql")
payload_path = Path("/home/ubuntu/pro-2/.tmp_atomic_migration_payload.json")

payload = {
    "project_id": "rosmvxigwcoclamawjps",
    "name": "atomic_financial_posting_engine",
    "query": migration_path.read_text(encoding="utf-8"),
}
payload_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
