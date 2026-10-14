export interface Charge {
  count: number;
  statute: string;
  description: string;
  severity: string;
  disposition?: string;
  plea?: string;
}

export interface DocketEntry {
  date: string;
  description: string;
  entryType: string;
}

export interface CourtCase {
  id: string;
  caseNumber: string;
  county: string;
  court: string;
  division: string;
  caseStyle: string;
  filingDate: string;
  caseStatus: 'Active' | 'Disposed' | 'Pending' | 'Closed' | 'Recall Warrant';
  caseType: 'Criminal' | 'Traffic' | 'Civil' | 'Probate';
  judge: string;
  courtroom: string;
  nextHearingDate?: string;
  nextHearingType?: string;
  charges: Charge[];
  docketEntries: DocketEntry[];
  citationNumber?: string;
  arrestingAgency?: string;
  bondAmount?: string;
  bondStatus?: string;
}

export interface CourtNetGatewayInfo {
  targetUrl: string;
  portalUrl: string;
  gatewayStatus: string;
  httpStatusCode: number;
  requiresAuthentication: boolean;
  redirectedUrl?: string;
  responseTimeMs: number;
  queriedAt: string;
}

export interface SearchResponse {
  success: boolean;
  query: {
    lastName: string;
    firstName: string;
    dob: string;
  };
  courtNetGateway: CourtNetGatewayInfo;
  resultsCount: number;
  records: CourtCase[];
  error?: string;
}
