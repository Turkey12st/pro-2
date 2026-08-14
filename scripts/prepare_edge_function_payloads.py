import json
from pathlib import Path

project_id = "rosmvxigwcoclamawjps"
base = Path("/home/ubuntu/pro-2/supabase/functions")
output = Path("/home/ubuntu/pro-2/.tmp_edge_payloads")
output.mkdir(exist_ok=True)

for function_name in ("send-email", "saudi-gov-integration", "admin-users", "accounting-automation"):
    source = base / function_name / "index.ts"
    payload = {
        "project_id": project_id,
        "name": function_name,
        "verify_jwt": True,
        "entrypoint_path": "index.ts",
        "files": [{"name": "index.ts", "content": source.read_text(encoding="utf-8")}],
    }
    (output / f"{function_name}.json").write_text(
        json.dumps(payload, ensure_ascii=False), encoding="utf-8"
    )
