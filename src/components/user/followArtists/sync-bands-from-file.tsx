import {
  FileUpload,
  validateTextFile,
} from "@/components/shared/upload-file-client-side";
import { SyncBandListProps } from "./follow-artists-types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
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
  const [isUnresolvedBandsDialogOpen, setIsUnresolvedBandsDialogOpen] = useState(false);
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
      <h1>How to create a list file?</h1>
      <p>
        For Windows open command console and type the following and replace the
        filepath to your music root folder
      </p>

      <p>{`for /d %i in ("C:\\MyMusicFolder\\*") do @echo %~nxi >> "C:\\MyMusicFolder\\bandlist.txt"`}</p>
      <p>Upload the generated bandlist.txt file</p>

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
          Processing bands: {processingBand} {processedBands}/{totalBands}
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
