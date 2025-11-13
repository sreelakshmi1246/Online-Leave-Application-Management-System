import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { toast } from '@/hooks/use-toast';
import { importCSV } from '@/services/user';

const CSVImport = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please select a valid CSV file',
        variant: 'destructive',
      });
    }
  };

  // Parse CSV for preview
  const parseCSV = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      const lines = text.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        toast({
          title: 'Empty CSV',
          description: 'No data found in file.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map((v) => v.trim());
        return {
          id: `import-${index}`,
          name: values[0] || '',
          email: values[1] || '',
          enrollmentNumber: values[2] || '',
          department: values[3] || '',
          year: parseInt(values[4]) || 1,
        };
      });

      setPreviewData(data);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  // Handle Import button click
  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please choose a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await importCSV(file);

      toast({
        title: 'Import successful',
        description: res.data?.message || `Successfully imported ${previewData.length} students.`,
      });

      setFile(null);
      setPreviewData([]);
    } catch (err) {
      toast({
        title: 'Import failed',
        description: err.response?.data?.message || 'An error occurred while importing.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'enrollmentNumber', label: 'Enrollment No.' },
    { key: 'department', label: 'Department' },
    {
      key: 'year',
      label: 'Year',
      render: (s) => `Year ${s.year}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">CSV Import</h2>
        <p className="text-muted-foreground mt-2">
          Bulk import student records from CSV files
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Upload CSV File
        </h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV files only (MAX. 5MB)
                </p>
              </div>
            </label>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">CSV Format</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your CSV file should have the following columns:
            </p>
            <code className="text-xs bg-background p-2 rounded block text-foreground">
              Name, Email, Enrollment Number, Department, Year
            </code>
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      {previewData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Preview ({previewData.length} records)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Review the data before importing
              </p>
            </div>
            <Button
              onClick={handleImport}
              disabled={isProcessing}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Importing...' : 'Import Students'}
            </Button>
          </div>
          <DataTable data={previewData} columns={columns} />
        </Card>
      )}
    </div>
  );
};

export default CSVImport;
