from core.supabase import supabase

class AuditService:
    @staticmethod
    def log_change(entity_type: str, entity_id: str, changed_by: str, change_type: str, old_value: dict = None, new_value: dict = None):
        supabase.table("audit_logs").insert({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "changed_by": changed_by,
            "change_type": change_type,
            "old_value": old_value,
            "new_value": new_value
        }).execute()

audit_service = AuditService()
