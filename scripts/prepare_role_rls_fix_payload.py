import json
from pathlib import Path

migration = Path("/home/ubuntu/pro-2/supabase/migrations/20260814003000_fix_role_enum_rls_data_fetch.sql")
payload = {
    "project_id": "rosmvxigwcoclamawjps",
    "name": "fix_role_enum_rls_data_fetch",
    "query": migration.read_text(encoding="utf-8"),
}
Path("/home/ubuntu/pro-2/.tmp_role_rls_fix_payload.json").write_text(
    json.dumps(payload, ensure_ascii=False), encoding="utf-8"
)
