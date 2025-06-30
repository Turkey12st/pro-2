
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreate?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showCreate?: boolean;
  size?: 'sm' | 'lg' | 'default';
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onCreate,
  showView = false,
  showEdit = true,
  showDelete = true,
  showCreate = false,
  size = 'sm'
}: ActionButtonsProps) {
  const { permissions } = useUserPermissions();

  return (
    <div className="flex items-center gap-2">
      {showView && onView && (
        <Button
          variant="outline"
          size={size}
          onClick={onView}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      
      {showEdit && onEdit && permissions.canUpdate && (
        <Button
          variant="outline"
          size={size}
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {showDelete && onDelete && permissions.canDelete && (
        <Button
          variant="destructive"
          size={size}
          onClick={onDelete}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {showCreate && onCreate && permissions.canCreate && (
        <Button
          variant="default"
          size={size}
          onClick={onCreate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة جديد
        </Button>
      )}
    </div>
  );
}
