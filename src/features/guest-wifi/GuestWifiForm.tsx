import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGuestWifi } from "@/hooks/use-guest-wifi";
import type { GuestWifiConfig } from "@/types/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Wifi, WifiOff } from "lucide-react";

const schema = z.object({
  enabled: z.boolean(),
  ssid_24: z.string().min(1, "Requerido").max(32, "Máx. 32 caracteres"),
  ssid_5: z.string().min(1, "Requerido").max(32, "Máx. 32 caracteres"),
  password: z.string().min(8, "Mín. 8 caracteres").max(64, "Máx. 64 caracteres"),
  encryption: z.enum(["none", "wpa2", "wpa3", "wpa2/wpa3"]),
});

type FormValues = z.infer<typeof schema>;

const ENCRYPTION_OPTIONS = [
  { value: "wpa2", label: "WPA2-PSK" },
  { value: "wpa3", label: "WPA3-SAE" },
  { value: "wpa2/wpa3", label: "WPA2/WPA3 Mixto" },
  { value: "none", label: "Abierta (sin contraseña)" },
];

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm text-foreground/80">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function GuestWifiForm() {
  const { config, isLoading, isSaving, save } = useGuestWifi();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enabled: false,
      ssid_24: "",
      ssid_5: "",
      password: "",
      encryption: "wpa2",
    },
  });

  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  const enabled = watch("enabled");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => save(values as GuestWifiConfig))}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable toggle card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                enabled
                  ? "bg-primary/10 border-primary/20"
                  : "bg-muted/40 border-border"
              }`}>
                {enabled ? (
                  <Wifi className="w-5 h-5 text-primary" />
                ) : (
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Red de Invitados</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {enabled ? "Transmitiendo en 2.4 GHz y 5 GHz" : "Red desactivada"}
                </p>
              </div>
            </div>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* 2.4 GHz */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-sm font-medium text-foreground">Banda de 2.4 GHz</p>
          </div>
          <FormField label="Nombre de Red (SSID)" error={errors.ssid_24?.message}>
            <Input
              placeholder="MyGuest_2G"
              className="bg-input border-border font-mono text-sm"
              {...register("ssid_24")}
            />
          </FormField>
        </div>

        {/* 5 GHz */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.18_65)]" />
            <p className="text-sm font-medium text-foreground">Banda de 5 GHz</p>
          </div>
          <FormField label="Nombre de Red (SSID)" error={errors.ssid_5?.message}>
            <Input
              placeholder="MyGuest_5G"
              className="bg-input border-border font-mono text-sm"
              {...register("ssid_5")}
            />
          </FormField>
        </div>

        {/* Security */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">Seguridad</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Cifrado" error={undefined}>
              <Controller
                name="encryption"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {ENCRYPTION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Contraseña" error={errors.password?.message}>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-input border-border font-mono text-sm"
                {...register("password")}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={isSaving || !isDirty} className="gap-2 min-w-28">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Guardando…" : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
