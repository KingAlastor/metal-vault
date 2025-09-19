import { FileUpload, validateTextFile } from "@/components/shared/upload-file-client-side";
import { SyncBandListProps } from "./follow-artists-types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export function SyncBandListFromFile({ setIsOpen }: SyncBandListProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBands, setProcessedBands] = useState<number>(0);
  const [totalBands, setTotalBands] = useState<number>(0);

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
      
      for (const bandName of bandNames) {
        await processBand(bandName.trim());
        setProcessedBands(prev => prev + 1);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error processing band list:', error);
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
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const processBand = async (bandName: string) => {
    // TODO: Implement your band processing logic
    // This could be:
    // 1. Search for the band in your database
    // 2. Add it to user's followed bands
    // 3. Call an API endpoint
    
    console.log('Processing band:', bandName);
    
    // Example: Call your API to search/add the band
    // const response = await fetch('/api/user/follow-band', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ bandName }),
    // });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
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
        accept={{ 'text/*': ['.txt'], 'text/csv': ['.csv'] }}
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
          Processing bands: {processedBands}/{totalBands}
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
    </div>
  );
}