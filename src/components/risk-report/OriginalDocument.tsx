
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface OriginalDocumentProps {
  consentText: string;
}

const OriginalDocument: React.FC<OriginalDocumentProps> = ({ consentText }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRight className="h-5 w-5 mr-2 text-gray-500" />
          Original Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap font-mono text-sm text-gray-800 max-h-96 overflow-y-auto">
          {consentText || 'No document text available. Please return to the analyzer.'}
        </div>
      </CardContent>
    </Card>
  );
};

export default OriginalDocument;
