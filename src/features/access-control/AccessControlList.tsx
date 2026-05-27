import { useState } from "react";
import { useAccessControl } from "@/hooks/use-access-control";
import type { AccessRule } from "@/types/router";
import { RuleModal } from "./RuleModal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Globe,
  Server,
  Hash,
  Cpu,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<AccessRule["type"], React.ElementType> = {
  url: Globe,
  ip: Server,
  port: Hash,
  mac: Cpu,
};

const TYPE_LABELS: Record<AccessRule["type"], string> = {
  url: "URL",
  ip: "IP",
  port: "Port",
  mac: "MAC",
};

function RuleCard({
  rule,
  onEdit,
  onDelete,
  onToggle,
}: {
  rule: AccessRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const Icon = TYPE_ICONS[rule.type];

  return (
    <div className={cn(
      "flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors",
      !rule.enabled && "opacity-60"
    )}>
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-foreground truncate">{rule.name}</p>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border rounded px-1.5 py-0.5 uppercase tracking-wide">
            {TYPE_LABELS[rule.type]}
          </span>
          {rule.protocol && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border rounded px-1.5 py-0.5 uppercase tracking-wide">
              {rule.protocol}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <code className="font-mono text-primary/80">{rule.value}</code>
          {rule.days.length > 0 && (
            <span className="flex items-center gap-1">
              {rule.days.map((d) => d.charAt(0).toUpperCase()).join(" ")}
            </span>
          )}
          {rule.timeRange && (
            <span>
              {rule.timeRange.start} — {rule.timeRange.end}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <StatusBadge variant={rule.enabled ? "active" : "inactive"} />

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        <Switch
          checked={rule.enabled}
          onCheckedChange={onToggle}
          className="scale-90"
        />
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onEdit}
          aria-label="Edit rule"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          aria-label="Delete rule"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function AccessControlList() {
  const { rules, isLoading, error, create, update, remove } = useAccessControl();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(data: Omit<AccessRule, "id">) {
    setSaving(true);
    if (editingRule) {
      await update({ ...data, id: editingRule.id });
    } else {
      await create(data);
    }
    setSaving(false);
    setShowModal(false);
    setEditingRule(null);
  }

  async function handleToggle(rule: AccessRule) {
    await update({ ...rule, enabled: !rule.enabled });
  }

  function openCreate() {
    setEditingRule(null);
    setShowModal(true);
  }

  function openEdit(rule: AccessRule) {
    setEditingRule(rule);
    setShowModal(true);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading rules…</p>
      </div>
    );
  }

  if (error && rules.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">0 rules configured</p>
          <Button size="sm" onClick={openCreate} className="gap-2 h-9">
            <Plus className="w-3.5 h-3.5" />
            New Rule
          </Button>
        </div>
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted/40 border border-border flex items-center justify-center">
            <ShieldOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Could not load rules from router — create one locally.
          </p>
          <Button size="sm" variant="outline" onClick={openCreate} className="border-border gap-2 mt-1">
            <Plus className="w-3.5 h-3.5" />
            Create your first rule
          </Button>
        </div>
        {showModal && (
          <RuleModal
            rule={editingRule}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingRule(null); }}
            isSaving={saving}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {rules.length} rule{rules.length !== 1 ? "s" : ""} configured
        </p>
        <Button size="sm" onClick={openCreate} className="gap-2 h-9">
          <Plus className="w-3.5 h-3.5" />
          New Rule
        </Button>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted/40 border border-border flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No rules configured</p>
            <Button size="sm" variant="outline" onClick={openCreate} className="border-border gap-2 mt-1">
              <Plus className="w-3.5 h-3.5" />
              Create your first rule
            </Button>
          </div>
        ) : (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => openEdit(rule)}
              onDelete={() => remove(rule.id)}
              onToggle={() => handleToggle(rule)}
            />
          ))
        )}
      </div>

      {showModal && (
        <RuleModal
          rule={editingRule}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingRule(null);
          }}
          isSaving={saving}
        />
      )}
    </>
  );
}
