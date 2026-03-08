import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  Upload as UploadIcon,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileZone {
  id: string;
  label: string;
  description: string;
  file: File | null;
  status: "idle" | "dragging" | "selected" | "uploading" | "success" | "error";
  result?: { loaded: number; skipped: number } | { error: string };
}

interface Step {
  label: string;
  description: string;
  zones: FileZone[];
}

const createZone = (id: string, label: string, description: string): FileZone => ({
  id,
  label,
  description,
  file: null,
  status: "idle",
});

const initialSteps: Step[] = [
  {
    label: "Taxpayers",
    description: "GSTIN entity data",
    zones: [createZone("taxpayers", "Taxpayer Data", "Upload GSTIN entity master data (.csv)")],
  },
  {
    label: "Invoices",
    description: "B2B invoice data",
    zones: [createZone("invoices", "B2B Invoices", "Upload B2B invoice records (.csv)")],
  },
  {
    label: "GST Returns",
    description: "GSTR-1, GSTR-2B, GSTR-3B",
    zones: [
      createZone("gstr1", "GSTR-1", "Sales returns (.csv)"),
      createZone("gstr2b", "GSTR-2B", "Purchase auto-draft (.csv)"),
      createZone("gstr3b", "GSTR-3B", "Summary returns (.csv)"),
    ],
  },
  {
    label: "Tax Payments",
    description: "Challan/ledger records",
    zones: [createZone("payments", "Tax Payments", "Upload challan/ledger records (.csv)")],
  },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const isStepComplete = (step: Step) => step.zones.every((z) => z.status === "success");
  const allDone = steps.every(isStepComplete);

  const updateZone = useCallback(
    (zoneId: string, updates: Partial<FileZone>) => {
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          zones: step.zones.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)),
        }))
      );
    },
    []
  );

  const handleFileSelect = (zoneId: string, file: File) => {
    updateZone(zoneId, { file, status: "selected" });
  };

  const handleUpload = async (zoneId: string) => {
    const zone = steps.flatMap((s) => s.zones).find((z) => z.id === zoneId);
    if (!zone?.file) return;
    updateZone(zoneId, { status: "uploading" });
    try {
      const uploadFn = (api.upload as Record<string, (f: File) => Promise<{ loaded: number; skipped: number; errors?: string[] }>>)[zoneId];
      if (!uploadFn) throw new Error(`No upload handler for zone: ${zoneId}`);
      const result = await uploadFn(zone.file);
      updateZone(zoneId, {
        status: "success",
        result: { loaded: result.loaded, skipped: result.skipped ?? 0 },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Check your file format or backend connectivity.";
      updateZone(zoneId, { status: "error", result: { error: message } });
    }
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    updateZone(zoneId, { status: "idle" });
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(zoneId, file);
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    updateZone(zoneId, { status: "dragging" });
  };

  const handleDragLeave = (_e: React.DragEvent, zoneId: string) => {
    updateZone(zoneId, { status: "idle" });
  };

  const openFilePicker = (zoneId: string) => {
    setActiveZoneId(zoneId);
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeZoneId) {
      handleFileSelect(activeZoneId, file);
    }
    e.target.value = "";
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-4">
        <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} />

        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Upload Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Import your GST data in the recommended order
          </p>
        </div>

        {/* Info tip */}
        <div className="rounded-2xl bg-foreground/[0.03] border border-foreground/10 p-4 flex items-start gap-3">
          <FileSpreadsheet size={18} className="text-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Recommended Upload Order</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload Taxpayers first, then Invoices, GST Returns, and finally Tax Payments for best results.
            </p>
          </div>
        </div>

        {/* All done CTA */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-foreground p-6 text-center shadow-xl shadow-foreground/20"
            >
              <CheckCircle size={28} className="text-primary-foreground/40 mx-auto mb-3" />
              <h3 className="font-display font-bold text-primary-foreground text-lg mb-1">
                All data uploaded successfully!
              </h3>
              <p className="text-primary-foreground/60 text-sm mb-4">
                Your knowledge graph is ready to explore.
              </p>
              <Button
                variant="secondary"
                className="font-semibold gap-2"
                onClick={() => navigate("/graph")}
              >
                View Graph
                <ArrowRight size={14} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical stepper */}
        <div className="space-y-0">
          {steps.map((step, stepIdx) => {
            const complete = isStepComplete(step);
            return (
              <div key={step.label} className="flex gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0",
                      complete
                        ? "bg-foreground text-primary-foreground border-foreground shadow-sm"
                        : "bg-background text-foreground border-foreground/30"
                    )}
                  >
                    {complete ? <CheckCircle size={16} /> : stepIdx + 1}
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div className={cn("w-0.5 flex-1 my-1 transition-all", complete ? "bg-foreground/30" : "bg-border")} />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-8">
                  <div className="mb-3">
                    <h3 className="font-display font-bold text-foreground text-sm">{step.label}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>

                  <div className={cn("grid gap-3", step.zones.length === 3 ? "md:grid-cols-3" : "grid-cols-1")}>
                    {step.zones.map((zone) => (
                      <DropZone
                        key={zone.id}
                        zone={zone}
                        onDrop={(e) => handleDrop(e, zone.id)}
                        onDragOver={(e) => handleDragOver(e, zone.id)}
                        onDragLeave={(e) => handleDragLeave(e, zone.id)}
                        onBrowse={() => openFilePicker(zone.id)}
                        onUpload={() => handleUpload(zone.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

interface DropZoneProps {
  zone: FileZone;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onBrowse: () => void;
  onUpload: () => void;
}

const DropZone = ({ zone, onDrop, onDragOver, onDragLeave, onBrowse, onUpload }: DropZoneProps) => {
  const isSuccess = zone.status === "success";
  const isError = zone.status === "error";
  const isDragging = zone.status === "dragging";
  const isUploading = zone.status === "uploading";

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "rounded-xl border-2 border-dashed p-4 transition-all duration-200 text-center",
        isDragging && "border-foreground/40 bg-foreground/[0.03] ring-2 ring-foreground/10",
        zone.status === "selected" && "border-foreground/30 bg-foreground/[0.02]",
        isSuccess && "border-success/30 bg-success/[0.04] ring-1 ring-success/15",
        isError && "border-danger/30 bg-danger/[0.04]",
        zone.status === "idle" && "border-border hover:border-foreground/20 hover:bg-foreground/[0.01]"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg mx-auto mb-2 flex items-center justify-center",
        isSuccess ? "bg-success/10" : isError ? "bg-danger/10" : "bg-foreground/[0.04]"
      )}>
        <FileSpreadsheet size={16} className={isSuccess ? "text-success" : isError ? "text-danger" : "text-muted-foreground"} />
      </div>

      <p className="text-xs font-semibold text-foreground mb-0.5">{zone.label}</p>
      <p className="text-[10px] text-muted-foreground mb-3">{zone.description}</p>

      {/* Idle / Dragging */}
      {(zone.status === "idle" || isDragging) && (
        <button
          onClick={onBrowse}
          className="text-[11px] text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          Browse files
        </button>
      )}

      {/* File selected */}
      {zone.status === "selected" && zone.file && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground font-mono truncate">{zone.file.name}</p>
          <Button
            size="sm"
            className="h-7 text-[11px] font-semibold px-4 shadow-sm shadow-foreground/10"
            onClick={onUpload}
          >
            <UploadIcon size={12} className="mr-1" />
            Upload
          </Button>
        </div>
      )}

      {/* Uploading */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          Uploading…
        </div>
      )}

      {/* Success */}
      {isSuccess && zone.result && "loaded" in zone.result && (
        <div className="space-y-1 bg-success/[0.05] rounded-lg p-2 mt-1">
          <div className="flex items-center justify-center gap-1 text-xs text-success">
            <CheckCircle size={13} />
            <span className="font-medium">Success</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {zone.result.loaded} loaded · {zone.result.skipped} skipped
          </p>
        </div>
      )}

      {/* Error */}
      {isError && zone.result && "error" in zone.result && (
        <div className="space-y-1 bg-danger/[0.05] rounded-lg p-2 mt-1">
          <div className="flex items-center justify-center gap-1 text-xs text-danger">
            <AlertCircle size={13} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{zone.result.error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
