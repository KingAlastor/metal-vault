import { FileUpload } from "@/components/promote/file-upload";

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto">
        <FileUpload />
      </div>
    </main>
  )
}
