import json
from pathlib import Path

migration = Path("/home/ubuntu/pro-2/supabase/migrations/20260814004000_fix_has_role_enum_rls.sql")
payload = {
    "project_id": "rosmvxigwcoclamawjps",
    "name": "fix_has_role_enum_rls",
    "query": migration.read_text(encoding="utf-8"),
}
Path("/home/ubuntu/pro-2/.tmp_has_role_fix_payload.json").write_text(
    json.dumps(payload, ensure_ascii=False), encoding="utf-8"
)
