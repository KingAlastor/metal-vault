import {
  FileUpload,
  validateTextFile,
} from "@/components/shared/upload-file-client-side";
import { SyncBandListProps } from "./follow-artists-types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AlertTriangle, CheckCircle, Loader2, Terminal, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  checkBandExists,
  saveUserFavoriteAndUpdateFollowerCount,
} from "@/lib/data/follow-artists-data";
import { UnresolvedBands } from "./unresolved-bands";

export function SyncBandListFromFile({ setIsOpen }: SyncBandListProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBands, setProcessedBands] = useState<number>(0);
  const [processingBand, setProcessingBand] = useState<string>("");
  const [totalBands, setTotalBands] = useState<number>(0);
  const [unresolvedBands, setUnresolvedBands] = useState<string[]>([]);
  const [isUnresolvedBandsDialogOpen, setIsUnresolvedBandsDialogOpen] =
    useState(false);
  const queryClient = useQueryClient();

  const handleFileSelect = (file: File | File[]) => {
    if (Array.isArray(file)) {
      setUploadedFile(file[0] || null);
    } else {
      setUploadedFile(file);
    }
  };

  const handleSyncBands = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessedBands(0);
    setTotalBands(0);

    try {
      const fileContent = await readFileContent(uploadedFile);
      const bandNames = parseBandList(fileContent);

      setTotalBands(bandNames.length);
      let unresolvedBands: string[] = [];

      for (const bandName of bandNames) {
        const result = await processBand(bandName.trim());
        if (!result) {
          unresolvedBands = [...unresolvedBands, bandName];
        }
        setProcessedBands((prev) => prev + 1);
      }
      if (unresolvedBands.length > 0) {
        setUnresolvedBands(unresolvedBands);
        setIsUnresolvedBandsDialogOpen(true);
      }
      queryClient.invalidateQueries({ queryKey: ["favbands"] });
    } catch (error) {
      console.error("Error processing band list:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const parseBandList = (content: string): string[] => {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const processBand = async (bandName: string) => {
    setProcessingBand(bandName);
    const bands = await checkBandExists(bandName);
    if (bands.length === 1) {
      await saveUserFavoriteAndUpdateFollowerCount(bands[0].id);
      return true;
    } else {
      return false;
    }
  };

  const handleDialogClose = () => {
    setIsUnresolvedBandsDialogOpen(false);
  };

  return (
    <div>
      <p className="text-sm">
        Generate a text file containing your band folder names. Choose the
        method that works best for your system:
      </p>
      {/* PowerShell - Primary Recommendation */}
      <div className="my-4">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-muted-foreground">
            PowerShell (Recommended)
          </span>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-800 font-mono text-sm overflow-x-auto">
          <code className="text-green-700 dark:text-green-300">
            Get-ChildItem -Path &quot;C:\MyMusicFolder&quot; -Directory | Select-Object
            -ExpandProperty Name | Out-File -FilePath
            &quot;C:\MyMusicFolder\bandlist.txt&quot; -Encoding UTF8
          </code>
        </div>
      </div>
      {/* CMD - Alternative with Warning */}
      <div className="my-4">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Windows Command Prompt
          </span>
        </div>
        <div className="bg-muted p-3 rounded-md border font-mono text-sm overflow-x-auto">
          <code>
            chcp 65001 &gt;nul && for /d %i in (&quot;C:\MyMusicFolder\*&quot;) do echo
            %~nxi &gt;&gt; &quot;C:\MyMusicFolder\bandlist.txt&quot;
          </code>
        </div>
        <div className="flex items-start gap-2 mt-2">
          <p className="text-xs text-muted-foreground">
            <strong>⚠️ Known Issue:</strong> May corrupt special characters like
            in &quot;Mötley Crüe&quot;. Use PowerShell above for reliable results.
          </p>
        </div>
      </div>

      {/* Instruction */}
      <div className="my-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Replace the Path
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Change{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                &quot;C:\MyMusicFolder&quot;
              </code>{" "}
              to your actual music folder path. For example:{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                &quot;E:\Music&quot;
              </code>{" "}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm mb-1">Upload the generated bandlist.txt file</p>
      <FileUpload
        compact
        onFileSelect={handleFileSelect}
        accept={{ "text/*": [".txt"], "text/csv": [".csv"] }}
        validator={validateTextFile}
        maxSize={10 * 1024 * 1024} // 10MB
        noUpload={true} // Don't upload to server
      />
      {uploadedFile && (
        <div className="text-sm text-green-600 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          File selected: {uploadedFile.name}
        </div>
      )}
      {isProcessing && (
        <div className="text-sm text-blue-600 flex items-center gap-2 mt-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing: {processedBands}/{totalBands} {processingBand}
        </div>
      )}
      <Button
        onClick={handleSyncBands}
        disabled={!uploadedFile || isProcessing}
        className="mt-4"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <p>Sync bands</p>
        )}
      </Button>
      <UnresolvedBands
        unresolvedBands={unresolvedBands}
        isOpen={isUnresolvedBandsDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}
