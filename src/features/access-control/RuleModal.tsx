import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AccessRule, Weekday } from "@/types/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DaySelector } from "@/components/ui/day-selector";
import { Loader2 } from "lucide-react";

const weekdayEnum = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  enabled: z.boolean(),
  type: z.enum(["url", "ip", "port", "mac"]),
  value: z.string().min(1, "El valor es obligatorio"),
  protocol: z.enum(["tcp", "udp", "both"]).optional(),
  days: z.array(weekdayEnum),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS = [
  { value: "url", label: "URL / Dominio" },
  { value: "ip", label: "Dirección IP" },
  { value: "port", label: "Puerto" },
  { value: "mac", label: "Dirección MAC" },
];

const PROTOCOL_OPTIONS = [
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
  { value: "both", label: "TCP + UDP" },
];

const VALUE_PLACEHOLDERS: Record<string, string> = {
  url: "example.com",
  ip: "192.168.1.100",
  port: "8080",
  mac: "AA:BB:CC:DD:EE:FF",
};

interface RuleModalProps {
  rule?: AccessRule | null;
  onSave: (data: Omit<AccessRule, "id">) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export function RuleModal({ rule, onSave, onClose, isSaving }: RuleModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      enabled: true,
      type: "url",
      value: "",
      protocol: "both",
      days: ["mon", "tue", "wed", "thu", "fri"],
      timeStart: "07:00",
      timeEnd: "22:00",
    },
  });

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        enabled: rule.enabled,
        type: rule.type,
        value: rule.value,
        protocol: rule.protocol ?? "both",
        days: rule.days as Weekday[],
        timeStart: rule.timeRange?.start ?? "07:00",
        timeEnd: rule.timeRange?.end ?? "22:00",
      });
    }
  }, [rule, reset]);

  const ruleType = watch("type");

  function onSubmit(values: FormValues) {
    onSave({
      name: values.name,
      enabled: values.enabled,
      type: values.type,
      value: values.value,
      protocol: values.type === "port" ? values.protocol : undefined,
      days: values.days as Weekday[],
      timeRange:
        values.timeStart && values.timeEnd
          ? { start: values.timeStart, end: values.timeEnd }
          : undefined,
      targetMacs: rule?.targetMacs ?? [],
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {rule ? "Editar Regla" : "Nueva Regla"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 py-2">
          {/* Name + enabled */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <Label className="text-sm text-foreground/80">Nombre de la Regla</Label>
              <Input
                placeholder="Bloquear redes sociales"
                className="bg-input border-border"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col items-center gap-1.5 pb-0.5">
              <Label className="text-xs text-muted-foreground">Activado</Label>
              <Controller
                name="enabled"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground/80">Tipo de Bloqueo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground/80">Valor</Label>
              <Input
                placeholder={VALUE_PLACEHOLDERS[ruleType] ?? ""}
                className="bg-input border-border font-mono text-sm"
                {...register("value")}
              />
              {errors.value && (
                <p className="text-xs text-destructive">{errors.value.message}</p>
              )}
            </div>
          </div>

          {/* Protocol (only for port type) */}
          {ruleType === "port" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-foreground/80">Protocolo</Label>
              <Controller
                name="protocol"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-input border-border w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {PROTOCOL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Schedule */}
          <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Programación
            </p>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Días Activos</Label>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <DaySelector
                    value={field.value as Weekday[]}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted-foreground">Desde</label>
                <Input
                  type="time"
                  className="bg-input border-border font-mono text-sm"
                  {...register("timeStart")}
                />
              </div>
              <div className="mt-4 text-muted-foreground">—</div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted-foreground">Hasta</label>
                <Input
                  type="time"
                  className="bg-input border-border font-mono text-sm"
                  {...register("timeEnd")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="min-w-24">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {rule ? "Guardar Cambios" : "Crear Regla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
