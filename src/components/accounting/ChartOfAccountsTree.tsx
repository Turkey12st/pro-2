
import React, { useState } from "react";
import { ChevronRight, ChevronDown, PlusCircle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartOfAccount } from "@/types/database";
import { cn } from "@/lib/utils";

interface ChartOfAccountsTreeProps {
  accounts: ChartOfAccount[];
  onAddAccount?: (parentId?: string) => void;
  onEditAccount?: (account: ChartOfAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
  onSelectAccount?: (account: ChartOfAccount) => void;
}

export function ChartOfAccountsTree({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onSelectAccount
}: ChartOfAccountsTreeProps) {
  // تنظيم الحسابات في شكل شجرة
  const rootAccounts = accounts.filter(account => account.level === 1);
  
  return (
    <div className="chart-of-accounts-tree space-y-1">
      {rootAccounts.map(account => (
        <AccountNode 
          key={account.id} 
          account={account} 
          allAccounts={accounts} 
          onAddAccount={onAddAccount}
          onEditAccount={onEditAccount}
          onDeleteAccount={onDeleteAccount}
          onSelectAccount={onSelectAccount}
        />
      ))}
      
      {rootAccounts.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          لا توجد حسابات. قم بإضافة حسابات للبدء.
        </div>
      )}
      
      {onAddAccount && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-primary"
            onClick={() => onAddAccount()}
          >
            <PlusCircle className="ml-2 h-4 w-4" /> إضافة حساب رئيسي
          </Button>
        </div>
      )}
    </div>
  );
}

interface AccountNodeProps {
  account: ChartOfAccount;
  allAccounts: ChartOfAccount[];
  onAddAccount?: (parentId?: string) => void;
  onEditAccount?: (account: ChartOfAccount) => void;
  onDeleteAccount?: (accountId: string) => void;
  onSelectAccount?: (account: ChartOfAccount) => void;
}

function AccountNode({ 
  account, 
  allAccounts, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount,
  onSelectAccount
}: AccountNodeProps) {
  const [expanded, setExpanded] = useState(account.level === 1);
  
  // البحث عن الحسابات الفرعية
  const childAccounts = allAccounts.filter(a => a.parent_account_id === account.id);
  const hasChildren = childAccounts.length > 0;
  
  // الألوان حسب نوع الحساب
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleClick = () => {
    if (onSelectAccount) {
      onSelectAccount(account);
    }
  };

  return (
    <div className="account-node">
      <div 
        className={cn(
          "flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer",
          !account.is_active && "opacity-60"
        )}
      >
        <div className="flex items-center flex-1" onClick={handleClick}>
          <div className="w-6 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {hasChildren && (
              <>
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </>
            )}
          </div>
          
          <div className="mr-2 flex-1">
            <div className="flex items-center">
              <span className="font-medium">{account.account_number}</span>
              <span className="mx-2">-</span>
              <span>{account.account_name}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className={getAccountTypeColor(account.account_type)}>
              {account.account_type}
            </Badge>
            <Badge variant="outline">{account.balance_type}</Badge>
          </div>
        </div>
        
        {/* أزرار التحكم */}
        <div className="flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
          {onAddAccount && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onAddAccount(account.id); }}
              title="إضافة حساب فرعي"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          )}
          {onEditAccount && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEditAccount(account); }}
              title="تعديل الحساب"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDeleteAccount && !hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDeleteAccount(account.id); }}
              title="حذف الحساب"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* عرض الحسابات الفرعية */}
      {expanded && hasChildren && (
        <div className="mr-6 mt-1 border-r-2 border-gray-100 pr-2">
          {childAccounts.map(childAccount => (
            <AccountNode 
              key={childAccount.id}
              account={childAccount}
              allAccounts={allAccounts}
              onAddAccount={onAddAccount}
              onEditAccount={onEditAccount}
              onDeleteAccount={onDeleteAccount}
              onSelectAccount={onSelectAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
